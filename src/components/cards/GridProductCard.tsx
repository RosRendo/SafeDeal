"use client";

import React from "react";
import Link from "next/link";
import { ProductItem } from "@/types/marketplace";
import { Zap, ShieldCheck, ShoppingBag, Star, CheckCircle2, Heart, Eye } from "lucide-react";

interface GridProductCardProps {
  product: ProductItem;
  onBuy: (product: ProductItem) => void;
  onOpenProtectionModal: () => void;
  onQuickView?: (product: ProductItem) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export default function GridProductCard({
  product,
  onBuy,
  onOpenProtectionModal,
  onQuickView,
  isWishlisted = false,
  onToggleWishlist,
}: GridProductCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-clean-sm hover:shadow-clean-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1">
      {/* 16:9 Image Container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
        <Link href={`/listing/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.imageAlt}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 cursor-pointer"
          />
        </Link>

        {/* Floating Top Left Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-emerald-700 text-[12px] font-bold shadow-clean-xs border border-white/60">
          <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
          <span>{product.deliveryTimeText}</span>
        </div>

        {/* Floating Top Right Badges */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              className="p-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-400 hover:text-rose-500 shadow-clean-xs flex items-center justify-center transition-colors cursor-pointer"
              title={isWishlisted ? "Remove from Saved" : "Save to Watchlist"}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "text-rose-600 fill-rose-600" : ""}`} />
            </button>
          )}

          <Link
            href="/protection"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-700 text-[12px] font-bold shadow-clean-xs border border-white/60 hover:bg-white cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Protected</span>
          </Link>
        </div>

        {/* Floating Platform Chip */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-md bg-slate-900/85 text-white text-[11px] font-semibold backdrop-blur-xs">
            {product.platform} • {product.region}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/listing/${product.id}`} className="block">
            <h4 className="font-headline text-sm font-bold text-slate-900 line-clamp-2 mb-2.5 group-hover:text-blue-600 transition-colors leading-snug">
              {product.title}
            </h4>
          </Link>

          {/* Seller Trust Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">
                {product.seller.avatarInitial}
              </div>
              <span className="font-semibold text-slate-800">
                {product.seller.name}
              </span>
              {product.seller.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-700 font-semibold text-xs">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{product.seller.rating}</span>
              <span className="text-slate-400 font-normal text-[12px]">
                ({product.seller.reviewsCount || product.seller.dealCount})
              </span>
            </div>
          </div>
        </div>

        {/* Price & Buy Action */}
        <div className="flex items-center justify-between pt-1">
          <div>
            {product.originalPrice ? (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-headline text-lg font-black text-slate-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                </div>
                {product.discountPercent && (
                  <span className="text-[11px] font-bold text-emerald-600">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>
            ) : (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Escrow Price
                </span>
                <span className="font-headline text-lg font-black text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => onBuy(product)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-clean-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Buy Now</span>
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
