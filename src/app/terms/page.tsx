"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import EscrowGuaranteeModal from "@/components/pages/EscrowGuaranteeModal";
import {
  ShieldCheck,
  FileText,
  Clock,
  Lock,
  Gavel,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Ban,
} from "lucide-react";

export default function TermsOfServicePage() {
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("section-1");

  const sections = [
    { id: "section-1", title: "1. Scope of Escrow Agency", icon: ShieldCheck },
    { id: "section-2", title: "2. Automated Vault Handover", icon: Lock },
    { id: "section-3", title: "3. 48-Hour Inspection Window", icon: Clock },
    { id: "section-4", title: "4. Fund Holds & Release Criteria", icon: DollarSign },
    { id: "section-5", title: "5. Disputes & Binding Arbitration", icon: Gavel },
    { id: "section-6", title: "6. Prohibited Digital Assets", icon: Ban },
    { id: "section-7", title: "7. Merchant Sanctions & Indemnity", icon: AlertTriangle },
  ];

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
        <div className="bg-[var(--ds-navy)] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>Legal & Regulatory Framework</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight">
              Terms of Escrow Service & Merchant Agreement
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl">
              Last updated: October 2026 • Governs all buyers, sellers, credential vault transactions, and arbitrated fund releases on SafeDeal.
            </p>
          </div>
        </div>

        {/* Content Body with Sticky Sidebar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Jump TOC */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 block">
                  Table of Contents
                </span>
                {sections.map((s) => {
                  const Icon = s.icon;
                  const isActive = activeSection === s.id;
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={() => setActiveSection(s.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </a>
                  );
                })}

                <div className="pt-4 mt-2 border-t border-slate-100 px-2 space-y-2">
                  <Link
                    href="/privacy"
                    className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold"
                  >
                    <span>Read Privacy Policy</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Link
                    href="/protection"
                    className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold"
                  >
                    <span>Buyer Protection Guarantee</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Right Column: Legal Clauses */}
            <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-10 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <section id="section-1" className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-headline font-bold text-base sm:text-lg">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <h2>1. Scope of Escrow Agency</h2>
                </div>
                <p>
                  SafeDeal Global Inc. ("SafeDeal", "we", "us") acts as an independent, trusted escrow agent for peer-to-peer and merchant digital asset transactions. When a buyer submits payment for a listing, SafeDeal holds the funds in a segregated, ring-fenced escrow account. SafeDeal is not the original owner, creator, or licensor of any digital goods, but guarantees fiduciary execution according to these terms.
                </p>
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-900 font-medium text-xs">
                  <strong>Key Protection:</strong> Sellers never receive direct access to buyer credit card numbers or banking data, and buyers never pay a seller directly without escrow coverage.
                </div>
              </section>

              <section id="section-2" className="space-y-3 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2 text-slate-900 font-headline font-bold text-base sm:text-lg">
                  <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h2>2. Automated Vault Handover</h2>
                </div>
                <p>
                  All credentials, keys, activation codes, or handover instructions must be deposited through the SafeDeal Delivery Vault. The Delivery Vault employs client-side AES-256-GCM envelope encryption. Decryption keys are released strictly to the buyer after payment authorization is verified by our fraud engine. Off-platform deliveries via Discord, Telegram, or direct email are expressly prohibited and forfeit all escrow protections.
                </p>
              </section>

              <section id="section-3" className="space-y-3 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2 text-slate-900 font-headline font-bold text-base sm:text-lg">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                  <h2>3. 48-Hour Inspection Window</h2>
                </div>
                <p>
                  Upon vault decryption, a 48-hour countdown timer begins. During this window, the buyer must:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Log in and verify that the account rank, skins, virtual currency balance, or license validity match the listing description exactly.</li>
                  <li>Update the registered primary recovery email address to an email under the buyer's sole ownership.</li>
                  <li>Enable two-factor authentication (2FA) and unlink any legacy third-party social accounts (Twitch, Google, Xbox).</li>
                </ul>
                <p>
                  If the buyer confirms satisfaction or the 48-hour window expires with zero logged disputes, the escrow funds automatically release to the seller.
                </p>
              </section>

              <section id="section-4" className="space-y-3 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2 text-slate-900 font-headline font-bold text-base sm:text-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h2>4. Fund Holds & Release Criteria</h2>
                </div>
                <p>
                  SafeDeal charges buyers <strong>0% buyer fee</strong> on all catalog purchases. Verified sellers pay a platform fee between <strong>2.5% and 5.0%</strong> depending on merchant tier. Funds are cleared instantly upon release and may be withdrawn to Stripe Connect, SEPA Instant Rail, or stablecoin USDT without payout delay.
                </p>
              </section>

              <section id="section-5" className="space-y-3 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2 text-slate-900 font-headline font-bold text-base sm:text-lg">
                  <Gavel className="w-5 h-5 text-rose-600 shrink-0" />
                  <h2>5. Disputes & Binding Arbitration</h2>
                </div>
                <p>
                  If a buyer logs an issue prior to 48 hours, the release timer halts immediately. Both parties are given 24 hours to exchange evidence via the Dispute Desk. If no consensus is reached, a SafeDeal Level 3 Arbitration Officer steps in. The Officer's decision is final and binding, resulting in either a 100% Buyer Refund, a 100% Seller Release, or a 50/50 Equitable Split Settlement.
                </p>
              </section>

              <section id="section-6" className="space-y-3 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2 text-slate-900 font-headline font-bold text-base sm:text-lg">
                  <Ban className="w-5 h-5 text-rose-600 shrink-0" />
                  <h2>6. Prohibited Digital Assets</h2>
                </div>
                <p>
                  The following assets are strictly banned from SafeDeal:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Phished, credential-stuffed, hacked, or unauthorized accounts.</li>
                  <li>Carded game keys purchased with stolen payment cards.</li>
                  <li>Cheats, exploits, DDoS tools, malware, or unlawful bot utilities.</li>
                  <li>Accounts involved in ongoing game publisher ban waves.</li>
                </ul>
              </section>

              <section id="section-7" className="space-y-3 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2 text-slate-900 font-headline font-bold text-base sm:text-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <h2>7. Merchant Sanctions & Indemnity</h2>
                </div>
                <p>
                  Sellers agree to indemnify SafeDeal against all post-sale account rollbacks or fraud claims. If a seller pulls back an account or supplies duplicate keys, SafeDeal reserves the right to freeze the merchant's rolling reserve balance, levy administrative recovery fees, and permanently terminate the account across all global operations.
                </p>
              </section>
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
