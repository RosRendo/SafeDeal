"use client";

import React from "react";
import {
  ShieldCheck,
  Clock,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Lock,
  X,
} from "lucide-react";

interface EscrowGuaranteeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EscrowGuaranteeModal({
  isOpen,
  onClose,
}: EscrowGuaranteeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-clean-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-clean-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                Zero Risk Guarantee
              </span>
              <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900">
                Safedeal 48-Hour Escrow Protocol
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          <div>
            <h3 className="font-headline text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>How Your Funds Are Protected</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When you purchase any account, currency, key, or social media asset on
              Safedeal, your funds are never sent directly to the seller. Instead,
              they are locked in our regulated escrow vault until you receive, inspect,
              and approve the item.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="font-headline font-bold text-xs text-slate-900 mb-1">
                48-Hour Inspection
              </h4>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Full 48 hours to check credentials, change primary emails, and test in-game access.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h4 className="font-headline font-bold text-xs text-slate-900 mb-1">
                100% Full Refund
              </h4>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                If the item is not as described or access fails, funds return to you immediately.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Headphones className="w-4 h-4" />
              </div>
              <h4 className="font-headline font-bold text-xs text-slate-900 mb-1">
                Live Mediation
              </h4>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Our specialized digital asset arbitration team responds in under 15 minutes.
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h4 className="font-headline text-xs font-bold text-slate-900 mb-2.5">
              Buyer Safety Checklist:
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Change the registered email address immediately upon receiving access.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Enable two-factor authentication (2FA) with your own authenticator app.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Audit in-game inventory, rank badges, currency balance, and region binding.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Click &ldquo;Confirm & Release Funds&rdquo; only when you are 100% satisfied.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>Bank-grade SSL & PCI-DSS Level 1 protection</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-clean-sm transition-all cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
