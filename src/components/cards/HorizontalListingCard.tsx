"use client";

import React from "react";
import Link from "next/link";
import { ProductItem } from "@/types/marketplace";
import { Zap, ShieldCheck, ShoppingBag, Star, Clock } from "lucide-react";

interface HorizontalListingCardProps {
  product: ProductItem;
  onBuy: (product: ProductItem) => void;
}

export default function HorizontalListingCard({
  product,
  onBuy,
}: HorizontalListingCardProps) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-clean-xs hover:shadow-clean-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:border-slate-300 group">
      {/* Thumbnail & Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link
          href={`/listing/${product.id}`}
          className="block relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.imageAlt}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          />
          {product.discountPercent && (
            <span className="absolute top-1 left-1 px-1.5 py-0.2 bg-rose-600 text-white font-headline text-[10px] font-black rounded">
              -{product.discountPercent}%
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
              {product.platform}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {product.region}
            </span>
            {product.listedTimeAgo && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium ml-auto sm:ml-0">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{product.listedTimeAgo}</span>
              </span>
            )}
          </div>

          <Link href={`/listing/${product.id}`} className="block">
            <h4 className="font-headline text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {product.title}
            </h4>
          </Link>

          {/* Seller & Delivery metadata */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="text-[12px] font-medium text-slate-600">
              Sold by <strong>{product.seller.name}</strong>
            </span>
            <span className="flex items-center gap-0.5 text-amber-600 font-bold text-[12px]">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {product.seller.rating}
            </span>
            <span className="hidden md:flex items-center gap-1 text-emerald-600 text-[12px] font-semibold">
              <Zap className="w-3 h-3 fill-emerald-600" />
              <span>{product.deliveryTimeText}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Quick Action */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <div className="text-left sm:text-right">
          <div className="flex items-baseline sm:justify-end gap-1.5">
            <span className="font-headline text-base sm:text-lg font-black text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center sm:justify-end gap-0.5">
            <ShieldCheck className="w-3 h-3" />
            <span>Escrow Protected</span>
          </span>
        </div>

        <button
          onClick={() => onBuy(product)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-clean-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Buy</span>
        </button>
      </div>
    </div>
  );
}
