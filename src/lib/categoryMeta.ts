export interface CategoryMeta {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  pillLabel: string;
  breadcrumb: string;
  stats: { label: string; value: string }[];
  accent: string;
  featuredTags: string[];
  seoKeywords: string[];
}

export const CATEGORY_ALIASES: Record<string, string> = {
  "game-accounts": "accounts",
  "gaming-accounts": "accounts",
  "account": "accounts",
  "games": "keys",
  "game-keys": "keys",
  "cd-keys": "keys",
  "key": "keys",
  "gold": "currency",
  "coins": "currency",
  "game-currency": "currency",
  "social-media": "social",
  "creator": "social",
  "youtube": "social",
  "tiktok": "social",
  "software-licenses": "software",
  "licenses": "software",
  "apps": "software",
  "giftcards": "gift-cards",
  "giftcard": "gift-cards",
  "vouchers": "gift-cards",
};

export const CATEGORIES_DATA: Record<string, CategoryMeta> = {
  accounts: {
    id: "accounts",
    slug: "accounts",
    title: "Gaming Accounts — Full Email & Custody Handover",
    subtitle:
      "High-tier competitive ranked and collector accounts with clean competitive match history, original email (OE) transfer, and ban-free warranty.",
    pillLabel: "Gaming Accounts",
    breadcrumb: "Gaming Accounts",
    stats: [
      { label: "Ranked Accounts", value: "24,800+" },
      { label: "Original Email Guaranteed", value: "100%" },
      { label: "Dispute Rate", value: "< 0.08%" },
    ],
    accent: "from-blue-600 to-cyan-600",
    featuredTags: ["Valorant", "League of Legends", "CS2", "Apex Legends", "Fortnite", "Clean HWID", "Full OE Access"],
    seoKeywords: ["buy gaming accounts", "valorant radiant accounts", "cs2 prime accounts", "safe account escrow", "original email verified"],
  },
  keys: {
    id: "keys",
    slug: "keys",
    title: "Game Keys, Digital CDNs & Activation Codes",
    subtitle:
      "Official publisher license codes for Steam, Epic Games, PlayStation, Xbox, and EA App. Reveal your key instantly upon escrow hold creation.",
    pillLabel: "Game Keys & CDNs",
    breadcrumb: "Game Keys",
    stats: [
      { label: "Global DRM Keys", value: "48,100+" },
      { label: "Instant Key Reveal", value: "0 seconds" },
      { label: "MSRP Discount", value: "Up to 75%" },
    ],
    accent: "from-indigo-600 to-purple-600",
    featuredTags: ["Steam Keys", "Cyberpunk 2077", "Elden Ring", "PlayStation Network", "Xbox Live", "Global Activation"],
    seoKeywords: ["buy steam keys", "cheap game keys", "phantom liberty discount", "instant key reveal", "licensed distributors"],
  },
  currency: {
    id: "currency",
    slug: "currency",
    title: "In-Game Gold, Coins & Currency Reserves",
    subtitle:
      "Safe, farm-direct currency delivered through automated auction house buyout, private in-game mailbox, or discrete face-to-face handover.",
    pillLabel: "In-Game Currency",
    breadcrumb: "Currency & Gold",
    stats: [
      { label: "Stock Vault Value", value: "$4.2M+" },
      { label: "Avg Delivery Speed", value: "3 mins" },
      { label: "Anti-Ban Protection", value: "Included" },
    ],
    accent: "from-amber-500 to-orange-600",
    featuredTags: ["WoW Gold", "OSRS Gold", "FC 25 Coins", "Guild Bank Transfer", "Auction House Safe"],
    seoKeywords: ["buy wow gold", "cheap game currency", "safe gold transfer", "fc 25 coins", "escrow delivery"],
  },
  social: {
    id: "social",
    slug: "social",
    title: "Social & Creator Assets — Escrow Handover",
    subtitle:
      "Pre-monetized YouTube partner channels, high-engagement TikTok accounts, established Discord communities, and premium digital handles.",
    pillLabel: "Social & Creator",
    breadcrumb: "Creator Assets",
    stats: [
      { label: "Verified Channels", value: "4,200+" },
      { label: "YPP Monetized", value: "Eligible" },
      { label: "Escrow Transfer Concierge", value: "Available" },
    ],
    accent: "from-purple-600 to-pink-600",
    featuredTags: ["YouTube Monetized", "TikTok 100k+", "Discord Communities", "Instagram Handles", "YPP Active"],
    seoKeywords: ["buy youtube channel", "monetized youtube channel for sale", "buy tiktok account", "creator escrow", "digital handles"],
  },
  software: {
    id: "software",
    slug: "software",
    title: "Software Licenses & Productivity Utilities",
    subtitle:
      "Genuine lifetime and recurring activation keys for Windows Pro, Office 365, premier VPN subscriptions, developer utilities, and security suites.",
    pillLabel: "Software Licenses",
    breadcrumb: "Software & OS",
    stats: [
      { label: "Genuine Product Keys", value: "8,900+" },
      { label: "Lifetime Licenses", value: "72% of stock" },
      { label: "Instant Code Delivery", value: "Automated" },
    ],
    accent: "from-cyan-600 to-blue-700",
    featuredTags: ["Windows 11 Pro", "Office 2024", "NordVPN Lifetime", "Dev IDE Licenses", "Microsoft Certified"],
    seoKeywords: ["windows 11 pro key", "cheap software licenses", "lifetime retail key", "genuine software escrow"],
  },
  "gift-cards": {
    id: "gift-cards",
    slug: "gift-cards",
    title: "Digital Gift Cards & Prepaid Store Vouchers",
    subtitle:
      "Discounted digital prepaid codes for Steam Wallet, Apple Store, PlayStation Network, Amazon, and Razer Gold with instant code unmasking.",
    pillLabel: "Gift Cards",
    breadcrumb: "Gift Cards",
    stats: [
      { label: "Prepaid Vouchers", value: "18,400+" },
      { label: "Average Discount", value: "14% OFF" },
      { label: "Instant Redeem", value: "Unmasked" },
    ],
    accent: "from-emerald-600 to-teal-700",
    featuredTags: ["Steam Wallet", "Apple Store", "Amazon Cards", "PlayStation Store", "Razer Gold", "Instant Unmask"],
    seoKeywords: ["discount steam gift card", "buy gift cards with escrow", "apple store digital code", "prepaid card discount"],
  },
};

export const VALID_CATEGORY_SLUGS = Object.keys(CATEGORIES_DATA);

export function normalizeCategorySlug(slug: string): string {
  const clean = slug.toLowerCase().trim();
  if (CATEGORIES_DATA[clean]) return clean;
  if (CATEGORY_ALIASES[clean]) return CATEGORY_ALIASES[clean];
  return "accounts"; // default fallback
}

export function getCategoryMeta(slug: string): CategoryMeta {
  const normalized = normalizeCategorySlug(slug);
  return CATEGORIES_DATA[normalized] || CATEGORIES_DATA.accounts;
}
