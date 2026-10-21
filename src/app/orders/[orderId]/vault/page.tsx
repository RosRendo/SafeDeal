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
  Lock,
  Headphones,
  CircleDollarSign,
  Check,
  Award,
} from "lucide-react";
import AssetVaultModal from "@/components/orders/AssetVaultModal";
import Header from "@/components/navigation/Header";

function OrderAssetVaultContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = typeof params?.orderId === "string" ? params.orderId : "SF-2024-88492";

  // State
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [vaultData, setVaultData] = useState({
    sellerName: "VanguardKeys_US",
    riotId: "ApexVandal_99#NA1",
    password: "K#9mX$7vLq!2024",
    region: "North America (NA / US-East)",
    ogeEmail: "apexvandal_original@proton.me",
    ogePassword: "Vand4l!Proton#Secure98",
    recoveryToken: "RPT-2021-994821",
  });

  React.useEffect(() => {
    async function fetchOrderVault() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const order = json.data;
          const delivery = order.deliveryData || order.credentials;
          if (delivery) {
            setVaultData({
              sellerName: order.seller?.username || "Verified Merchant",
              riotId: delivery.login || delivery.key || "Account Secured",
              password: delivery.pass || delivery.password || "••••••••••••",
              region: order.item?.game || "Global Digital Asset",
              ogeEmail: delivery.email || delivery.ogeEmail || "Unbound / Direct Access",
              ogePassword: delivery.pass || "Verified Secure",
              recoveryToken: delivery.token || `SF-${order.id}-SAFE`,
            });
          }
        }
      } catch (e) {
        // Fallback to default
      }
    }
    fetchOrderVault();
  }, [orderId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-slate-900 flex flex-col antialiased selection:bg-[var(--cobalt-acc)] selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-[var(--ds-navy)] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-blue-500/40 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-1 cursor-pointer"
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
          {/* Dimmed & Detailed Order Inspection Viewport (#SF-2024-88492) */}
          <div
            className={`w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 transition-all duration-300 ${
              isVaultOpen
                ? "select-none opacity-40 pointer-events-none filter blur-[1.5px]"
                : "opacity-100 blur-none pointer-events-auto"
            }`}
          >
            {/* Top Inspection Navigation & Breadcrumb Mock */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Link href="/orders" className="hover:text-blue-600 transition-colors">
                  Orders
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[var(--cobalt-acc)] font-bold">#{orderId}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900">Escrow Asset Inspection Phase</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 font-bold text-xs text-slate-800 border border-slate-200">
                  Status: In Escrow Verification
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[var(--cobalt-acc)] font-bold text-xs border border-blue-200">
                  48h Safety Timer
                </span>
              </div>
            </div>

            {/* Background Inspection Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Inspection Panel */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Asset Preview Banner */}
                <div className="bg-white rounded-2xl p-6 shadow-clean-sm border border-slate-200/80 flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-56 h-36 rounded-xl bg-slate-900 overflow-hidden relative shadow-xs border border-slate-200 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop"
                      alt="Valorant Account"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 text-slate-900 font-bold text-[11px] shadow-xs backdrop-blur-xs">
                      Immortal 3 (312 RR)
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[12px] mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Riot Games • Full Access (FA + OGE) • NA Region</span>
                    </div>
                    <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900 mb-1">
                      Valorant Stacked High-Tier Account
                    </h2>
                    <p className="text-xs text-slate-500 mb-3">
                      Includes Champions 2021 Vandal, Prime Karambit, Arcane Sheriff, 45,000 VP spent invoice proof.
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="font-headline text-2xl font-black text-slate-900">
                        $389.00
                      </span>
                      <span className="text-[12px] font-bold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600 border border-slate-200">
                        Escrow Protected #ESC-8919
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inspection Timeline & Verification Pipeline Mock */}
                <div className="bg-white rounded-2xl p-6 shadow-clean-sm border border-slate-200/80">
                  <h3 className="font-headline text-base font-bold text-slate-900 mb-4">
                    Automated Vault Pipeline
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                      <Zap className="w-6 h-6 text-[var(--cobalt-acc)] mx-auto mb-1" />
                      <div className="font-bold text-slate-900 mt-1">Payment Escrowed</div>
                      <div className="text-slate-500 text-[12px]">Cleared Oct 24, 14:10</div>
                    </div>
                    <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
                      <Lock className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                      <div className="font-bold text-slate-900 mt-1">Vault Decrypted</div>
                      <div className="text-slate-500 text-[12px]">Ready for Handover</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 opacity-60">
                      <ShieldCheck className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <div className="font-bold text-slate-900 mt-1">Funds Release</div>
                      <div className="text-slate-500 text-[12px]">Pending Buyer OK</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Sidebar: Seller Details */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-clean-sm border border-slate-200/80">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-headline text-sm font-bold text-slate-900 shadow-xs">
                      VK
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1">
                        VanguardKeys_US
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-xs text-slate-500">★ 4.99 (2,410 trades) • KYC Tier 3</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/70">
                    Seller deposit held:{" "}
                    <strong className="text-slate-900">$5,000 Bond</strong> against account retrieval or
                    recovery attempts.
                  </div>

                  <button
                    onClick={() => setIsVaultOpen(true)}
                    className="w-full mt-4 py-3 bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Open Access Credentials Vault</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
                 ACTIVE MODAL OVERLAY: Digital Asset Handover & Access Credentials
                 ========================================================================= */}
          <AssetVaultModal
            isOpen={isVaultOpen}
            onClose={() => {
              setIsVaultOpen(false);
              showToast("Vault credentials can be re-accessed at any time during your 37h escrow period.");
            }}
            orderNumber={`#${orderId}`}
            sellerName={vaultData.sellerName}
            riotId={vaultData.riotId}
            password={vaultData.password}
            region={vaultData.region}
            ogeEmail={vaultData.ogeEmail}
            ogePassword={vaultData.ogePassword}
            recoveryToken={vaultData.recoveryToken}
            onConfirmVerification={() => {
              setIsVaultOpen(false);
              showToast("Handover verified! 48h Inspection Window active under Escrow Shield.");
            }}
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

export default function OrderAssetVaultPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderAssetVaultContent />
    </React.Suspense>
  );
}
