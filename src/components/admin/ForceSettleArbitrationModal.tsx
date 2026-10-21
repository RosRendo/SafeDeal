"use client";

import React, { useState, useRef } from "react";
import {
  Gavel,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Check,
  X,
  RotateCcw,
  CreditCard,
  Building,
  Scale,
  Usb,
  KeyRound,
  FileText,
  AlertTriangle,
  Zap,
  Info,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

export type SettlementVerdict = "buyer_refund" | "seller_payout" | "split_compromise";

export interface ForceSettleArbitrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorize?: (verdict: SettlementVerdict, rationale: string, pin: string) => void;
  caseNumber?: string;
  orderNumber?: string;
  assetTitle?: string;
  escrowAmount?: number;
  buyerName?: string;
  sellerName?: string;
}

export default function ForceSettleArbitrationModal({
  isOpen,
  onClose,
  onAuthorize,
  caseNumber = "#DSP-1092",
  orderNumber = "#SF-2024-88492",
  assetTitle = "Valorant Immortal 3 (Global Riot ID • Full Access)",
  escrowAmount = 195.0,
  buyerName = "Authorized Buyer",
  sellerName = "AeroGamingDeals",
}: ForceSettleArbitrationModalProps) {
  // Verdict selection
  const [verdict, setVerdict] = useState<SettlementVerdict>("split_compromise");

  // Rationale
  const [rationale, setRationale] = useState<string>(
    "Riot Games account verification log shows recovery email triggered from original IP subnet within 48h window. Partial fault detected on both sides regarding OGE handover protocol. Releasing 50% partial escrow as per Section 8.4 of Safedeal Marketplace Terms."
  );

  // Checkbox logging toggles
  const [publishToThreads, setPublishToThreads] = useState<boolean>(true);
  const [logToRiskMatrix, setLogToRiskMatrix] = useState<boolean>(true);

  // Supervisor PIN inputs (6 digits)
  const [pinDigits, setPinDigits] = useState<string[]>(["7", "4", "9", "", "", ""]);
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Mobile push status
  const [pushStatus, setPushStatus] = useState<"idle" | "sent">("idle");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = clean;
    setPinDigits(newDigits);

    if (clean && index < 5) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleRequestPush = () => {
    setPushStatus("sent");
    // Pre-fill remaining digits after simulation
    setTimeout(() => {
      setPinDigits(["7", "4", "9", "5", "1", "2"]);
    }, 800);
  };

  const handleAuthorizeSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onAuthorize) {
        onAuthorize(verdict, rationale, pinDigits.join(""));
      } else {
        onClose();
      }
    }, 1000);
  };

  if (!isOpen) return null;

  const submitLabels: Record<SettlementVerdict, string> = {
    buyer_refund: `Authorize $${escrowAmount.toFixed(2)} Full Refund`,
    seller_payout: `Authorize $${(escrowAmount * 0.95).toFixed(2)} Seller Release`,
    split_compromise: `Authorize $${(escrowAmount * 0.5).toFixed(2)} Settlement`,
  };

  return (
    <div
      id="modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[var(--ds-navy)]/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Modal Window Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200/80 max-h-[92vh]">
        {/* Top Decorative Security Strip */}
        <div className="h-1.5 w-full bg-[var(--cobalt-acc)] shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 md:p-7 bg-white flex items-start justify-between gap-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--cobalt-acc)] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Gavel className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] font-bold text-[13px] uppercase tracking-wider border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Safedeal Arbitration Desk
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[13px] uppercase tracking-wider border border-rose-200">
                  <Lock className="w-3.5 h-3.5" />
                  Level 3 Dual-Authorization
                </span>
              </div>
              <h1 className="font-headline text-xl sm:text-2xl font-extrabold text-[var(--ds-navy)] tracking-tight leading-tight">
                Force Settle & Escrow Fund Disposition
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Case <span className="font-bold text-slate-800">{caseNumber}</span> • Disputed Order{" "}
                <span className="font-bold text-slate-800">{orderNumber}</span> • Locked Escrow Balance:{" "}
                <span className="font-bold text-[var(--cobalt-acc)] font-mono">${escrowAmount.toFixed(2)} USD</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close Modal"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body Content */}
        <div className="px-5 sm:px-6 md:px-7 py-5 flex flex-col gap-5 overflow-y-auto">
          {/* 1. Dispute Summary Bento Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--cobalt-acc)]" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Asset In Contest:
                </span>
                <span className="text-xs font-bold text-slate-900">{assetTitle}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[13px] font-semibold">
                Category: Game Accounts / High-Tier Riot
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Buyer Column */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] uppercase tracking-wider text-slate-400 font-bold">
                    Complainant (Buyer)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold">
                    Registered Oct 2023
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[var(--cobalt-acc)] flex items-center justify-center font-bold text-xs">
                    AM
                  </div>
                  <span className="text-xs font-bold text-slate-900">{buyerName}</span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/50 leading-relaxed">
                  <span className="font-bold text-rose-600">Claim:</span> “Password was remotely changed and Riot 2FA was re-locked by original recovery mail 18 hours after completion.”
                </p>
              </div>

              {/* Seller Column */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] uppercase tracking-wider text-slate-400 font-bold">
                    Respondent (Seller)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[var(--acc-green)] text-[12px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Premier Seller
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      AG
                    </div>
                    <span className="text-xs font-bold text-slate-900">{sellerName}</span>
                  </div>
                  <span className="text-[13px] text-slate-500 font-medium">
                    3,842 Deals • 0.12% Dispute
                  </span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/50 leading-relaxed">
                  <span className="font-bold text-slate-900">Defense:</span> “Buyer changed recovery email to ProtonMail then attempted manual Riot ticket restoration. Logs supplied.”
                </p>
              </div>
            </div>

            {/* Evidence Badges Strip */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-200/60">
              <span className="text-[13px] text-slate-400 uppercase font-bold tracking-wider">
                Verified Evidence:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700 text-xs font-medium shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-[var(--cobalt-acc)]" />
                4x Riot API Auth Failure Traces
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700 text-xs font-medium shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-[var(--cobalt-acc)]" />
                2x ProtonMail OGE Recovery Snaps
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700 text-xs font-medium shadow-2xs">
                <Scale className="w-3.5 h-3.5 text-[var(--cobalt-acc)]" />
                Subnet Match: ASN 7922 (Comcast US)
              </span>
            </div>
          </div>

          {/* 2. Settlement Determination Cards */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-headline text-sm font-bold text-[var(--ds-navy)]">
                  Arbitration Settlement Determination
                </span>
                <span className="text-xs text-slate-500">
                  Select binding disposition algorithm. Escrow ledger records this permanently.
                </span>
              </div>
              <span className="text-[13px] text-rose-600 font-bold uppercase tracking-wider">
                Irreversible Action
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="settlement-options">
              {/* Option A: Full Refund */}
              <label
                onClick={() => setVerdict("buyer_refund")}
                className={`cursor-pointer relative p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-left shadow-2xs select-none ${
                  verdict === "buyer_refund"
                    ? "bg-blue-50/70 border-[var(--cobalt-acc)] ring-2 ring-[var(--cobalt-acc)]/30"
                    : "bg-slate-50/80 border-slate-200 hover:bg-slate-100/70"
                }`}
              >
                <input
                  type="radio"
                  name="settlement_verdict"
                  value="buyer_refund"
                  checked={verdict === "buyer_refund"}
                  onChange={() => setVerdict("buyer_refund")}
                  className="sr-only"
                />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                      <RotateCcw className="w-4 h-4 text-[var(--cobalt-acc)]" />
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        verdict === "buyer_refund"
                          ? "bg-[var(--cobalt-acc)] border-[var(--cobalt-acc)] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {verdict === "buyer_refund" && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <span className="font-headline text-xs font-bold text-slate-900">
                    Full Buyer Refund
                  </span>
                  <span className="text-[13px] text-slate-500 leading-snug">
                    100% funds reversed to buyer payment card ending in •••• 4242.
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="font-headline text-base font-extrabold text-slate-900 block font-mono">
                    ${escrowAmount.toFixed(2)}
                  </span>
                  <span className="text-[12px] text-slate-500">Seller fee waived • Strike recorded</span>
                </div>
              </label>

              {/* Option B: Release to Seller */}
              <label
                onClick={() => setVerdict("seller_payout")}
                className={`cursor-pointer relative p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-left shadow-2xs select-none ${
                  verdict === "seller_payout"
                    ? "bg-blue-50/70 border-[var(--cobalt-acc)] ring-2 ring-[var(--cobalt-acc)]/30"
                    : "bg-slate-50/80 border-slate-200 hover:bg-slate-100/70"
                }`}
              >
                <input
                  type="radio"
                  name="settlement_verdict"
                  value="seller_payout"
                  checked={verdict === "seller_payout"}
                  onChange={() => setVerdict("seller_payout")}
                  className="sr-only"
                />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                      <CreditCard className="w-4 h-4 text-[var(--acc-green)]" />
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        verdict === "seller_payout"
                          ? "bg-[var(--cobalt-acc)] border-[var(--cobalt-acc)] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {verdict === "seller_payout" && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <span className="font-headline text-xs font-bold text-slate-900">
                    Release to Seller
                  </span>
                  <span className="text-[13px] text-slate-500 leading-snug">
                    Dismiss buyer dispute. Disburse escrow net earnings to seller Stripe Express.
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="font-headline text-base font-extrabold text-slate-900 block font-mono">
                    ${(escrowAmount * 0.95).toFixed(2)}
                  </span>
                  <span className="text-[12px] text-slate-500">Standard 5% marketplace commission</span>
                </div>
              </label>

              {/* Option C: 50/50 Split Settlement */}
              <label
                onClick={() => setVerdict("split_compromise")}
                className={`cursor-pointer relative p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-left shadow-md select-none ${
                  verdict === "split_compromise"
                    ? "bg-blue-50/90 border-[var(--cobalt-acc)] ring-2 ring-[var(--cobalt-acc)]"
                    : "bg-slate-50/80 border-slate-200 hover:bg-slate-100/70"
                }`}
              >
                <input
                  type="radio"
                  name="settlement_verdict"
                  value="split_compromise"
                  checked={verdict === "split_compromise"}
                  onChange={() => setVerdict("split_compromise")}
                  className="sr-only"
                />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--cobalt-acc)] text-white text-[12px] font-bold uppercase tracking-wider">
                      <Scale className="w-3 h-3" /> Recommended
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        verdict === "split_compromise"
                          ? "bg-[var(--cobalt-acc)] border-[var(--cobalt-acc)] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {verdict === "split_compromise" && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <span className="font-headline text-xs font-extrabold text-[var(--cobalt-acc)]">
                    50/50 Split Settlement
                  </span>
                  <span className="text-[13px] text-slate-600 leading-snug">
                    Equitable arbitration compromise based on partial fault during initial OGE handover.
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-0.5">
                  <span className="font-headline text-base font-extrabold text-[var(--cobalt-acc)] block font-mono">
                    $97.50 / $92.62
                  </span>
                  <span className="text-[12px] text-slate-500">
                    Buyer: $97.50 • Seller: $92.62 (50% fee discount)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Mandatory Arbitration Rationale & Audit Logging */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col gap-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <label
                htmlFor="adjudication-rationale"
                className="font-headline text-xs font-bold text-slate-900 flex items-center gap-1.5"
              >
                <Gavel className="w-4 h-4 text-[var(--cobalt-acc)]" />
                <span>Adjudication Legal Rationale & Findings</span>
                <span className="text-rose-600">*</span>
              </label>
              <span className="text-[13px] text-slate-500 font-medium">
                Marketplace Terms § 8.4 Escrow Intervention
              </span>
            </div>

            <textarea
              id="adjudication-rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[var(--cobalt-acc)] resize-none leading-relaxed font-sans"
              placeholder="Enter findings and evidentiary justification..."
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={publishToThreads}
                  onChange={(e) => setPublishToThreads(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--cobalt-acc)] focus:ring-blue-500 accent-[var(--cobalt-acc)] cursor-pointer"
                />
                <span>Publish formal rationale to Buyer & Seller dispute threads</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={logToRiskMatrix}
                  onChange={(e) => setLogToRiskMatrix(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--cobalt-acc)] focus:ring-blue-500 accent-[var(--cobalt-acc)] cursor-pointer"
                />
                <span>Log case incident to Seller Reliability Risk Matrix</span>
              </label>
            </div>
          </div>

          {/* 4. Dual-Authorization & Security Clearance */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-100/70 border border-slate-200/80 flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--ds-navy-2)] text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-xs font-bold text-slate-900">
                    Dual-Officer Clearance Authority
                  </span>
                  <span className="text-[13px] text-slate-500">
                    Escrow resolutions over $150.00 require secondary cryptographic key signoff.
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[13px] font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Initiator: Staff #AD-884 (Sarah Lin)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* 6-digit Supervisor OTP PIN input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Supervisor 2FA Security PIN:</span>
                  <button
                    type="button"
                    onClick={handleRequestPush}
                    className={`text-[13px] font-bold transition-colors cursor-pointer ${
                      pushStatus === "sent"
                        ? "text-[var(--acc-green)]"
                        : "text-[var(--cobalt-acc)] hover:underline"
                    }`}
                  >
                    {pushStatus === "sent"
                      ? "Push Sent to AD-Supervisor (Expires 59s)"
                      : "Request Mobile Push"}
                  </button>
                </div>

                <div className="flex items-center gap-2" id="otp-inputs">
                  {pinDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={pinRefs[idx]}
                      type="password"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      placeholder="•"
                      className="w-11 h-12 text-center font-headline font-bold text-base rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[var(--cobalt-acc)] shadow-xs"
                    />
                  ))}
                </div>
              </div>

              {/* Hardware Security Token / WebAuthn Card */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center shrink-0">
                    <Usb className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline text-xs font-bold text-slate-900">
                      YubiKey 5C NFC Detected
                    </span>
                    <span className="text-[13px] text-slate-500">
                      Slot 1: ops.safedeal.internal (FIDO2)
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[var(--acc-green)] text-[12px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Lock className="w-4 h-4 text-[var(--cobalt-acc)] shrink-0" />
            <span className="leading-tight text-[13px]">
              Cryptographically signed to escrow ledger <strong className="text-slate-800">#BLK-9982</strong>. Stripe webhook triggered upon submission.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
              type="button"
            >
              Keep Under Review
            </button>

            <button
              onClick={handleAuthorizeSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 active:scale-98 cursor-pointer disabled:opacity-60"
              type="button"
            >
              <Lock className="w-4 h-4 text-emerald-300" />
              <span>{isSubmitting ? "Signing Ledger..." : submitLabels[verdict]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
