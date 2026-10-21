export interface Seller {
  id: string;
  name: string;
  avatarInitial: string;
  avatarUrl: string;
  rating: number;
  dealCount: number;
  isVerified: boolean;
  tier: "PRO" | "VIP" | "API" | "VERIFIED";
  deliverySpeed: string;
  reviewsCount?: string;
}

export interface ProductItem {
  id: string;
  title: string;
  category: "accounts" | "currency" | "keys" | "social" | "software" | "gift-cards";
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  imageAlt: string;
  platform: string;
  region: string;
  deliveryType: "instant" | "fast" | "manual";
  deliveryTimeText: string;
  seller: Seller;
  rating: number;
  reviewsCount: number;
  soldCount?: number;
  isHot?: boolean;
  isFeaturedDeal?: boolean;
  stockLeft?: number;
  totalStock?: number;
  claimedPercent?: number;
  tags?: string[];
  description?: string;
  listedTimeAgo?: string;
}

export interface CategoryTileData {
  id: string;
  title: string;
  subtitle: string;
  count: string;
  badge: string;
  image: string;
  accentColor: string;
  slug: string;
}

export interface FeaturedSellerData {
  id: string;
  name: string;
  avatarUrl: string;
  tier: "PRO" | "VIP" | "API" | "VERIFIED";
  ratingPercent: number;
  reviewCount: string;
  deliverySpeed: string;
  totalOrders: string;
  activeListingsCount: number;
  topProducts: {
    id: string;
    title: string;
    price: number;
    image: string;
  }[];
}

export interface LiveTickerItem {
  buyer: string;
  item: string;
  price: string;
  time: string;
}

export type Listing = ProductItem;

export interface RecentTrade {
  id: string;
  item: string;
  buyer: string;
  timeAgo: string;
  price: string;
  icon: string;
  iconBgColor?: string;
  iconTextColor?: string;
}

export interface Merchant {
  id: string;
  name: string;
  title: string;
  badge: string;
  avatarUrl: string;
  rating: number;
  reviewsCount: string;
  deliverySpeed: string;
  totalTrades: string;
  tier: string;
  tierBg: string;
  tierColor: string;
}

export interface CuratedCollection {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  itemCount: string;
  image: string;
  accentGradient: string;
  featuredItems: { name: string; price: string }[];
  badgeColor: string;
  slug: string;
}

export interface SellerOffer {
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  rating: number;
  tradesCount: string;
  isVerified: boolean;
  tier: string;
  price: number;
  originalPrice?: number;
  deliveryType: string;
  deliveryTime: string;
  warranty: string;
  badge?: string;
  inStock: boolean;
}

export interface OfferComparisonProduct {
  id: string;
  title: string;
  category: string;
  platform: string;
  region: string;
  image: string;
  description: string;
  basePrice: number;
  offers: SellerOffer[];
}

export interface CustomerReview {
  id: string;
  author: string;
  avatarUrl: string;
  rating: number;
  date: string;
  verifiedPurchase: string;
  sellerName: string;
  reviewText: string;
  helpfulCount: number;
  productCategory: string;
}


