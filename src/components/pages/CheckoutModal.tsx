"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductItem } from "@/types/marketplace";
import { getCurrentUser, openLoginModal } from "@/lib/auth";
import {
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  Wallet,
  CheckCircle2,
  Lock,
  X,
  Star,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface CheckoutModalProps {
  product: ProductItem | null;
  listing?: ProductItem | null; // backward compatibility
  onClose: () => void;
  onOpenProtectionModal: () => void;
}

export default function CheckoutModal({
  product: propProduct,
  listing: propListing,
  onClose,
  onOpenProtectionModal,
}: CheckoutModalProps) {
  const product = propProduct || propListing;
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "crypto" | "apple">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  if (!product) return null;

  const handleConfirmOrder = async () => {
    // Escrow orders require a session: identity comes from the server cookie.
    if (!getCurrentUser()) {
      onClose();
      openLoginModal("signin");
      return;
    }
    setIsProcessing(true);
    setOrderError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemTitle: product.title,
          price: product.price,
          image: product.image,
          category: product.category,
          platform: product.platform,
          sellerName: product.seller.name,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCreatedOrder(data.data);
        setIsSuccess(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("safedeal_orders_changed"));
        }
      } else {
        setOrderError(data.error || "Failed to secure order in escrow.");
      }
    } catch (e: any) {
      setOrderError("Network error securing escrow order.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setCreatedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-clean-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-clean-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-slate-900">
                {isSuccess ? "Escrow Order Created" : "Instant Escrow Checkout"}
              </h3>
              <p className="text-xs text-slate-500">
                {isSuccess
                  ? `Order #${createdOrder?.orderNumber || "SD-92841"} is now active`
                  : "Secured by Safedeal 48-Hour Guarantee"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-headline text-xl font-bold text-slate-900">
                ${product.price.toFixed(2)} Secured in Escrow
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                Payment is safely locked in our multi-sig vault. Seller{" "}
                <strong className="text-slate-900">{product.seller.name}</strong> has
                been notified to deliver credentials.
              </p>
            </div>

            {/* Inspection Timer Notice */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                  Inspection Countdown
                </span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  48:00:00 Active
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                You have 48 hours to inspect account credentials, bind your personal 2FA,
                and verify ownership. Funds will not be released until you confirm.
              </p>
            </div>

            <Link
              href={`/orders/${createdOrder?.id || "ESC-94821"}`}
              onClick={handleReset}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-clean-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter 48-Hour Escrow Inspection Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="p-5 overflow-y-auto space-y-5">
            {orderError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {orderError}
              </div>
            )}
            {/* Item summary */}
            <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <img
                src={product.image}
                alt={product.imageAlt}
                className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wider block">
                  {product.platform} • {product.region}
                </span>
                <h4 className="font-headline text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                  {product.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>Seller: <strong>{product.seller.name}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {product.seller.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Escrow Fee Breakdown */}
            <div className="space-y-2 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Item Subtotal:</span>
                <span className="font-semibold text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <span>48h Escrow Protection Fee:</span>
                  <button
                    type="button"
                    onClick={onOpenProtectionModal}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    (Details)
                  </button>
                </span>
                <span className="font-bold text-emerald-600">FREE ($0.00)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery:</span>
                <span className="font-semibold text-emerald-600">
                  {product.deliveryTimeText || "Instant"}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Escrow Deposit:</span>
                <span className="font-headline text-base text-blue-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-blue-600 bg-blue-50/50 text-blue-600 ring-1 ring-blue-600 shadow-clean-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === "paypal"
                      ? "border-blue-600 bg-blue-50/50 text-blue-600 ring-1 ring-blue-600 shadow-clean-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>PayPal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === "crypto"
                      ? "border-blue-600 bg-blue-50/50 text-blue-600 ring-1 ring-blue-600 shadow-clean-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>USDT / Crypto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("apple")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === "apple"
                      ? "border-blue-600 bg-blue-50/50 text-blue-600 ring-1 ring-blue-600 shadow-clean-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Apple Pay</span>
                </button>
              </div>
            </div>

            {/* Escrow Notice Pill */}
            <div className="flex items-start gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-600">
              <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Funds will be deposited into Safedeal Escrow. Seller will{" "}
                <strong>NOT</strong> receive payout until you inspect and approve access.
              </span>
            </div>

            {/* Submit CTA */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmOrder}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-clean-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-98"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Securing in Escrow...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Deposit ${product.price.toFixed(2)} & Lock in Escrow</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
