"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import EscrowGuaranteeModal from "@/components/pages/EscrowGuaranteeModal";
import {
  ShieldCheck,
  Compass,
  ShoppingBag,
  Store,
  Terminal,
  MessageSquare,
  Lock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
  Filter,
  DollarSign,
  Gavel,
  AlertTriangle,
  UserCheck,
  KeyRound,
  FileText,
  LifeBuoy,
} from "lucide-react";

interface RouteItem {
  path: string;
  title: string;
  description: string;
  category: "buyer" | "seller" | "ops" | "security";
  tag: string;
  badgeColor: string;
}

export default function PlatformDirectoryPage() {
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "buyer" | "seller" | "ops" | "security">("all");
  const [searchFilter, setSearchFilter] = useState("");

  const routes: RouteItem[] = [
    // Buyer Flow
    {
      path: "/",
      title: "Marketplace Discovery & Landing",
      description: "Hero showcase, trending digital assets, verification guarantee badge, and merchant highlights.",
      category: "buyer",
      tag: "Buyer Flow",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      path: "/browse",
      title: "Catalog Search & Filtering",
      description: "Filter accounts, serial keys, and currency by game platform, delivery speed, and price.",
      category: "buyer",
      tag: "Buyer Flow",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      path: "/listing/LST-001",
      title: "Product Detail & Escrow Buy",
      description: "Asset specs, seller trust rating, automated delivery badge, and instant buy with escrow hold.",
      category: "buyer",
      tag: "Buyer Flow",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      path: "/checkout",
      title: "Escrow Checkout & Payment",
      description: "Zero buyer fee breakdown, payment method selection, and escrow guarantee affirmation.",
      category: "buyer",
      tag: "Buyer Flow",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      path: "/orders",
      title: "Buyer Escrow Orders Desk",
      description: "Track in-flight orders, 48-hour inspection timers, delivery receipts, and warranty status.",
      category: "buyer",
      tag: "Buyer Flow",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      path: "/orders/SF-2024-88492",
      title: "Order Inspection & Handover",
      description: "Decrypted credential inspection, email verification checklist, and direct mediation trigger.",
      category: "buyer",
      tag: "Buyer Flow",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      path: "/orders/SF-2024-88492/vault",
      title: "Secure Credential Vault",
      description: "Client-side decrypted credentials, copy tokens, and account change-of-ownership guide.",
      category: "buyer",
      tag: "Buyer Flow",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      path: "/orders/SF-2024-88492/release",
      title: "Confirm Order & Release Escrow",
      description: "3-point safeguard checklist, 5-star seller rating, review textarea, and settlement payout.",
      category: "buyer",
      tag: "Buyer Flow",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      path: "/orders/SF-2024-88492/dispute",
      title: "Dispute Desk & Mediation",
      description: "File claim, submit video OCR evidence, halt release timer, and request arbitration.",
      category: "buyer",
      tag: "Buyer Flow",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    },

    // Seller Flow
    {
      path: "/sell",
      title: "Seller Hub & Storefront",
      description: "Live revenue metrics, order dispatch queues, active inventory status, and payout summary.",
      category: "seller",
      tag: "Seller Hub",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      path: "/seller/listings",
      title: "Listings & Inventory Manager",
      description: "Manage digital stock, auto-fulfill keys, price adjustments, and catalog sync.",
      category: "seller",
      tag: "Seller Hub",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      path: "/seller/listings/new",
      title: "Create Listing Wizard (4 Steps)",
      description: "Asset category, game metadata, delivery method (Automated vs Manual), and vault deposit.",
      category: "seller",
      tag: "Seller Hub",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      path: "/seller/orders",
      title: "Seller Orders & Fulfillment Desk",
      description: "Pending delivery queues, handover confirmations, and buyer inspection timers.",
      category: "seller",
      tag: "Seller Hub",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      path: "/seller/orders/SF-2024-88492",
      title: "Seller Order Detail & Vault Deposit",
      description: "Credential upload interface, account unbind affirmation, and release audit log.",
      category: "seller",
      tag: "Seller Hub",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      path: "/seller/earnings",
      title: "Earnings & Payout Ledger",
      description: "Ledger transaction breakdown, escrow hold balances, Stripe / SEPA withdrawal desk.",
      category: "seller",
      tag: "Seller Hub",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      path: "/store/aerogamingdeals",
      title: "Public Merchant Store Profile",
      description: "Public seller reputation (4.98★), total verified sales (1,840+), and live catalog.",
      category: "seller",
      tag: "Seller Hub",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },

    // Ops & Admin Flow
    {
      path: "/admin",
      title: "Operations Telemetry Overview",
      description: "Real-time Kafka event streams, SLA alert queues, high-risk flags, and system health.",
      category: "ops",
      tag: "Admin Console",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      path: "/admin/orders",
      title: "Escrow Orders & Transaction Audits",
      description: "Live order inspection desk, credential delivery state audit, and manual settlement trigger.",
      category: "ops",
      tag: "Admin Console",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      path: "/admin/verifications",
      title: "KYC & Merchant Verification Reviews",
      description: "Government ID OCR analysis, biometric liveness score checks, and Tier elevation authorization.",
      category: "ops",
      tag: "Admin Console",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      path: "/admin/listings",
      title: "Catalog Moderation & Risk Audit",
      description: "Automated off-platform NLP detection, credential pattern validation, and listing sanitation.",
      category: "ops",
      tag: "Admin Console",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      path: "/admin/disputes",
      title: "Dispute Arbitration Management",
      description: "Mediation desk, buyer vs seller evidence comparison, and arbitration disposition options.",
      category: "ops",
      tag: "Admin Console",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      path: "/admin/disputes/force-settle",
      title: "Force Settle & Arbitration Modal",
      description: "Level 3 Dual-Authorization (Supervisor OTP + FIDO2) with 3-way disposition payout.",
      category: "ops",
      tag: "Admin Console",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      path: "/admin/finance",
      title: "Financial Operations & Ledger Reconciliation",
      description: "Multi-gateway escrow ring-fenced funds ($342k+), fee capture analysis, and batch payout dispatch.",
      category: "ops",
      tag: "Admin Console",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      path: "/admin/users",
      title: "User & Merchant Risk Engine",
      description: "Account risk scoring, velocity burst alerts, KYC tier upgrades, and compliance audits.",
      category: "ops",
      tag: "Admin Console",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      path: "/admin/users/sanctions",
      title: "Enforce Account Sanctions Modal",
      description: "Tri-tier severity enforcement (L1/L2/L3), inventory delist, and Stripe reserve freeze.",
      category: "ops",
      tag: "Admin Console",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    },

    // Communication & Platform Security
    {
      path: "/messages",
      title: "Encrypted Escrow Messaging",
      description: "Real-time communication between buyer, seller, and automated vault delivery bot.",
      category: "security",
      tag: "Communication",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      path: "/protection",
      title: "Buyer Protection & Fee Schedule",
      description: "Comprehensive 4-pillar escrow protocol, 0% buyer fees, verification standards, and rules.",
      category: "security",
      tag: "Trust & Safety",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      path: "/settings",
      title: "Account Security & 2FA Console",
      description: "Two-factor authentication toggle, active session revocation, and KYC Tier 2 validation.",
      category: "security",
      tag: "User Console",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      path: "/login",
      title: "Authentication & Persona Switcher",
      description: "1-click instant login for Buyer, Seller, or Admin testing, plus 2FA demonstration.",
      category: "security",
      tag: "Auth & Access",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      path: "/help",
      title: "Help Center & Knowledge Base",
      description: "Searchable escrow FAQ, 48-hour inspection guide, dispute evidence rules, and payouts.",
      category: "security",
      tag: "Support",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      path: "/terms",
      title: "Terms of Escrow Service",
      description: "Legal escrow agency contract, inspection protocols, dispute arbitration, and prohibitions.",
      category: "security",
      tag: "Legal",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    },
    {
      path: "/privacy",
      title: "Zero-Log Privacy Policy",
      description: "Cryptographic vault storage policies, data minimization, and AML compliance terms.",
      category: "security",
      tag: "Legal",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    },
  ];

  const filteredRoutes = routes.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      searchFilter.trim() === "" ||
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-slate-900 font-sans flex flex-col">
      <Header
        activeCategory="all"
        onSelectCategory={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
      />

      <main className="flex-1 pt-[104px] sm:pt-[108px] pb-16">
        {/* Banner */}
        <div className="bg-[var(--ds-navy)] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>SafeDeal Platform Sitemap & Route Index</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight">
              Interactive Application Directory
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Every route, workflow modal, and back-office console across SafeDeal. Click any card to navigate directly and test the full user journey.
            </p>

            {/* Filter and Search Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="inline-flex p-1 rounded-xl bg-slate-800/80 border border-slate-700/80">
                {(
                  [
                    { id: "all", label: "All Routes (26)" },
                    { id: "buyer", label: "Buyer Flow (9)" },
                    { id: "seller", label: "Seller Hub (7)" },
                    { id: "ops", label: "Ops Governance (5)" },
                    { id: "security", label: "Security & Legal (7)" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === tab.id
                        ? "bg-[var(--cobalt-acc)] text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative flex items-center bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter routes or paths..."
                  className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500 w-full font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRoutes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500/60 hover:shadow-clean-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${route.badgeColor}`}
                    >
                      {route.tag}
                    </span>
                    <span className="font-mono text-[12px] text-slate-400 group-hover:text-blue-600 transition-colors">
                      {route.path}
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {route.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {route.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>Open Page</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer
        onSelectCategory={() => {}}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
      />

      <EscrowGuaranteeModal
        isOpen={isProtectionModalOpen}
        onClose={() => setIsProtectionModalOpen(false)}
      />
    </div>
  );
}
