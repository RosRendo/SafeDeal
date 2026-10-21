"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCw,
  ArrowRight,
  Shield,
  KeyRound,
  Check,
  Sparkles,
} from "lucide-react";

interface SecurityVaultFlipCardsSectionProps {
  onOpenProtectionModal: () => void;
}

interface FlipStep {
  step: string;
  title: string;
  tag: string;
  icon: React.ElementType;
  frontSummary: string;
  bullets: string[];
  backBadge: string;
  frontAccent: string;
}

const ESCROW_STEPS: FlipStep[] = [
  {
    step: "01",
    title: "Buyer Deposits to Vault",
    tag: "100% Vault Locked",
    icon: Lock,
    frontAccent: "text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white",
    frontSummary: "Payment locked into a regulated multi-sig smart escrow vault.",
    bullets: [
      "Funds isolated in cryptographic escrow",
      "Seller cannot access payment yet",
      "Zero chargeback or reversal risk",
    ],
    backBadge: "256-Bit Escrow Vault",
  },
  {
    step: "02",
    title: "Automated Bot Handoff",
    tag: "0.4s Avg Velocity",
    icon: Zap,
    frontAccent: "text-amber-600 bg-amber-50 group-hover:bg-amber-600 group-hover:text-white",
    frontSummary: "Instant automated delivery via official Steam & Riot API bots.",
    bullets: [
      "Direct API encrypted transfer",
      "Disposable secure handoff channel",
      "Original credentials affirmed",
    ],
    backBadge: "API Handshake Verified",
  },
  {
    step: "03",
    title: "48h Inspection Custody",
    tag: "Full Access Guarantee",
    icon: ShieldCheck,
    frontAccent: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white",
    frontSummary: "Buyer inspects inventory, binds personal 2FA email, and confirms.",
    bullets: [
      "Bind personal phone & email 2FA",
      "Verify in-game inventories & rank",
      "1-click automated dispute freeze",
    ],
    backBadge: "Full Inspection Rights",
  },
  {
    step: "04",
    title: "Affirm & Instant Payout",
    tag: "Final Settlement",
    icon: CheckCircle2,
    frontAccent: "text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white",
    frontSummary: "Vault releases funds to seller only after buyer confirms custody.",
    bullets: [
      "Buyer affirms ownership satisfied",
      "Vault releases payment to seller",
      "Mutual trust rating recorded",
    ],
    backBadge: "Dual-Key Consensus",
  },
];

export default function SecurityVaultFlipCardsSection({
  onOpenProtectionModal,
}: SecurityVaultFlipCardsSectionProps) {
  // Click/tap toggle state for mobile & accessibility
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      {/* Dedicated Bulletproof 3D Flip Styles */}
      <style>{`
        .vault-card-container {
          perspective: 1200px;
          -webkit-perspective: 1200px;
        }
        .vault-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }
        .vault-card-container:hover .vault-card-inner,
        .vault-card-container.is-flipped .vault-card-inner {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
        }
        .vault-card-front,
        .vault-card-back {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 1.25rem;
          overflow: hidden;
        }
        .vault-card-front {
          transform: rotateY(0deg);
          -webkit-transform: rotateY(0deg);
          z-index: 2;
        }
        .vault-card-back {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
          z-index: 1;
        }
      `}</style>

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[12px] font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Interactive 3D Vault Cards</span>
        </div>
        <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How Safedeal Escrow Protects Every Deal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Hover with cursor or tap any card to flip it in 3D and reveal the cryptographic protocol specifications.
        </p>
      </div>

      {/* 3D Flip Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {ESCROW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isFlipped = flippedCards[idx] || false;

          return (
            <div
              key={step.step}
              onClick={() => toggleFlip(idx)}
              className={`vault-card-container h-[350px] w-full cursor-pointer select-none group ${
                isFlipped ? "is-flipped" : ""
              }`}
            >
              {/* Inner 3D Container */}
              <div className="vault-card-inner">
                {/* ========================================================= */}
                {/* FRONT OF THE CARD (Visual, Crisp, Clean)                  */}
                {/* ========================================================= */}
                <div className="vault-card-front bg-white p-6 border border-slate-200/90 shadow-clean-sm group-hover:shadow-clean-lg transition-shadow flex flex-col justify-between">
                  <div>
                    {/* Top Row: Icon & Step Number */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-12 h-12 rounded-2xl border border-slate-200/80 flex items-center justify-center transition-all duration-300 ${step.frontAccent}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-headline text-3xl font-black text-slate-200 group-hover:text-slate-300 transition-colors">
                        {step.step}
                      </span>
                    </div>

                    {/* Step Tag */}
                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80 mb-3">
                      {step.tag}
                    </span>

                    {/* Step Title */}
                    <h3 className="font-headline text-lg font-bold text-slate-900 leading-snug mb-2">
                      {step.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.frontSummary}
                    </p>
                  </div>

                  {/* Flip Prompt Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[12px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                      Tap or Hover
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold text-[12px] group-hover:bg-blue-600 group-hover:text-white transition-all shadow-clean-xs">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Flip Card</span>
                    </span>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* BACK OF THE CARD (3 Concise Bullets & Security Badge)     */}
                {/* ========================================================= */}
                <div className="vault-card-back bg-slate-900 text-white p-6 border border-slate-800 shadow-2xl flex flex-col justify-between">
                  <div>
                    {/* Back Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-[12px] font-extrabold uppercase tracking-wider text-emerald-400">
                          {step.backBadge}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        0{idx + 1} / 04
                      </span>
                    </div>

                    <h4 className="font-headline text-base font-bold text-white mb-4">
                      {step.title}
                    </h4>

                    {/* 3 Concise Bullet Points */}
                    <div className="space-y-3">
                      {step.bullets.map((bullet, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span className="leading-tight">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Verification Seal & Flip Back Button */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                    <span className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-medium transition-colors">
                      <RotateCw className="w-3 h-3" /> Flip back
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Escrow Guarantee Highlight Callout */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-clean-lg">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-400 text-[12px] font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>48-Hour Full Custody Guarantee</span>
          </div>
          <h3 className="font-headline text-xl sm:text-2xl font-bold">
            What happens if an account is pulled back or key invalid?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Our dispute arbitration halts seller payout immediately. If the seller cannot rectify credentials within 12 hours, your escrow deposit is 100% refunded to your payment method.
          </p>
        </div>

        <Link
          href="/protection"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-headline font-bold text-xs shadow-clean-sm transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Read Safedeal Escrow Rules</span>
        </Link>
      </div>
    </section>
  );
}
