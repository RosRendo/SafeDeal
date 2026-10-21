"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import EscrowGuaranteeModal from "@/components/pages/EscrowGuaranteeModal";
import {
  ShieldCheck,
  Shield,
  Zap,
  Lock,
  Unlock,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Coins,
  CreditCard,
  Building,
  KeyRound,
  FileText,
  BadgeCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function ProtectionGuaranteePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"guarantee" | "fees" | "tiers" | "rules">("guarantee");

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-slate-900 flex flex-col antialiased selection:bg-[var(--cobalt-acc)] selection:text-white">
      <Header
        activeCategory="all"
        onSelectCategory={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenProtectionModal={() => setIsModalOpen(true)}
      />

      <main className="w-full pt-28 flex-1">
        {/* Hero Section */}
        <div className="bg-[var(--ds-navy)] text-white py-16 sm:py-20 relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,81,213,0.25),transparent_50%)] pointer-events-none" />
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SafeDeal Institutional Escrow Shield</span>
            </div>

            <h1 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
              100% Buyer Protection & Escrow Protocol Guarantee
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed font-sans">
              Zero buyer risk. Funds are held in cryptographically locked escrow until you inspect in-game inventory, rotate passwords, and securely bind your personal 2FA.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link
                href="/browse"
                className="px-6 py-3 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Protected Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>View Escrow Architecture</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="sticky top-28 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2.5">
            {[
              { id: "guarantee", label: "4-Pillar Guarantee", icon: ShieldCheck },
              { id: "fees", label: "Transparent Fee Schedule", icon: Coins },
              { id: "tiers", label: "Merchant Verification Tiers", icon: BadgeCheck },
              { id: "rules", label: "Community & Escrow Rules", icon: Scale },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {activeTab === "guarantee" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="font-headline text-2xl font-bold text-slate-900">
                  How SafeDeal Protects Your Purchase
                </h2>
                <p className="text-xs text-slate-500">
                  Every account, license key, and digital asset traded on SafeDeal follows our non-custodial double-handshake escrow protocol.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">
                    1. 100% Escrow Hold
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Seller receives zero funds upfront. Payment is frozen in an institutional escrow ledger until you confirm full ownership.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">
                    2. 48-Hour Safety Timer
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You have up to 48 hours to login, change credentials, bind personal phone/email, and verify rare inventory in-game.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">
                    3. Decrypted Vault Security
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Credentials and OGE recovery tokens are delivered via AES-256 decrypted vault with auto-clearing clipboard protection.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Scale className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">
                    4. Anti-Reclaim Bond Guarantee
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All merchants post security deposit bonds up to $5,000. If an account is ever reclaimed, you receive an immediate refund.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "fees" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="font-headline text-2xl font-bold text-slate-900">
                  Transparent Fee Schedule
                </h2>
                <p className="text-xs text-slate-500">
                  No hidden charges, surprise checkout markups, or withdrawal fees.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-clean-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-lg font-bold text-slate-900">Buyer Fee</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-sm">
                      0.0% FREE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Buyers pay exactly the listed product price. Full escrow protection, vault decryption, and 48-hour dispute rights are 100% complimentary.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Zero checkout convenience fees</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Complimentary offline PDF vault backup</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Free live arbitrator mediation</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-clean-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-lg font-bold text-slate-900">Merchant Settlement Fee</span>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[var(--cobalt-acc)] font-extrabold text-sm">
                      2.5% – 5.0%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Deducted only upon successful order completion and escrow release. No listing fees, monthly subscriptions, or storefront charges.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--cobalt-acc)]" />
                      <span>Standard Tier: 5.0% settlement</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--cobalt-acc)]" />
                      <span>PRO Merchant: 3.5% settlement</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--cobalt-acc)]" />
                      <span>VIP Bonded Broker: 2.5% settlement</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tiers" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="font-headline text-2xl font-bold text-slate-900">
                  Merchant Verification & Security Tiers
                </h2>
                <p className="text-xs text-slate-500">
                  Every seller on SafeDeal is continuously surveilled against fraud thresholds and biometric verification.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                    Tier 1
                  </span>
                  <h3 className="font-headline text-base font-bold text-slate-900">
                    Standard Merchant
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Email and mobile verified. Deliveries subject to standard 48-hour escrow clearing before payout.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-blue-200 shadow-2xs space-y-3 ring-2 ring-blue-500/20">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-bold uppercase tracking-wider">
                    Tier 2 (PRO)
                  </span>
                  <h3 className="font-headline text-base font-bold text-slate-900">
                    Verified PRO Merchant
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Government biometric ID verified with Stripe Identity. Minimum 50+ successful transactions with under 0.5% dispute rate.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-3 ring-2 ring-emerald-500/20">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                    Tier 3 (VIP)
                  </span>
                  <h3 className="font-headline text-base font-bold text-slate-900">
                    Bonded VIP Broker
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Full corporate KYC and a minimum $5,000 cash bond held in escrow reserve to guarantee lifetime anti-recall protection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
              <div className="text-center space-y-2 mb-6">
                <h2 className="font-headline text-2xl font-bold text-slate-900">
                  SafeDeal Escrow & Community Protocol
                </h2>
                <p className="text-xs text-slate-500">
                  Binding rules governing all transactions, deliveries, and disputes.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <h4 className="font-headline font-bold text-sm text-slate-900">
                  1. Zero-Tolerance Anti-Reclaim Policy
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Any attempt by a seller to recover an account via publisher support tickets results in permanent HWID blacklisting, forfeiture of bonded deposits, and immediate 100% buyer refund.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <h4 className="font-headline font-bold text-sm text-slate-900">
                  2. Mandatory OGE Handover Verification
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full-access accounts must include primary creation email credentials. Buyers are required to complete the 4-step security checklist before releasing payment.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <h4 className="font-headline font-bold text-sm text-slate-900">
                  3. 4-Hour Arbitration SLA
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If an escrow dispute is initiated, the 48-hour countdown freezes instantly. A human SafeDeal arbitration officer joins the chat within 4 hours to review evidentiary logs.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer
        onSelectCategory={() => {}}
        onOpenProtectionModal={() => setIsModalOpen(true)}
      />

      <EscrowGuaranteeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
