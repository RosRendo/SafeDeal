import {
  SEED_LISTINGS,
  SEED_ORDERS,
  SEED_THREADS,
  SEED_ADMIN_OVERVIEW,
  SEED_REVIEWS,
  SeedOrder,
  SeedThread,
  SeedMessage,
  SeedAdminOverview,
} from "./seedData";
import { CatalogListingItem } from "@/lib/catalogData";
import { CustomerReview } from "@/types/marketplace";
import { hashPassword, verifyPassword } from "./password";
import {
  initPersistence,
  ensureHydrated,
  markBundle,
  markOrder,
  markUser,
  markFreshStore,
  wipePersistedData,
  flushNow,
  type PersistedStore,
} from "./persist";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  avatar: string;
  // scrypt password hash (see src/lib/server/password.ts). Never plaintext.
  password?: string | null;
  rating?: number;
  dealCount?: number;
  status?: "Active" | "Suspended" | "Restricted";
  tier?: string;
  createdAt: string;
}

// Demo accounts (password: demo1234). Production deployments should disable
// or rotate these — see deploy.md.
const DEMO_PASSWORD_HASH = hashPassword("demo1234");

const SEED_USERS: UserRecord[] = [
  {
    id: "user-1",
    name: "Alex Mercer",
    email: "alex.mercer@gmail.com",
    role: "buyer",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    password: DEMO_PASSWORD_HASH,
    rating: 4.95,
    dealCount: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seller-1",
    name: "AeroGamingDeals",
    email: "aero@safedeal.com",
    role: "seller",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    password: DEMO_PASSWORD_HASH,
    rating: 4.98,
    dealCount: 1840,
    createdAt: new Date().toISOString(),
  },
  {
    id: "admin-1",
    name: "Sarah Lin",
    email: "admin@safedeal.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    password: DEMO_PASSWORD_HASH,
    rating: 5.0,
    dealCount: 9999,
    createdAt: new Date().toISOString(),
  },
];

export interface PayoutRecord {
  id: string;
  sellerName: string;
  amount: number;
  method: string;
  destination: string;
  date: string;
  status: "Completed" | "Processing";
}

// Global symbol caching in Node.js to preserve state across dev reloads
interface GlobalDbStore {
  listings: CatalogListingItem[];
  orders: SeedOrder[];
  threads: SeedThread[];
  adminOverview: SeedAdminOverview;
  users: UserRecord[];
  payouts: PayoutRecord[];
  reviews: CustomerReview[];
}

declare global {
  var __safedeal_db_store: GlobalDbStore | undefined;
}

function getInitialStore(): GlobalDbStore {
  return {
    listings: JSON.parse(JSON.stringify(SEED_LISTINGS)),
    orders: JSON.parse(JSON.stringify(SEED_ORDERS)),
    threads: JSON.parse(JSON.stringify(SEED_THREADS)),
    adminOverview: JSON.parse(JSON.stringify(SEED_ADMIN_OVERVIEW)),
    users: JSON.parse(JSON.stringify(SEED_USERS)),
    payouts: [],
    reviews: JSON.parse(JSON.stringify(SEED_REVIEWS)),
  };
}

// Force in-memory store reset to guarantee unseeded empty state
global.__safedeal_db_store = getInitialStore();

// Re-seed must MUTATE the existing store object instead of swapping the
// global reference: module-level `store` captures and write-behind flush
// readers must never observe a swapped identity mid-process.
export function reseedInPlace(): GlobalDbStore {
  const current = global.__safedeal_db_store as GlobalDbStore | undefined;
  if (!current) {
    global.__safedeal_db_store = getInitialStore();
    return global.__safedeal_db_store;
  }
  const target = current as unknown as Record<string, unknown>;
  const fresh = getInitialStore() as unknown as Record<string, unknown>;
  for (const key of Object.keys(target)) {
    target[key] = fresh[key];
  }
  return current;
}

export function resetDbStore(): GlobalDbStore {
  return reseedInPlace();
}

// Backfill buyer metadata if threads were cached without it
if (global.__safedeal_db_store.threads) {
  global.__safedeal_db_store.threads.forEach((t) => {
    if (!t.buyerName) {
      const match = SEED_THREADS.find((s) => s.id === t.id);
      if (match) {
        t.buyerName = match.buyerName;
        t.buyerTag = match.buyerTag;
        t.buyerAvatar = match.buyerAvatar;
        t.buyerEmail = match.buyerEmail;
        t.buyerRating = match.buyerRating;
        t.buyerDealCount = match.buyerDealCount;
        t.buyerVerified = match.buyerVerified;
        t.buyerLevel = match.buyerLevel;
      } else {
        t.buyerName = "Alex Mercer";
        t.buyerTag = "BUYER";
        t.buyerAvatar =
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";
        t.buyerEmail = "alex.mercer@gmail.com";
        t.buyerRating = 4.98;
        t.buyerDealCount = "14 deals";
        t.buyerVerified = true;
        t.buyerLevel = "Verified Buyer • Tier 1";
      }
    }
  });
}

// Backfill order seller assignment if cached in older dev server reload
if (global.__safedeal_db_store.orders) {
  global.__safedeal_db_store.orders.forEach((o) => {
    if (o.id === "ord-2" || o.id === "ord-3") {
      o.sellerName = "AeroGamingDeals";
    }
  });
}

const store = global.__safedeal_db_store as GlobalDbStore;

initPersistence(
  () => global.__safedeal_db_store as unknown as PersistedStore,
  SEED_USERS
);

export { ensureHydrated };

export const db = {
  listings: {
    findMany: (filters?: {
      category?: string;
      query?: string;
      sort?: string;
      instant?: boolean;
      limit?: number;
      sellerName?: string;
      status?: string;
    }) => {
      let items = [...store.listings];

      if (filters?.sellerName) {
        const sName = filters.sellerName.toLowerCase();
        items = items.filter(
          (item) =>
            item.seller?.name?.toLowerCase() === sName ||
            (item as unknown as { sellerName?: string }).sellerName?.toLowerCase() === sName
        );
      }

      if (filters?.status && filters.status !== "All") {
        items = items.filter((item) => (item.status || "Active") === filters.status);
      }

      if (filters?.category && filters.category !== "all") {
        items = items.filter((item) => item.category === filters.category);
      }

      if (filters?.query) {
        const q = filters.query.toLowerCase();
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.platform.toLowerCase().includes(q) ||
            item.seller?.name?.toLowerCase().includes(q) ||
            item.sku?.toLowerCase().includes(q) ||
            item.game?.toLowerCase().includes(q) ||
            item.region?.toLowerCase().includes(q) ||
            item.brand?.toLowerCase().includes(q) ||
            item.softwareType?.toLowerCase().includes(q) ||
            item.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }

      if (filters?.instant) {
        items = items.filter((item) => item.deliveryType === "instant");
      }

      if (filters?.sort) {
        switch (filters.sort) {
          case "price-asc":
            items.sort((a, b) => a.price - b.price);
            break;
          case "price-desc":
            items.sort((a, b) => b.price - a.price);
            break;
          case "views":
            items.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
          case "watchers":
            items.sort((a, b) => (b.watchers || 0) - (a.watchers || 0));
            break;
          case "rating":
            items.sort((a, b) => b.rating - a.rating);
            break;
          default:
            // "pop" default sorting
            break;
        }
      }

      if (filters?.limit && filters.limit > 0) {
        items = items.slice(0, filters.limit);
      }

      return items;
    },

    findById: (id: string) => {
      const match = store.listings.find((item) => item.id.toLowerCase() === id.toLowerCase());
      return match || null;
    },

    create: (data: Partial<CatalogListingItem> & { title: string; price: number }) => {
      const id = data.id || `SF-${Date.now().toString().slice(-5)}`;
      const newListing: CatalogListingItem = {
        id,
        sku: data.sku || `SKU-${id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`,
        title: data.title,
        category: (data.category as any) || "accounts",
        price: data.price,
        originalPrice: data.originalPrice || Math.round(data.price * 1.25),
        discountPercent: data.discountPercent || 20,
        image:
          data.image ||
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
        imageAlt: data.imageAlt || data.title,
        platform: data.platform || "PC / Global",
        region: data.region || "Global",
        deliveryType: data.deliveryType || "instant",
        deliveryTimeText: data.deliveryTimeText || "Instant Automated Vault Delivery",
        status: data.status || "Active",
        views: data.views ?? 1,
        watchers: data.watchers ?? 0,
        keysInVault: data.keysInVault ?? (data.deliveryType === "instant" ? 5 : undefined),
        stockCount: data.stockCount ?? 1,
        priceSub: data.priceSub || (data.deliveryType === "instant" ? "Instant automated delivery" : "Escrow vault handover"),
        seller: data.seller || {
          id: "s-current-seller",
          name: "AeroGamingDeals",
          avatarInitial: "A",
          avatarUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
          rating: 4.98,
          dealCount: 1420,
          isVerified: true,
          tier: "PRO",
          deliverySpeed: "< 3 mins",
        },
        rating: 5.0,
        reviewsCount: 1,
        tags: data.tags || ["Verified Escrow"],
        followers: data.followers,
        monetization: data.monetization,
      };

      store.listings.unshift(newListing);
      markBundle("listings");

      return newListing;
    },

    update: (id: string, updates: Partial<CatalogListingItem>) => {
      const item = store.listings.find((l) => l.id.toLowerCase() === id.toLowerCase());
      if (!item) return null;
      Object.assign(item, updates);
      markBundle("listings");

      return item;
    },

    delete: (id: string) => {
      const idx = store.listings.findIndex((l) => l.id.toLowerCase() === id.toLowerCase());
      if (idx === -1) return false;
      store.listings.splice(idx, 1);
      markBundle("listings");

      return true;
    },
  },

  orders: {
    findMany: (filters?: { role?: string; status?: string }) => {
      let orders = [...store.orders];

      if (filters?.status && filters.status !== "all") {
        orders = orders.filter((o) => o.status === filters.status);
      }

      return orders;
    },

    findById: (id: string) => {
      const cleanId = id.replace("#", "").toLowerCase();
      const match = store.orders.find(
        (o) =>
          o.id.toLowerCase() === cleanId ||
          o.orderNumber.replace("#", "").toLowerCase() === cleanId
      );
      return match || null;
    },

    create: (data: Partial<SeedOrder> & { itemTitle: string; price: number }) => {
      const orderNum = `#SF-2024-${Math.floor(10000 + Math.random() * 90000)}`;
      const newOrder: SeedOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: orderNum,
        itemTitle: data.itemTitle,
        image:
          data.image ||
          "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?q=80&w=600&auto=format&fit=crop",
        tag: data.tag || "Escrow Hold",
        category: data.category || "accounts",
        date: "Today",
        timestamp: "Just now",
        deliveryType: "Automated Bot Delivery",
        price: data.price,
        sellerName: data.sellerName || "AeroGamingDeals",
        sellerRating: 4.98,
        sellerSales: "3,820 sales",
        status: "active",
        statusText: "In 48h Inspection Window",
        credentials: data.credentials || {
          login: "auto_user_" + Math.floor(1000 + Math.random() * 9000),
          email: "escrow.vault.buyer@proton.me",
          pass: "SafedealPass2024!",
          pin: "1234",
        },
        securityChecks: {
          ogeEmail: "Verified OE Transfer",
          twoFactor: "Clean Mobile Unbound",
          hwidStatus: "Clean Passed",
        },
        buyerName: data.buyerName || "Verified Buyer",
        buyerEmail: data.buyerEmail || "",
      };

      store.orders.unshift(newOrder);
      markOrder(newOrder.id);

      // Create linked thread for chat
      const buyerAvatar =
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";
      const newThread: SeedThread = {
        id: `thread-${Date.now()}`,
        sellerName: newOrder.sellerName,
        sellerTag: "SELLER",
        avatar:
          "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
        buyerName: newOrder.buyerName || "Verified Buyer",
        buyerTag: "BUYER",
        buyerAvatar: buyerAvatar,
        buyerEmail: newOrder.buyerEmail || "",
        buyerRating: 4.98,
        buyerDealCount: "0 deals",
        buyerVerified: true,
        buyerLevel: "Verified Buyer • Tier 1",
        isOnline: true,
        isVerified: true,
        time: "Just now",
        orderNumber: newOrder.orderNumber,
        itemTitle: newOrder.itemTitle,
        lastMessage: "Order registered and held in 48-hour escrow protection.",
        type: "active",
        rating: 4.98,
        dealCount: "1.4k deals",
        sellerLevel: "Lvl 3 Merchant",
        slaSpeed: "Typical reply < 3 mins",
        orderPrice: newOrder.price,
        orderImage: newOrder.image,
        orderPlatform: newOrder.tag,
        orderSubtext: "48h Inspection Window Active",
        orderStatus: "inspection",
        credentials: {
          login: newOrder.credentials?.login || "account_user",
          email: newOrder.credentials?.email || "vault@safedeal.com",
          pass: newOrder.credentials?.pass || "Pass123!",
          pin: newOrder.credentials?.pin || "0000",
          token: "VAULT-" + Math.floor(10000 + Math.random() * 90000),
        },
        securityChecks: {
          ogeEmail: "OE Creation Verified",
          twoFactor: "Unbound",
          hwidStatus: "Clean",
        },
        messages: [
          {
            id: `msg-sys-${Date.now()}`,
            sender: "system",
            systemTitle: "Payment Held in Escrow",
            systemSub: `Payment of $${newOrder.price.toFixed(
              2
            )} USD verified and held safely in Safedeal Escrow. 48-hour delivery countdown started.`,
            time: "Just now",
            hasVaultAction: true,
          },
        ],
      };

      store.threads.unshift(newThread);
      markBundle("threads");

      return newOrder;
    },

    updateStatus: (
      id: string,
      status: "active" | "delivered" | "warranty" | "disputed",
      extraNotes?: string,
      customStatusText?: string
    ) => {
      const order = db.orders.findById(id);
      if (!order) return null;

      order.status = status;
      order.statusText =
        customStatusText ||
        (status === "delivered"
          ? "Completed & Funds Released"
          : status === "disputed"
          ? "Escrow Paused (Arbitration Review)"
          : status === "warranty"
          ? "Under 6-Month Warranty"
          : "In 48h Inspection Window");

      if (status === "disputed") {
        order.escrowTimeRemaining = "PAUSED (Dispute Arbitration Review)";
        order.disputePaused = true;
      } else if (status === "delivered") {
        order.escrowTimeRemaining = "00:00:00 (Settled & Released)";
        order.settledAt = new Date().toISOString();
        order.disputePaused = false;
      }

      // Also update linked thread
      const thread = store.threads.find(
        (t) => t.orderNumber.replace("#", "") === order.orderNumber.replace("#", "")
      );
      if (thread) {
        thread.orderStatus =
          status === "delivered" ? "completed" : status === "disputed" ? "disputed" : "inspection";

        const isRefund = customStatusText?.toLowerCase().includes("refund") || extraNotes?.toLowerCase().includes("refund");
        const isSplit = customStatusText?.toLowerCase().includes("split") || extraNotes?.toLowerCase().includes("split");
        const isArbitration = customStatusText?.toLowerCase().includes("arbitration") || extraNotes?.toLowerCase().includes("verdict");

        const sysTitle = isRefund
          ? "Arbitration Verdict: 100% Refunded to Buyer"
          : isSplit
          ? "Arbitration Verdict: 50/50 Split Settlement"
          : isArbitration && status === "delivered"
          ? "Arbitration Verdict: Funds Released to Seller"
          : status === "delivered"
          ? "Escrow Funds Released"
          : status === "disputed"
          ? "Official Escrow Dispute Opened"
          : "Order Status Updated";

        const sysSub =
          extraNotes ||
          (status === "delivered"
            ? `Inspection confirmed. $${order.price.toFixed(2)} transferred to seller payout balance.`
            : "Escrow countdown paused pending arbitration officer investigation.");

        const sysMsg: SeedMessage = {
          id: `msg-update-${Date.now()}`,
          sender: "system",
          systemTitle: sysTitle,
          systemSub: sysSub,
          time: "Just now",
        };
        thread.messages.push(sysMsg);
      }

      markOrder(order.id);
      if (thread) markBundle("threads");

      return order;
    },

    // Seller delivers credentials into the vault
    deliver: (
      id: string,
      credentials: { login: string; email: string; pass: string; pin: string; token?: string },
      securityChecks?: { ogeEmail: string; twoFactor: string; hwidStatus: string }
    ) => {
      const order = db.orders.findById(id);
      if (!order) return null;

      // Persist credentials onto the order
      order.credentials = { ...credentials };
      order.deliveryData = {
        ...credentials,
        deliveredAt: new Date().toISOString(),
        ogeEmail: securityChecks?.ogeEmail,
        twoFactor: securityChecks?.twoFactor,
        hwidStatus: securityChecks?.hwidStatus,
      };
      if (securityChecks) order.securityChecks = { ...securityChecks };

      // Move to "active" (awaiting buyer inspection) if still active
      if (order.status === "active") {
        order.statusText = "Credentials Delivered — Awaiting Buyer Inspection";
        order.escrowTimeRemaining = "47h 59m (Inspection Window Active)";
      }

      // Push system message to linked chat thread
      const thread = store.threads.find(
        (t) => t.orderNumber.replace("#", "") === order.orderNumber.replace("#", "")
      );
      if (thread) {
        thread.credentials = {
          ...credentials,
          token: credentials.token || `VLT-${Date.now()}`,
        };
        if (securityChecks) {
          thread.securityChecks = {
            ogeEmail: securityChecks.ogeEmail,
            twoFactor: securityChecks.twoFactor,
            hwidStatus: securityChecks.hwidStatus,
          };
        }
        thread.orderSubtext = "Credentials Delivered • 48h Inspection Active";
        thread.messages.push({
          id: `msg-vault-${Date.now()}`,
          sender: "system",
          systemTitle: "Digital Vault Handover Ready",
          systemSub: "Seller has submitted encrypted credentials. Buyer inspection window starts now.",
          time: "Just now",
          hasVaultAction: true,
        });
        thread.lastMessage = "Seller has delivered credentials. Please inspect and confirm.";
      }

      markOrder(order.id);
      if (thread) markBundle("threads");

      return order;
    },

    // Get orders filtered for seller view (all orders in system for demo)
    findForSeller: (sellerName?: string) => {
      let orders = [...store.orders];
      if (sellerName) {
        orders = orders.filter(
          (o) => o.sellerName.toLowerCase() === sellerName.toLowerCase()
        );
      }
      return orders;
    },
  },

  messages: {
    getThreads: (role?: string) => {
      return store.threads;
    },

    getThreadById: (threadId: string) => {
      return store.threads.find((t) => t.id === threadId) || null;
    },

    getMessages: (threadId: string) => {
      const thread = store.threads.find((t) => t.id === threadId);
      return thread ? thread.messages : [];
    },

    sendMessage: (threadId: string, message: { sender: "buyer" | "seller" | "admin" | "system"; text: string; senderName?: string }) => {
      const thread = store.threads.find((t) => t.id === threadId) || store.threads[0];
      const newMsg: SeedMessage = {
        id: `msg-${Date.now()}`,
        sender: message.sender,
        text: message.text,
        time: "Just now",
      };

      thread.messages.push(newMsg);
      thread.lastMessage = message.text;
      if (message.sender !== "system") {
        thread.unreadCount = (thread.unreadCount || 0) + 1;
      }
      markBundle("threads");

      return newMsg;
    },
  },

  admin: {
    getOverview: () => {
      return {
        ...store.adminOverview,
        activeListingsCount: store.listings.length,
        totalOrdersCount: store.orders.length,
        activeDisputes: store.orders.filter(
          (o) => o.status === "disputed" && !o.statusText?.toLowerCase().includes("settled")
        ).length,
      };
    },

    getDisputes: () => {
      return store.orders.filter(
        (o) => o.status === "disputed" && !o.statusText?.toLowerCase().includes("settled")
      );
    },

    getAllOrders: (filters?: { status?: string; limit?: number }) => {
      let orders = [...store.orders];
      if (filters?.status && filters.status !== "all") {
        orders = orders.filter((o) => o.status === filters.status);
      }
      if (filters?.limit) orders = orders.slice(0, filters.limit);
      return orders;
    },
  },

  // Live earnings and payout ledger dynamically derived from orders and recorded payouts
  earnings: {
    getSummary: (sellerName?: string) => {
      const orders = sellerName
        ? store.orders.filter((o) => o.sellerName.toLowerCase() === sellerName.toLowerCase())
        : [...store.orders];

      const payouts = sellerName
        ? (store.payouts || []).filter((p) => p.sellerName.toLowerCase() === sellerName.toLowerCase())
        : [...(store.payouts || [])];

      const PLATFORM_FEE = 0.05; // 5%

      // Orders that were refunded after capture never become seller earnings.
      const isRefunded = (o: { status: string; statusText?: string }) =>
        o.status === "disputed"
          ? false
          : (o.statusText || "").toLowerCase().includes("refund");

      const delivered = orders.filter((o) => o.status === "delivered" && !isRefunded(o));
      const disputed = orders.filter((o) => o.status === "disputed");
      const active = orders.filter((o) => o.status === "active");

      const totalGrossDelivered = delivered.reduce((sum, o) => sum + o.price, 0);
      const totalFees = +(totalGrossDelivered * PLATFORM_FEE).toFixed(2);
      const totalPaidOut = +(payouts.reduce((sum, p) => sum + p.amount, 0)).toFixed(2);
      const availableBalance = +(Math.max(0, totalGrossDelivered - totalFees - totalPaidOut)).toFixed(2);

      const pendingEscrow = +(active.reduce((sum, o) => sum + o.price, 0)).toFixed(2);
      const disputeHold = +(disputed.reduce((sum, o) => sum + o.price, 0)).toFixed(2);
      const volume30d = +(orders.reduce((sum, o) => sum + o.price, 0)).toFixed(2);

      const orderLedger = orders.map((o) => {
        const fee = +(o.price * PLATFORM_FEE).toFixed(2);
        const net = +(o.price - fee).toFixed(2);
        const statusMap: Record<string, "In Escrow" | "Cleared & Available" | "Dispute Hold" | "Paid Out" | "Refunded"> = {
          active: "In Escrow",
          delivered: "Cleared & Available",
          warranty: "Cleared & Available",
          disputed: "Dispute Hold",
        };
        const ledgerStatus = isRefunded(o) ? "Refunded" : statusMap[o.status] || "In Escrow";
        return {
          id: `tx-${o.id}`,
          orderId: o.id,
          orderNumber: o.orderNumber,
          reference: o.orderNumber,
          refType:
            o.category === "accounts"
              ? "Vault Account Transfer"
              : o.category === "keys"
              ? "Serial CD-Key Reveal"
              : "Guild Bank Reserve",
          date: o.date || "Today",
          time: o.timestamp || "Recent",
          asset: o.itemTitle,
          itemTitle: o.itemTitle,
          buyer: o.buyerName || "Verified Buyer",
          gross: o.price,
          fee,
          feeLabel: "5.0% Safedeal Cut",
          net,
          status: ledgerStatus,
          escrowTimeLeft: o.status === "active" ? (o.escrowTimeRemaining || "24h inspection left") : undefined,
          category: o.category === "accounts" ? "account" : o.category === "keys" ? "key" : "currency",
          sellerName: o.sellerName,
        };
      });

      const payoutLedger = payouts.map((p) => ({
        id: `po-${p.id}`,
        orderId: p.id,
        orderNumber: p.id,
        reference: `#PAY-${p.id.slice(-6)}`,
        refType: `Payout: ${p.method.toUpperCase()}`,
        date: p.date,
        time: "Confirmed",
        asset: `Funds Withdrawal to ${p.destination}`,
        itemTitle: `Funds Withdrawal to ${p.destination}`,
        buyer: "Safedeal Treasury Settlement",
        gross: p.amount,
        fee: 0,
        feeLabel: "0.0% Payout Fee",
        net: p.amount,
        status: "Paid Out" as const,
        escrowTimeLeft: undefined,
        category: "transfer" as const,
        sellerName: p.sellerName,
      }));

      const combinedLedger = [...payoutLedger, ...orderLedger];

      return {
        availableBalance,
        pendingEscrow,
        disputeHold,
        totalGross: totalGrossDelivered,
        totalFees,
        volume30d,
        lifetimePayouts: totalPaidOut,
        completedCount: delivered.length,
        activeCount: active.length,
        disputeCount: disputed.length,
        ledger: combinedLedger,
      };
    },

    requestPayout: (params: { amount: number; method: string; destination: string; sellerName: string }) => {
      if (!store.payouts) store.payouts = [];
      const current = db.earnings.getSummary(params.sellerName);
      if (params.amount > current.availableBalance) {
        return { success: false, error: "Requested payout amount exceeds available balance" };
      }
      const newPayout: PayoutRecord = {
        id: `po-${Date.now()}`,
        sellerName: params.sellerName,
        amount: params.amount,
        method: params.method,
        destination: params.destination,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "Completed",
      };
      store.payouts.unshift(newPayout);
      markBundle("payouts");
      return { success: true, payout: newPayout };
    },
  },

  users: {
    getAll: () => {
      return store.users.map(({ password, ...u }) => u);
    },
    findByEmail: (email: string) => {
      return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    },
    findById: (id: string) => {
      const u = store.users.find((x) => x.id === id);
      if (!u) return null;
      const { password, ...safeUser } = u;
      return safeUser;
    },
    update: (id: string, updates: Partial<UserRecord>) => {
      const u = store.users.find((x) => x.id === id);
      if (!u) return null;
      Object.assign(u, updates);
      markUser(id);

      const { password, ...safeUser } = u;
      return safeUser;
    },
    create: (userData: { name: string; email: string; password?: string; role?: "buyer" | "seller" }) => {
      const existing = store.users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existing) {
        return null;
      }
      const newUser: UserRecord = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: userData.name,
        email: userData.email,
        role: userData.role || "buyer",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        password: userData.password, // already hashed by the caller
        rating: 5.0,
        dealCount: 0,
        createdAt: new Date().toISOString(),
      };
      store.users.push(newUser);
      markUser(newUser.id);
      const { password, ...safeUser } = newUser;
      return safeUser;
    },
    // Strict authentication: password must verify against the stored scrypt
    // hash. No auto-provisioning — unknown accounts must register.
    authenticate: (email: string, password?: string, role?: "buyer" | "seller" | "admin") => {
      if (!password) return null;
      const user = store.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (!user || !user.password) return null;
      if (!verifyPassword(password, user.password)) return null;
      if (role && user.role !== role) return null;

      const { password: pw, ...safeUser } = user;
      return safeUser;
    },
  },

  reviews: {
    findMany: (filters?: { sellerName?: string; limit?: number }) => {
      if (!store.reviews || store.reviews.length === 0) {
        store.reviews = JSON.parse(JSON.stringify(SEED_REVIEWS));
      }
      let list = [...store.reviews];
      if (filters?.sellerName) {
        const sName = filters.sellerName.toLowerCase();
        list = list.filter((r) => {
          if (!r || !r.sellerName) return false;
          const rName = r.sellerName.toLowerCase();
          return (
            rName === sName ||
            rName.replace(/[^a-z0-9]/g, "") === sName.replace(/[^a-z0-9]/g, "")
          );
        });
      }
      if (filters?.limit) list = list.slice(0, filters.limit);
      return list;
    },

    create: (reviewData: {
      author: string;
      rating: number;
      reviewText: string;
      verifiedPurchase?: string;
      sellerName?: string;
      productCategory?: string;
      avatarUrl?: string;
    }) => {
      const newReview: CustomerReview = {
        id: `rev-${Date.now()}`,
        author: reviewData.author || "Verified Buyer",
        avatarUrl: reviewData.avatarUrl || "",
        rating: Math.min(5, Math.max(1, reviewData.rating || 5)),
        date: "Just now",
        verifiedPurchase: reviewData.verifiedPurchase || "Verified Escrow Purchase",
        sellerName: reviewData.sellerName || "AeroGamingDeals",
        reviewText: reviewData.reviewText,
        helpfulCount: 0,
        productCategory: reviewData.productCategory || "accounts",
      };
      if (!store.reviews) store.reviews = [];
      store.reviews.unshift(newReview);
      markBundle("reviews");
      return newReview;
    },

    getSummary: (sellerName?: string) => {
      if (!store.reviews || store.reviews.length === 0) {
        store.reviews = JSON.parse(JSON.stringify(SEED_REVIEWS));
      }
      let list = [...store.reviews];
      if (sellerName) {
        const sName = sellerName.toLowerCase();
        list = list.filter((r) => {
          if (!r || !r.sellerName) return false;
          const rName = r.sellerName.toLowerCase();
          return (
            rName === sName ||
            rName.replace(/[^a-z0-9]/g, "") === sName.replace(/[^a-z0-9]/g, "")
          );
        });
      }
      const totalReviews = list.length;
      const averageRating =
        totalReviews > 0
          ? +(list.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(2)
          : 5.0;
      return {
        totalReviews,
        averageRating,
        reviews: list,
      };
    },
  },

  reset: () => {
    reseedInPlace();
    void wipePersistedData().then(() => {
      // Re-persist the fresh seed dataset so a restart hydrates identical state.
      markFreshStore();
    });
    return { success: true, message: "Database reset to production seed state" };
  },
};

// Flush pending writes when the process is asked to shut down (best effort).
if (typeof process !== "undefined" && !global.__safedeal_flush_hooked) {
  global.__safedeal_flush_hooked = true;
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      void flushNow().catch(() => {});
    });
  }
}

declare global {
  var __safedeal_flush_hooked: boolean | undefined;
}
