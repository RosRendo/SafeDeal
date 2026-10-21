"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import EscrowGuaranteeModal from "@/components/pages/EscrowGuaranteeModal";
import { getProductById } from "@/lib/allProducts";
import { apiCreateOrder } from "@/lib/apiClient";
import { getCurrentUser, openLoginModal } from "@/lib/auth";
import {
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  Clock,
  Star,
  ChevronRight,
  CreditCard,
  Wallet,
  ArrowRight,
  Info,
  Check,
  Loader2,
  Tag,
  Headphones,
  KeyRound,
  Shield,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("item") || searchParams.get("id") || "SF-94821";
  const product = useMemo(() => getProductById(productId), [productId]);

  // Modals & Protection
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);

  // Recipient info
  const [recipientEmail, setRecipientEmail] = useState("alex.morgan@email.com");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // Payment Method choice
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "paypal" | "wallets" | "regional" | "crypto"
  >("card");

  // Card form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [voucherError, setVoucherError] = useState("");
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);

  // Escrow Agreement Checkbox
  const [isAgreementChecked, setIsAgreementChecked] = useState(true);
  const [agreementError, setAgreementError] = useState(false);

  // Processing & Redirect
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Financial calculations
  const subtotal = product.price;
  const discountAmount = appliedDiscount;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    if (
      voucherCode.toUpperCase() === "SAFEDEAL10" ||
      voucherCode.toUpperCase() === "ESCROW10" ||
      voucherCode.toUpperCase() === "VALORANT"
    ) {
      setAppliedDiscount(15);
      setIsVoucherApplied(true);
      setVoucherError("");
    } else {
      setAppliedDiscount(10);
      setIsVoucherApplied(true);
      setVoucherError("");
    }
  };

  const handleConfirmPayment = async () => {
    if (!isAgreementChecked) {
      setAgreementError(true);
      return;
    }
    setAgreementError(false);
    setOrderError(null);

    // Escrow identity comes from the server session cookie.
    if (!getCurrentUser()) {
      openLoginModal("signin");
      return;
    }

    setIsProcessing(true);

    try {
      const createdOrder = await apiCreateOrder({
        itemTitle: product.title,
        price: total,
        image: product.image,
        category: product.category,
        platform: product.platform,
        sellerName: product.seller?.name,
        sellerTag: product.seller?.tier || "MERCHANT",
        paymentMethod,
      });

      if (!createdOrder) {
        setIsProcessing(false);
        setOrderError("We couldn't secure your order. Check that you're signed in and try again.");
        return;
      }

      setTimeout(() => {
        // Direct navigation to the 48-hour inspection room for the confirmed order
        router.push(`/orders/${createdOrder.id}`);
      }, 1200);
    } catch (err) {
      setIsProcessing(false);
      setOrderError("Network error securing your escrow order. Please try again.");
    }
  };

  const getPayButtonText = () => {
    if (isProcessing) return "Securing Payment in Multi-Sig Escrow...";
    if (paymentMethod === "card") return `Confirm & Pay $${total.toFixed(2)}`;
    if (paymentMethod === "paypal") return `Pay with PayPal Express ($${total.toFixed(2)})`;
    if (paymentMethod === "wallets") return `1-Click Pay ($${total.toFixed(2)})`;
    if (paymentMethod === "regional") return `Proceed to European Banking Gateway`;
    if (paymentMethod === "crypto") return `Generate Escrow Deposit Address`;
    return `Confirm & Pay $${total.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* Top Global Header */}
      <Header
        activeCategory="all"
        onSelectCategory={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
      />

      <main className="w-full pt-[102px] sm:pt-[106px] flex-1 flex flex-col">
        {/* Security Sub-Ribbon */}
        <div className="w-full bg-slate-900 text-white py-2.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <span className="font-semibold text-slate-200">
                Bank-Grade 256-Bit SSL Encrypted Escrow Checkout
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400 text-[12px]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Session Protected</span>
              </span>
              <button
                onClick={() => setIsProtectionModalOpen(true)}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Need Help? Live Arbitration Ready</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Checkout Grid */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-10 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ========================================================================= */}
            {/* LEFT COLUMN: Steps 1, 2, 3 (lg:col-span-7)                                */}
            {/* ========================================================================= */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* STEP 1: Recipient & Automated Dispatch */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-clean-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-headline font-bold text-xs">
                      1
                    </span>
                    <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900">
                      Recipient & Automated Dispatch
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                    <span>Automated Bot Delivery</span>
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    {isEditingEmail ? (
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="p-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <div>
                        <p className="font-headline font-bold text-xs sm:text-sm text-slate-900">
                          {recipientEmail}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          Primary verified marketplace destination
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isEditingEmail ? "Save Email" : "Change Email"}
                  </button>
                </div>

                <p className="text-[12px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>
                    Login credentials, original recovery details, and inspection hash will be vaulted immediately upon settlement.
                  </span>
                </p>
              </div>

              {/* STEP 2: Payment Method */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-clean-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-headline font-bold text-xs">
                      2
                    </span>
                    <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900">
                      Payment Method
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Zero Transaction Fee</span>
                  </span>
                </div>

                {/* Payment Radios List */}
                <div className="space-y-2.5">
                  {/* Option 1: Credit / Debit Card */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`rounded-2xl border transition-all cursor-pointer p-4 ${
                      paymentMethod === "card"
                        ? "bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20"
                        : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                        />
                        <span className="font-headline font-bold text-xs sm:text-sm text-slate-900">
                          Credit / Debit Card
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-white text-slate-700 text-[11px] font-bold border border-slate-200">
                          VISA
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white text-slate-700 text-[11px] font-bold border border-slate-200">
                          MC
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white text-slate-700 text-[11px] font-bold border border-slate-200">
                          AMEX
                        </span>
                      </div>
                    </div>

                    {paymentMethod === "card" && (
                      <div className="space-y-3 pt-3 border-t border-blue-200/60 animate-in fade-in duration-200">
                        <div>
                          <label className="text-[12px] font-bold text-slate-600 block mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Name on card"
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-slate-600 block mb-1">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4532 •••• •••• 8821"
                              className="w-full p-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 tracking-wider outline-none focus:border-blue-500 font-mono"
                            />
                            <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[12px] font-bold text-slate-600 block mb-1">
                              Expiration
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM / YY"
                              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[12px] font-bold text-slate-600 block mb-1">
                              Security Code (CVC)
                            </label>
                            <input
                              type="password"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              maxLength={4}
                              placeholder="CVC"
                              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: PayPal */}
                  <div
                    onClick={() => setPaymentMethod("paypal")}
                    className={`rounded-2xl border transition-all cursor-pointer p-4 flex items-center justify-between ${
                      paymentMethod === "paypal"
                        ? "bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20"
                        : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "paypal"}
                        onChange={() => setPaymentMethod("paypal")}
                        className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className="font-headline font-bold text-xs sm:text-sm text-slate-900">
                        PayPal Instant
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-600">Express Checkout</span>
                  </div>

                  {/* Option 3: Apple Pay / Google Pay */}
                  <div
                    onClick={() => setPaymentMethod("wallets")}
                    className={`rounded-2xl border transition-all cursor-pointer p-4 flex items-center justify-between ${
                      paymentMethod === "wallets"
                        ? "bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20"
                        : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "wallets"}
                        onChange={() => setPaymentMethod("wallets")}
                        className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className="font-headline font-bold text-xs sm:text-sm text-slate-900">
                        Apple Pay / Google Pay
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600">1-Click Wallet</span>
                  </div>

                  {/* Option 4: European Instant Banking */}
                  <div
                    onClick={() => setPaymentMethod("regional")}
                    className={`rounded-2xl border transition-all cursor-pointer p-4 flex items-center justify-between ${
                      paymentMethod === "regional"
                        ? "bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20"
                        : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "regional"}
                        onChange={() => setPaymentMethod("regional")}
                        className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <div>
                        <span className="font-headline font-bold text-xs sm:text-sm text-slate-900 block">
                          European Instant Banking
                        </span>
                        <span className="text-[12px] text-slate-500">
                          iDEAL, Bancontact, Giropay, Sofort
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-white text-slate-700 text-[11px] font-bold border border-slate-200">
                      SEPA Instant
                    </span>
                  </div>

                  {/* Option 5: Crypto Escrow Pay */}
                  <div
                    onClick={() => setPaymentMethod("crypto")}
                    className={`rounded-2xl border transition-all cursor-pointer p-4 flex items-center justify-between ${
                      paymentMethod === "crypto"
                        ? "bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20"
                        : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "crypto"}
                        onChange={() => setPaymentMethod("crypto")}
                        className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <div>
                        <span className="font-headline font-bold text-xs sm:text-sm text-slate-900 block">
                          Crypto Escrow Pay
                        </span>
                        <span className="text-[12px] text-slate-500">
                          USDC, USDT, BTC (Zero Slippage)
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-black tracking-wide">
                      WEB3 SAFE
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 3: Buyer Protection Protocol & Final Pay Button */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-clean-sm flex flex-col gap-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-headline font-bold text-xs">
                    3
                  </span>
                  <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900">
                    Buyer Protection Protocol
                  </h2>
                </div>

                {/* Escrow Guarantee Checkbox Box */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col gap-2.5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAgreementChecked}
                      onChange={(e) => {
                        setIsAgreementChecked(e.target.checked);
                        if (e.target.checked) setAgreementError(false);
                      }}
                      className="mt-1 w-4 h-4 text-blue-600 accent-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 font-bold">
                        Safedeal 48-Hour Escrow Protection active:
                      </strong>{" "}
                      Your funds (${total.toFixed(2)}) are securely locked in institutional cold-escrow and will{" "}
                      <strong>NOT</strong> be disbursed to seller{" "}
                      <span className="font-bold text-blue-600">{product.seller.name}</span>{" "}
                      until you test and confirm ownership in the inspection room.
                    </span>
                  </label>

                  <div className="text-[12px] text-slate-500 pl-7 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Managed by Safedeal Escrow Services Ltd. under Global Consumer Marketplace Terms.
                    </span>
                  </div>
                </div>

                {/* Primary Submit Payment Action */}
                <div className="pt-2">
                  {agreementError && (
                    <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>Please check the Safedeal Escrow Guarantee acknowledgment above to proceed.</span>
                    </div>
                  )}
                  {orderError && (
                    <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>{orderError}</span>
                    </div>
                  )}
                  <button
                    disabled={isProcessing}
                    onClick={handleConfirmPayment}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70 text-white rounded-2xl font-headline font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-clean-md transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{getPayButtonText()}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>{getPayButtonText()}</span>
                      </>
                    )}
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-slate-500 text-[12px] font-medium">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Full Refund Guarantee</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>48h Inspection Grace</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Vaulted Delivery</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* RIGHT COLUMN: Sticky Order Summary (lg:col-span-5)                         */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-36">
              {/* Summary Card */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-clean-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-headline font-bold text-base text-slate-900">
                    Order Summary
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                    1 Digital Item
                  </span>
                </div>

                {/* Product Micro-card */}
                <div className="flex gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-bold uppercase">
                          {product.platform} • {product.region}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 fill-emerald-700" />
                          <span>Instant</span>
                        </span>
                      </div>

                      <h4 className="font-headline font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                        {product.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50">
                      <div className="flex items-center gap-1 text-[12px] text-slate-600">
                        <span className="font-semibold text-slate-900">
                          {product.seller.name}
                        </span>
                        <span className="text-amber-500 font-bold">★ {product.seller.rating}</span>
                      </div>

                      <span className="font-headline font-extrabold text-sm text-slate-900">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Window Banner */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-headline font-bold text-xs text-slate-900">
                      Dispatch Window
                    </p>
                    <p className="text-[12px] text-slate-500">
                      Under 60 seconds after payment confirmation
                    </p>
                  </div>
                </div>

                {/* Subtotal lines */}
                <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Safedeal Escrow & Inspection</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <span className="font-bold text-emerald-600">FREE ($0.00)</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Voucher Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Sales Tax</span>
                    <span className="font-bold text-slate-900">$0.00</span>
                  </div>
                </div>

                {/* Voucher code input */}
                <form onSubmit={handleApplyVoucher} className="flex gap-2 pt-1">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="PROMO CODE (e.g. SAFEDEAL10)"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 uppercase placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {isVoucherApplied && (
                  <p className="text-[12px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Promo code applied! Saved ${discountAmount.toFixed(2)}</span>
                  </p>
                )}

                {/* Total Due Today Highlight Box */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-clean-sm">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Total Due Today
                    </p>
                    <p className="text-xs text-emerald-400 font-semibold">
                      Locked Escrow Hold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline text-2xl sm:text-3xl font-black text-white leading-none">
                      ${total.toFixed(2)}
                    </p>
                    <span className="text-[11px] font-bold text-slate-400">USD</span>
                  </div>
                </div>

                {/* Guarantees bullet stack */}
                <div className="space-y-2 pt-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>100% Refundable if credentials do not match listing</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span>48 Hours countdown before seller fund payout</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <span>Encrypted Vault Storage with 1-click password sync</span>
                  </div>
                </div>
              </div>

              {/* PCI-DSS Seal */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500 shadow-clean-xs">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>PCI-DSS Level 1 Facility</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">ID: SD-99412-PAY</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Marketplace Footer */}
      <Footer
        onSelectCategory={() => {}}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
      />

      {/* Escrow Guarantee Modal */}
      <EscrowGuaranteeModal
        isOpen={isProtectionModalOpen}
        onClose={() => setIsProtectionModalOpen(false)}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading Safedeal Escrow Checkout...</span>
          </div>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
