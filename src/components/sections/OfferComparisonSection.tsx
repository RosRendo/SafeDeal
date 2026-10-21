"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OfferComparisonProduct, ProductItem, SellerOffer } from "@/types/marketplace";
import {
  ShieldCheck,
  Zap,
  Star,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Layers,
  Award,
} from "lucide-react";

interface OfferComparisonSectionProps {
  products: OfferComparisonProduct[];
  onBuyOffer: (product: OfferComparisonProduct, offer: SellerOffer) => void;
  onOpenProtectionModal: () => void;
}

export default function OfferComparisonSection({
  products,
  onBuyOffer,
  onOpenProtectionModal,
}: OfferComparisonSectionProps) {
  const [activeProductId, setActiveProductId] = useState(products[0]?.id || "");

  const activeProduct =
    products.find((p) => p.id === activeProductId) || products[0];

  if (!activeProduct) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      {/* Minimalist Section Header with Line Separator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex-shrink-0">
          Compare Seller Offers
        </h2>

        <div className="section-header-line" />

        {/* Product Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 flex-shrink-0">
          {products.map((prod) => (
            <button
              key={prod.id}
              onClick={() => setActiveProductId(prod.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                prod.id === activeProduct.id
                  ? "bg-slate-900 text-white shadow-clean-sm"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {prod.category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Comparison Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-clean-sm p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Product Spotlight Details */}
          <div className="lg:col-span-5 space-y-4">
            <Link href={`/listing/${activeProduct.id}`} className="block">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-clean-xs group">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[12px] font-bold backdrop-blur-sm">
                  {activeProduct.platform} • {activeProduct.region}
                </div>
              </div>
            </Link>

            <div>
              <Link href={`/listing/${activeProduct.id}`}>
                <h3 className="font-headline text-lg sm:text-xl font-extrabold text-slate-900 hover:text-blue-600 transition-colors leading-snug">
                  {activeProduct.title}
                </h3>
              </Link>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {activeProduct.description}
              </p>
            </div>

            {/* Escrow badge */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Safedeal Escrow Guarantee
                  </h4>
                  <p className="text-[12px] text-slate-500">
                    All offers below are protected by our 48h hold.
                  </p>
                </div>
              </div>
              <Link
                href="/protection"
                className="text-[12px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Rules
              </Link>
            </div>
          </div>

          {/* Right Column: Comparative Seller Rows */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 px-2">
              <span>Merchant / Reputation</span>
              <span className="hidden sm:inline">Delivery & Warranty</span>
              <span>Price & Handoff</span>
            </div>

            {activeProduct.offers.map((offer, idx) => (
              <div
                key={offer.sellerId}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  idx === 0
                    ? "bg-blue-50/40 border-blue-200/80 shadow-clean-xs"
                    : "bg-white hover:bg-slate-50/80 border-slate-200/80"
                }`}
              >
                {/* Seller Bio */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="relative">
                    <img
                      src={offer.sellerAvatar}
                      alt={offer.sellerName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    {offer.isVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center text-white text-[8px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        {offer.sellerName}
                      </span>
                      {offer.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-blue-100 text-blue-800">
                          {offer.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mt-0.5">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {offer.rating.toFixed(2)}
                      </span>
                      <span>•</span>
                      <span>{offer.tradesCount} trades</span>
                    </div>
                  </div>
                </div>

                {/* Delivery & Warranty */}
                <div className="space-y-1 text-left sm:text-center">
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    <span>{offer.deliveryTime}</span>
                  </div>
                  <p className="text-[12px] text-slate-500 block font-medium">
                    {offer.warranty}
                  </p>
                </div>

                {/* Price & Buy Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="font-headline text-lg sm:text-xl font-extrabold text-slate-900 block leading-tight">
                      ${offer.price.toFixed(2)}
                    </span>
                    {offer.originalPrice && (
                      <span className="text-[12px] text-slate-400 line-through">
                        ${offer.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onBuyOffer(activeProduct, offer)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-clean-xs hover:shadow-clean-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Buy Offer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
