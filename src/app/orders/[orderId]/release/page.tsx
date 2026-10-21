"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  ChevronRight,
  Timer,
  Verified,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Zap,
  Search,
  ArrowRight,
  Headphones,
  ShoppingBag,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import OrderCompletionReleaseModal from "@/components/orders/OrderCompletionReleaseModal";
import Header from "@/components/navigation/Header";
import { apiUpdateOrderStatus } from "@/lib/apiClient";

function OrderReleaseContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || "SF-2024-88492";

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleConfirmRelease = (reviewData?: {
    rating: number;
    tags: string[];
    review: string;
  }) => {
    setIsModalOpen(false);
    setIsCompleted(true);
    apiUpdateOrderStatus(orderId, "release", `Released via release page with rating ${reviewData?.rating ?? 5}`).catch(() => {});
    setSuccessToast(
      `$195.00 USD released to AeroGamingDeals! Thank you for rating ${reviewData?.rating ?? 5} stars.`
    );
    setTimeout(() => {
      setSuccessToast(null);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-slate-900 flex flex-col antialiased selection:bg-[var(--cobalt-acc)] selection:text-white">
      {/* Dynamic Toast Alert */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-[var(--ds-navy)] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold border border-emerald-500/40 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
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

      {/* Main Content Area */}
      <main className="w-full pt-[104px] sm:pt-[108px] bg-[var(--ds-surface)] flex-1">
        <div className="flex flex-col w-full relative min-h-[920px]">
          {/* Underlying Order Inspection Screen */}
          <div
            className={`w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 transition-all duration-300 ${
              isModalOpen
                ? "opacity-40 select-none pointer-events-none filter blur-[2px]"
                : "opacity-100"
            }`}
          >
            {/* Breadcrumbs / Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Link href="/orders" className="hover:text-slate-800">
                  Orders
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <Link href="/orders" className="hover:text-slate-800">
                  Escrow Tracking
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-bold">Order #{orderId}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-[var(--cobalt-acc)] font-bold">
                <Timer className="w-3.5 h-3.5" />
                <span>
                  {isCompleted
                    ? "ORDER COMPLETED & SETTLED"
                    : "INSPECTION WINDOW ACTIVE (37h 14m LEFT)"}
                </span>
              </div>
            </div>

            {/* Underlying Order Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Asset Preview Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="w-full sm:w-52 h-36 rounded-xl bg-slate-900 overflow-hidden relative shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop"
                        alt="Valorant Immortal Asset Preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-amber-300 font-bold text-[11px] border border-amber-500/30">
                        Immortal 3 (248 RR)
                      </span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="inline-flex items-center gap-1 text-[#009668] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[12px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Full OGE Handover Included</span>
                      </div>
                      <h1 className="font-headline text-lg sm:text-xl font-bold text-slate-900">
                        Valorant Peak Immortal 3 (Champions 2021 Vandal + Arcane Sheriff)
                      </h1>
                      <p className="text-xs text-slate-500">
                        Riot ID: VandalGod#NA1 • Region: North America • Rank: Immortal 3 (248 RR)
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-700">
                        <span>
                          Total Escrow: <strong className="text-slate-900 font-bold font-mono">$195.00 USD</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Seller: <strong className="text-slate-900 font-bold">AeroGamingDeals (1,420 orders)</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credential Handover Log */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline text-sm font-bold text-slate-900">
                      Handover Vault & Live Verification Status
                    </h2>
                    <span className="text-xs font-bold text-[#009668] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      All Checks Passed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl">
                      <p className="text-[12px] font-bold uppercase text-slate-400 mb-0.5">
                        Riot Access
                      </p>
                      <p className="text-xs text-[#009668] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Dispatched & Tested
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl">
                      <p className="text-[12px] font-bold uppercase text-slate-400 mb-0.5">
                        Primary OGE
                      </p>
                      <p className="text-xs text-[#009668] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Secured by Buyer
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl">
                      <p className="text-[12px] font-bold uppercase text-slate-400 mb-0.5">
                        2FA Rebinding
                      </p>
                      <p className="text-xs text-[#009668] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmed Active
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Underlying Sidebar */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 h-fit space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline text-sm font-bold text-slate-900">
                    Escrow Guarantee Guard
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Funds are protected under Safedeal Triple-Key Lock until receipt confirmation.
                  </p>
                </div>

                {!isCompleted ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Open Escrow Release Dialog</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-[#009668]">
                    Order Completed • $195.00 Escrow Disbursed
                  </div>
                )}

                <div className="pt-2 text-center">
                  <Link
                    href={`/orders/${orderId}`}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    ← Back to Order Console
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE MODAL DIALOG OVERLAY */}
          <OrderCompletionReleaseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirmRelease={handleConfirmRelease}
            orderNumber={`#${orderId}`}
            sellerName="AeroGamingDeals"
            assetName="Valorant Peak Immortal 3 (Champions 2021 Vandal + Arcane Sheriff)"
            totalAmount={195.0}
            netPayout={185.25}
            hoursRemaining={37}
          />
        </div>
      </main>

      {/* Global Footer */}
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

        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
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
                <span className="flex items-center gap-1.5">USD ($)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

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

export default function OrderReleasePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderReleaseContent />
    </React.Suspense>
  );
}
