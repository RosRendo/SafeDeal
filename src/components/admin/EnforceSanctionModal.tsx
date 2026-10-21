"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertOctagon,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  Scale,
  Package,
  Layers,
  DollarSign,
  Ban,
  Building,
  CheckCircle2,
  ChevronDown,
  Info,
  Clock,
  Send,
  Zap,
} from "lucide-react";

export type SanctionTier = "tier_1" | "tier_2" | "tier_3";

export interface EnforceSanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySanction?: (data: {
    tier: SanctionTier;
    reasonCode: string;
    notes: string;
    notifyMerchant: boolean;
    notifyBuyers: boolean;
  }) => void;
  merchantName?: string;
  userId?: string;
  riskScore?: number;
  activeInventoryCount?: number;
  inFlightEscrowCount?: number;
  inFlightEscrowAmount?: number;
  clearedBalanceAmount?: number;
}

export default function EnforceSanctionModal({
  isOpen,
  onClose,
  onApplySanction,
  merchantName = "GlobalKeysDirect",
  userId = "#USR-90214",
  riskScore = 88,
  activeInventoryCount = 14,
  inFlightEscrowCount = 3,
  inFlightEscrowAmount = 234.5,
  clearedBalanceAmount = 1450.0,
}: EnforceSanctionModalProps) {
  // Sanction Tier state
  const [selectedTier, setSelectedTier] = useState<SanctionTier>("tier_3");

  // Compliance reason code
  const [reasonCode, setReasonCode] = useState<string>("A-4");

  // Investigation notes
  const [notes, setNotes] = useState<string>(
    "Evidence provided by multiple buyers confirms recovery tickets submitted to game publisher using original creation billing receipts. Hardware ban required."
  );

  // Notifications toggles
  const [notifyMerchant, setNotifyMerchant] = useState<boolean>(true);
  const [notifyBuyers, setNotifyBuyers] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onApplySanction) {
        onApplySanction({
          tier: selectedTier,
          reasonCode,
          notes,
          notifyMerchant,
          notifyBuyers,
        });
      } else {
        onClose();
      }
    }, 900);
  };

  const tierButtonLabels: Record<SanctionTier, string> = {
    tier_1: "Apply Level 1 Listing Restrictions",
    tier_2: "Apply Level 2 Escrow & Payout Freeze",
    tier_3: "Apply Full Suspension & Freeze Funds",
  };

  return (
    <div
      id="modal-container"
      className="fixed inset-0 z-50 bg-[var(--ds-navy)]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Modal Card Container */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200 border border-slate-200/80 max-h-[92vh]">
        {/* Top Warning Accent Line */}
        <div className="w-full h-1.5 bg-rose-600 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 md:px-7 py-4 sm:py-5 bg-white flex items-start justify-between shadow-xs relative border-b border-slate-100 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
              <Ban className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline text-lg sm:text-xl font-bold text-[var(--ds-navy)] tracking-tight">
                  Enforce Account Sanction & Restrictions
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[12px] tracking-wider uppercase">
                  Action Required
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                <span className="font-semibold text-slate-800">
                  Merchant: {merchantName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono">{userId}</span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 font-bold text-rose-600">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  <span>Risk Score: {riskScore}/100 (Critical)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:px-7 sm:py-6 flex flex-col gap-5 overflow-y-auto">
          {/* 1. Incident Summary Banner */}
          <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200/80 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Critical Anti-Fraud Trigger
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                3 consecutive chargeback disputes filed in 48 hours for reclaimed Epic/Steam accounts. Tor exit node IP login detected across session tokens{" "}
                <span className="font-mono text-[13px] text-rose-700 bg-white border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                  tok_991b_tor
                </span>.
              </p>
            </div>
          </div>

          {/* 2. Sanction Severity Tier Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-headline text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sanction Severity Tier
              </label>
              <span className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider">
                Automated Matrix Tier 3 Recommended
              </span>
            </div>

            <div className="flex flex-col gap-2.5" id="severity-selection-group">
              {/* Tier 1: Passive/Notice */}
              <label
                onClick={() => setSelectedTier("tier_1")}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                  selectedTier === "tier_1"
                    ? "bg-blue-50/70 border-[var(--cobalt-acc)] ring-2 ring-[var(--cobalt-acc)]/20 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                }`}
              >
                <input
                  type="radio"
                  name="sanction_tier"
                  value="tier_1"
                  checked={selectedTier === "tier_1"}
                  onChange={() => setSelectedTier("tier_1")}
                  className="mt-1 w-4 h-4 text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer shrink-0"
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-headline text-xs font-bold text-slate-900">
                      Level 1: Listing Restrictions Only
                    </span>
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                      Soft Restriction
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Temporarily pause active listings, keep existing sales & payout channels active. Useful during manual identity verification checks.
                  </p>
                </div>
              </label>

              {/* Tier 2: Escrow Freeze */}
              <label
                onClick={() => setSelectedTier("tier_2")}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                  selectedTier === "tier_2"
                    ? "bg-blue-50/70 border-[var(--cobalt-acc)] ring-2 ring-[var(--cobalt-acc)]/20 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                }`}
              >
                <input
                  type="radio"
                  name="sanction_tier"
                  value="tier_2"
                  checked={selectedTier === "tier_2"}
                  onChange={() => setSelectedTier("tier_2")}
                  className="mt-1 w-4 h-4 text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer shrink-0"
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-headline text-xs font-bold text-slate-900">
                      Level 2: Escrow & Payout Freeze
                    </span>
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                      14-Day Reserve Lock
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Allow pending deliveries to conclude, freeze{" "}
                    <span className="font-semibold text-slate-800 font-mono">
                      ${clearedBalanceAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>{" "}
                    escrow balance from withdrawal for 14 days pending buyer verification.
                  </p>
                </div>
              </label>

              {/* Tier 3: Critical Danger / Default Selected */}
              <label
                onClick={() => setSelectedTier("tier_3")}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                  selectedTier === "tier_3"
                    ? "bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                }`}
              >
                <input
                  type="radio"
                  name="sanction_tier"
                  value="tier_3"
                  checked={selectedTier === "tier_3"}
                  onChange={() => setSelectedTier("tier_3")}
                  className="mt-1 w-4 h-4 accent-rose-600 cursor-pointer shrink-0"
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline text-xs font-bold text-rose-900">
                        Level 3: Full Account Suspension & Blacklist
                      </span>
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold uppercase tracking-wider">
                      High Impact
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Permanent ban, revoke store URL, freeze{" "}
                    <span className="font-semibold text-slate-900 font-mono">
                      ${clearedBalanceAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>{" "}
                    escrow, blacklist hardware HWID and registered payment identifiers.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Financial & Order Impact Assessment */}
          <div className="flex flex-col gap-2">
            <span className="font-headline text-xs font-bold text-slate-900 uppercase tracking-wider">
              Financial & Order Impact Assessment
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider">
                    Active Inventory
                  </span>
                  <Package className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-xl font-extrabold text-slate-900 font-mono">
                    {activeInventoryCount}
                  </span>
                  <span className="text-[13px] text-rose-600 font-semibold mt-0.5">
                    Automatically delisted
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider">
                    In-Flight Escrows
                  </span>
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-xl font-extrabold text-slate-900 font-mono">
                    {inFlightEscrowCount}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      (${inFlightEscrowAmount.toFixed(2)})
                    </span>
                  </span>
                  <span className="text-[13px] text-[var(--cobalt-acc)] font-semibold mt-0.5">
                    Route to buyer review
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider">
                    Cleared Balance
                  </span>
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-xl font-extrabold text-rose-600 font-mono">
                    ${clearedBalanceAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[13px] text-slate-500 font-medium mt-0.5">
                    Frozen in Stripe Reserve
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Enforcement Justification & Internal Notes */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="sanction-reason"
                className="font-headline text-xs font-bold text-slate-900"
              >
                Enforcement Reason & Compliance Code
              </label>
              <div className="relative">
                <select
                  id="sanction-reason"
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value)}
                  className="w-full h-11 px-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[var(--cobalt-acc)] transition-colors cursor-pointer"
                >
                  <option value="A-4">
                    Prohibited Goods / Account Reclaim Fraud (Code A-4)
                  </option>
                  <option value="A-1">
                    Stolen Payment Instruments / Carding (Code A-1)
                  </option>
                  <option value="A-2">
                    Invalid or Duplicate Digital CD-Keys (Code A-2)
                  </option>
                  <option value="A-9">
                    Hardware Spoofing / Anti-Circumvention (Code A-9)
                  </option>
                  <option value="M-0">
                    Operational Compliance Review (Manual Override) (Code M-0)
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="investigation-notes"
                  className="font-headline text-xs font-bold text-slate-900"
                >
                  Internal Investigation Notes & Evidence Log
                </label>
                <span className="text-[13px] text-slate-400 font-semibold">
                  Confidential • Ops Log Only
                </span>
              </div>
              <textarea
                id="investigation-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[var(--cobalt-acc)] transition-colors resize-none leading-relaxed font-sans"
              />
            </div>

            {/* Notification Toggles */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={notifyMerchant}
                  onChange={(e) => setNotifyMerchant(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                />
                <span>Send Automated Sanction & Appeal Guide email to merchant registered address</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={notifyBuyers}
                  onChange={(e) => setNotifyBuyers(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                />
                <span>Notify all active buyers with pending unreleased escrow from this merchant</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 sm:px-7 py-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700 font-bold text-xs shadow-2xs cursor-pointer"
              type="button"
            >
              Cancel & Return to Profile
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98 ${
                selectedTier === "tier_3"
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20"
                  : selectedTier === "tier_2"
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
                  : "bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white shadow-blue-500/20"
              }`}
              type="button"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? "Executing Sanction..." : tierButtonLabels[selectedTier]}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1">
            <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <p className="text-[13px] text-slate-500 text-center">
              Appeals can be filed within 14 calendar days via{" "}
              <span className="font-semibold text-[var(--cobalt-acc)]">arbitration.safedeal.com</span>. Escrows will remain locked during active legal discovery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
