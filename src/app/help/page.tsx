"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import EscrowGuaranteeModal from "@/components/pages/EscrowGuaranteeModal";
import {
  ShieldCheck,
  Search,
  HelpCircle,
  Clock,
  Lock,
  ChevronDown,
  ArrowRight,
  Gavel,
  DollarSign,
  MessageSquare,
  FileText,
  AlertCircle,
  ExternalLink,
  Zap,
  CheckCircle2,
  LifeBuoy,
  X,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "escrow" | "vault" | "disputes" | "seller";
  question: string;
  answer: string;
}

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "escrow" | "vault" | "disputes" | "seller">("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      category: "escrow",
      question: "How does the SafeDeal 48-Hour Inspection Window work?",
      answer:
        "When you purchase any digital asset (game account, key, or license), your payment is locked in our secure smart escrow ledger. The seller does not receive the funds until you inspect the asset, change credentials, and confirm satisfaction, OR until 48 hours lapse without a dispute being logged. If you encounter issues, filing a dispute instantly halts the release timer indefinitely.",
    },
    {
      id: "faq-2",
      category: "vault",
      question: "How does automated vault delivery protect my login credentials?",
      answer:
        "Sellers deposit account credentials or serial keys into our AES-256-GCM encrypted vault prior to listing or immediately upon checkout. Once payment is confirmed, the vault key unlocks directly in your order console. We enforce a zero-logs policy on decrypted credentials, and our system prompts you to change the registered email and bind your own authenticator before releasing escrow.",
    },
    {
      id: "faq-3",
      category: "disputes",
      question: "What evidence is required if a game key or account does not work?",
      answer:
        "If an account is banned, credentials fail, or a serial key returns 'Already Activated', submit an unedited screen recording or screenshot via the Dispute Desk. Our AI video OCR and human arbitration officers cross-reference redemption timestamps with game publisher APIs to ensure rapid, fair resolution within 4 hours.",
    },
    {
      id: "faq-4",
      category: "seller",
      question: "When and how do sellers receive their payout funds?",
      answer:
        "Funds unlock to your available seller balance the moment the buyer clicks 'Confirm & Release Escrow' or when the 48-hour inspection countdown expires cleanly. You can withdraw to Stripe Connect, SEPA Instant Bank Transfer, PayPal, or USDT with zero holding fees. Tier 2 and Tier 3 verified merchants receive instant automated payout clearances.",
    },
    {
      id: "faq-5",
      category: "escrow",
      question: "Can sellers reclaim or recall game accounts after escrow releases?",
      answer:
        "All verified sellers sign our Binding Merchant Indemnity Agreement. In the rare event of an account rollback or original-owner recovery post-release, SafeDeal covers the buyer under our $50,000 Merchant Guarantee Fund, refunds the buyer, and recovers the funds from the seller's escrow security reserve while sanctioning the merchant.",
    },
    {
      id: "faq-6",
      category: "disputes",
      question: "What is Force Settlement / Arbitrated Split in a dispute?",
      answer:
        "If a dispute cannot be mutually resolved between buyer and seller, a Level 3 SafeDeal Arbitration Officer reviews evidence and issues a final, binding decision. The officer can issue a 100% Buyer Refund, a 100% Seller Release, or an equitable 50/50 Split Settlement if partial digital goods or currency were consumed.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-slate-900 font-sans flex flex-col">
      <Header
        activeCategory="all"
        onSelectCategory={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
      />

      <main className="flex-1 pt-[104px] sm:pt-[108px] pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[var(--ds-navy)] to-[var(--ds-navy-2)] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>SafeDeal Knowledge Base & Support Desk</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight">
              How can we assist your escrow transaction today?
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Find instant answers regarding 48-hour inspection timelines, credential vault encryption, dispute mediation, and merchant payouts.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto pt-4">
              <div className="relative flex items-center bg-slate-900/90 border border-slate-700 rounded-2xl p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-xl transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles: 'dispute timeline', 'vault delivery', 'payout fees'..."
                  className="w-full py-2.5 px-3 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mr-3 text-slate-400 hover:text-white p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Topic Category Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveCategory("escrow")}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm ${
                activeCategory === "escrow"
                  ? "bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-md"
                  : "bg-white border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-headline font-bold text-sm text-slate-900">
                Escrow & Inspection
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                48-hour timer, dual release confirmation, fund safeguards.
              </p>
            </button>

            <button
              onClick={() => setActiveCategory("vault")}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm ${
                activeCategory === "vault"
                  ? "bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-md"
                  : "bg-white border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-headline font-bold text-sm text-slate-900">
                Credential Vault
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Automated delivery, zero-log decryption, email rebinding.
              </p>
            </button>

            <button
              onClick={() => setActiveCategory("disputes")}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm ${
                activeCategory === "disputes"
                  ? "bg-white border-rose-600 ring-2 ring-rose-600/20 shadow-md"
                  : "bg-white border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <Gavel className="w-5 h-5" />
              </div>
              <h3 className="font-headline font-bold text-sm text-slate-900">
                Disputes & Refunds
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Evidence submission, video OCR, arbitrated splits.
              </p>
            </button>

            <button
              onClick={() => setActiveCategory("seller")}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm ${
                activeCategory === "seller"
                  ? "bg-white border-purple-600 ring-2 ring-purple-600/20 shadow-md"
                  : "bg-white border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-headline font-bold text-sm text-slate-900">
                Seller Payouts
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Withdrawals via Stripe & SEPA, low fees (2.5-5%), reserve rules.
              </p>
            </button>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="font-headline text-2xl font-extrabold text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clear answers governed by the SafeDeal Escrow Agreement.
              </p>
            </div>
            {activeCategory !== "all" && (
              <button
                onClick={() => setActiveCategory("all")}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Reset Filter (Show All)
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-headline font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Escalation Banner */}
          <div className="mt-12 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-clean-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <LifeBuoy className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm text-slate-900">
                  Still have questions or need human mediation?
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Our 24/7 Trust & Safety officers resolve escalations in under 15 minutes.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/messages"
                className="px-4 py-2.5 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Concierge Chat</span>
              </Link>
              <Link
                href="/protection"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Guarantee Protocol
              </Link>
            </div>
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
