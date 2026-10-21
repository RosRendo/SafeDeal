"use client";

import React from "react";
import { ProductItem } from "@/types/marketplace";
import HorizontalListingCard from "@/components/cards/HorizontalListingCard";
import { Sparkles, ArrowRight } from "lucide-react";

interface RecentlyListedSectionProps {
  products: ProductItem[];
  onBuy: (product: ProductItem) => void;
}

export default function RecentlyListedSection({
  products,
  onBuy,
}: RecentlyListedSectionProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      {/* Minimalist Section Header with Line Separator */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex-shrink-0">
          Recently Listed Deals
        </h2>

        <div className="section-header-line" />

        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 hidden sm:inline-flex items-center gap-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live updating</span>
        </span>
      </div>

      {/* Dense Horizontal Rows Grid (2 columns on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {products.map((product) => (
          <HorizontalListingCard
            key={product.id}
            product={product}
            onBuy={onBuy}
          />
        ))}
      </div>
    </section>
  );
}
