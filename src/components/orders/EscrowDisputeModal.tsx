"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Image as ImageIcon,
  Upload,
  Trash2,
  Lock,
  ArrowLeft,
  Check,
  ShieldCheck,
  Info,
  Zap,
  AlertCircle,
} from "lucide-react";

export interface EscrowDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDispute: (data: {
    reason: string;
    statement: string;
    files: string[];
    caseId: string;
  }) => void;
  orderNumber?: string;
  sellerName?: string;
  escrowAmount?: number;
}

interface EvidenceFile {
  id: string;
  name: string;
  size: string;
  hash: string;
  tag: string;
  isVerified?: boolean;
}

export default function EscrowDisputeModal({
  isOpen,
  onClose,
  onSubmitDispute,
  orderNumber = "#SF-2024-88492",
  sellerName = "AeroGamingDeals",
  escrowAmount = 195.0,
}: EscrowDisputeModalProps) {
  // Step 1: Reason
  const [selectedReason, setSelectedReason] = useState<string>("credentials_invalid");

  // Step 2: Statement & Character count
  const [statement, setStatement] = useState<string>(
    "Received account credentials at 14:15 UTC. Attempted to sign in on official Riot Games client EU server. Client returned error: 'Your login credentials don't match an account in our system.' Contacted AeroGamingDeals in Safedeal chat 3 hours ago with screenshot; no response received."
  );

  // Step 3: Evidence files
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([
    {
      id: "ev-1",
      name: "riot_invalid_password_error.png",
      size: "1.4 MB",
      hash: "e3b0c442...98fc",
      tag: "Verified Capture",
      isVerified: true,
    },
    {
      id: "ev-2",
      name: "client_auth_failed_log.txt",
      size: "24 KB",
      hash: "7f83b165...7ab3",
      tag: "Plaintext Diagnostic",
      isVerified: false,
    },
  ]);

  // Step 4: Affirmations
  const [affirmContact, setAffirmContact] = useState<boolean>(true);
  const [affirmTerms, setAffirmTerms] = useState<boolean>(true);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const charCount = statement.length;
  const isMinMet = charCount >= 50;

  const handleRemoveFile = (id: string) => {
    setEvidenceFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddSampleFile = () => {
    const newFile: EvidenceFile = {
      id: `ev-${Date.now()}`,
      name: `riot_telemetry_snapshot_${Math.floor(Math.random() * 900 + 100)}.png`,
      size: "2.1 MB",
      hash: "a4f210b3...519c",
      tag: "Verified Capture",
      isVerified: true,
    };
    setEvidenceFiles((prev) => [...prev, newFile]);
  };

  const handleSubmit = () => {
    if (!isMinMet || !affirmContact || !affirmTerms) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitDispute({
        reason: selectedReason,
        statement,
        files: evidenceFiles.map((f) => f.name),
        caseId: "#DIS-88492-A",
      });
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      id="escrow-dispute-modal"
    >
      <div className="relative w-full max-w-3xl my-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-transform transform duration-200 border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Top Colored Indicator Strip: Urgent Amber/Red Risk Pulse */}
        <div className="h-1.5 w-full bg-rose-600"></div>

        {/* MODAL HEADER */}
        <div className="px-6 sm:px-8 pt-6 pb-4 bg-white border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Alert Shield Badge */}
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-xs border border-rose-100">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[12px] font-extrabold uppercase tracking-wide">
                    Emergency Freeze Protocol
                  </span>
                  <span className="text-xs text-slate-400">• Tier-1 Escrow Vault</span>
                </div>
                <h1 className="font-headline text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  Open Escrow Dispute & Freeze Funds
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Order <strong className="text-slate-900 font-bold">{orderNumber}</strong>
                  <span className="text-slate-300 mx-1.5">/</span> Seller:{" "}
                  <strong className="text-slate-900 font-bold">{sellerName}</strong>
                  <span className="text-slate-300 mx-1.5">/</span> Escrow Value:{" "}
                  <strong className="text-slate-900 font-bold">${escrowAmount.toFixed(2)} USD</strong>
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close modal dialog"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Prominent Safety Warning Banner */}
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/90 text-rose-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong>Immediate Legal Freeze:</strong> Submitting this dispute immediately pauses
              the 48-hour inspection countdown and freezes seller payout until resolved by Safedeal
              Concierge arbitration.
            </p>
          </div>
        </div>

        {/* MODAL SCROLLABLE BODY FORM */}
        <div className="px-6 sm:px-8 py-5 overflow-y-auto max-h-[calc(88vh-220px)] space-y-6">
          {/* STEP 1: DISPUTE REASON SELECTION */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--cobalt-acc)] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-headline text-sm font-bold text-slate-900">
                  Primary Dispute Reason
                </h2>
              </div>
              <span className="text-[13px] text-slate-400">Select the most accurate category</span>
            </div>

            {/* Reason Radio Card Grid */}
            <div className="space-y-2" role="radiogroup">
              {/* Option 1 */}
              <label
                className={`cursor-pointer block p-4 rounded-xl transition-all border ${
                  selectedReason === "credentials_invalid"
                    ? "bg-blue-50/60 border-blue-500 shadow-xs"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="dispute_reason"
                    value="credentials_invalid"
                    checked={selectedReason === "credentials_invalid"}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 w-4 h-4 text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-headline text-xs sm:text-sm font-bold text-slate-900">
                        Credentials Invalid / Incorrect Password
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[var(--cobalt-acc)] text-[12px] font-bold">
                        Common
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Login rejected on Riot Games client upon receipt. Authentication error or
                      unknown user ID.
                    </p>
                  </div>
                </div>
              </label>

              {/* Option 2 */}
              <label
                className={`cursor-pointer block p-4 rounded-xl transition-all border ${
                  selectedReason === "2fa_bound"
                    ? "bg-blue-50/60 border-blue-500 shadow-xs"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="dispute_reason"
                    value="2fa_bound"
                    checked={selectedReason === "2fa_bound"}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 w-4 h-4 text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-headline text-xs sm:text-sm font-bold text-slate-900">
                      2FA Mobile Authenticator Still Bound
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cannot bind personal email or phone without original seller 2FA security code
                      prompt.
                    </p>
                  </div>
                </div>
              </label>

              {/* Option 3 */}
              <label
                className={`cursor-pointer block p-4 rounded-xl transition-all border ${
                  selectedReason === "oge_inaccessible"
                    ? "bg-blue-50/60 border-blue-500 shadow-xs"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="dispute_reason"
                    value="oge_inaccessible"
                    checked={selectedReason === "oge_inaccessible"}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 w-4 h-4 text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-headline text-xs sm:text-sm font-bold text-slate-900">
                      OGE (Original Email) Inaccessible or Recovered
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mailbox credentials rejected, or seller initiated external password recovery
                      ticket.
                    </p>
                  </div>
                </div>
              </label>

              {/* Option 4 */}
              <label
                className={`cursor-pointer block p-4 rounded-xl transition-all border ${
                  selectedReason === "not_as_described"
                    ? "bg-blue-50/60 border-blue-500 shadow-xs"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="dispute_reason"
                    value="not_as_described"
                    checked={selectedReason === "not_as_described"}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 w-4 h-4 text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-headline text-xs sm:text-sm font-bold text-slate-900">
                      Item Not as Described / Missing Inventory
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Listed Champions 2021 Vandal missing, competitive cooldown active, or rank
                      mismatch.
                    </p>
                  </div>
                </div>
              </label>

              {/* Option 5 */}
              <label
                className={`cursor-pointer block p-4 rounded-xl transition-all border ${
                  selectedReason === "other_activity"
                    ? "bg-blue-50/60 border-blue-500 shadow-xs"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="dispute_reason"
                    value="other_activity"
                    checked={selectedReason === "other_activity"}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 w-4 h-4 text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-headline text-xs sm:text-sm font-bold text-slate-900">
                      Other Issue / Suspicious Account Activity
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Unauthorized concurrent sign-ins detected or safety flags present on profile.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* STEP 2: DETAILED EVIDENCE & PROBLEM DESCRIPTION */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--cobalt-acc)] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-headline text-sm font-bold text-slate-900">
                  Factual Incident Statement
                </h2>
              </div>
              <div
                className={`flex items-center gap-1 text-[13px] font-bold px-2.5 py-0.5 rounded-full ${
                  isMinMet
                    ? "text-emerald-800 bg-emerald-100"
                    : "text-rose-700 bg-rose-100"
                }`}
              >
                {isMinMet ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>
                  {charCount} / 50 min characters {isMinMet ? "met" : "needed"}
                </span>
              </div>
            </div>

            <div className="relative bg-slate-50 rounded-2xl p-3 border border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Please describe the exact issue encountered. Include client error messages, timestamp of login attempt, and communications with the seller..."
                rows={4}
                className="w-full bg-transparent p-1 text-xs text-slate-900 placeholder:text-slate-400 outline-none resize-none leading-relaxed"
              />
              <div className="pt-2 px-1 flex flex-wrap items-center justify-between text-slate-400 text-[13px] border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Info className="w-3.5 h-3.5" />
                  <span>Include exact error codes & timestamps for faster arbitration.</span>
                </div>
                <span className="text-[var(--cobalt-acc)] font-semibold">Markdown supported</span>
              </div>
            </div>
          </section>

          {/* STEP 3: EVIDENCE UPLOAD DROPZONE */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--cobalt-acc)] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-headline text-sm font-bold text-slate-900">
                  Cryptographic Evidence Upload
                </h2>
              </div>
              <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[12px] font-bold">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>SHA-256 Anti-Tamper</span>
              </div>
            </div>

            {/* Drag & Drop Canvas */}
            <div
              onClick={handleAddSampleFile}
              className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white text-[var(--cobalt-acc)] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs border border-slate-200">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-xs sm:text-sm font-bold text-slate-900">
                Drop proof files here or browse folder
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload screenshots, video clips, or Riot support emails (PNG, JPG, MP4 up to 50MB)
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSampleFile();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-xs border border-slate-200 cursor-pointer"
                >
                  Choose Images
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSampleFile();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-xs border border-slate-200 cursor-pointer"
                >
                  Attach Video (MP4)
                </button>
              </div>
            </div>

            {/* Uploaded Evidence Chips List */}
            <div className="space-y-2">
              {evidenceFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-[var(--cobalt-acc)] flex items-center justify-center shrink-0 border border-slate-100">
                      {file.name.endsWith(".txt") ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <ImageIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline text-xs font-bold text-slate-900 truncate">
                          {file.name}
                        </span>
                        {file.isVerified && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[12px] font-bold flex items-center gap-1 border border-emerald-200">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            {file.tag}
                          </span>
                        )}
                        {!file.isVerified && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[12px] font-medium">
                            {file.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-[13px] text-slate-400">
                        {file.size} • Hash: {file.hash}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    aria-label="Remove evidence file"
                    className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2 text-slate-600 text-[13px] border border-slate-200/80">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                All uploads watermarked with cryptographic session hash #SF-88492-DISPUTE for legal
                anti-tampering arbitration.
              </span>
            </div>
          </section>

          {/* STEP 4: DECLARATION & FAIR PLAY CONFIRMATION */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--cobalt-acc)] text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h2 className="font-headline text-sm font-bold text-slate-900">
                Legal Escrow Affirmation
              </h2>
            </div>
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={affirmContact}
                  onChange={(e) => setAffirmContact(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  I affirm that I have attempted to contact the seller via{" "}
                  <strong>Safedeal Messages</strong>, and the credentials provided do not permit access
                  to the listed digital asset.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={affirmTerms}
                  onChange={(e) => setAffirmTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  I understand fraudulent dispute claims result in immediate account termination,
                  forfeiture of escrow rights, and potential reporting to identity verification providers.
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="px-6 sm:px-8 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Return to Order</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isMinMet || !affirmContact || !affirmTerms || isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-clean-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting & Freezing Escrow...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Pause Timer & Submit Formal Dispute</span>
              </>
            )}
          </button>
        </div>

        {/* Helper SLA Strip */}
        <div className="px-6 sm:px-8 py-2.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[var(--cobalt-acc)]" />
            <span>
              <strong>Safedeal Dispute Response SLA:</strong> Human arbitrator assigned within{" "}
              <strong>15 minutes</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Escrow Case ID: #DIS-88492-A</span>
            <span>•</span>
            <span>PCI-DSS Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
