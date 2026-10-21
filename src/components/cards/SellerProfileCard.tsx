"use client";

import React from "react";
import Link from "next/link";
import { FeaturedSellerData, ProductItem } from "@/types/marketplace";
import { Star, Zap, Store, CheckCircle2, ChevronRight } from "lucide-react";

interface SellerProfileCardProps {
  seller: FeaturedSellerData;
  onFilterBySeller: (sellerName: string) => void;
  onSelectProduct?: (product: ProductItem) => void;
}

export default function SellerProfileCard({
  seller,
  onFilterBySeller,
}: SellerProfileCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-clean-sm hover:shadow-clean-md transition-all flex flex-col justify-between hover:-translate-y-1">
      <div>
        {/* Merchant Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={seller.avatarUrl}
                alt={seller.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center ring-2 ring-white">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-headline text-sm font-bold text-slate-900">
                  {seller.name}
                </h4>
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase">
                  {seller.tier}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[12px] text-slate-500 mt-0.5">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="font-bold text-slate-800">{seller.ratingPercent}%</span>
                <span>({seller.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & Orders Metric Strip */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">
              Delivery
            </span>
            <span className="font-bold text-emerald-600 flex items-center gap-1 text-[12px]">
              <Zap className="w-3 h-3 fill-emerald-600" />
              {seller.deliverySpeed}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">
              Total Deals
            </span>
            <span className="font-bold text-slate-800 text-[12px]">
              {seller.totalOrders}
            </span>
          </div>
        </div>

        {/* Mini Inventory Preview (3 chips) */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
            Popular in Store ({seller.activeListingsCount} items)
          </span>
          <div className="space-y-1.5">
            {seller.topProducts.map((p) => (
              <Link
                key={p.id}
                href={`/listing/${p.id}`}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-7 h-7 rounded object-cover flex-shrink-0"
                  />
                  <span className="text-xs text-slate-700 truncate group-hover:text-blue-600 font-medium">
                    {p.title}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 ml-2">
                  ${p.price.toFixed(2)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Visit Store Action */}
      <Link
        href={`/store/${encodeURIComponent(seller.name.toLowerCase().replace(/\s+/g, ""))}`}
        className="w-full py-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
      >
        <Store className="w-3.5 h-3.5" />
        <span>Visit Merchant Store</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
