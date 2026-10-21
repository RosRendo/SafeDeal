import {
  ProductItem,
  CategoryTileData,
  FeaturedSellerData,
  LiveTickerItem,
  Seller,
  CuratedCollection,
  SellerOffer,
  OfferComparisonProduct,
  CustomerReview,
} from "@/types/marketplace";

export const SELLERS: Record<string, Seller> = {};

// 1. Visual Category Navigation Tiles (Core platform directory taxonomy)
export const CATEGORY_TILES: CategoryTileData[] = [
  {
    id: "cat-accounts",
    title: "Gaming Accounts",
    subtitle: "Valorant, GTA V, LoL, CS2",
    count: "0 listings",
    badge: "Escrow Verified",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    accentColor: "from-blue-600/90 to-slate-900/90",
    slug: "accounts",
  },
  {
    id: "cat-keys",
    title: "Game Keys & CDNs",
    subtitle: "Steam, Epic, PlayStation, Xbox",
    count: "0 listings",
    badge: "Instant 0s",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    accentColor: "from-indigo-600/90 to-slate-900/90",
    slug: "keys",
  },
  {
    id: "cat-currency",
    title: "In-Game Gold & Coins",
    subtitle: "OSRS GP, WoW Gold, Robux, FC",
    count: "0 listings",
    badge: "Best Rates",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    accentColor: "from-amber-600/90 to-slate-900/90",
    slug: "currency",
  },
  {
    id: "cat-cards",
    title: "Digital Gift Cards",
    subtitle: "Steam, Apple, Amazon, PSN",
    count: "0 listings",
    badge: "Direct Code",
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=800&auto=format&fit=crop",
    accentColor: "from-emerald-600/90 to-slate-900/90",
    slug: "gift-cards",
  },
  {
    id: "cat-software",
    title: "Software & Licenses",
    subtitle: "Windows 11, NordVPN, Office, AI",
    count: "0 listings",
    badge: "Lifetime",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    accentColor: "from-cyan-600/90 to-slate-900/90",
    slug: "software",
  },
  {
    id: "cat-social",
    title: "Social & Creator Assets",
    subtitle: "YouTube Monetized, Handles",
    count: "0 listings",
    badge: "VIP Transfer",
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop",
    accentColor: "from-purple-600/90 to-slate-900/90",
    slug: "social",
  },
];

// 2. Unseeded / Empty marketplace datasets
export const TRENDING_PRODUCTS: ProductItem[] = [];

export const FEATURED_DEALS: ProductItem[] = [];

export const RECOMMENDED_LISTINGS: ProductItem[] = [];

export const FEATURED_SELLERS_LIST: FeaturedSellerData[] = [];

export const RECENTLY_LISTED: ProductItem[] = [];

export const TICKER_ITEMS: LiveTickerItem[] = [];

export const HERO_TAGS: string[] = [
  "Gaming Accounts",
  "Steam Keys",
  "In-Game Currency",
  "Gift Cards",
  "Software Licenses",
  "Social Channels",
];

// Aliases for backward compatibility
export const LISTINGS: ProductItem[] = [];
export const MERCHANTS: any[] = [];
export const TRENDING_TAGS = HERO_TAGS.map((t, idx) => ({
  label: t,
  isHot: idx < 2,
}));
export const RECENT_TRADES: any[] = [];

export const CURATED_COLLECTIONS: CuratedCollection[] = [];

export const OFFER_COMPARISON_PRODUCTS: OfferComparisonProduct[] = [];

// Escrow transaction process explanation steps
export const ESCROW_TRANSACTION_STEPS = [
  {
    step: "01",
    title: "Buyer Deposits to Escrow Vault",
    description:
      "Your payment is locked into our regulated cryptographic escrow smart contract. The seller cannot see or access your funds yet.",
    badge: "100% Protected",
    icon: "Lock",
  },
  {
    step: "02",
    title: "Automated Bot or Direct Handoff",
    description:
      "Within seconds, credentials, license keys, or ownership transfer links are sent through a private end-to-end encrypted chat channel.",
    badge: "Avg: 1.4s Velocity",
    icon: "Zap",
  },
  {
    step: "03",
    title: "48-Hour Inspection Guarantee",
    description:
      "You log in, bind your personal 2FA phone & email, verify in-game inventories, and test everything. If anything is wrong, dispute with 1-click.",
    badge: "Full Access Verify",
    icon: "ShieldCheck",
  },
  {
    step: "04",
    title: "Affirm & Release Payout",
    description:
      "Once you are 100% satisfied and confirm custody, the escrow vault releases funds to the seller. Both parties rate each other.",
    badge: "Zero Chargeback Risk",
    icon: "CheckCircle2",
  },
];

export const CUSTOMER_REVIEWS: CustomerReview[] = [];
