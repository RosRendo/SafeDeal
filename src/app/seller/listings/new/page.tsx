"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Shield,
  Zap,
  Star,
  Plus,
  Bell,
  User,
  ArrowRight,
} from "lucide-react";
import CreateListingWizard from "@/components/seller/CreateListingWizard";
import SellerHeader from "@/components/navigation/SellerHeader";

export default function NewListingPage() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-slate-900 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold border border-slate-200/90 animate-in fade-in slide-in-from-bottom-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Seller Hub Header */}
      <SellerHeader activeTab="new-listing" />

      {/* Main Form Area */}
      <main className="w-full pt-16 bg-[var(--ds-surface)] min-h-screen flex-1 flex flex-col">
        <CreateListingWizard
          onBack={() => router.push("/seller/listings")}
          onPublishSuccess={(savedItem) => {
            router.push(`/seller/listings?new=true&id=${savedItem.id}`);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white shadow-xs border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--cobalt-acc)] flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-headline font-bold text-lg text-slate-900">
                  Safedeal
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-bold uppercase">
                  Seller Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                High-velocity, bank-grade marketplace infrastructure for verified digital goods sellers, key distributors, and virtual currency merchants.
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Safedeal Shield Protected</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant API Fulfillment</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Seller Policies
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Seller Protection Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Merchant Guidelines
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Prohibited Items & Assets
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Verification Standard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Operations & Finance
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Fee Schedules & Tiers
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/seller/earnings">
                    Payout Timelines
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/seller/earnings">
                    Tax & Invoice Center
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Escrow Security Protocol
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Seller Support
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/admin/disputes">
                    Dispute Resolution Desk
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/help">
                    Seller Knowledge Base
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Chargeback Defense
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/messages">
                    24/7 Merchant Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Safedeal Global Ltd. All rights reserved. Encrypted escrow marketplace.</p>
            <div className="flex items-center gap-4">
              <Link className="hover:text-slate-900 transition-colors" href="/terms">
                Terms of Service
              </Link>
              <Link className="hover:text-slate-900 transition-colors" href="/privacy">
                Privacy Policy
              </Link>
              <Link className="hover:text-slate-900 transition-colors" href="/protection">
                Security Overview
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
