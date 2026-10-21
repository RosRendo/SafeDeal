import { ProductItem } from "@/types/marketplace";

export interface CatalogListingItem extends ProductItem {
  rank?: "Radiant" | "Immortal" | "Ascendant" | "Diamond" | "Platinum" | "Gold" | string;
  rankLevelText?: string;
  skinCount?: number;
  isEmailIncluded?: boolean;
  isOnline?: boolean;
  wishlistActive?: boolean;
  game?: string;
  server?: string;
  deliveryMethod?: string;
  brand?: string;
  denomination?: string;
  licenseDuration?: string;
  softwareType?: string;
  followers?: string;
  monetization?: string;
  status?: "Active" | "Paused" | "Draft" | "Sold Out";
  sku?: string;
  views?: number;
  watchers?: number;
  keysInVault?: number;
  stockCount?: number;
  priceSub?: string;
  isAutoDispatch?: boolean;
}

// Unseeded / Empty catalog items
export const VALORANT_CATALOG_LISTINGS: CatalogListingItem[] = [];
export const KEYS_CATALOG_LISTINGS: CatalogListingItem[] = [];
export const CURRENCY_CATALOG_LISTINGS: CatalogListingItem[] = [];
export const GIFT_CARDS_CATALOG_LISTINGS: CatalogListingItem[] = [];
export const SOFTWARE_CATALOG_LISTINGS: CatalogListingItem[] = [];
export const SOCIAL_CATALOG_LISTINGS: CatalogListingItem[] = [];

export const ALL_CATALOG_LISTINGS: CatalogListingItem[] = [];
