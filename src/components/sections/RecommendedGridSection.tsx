"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ProductItem } from "@/types/marketplace";
import GridProductCard from "@/components/cards/GridProductCard";
import { ShieldCheck, SearchX } from "lucide-react";

interface RecommendedGridSectionProps {
  products: ProductItem[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onBuy: (product: ProductItem) => void;
  onOpenProtectionModal: () => void;
  onQuickView?: (product: ProductItem) => void;
  wishlist?: Record<string, boolean>;
  onToggleWishlist?: (id: string) => void;
}

export default function RecommendedGridSection({
  products,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onBuy,
  onOpenProtectionModal,
  onQuickView,
  wishlist = {},
  onToggleWishlist,
}: RecommendedGridSectionProps) {
  const tabs = [
    { id: "all", label: "All Items" },
    { id: "accounts", label: "Accounts" },
    { id: "keys", label: "Game Keys" },
    { id: "gift-cards", label: "Gift Cards" },
    { id: "currency", label: "Currency" },
    { id: "social", label: "Social" },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCat =
        activeCategory === "all" ||
        item.category === activeCategory ||
        (activeCategory === "gaming-accounts" && item.category === "accounts") ||
        (activeCategory === "game-keys-cdns" && item.category === "keys") ||
        (activeCategory === "in-game-currency" && item.category === "currency") ||
        (activeCategory === "social-media-assets" && item.category === "social");

      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof item.seller === "string" ? item.seller : item.seller?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <section
      id="recommended-section"
      className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full"
    >
      {/* Minimalist Section Header with Line Separator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex-shrink-0">
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Recommended Digital Listings
          </h2>
          {searchQuery && (
            <p className="text-xs text-slate-500 mt-0.5">
              Filtering results for &ldquo;
              <span className="font-semibold text-slate-900">{searchQuery}</span>
              &rdquo; ({filteredProducts.length} items found)
            </p>
          )}
        </div>

        <div className="section-header-line" />

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1 sm:pb-0 flex-shrink-0">
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-clean-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 max-w-xl mx-auto shadow-clean-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="font-headline text-base font-bold text-slate-900 mb-1">
            No matching listings found
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            We couldn&apos;t find verified goods matching &ldquo;{searchQuery}&rdquo;. Try
            clearing your search or selecting a different category.
          </p>
          <button
            onClick={() => onSelectCategory("all")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-clean-sm cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <GridProductCard
              key={product.id}
              product={product}
              onBuy={onBuy}
              onOpenProtectionModal={onOpenProtectionModal}
              onQuickView={onQuickView}
              isWishlisted={wishlist[product.id] || false}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </section>
  );
}
