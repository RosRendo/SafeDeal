import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { db, ensureHydrated } from "./db";

// Server-side sessions: HMAC-signed opaque tokens in an HttpOnly cookie,
// backed by a Session row in PostgreSQL (sha256 token hash, expiry). The
// client-side localStorage mirror is display-only — every server decision
// reads the cookie.

export const SESSION_COOKIE = "sd_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  avatar: string;
  rating?: number;
  dealCount?: number;
  isVerified?: boolean;
}

function sessionSecret(): string {
  return process.env.SESSION_SECRET || "safedeal-dev-secret-change-me";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function hashToken(nonce: string): string {
  return crypto.createHash("sha256").update(nonce).digest("hex");
}

export function sessionCookieOptions(maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

// Creates a durable session row and returns the signed token value.
export async function createSessionToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const nonce = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: {
      tokenHash: hashToken(nonce),
      userId,
      expiresAt,
    },
  });
  const payload = `${nonce}.${expiresAt.getTime()}`;
  const token = `${payload}.${sign(payload)}`;
  return { token, expiresAt };
}

export function attachSessionCookie(
  response: NextResponse,
  token: string,
  ttlSeconds = SESSION_TTL_MS / 1000
) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    ...sessionCookieOptions(ttlSeconds),
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({ name: SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
  return response;
}

interface CookieSessionCheck {
  nonce: string;
  valid: boolean;
}

function parseToken(raw: string | undefined): CookieSessionCheck {
  if (!raw) return { nonce: "", valid: false };
  const parts = raw.split(".");
  if (parts.length !== 3) return { nonce: "", valid: false };
  const [nonce, exp, sig] = parts;
  const payload = `${nonce}.${exp}`;
  if (sign(payload) !== sig) return { nonce: "", valid: false };
  const expTime = Number(exp);
  if (!Number.isFinite(expTime) || expTime < Date.now()) return { nonce: "", valid: false };
  return { nonce, valid: true };
}

export async function getAuthContext(
  req: NextRequest
): Promise<SessionUser | null> {
  await ensureHydrated();
  const { nonce, valid } = parseToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!valid || !nonce) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(nonce) },
      include: { user: true },
    });
    if (!session) return null;
    if (session.expiresAt.getTime() < Date.now()) {
      await prisma.session.delete({ where: { tokenHash: session.tokenHash } }).catch(() => {});
      return null;
    }

    const u = session.user;
    if (!u || u.status === "Suspended") return null;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: (u.role as SessionUser["role"]) || "buyer",
      avatar: u.avatar || "",
      rating: u.rating,
      dealCount: u.dealCount,
      isVerified: u.status !== "Restricted",
    };
  } catch {
    // Database hiccup: fail closed rather than granting access.
    return null;
  }
}

export function unauthorized(message = "Sign in to continue.") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbidden(message = "You do not have access to this resource.") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function notFound(message = "Resource not found.") {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export function roleAllowed(
  ctx: SessionUser,
  roles: Array<SessionUser["role"]>
): boolean {
  return roles.includes(ctx.role);
}

// Route-level guard: returns the session user or a ready-to-return 401.
export async function requireUser(req: NextRequest): Promise<SessionUser | NextResponse> {
  const ctx = await getAuthContext(req);
  return ctx ?? unauthorized();
}

export async function requireRole(
  req: NextRequest,
  roles: Array<SessionUser["role"]>,
  message = "You do not have access to this resource."
): Promise<SessionUser | NextResponse> {
  const ctx = await requireUser(req);
  if (ctx instanceof NextResponse) return ctx;
  if (!roleAllowed(ctx, roles)) return forbidden(message);
  return ctx;
}

// Sellers always act as themselves; admins may view a specific seller via
// query parameter. Never trust a client-supplied seller name otherwise.
export function sellerScope(ctx: SessionUser, requested?: string | null): string {
  if (ctx.role === "admin") return requested || ctx.name;
  return ctx.name;
}

// True when the session user may see/act on this order: the buyer of record,
// the seller of record, or an admin.
export function userOwnsOrder(
  ctx: SessionUser,
  order: { buyerEmail?: string | null; sellerName?: string | null }
): boolean {
  if (ctx.role === "admin") return true;
  if (order.buyerEmail && ctx.email.toLowerCase() === order.buyerEmail.toLowerCase()) return true;
  if (order.sellerName && ctx.name.toLowerCase() === order.sellerName.toLowerCase()) return true;
  return false;
}

// Login helper shared by the auth route: strict credential check, returns a
// sanitized session user or null.
export function authenticateCredentials(
  email: string,
  password: string | undefined,
  role?: string
): SessionUser | null {
  const user = db.users.authenticate(email, password, role as SessionUser["role"] | undefined);
  return user ? (user as unknown as SessionUser) : null;
}
