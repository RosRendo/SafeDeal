"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  ShoppingBag,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Headphones,
  CircleDollarSign,
  Check,
} from "lucide-react";
import EscrowDisputeModal from "@/components/orders/EscrowDisputeModal";
import Header from "@/components/navigation/Header";
import { apiUpdateOrderStatus } from "@/lib/apiClient";

function OrderDisputeContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = typeof params?.orderId === "string" ? params.orderId : "SF-2024-88492";

  // State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [isFrozenDispute, setIsFrozenDispute] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDisputeSubmitted = (data: {
    reason: string;
    statement: string;
    files: string[];
    caseId: string;
  }) => {
    setIsModalOpen(false);
    setIsFrozenDispute(true);
    apiUpdateOrderStatus(orderId, "dispute", `${data.reason}: ${data.statement}`).catch(() => {});
    showToast(`Escrow successfully frozen. Case ${data.caseId} is now under live Safedeal arbitration review.`);
  };

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-slate-900 flex flex-col antialiased selection:bg-[var(--cobalt-acc)] selection:text-white">
      {/* Dynamic Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--ds-navy)] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold border border-blue-500/40 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Shared Marketplace Header */}
      <Header
        activeCategory="all"
        onSelectCategory={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenProtectionModal={() => router.push("/protection")}
        wishlistCount={0}
      />

      {/* Main Container */}
      <main className="w-full pt-[104px] sm:pt-[108px] bg-[var(--ds-surface)] flex-1">
        <div className="flex flex-col w-full relative">
          {/* =========================================================================
                 UNDERLYING ORDER INSPECTION & TRACKING PAGE
                 Blurred / Dimmed when modal is open, crisp when dismissed
                 ========================================================================= */}
          <div
            className={`w-full max-w-[1280px] mx-auto px-4 md:px-8 py-4 transition-all duration-300 ${
              isModalOpen
                ? "select-none opacity-40 blur-[2px] pointer-events-none"
                : "opacity-100 blur-none pointer-events-auto"
            }`}
          >
            {/* Breadcrumb & Order Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Link href="/orders" className="hover:text-blue-600 transition-colors">
                  Orders
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[var(--cobalt-acc)] font-bold">Order #{orderId}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900">Inspection Vault</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 shadow-xs">
                {isFrozenDispute ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <span className="text-xs font-bold text-rose-600">
                      Escrow Frozen: Under Arbitration
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Inspection Clock: 34h 12m Remaining
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Order Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-clean-sm border border-slate-200/80 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop"
                  alt="Valorant Account"
                  className="w-16 h-16 rounded-2xl object-cover shadow-xs border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[var(--cobalt-acc)] text-[11px] font-bold">
                      Riot Games • Global
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      Escrow Secured
                    </span>
                  </div>
                  <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900">
                    Valorant Radiant Rank Account • Champions 2021 Vandal + Prime Karambit
                  </h2>
                  <p className="text-xs text-slate-500">
                    Seller:{" "}
                    <Link
                      href="/store/aerogamingdeals"
                      className="font-bold text-slate-800 hover:text-blue-600 transition-colors"
                    >
                      AeroGamingDeals
                    </Link>{" "}
                    (⭐ 4.98 • 2,410 transactions) • Delivered 14 hours ago
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Escrow Hold
                </span>
                <span className="font-headline text-2xl font-black text-slate-900">
                  $195.00 USD
                </span>
              </div>
            </div>

            {/* Dual Column Inspection Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {/* Credentials Vault Box */}
                <div className="bg-white rounded-2xl p-6 shadow-clean-sm border border-slate-200/80">
                  <h3 className="font-headline text-base font-bold mb-3 text-slate-900">
                    Handover Credentials Vault
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs border border-slate-200/70">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-semibold">Riot ID Username:</span>
                      <span className="font-mono font-bold text-slate-900">ViperShadow#EUW9</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-semibold">Password:</span>
                      <span className="font-mono font-bold text-slate-900">••••••••••••••••</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-semibold">Original Mail (OGE):</span>
                      <span className="font-mono font-bold text-slate-900">
                        shadow.viper.og@proton.me
                      </span>
                    </div>
                  </div>
                </div>

                {/* 48-Hour Inspection Checklist */}
                <div className="bg-white rounded-2xl p-6 shadow-clean-sm border border-slate-200/80">
                  <h3 className="font-headline text-base font-bold mb-3 text-slate-900">
                    48-Hour Inspection Checklist
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-800">
                        1. Sign-in credential check
                      </span>
                      <span className="text-rose-600 text-xs font-bold flex items-center gap-1">
                        <X className="w-4 h-4" /> Failed
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-800">
                        2. 2FA Transfer to Buyer Phone
                      </span>
                      <span className="text-slate-400 text-xs font-bold">Pending</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-800">
                        3. In-Game Inventory Audit
                      </span>
                      <span className="text-slate-400 text-xs font-bold">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-clean-sm border border-slate-200/80">
                  <span className="font-headline text-sm font-bold block mb-1 text-slate-900">
                    Inspection Actions
                  </span>
                  <p className="text-xs text-slate-500 mb-4">
                    If you verified all digital assets, release funds to seller.
                  </p>
                  <button
                    onClick={() => showToast("Funds released to seller AeroGamingDeals.")}
                    className="w-full py-3 bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white rounded-xl text-xs font-bold mb-2 shadow-xs transition-colors cursor-pointer"
                  >
                    Release Escrow ($195.00)
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Open Escrow Dispute
                  </button>
                </div>

                {isFrozenDispute && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1 shadow-xs">
                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Case #DIS-88492-A In Progress</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Concierge officer assigned. Check{" "}
                      <Link href="/messages" className="text-[var(--cobalt-acc)] underline font-bold">
                        Messages
                      </Link>{" "}
                      for the mediation thread.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================================
                 MODAL OVERLAY (ACTIVE STAGE)
                 ========================================================================= */}
          <EscrowDisputeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmitDispute={handleDisputeSubmitted}
            orderNumber={`#${orderId}`}
            sellerName="AeroGamingDeals"
            escrowAmount={195.0}
          />
        </div>
      </main>

      {/* Global Trust Pillars & Marketplace Footer */}
      <footer className="w-full bg-white shadow-[0_-1px_8px_rgba(0,0,0,0.02)] mt-16 border-t border-slate-200/80">
        <div className="bg-slate-50/80 py-10 border-b border-slate-200/60">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-headline text-sm font-bold text-slate-900">
                  100% Escrow Protection
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Funds held securely until inspection verified
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-[var(--cobalt-acc)] shadow-xs shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-headline text-sm font-bold text-slate-900">
                  Instant Automated Delivery
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive keys and digital assets within seconds
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-headline text-sm font-bold text-slate-900">
                  24/7 Dispute Resolution
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time arbitration and live customer assistance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Columns */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[var(--cobalt-acc)] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-headline text-lg font-bold text-slate-900">Safedeal</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
              The leading peer-to-peer and verified merchant trading network for game accounts,
              software licenses, codes, and digital commodities with guaranteed escrow security.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200">
                SSL 256-Bit
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200">
                PCI-DSS Compliant
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200">
                Verified Merchant
              </span>
            </div>
          </div>

          <div>
            <h5 className="font-headline text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Popular Markets
            </h5>
            <ul className="space-y-2 text-xs text-slate-500 font-medium">
              <li>
                <Link href="/browse?cat=accounts" className="hover:text-blue-600 transition-colors">
                  Game Accounts
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=keys" className="hover:text-blue-600 transition-colors">
                  Steam & Epic Keys
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=gift-cards" className="hover:text-blue-600 transition-colors">
                  Prepaid Cards
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=currency" className="hover:text-blue-600 transition-colors">
                  Virtual Currency
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=software" className="hover:text-blue-600 transition-colors">
                  Product Licenses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-headline text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Buyer & Seller
            </h5>
            <ul className="space-y-2 text-xs text-slate-500 font-medium">
              <li>
                <Link href="/store/aerogamingdeals#policies" className="hover:text-blue-600 transition-colors">
                  Buyer Protection
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-blue-600 transition-colors">
                  Fee Schedule
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-blue-600 transition-colors">
                  Escrow Protocol
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-blue-600 transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-blue-600 transition-colors">
                  Seller Hub
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-headline text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Preferences
            </h5>
            <div className="space-y-2">
              <div className="bg-slate-100 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  English (US)
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="bg-slate-100 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <CircleDollarSign className="w-3.5 h-3.5 text-slate-500" />
                  USD ($)
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="bg-slate-100/70 py-4 border-t border-slate-200/60">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2025 Safedeal Global Inc. All rights reserved. Registered digital marketplace facilitator.</p>
            <div className="flex items-center gap-4 text-[12px] font-medium text-slate-500">
              <span className="hover:text-slate-900 transition-colors cursor-pointer">
                Privacy Policy
              </span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">
                Terms of Escrow
              </span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">
                Dispute Guidelines
              </span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">
                AML Policy
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function OrderDisputePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderDisputeContent />
    </React.Suspense>
  );
}
