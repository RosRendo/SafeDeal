import { ProductItem } from "@/types/marketplace";
import {
  TRENDING_PRODUCTS,
  RECOMMENDED_LISTINGS,
  FEATURED_DEALS,
  RECENTLY_LISTED,
  SELLERS,
} from "@/lib/data";
import { ALL_CATALOG_LISTINGS } from "@/lib/catalogData";

// Primary showcase listing (SF-94821)
export const SHOWCASE_VALORANT_LISTING: ProductItem = {
  id: "SF-94821",
  title:
    "Valorant High-Tier Account | Peak Immortal 3 (342 RR) | Champions 2021 & 2023 Bundles + 48 Knives/Guns | Full Original Email Access",
  category: "accounts",
  price: 195.0,
  originalPrice: 260.0,
  discountPercent: 25,
  image:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
  imageAlt:
    "Valorant rank badge Immortal 3 alongside rare Champions Karambit and glowing gold weapon skins",
  platform: "Riot Games",
  region: "NA (US / CA)",
  deliveryType: "instant",
  deliveryTimeText: "Instant Automated Vault Delivery",
  seller: {
    id: "s-aero",
    name: "AeroGamingDeals",
    avatarInitial: "A",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    rating: 4.98,
    dealCount: 3890,
    isVerified: true,
    tier: "PRO",
    deliverySpeed: "~4 minutes",
    reviewsCount: "3,420",
  },
  rating: 4.98,
  reviewsCount: 3420,
  isHot: true,
  description:
    "Hand-leveled since Episode 1 Act 2. Clean MMR ladder history with verified Immortal 3 peak finishes. Never shared, botted, or boosted. Comes with both time-limited, vaulted Champions collector packs that will never re-appear in the daily item shop.",
};

import { getCustomListings } from "@/lib/listingsStorage";

export function getAllProducts(): ProductItem[] {
  const customItems: ProductItem[] = getCustomListings().map((c) => ({
    id: c.id,
    title: c.title,
    category: c.categoryKey === "gold" ? "currency" : c.categoryKey === "creator" ? "social" : c.categoryKey,
    price: c.price,
    image: c.image || SHOWCASE_VALORANT_LISTING.image,
    imageAlt: c.imageAlt || c.title,
    platform: c.publisher || "Global",
    region: c.region || "Global",
    deliveryType: (c.isAutoDispatch ? "instant" : "fast") as "instant" | "fast" | "manual",
    deliveryTimeText: c.isAutoDispatch ? "Instant Automated Vault Delivery" : "Under 2 Hours Handoff",
    seller: {
      id: "s-verified-merchant",
      name: "SafeDeal Merchant (You)",
      avatarInitial: "M",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      rating: 5.0,
      dealCount: 142,
      isVerified: true,
      tier: "VERIFIED" as const,
      deliverySpeed: "Instant",
      reviewsCount: "142",
    },
    rating: 5.0,
    reviewsCount: 142,
    description: c.description || "Verified seller listing protected by SafeDeal Escrow with full credential verification.",
  }));

  return [
    ...customItems,
    SHOWCASE_VALORANT_LISTING,
    ...ALL_CATALOG_LISTINGS,
    ...TRENDING_PRODUCTS,
    ...RECOMMENDED_LISTINGS,
    ...FEATURED_DEALS,
    ...RECENTLY_LISTED,
  ];
}

export function getProductById(id: string): ProductItem {
  const all = getAllProducts();
  const match = all.find((p) => p.id === id || p.id.toLowerCase() === id.toLowerCase());
  if (match) return match;

  // Fallback if ID is unknown: create a clean contextual product
  return {
    id: id || "SF-94821",
    title: id ? `Product #${id} Verified Escrow Item` : SHOWCASE_VALORANT_LISTING.title,
    category: "accounts",
    price: 99.0,
    originalPrice: 129.0,
    discountPercent: 23,
    image: SHOWCASE_VALORANT_LISTING.image,
    imageAlt: "Digital asset preview",
    platform: "PC Digital",
    region: "Global",
    deliveryType: "instant",
    deliveryTimeText: "Instant Automated Vault Delivery",
    seller: SELLERS.valkyrie || SHOWCASE_VALORANT_LISTING.seller,
    rating: 4.98,
    reviewsCount: 1540,
    description: "Verified digital asset protected by Safedeal 48-Hour Escrow guarantee with full ownership transfer.",
  };
}
