"use client";

import React from "react";
import { ProductItem } from "@/types/marketplace";
import {
  X,
  ShieldCheck,
  Zap,
  Star,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  ExternalLink,
  Heart,
  Share2,
} from "lucide-react";

interface QuickViewModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onBuy: (product: ProductItem) => void;
  onOpenProtectionModal: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onBuy,
  onOpenProtectionModal,
  isWishlisted = false,
  onToggleWishlist,
}: QuickViewModalProps) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-clean-xl border border-slate-200 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[12px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
              {product.category.replace("-", " ")}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">
              {product.platform} ({product.region})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isWishlisted
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : "text-slate-400 hover:text-rose-600 hover:bg-slate-100 border-slate-200"
                }`}
                title={isWishlisted ? "Remove from Saved" : "Save to Watchlist"}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 max-h-[80vh] overflow-y-auto">
          {/* Left: Product Showcase */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-clean-xs">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.deliveryType === "instant" && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-sm text-emerald-400 text-[11px] font-bold shadow-clean-xs">
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>Instant Bot 0s</span>
                </div>
              )}
              {product.discountPercent && product.discountPercent > 0 && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-[12px] shadow-clean-xs">
                  -{product.discountPercent}%
                </div>
              )}
            </div>

            {/* Escrow Guarantee Pill Box */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Safedeal Escrow Vault Protected</span>
              </div>
              <p className="text-[12px] text-emerald-950/70 leading-relaxed">
                Funds are held securely. You receive a 48-hour verification window to inspect all credentials before the seller is paid.
              </p>
              <button
                onClick={onOpenProtectionModal}
                className="text-[12px] font-semibold text-emerald-700 hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
              >
                <span>Read buyer protection terms</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Right: Details & Seller Information */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="font-headline text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                {product.title}
              </h2>

              {/* Tags row */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                  {product.platform}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                  Region: {product.region}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                  {product.deliveryTimeText}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {product.description ||
                  "Verified digital commodity listing with guaranteed original access. Bot-inspected inventory snapshot, no active bans, and 100% replacement warranty under Safedeal rules."}
              </p>

              {/* Verified Merchant Lockup */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={product.seller.avatarUrl}
                      alt={product.seller.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    {product.seller.isVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center text-white text-[8px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        {product.seller.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[11px] font-bold bg-blue-100 text-blue-700">
                        {product.seller.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-slate-500 mt-0.5">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {product.seller.rating.toFixed(2)}
                      </span>
                      <span>•</span>
                      <span>{product.seller.dealCount.toLocaleString()} deals</span>
                      <span>•</span>
                      <span>{product.seller.deliverySpeed}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Online Now
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Escrow Protected Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-slate-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onBuy(product);
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-clean-sm hover:shadow-clean-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Escrow</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
