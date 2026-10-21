"use client";

import React, { useMemo, useState, useEffect } from "react";
import { LISTINGS } from "@/lib/data";
import { Listing } from "@/types/marketplace";
import {
  ShieldCheck,
  Zap,
  Star,
  ShoppingBag,
  CheckCircle2,
  SearchX,
} from "lucide-react";

interface FeaturedListingsProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onBuyListing: (listing: Listing) => void;
  onOpenProtectionModal: () => void;
}

export default function FeaturedListings({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onBuyListing,
  onOpenProtectionModal,
}: FeaturedListingsProps) {
  const [allListings, setAllListings] = useState<Listing[]>(LISTINGS);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveListings() {
      try {
        const res = await fetch("/api/listings");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          if (isMounted) {
            setAllListings(json.data as Listing[]);
          }
        }
      } catch (e) {
        console.warn("Failed to load live listings for homepage, using catalog fallback", e);
      }
    }
    loadLiveListings();

    const handleUpdate = () => loadLiveListings();
    window.addEventListener("safedeal_listings_changed", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("safedeal_listings_changed", handleUpdate);
    };
  }, []);

  const tabs = [
    { id: "all", label: "All Deals" },
    { id: "accounts", label: "Accounts" },
    { id: "gift-cards", label: "Gift Cards" },
    { id: "keys", label: "Keys" },
    { id: "currency", label: "Gold & Currency" },
    { id: "social", label: "Social Media" },
  ];

  const filteredListings = useMemo(() => {
    return allListings.filter((item) => {
      const matchesCat =
        activeCategory === "all" ||
        item.category === activeCategory ||
        (activeCategory === "gaming-accounts" && item.category === "accounts") ||
        (activeCategory === "in-game-currency" && item.category === "currency") ||
        (activeCategory === "game-keys-cdns" && item.category === "keys") ||
        (activeCategory === "social-media-assets" && item.category === "social");

      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof item.seller === "string" ? item.seller : item.seller?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [allListings, activeCategory, searchQuery]);

  return (
    <section
      id="featured-listings"
      className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full"
    >
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded uppercase tracking-wider">
              Curated
            </span>
            <button
              onClick={onOpenProtectionModal}
              className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Protected Deals</span>
            </button>
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Featured Marketplace Listings
          </h2>
          {searchQuery && (
            <p className="text-xs text-slate-500 mt-1">
              Showing results for &ldquo;
              <span className="font-semibold text-slate-900">{searchQuery}</span>
              &rdquo; ({filteredListings.length} found)
            </p>
          )}
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1 sm:pb-0">
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

      {/* Grid of Listings */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 max-w-xl mx-auto shadow-clean-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="font-headline text-base font-bold text-slate-900 mb-1">
            No matching items found
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            We couldn&apos;t find verified listings matching &ldquo;{searchQuery}&rdquo;. Try
            clearing your search or browsing all categories.
          </p>
          <button
            onClick={() => onSelectCategory("all")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-clean-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-clean-sm hover:shadow-clean-lg transition-all duration-300 flex flex-col overflow-hidden border border-slate-200/80 hover:border-slate-300 group hover:-translate-y-0.5"
            >
              {/* Product Image & Badges */}
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Left Delivery Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-emerald-700 text-[12px] font-semibold shadow-clean-xs border border-white/50">
                  <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                  <span>{item.deliveryTimeText}</span>
                </div>

                {/* Top Right Protected Badge */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={onOpenProtectionModal}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-slate-700 text-[12px] font-semibold shadow-clean-xs border border-white/50 hover:bg-white"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Protected</span>
                  </button>
                </div>

                {/* Bottom Left Platform Badge */}
                <div className="absolute bottom-2.5 left-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-xs">
                    {item.platform} • {item.region}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-headline text-sm font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Seller Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">
                        {item.seller.avatarInitial}
                      </div>
                      <span className="font-semibold text-slate-800">
                        {item.seller.name}
                      </span>
                      {item.seller.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-slate-700 font-semibold text-xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{item.seller.rating.toFixed(2)}</span>
                      <span className="text-slate-400 font-normal text-[12px]">
                        ({item.seller.dealCount.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Buy Now */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    {item.originalPrice ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline text-lg font-extrabold text-slate-900">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ${item.originalPrice.toFixed(2)}
                          </span>
                        </div>
                        {item.discountPercent && (
                          <span className="text-[11px] font-bold text-emerald-600">
                            Save {item.discountPercent}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                          Escrow Price
                        </span>
                        <span className="font-headline text-lg font-extrabold text-slate-900">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onBuyListing(item)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-clean-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>Buy Now</span>
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
