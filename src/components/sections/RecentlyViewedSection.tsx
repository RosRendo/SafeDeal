"use client";

import React from "react";
import { ProductItem } from "@/types/marketplace";
import { Clock, Eye, Trash2, Zap, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

interface RecentlyViewedSectionProps {
  items: ProductItem[];
  onClear: () => void;
  onBuy: (product: ProductItem) => void;
  onQuickView: (product: ProductItem) => void;
}

export default function RecentlyViewedSection({
  items,
  onClear,
  onBuy,
  onQuickView,
}: RecentlyViewedSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full border-t border-slate-200/60">
      {/* Minimalist Section Header with Line Separator */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-headline text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex-shrink-0">
          Recently Viewed
        </h2>

        <div className="section-header-line" />

        <button
          onClick={onClear}
          className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Horizontal Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {items.map((item) => {
          if (!item) return null;
          const sellerName =
            typeof item.seller === "string"
              ? item.seller
              : item.seller?.name || "Verified Merchant";
          const sellerRating =
            typeof item.seller === "object" && typeof item.seller?.rating === "number"
              ? item.seller.rating.toFixed(1)
              : typeof item.rating === "number"
              ? item.rating.toFixed(1)
              : "5.0";
          const priceDisplay =
            typeof item.price === "number" ? item.price.toFixed(2) : "0.00";

          return (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-slate-200/80 shadow-clean-xs hover:shadow-clean-sm transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Thumbnail */}
                <Link
                  href={`/listing/${item.id}`}
                  className="block relative aspect-video rounded-t-xl overflow-hidden bg-slate-100 cursor-pointer"
                >
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80"}
                    alt={item.title || "Listing item"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.deliveryType === "instant" && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/90 text-[10px] font-bold text-emerald-400">
                      Instant
                    </span>
                  )}
                </Link>

                {/* Title & Seller */}
                <div className="p-3 space-y-1">
                  <Link href={`/listing/${item.id}`} className="block">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-blue-600 cursor-pointer transition-colors">
                      {item.title || "Digital Asset"}
                    </h4>
                  </Link>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[80px]">{sellerName}</span>
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                      {sellerRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Buy Button */}
              <div className="p-3 pt-0">
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-headline text-sm font-extrabold text-slate-900">
                    ${priceDisplay}
                  </span>
                  <button
                    onClick={() => onBuy(item)}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
