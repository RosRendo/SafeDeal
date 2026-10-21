import { CatalogListingItem, ALL_CATALOG_LISTINGS } from "@/lib/catalogData";
import { ProductItem } from "@/types/marketplace";
import { getProductById } from "@/lib/allProducts";
import { getCustomListings, saveCustomListing, CustomListing } from "@/lib/listingsStorage";
import { SeedOrder, SEED_ORDERS, SEED_THREADS, SeedMessage, SeedThread } from "@/lib/server/seedData";

// Helper for safe fetch with timeout and fallback
async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  fallbackValue?: T
): Promise<T> {
  if (typeof window === "undefined") {
    return fallbackValue as T;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[SafeDeal API] Fetch to ${url} returned status ${res.status}. Using fallback.`);
      return fallbackValue as T;
    }

    const json = await res.json();
    if (json.success && json.data !== undefined) {
      return json.data as T;
    }
    return json as T;
  } catch (err: any) {
    console.warn(`[SafeDeal API Fallback] ${url} failed (${err.message}). Using fallback data.`);
    return fallbackValue as T;
  }
}

/**
 * 1. Fetch Listings with category/search/sort + Fallback
 */
export async function apiGetListings(params?: {
  category?: string;
  query?: string;
  sort?: string;
  instant?: boolean;
}): Promise<CatalogListingItem[]> {
  // Build fallback from local catalog + custom listings
  const custom = getCustomListings().map((c) => ({
    id: c.id,
    title: c.title,
    category: (c.categoryKey === "gold" ? "currency" : c.categoryKey === "creator" ? "social" : c.categoryKey) as any,
    price: c.price,
    image: c.image || ALL_CATALOG_LISTINGS[0].image,
    imageAlt: c.imageAlt || c.title,
    platform: c.publisher || "Global",
    region: c.region || "Global",
    deliveryType: (c.isAutoDispatch ? "instant" : "fast") as "instant" | "fast" | "manual",
    deliveryTimeText: c.isAutoDispatch ? "Instant Automated" : "Fast Delivery (~15m)",
    seller: {
      id: "s-user",
      name: "AeroGamingDeals",
      avatarInitial: "A",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      rating: 4.98,
      dealCount: 1420,
      isVerified: true,
      tier: "PRO" as const,
      deliverySpeed: "< 3 mins",
    },
    rating: 5.0,
    reviewsCount: 1,
    tags: ["Custom Created"],
    followers: c.followers,
    monetization: c.monetization,
  }));

  const combinedFallback = [...custom, ...ALL_CATALOG_LISTINGS];

  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("cat", params.category);
  if (params?.query) searchParams.set("q", params.query);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.instant) searchParams.set("instant", "true");

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const result = await safeFetch<CatalogListingItem[] | { data?: CatalogListingItem[] }>(
    `/api/listings${queryStr}`,
    { method: "GET" },
    { data: combinedFallback }
  );

  const list = Array.isArray(result) ? result : result?.data;
  return list && list.length > 0 ? list : combinedFallback;
}

/**
 * 2. Fetch Single Listing by ID + Fallback
 */
export async function apiGetListingById(id: string): Promise<ProductItem | null> {
  const fallback = getProductById(id) || null;

  const result = await safeFetch<ProductItem | null>(
    `/api/listings/${id}`,
    { method: "GET" },
    fallback
  );

  return result || fallback;
}

/**
 * 3. Fetch Orders with Status/Role + Fallback
 */
export async function apiGetOrders(role = "buyer", status = "all"): Promise<SeedOrder[]> {
  const queryStr = `?role=${role}&status=${status}`;

  const result = await safeFetch<SeedOrder[]>(
    `/api/orders${queryStr}`,
    { method: "GET" },
    SEED_ORDERS
  );

  return result || SEED_ORDERS;
}

/**
 * 4. Fetch Order by ID + Fallback
 */
export async function apiGetOrderById(id: string): Promise<SeedOrder | null> {
  const cleanId = id.replace("#", "").toLowerCase();
  const fallback =
    SEED_ORDERS.find(
      (o) =>
        o.id.toLowerCase() === cleanId ||
        o.orderNumber.replace("#", "").toLowerCase() === cleanId
    ) || null;

  const result = await safeFetch<SeedOrder | null>(
    `/api/orders/${id}`,
    { method: "GET" },
    fallback
  );

  return result || fallback;
}

/**
 * 5. Update Order Escrow Status (Release / Dispute) + Fallback
 */
export async function apiUpdateOrderStatus(
  id: string,
  action: "release" | "dispute" | "warranty",
  notes?: string
): Promise<{ success: boolean; order?: SeedOrder }> {
  try {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, order: json.data };
    }
    // Server rejected (auth, ownership, or validation) — report honestly.
    return { success: false };
  } catch (err) {
    console.warn(`[SafeDeal API] PATCH /api/orders/${id} error:`, err);
  }

  // Network failure without a server verdict is not a successful escrow action.
  return { success: false };
}

/**
 * 5b. Create New Escrow Order via API + Fallback
 */
export async function apiCreateOrder(orderData: {
  itemTitle: string;
  price: number;
  image?: string;
  category?: string;
  platform?: string;
  sellerName?: string;
  sellerTag?: string;
  paymentMethod?: string;
}): Promise<SeedOrder | null> {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("[SafeDeal API] POST /api/orders failed.", err);
  }

  // Never fabricate an escrow order client-side: a real order must come from
  // the server where identity + the escrow hold live.
  return null;
}

/**
 * 6. Create New Listing via API + Local Storage Persistence
 */
export async function apiCreateListing(
  listingData: Partial<CustomListing> & { title: string; price: number }
): Promise<CustomListing> {
  // Always save to local storage as client backup
  const savedLocal = saveCustomListing(listingData);

  try {
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...listingData,
        id: savedLocal.id,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("[SafeDeal API Fallback] POST /api/listings failed. Saved to local store.", err);
  }

  return savedLocal;
}

/**
 * 7. Fetch Chat Threads from API
 */
export async function apiGetThreads(role?: string): Promise<SeedThread[]> {
  try {
    const res = await fetch(`/api/messages${role ? `?role=${role}` : ""}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.threads)) {
        return json.threads;
      }
    }
  } catch (err) {
    console.warn("[SafeDeal API Fallback] GET /api/messages failed. Using seed threads.");
  }
  return SEED_THREADS;
}

/**
 * 8. Fetch Chat Messages + Fallback
 */
export async function apiGetMessages(threadId: string): Promise<SeedMessage[]> {
  const thread = SEED_THREADS.find((t) => t.id === threadId) || SEED_THREADS[0];
  const fallback = thread.messages;

  try {
    const res = await fetch(`/api/messages?threadId=${threadId}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.messages) {
        return json.messages;
      }
    }
  } catch (err) {
    console.warn(`[SafeDeal API Fallback] GET /api/messages failed. Using seed fallback.`);
  }

  return fallback;
}

/**
 * 8. Send Chat Message via API
 */
export async function apiSendMessage(
  threadId: string,
  sender: "buyer" | "seller" | "admin",
  text: string
): Promise<SeedMessage> {
  const localMsg: SeedMessage = {
    id: `msg-${Date.now()}`,
    sender,
    text,
    time: "Just now",
  };

  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, sender, text }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("[SafeDeal API Fallback] POST /api/messages failed. Using optimistic response.");
  }

  return localMsg;
}

/**
 * 9. Fetch Admin Overview + Fallback
 */
export async function apiGetAdminData(): Promise<{
  overview: any;
  disputes: any[];
}> {
  const fallback = {
    overview: {
      activeDisputes: 5,
      totalVolume: 428900.0,
      escrowLockedVolume: 38450.0,
      avgResolutionHours: 4.2,
      kycPendingCount: 4,
      criticalAlerts: 3,
      platformHealth: "Operational",
    },
    disputes: [],
  };

  try {
    const res = await fetch("/api/admin");
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("[SafeDeal API Fallback] GET /api/admin failed. Using fallback.");
  }

  return fallback;
}

/**
 * 10. Re-seed Database to Fresh Seed Data
 */
export async function apiReseedDatabase(): Promise<boolean> {
  try {
    const res = await fetch("/api/seed", { method: "POST" });
    if (res.ok) {
      const json = await res.json();
      return json.success === true;
    }
  } catch (err) {
    console.error("[SafeDeal API] Re-seed request error:", err);
  }
  return false;
}
