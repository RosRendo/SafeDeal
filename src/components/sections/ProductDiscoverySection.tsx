"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ProductItem } from "@/types/marketplace";
import {
  SlidersHorizontal,
  Zap,
  Star,
  ShieldCheck,
  Eye,
  Heart,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react";

interface ProductDiscoverySectionProps {
  products: ProductItem[];
  onBuy: (product: ProductItem) => void;
  onQuickView: (product: ProductItem) => void;
  wishlist: Record<string, boolean>;
  onToggleWishlist: (id: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Types" },
  { id: "accounts", label: "Accounts" },
  { id: "keys", label: "Steam & Epic Keys" },
  { id: "currency", label: "Gold & Currency" },
  { id: "social", label: "Social Assets" },
  { id: "gift-cards", label: "Gift Cards" },
  { id: "software", label: "Software" },
];

const BUDGET_OPTIONS = [
  { id: "all", label: "Any Budget", min: 0, max: 9999 },
  { id: "under15", label: "Under $15", min: 0, max: 15 },
  { id: "15to50", label: "$15 – $50", min: 15, max: 50 },
  { id: "50to150", label: "$50 – $150", min: 50, max: 150 },
  { id: "over150", label: "$150+", min: 150, max: 9999 },
];

export default function ProductDiscoverySection({
  products,
  onBuy,
  onQuickView,
  wishlist,
  onToggleWishlist,
}: ProductDiscoverySectionProps) {
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [budgetTier, setBudgetTier] = useState<string>("all");
  const [instantOnly, setInstantOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  // Reset filters
  const handleReset = () => {
    setSelectedCategory("all");
    setBudgetTier("all");
    setInstantOnly(false);
    setSortBy("featured");
  };

  // Filtered & Sorted items
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Budget filter
    const activeBudget = BUDGET_OPTIONS.find((b) => b.id === budgetTier);
    if (activeBudget && activeBudget.id !== "all") {
      result = result.filter(
        (p) => p.price >= activeBudget.min && p.price <= activeBudget.max
      );
    }

    // Instant filter
    if (instantOnly) {
      result = result.filter((p) => p.deliveryType === "instant");
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result.slice(0, 8);
  }, [products, selectedCategory, budgetTier, instantOnly, sortBy]);

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      {/* Minimalist Section Header with Line Separator */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex-shrink-0">
          Filter by Budget & Need
        </h2>

        <div className="section-header-line" />

        <button
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 flex-shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Control Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-clean-sm p-5 sm:p-6 mb-8 space-y-5">
        {/* Row 1: Categories */}
        <div>
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Select Category
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-clean-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Budget + Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block">
              Budget Target
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {BUDGET_OPTIONS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBudgetTier(b.id)}
                  className={`px-3 py-1.2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    budgetTier === b.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Instant Delivery Checkbox */}
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={instantOnly}
                onChange={(e) => setInstantOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Instant Bot Only</span>
              </span>
            </label>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Lowest Price</option>
                <option value="price-desc">Highest Price</option>
                <option value="rating">Top Rated Seller</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-600">
          Showing <span className="text-blue-600 font-extrabold">{filteredProducts.length}</span> live matching verified listings
        </span>
      </div>

      {/* Live Filtered Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <p className="text-sm font-bold text-slate-700">No products match this specific filter.</p>
          <button
            onClick={handleReset}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => {
            const isFav = wishlist[product.id] || false;
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-clean-sm hover:shadow-clean-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Image showcase */}
                  <div className="relative aspect-video rounded-t-2xl overflow-hidden bg-slate-100">
                    <Link href={`/listing/${product.id}`} className="block w-full h-full">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Wishlist toggle */}
                    <button
                      onClick={() => onToggleWishlist(product.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-clean-xs cursor-pointer z-10"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "text-rose-600 fill-rose-600" : ""}`} />
                    </button>

                    {/* Delivery Chip */}
                    {product.deliveryType === "instant" && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/90 text-emerald-400 text-[11px] font-bold z-10">
                        <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                        <span>Instant</span>
                      </div>
                    )}

                    {/* Spec Pill */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[11px] font-medium backdrop-blur-sm z-10">
                      {product.platform}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <Link href={`/listing/${product.id}`} className="block">
                      <h3
                        className="font-headline text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors"
                      >
                        {product.title}
                      </h3>
                    </Link>

                    {/* Seller row */}
                    <div className="flex items-center justify-between text-[12px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                        {typeof product.seller === "string" ? product.seller : product.seller?.name || "Verified Merchant"}
                      </span>
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {typeof product.seller?.rating === "number" ? product.seller.rating.toFixed(2) : (typeof product.rating === "number" ? product.rating.toFixed(2) : "5.00")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Price & Buttons */}
                <div className="p-4 pt-0">
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-slate-400 block">
                        Escrow Price
                      </span>
                      <span className="font-headline text-lg font-extrabold text-slate-900">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onQuickView(product)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onBuy(product)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-clean-xs transition-colors cursor-pointer"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
