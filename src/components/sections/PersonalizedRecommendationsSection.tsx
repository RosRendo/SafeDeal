"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductItem } from "@/types/marketplace";
import {
  Sparkles,
  RefreshCw,
  Zap,
  Star,
  Eye,
  Heart,
  ShieldCheck,
  Tag,
} from "lucide-react";

interface PersonalizedRecommendationsSectionProps {
  products: ProductItem[];
  userInterestCategory: string;
  onBuy: (product: ProductItem) => void;
  onQuickView: (product: ProductItem) => void;
  wishlist: Record<string, boolean>;
  onToggleWishlist: (id: string) => void;
}

export default function PersonalizedRecommendationsSection({
  products,
  userInterestCategory,
  onBuy,
  onQuickView,
  wishlist,
  onToggleWishlist,
}: PersonalizedRecommendationsSectionProps) {
  const [shuffleKey, setShuffleKey] = useState(0);

  // Filter or prioritize based on user preference
  const recommendedItems = React.useMemo(() => {
    let pool = [...products];
    if (userInterestCategory && userInterestCategory !== "all") {
      const preferred = pool.filter((p) => p.category === userInterestCategory);
      const others = pool.filter((p) => p.category !== userInterestCategory);
      pool = [...preferred, ...others];
    }
    // Rotate slightly if shuffle key changes
    if (shuffleKey > 0) {
      pool = [...pool.slice(shuffleKey % pool.length), ...pool.slice(0, shuffleKey % pool.length)];
    }
    return pool.slice(0, 4);
  }, [products, userInterestCategory, shuffleKey]);

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      {/* Minimalist Section Header with Line Separator */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex-shrink-0">
          Recommended For You
        </h2>

        <div className="section-header-line" />

        <button
          onClick={() => setShuffleKey((prev) => prev + 1)}
          className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors flex-shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Picks</span>
        </button>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {recommendedItems.map((product) => {
          const isFav = wishlist[product.id] || false;

          return (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-clean-sm hover:shadow-clean-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Image */}
                <Link
                  href={`/listing/${product.id}`}
                  className="block relative aspect-video rounded-t-2xl overflow-hidden bg-slate-100"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Affinity Pill */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 text-purple-300 text-[11px] font-bold backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>98% Match</span>
                  </div>

                  {/* Wishlist toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-clean-xs cursor-pointer z-10"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "text-rose-600 fill-rose-600" : ""}`} />
                  </button>

                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[11px] font-medium backdrop-blur-sm">
                    {product.platform} • {product.region}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <Link href={`/listing/${product.id}`} className="block">
                    <h3 className="font-headline text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors">
                      {product.title}
                    </h3>
                  </Link>

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

              {/* Price & Action */}
              <div className="p-4 pt-0">
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">
                      Escrow Vault Price
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
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-clean-xs transition-colors cursor-pointer"
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
    </section>
  );
}
