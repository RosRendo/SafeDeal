"use client";

import React from "react";
import {
  CreditCard,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Headphones,
  FileCheck,
} from "lucide-react";

interface EscrowExplanationProps {
  onOpenProtectionModal: () => void;
}

export default function EscrowExplanation({
  onOpenProtectionModal,
}: EscrowExplanationProps) {
  const steps = [
    {
      num: "01",
      icon: CreditCard,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      title: "Deposit & Secure Hold",
      desc: "Pay securely via credit card, PayPal, or crypto. Funds are deposited into the Safedeal Escrow Vault and cannot be accessed or withdrawn by the seller.",
      highlights: [
        "PCI-DSS Level 1 processing",
        "Multi-sig cold isolation",
        "Instant transaction receipt",
      ],
    },
    {
      num: "02",
      icon: Clock,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      title: "Receive & 48h Inspection",
      desc: "Seller delivers credentials or keys instantly. You receive a full 48-hour window to change passwords, bind your authenticators, and verify goods.",
      highlights: [
        "Automated credential reveal",
        "48-hour inspection countdown",
        "Dispute freeze button available 24/7",
      ],
    },
    {
      num: "03",
      icon: ShieldCheck,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      title: "Confirm & Release Funds",
      desc: "Payment releases to the seller only when you are 100% satisfied. If any discrepancy arises, Safedeal arbitration guarantees a full refund.",
      highlights: [
        "100% money-back guarantee",
        "Human arbitration in <15m",
        "Anti-recall fraud protection",
      ],
    },
  ];

  return (
    <section className="w-full bg-slate-50 py-16 sm:py-20 border-y border-slate-200/60">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[12px] font-bold uppercase tracking-wider text-blue-600">
            Institutional Security Protocol
          </span>
          <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 mb-3">
            How Safedeal Escrow Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Every transaction is shielded by regulated escrow technology. Your funds
            remain protected in our vault until you inspect and verify delivery.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-clean-sm hover:shadow-clean-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-headline text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                      Step {step.num}
                    </span>
                  </div>

                  <h3 className="font-headline text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <ul className="space-y-2">
                    {step.highlights.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-[12px] font-medium text-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges Strip */}
        <div className="mt-10 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-clean-xs flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>256-Bit Encrypted Escrow</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>48-Hour Full Money Back</span>
          </div>

          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-blue-600" />
            <span>Human Arbitration in &lt;15 mins</span>
          </div>

          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Chargeback Risk</span>
          </div>
        </div>

        {/* Read full policy button */}
        <div className="mt-8 text-center">
          <button
            onClick={onOpenProtectionModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-clean-sm transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Read Safedeal Escrow Guarantee Policy</span>
          </button>
        </div>
      </div>
    </section>
  );
}
