"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import EscrowGuaranteeModal from "@/components/pages/EscrowGuaranteeModal";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);

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
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Zero-Log Credential Protocol</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight">
              Privacy Policy & Data Security Architecture
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl">
              SafeDeal's commitment to cryptographic privacy, zero plaintext credential storage, and strict fiduciary data minimization.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Key Safeguard Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-headline font-bold text-sm text-slate-900">
                AES-256 Envelope Encryption
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Credentials deposited by sellers are sealed with user-derived keys. We never store passwords in plaintext.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="font-headline font-bold text-sm text-slate-900">
                Zero-Log Inspection
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Once the 48-hour escrow window finishes and funds release, decrypted credentials expire from active session buffers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-headline font-bold text-sm text-slate-900">
                FinCEN / KYC Compliance
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Identity documents for merchant payouts are tokenized via certified PCI-DSS Level 1 third-party partners.
              </p>
            </div>
          </div>

          {/* Privacy Clauses */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-headline font-bold text-base sm:text-lg text-slate-900">
                1. Information We Collect
              </h2>
              <p>
                To provide fiduciary escrow services, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Identity:</strong> Email address, pseudonym, and public rating history.</li>
                <li><strong>Transaction Records:</strong> Order IDs, timestamp of vault delivery, inspection status, and payment transaction hashes.</li>
                <li><strong>Risk & Telemetry:</strong> Anonymized machine fingerprints, browser user-agent, and ASN verification solely for stopping account takeovers and card burst fraud.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="font-headline font-bold text-base sm:text-lg text-slate-900">
                2. Cryptographic Storage of Digital Goods
              </h2>
              <p>
                Unlike standard ecommerce platforms, SafeDeal uses automated client-side cryptographic envelopes. When a seller lists an account or code, the payload is encrypted prior to database storage. SafeDeal staff and administrators have zero technical access to decrypt credentials without an active dispute authorization key signed by both parties.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="font-headline font-bold text-base sm:text-lg text-slate-900">
                3. Third-Party Data Disclosures
              </h2>
              <p>
                We do not sell, monetize, or broker personal user information. Data is shared exclusively with:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Stripe & Banking Gateways:</strong> For processing credit cards and seller payouts.</li>
                <li><strong>Verification Partners (Persona / SumSub):</strong> For merchant Tier 2 & 3 KYC compliance.</li>
                <li><strong>Law Enforcement:</strong> Only under valid court subpoena in cases of confirmed stolen property or unauthorized financial access.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="font-headline font-bold text-base sm:text-lg text-slate-900">
                4. Your Rights & Data Erasure
              </h2>
              <p>
                You may request complete account deletion and personal data erasure at any time via your <Link href="/settings" className="text-blue-600 hover:underline font-bold">Account Settings Console</Link>. Transaction hashes are retained strictly as required by international anti-money laundering (AML) statutes.
              </p>
            </section>
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
