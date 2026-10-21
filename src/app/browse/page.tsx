"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { ALL_CATALOG_LISTINGS, CatalogListingItem } from "@/lib/catalogData";
import { getCustomListings, CustomListing } from "@/lib/listingsStorage";
import { apiGetListings } from "@/lib/apiClient";
import { CATEGORY_ALIASES } from "@/lib/categoryMeta";
import { getWishlistIds, toggleWishlistItem } from "@/lib/wishlistStorage";
import {
  ShieldCheck,
  Zap,
  Star,
  ShoppingBag,
  Heart,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  X,
  Clock,
  CheckCircle2,
  Filter,
  Layers,
  Gamepad2,
  Coins,
  KeyRound,
  Sparkles,
  Terminal,
  Gift,
  Search,
  ExternalLink,
  BadgePercent,
  Check,
  Globe,
} from "lucide-react";

interface CategoryMeta {
  title: string;
  subtitle: string;
  pillLabel: string;
  breadcrumb: string;
  stats: { label: string; value: string }[];
  accent: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  all: {
    title: "All Marketplace Listings & Digital Assets",
    subtitle:
      "Explore over 120,000+ verified gaming accounts, instant activation keys, in-game currency reserves, and software licenses guarded by 48-hour escrow protection.",
    pillLabel: "All Items",
    breadcrumb: "All Categories",
    stats: [
      { label: "Active Listings", value: "120,450+" },
      { label: "Buyer Escrow Risk", value: "0.00%" },
      { label: "Avg Automated Handoff", value: "< 90s" },
    ],
    accent: "from-blue-600 to-indigo-700",
  },
  accounts: {
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
  },
  currency: {
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
  },
  keys: {
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
  },
  social: {
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
  },
  software: {
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
  },
  "gift-cards": {
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
  },
};

const CATEGORIES_LIST = [
  { id: "all", label: "All Items", icon: Layers },
  { id: "accounts", label: "Gaming Accounts", icon: Gamepad2 },
  { id: "currency", label: "In-Game Currency", icon: Coins },
  { id: "keys", label: "Game Keys & CDNs", icon: KeyRound },
  { id: "social", label: "Social & Creator", icon: Sparkles },
  { id: "software", label: "Software Licenses", icon: Terminal },
  { id: "gift-cards", label: "Gift Cards", icon: Gift },
];

function BrowseMarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-driven query, category, sort and instant delivery parameters (supporting ?cat= and ?category=)
  const rawCat = (searchParams.get("cat") || searchParams.get("category") || "all").toLowerCase().trim();
  const categoryParam = CATEGORY_ALIASES[rawCat] || rawCat;
  const queryParam = searchParams.get("q") || searchParams.get("query") || searchParams.get("search") || "";
  const sortParam = (searchParams.get("sort") as any) || "pop";
  const instantParam = searchParams.get("instant") === "true";

  const [activeCategory, setActiveCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);
  const [sortBy, setSortBy] = useState<"pop" | "price-asc" | "rating" | "fast" | "price-desc">(sortParam);
  const [instantDeliveryOnly, setInstantDeliveryOnly] = useState<boolean>(instantParam);

  // Sync state when URL params change
  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    setSortBy(sortParam);
  }, [sortParam]);

  useEffect(() => {
    setInstantDeliveryOnly(instantParam);
  }, [instantParam]);

  // Custom listings from local / in-memory storage
  const [customListings, setCustomListings] = useState<CustomListing[]>([]);

  useEffect(() => {
    const syncCustom = () => {
      setCustomListings(getCustomListings().filter((item) => item.status === "Active"));
    };
    syncCustom();
    window.addEventListener("safedeal_listings_changed", syncCustom);
    return () => window.removeEventListener("safedeal_listings_changed", syncCustom);
  }, []);

  // API Integrated Listings State with instant fallback
  const [apiListings, setApiListings] = useState<CatalogListingItem[] | null>(null);

  useEffect(() => {
    let active = true;
    apiGetListings({
      category: activeCategory,
      query: searchQuery,
      sort: sortBy,
      instant: instantDeliveryOnly,
    }).then((data) => {
      if (active && data && data.length > 0) {
        setApiListings(data);
      }
    });
    return () => {
      active = false;
    };
  }, [activeCategory, searchQuery, sortBy, instantDeliveryOnly]);

  // View mode: 'grid' vs 'table'
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Universal filters
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [minPrice, setMinPrice] = useState<number>(5);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Category-specific facet states
  // 1. Accounts
  const [selectedAccountGames, setSelectedAccountGames] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedRanks, setSelectedRanks] = useState<string[]>([]);
  const [skinTier, setSkinTier] = useState<string>("all");
  const [emailOnly, setEmailOnly] = useState(false);

  // 2. Keys
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedKeyRegions, setSelectedKeyRegions] = useState<string[]>([]);

  // 3. Currency
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedDeliveryMethods, setSelectedDeliveryMethods] = useState<string[]>([]);
  const [selectedCurrencyPlatforms, setSelectedCurrencyPlatforms] = useState<string[]>([]);
  const [selectedCurrencyRegions, setSelectedCurrencyRegions] = useState<string[]>([]);
  const [handFarmedOnly, setHandFarmedOnly] = useState<boolean>(false);
  const [taxCoveredOnly, setTaxCoveredOnly] = useState<boolean>(false);

  // 4. Gift Cards
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedDenominations, setSelectedDenominations] = useState<string[]>([]);

  // 5. Software
  const [selectedSoftwareTypes, setSelectedSoftwareTypes] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);

  // 6. Social
  const [selectedSocialPlatforms, setSelectedSocialPlatforms] = useState<string[]>([]);
  const [monetizedOnly, setMonetizedOnly] = useState(false);

  // Update URL on category change - resets search query so category browsing is clean
  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("query");
    params.delete("search");
    if (catId === "all") {
      params.delete("cat");
    } else {
      params.set("cat", catId);
    }
    const str = params.toString();
    router.push(str ? `/browse?${str}` : "/browse");
  };

  const handleSortChange = (newSort: "pop" | "price-asc" | "rating" | "fast" | "price-desc") => {
    setSortBy(newSort);
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "pop") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    const str = params.toString();
    router.replace(str ? `/browse?${str}` : "/browse", { scroll: false });
  };

  const handleInstantToggle = (checked: boolean) => {
    setInstantDeliveryOnly(checked);
    const params = new URLSearchParams(searchParams.toString());
    if (!checked) {
      params.delete("instant");
    } else {
      params.set("instant", "true");
    }
    const str = params.toString();
    router.replace(str ? `/browse?${str}` : "/browse", { scroll: false });
  };

  // Sync wishlist from shared persistent storage
  useEffect(() => {
    const syncWishlist = () => {
      const ids = getWishlistIds();
      const map: Record<string, boolean> = {};
      ids.forEach((id) => {
        map[id] = true;
      });
      setWishlist(map);
    };
    syncWishlist();
    window.addEventListener("escrow_wishlist_updated", syncWishlist);
    return () => window.removeEventListener("escrow_wishlist_updated", syncWishlist);
  }, []);

  // Toggle wishlist with persistence and cross-page synchronization
  const toggleWishlist = (id: string) => {
    toggleWishlistItem(id);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedAccountGames([]);
    setSelectedRegions([]);
    setSelectedRanks([]);
    setSkinTier("all");
    setEmailOnly(false);
    setSelectedPlatforms([]);
    setSelectedKeyRegions([]);
    setSelectedGames([]);
    setSelectedDeliveryMethods([]);
    setSelectedCurrencyPlatforms([]);
    setSelectedCurrencyRegions([]);
    setHandFarmedOnly(false);
    setTaxCoveredOnly(false);
    setSelectedBrands([]);
    setSelectedDenominations([]);
    setSelectedSoftwareTypes([]);
    setSelectedDurations([]);
    setSelectedSocialPlatforms([]);
    setMonetizedOnly(false);
    setInstantDeliveryOnly(false);
    setMaxPrice(600);
    setMinPrice(5);
    setSearchQuery("");
    setSortBy("pop");
    router.replace(activeCategory !== "all" ? `/browse?cat=${activeCategory}` : "/browse", { scroll: false });
  };

  // Active Category Metadata
  const currentMeta = CATEGORY_META[activeCategory] || CATEGORY_META.all;

  // Filtered & Sorted listings
  const filteredListings = useMemo(() => {
    // Map custom listings to CatalogListingItem
    const mappedCustom: CatalogListingItem[] = customListings.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.categoryKey === "gold" ? "currency" : c.categoryKey === "creator" ? "social" : c.categoryKey,
      price: c.price,
      image: c.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      imageAlt: c.imageAlt || c.title,
      platform: c.publisher || "Global",
      region: c.region || "Global",
      deliveryType: (c.isAutoDispatch ? "instant" : "fast") as "instant" | "fast" | "manual",
      deliveryTimeText: c.isAutoDispatch ? "Instant Automated" : "Under 2 Hours",
      seller: {
        id: "s-verified-merchant",
        name: "SafeDeal Merchant (You)",
        avatarInitial: "M",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        rating: 5.0,
        dealCount: 142,
        isVerified: true,
        tier: "VERIFIED",
        deliverySpeed: "Instant",
        reviewsCount: "142",
      },
      rating: 5.0,
      reviewsCount: 142,
      rank: (c.currentRank as any) || "Radiant",
      rankLevelText: c.peakRank ? `Peak ${c.peakRank}` : "Verified Custody",
      skinCount: c.skinTags?.length || 15,
      isEmailIncluded: c.fullAccess,
      isOnline: true,
      tags: c.skinTags?.map((s) => s.name) || ["Verified Custody", "Escrow Secured"],
      followers: c.followers,
      monetization: c.monetization,
    }));

    let result =
      apiListings && apiListings.length > 0
        ? [...mappedCustom, ...apiListings.filter((a) => !customListings.some((c) => c.id === a.id))]
        : [...mappedCustom, ...ALL_CATALOG_LISTINGS];

    // 1. Primary Category Filter
    if (activeCategory !== "all") {
      result = result.filter((item) => item.category === activeCategory);
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.seller.name.toLowerCase().includes(q) ||
          item.platform?.toLowerCase().includes(q) ||
          item.region?.toLowerCase().includes(q) ||
          item.game?.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.softwareType?.toLowerCase().includes(q) ||
          item.rank?.toLowerCase().includes(q) ||
          item.rankLevelText?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 3. Price range
    result = result.filter((item) => item.price >= minPrice && item.price <= maxPrice);

    // 4. Instant delivery filter
    if (instantDeliveryOnly) {
      result = result.filter((item) => item.deliveryType === "instant");
    }

    // 5. Category-Specific Facets
    if (activeCategory === "accounts" || activeCategory === "all") {
      if (selectedAccountGames.length > 0) {
        result = result.filter((item) =>
          selectedAccountGames.some((g) =>
            item.game?.toLowerCase().includes(g.toLowerCase()) ||
            item.title.toLowerCase().includes(g.toLowerCase())
          )
        );
      }
      if (selectedRanks.length > 0) {
        result = result.filter((item) => item.rank && selectedRanks.includes(item.rank));
      }
      if (selectedRegions.length > 0) {
        result = result.filter((item) =>
          selectedRegions.some((r) => item.region?.toLowerCase().includes(r.toLowerCase()))
        );
      }
      if (skinTier === "30+") {
        result = result.filter((item) => (item.skinCount || 0) >= 30);
      } else if (skinTier === "10-30") {
        result = result.filter((item) => (item.skinCount || 0) >= 10 && (item.skinCount || 0) <= 30);
      } else if (skinTier === "1-10") {
        result = result.filter((item) => (item.skinCount || 0) > 0 && (item.skinCount || 0) < 10);
      }
      if (emailOnly) {
        result = result.filter((item) => item.isEmailIncluded);
      }
    }

    if (activeCategory === "keys") {
      if (selectedPlatforms.length > 0) {
        result = result.filter((item) => item.platform && selectedPlatforms.includes(item.platform));
      }
      if (selectedKeyRegions.length > 0) {
        result = result.filter((item) =>
          selectedKeyRegions.some((r) => item.region?.toLowerCase().includes(r.toLowerCase()))
        );
      }
    }

    if (activeCategory === "currency") {
      if (selectedGames.length > 0) {
        result = result.filter((item) =>
          selectedGames.some((g) =>
            item.game?.toLowerCase().includes(g.toLowerCase()) ||
            item.title.toLowerCase().includes(g.toLowerCase())
          )
        );
      }
      if (selectedDeliveryMethods.length > 0) {
        result = result.filter((item) =>
          selectedDeliveryMethods.some((dm) =>
            item.deliveryMethod?.toLowerCase().includes(dm.toLowerCase()) ||
            item.title.toLowerCase().includes(dm.toLowerCase())
          )
        );
      }
      if (selectedCurrencyPlatforms.length > 0) {
        result = result.filter((item) =>
          selectedCurrencyPlatforms.some((p) =>
            item.platform?.toLowerCase().includes(p.toLowerCase()) ||
            item.title.toLowerCase().includes(p.toLowerCase())
          )
        );
      }
      if (selectedCurrencyRegions.length > 0) {
        result = result.filter((item) =>
          selectedCurrencyRegions.some((r) =>
            item.region?.toLowerCase().includes(r.toLowerCase()) ||
            item.title.toLowerCase().includes(r.toLowerCase())
          )
        );
      }
      if (handFarmedOnly) {
        result = result.filter((item) =>
          item.tags?.some((t) => t.toLowerCase().includes("hand") || t.toLowerCase().includes("farm")) ||
          item.title.toLowerCase().includes("hand")
        );
      }
      if (taxCoveredOnly) {
        result = result.filter((item) =>
          item.tags?.some((t) => t.toLowerCase().includes("tax") || t.toLowerCase().includes("safe")) ||
          item.title.toLowerCase().includes("tax")
        );
      }
    }

    if (activeCategory === "gift-cards") {
      if (selectedBrands.length > 0) {
        result = result.filter((item) => item.brand && selectedBrands.includes(item.brand));
      }
      if (selectedDenominations.length > 0) {
        result = result.filter((item) => item.denomination && selectedDenominations.includes(item.denomination));
      }
    }

    if (activeCategory === "software") {
      if (selectedSoftwareTypes.length > 0) {
        result = result.filter((item) => item.softwareType && selectedSoftwareTypes.includes(item.softwareType));
      }
      if (selectedDurations.length > 0) {
        result = result.filter(
          (item) => item.licenseDuration && selectedDurations.includes(item.licenseDuration)
        );
      }
    }

    if (activeCategory === "social") {
      if (selectedSocialPlatforms.length > 0) {
        result = result.filter((item) => item.platform && selectedSocialPlatforms.includes(item.platform));
      }
      if (monetizedOnly) {
        result = result.filter(
          (item) => item.monetization && item.monetization.toLowerCase().includes("active")
        );
      }
    }

    // 6. Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.seller.rating - a.seller.rating);
    } else if (sortBy === "fast") {
      result.sort((a) => (a.deliveryType === "instant" ? -1 : 1));
    }

    return result;
  }, [
    activeCategory,
    searchQuery,
    minPrice,
    maxPrice,
    instantDeliveryOnly,
    selectedAccountGames,
    selectedRanks,
    selectedRegions,
    skinTier,
    emailOnly,
    selectedPlatforms,
    selectedKeyRegions,
    selectedGames,
    selectedDeliveryMethods,
    selectedCurrencyPlatforms,
    selectedCurrencyRegions,
    handFarmedOnly,
    taxCoveredOnly,
    selectedBrands,
    selectedDenominations,
    selectedSoftwareTypes,
    selectedDurations,
    selectedSocialPlatforms,
    monetizedOnly,
    sortBy,
    customListings,
    apiListings,
  ]);

  // Contextual Sub-Category & Quick-Filter Pills cleanly split into two distinct visual tiers
  const renderContextualSubTags = () => {
    switch (activeCategory) {
      case "accounts":
        return (
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100/80">
            {/* Tier 1: Sub-Categories / Games */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Gamepad2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Sub-Categories:</span>
              </span>
              <button
                onClick={() => setSelectedAccountGames([])}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedAccountGames.length === 0
                    ? "bg-blue-600 text-white shadow-clean-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Accounts
              </button>
              {["Valorant", "Counter-Strike 2", "League of Legends", "Fortnite"].map((g) => {
                const isChecked = selectedAccountGames.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() =>
                      setSelectedAccountGames((prev) =>
                        isChecked ? prev.filter((x) => x !== g) : [...prev, g]
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isChecked
                        ? "bg-blue-600 text-white shadow-clean-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>{g}</span>
                  </button>
                );
              })}
            </div>

            {/* Tier 2: Quick Attribute Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Filters:</span>
              </span>
              <button
                onClick={() => setEmailOnly((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  emailOnly
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Original Email (OE)</span>
              </button>
              <button
                onClick={() => {
                  setSelectedRanks((prev) =>
                    prev.includes("Radiant") ? prev.filter((r) => r !== "Radiant") : [...prev, "Radiant"]
                  );
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedRanks.includes("Radiant")
                    ? "bg-blue-600 text-white border-blue-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Radiant Peak Rank</span>
              </button>
              <button
                onClick={() => handleInstantToggle(!instantDeliveryOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  instantDeliveryOnly
                    ? "bg-amber-600 text-white border-amber-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Instant Delivery</span>
              </button>
            </div>
          </div>
        );

      case "keys":
        return (
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100/80">
            {/* Tier 1: Sub-Categories / Platforms */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>DRM Platforms:</span>
              </span>
              <button
                onClick={() => setSelectedPlatforms([])}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedPlatforms.length === 0
                    ? "bg-indigo-600 text-white shadow-clean-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Platforms
              </button>
              {["Steam", "Epic Games", "EA App", "PlayStation Network (PSN)", "Xbox Digital Store"].map((plat) => {
                const isChecked = selectedPlatforms.includes(plat);
                return (
                  <button
                    key={plat}
                    onClick={() =>
                      setSelectedPlatforms((prev) =>
                        isChecked ? prev.filter((p) => p !== plat) : [...prev, plat]
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isChecked
                        ? "bg-indigo-600 text-white shadow-clean-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{plat}</span>
                  </button>
                );
              })}
            </div>

            {/* Tier 2: Quick Attribute Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Filters:</span>
              </span>
              <button
                onClick={() =>
                  setSelectedKeyRegions((prev) =>
                    prev.includes("Global") ? prev.filter((r) => r !== "Global") : [...prev, "Global"]
                  )
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedKeyRegions.includes("Global")
                    ? "bg-blue-600 text-white border-blue-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Global Region-Free</span>
              </button>
              <button
                onClick={() => handleInstantToggle(!instantDeliveryOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  instantDeliveryOnly
                    ? "bg-amber-600 text-white border-amber-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Instant Key Vault</span>
              </button>
            </div>
          </div>
        );

      case "currency":
        return (
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100/80">
            {/* Tier 1: Sub-Categories / Game Reserves */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Game Reserves:</span>
              </span>
              <button
                onClick={() => setSelectedGames([])}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGames.length === 0
                    ? "bg-amber-600 text-white shadow-clean-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Currencies
              </button>
              {[
                { id: "World of Warcraft", label: "WoW Gold", icon: Coins },
                { id: "Old School RuneScape", label: "OSRS / RS3 GP", icon: Coins },
                { id: "EA Sports FC 25", label: "FC 25 Coins (FUT)", icon: Coins },
                { id: "GTA V Online", label: "GTA V Cash", icon: Coins },
                { id: "Path of Exile", label: "PoE Divine Orbs", icon: Coins },
                { id: "Final Fantasy XIV", label: "FFXIV Gil", icon: Coins },
                { id: "Diablo IV", label: "Diablo IV Gold", icon: Coins },
                { id: "Roblox", label: "Robux", icon: Coins },
              ].map((game) => {
                const isChecked = selectedGames.includes(game.id);
                return (
                  <button
                    key={game.id}
                    onClick={() =>
                      setSelectedGames((prev) =>
                        isChecked ? prev.filter((g) => g !== game.id) : [...prev, game.id]
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isChecked
                        ? "bg-amber-600 text-white shadow-clean-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>{game.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tier 2: Quick Attribute Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Filters:</span>
              </span>
              <button
                onClick={() => handleInstantToggle(!instantDeliveryOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  instantDeliveryOnly
                    ? "bg-amber-600 text-white border-amber-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Instant (&lt; 15 mins)</span>
              </button>
              <button
                onClick={() => setHandFarmedOnly((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  handFarmedOnly
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Hand-Farmed</span>
              </button>
              <button
                onClick={() => setTaxCoveredOnly((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  taxCoveredOnly
                    ? "bg-blue-600 text-white border-blue-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <BadgePercent className="w-3.5 h-3.5" />
                <span>Auction Tax Covered</span>
              </button>
            </div>
          </div>
        );

      case "gift-cards":
        return (
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100/80">
            {/* Tier 1: Sub-Categories / Store Brands */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Gift className="w-3.5 h-3.5 text-cyan-600" />
                <span>Store Brands:</span>
              </span>
              <button
                onClick={() => setSelectedBrands([])}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedBrands.length === 0
                    ? "bg-cyan-600 text-white shadow-clean-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Brands
              </button>
              {["PlayStation Network", "Steam", "Apple", "Amazon", "Razer Gold"].map((b) => {
                const isChecked = selectedBrands.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() =>
                      setSelectedBrands((prev) =>
                        isChecked ? prev.filter((x) => x !== b) : [...prev, b]
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isChecked
                        ? "bg-cyan-600 text-white shadow-clean-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{b}</span>
                  </button>
                );
              })}
            </div>

            {/* Tier 2: Quick Attribute Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Filters:</span>
              </span>
              <button
                onClick={() => handleInstantToggle(!instantDeliveryOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  instantDeliveryOnly
                    ? "bg-amber-600 text-white border-amber-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Instant Code Unmask</span>
              </button>
              <button
                onClick={() => setMaxPrice((prev) => (prev === 50 ? 600 : 50))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  maxPrice === 50
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>Under $50 Vouchers</span>
              </button>
            </div>
          </div>
        );

      case "software":
        return (
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100/80">
            {/* Tier 1: Sub-Categories / Software Types */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                <span>Software Types:</span>
              </span>
              <button
                onClick={() => {
                  setSelectedSoftwareTypes([]);
                  setSelectedDurations([]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSoftwareTypes.length === 0 && selectedDurations.length === 0
                    ? "bg-emerald-600 text-white shadow-clean-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Software
              </button>
              {["Operating System", "Productivity", "VPN & Privacy"].map((st) => {
                const isChecked = selectedSoftwareTypes.includes(st);
                return (
                  <button
                    key={st}
                    onClick={() =>
                      setSelectedSoftwareTypes((prev) =>
                        isChecked ? prev.filter((x) => x !== st) : [...prev, st]
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isChecked
                        ? "bg-emerald-600 text-white shadow-clean-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>

            {/* Tier 2: Quick Attribute Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Quick Filters:</span>
              </span>
              <button
                onClick={() =>
                  setSelectedDurations((prev) =>
                    prev.includes("Lifetime") ? prev.filter((d) => d !== "Lifetime") : [...prev, "Lifetime"]
                  )
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedDurations.includes("Lifetime")
                    ? "bg-blue-600 text-white border-blue-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Lifetime Permanent License</span>
              </button>
              <button
                onClick={() => handleInstantToggle(!instantDeliveryOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  instantDeliveryOnly
                    ? "bg-amber-600 text-white border-amber-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Instant License Key</span>
              </button>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100/80">
            {/* Tier 1: Sub-Categories / Platforms */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Platforms:</span>
              </span>
              <button
                onClick={() => {
                  setSelectedSocialPlatforms([]);
                  setMonetizedOnly(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSocialPlatforms.length === 0 && !monetizedOnly
                    ? "bg-purple-600 text-white shadow-clean-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Assets
              </button>
              {["YouTube", "Instagram", "TikTok"].map((plat) => {
                const isChecked = selectedSocialPlatforms.includes(plat);
                return (
                  <button
                    key={plat}
                    onClick={() =>
                      setSelectedSocialPlatforms((prev) =>
                        isChecked ? prev.filter((p) => p !== plat) : [...prev, plat]
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isChecked
                        ? "bg-purple-600 text-white shadow-clean-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{plat}</span>
                  </button>
                );
              })}
            </div>

            {/* Tier 2: Quick Attribute Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Filters:</span>
              </span>
              <button
                onClick={() => setMonetizedOnly((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  monetizedOnly
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>YPP Monetized Only</span>
              </button>
            </div>
          </div>
        );

      default: // "all"
        return (
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100/80">
            {/* Tier 1: Sub-Categories / Marketplace Hubs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Marketplace Hubs:</span>
              </span>
              <button
                onClick={() => {
                  setInstantDeliveryOnly(false);
                  setSortBy("pop");
                  setMaxPrice(600);
                  setSearchQuery("");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  !instantDeliveryOnly && sortBy === "pop" && maxPrice === 600 && !searchQuery
                    ? "bg-blue-600 text-white shadow-clean-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All 120,000+ Items
              </button>
              {CATEGORIES_LIST.filter((c) => c.id !== "all").map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tier 2: Quick Attribute Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Filters:</span>
              </span>
              <button
                onClick={() => handleInstantToggle(!instantDeliveryOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  instantDeliveryOnly
                    ? "bg-amber-600 text-white border-amber-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Instant Delivery</span>
              </button>
              <button
                onClick={() => handleSortChange(sortBy === "rating" ? "pop" : "rating")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  sortBy === "rating"
                    ? "bg-blue-600 text-white border-blue-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Top Sellers (4.98+)</span>
              </button>
              <button
                onClick={() => setMaxPrice((prev) => (prev === 50 ? 600 : 50))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  maxPrice === 50
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-clean-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>Under $50</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-600/10 selection:text-blue-600">
      {/* Fixed Sticky Header */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProtectionModal={() => router.push("/protection")}
        wishlistCount={Object.values(wishlist).filter(Boolean).length}
      />

      {/* Main Content Area */}
      <main className="w-full pt-[102px] sm:pt-[106px] flex-1 flex flex-col">

        {/* Streamlined Category Discovery Ribbon */}
        <section className="w-full bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-2.5">
            {/* Top Row: Breadcrumb, Active Category, Count & Escrow Guarantee */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Marketplace
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <button
                  onClick={() => handleSelectCategory("all")}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Catalog
                </button>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-900 font-bold capitalize">
                  {CATEGORIES_LIST.find((c) => c.id === activeCategory)?.label || "All Items"}
                </span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[12px] font-bold">
                  {filteredListings.length} {filteredListings.length === 1 ? "Listing" : "Listings"}
                </span>
              </div>
            </div>

            {/* Contextual Sub-Category Tags & Quick Filters */}
            {renderContextualSubTags()}
          </div>
        </section>

        {/* Catalog Control Bar & Filter Facets */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
          {/* Controls Bar: Search, Count, Layout Mode & Sorters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-clean-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
              {/* In-Catalog Live Search Bar */}
              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, game, seller, rank, tags..."
                  className="w-full pl-8 pr-7 py-2 text-xs bg-slate-100 rounded-xl outline-none text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-slate-200 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">
                {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"}
              </span>

              {activeCategory !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  <span>Category: {currentMeta.pillLabel}</span>
                  <button
                    onClick={() => handleSelectCategory("all")}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Filters</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="pop">Most Popular / Trending</option>
                  <option value="fast">Fastest Delivery (Instant 0s)</option>
                  <option value="price-asc">Price: Lowest to Highest</option>
                  <option value="price-desc">Price: Highest to Lowest</option>
                  <option value="rating">Top Seller Rating (4.98+)</option>
                </select>
              </div>

              {/* View Switcher (Grid vs Table) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-clean-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  title="Compact List View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-clean-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Layout: Left Filter Facet Sidebar + Right Listings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Filter Sidebar */}
            <aside
              className={`lg:col-span-3 space-y-6 ${
                mobileFiltersOpen ? "block" : "hidden lg:block"
              }`}
            >
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-clean-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    <h2 className="font-headline text-sm font-bold text-slate-900">
                      Adaptive Filters
                    </h2>
                  </div>
                  <button
                    onClick={handleClearFilters}
                    className="text-[12px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Instant Delivery Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">Instant 0s Delivery</p>
                      <p className="text-[11px] text-slate-500">Bot automated handoff</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={instantDeliveryOnly}
                    onChange={(e) => handleInstantToggle(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* Price Range Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>Price Range</span>
                    <span className="text-blue-600 font-bold">${minPrice} — ${maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="600"
                    step="5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex items-center justify-between text-[12px] text-slate-400">
                    <span>$5</span>
                    <span>$600+</span>
                  </div>
                </div>

                {/* 1. Category Facet: Accounts */}
                {(activeCategory === "accounts" || activeCategory === "all") && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Game Universe
                      </h3>
                      <div className="space-y-1.5">
                        {["Valorant", "Counter-Strike 2", "League of Legends", "Fortnite"].map((g) => {
                          const isChecked = selectedAccountGames.includes(g);
                          return (
                            <label
                              key={g}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedAccountGames((prev) =>
                                    isChecked ? prev.filter((x) => x !== g) : [...prev, g]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{g}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Account Rank
                      </h3>
                      <div className="grid grid-cols-2 gap-1.5">
                        {["Radiant", "Immortal", "Ascendant", "Platinum"].map((r) => {
                          const isChecked = selectedRanks.includes(r);
                          return (
                            <button
                              key={r}
                              onClick={() => {
                                setSelectedRanks((prev) =>
                                  isChecked ? prev.filter((x) => x !== r) : [...prev, r]
                                );
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer flex items-center justify-between ${
                                isChecked
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <span>{r}</span>
                              {isChecked && <Check className="w-3 h-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Account Region
                      </h3>
                      <div className="space-y-1.5">
                        {["NA Region", "EU Region", "Latin America (LATAM)"].map((reg) => {
                          const isChecked = selectedRegions.includes(reg);
                          return (
                            <label
                              key={reg}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedRegions((prev) =>
                                    isChecked ? prev.filter((x) => x !== reg) : [...prev, reg]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{reg}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Weapon Skins Count
                      </h3>
                      <div className="space-y-1 text-xs text-slate-700">
                        {[
                          { id: "all", label: "Any skin count" },
                          { id: "30+", label: "30+ Weapon Skins" },
                          { id: "10-30", label: "10 - 30 Weapon Skins" },
                        ].map((st) => (
                          <label key={st.id} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                            <input
                              type="radio"
                              name="skinTier"
                              checked={skinTier === st.id}
                              onChange={() => setSkinTier(st.id)}
                              className="text-blue-600 cursor-pointer"
                            />
                            <span>{st.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailOnly}
                          onChange={(e) => setEmailOnly(e.target.checked)}
                          className="w-3.5 h-3.5 text-blue-600 rounded"
                        />
                        <span>Original Email (OE) Included</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 2. Category Facet: Keys */}
                {activeCategory === "keys" && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        DRM Platform
                      </h3>
                      <div className="space-y-1.5">
                        {["Steam", "Epic Games", "PlayStation Network (PSN)", "EA App", "Xbox Digital Store"].map((plat) => {
                          const isChecked = selectedPlatforms.includes(plat);
                          return (
                            <label
                              key={plat}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedPlatforms((prev) =>
                                    isChecked ? prev.filter((p) => p !== plat) : [...prev, plat]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{plat}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Activation Region
                      </h3>
                      <div className="space-y-1.5">
                        {["Global", "US / North America", "EU / Europe"].map((r) => {
                          const isChecked = selectedKeyRegions.includes(r);
                          return (
                            <label
                              key={r}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedKeyRegions((prev) =>
                                    isChecked ? prev.filter((x) => x !== r) : [...prev, r]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{r}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Category Facet: Currency */}
                {activeCategory === "currency" && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    {/* Game Universe */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Game Universe
                      </h3>
                      <div className="space-y-1.5">
                        {[
                          "World of Warcraft",
                          "Old School RuneScape",
                          "EA Sports FC 25",
                          "GTA V Online",
                          "Path of Exile",
                          "Final Fantasy XIV",
                          "Diablo IV",
                          "Roblox",
                        ].map((g) => {
                          const isChecked = selectedGames.includes(g);
                          return (
                            <label
                              key={g}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedGames((prev) =>
                                    isChecked ? prev.filter((x) => x !== g) : [...prev, g]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{g}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery & Safe Handover */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Delivery Method
                      </h3>
                      <div className="space-y-1.5">
                        {[
                          "Auction House Buyout",
                          "Guild Bank Deposit",
                          "In-Person Trade",
                          "Direct In-Game Mail",
                          "Comfort Trade",
                        ].map((dm) => {
                          const isChecked = selectedDeliveryMethods.includes(dm);
                          return (
                            <label
                              key={dm}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedDeliveryMethods((prev) =>
                                    isChecked ? prev.filter((x) => x !== dm) : [...prev, dm]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{dm}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Platform Ecosystem */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Platform
                      </h3>
                      <div className="space-y-1.5">
                        {["PC", "PlayStation", "Xbox", "Crossplay"].map((p) => {
                          const isChecked = selectedCurrencyPlatforms.includes(p);
                          return (
                            <label
                              key={p}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedCurrencyPlatforms((prev) =>
                                    isChecked ? prev.filter((x) => x !== p) : [...prev, p]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{p}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Server / Region */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Server Region
                      </h3>
                      <div className="space-y-1.5">
                        {["US / North America", "EU / Europe", "Global"].map((r) => {
                          const isChecked = selectedCurrencyRegions.includes(r);
                          return (
                            <label
                              key={r}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedCurrencyRegions((prev) =>
                                    isChecked ? prev.filter((x) => x !== r) : [...prev, r]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{r}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Farm & Trade Guarantees */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Security & Guarantees
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={handFarmedOnly}
                            onChange={(e) => setHandFarmedOnly(e.target.checked)}
                            className="w-3.5 h-3.5 text-emerald-600 rounded"
                          />
                          <span className="font-medium text-emerald-800">100% Hand-Farmed (No Bots)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={taxCoveredOnly}
                            onChange={(e) => setTaxCoveredOnly(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span>Auction Fee / Tax Covered</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Category Facet: Gift Cards */}
                {activeCategory === "gift-cards" && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Store & Brand
                      </h3>
                      <div className="space-y-1.5">
                        {["Steam", "Apple", "PlayStation Network", "Amazon", "Razer Gold"].map((b) => {
                          const isChecked = selectedBrands.includes(b);
                          return (
                            <label
                              key={b}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedBrands((prev) =>
                                    isChecked ? prev.filter((x) => x !== b) : [...prev, b]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{b}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Denomination / Value
                      </h3>
                      <div className="grid grid-cols-2 gap-1.5">
                        {["$25 USD", "$50 USD", "$100 USD"].map((den) => {
                          const isChecked = selectedDenominations.includes(den);
                          return (
                            <button
                              key={den}
                              onClick={() => {
                                setSelectedDenominations((prev) =>
                                  isChecked ? prev.filter((x) => x !== den) : [...prev, den]
                                );
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                                isChecked
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {den}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Category Facet: Software */}
                {activeCategory === "software" && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Software Type
                      </h3>
                      <div className="space-y-1.5">
                        {["Operating System", "VPN & Privacy", "Productivity"].map((st) => {
                          const isChecked = selectedSoftwareTypes.includes(st);
                          return (
                            <label
                              key={st}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedSoftwareTypes((prev) =>
                                    isChecked ? prev.filter((x) => x !== st) : [...prev, st]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{st}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        License Duration
                      </h3>
                      <div className="space-y-1.5">
                        {["Lifetime License", "1 Year Subscription"].map((dur) => {
                          const isChecked = selectedDurations.includes(dur);
                          return (
                            <label
                              key={dur}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedDurations((prev) =>
                                    isChecked ? prev.filter((x) => x !== dur) : [...prev, dur]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{dur}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Category Facet: Social */}
                {activeCategory === "social" && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Platform
                      </h3>
                      <div className="space-y-1.5">
                        {["YouTube", "TikTok"].map((p) => {
                          const isChecked = selectedSocialPlatforms.includes(p);
                          return (
                            <label
                              key={p}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedSocialPlatforms((prev) =>
                                    isChecked ? prev.filter((x) => x !== p) : [...prev, p]
                                  );
                                }}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span>{p}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={monetizedOnly}
                          onChange={(e) => setMonetizedOnly(e.target.checked)}
                          className="w-3.5 h-3.5 text-blue-600 rounded"
                        />
                        <span>Monetization Active (YPP/Rewards)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Escrow Vault Trust Box */}
              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span className="font-headline text-xs font-bold">Safedeal Escrow Vault</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Sellers do not receive payout until you log in, swap credentials, and affirm
                  full custody within 48 hours.
                </p>
                <Link
                  href="/protection"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold pt-1 cursor-pointer"
                >
                  <span>Read Escrow Protocol</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </aside>

            {/* Main Listings Grid */}
            <section className="lg:col-span-9 space-y-6">
              {filteredListings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-clean-sm">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <SlidersHorizontal className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-base font-bold text-slate-900 mb-1">
                    No listings match the selected filters
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                    Try loosening your filter parameters, switching categories, or clearing your search query.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-clean-sm cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "grid grid-cols-1 gap-3.5"
                  }
                >
                  {filteredListings.map((item) => {
                    const isWishlisted = !!wishlist[item.id];

                    if (viewMode === "table") {
                      // Compact List View
                      return (
                        <article
                          key={item.id}
                          className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-clean-xs hover:shadow-clean-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.imageAlt || item.title}
                                className="w-full h-full object-cover group-hover:scale-106 transition-transform"
                              />
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-slate-900/85 text-white text-[10px] font-bold">
                                {item.rank || item.platform || item.category}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                {item.region && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                                    {item.region}
                                  </span>
                                )}
                                {item.rankLevelText && (
                                  <span className="text-[11px] font-semibold text-slate-500">
                                    {item.rankLevelText}
                                  </span>
                                )}
                                {item.game && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">
                                    {item.game}
                                  </span>
                                )}
                                {item.brand && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                    {item.brand}
                                  </span>
                                )}
                                {item.softwareType && (
                                  <span className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 text-[10px] font-bold">
                                    {item.softwareType}
                                  </span>
                                )}
                                {item.followers && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">
                                    {item.followers}
                                  </span>
                                )}
                              </div>

                              <Link href={`/listing/${item.id}`}>
                                <h3 className="font-headline text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                                  {item.title}
                                </h3>
                              </Link>

                              <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1">
                                <span className="font-medium text-slate-700 text-[12px]">
                                  {item.seller.name}
                                </span>
                                <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[12px]">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  {item.seller.rating}
                                </span>
                                <span className="hidden md:inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                                  <Zap className="w-2.5 h-2.5 fill-emerald-600" />
                                  {item.deliveryTimeText || "Instant"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <div className="text-left sm:text-right">
                              <span className="font-headline text-base sm:text-lg font-black text-slate-900 block">
                                ${item.price.toFixed(2)}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-600 flex items-center sm:justify-end gap-0.5">
                                <ShieldCheck className="w-3 h-3" />
                                <span>48h Escrow</span>
                              </span>
                            </div>

                            <button
                              onClick={() => toggleWishlist(item.id)}
                              className={`p-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer ${
                                isWishlisted ? "text-rose-600 bg-rose-50" : "text-slate-400 hover:text-slate-600"
                              }`}
                              title="Wishlist"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-600" : ""}`} />
                            </button>

                            <Link
                              href={`/checkout?item=${item.id}`}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-clean-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            >
                              <span>Buy Now</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </article>
                      );
                    }

                    // Compact Grid Card Mode (3-Column Optimized)
                    return (
                      <article
                        key={item.id}
                        className="group bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-clean-xs hover:shadow-clean-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5"
                      >
                        <div className="space-y-2.5">
                          {/* Banner Image with Badges */}
                          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
                            <img
                              src={item.image}
                              alt={item.imageAlt || item.title}
                              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                            />

                            {/* Top Left Delivery Badge */}
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-emerald-700 text-[11px] font-bold shadow-clean-xs border border-white/60">
                              <Zap className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
                              <span>{item.deliveryTimeText || "Instant"}</span>
                            </div>

                            {/* Top Right Heart Wishlist Button */}
                            <button
                              onClick={() => toggleWishlist(item.id)}
                              aria-label="Add to Watchlist"
                              className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center transition-colors shadow-clean-xs cursor-pointer ${
                                isWishlisted
                                  ? "text-rose-600 bg-rose-50"
                                  : "text-slate-400 hover:text-rose-500"
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-600" : ""}`} />
                            </button>

                            {/* Spec Pills on image base */}
                            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 flex-wrap">
                              {item.region && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-900/85 text-white text-[10px] font-semibold backdrop-blur-xs">
                                  {item.region}
                                </span>
                              )}
                              {item.rankLevelText && (
                                <span className="px-1.5 py-0.5 rounded bg-white/90 text-slate-900 text-[10px] font-bold backdrop-blur-xs shadow-clean-xs">
                                  {item.rankLevelText}
                                </span>
                              )}
                              {item.game && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/90 text-white text-[10px] font-bold backdrop-blur-xs">
                                  {item.game}
                                </span>
                              )}
                              {item.denomination && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-bold backdrop-blur-xs">
                                  {item.denomination}
                                </span>
                              )}
                              {item.followers && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-600/90 text-white text-[10px] font-bold backdrop-blur-xs">
                                  {item.followers}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title & Tag Pills */}
                          <div>
                            <Link href={`/listing/${item.id}`}>
                              <h3 className="font-headline text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2 transition-colors leading-snug">
                                {item.title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                              {item.tags?.slice(0, 3).map((t, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Seller Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={item.seller.avatarUrl}
                                  alt={item.seller.name}
                                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                                />
                                {item.isOnline && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                                )}
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-1">
                                  <span className="text-[12px] font-bold text-slate-900 truncate">
                                    {item.seller.name}
                                  </span>
                                  {item.seller.isVerified && (
                                    <CheckCircle2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 flex-shrink-0">
                              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                              <span className="font-bold text-slate-800">{item.seller.rating}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Action Footer */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                              Escrow Price
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="font-headline text-base sm:text-lg font-black text-slate-900">
                                ${item.price.toFixed(2)}
                              </span>
                              {item.originalPrice && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            href={`/checkout?item=${item.id}`}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-clean-xs transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                          >
                            <span>Buy</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-clean-xs flex items-center justify-between mt-6">
                <span className="text-xs text-slate-500">
                  Showing 1 to {filteredListings.length} of {filteredListings.length} results
                </span>
                <nav className="flex items-center gap-1 text-xs font-semibold">
                  <button
                    disabled
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 bg-slate-50 cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white shadow-clean-xs">
                    1
                  </button>
                  <button
                    disabled
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 bg-slate-50 cursor-not-allowed"
                  >
                    ›
                  </button>
                </nav>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenProtectionModal={() => router.push("/protection")}
      />
    </div>
  );
}

function BrowseLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <div className="h-16 bg-white border-b border-slate-200" />
      <div className="max-w-[1280px] mx-auto px-4 py-8 w-full space-y-6">
        <div className="h-24 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 h-96 bg-slate-200/60 rounded-2xl animate-pulse" />
          <div className="lg:col-span-9 h-96 bg-slate-200/60 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function BrowseMarketplacePage() {
  return (
    <Suspense fallback={<BrowseLoadingSkeleton />}>
      <BrowseMarketplaceContent />
    </Suspense>
  );
}
