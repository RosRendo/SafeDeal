"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { ALL_CATALOG_LISTINGS, CatalogListingItem } from "@/lib/catalogData";
import {
  getWishlistIds,
  removeWishlistItem,
  clearWishlist,
} from "@/lib/wishlistStorage";
import {
  Heart,
  ShieldCheck,
  Zap,
  Star,
  ChevronRight,
  ArrowRight,
  Trash2,
  SlidersHorizontal,
  Search,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Layers,
  Gamepad2,
  KeyRound,
  Coins,
  X,
} from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mounted, setMounted] = useState(false);

  // Sync wishlist from localStorage
  const refreshWishlist = () => {
    setWishlistIds(getWishlistIds());
  };

  useEffect(() => {
    setMounted(true);
    refreshWishlist();

    const handleUpdate = () => {
      refreshWishlist();
    };
    window.addEventListener("escrow_wishlist_updated", handleUpdate);
    return () => window.removeEventListener("escrow_wishlist_updated", handleUpdate);
  }, []);

  // Filter listings matching wishlist
  const savedItems = useMemo(() => {
    if (!mounted) return [];
    return ALL_CATALOG_LISTINGS.filter((item) => wishlistIds.includes(item.id));
  }, [wishlistIds, mounted]);

  // Secondary filter by category & search query
  const filteredItems = useMemo(() => {
    return savedItems.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchPlatform = item.platform.toLowerCase().includes(q);
        const matchGame = item.game?.toLowerCase().includes(q) || false;
        const matchSeller = item.seller.name.toLowerCase().includes(q);
        const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchTitle && !matchPlatform && !matchGame && !matchSeller && !matchTag) {
          return false;
        }
      }
      return true;
    });
  }, [savedItems, selectedCategory, searchQuery]);

  // Summary Metrics
  const totalValue = useMemo(() => {
    return savedItems.reduce((acc, item) => acc + item.price, 0);
  }, [savedItems]);

  const instantDeliveryCount = useMemo(() => {
    return savedItems.filter((item) => item.deliveryType === "instant").length;
  }, [savedItems]);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeWishlistItem(id);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your saved watchlist?")) {
      clearWishlist();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-600/10 selection:text-blue-600">
      <Header
        activeCategory="wishlist"
        onSelectCategory={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProtectionModal={() => router.push("/protection")}
        wishlistCount={wishlistIds.length}
      />

      <main className="w-full pt-[102px] sm:pt-[106px] flex-1 flex flex-col">
        {/* Hero Section with Gaming Backdrop */}
        <div className="w-full bg-slate-950 text-white py-12 sm:py-16 relative overflow-hidden border-b border-slate-800">
          {/* Real Downloaded Gaming Poster Background Layer */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src="/images/backgrounds/cyberpunk-city-bg.jpg"
              alt="Saved Wishlist Gaming Background"
              className="w-full h-full object-cover object-center opacity-45 scale-105"
            />
            {/* Directional scrim: darker on left for text legibility, atmospheric on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
          </div>

          <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Marketplace
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white">Saved Watchlist</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Heading, Subhead */}
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30 backdrop-blur-md">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <span>Price Drop Alerts & Escrow Tracking</span>
                </div>
                <h1 className="font-headline text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  Saved Wishlist
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-xl">
                  Track live price movements, instant automated dispatch availability, and escrow
                  protection status for your saved game accounts, keys, and currency.
                </p>
              </div>

              {/* Right Column: Watchlist Summary HUD Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Watchlist Portfolio
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                      {savedItems.length} {savedItems.length === 1 ? "Item" : "Items"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Est. Portfolio Value
                      </span>
                      <span className="font-headline text-xl sm:text-2xl font-black text-white">
                        ${totalValue.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Instant Delivery
                      </span>
                      <span className="font-headline text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1">
                        <Zap className="w-4 h-4 fill-emerald-400" />
                        {instantDeliveryCount} Ready
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Every saved deal includes 48-Hour Escrow Custody</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Content Area */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-clean-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {[
                { id: "all", label: "All Items" },
                { id: "accounts", label: "Accounts" },
                { id: "keys", label: "Keys" },
                { id: "currency", label: "Currency" },
                { id: "gift-cards", label: "Cards" },
                { id: "social", label: "Social" },
                { id: "software", label: "Software" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white shadow-clean-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Actions: Search & Clear All */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center h-9 bg-slate-100 rounded-xl px-3 border border-slate-200 focus-within:bg-white focus-within:border-blue-500 transition-all text-xs flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in saved..."
                  className="w-full bg-transparent border-0 outline-none text-slate-900 placeholder:text-slate-400 text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {savedItems.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors cursor-pointer flex-shrink-0"
                  title="Clear entire wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid or Empty State */}
          {savedItems.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-200/80 shadow-clean-sm max-w-2xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto mb-4 shadow-clean-xs">
                <Heart className="w-8 h-8" />
              </div>
              <h2 className="font-headline text-2xl font-black text-slate-900 mb-2">
                Your Saved Watchlist is Empty
              </h2>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                Click the heart icon on any high-rank game account, Steam key, or currency reserve
                to track its pricing and escrow availability in one place.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/browse"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-clean-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Marketplace</span>
                </Link>
                <Link
                  href="/browse?category=accounts"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                >
                  Valorant Accounts
                </Link>
                <Link
                  href="/browse?category=keys"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                >
                  Steam Keys
                </Link>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            /* Filter produced 0 matches */
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 shadow-clean-sm">
              <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="font-headline text-base font-bold text-slate-900 mb-1">
                No items match your filter criteria
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Try switching the category filter or clearing the search keyword.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Compact 3-Column Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
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

                      {/* Top Right Heart Wishlist Button - Clicking removes item */}
                      <button
                        onClick={(e) => handleRemove(item.id, e)}
                        aria-label="Remove from Watchlist"
                        title="Remove from saved"
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center transition-colors shadow-clean-xs cursor-pointer text-rose-500 hover:bg-rose-50"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
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
                      </div>
                    </div>

                    {/* Title & Category Info */}
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
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-clean-xs transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <span>Buy</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer
        onSelectCategory={() => router.push("/browse")}
        onOpenProtectionModal={() => router.push("/protection")}
      />
    </div>
  );
}
