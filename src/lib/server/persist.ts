import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

// Durable persistence layer: the working set stays in memory (all repositories
// stay synchronous), every mutation marks a dirty record, and a coalesced
// flusher writes to PostgreSQL through Prisma within ~400ms. Hydration at boot
// replaces the in-memory seed with whatever is durable in the database.

type AnyRecord = { id?: string } & Record<string, unknown>;

export interface PersistedStore {
  listings: AnyRecord[];
  orders: AnyRecord[];
  threads: AnyRecord[];
  adminOverview: Record<string, unknown>;
  users: AnyRecord[];
  payouts: AnyRecord[];
  reviews: AnyRecord[];
}

type StoreGetter = () => PersistedStore;

const BUNDLE_KEYS = [
  "listings",
  "threads",
  "reviews",
  "payouts",
  "adminOverview",
] as const;

let getStore: StoreGetter | null = null;
// Snapshot of the seed accounts, passed in from db.ts so persist can repair
// corrupted/outdated seed rows in the User table at hydration time without a
// circular import.
let seedUserSnapshot: AnyRecord[] = [];
let hydration: Promise<void> | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;
let flushedOnce = false;

const dirtyBundles = new Set<string>((BUNDLE_KEYS as readonly string[]).slice() as string[]);
const dirtyOrders = new Set<string>();
const dirtyUsers = new Set<string>();

export function initPersistence(getter: StoreGetter, seedUsers?: unknown) {
  getStore = getter;
  if (Array.isArray(seedUsers) && seedUsers.length > 0) {
    seedUserSnapshot = clone(seedUsers) as AnyRecord[];
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isDurable() {
  return Boolean(process.env.DATABASE_URL);
}

export function ensureHydrated(): Promise<void> {
  if (!hydration) {
    hydration = hydrate().catch((error) => {
      console.warn(
        "[Persist] hydration failed, running in-memory this boot:",
        error instanceof Error ? error.message : error
      );
      hydration = Promise.resolve();
      return hydration;
    });
  }
  return hydration;
}

async function hydrate() {
  const store = getStore?.();
  if (!store) return;
  if (!isDurable()) {
    console.warn("[Persist] DATABASE_URL not set — data will not survive restarts");
    return;
  }

  const [bundleRows, orderRows, userRows] = await Promise.all([
    prisma.bundleRecord.findMany(),
    prisma.orderRecord.findMany({ orderBy: { updatedAt: "asc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const hasData = bundleRows.length > 0 || orderRows.length > 0 || userRows.length > 0;
  if (!hasData) {
    // First boot on an empty database: the store already holds the seed data —
    // push it through so restarts keep working.
    console.log("[Persist] empty database — persisting seed dataset");
    markAll();
    await flushNow();
    return;
  }

  const bundles = new Map(bundleRows.map((row) => [row.key, row.data]));

  // Empty arrays for marketplace/catalogue bundles are treated as " unset"
  // so a bad flush can never wipe the seed catalogue.
  const solidArray = (key: string) => {
    const data = bundles.get(key);
    return Array.isArray(data) && data.length > 0 ? (data as unknown[]) : null;
  };

  const replaceBundle = (key: string, target: unknown[]) => {
    const data = solidArray(key);
    if (data) {
      target.length = 0;
      target.push(...clone(data));
    }
  };

  replaceBundle("listings", store.listings);
  replaceBundle("threads", store.threads);
  replaceBundle("reviews", store.reviews);
  // Payouts start legitimately empty — accept an empty stored bundle
  replaceBundle("payouts", store.payouts);

  const overview = bundles.get("adminOverview");
  if (overview && typeof overview === "object" && !Array.isArray(overview)) {
    Object.keys(store.adminOverview).forEach((key) => delete store.adminOverview[key]);
    Object.assign(store.adminOverview, overview);
  }

  // Orders: indexed columns for queries, full-fidelity payload in `data`.
  // An entirely empty table keeps the in-memory seed (mirrors the bundle
  // guard below) so a partial flush can never erase the demo dataset.
  if (orderRows.length > 0) {
    store.orders.length = 0;
    store.orders.push(...(orderRows.map((row) => row.data as AnyRecord) as AnyRecord[]));
  } else {
    store.orders.forEach((o) => {
      if (o.id) dirtyOrders.add(String(o.id));
    });
  }

  // Users: the real User table hydrates the registry; keep seed users if none
  if (userRows.length > 0) {
    store.users.length = 0;
    store.users.push(
      ...userRows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: (row.role as "buyer" | "seller" | "admin") || "buyer",
        avatar: row.avatar || "",
        password: row.password || null,
        rating: row.rating,
        dealCount: row.dealCount,
        status: (row.status as "Active" | "Suspended" | "Restricted") || "Active",
        tier: row.tier || "Tier 1",
        createdAt: new Date(row.createdAt).toISOString(),
      }))
    );

    // Seed-account repair: if a canonical demo account is missing, outdated
    // (email/role drift from an older schema push), or has no usable password
    // hash, restore it from the current seed snapshot so logins work.
    const validHash = (pw: unknown) => typeof pw === "string" && pw.startsWith("scrypt$");
    for (const seed of seedUserSnapshot) {
      const seedId = String(seed.id ?? "");
      if (!seedId) continue;
      const idx = store.users.findIndex((u) => String(u.id) === seedId);
      const row = idx >= 0 ? store.users[idx] : null;
      const needsRepair =
        !row ||
        !validHash(row.password) ||
        String(row.email ?? "").toLowerCase() !== String(seed.email).toLowerCase() ||
        row.role !== seed.role;
      if (!needsRepair) continue;
      const repaired = clone(seed);
      repaired.createdAt = row?.createdAt ?? repaired.createdAt ?? new Date().toISOString();
      if (idx >= 0) store.users[idx] = repaired;
      else store.users.unshift(repaired);
      dirtyUsers.add(seedId);
    }
    if (dirtyUsers.size > 0) scheduleFlush();
  } else {
    store.users.forEach((u) => {
      if (u.id) dirtyUsers.add(String(u.id));
    });
    scheduleFlush();
  }

  // Best-effort cleanup of expired sessions
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
  console.log(
    `[Persist] hydrated ${store.orders.length} orders, ${store.users.length} users, ${store.listings.length} listings from PostgreSQL`
  );
}

function scheduleFlush(delay = 400) {
  if (flushTimer || flushing) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, delay);
}

function markAll() {
  dirtyBundles.clear();
  BUNDLE_KEYS.forEach((key) => dirtyBundles.add(key));
}

// After a wipe+reseed (db.reset), re-persist every current record so a
// restart hydrates exactly the fresh seed state.
export function markFreshStore() {
  const store = getStore?.();
  if (!store) return;
  markAll();
  store.orders.forEach((o) => {
    if (o.id) dirtyOrders.add(String(o.id));
  });
  store.users.forEach((u) => {
    if (u.id) dirtyUsers.add(String(u.id));
  });
  scheduleFlush();
}

export function markBundle(key: (typeof BUNDLE_KEYS)[number]) {
  if (!flushedOnce) markAll();
  dirtyBundles.add(key);
  scheduleFlush();
}

export function markOrder(id: string) {
  if (!flushedOnce) markAll();
  dirtyOrders.add(id);
  scheduleFlush();
}

export function markUser(id: string) {
  if (!flushedOnce) markAll();
  dirtyUsers.add(id);
  scheduleFlush();
}

async function flush() {
  const store = getStore?.();
  if (!store || !isDurable()) return;
  flushing = true;
  try {
    for (const key of [...dirtyBundles]) {
      const value =
        key === "adminOverview"
          ? store.adminOverview
          : (store[key as "listings" | "threads" | "reviews" | "payouts"] as unknown[]);
      const data = clone(value) as unknown as Prisma.InputJsonValue;
      await prisma.bundleRecord.upsert({
        where: { key },
        create: { key, data },
        update: { data },
      });
      dirtyBundles.delete(key);
    }

    for (const id of [...dirtyOrders]) {
      const order = store.orders.find((o) => o.id === id);
      if (!order) {
        await prisma.orderRecord.deleteMany({ where: { id } }).catch(() => {});
        dirtyOrders.delete(id);
        continue;
      }
      const payload = clone(order) as unknown as Prisma.InputJsonValue;
      const row = {
        id,
        status: String(order.status ?? "active"),
        sellerName: String(order.sellerName ?? ""),
        buyerEmail: (order.buyerEmail as string) || null,
        price: Number(order.price ?? 0),
        data: payload,
      } as unknown as Prisma.OrderRecordUpsertArgs["create"];
      await prisma.orderRecord.upsert({ where: { id }, create: row, update: row });
      dirtyOrders.delete(id);
    }

    for (const id of [...dirtyUsers]) {
      const user = store.users.find((u) => u.id === id);
      if (!user) {
        await prisma.user.deleteMany({ where: { id } }).catch(() => {});
        dirtyUsers.delete(id);
        continue;
      }
      const row = {
        id,
        name: String(user.name ?? id),
        email: String(user.email ?? `${id}@safedeal.invalid`),
        role: (["buyer", "seller", "admin"].includes(String(user.role)) ? String(user.role) : "buyer"),
        avatar: (user.avatar as string) || null,
        password: (user.password as string) || null,
        rating: Number(user.rating ?? 5.0),
        dealCount: Number(user.dealCount ?? 0),
        status: String(user.status ?? "Active"),
        tier: (user.tier as string) || "Tier 1",
      };
      await prisma.user.upsert({
        where: { id },
        create: { ...row, createdAt: new Date() },
        update: row,
      });
      dirtyUsers.delete(id);
    }

    flushedOnce = true;
    if (dirtyBundles.size + dirtyOrders.size + dirtyUsers.size > 0) scheduleFlush();
  } catch (error) {
    console.warn(
      "[Persist] flush failed, will retry:",
      error instanceof Error ? error.message : error
    );
    scheduleFlush(3000);
  } finally {
    flushing = false;
  }
}

// Force-flush specific groups (used before creating FK-linked rows, e.g. a
// Session row must not be created before its User row exists).
export async function flushUsers(): Promise<void> {
  flushing = true;
  try {
    const store = getStore?.();
    if (!store || !isDurable()) return;
    for (const id of [...dirtyUsers]) {
      const user = store.users.find((u) => u.id === id);
      if (!user) continue;
      const row = {
        id,
        name: String(user.name ?? id),
        email: String(user.email ?? `${id}@safedeal.invalid`),
        role: (["buyer", "seller", "admin"].includes(String(user.role)) ? String(user.role) : "buyer"),
        avatar: (user.avatar as string) || null,
        password: (user.password as string) || null,
        rating: Number(user.rating ?? 5.0),
        dealCount: Number(user.dealCount ?? 0),
        status: String(user.status ?? "Active"),
        tier: (user.tier as string) || "Tier 1",
      };
      await prisma.user.upsert({
        where: { id },
        create: { ...row, createdAt: new Date() },
        update: row,
      });
      dirtyUsers.delete(id);
    }
    flushedOnce = true;
  } finally {
    flushing = false;
  }
}

// Wipe everything and re-seed from the current in-memory store. Used by the
// guarded /api/seed endpoint.
export async function wipePersistedData(): Promise<void> {
  if (!isDurable()) return;
  await Promise.all([
    prisma.orderRecord.deleteMany(),
    prisma.bundleRecord.deleteMany(),
  ]);
  markAll();
  await flushNow();
}

export async function flushNow(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  await flush();
}
