// Local and in-memory persistent storage for custom seller listings
export interface CustomListing {
  id: string;
  sku: string;
  title: string;
  type: "Account" | "Key" | "Asset" | "Currency";
  category: string;
  categoryKey: "accounts" | "keys" | "currency" | "social" | "software" | "gift-cards" | "creator" | "gold";
  game: string;
  publisher: string;
  price: number;
  priceSub: string;
  region: string;
  currentRank?: string;
  peakRank?: string;
  emailSecurity?: "oge" | "clean";
  skinTags?: { id: string; name: string; isRare: boolean }[];
  description?: string;
  image: string;
  imageAlt: string;
  status: "Active" | "Paused" | "Draft" | "Sold Out";
  views: number;
  watchers: number;
  updatedTime: string;
  isAutoDispatch: boolean;
  keysInVault?: number;
  stockCount?: number;
  fullAccess: boolean;
  createdAt: number;
  vaultCredentials?: {
    username?: string;
    email?: string;
    notes?: string;
    twoFactorReady?: boolean;
  };
  followers?: string;
  monetization?: string;
  niche?: string;
  handle?: string;
  cleanStrikes?: boolean;
}

const STORAGE_KEY = "safedeal_custom_listings_v1";

// Default initial in-memory state
let inMemoryListings: CustomListing[] = [];

export function getCustomListings(): CustomListing[] {
  if (typeof window === "undefined") {
    return inMemoryListings;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return inMemoryListings;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // ignore json parse error
  }
  return inMemoryListings;
}

export function saveCustomListing(listing: Partial<CustomListing> & { title?: string; price?: number }): CustomListing {
  const id = listing.id || `LIST-${Date.now()}`;
  const sku = listing.sku || `SKU-${Date.now().toString().slice(-6)}`;
  const now = Date.now();

  const fullListing: CustomListing = {
    id,
    sku,
    title: listing.title || "Custom Digital Asset",
    type: listing.type || "Account",
    category: listing.category || "Gaming Accounts > Valorant",
    categoryKey: listing.categoryKey || "accounts",
    game: listing.game || "Valorant",
    publisher: listing.publisher || "Riot Games",
    price: Number(listing.price) || 195.0,
    priceSub: listing.priceSub || (listing.type === "Key" ? "Instant digital voucher" : "Full Access & Email Transfer"),
    region: listing.region || "North America (NA / US-East)",
    currentRank: listing.currentRank || "Ascendant 2",
    peakRank: listing.peakRank || "Immortal 3 (342 RR)",
    emailSecurity: listing.emailSecurity || "oge",
    skinTags: listing.skinTags || [],
    description: listing.description || "",
    image:
      listing.image ||
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    imageAlt: listing.imageAlt || listing.title || "Verified gaming listing",
    status: listing.status || "Active",
    views: listing.views ?? 1,
    watchers: listing.watchers ?? 0,
    updatedTime: "Just listed",
    isAutoDispatch: listing.isAutoDispatch ?? true,
    keysInVault: listing.keysInVault ?? 1,
    stockCount: listing.stockCount ?? 1,
    fullAccess: listing.fullAccess ?? true,
    createdAt: now,
    vaultCredentials: listing.vaultCredentials || {},
    followers: listing.followers,
    monetization: listing.monetization,
    niche: listing.niche,
    handle: listing.handle,
    cleanStrikes: listing.cleanStrikes,
  };

  const existing = getCustomListings().filter((item) => item.id !== id);
  const updated = [fullListing, ...existing];

  inMemoryListings = updated;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("safedeal_listings_changed", { detail: fullListing }));
    } catch {
      // ignore quota errors
    }
  }

  return fullListing;
}

export function deleteCustomListing(id: string): void {
  const existing = getCustomListings();
  const updated = existing.filter((item) => item.id !== id);
  inMemoryListings = updated;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("safedeal_listings_changed", { detail: { id, deleted: true } }));
    } catch {
      // ignore
    }
  }
}

export function updateCustomListingStatus(id: string, nextStatus: "Active" | "Paused" | "Draft" | "Sold Out"): void {
  const existing = getCustomListings();
  const updated = existing.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status: nextStatus,
        priceSub:
          nextStatus === "Paused"
            ? "Listing hidden from search"
            : item.type === "Key"
            ? "Instant digital voucher"
            : "Full Access & Email Transfer",
        updatedTime: "Just updated",
      };
    }
    return item;
  });
  inMemoryListings = updated;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("safedeal_listings_changed", { detail: { id, status: nextStatus } }));
    } catch {
      // ignore
    }
  }
}
