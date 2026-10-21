"use client";

import React from "react";
import {
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  Lock,
  Headphones,
  RotateCcw,
  FileCheck,
} from "lucide-react";

interface TrustProtectionSectionProps {
  onOpenProtectionModal: () => void;
}

export default function TrustProtectionSection({
  onOpenProtectionModal,
}: TrustProtectionSectionProps) {
  const steps = [
    {
      num: "01",
      icon: CreditCard,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      title: "Deposit & Escrow Lock",
      desc: "Buyer payment is placed directly into the Safedeal Multi-Sig Escrow Vault. The seller cannot touch or withdraw funds until you inspect the item.",
      highlights: [
        "PCI-DSS Level 1 Encrypted",
        "Cold multi-sig vault storage",
        "Instant transaction receipt",
      ],
    },
    {
      num: "02",
      icon: Clock,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      title: "48-Hour Inspection Grace",
      desc: "Seller delivers credentials or keys. You have a full 48-hour inspection countdown to test in-game access, change emails, and bind your own 2FA.",
      highlights: [
        "Automated credential decryptor",
        "48-hour live countdown timer",
        "Freeze dispute button available 24/7",
      ],
    },
    {
      num: "03",
      icon: ShieldCheck,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      title: "Confirmed Payout or 100% Refund",
      desc: "Funds release to the seller only after you confirm satisfaction. If there is any discrepancy, our mediation team guarantees a full refund.",
      highlights: [
        "100% money-back guarantee",
        "Human arbitration in <15m",
        "Anti-recall fraud seller penalty",
      ],
    },
  ];

  return (
    <section className="w-full bg-slate-900 text-white py-16 sm:py-20 my-10 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Safedeal Escrow Shield</span>
          </div>
          <h2 className="font-headline text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Bank-Grade Transaction Protection
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Unlike informal trades on Discord or forums, every purchase on Safedeal is
            held in escrow. You never risk getting scammed or locked out.
          </p>
        </div>

        {/* 3 Step Connected Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative mb-12">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700/80 shadow-clean-md flex flex-col justify-between hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-headline text-xs font-black text-slate-400 bg-slate-700/60 px-2.5 py-1 rounded-full">
                      Step {step.num}
                    </span>
                  </div>

                  <h3 className="font-headline text-base font-bold text-white mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed mb-6 font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/60">
                  <ul className="space-y-2">
                    {step.highlights.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-[12px] font-medium text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Trust Badges Strip */}
        <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-slate-300 mb-8">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>

          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>48-Hour Full Money Back</span>
          </div>

          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-blue-400" />
            <span>15-Min Human Arbitration</span>
          </div>

          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Recall Fraud Warranty</span>
          </div>
        </div>

        {/* Modal Trigger Button */}
        <div className="text-center">
          <button
            onClick={onOpenProtectionModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-clean-sm transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Read Complete Buyer Protection Guarantee Policy</span>
          </button>
        </div>
      </div>
    </section>
  );
}
