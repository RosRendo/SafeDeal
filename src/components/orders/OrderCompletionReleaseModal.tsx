"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  Lock,
  Unlock,
  Star,
  Plus,
  Check,
  Info,
  Zap,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";

export interface OrderCompletionReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRelease: (reviewData?: {
    rating: number;
    tags: string[];
    review: string;
  }) => void;
  orderNumber?: string;
  sellerName?: string;
  assetName?: string;
  totalAmount?: number;
  netPayout?: number;
  hoursRemaining?: number;
}

export default function OrderCompletionReleaseModal({
  isOpen,
  onClose,
  onConfirmRelease,
  orderNumber = "#SF-2024-88492",
  sellerName = "AeroGamingDeals",
  assetName = "Valorant Peak Immortal 3 (Champions 2021 Vandal + Arcane Sheriff)",
  totalAmount = 195.0,
  netPayout = 185.25,
  hoursRemaining = 37,
}: OrderCompletionReleaseModalProps) {
  // Checklist State (Must have all 3 checked)
  const [checklist, setChecklist] = useState({
    assetConfirmed: true,
    ogeSecured: true,
    twoFactorActive: true,
  });

  // Review & Rating State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Instant Delivery",
    "Polite Seller",
    "Exactly as Described",
    "Clean OGE Handover",
  ]);
  const [reviewComment, setReviewComment] = useState<string>(
    "Super fast delivery! Account was clean, OGE login worked smoothly and all Champions skins were present. 10/10 seller!"
  );

  const availableTags = [
    "Instant Delivery",
    "Polite Seller",
    "Exactly as Described",
    "Clean OGE Handover",
    "Friendly Communication",
    "Fair Price",
  ];

  const ratingDescriptions: Record<number, string> = {
    1: "1.0 / 5.0 (Disappointing)",
    2: "2.0 / 5.0 (Poor)",
    3: "3.0 / 5.0 (Average)",
    4: "4.0 / 5.0 (Great)",
    5: "5.0 / 5.0 (Exceptional)",
  };

  const currentRatingDisplay = hoverRating !== null ? hoverRating : rating;

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const checkedCount = [
    checklist.assetConfirmed,
    checklist.ogeSecured,
    checklist.twoFactorActive,
  ].filter(Boolean).length;

  const isAllChecked = checkedCount === 3;

  const handleRelease = () => {
    if (!isAllChecked) return;
    onConfirmRelease({
      rating,
      tags: selectedTags,
      review: reviewComment,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-[var(--ds-navy)]/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Modal Dialog Window */}
      <div className="relative w-full max-w-[680px] bg-white rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 border border-slate-200/80 max-h-[92vh] flex flex-col">
        {/* Top Trust Accent Line */}
        <div className="w-full h-1.5 bg-[var(--acc-green)] shrink-0" />

        {/* Modal Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-7 space-y-4 sm:space-y-5">
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[var(--acc-green)] shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-[var(--acc-green)] font-bold text-[13px] rounded-full">
                    Escrow Finalization
                  </span>
                  <span className="text-[13px] text-slate-500 font-medium">
                    • Level 3 Escrow Shield
                  </span>
                </div>
                <h2 className="font-headline text-lg sm:text-xl font-bold text-[var(--ds-navy)] tracking-tight">
                  Confirm Order Completion & Release Escrow
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order <span className="font-semibold text-slate-800">{orderNumber}</span> • Seller:{" "}
                  <span className="font-semibold text-slate-800">{sellerName}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Close Dialog"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Critical Irreversible Action Warning Box */}
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Irreversible Action Warning
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-6">
              By clicking <span className="font-bold text-slate-900">“Release ${totalAmount.toFixed(2)} USD to Seller”</span>, you certify that you have received full access to the digital asset, successfully rebound the email/2FA to your own credentials, and verified in-game inventory. Once released, escrow protection concludes and funds cannot be clawed back.
            </p>
          </div>

          {/* Security Verification Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Mandatory Safeguard Checklist ({checkedCount}/3 Complete)
              </span>
              <span
                className={`text-xs font-bold flex items-center gap-1 ${
                  isAllChecked ? "text-[var(--acc-green)]" : "text-amber-600"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isAllChecked ? "Verified by Buyer" : "Action Required"}</span>
              </span>
            </div>

            <div className="space-y-2">
              {/* Checklist Item 1 */}
              <label
                onClick={() => toggleChecklist("assetConfirmed")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  checklist.assetConfirmed
                    ? "bg-slate-50 border-slate-300/80"
                    : "bg-white border-amber-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.assetConfirmed}
                  onChange={() => {}}
                  className="mt-0.5 h-4 w-4 rounded accent-[var(--cobalt-acc)] cursor-pointer shrink-0"
                  id="check-asset"
                />
                <div className="flex-1">
                  <p className="text-xs text-slate-800 leading-snug">
                    I have logged in and confirmed the account matches the listing{" "}
                    <span className="font-semibold text-slate-900">({assetName})</span>.
                  </p>
                </div>
              </label>

              {/* Checklist Item 2 */}
              <label
                onClick={() => toggleChecklist("ogeSecured")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  checklist.ogeSecured
                    ? "bg-slate-50 border-slate-300/80"
                    : "bg-white border-amber-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.ogeSecured}
                  onChange={() => {}}
                  className="mt-0.5 h-4 w-4 rounded accent-[var(--cobalt-acc)] cursor-pointer shrink-0"
                  id="check-oge"
                />
                <div className="flex-1">
                  <p className="text-xs text-slate-800 leading-snug">
                    I have changed the password and secured the original creation email (OGE) or bound my personal credentials.
                  </p>
                </div>
              </label>

              {/* Checklist Item 3 */}
              <label
                onClick={() => toggleChecklist("twoFactorActive")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  checklist.twoFactorActive
                    ? "bg-slate-50 border-slate-300/80"
                    : "bg-white border-amber-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.twoFactorActive}
                  onChange={() => {}}
                  className="mt-0.5 h-4 w-4 rounded accent-[var(--cobalt-acc)] cursor-pointer shrink-0"
                  id="check-2fa"
                />
                <div className="flex-1">
                  <p className="text-xs text-slate-800 leading-snug">
                    I have activated two-factor authentication (2FA) under my own control.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Integrated Seller Feedback & Review Section */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="font-headline text-xs font-bold text-slate-900 uppercase tracking-wider">
                Rate Your Experience with {sellerName}
              </h3>
              <span className="text-[13px] text-slate-500 font-medium">
                Public Verified Review
              </span>
            </div>

            {/* Star Rating Selector */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    aria-label={`${star} star`}
                    className="p-0.5 text-amber-400 hover:scale-115 transition-transform focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= currentRatingDisplay
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold text-slate-800 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-2xs">
                {ratingDescriptions[currentRatingDisplay] || "5.0 / 5.0 (Exceptional)"}
              </span>
            </div>

            {/* Tag Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-[var(--cobalt-acc)] border border-blue-200 shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-[var(--cobalt-acc)]" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Comment Box */}
            <div className="relative">
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value.slice(0, 500))}
                className="w-full bg-white rounded-xl p-3 text-xs text-slate-800 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[var(--cobalt-acc)] shadow-inner resize-none font-sans leading-relaxed"
                placeholder="Share your experience with this seller..."
                rows={2}
                maxLength={500}
              />
              <span className="absolute bottom-2.5 right-3 text-[13px] font-mono text-slate-400">
                {reviewComment.length}/500
              </span>
            </div>
          </div>

          {/* Financial Settlement Summary */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                Release to Seller (Net Payout)
                <span
                  className="cursor-help text-slate-400 hover:text-slate-600"
                  title="Seller payout after marketplace processing fee"
                >
                  <Info className="w-3.5 h-3.5" />
                </span>
              </span>
              <span className="font-semibold text-slate-900 font-mono">
                ${netPayout.toFixed(2)} USD
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                Buyer Guarantee Fee Paid
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--acc-green)]" />
              </span>
              <span className="font-semibold text-[var(--acc-green)]">
                $0.00 USD (Covered by Escrow Shield)
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Total Amount Released from Escrow:
              </span>
              <span className="font-headline text-base sm:text-lg font-extrabold text-[var(--cobalt-acc)] font-mono">
                ${totalAmount.toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 space-y-2.5 shrink-0">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200/70 transition-colors text-center cursor-pointer"
              type="button"
            >
              Cancel / Keep Inspecting ({hoursRemaining}h remaining)
            </button>

            <button
              id="confirm-release-btn"
              onClick={handleRelease}
              disabled={!isAllChecked}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                isAllChecked
                  ? "bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white active:scale-98 shadow-blue-500/20"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-60"
              }`}
              type="button"
            >
              <Unlock className="w-4 h-4" />
              <span>Release ${totalAmount.toFixed(2)} & Complete Order</span>
            </button>
          </div>

          {/* Real-time Transfer Subtext Guarantee */}
          <p className="text-[13px] text-slate-500 text-center flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span>Instant payout dispatch: Funds immediately transfer to seller’s cleared balance.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
