"use client";

import React from "react";
import Link from "next/link";
import { MERCHANTS } from "@/lib/data";
import { Star, Zap, Store, ArrowRight, CheckCircle2 } from "lucide-react";

interface MerchantShowcaseProps {
  onFilterBySeller: (sellerName: string) => void;
}

export default function MerchantShowcase({
  onFilterBySeller,
}: MerchantShowcaseProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[12px] font-bold uppercase tracking-wider text-blue-600">
            Trusted Community
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Top Verified Merchants
          </h2>
        </div>
        <Link
          href="/seller"
          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors cursor-pointer"
        >
          <span>Become a Seller</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {MERCHANTS.map((merchant) => (
          <div
            key={merchant.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-clean-sm hover:shadow-clean-md transition-all flex flex-col justify-between hover:-translate-y-0.5"
          >
            <div>
              {/* Header: avatar, name, and tier */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={merchant.avatarUrl}
                      alt={merchant.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center ring-2 ring-white">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline text-sm font-bold text-slate-900">
                      {merchant.name}
                    </h4>
                    <span className="text-[12px] font-semibold text-emerald-600">
                      {merchant.title}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">
                  {merchant.tier}
                </span>
              </div>

              {/* Stats Box */}
              <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Positive Rating:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {merchant.rating}% ({merchant.reviewsCount})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Delivery Speed:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-0.5">
                    <Zap className="w-3.5 h-3.5" />
                    {merchant.deliverySpeed}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Orders:</span>
                  <span className="font-semibold text-slate-900">
                    {merchant.totalTrades}
                  </span>
                </div>
              </div>
            </div>

            {/* View Inventory Button */}
            <button
              onClick={() => onFilterBySeller(merchant.name)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Store className="w-3.5 h-3.5" />
              <span>View Inventory</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
