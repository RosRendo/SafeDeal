"use client";

import React from "react";
import Link from "next/link";
import { FeaturedSellerData } from "@/types/marketplace";
import SellerProfileCard from "@/components/cards/SellerProfileCard";
import { ArrowRight, ShieldCheck } from "lucide-react";

interface FeaturedSellersSectionProps {
  sellers: FeaturedSellerData[];
  onFilterBySeller: (sellerName: string) => void;
}

export default function FeaturedSellersSection({
  sellers,
  onFilterBySeller,
}: FeaturedSellersSectionProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      {/* Minimalist Section Header with Line Separator */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex-shrink-0">
          Top Verified Merchants
        </h2>

        <div className="section-header-line" />

        <Link
          href="/seller"
          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors flex-shrink-0 cursor-pointer"
        >
          <span>Become a Merchant</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid of Sellers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {sellers.map((seller) => (
          <SellerProfileCard
            key={seller.id}
            seller={seller}
            onFilterBySeller={onFilterBySeller}
          />
        ))}
      </div>
    </section>
  );
}
