import { CatalogListingItem } from "@/lib/catalogData";
import { ProductItem, CustomerReview } from "@/types/marketplace";

export interface OrderPayment {
  provider: "stripe" | "simulated";
  reference: string;
  clientSecret?: string;
  status: "authorized" | "captured" | "refunded" | "canceled" | "failed";
  amount: number;
  currency: string;
  capturedAt?: string;
  refundedAmount?: number;
}

export interface SeedOrder {
  id: string;
  orderNumber: string;
  itemTitle: string;
  image: string;
  tag: string;
  category: "accounts" | "keys" | "currency" | "licenses" | "social";
  date: string;
  timestamp: string;
  deliveryType: string;
  price: number;
  sellerName: string;
  sellerLevel?: string;
  sellerRating: number;
  sellerSales: string;
  status: "active" | "delivered" | "warranty" | "disputed";
  statusText: string;
  warrantyLeft?: string;
  escrowTimeRemaining?: string;
  disputePaused?: boolean;
  settledAt?: string;
  buyerName?: string;
  buyerEmail?: string;
  payment?: OrderPayment;
  credentials?: {
    login: string;
    email: string;
    pass: string;
    pin: string;
    token?: string;
  };
  securityChecks?: {
    ogeEmail: string;
    twoFactor: string;
    hwidStatus: string;
  };
  deliveryData?: {
    login?: string;
    email?: string;
    pass?: string;
    pin?: string;
    token?: string;
    deliveredAt?: string;
    ogeEmail?: string;
    twoFactor?: string;
    hwidStatus?: string;
  };
}

export interface SeedMessage {
  id: string;
  sender: "buyer" | "seller" | "admin" | "system";
  text?: string;
  time: string;
  systemTitle?: string;
  systemSub?: string;
  hasVaultAction?: boolean;
}

export interface SeedThread {
  id: string;
  sellerName: string;
  sellerTag: string;
  avatar: string;
  buyerName?: string;
  buyerTag?: string;
  buyerAvatar?: string;
  buyerEmail?: string;
  buyerRating?: number;
  buyerDealCount?: string;
  buyerVerified?: boolean;
  buyerLevel?: string;
  isOnline: boolean;
  isVerified: boolean;
  isStaff?: boolean;
  time: string;
  orderNumber: string;
  itemTitle: string;
  lastMessage: string;
  unreadCount?: number;
  badgeText?: string;
  type: "active" | "archived" | "dispute";
  rating: number;
  dealCount: string;
  sellerLevel: string;
  slaSpeed: string;
  orderPrice: number;
  orderImage: string;
  orderPlatform: string;
  orderSubtext: string;
  orderStatus: "inspection" | "completed" | "disputed";
  credentials: {
    login: string;
    email: string;
    pass: string;
    pin: string;
    token: string;
  };
  securityChecks: {
    ogeEmail: string;
    twoFactor: string;
    hwidStatus: string;
  };
  messages: SeedMessage[];
}

export interface SeedAdminOverview {
  activeDisputes: number;
  totalVolume: number;
  escrowLockedVolume: number;
  avgResolutionHours: number;
  kycPendingCount: number;
  criticalAlerts: number;
  platformHealth: string;
}

export const SEED_LISTINGS: CatalogListingItem[] = [
  {
    id: "SF-94821",
    title: "Valorant High-Tier Account | Peak Immortal 3 (342 RR) | Champions 2021 & 2023 Bundles + 48 Knives/Guns | Full Original Email Access",
    category: "accounts",
    price: 195.0,
    originalPrice: 260.0,
    discountPercent: 25,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Valorant rank badge Immortal 3 alongside rare Champions Karambit and glowing gold weapon skins",
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
    rank: "Immortal 3",
    rankLevelText: "Immortal 3 • Peak 342 RR",
    skinCount: 48,
    isEmailIncluded: true,
    isOnline: true,
    tags: ["Champions 2021", "Champions 2023", "OGE Included", "Clean HWID"],
    description:
      "Hand-leveled since Episode 1 Act 2. Clean MMR ladder history with verified Immortal 3 peak finishes. Never shared, botted, or boosted. Comes with both time-limited, vaulted Champions collector packs.",
  },
  {
    id: "SF-94822",
    title: "CS2 Prime Account | 10-Year Veteran Coin & 2024 Service Medal | Clean VAC / Unlinked FaceIT",
    category: "accounts",
    price: 65.0,
    originalPrice: 85.0,
    discountPercent: 23,
    image:
      "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Counter-Strike 2 Prime status badge and golden 10-year coin medal",
    platform: "Steam",
    region: "Global (Region-Free)",
    deliveryType: "instant",
    deliveryTimeText: "Instant Vault Dispatch",
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
    tags: ["10-Year Coin", "Prime Status", "FaceIT Ready", "Clean Steam ID"],
    description: "Original Steam account with CS:GO 10-Year Veteran Coin, 5-Year Coin, and 2024 Service Medal. Never linked to FaceIT or ESEA. Clean VAC and trade history.",
  },
  {
    id: "SF-94823",
    title: "Cyberpunk 2077: Phantom Liberty Expansion | Steam Global Activation Key (Instant Vault Reveal)",
    category: "keys",
    price: 26.8,
    originalPrice: 39.99,
    discountPercent: 33,
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Cyberpunk 2077 Phantom Liberty visual art banner with futuristic cyberpunk aesthetics",
    platform: "Steam",
    region: "Global Region-Free",
    deliveryType: "instant",
    deliveryTimeText: "Instant Vault Dispatch",
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
      deliverySpeed: "< 1 minute",
      reviewsCount: "3,420",
    },
    rating: 4.98,
    reviewsCount: 3420,
    tags: ["Publisher Direct", "Steam Global", "Permanent Key", "Instant Automated"],
  },
  {
    id: "SF-94824",
    title: "Valorant Champions 2023 Vandal + Prime Karambit | Level 148 Radiant Peak | Full OE Included",
    category: "accounts",
    price: 185.0,
    originalPrice: 220.0,
    discountPercent: 16,
    image:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Champions 2023 golden knife skin and tactical weapon bundle",
    platform: "Riot Games",
    region: "NA Region",
    deliveryType: "instant",
    deliveryTimeText: "Instant Automated",
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
      deliverySpeed: "Instant",
      reviewsCount: "3,420",
    },
    rating: 4.98,
    reviewsCount: 3420,
    rank: "Radiant",
    rankLevelText: "Lvl 148 • Radiant Peak",
    skinCount: 42,
    isEmailIncluded: true,
    isOnline: true,
    tags: ["42 Skins", "Full Email Access (OE)", "No Bans", "Prime Karambit"],
  },
  {
    id: "SF-94825",
    title: "Elden Ring: Shadow of the Erdtree Edition | Steam Global Digital Key (Region-Free)",
    category: "keys",
    price: 42.5,
    originalPrice: 49.99,
    discountPercent: 15,
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Elden Ring Shadow of the Erdtree expansion key artwork",
    platform: "Steam",
    region: "Global Lifetime",
    deliveryType: "instant",
    deliveryTimeText: "Instant Vault Dispatch",
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
      deliverySpeed: "< 1 minute",
      reviewsCount: "3,420",
    },
    rating: 4.98,
    reviewsCount: 3420,
    tags: ["Bandai Namco Official", "Global Activation", "Instant Key"],
  },
  {
    id: "SF-94826",
    title: "Steam Wallet $100 USD Digital Gift Card | Instant Vault Reveal (0% Escrow Surcharge)",
    category: "gift-cards",
    price: 94.0,
    originalPrice: 100.0,
    discountPercent: 6,
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Steam gift card digital wallet voucher card design",
    platform: "Steam",
    region: "USD Currency",
    deliveryType: "instant",
    deliveryTimeText: "Instant Automated Code",
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
      deliverySpeed: "Instant (0s)",
      reviewsCount: "3,420",
    },
    rating: 4.98,
    reviewsCount: 3420,
    tags: ["No Expiry", "$100 USD Balance", "Instant Vault", "Verified Code"],
  },
  {
    id: "SF-94827",
    title: "World of Warcraft Gold Reserve | 5,000,000 Gold (Safe Guild Bank Delivery NA Area 52)",
    category: "currency",
    price: 135.0,
    originalPrice: 160.0,
    discountPercent: 15,
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    imageAlt: "World of Warcraft glowing chest filled with gold coins and fantasy treasure",
    platform: "Battle.net",
    region: "NA Area 52 / Illidan / Stormrage",
    deliveryType: "fast",
    deliveryTimeText: "Guild Bank Vault Transfer (~10 mins)",
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
      deliverySpeed: "~8 mins",
      reviewsCount: "3,420",
    },
    rating: 4.98,
    reviewsCount: 3420,
    tags: ["5M Gold", "Guild Bank Safe", "Clean Farmed", "Blizzard Clean"],
  },
  {
    id: "SF-94828",
    title: "Apex Legends Predator S18 Account | 3 Heirlooms (Wraith Kunai + Voidshifter) | Clean EA Origin",
    category: "accounts",
    price: 210.0,
    originalPrice: 280.0,
    discountPercent: 25,
    image:
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=800&auto=format&fit=crop",
    imageAlt: "Apex Legends Predator badge and legendary heirlooms display",
    platform: "EA App",
    region: "Global (PC)",
    deliveryType: "instant",
    deliveryTimeText: "Instant Vault Dispatch",
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
      deliverySpeed: "Instant",
      reviewsCount: "3,420",
    },
    rating: 4.98,
    reviewsCount: 3420,
    tags: ["Predator S18", "3 Heirlooms", "Wraith Kunai", "Original Email Included"],
  },
  {
    id: "soc-1",
    title: "YouTube Gaming Channel | 142k Subscribers | Monetized (YPP Active) | Zero Copyright Strikes",
    category: "social",
    price: 880.0,
    originalPrice: 1050.0,
    discountPercent: 16,
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop",
    imageAlt: "YouTube verified channel banner with creator studio dashboard analytics",
    platform: "YouTube",
    region: "Worldwide (English Primary)",
    deliveryType: "manual",
    deliveryTimeText: "Escrow Primary Owner Handover",
    followers: "142k Subscribers",
    monetization: "YPP Enabled & Clean",
    seller: {
      id: "s-apexholdings",
      name: "ApexHoldings",
      avatarInitial: "A",
      avatarUrl:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
      rating: 4.97,
      dealCount: 940,
      isVerified: true,
      tier: "VIP",
      deliverySpeed: "~15 mins",
      reviewsCount: "820",
    },
    rating: 4.97,
    reviewsCount: 820,
    tags: ["142k Subs", "YPP Monetized", "0 Strikes", "Primary Ownership Transfer"],
  },
];

export const SEED_ORDERS: SeedOrder[] = [
  {
    id: "ord-1",
    orderNumber: "#SF-2024-88492",
    itemTitle: "Valorant High-Tier Account | Peak Immortal 3 (342 RR) | Champions Bundles | Full OGE Included",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    tag: "Riot Account",
    category: "accounts",
    date: "Oct 24, 2024",
    timestamp: "2:14 PM UTC",
    deliveryType: "Automated Bot Delivery",
    price: 195.0,
    sellerName: "AeroGamingDeals",
    buyerName: "Alex Mercer",
    buyerEmail: "alex.mercer@gmail.com",
    sellerLevel: "Lvl 3",
    sellerRating: 4.98,
    sellerSales: "3,820 sales",
    status: "active",
    statusText: "In 48h Inspection Window",
    escrowTimeRemaining: "47h 59m (Inspection Window Active)",
    credentials: {
      login: "alex_valorant_immortal",
      email: "alex.og.creation@protonmail.com",
      pass: "V4lorant#Immortal2024!",
      pin: "4920",
      token: "OGE-TOKEN-88492-X9",
    },
    securityChecks: {
      ogeEmail: "ProtonMail OE Access Verified",
      twoFactor: "Clean Mobile Unbound",
      hwidStatus: "Passed Riot Telemetry Checks",
    },
  },
  {
    id: "ord-2",
    orderNumber: "#SF-2024-88519",
    itemTitle: "Cyberpunk 2077: Phantom Liberty Expansion (PC - Steam Global Digital Key)",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=800&auto=format&fit=crop",
    tag: "Steam Key",
    category: "keys",
    date: "Yesterday",
    timestamp: "4:10 PM UTC",
    deliveryType: "Instant Key Dispatch",
    price: 26.8,
    sellerName: "AeroGamingDeals",
    buyerName: "David Zhao",
    buyerEmail: "david.zhao@outlook.com",
    sellerLevel: "Lvl 3 Verified",
    sellerRating: 4.98,
    sellerSales: "3,842 deals",
    status: "delivered",
    statusText: "Completed & Funds Released",
    settledAt: "Yesterday, 4:15 PM UTC",
    credentials: {
      login: "STEAM-CDKEY",
      email: "N/A",
      pass: "CP77-PL-4928-VX81-0042",
      pin: "0000",
    },
  },
  {
    id: "ord-3",
    orderNumber: "DSP-1092",
    itemTitle: "Apex Legends Predator S18 Account | 3 Heirlooms | Wraith Kunai + Voidshifter",
    image:
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=800&auto=format&fit=crop",
    tag: "EA Origin Account",
    category: "accounts",
    date: "Oct 22, 2024",
    timestamp: "10:00 AM UTC",
    deliveryType: "Manual Handover",
    price: 65.0,
    sellerName: "AeroGamingDeals",
    buyerName: "Elena Rostova",
    buyerEmail: "elena.rostova@proton.me",
    sellerLevel: "Lvl 3 Verified",
    sellerRating: 4.98,
    sellerSales: "3,842 deals",
    status: "disputed",
    statusText: "Escrow Paused (Arbitration Review)",
    disputePaused: true,
    credentials: {
      login: "HOLD-IN-ARBITRATION",
      email: "dispute-records@safedeal.com",
      pass: "CASE-DSP-1092-PROOF",
      pin: "9911",
    },
  },
  {
    id: "ord-4",
    orderNumber: "#SF-2024-88602",
    itemTitle: "CS2 Prime Account | 10-Year Veteran Coin & 2024 Service Medal",
    image:
      "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?q=80&w=800&auto=format&fit=crop",
    tag: "Steam Account",
    category: "accounts",
    date: "Oct 20, 2024",
    timestamp: "11:30 AM UTC",
    deliveryType: "Instant Automated",
    price: 65.0,
    sellerName: "AeroGamingDeals",
    buyerName: "Alex Mercer",
    buyerEmail: "alex.mercer@gmail.com",
    sellerLevel: "Lvl 3 Verified",
    sellerRating: 4.98,
    sellerSales: "3,842 deals",
    status: "delivered",
    statusText: "Completed & Funds Released",
    settledAt: "Oct 20, 2024, 11:45 AM UTC",
    credentials: {
      login: "cs2_prime_veteran",
      email: "cs2_prime_og@protonmail.com",
      pass: "Steam#Prime2024!",
      pin: "1010",
    },
  },
  {
    id: "ord-5",
    orderNumber: "#SF-2024-88615",
    itemTitle: "Steam Wallet $100 USD Digital Gift Card",
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=800&auto=format&fit=crop",
    tag: "Digital Voucher",
    category: "keys",
    date: "Oct 18, 2024",
    timestamp: "3:00 PM UTC",
    deliveryType: "Instant Automated Code",
    price: 94.0,
    sellerName: "AeroGamingDeals",
    buyerName: "Alex Mercer",
    buyerEmail: "alex.mercer@gmail.com",
    sellerLevel: "Lvl 3 Verified",
    sellerRating: 4.98,
    sellerSales: "3,842 deals",
    status: "delivered",
    statusText: "Completed & Funds Released",
    settledAt: "Oct 18, 2024, 3:05 PM UTC",
    credentials: {
      login: "STEAM-GIFT-CARD",
      email: "N/A",
      pass: "ST100-USA-4920-VX81",
      pin: "0000",
    },
  },
];

export const SEED_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    author: "Marcus_V",
    avatarUrl: "",
    rating: 5,
    date: "2 hours ago",
    verifiedPurchase: "Valorant Peak Immortal 3 (342 RR)",
    sellerName: "AeroGamingDeals",
    reviewText: "Instant automated delivery within 45 seconds of escrow confirmation. The original email transfer was clean, 2FA unbound, and all Champions 2021/2023 skins were exactly as described. Best high-tier seller on Safedeal by far.",
    helpfulCount: 14,
    productCategory: "accounts",
  },
  {
    id: "rev-2",
    author: "Kev_Gamer99",
    avatarUrl: "",
    rating: 5,
    date: "Yesterday",
    verifiedPurchase: "Cyberpunk 2077: Phantom Liberty (Steam Key)",
    sellerName: "AeroGamingDeals",
    reviewText: "Key activated on Steam globally with zero region lock issues. The 48-hour escrow protection gave me total peace of mind. Released funds immediately after verification.",
    helpfulCount: 9,
    productCategory: "keys",
  },
  {
    id: "rev-3",
    author: "TarikFanNA",
    avatarUrl: "",
    rating: 5,
    date: "3 days ago",
    verifiedPurchase: "CS2 Prime 10-Yr Coin Medal",
    sellerName: "AeroGamingDeals",
    reviewText: "Clean FaceIT unlinked account, verified original owner credentials. Passed all Riot and Valve telemetry checks cleanly without any HWID flags.",
    helpfulCount: 19,
    productCategory: "accounts",
  },
  {
    id: "rev-4",
    author: "Aiden_Tech",
    avatarUrl: "",
    rating: 5,
    date: "5 days ago",
    verifiedPurchase: "Steam Wallet $100 USD Gift Card",
    sellerName: "AeroGamingDeals",
    reviewText: "Direct digital code reveal worked smoothly in my Steam client. Added $100 balance immediately with zero surcharge fees. Super reliable merchant.",
    helpfulCount: 6,
    productCategory: "gift-cards",
  },
  {
    id: "rev-5",
    author: "Sarah_Jenkins",
    avatarUrl: "",
    rating: 5,
    date: "1 week ago",
    verifiedPurchase: "World of Warcraft Gold Reserve (5M Gold)",
    sellerName: "AeroGamingDeals",
    reviewText: "Guild bank invite was sent within 8 minutes. Smooth handover, full 5M gold deposited safely without triggering Blizzard auction house flags.",
    helpfulCount: 11,
    productCategory: "currency",
  },
  {
    id: "rev-6",
    author: "Niamh_R",
    avatarUrl: "",
    rating: 5,
    date: "1 week ago",
    verifiedPurchase: "Elden Ring: Shadow of the Erdtree Edition (Steam)",
    sellerName: "AeroGamingDeals",
    reviewText: "Redeemed the Erdtree edition key before the inspection timer even reached 44 hours. Region-free as listed, activation straight into my own library. Released the escrow same evening.",
    helpfulCount: 13,
    productCategory: "keys",
  },
  {
    id: "rev-7",
    author: "DennyCreates",
    avatarUrl: "",
    rating: 5,
    date: "2 weeks ago",
    verifiedPurchase: "YouTube Gaming Channel 142k Subs (YPP Active)",
    sellerName: "AeroGamingDeals",
    reviewText: "Channel transfer was handled exactly the way the listing promised: email swap first, then brand-account invite, monetization left untouched with zero strikes. Nearly two weeks on, YPP earnings still flowing to my AdSense.",
    helpfulCount: 17,
    productCategory: "social",
  },
  {
    id: "rev-8",
    author: "Wraith_Main",
    avatarUrl: "",
    rating: 5,
    date: "10 days ago",
    verifiedPurchase: "Apex Predator S18 (3 Heirlooms)",
    sellerName: "AeroGamingDeals",
    reviewText: "Predator account with both heirloom sets intact. EA Origin email was a fresh original creation, unlinked from every previous device. Escrow so worth it for a purchase this size.",
    helpfulCount: 8,
    productCategory: "accounts",
  },
  {
    id: "rev-9",
    author: "JJ_Wattson",
    avatarUrl: "",
    rating: 4,
    date: "2 weeks ago",
    verifiedPurchase: "CS2 Prime 10-Yr Coin (FaceIT Ready)",
    sellerName: "AeroGamingDeals",
    reviewText: "Four stars only because the handover took 40 minutes longer than the instant tag promised. Everything else flawless: clean VAC record, service medal as shown, FaceIT unlinked. Escrow officer even checked in mid-inspection.",
    helpfulCount: 6,
    productCategory: "accounts",
  },
  {
    id: "rev-10",
    author: "Priya_Runs",
    avatarUrl: "",
    rating: 5,
    date: "2 weeks ago",
    verifiedPurchase: "WoW Gold 5M (NA Area 52)",
    sellerName: "AeroGamingDeals",
    reviewText: "Second gold reserve order from this merchant. Quiet delivery through a guild bank invite as described, no auction house flags, no mail spam. The 48-hour window is what makes me return.",
    helpfulCount: 5,
    productCategory: "currency",
  },
  {
    id: "rev-11",
    author: "budgetbuilds",
    avatarUrl: "",
    rating: 5,
    date: "3 weeks ago",
    verifiedPurchase: "Steam Wallet $100 Card",
    sellerName: "AeroGamingDeals",
    reviewText: "Code revealed in the vault, added exactly $100.00 with no region lock and no surcharge. Held in escrow until I confirmed the balance landed. Buying gift cards through escrow sounds odd until you try it once.",
    helpfulCount: 6,
    productCategory: "gift-cards",
  },
  {
    id: "rev-12",
    author: "lurk_and_cleared",
    avatarUrl: "",
    rating: 5,
    date: "3 weeks ago",
    verifiedPurchase: "Valorant Champions 2023 Vandal + Prime Karambit",
    sellerName: "AeroGamingDeals",
    reviewText: "Radiant peak account, level 148, both bundles exactly the chromas shown in the inspection record. Original email included with creation date proof. Released funds within a day.",
    helpfulCount: 12,
    productCategory: "accounts",
  },
];

export const SEED_THREADS: SeedThread[] = [
  {
    id: "thread-1",
    sellerName: "AeroGamingDeals",
    sellerTag: "SELLER",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    buyerName: "Alex Mercer",
    buyerTag: "BUYER",
    buyerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    buyerEmail: "alex.mercer@gmail.com",
    buyerRating: 4.98,
    buyerDealCount: "14 deals",
    buyerVerified: true,
    buyerLevel: "Verified Buyer • Tier 1",
    isOnline: true,
    isVerified: true,
    time: "2:16 PM",
    orderNumber: "#SF-2024-88492",
    itemTitle: "Valorant Immortal 3",
    lastMessage: "Preparing the vault handover credentials right now.",
    unreadCount: 1,
    badgeText: "Instant Delivery SLA",
    type: "active",
    rating: 4.98,
    dealCount: "1.4k deals",
    sellerLevel: "Lvl 3 Merchant",
    slaSpeed: "Typical reply < 3 mins",
    orderPrice: 195.0,
    orderImage:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    orderPlatform: "Riot Games • NA",
    orderSubtext: "Peak Immortal 3 • Kuronami Knife",
    orderStatus: "inspection",
    credentials: {
      login: "alex_valorant_immortal",
      email: "alex.og.creation@protonmail.com",
      pass: "V4lorant#Immortal2024!",
      pin: "4920",
      token: "OGE-TOKEN-88492-X9",
    },
    securityChecks: {
      ogeEmail: "ProtonMail",
      twoFactor: "Verified Yes",
      hwidStatus: "Clean Passed",
    },
    messages: [
      {
        id: "msg-sys-1",
        sender: "system",
        systemTitle: "Payment Held in Escrow",
        systemSub: "Payment of $195.00 USD verified and held safely in Safedeal Escrow. 48-hour delivery countdown started.",
        time: "2:14 PM",
      },
      {
        id: "msg-1",
        sender: "buyer",
        text: "Hey! Just paid. Looking forward to the account. Does this include the original Kuronami knife skin variant upgrades?",
        time: "2:15 PM",
      },
      {
        id: "msg-2",
        sender: "seller",
        text: "Hello Alex! Yes, absolutely. Level 4 fully upgraded with purple & white chromas unlocked. Preparing the vault handover credentials right now.",
        time: "2:16 PM",
      },
      {
        id: "msg-sys-2",
        sender: "system",
        systemTitle: "Digital Vault Handover Ready",
        systemSub: "Credentials encrypted with buyer public key",
        time: "2:17 PM",
        hasVaultAction: true,
      },
    ],
  },
  {
    id: "thread-2",
    sellerName: "AeroGamingDeals",
    sellerTag: "MERCHANT",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    buyerName: "David Zhao",
    buyerTag: "VIP BUYER",
    buyerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    buyerEmail: "david.zhao@outlook.com",
    buyerRating: 5.0,
    buyerDealCount: "28 deals",
    buyerVerified: true,
    buyerLevel: "VIP Buyer • 100% On-Time",
    isOnline: false,
    isVerified: true,
    time: "Yesterday",
    orderNumber: "#SF-2024-88519",
    itemTitle: "Cyberpunk 2077 Key",
    lastMessage: "Thank you for your purchase! Key was auto-dispatched.",
    type: "archived",
    rating: 4.98,
    dealCount: "3.8k deals",
    sellerLevel: "Lvl 3 Merchant",
    slaSpeed: "Instant Key API",
    orderPrice: 26.8,
    orderImage:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=800&auto=format&fit=crop",
    orderPlatform: "Steam • Global",
    orderSubtext: "Phantom Liberty Full DLC",
    orderStatus: "completed",
    credentials: {
      login: "STEAM-CDKEY",
      email: "N/A",
      pass: "CP77-PL-4928-VX81-0042",
      pin: "0000",
      token: "STEAM-GLOBAL-KEY",
    },
    securityChecks: {
      ogeEmail: "Direct Publisher Key",
      twoFactor: "Region Free",
      hwidStatus: "Permanent Activation",
    },
    messages: [
      {
        id: "msg-t2-1",
        sender: "system",
        systemTitle: "Instant Key Dispatched",
        systemSub: "License key generated via automated Steam vault API.",
        time: "Yesterday, 4:10 PM",
      },
      {
        id: "msg-t2-2",
        sender: "seller",
        text: "Thank you for your purchase! Key was auto-dispatched. Redeemed on Steam client.",
        time: "Yesterday, 4:11 PM",
      },
    ],
  },
  {
    id: "thread-3",
    sellerName: "AeroGamingDeals",
    sellerTag: "SELLER",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    buyerName: "Elena Rostova",
    buyerTag: "BUYER",
    buyerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    buyerEmail: "elena.rostova@proton.me",
    buyerRating: 4.92,
    buyerDealCount: "9 deals",
    buyerVerified: true,
    buyerLevel: "Verified Escrow User",
    isOnline: true,
    isVerified: true,
    isStaff: false,
    time: "Oct 22",
    orderNumber: "DSP-1092",
    itemTitle: "Evidence Review",
    lastMessage: "Our arbitrator has received your screenshot evidence.",
    type: "active",
    rating: 4.98,
    dealCount: "3.8k deals",
    sellerLevel: "Lvl 3 Merchant",
    slaSpeed: "Mediation Active",
    orderPrice: 65.0,
    orderImage:
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=800&auto=format&fit=crop",
    orderPlatform: "Case DSP-1092",
    orderSubtext: "Resolution SLA: 24h Remaining",
    orderStatus: "disputed",
    credentials: {
      login: "CASE-DISPUTE-HOLD",
      email: "dispute-records@safedeal.com",
      pass: "HOLD-IN-ARBITRATION",
      pin: "9911",
      token: "DSP-1092-PROOF",
    },
    securityChecks: {
      ogeEmail: "Frozen in Escrow",
      twoFactor: "Arbitrator Review",
      hwidStatus: "Under Verification",
    },
    messages: [
      {
        id: "msg-t3-1",
        sender: "system",
        systemTitle: "Arbitration Case DSP-1092 Opened",
        systemSub: "Escrow clock paused pending inspection evidence submission.",
        time: "Oct 22, 10:00 AM",
      },
      {
        id: "msg-t3-2",
        sender: "seller",
        text: "Our arbitrator has received your screenshot evidence. We are cross-referencing login telemetry with Riot Games server logs.",
        time: "Oct 22, 11:24 AM",
      },
    ],
  },
];

export const SEED_ADMIN_OVERVIEW: SeedAdminOverview = {
  activeDisputes: 1,
  totalVolume: 428900.0,
  escrowLockedVolume: 38450.0,
  avgResolutionHours: 4.2,
  kycPendingCount: 4,
  criticalAlerts: 1,
  platformHealth: "Operational (US-EAST-1)",
};
