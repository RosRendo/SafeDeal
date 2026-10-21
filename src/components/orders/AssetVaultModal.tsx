"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Mail,
  Gamepad2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Laptop,
  CheckSquare,
  Square,
  Timer,
  Clock,
  Zap,
} from "lucide-react";

export interface AssetVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  sellerName?: string;
  riotId?: string;
  password?: string;
  region?: string;
  ogeEmail?: string;
  ogePassword?: string;
  recoveryToken?: string;
  onConfirmVerification?: () => void;
}

export default function AssetVaultModal({
  isOpen,
  onClose,
  orderNumber = "#SF-2024-88492",
  sellerName = "VanguardKeys_US",
  riotId = "ApexVandal_99#NA1",
  password = "K#9mX$7vLq!2024",
  region = "North America (NA / US-East)",
  ogeEmail = "apexvandal_original@proton.me",
  ogePassword = "Vand4l!Proton#Secure98",
  recoveryToken = "RPT-2021-994821",
  onConfirmVerification,
}: AssetVaultModalProps) {
  // Visibility toggles
  const [showRiotPw, setShowRiotPw] = useState<boolean>(false);
  const [showOgePw, setShowOgePw] = useState<boolean>(false);

  // Copy states
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PDF download simulation
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Checklist items
  const [checklist, setChecklist] = useState({
    emailBound: false,
    twoFactorEnabled: false,
    passwordChanged: false,
    inventoryVerified: false,
  });

  // Countdown timer simulation (37h 11m 42s)
  const [secondsLeft, setSecondsLeft] = useState<number>(37 * 3600 + 11 * 60 + 42);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, fieldName: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showToast("Secret copied to clipboard (auto-expires in 60s)");
      setTimeout(() => setCopiedField(null), 1800);
    }
  };

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const allCompleted = completedCount === 4;

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      setIsGeneratingPdf(false);
      showToast("Decrypted offline vault credentials PDF generated and saved.");
    }, 1200);
  };

  const handleConfirm = () => {
    if (!allCompleted) {
      showToast("Please review and check off all security action protocol steps before confirming.");
      return;
    }
    showToast(`Handover confirmed! 48h Inspection Period initiated under Escrow ${orderNumber}.`);
    if (onConfirmVerification) onConfirmVerification();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      id="vaultModalBackdrop"
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-[var(--ds-navy-2)] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-blue-500/40 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Top Subtle Security Accent Stripe */}
        <div className="h-1.5 w-full bg-[var(--cobalt-acc)]"></div>

        {/* Modal Header */}
        <div className="px-5 sm:px-8 pt-6 pb-4 bg-white border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs border border-emerald-100">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[13px] font-bold text-emerald-800 flex items-center gap-1 border border-slate-200">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  AES-256 Decrypted Vault Access
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[13px] font-bold text-[var(--cobalt-acc)] border border-blue-200">
                  Protected Handover
                </span>
              </div>
              <h1 className="font-headline text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Digital Asset Handover & Access Credentials
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Order <span className="font-bold text-slate-900">{orderNumber}</span> • Guaranteed by
                Safedeal Escrow Shield
              </p>
            </div>
          </div>

          {/* Close Dialog Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            id="closeModalBtn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="overflow-y-auto px-5 sm:px-8 py-5 space-y-5">
          {/* Top Security Notice Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <div className="flex items-center gap-2 flex-wrap font-bold">
                  <span className="text-emerald-800">🔐 Decryption Verified:</span>
                  <span className="text-slate-900">Oct 24, 2024, 2:16 PM UTC</span>
                </div>
                <p className="text-slate-600 mt-0.5">
                  Clipboard safety active: Copied secrets will auto-clear from clipboard after 60
                  seconds. Do not share these credentials with anyone. Safedeal staff will never ask for
                  your password.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-xs text-slate-800 text-[13px] font-bold border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Vault Socket</span>
            </div>
          </div>

          {/* Credentials Inspection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SECTION 1: Primary Riot Account Login */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clean-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-headline text-xs sm:text-sm font-bold text-slate-900">
                    <Gamepad2 className="w-4 h-4 text-[var(--cobalt-acc)]" />
                    <span>Primary Riot Games Account</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[12px] font-bold text-slate-600">
                    Game Client Login
                  </span>
                </div>

                {/* Field: Riot ID */}
                <div className="mb-3">
                  <label className="block text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Riot ID / Username
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                    <span className="font-mono text-xs font-bold text-slate-900 select-all" id="riotIdVal">
                      {riotId}
                    </span>
                    <button
                      onClick={() => handleCopy(riotId, "riotId")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[var(--cobalt-acc)] text-[13px] font-bold shadow-xs border border-slate-200 transition-all cursor-pointer"
                    >
                      {copiedField === "riotId" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === "riotId" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Field: Password */}
                <div className="mb-3">
                  <label className="block text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Account Password
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                    <span
                      className={`font-mono text-xs font-bold text-slate-900 select-all ${
                        !showRiotPw ? "tracking-widest" : ""
                      }`}
                      id="riotPwDisplay"
                    >
                      {showRiotPw ? password : "••••••••••••••••"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowRiotPw(!showRiotPw)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                        title={showRiotPw ? "Hide password" : "Show password"}
                      >
                        {showRiotPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(password, "riotPw")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[var(--cobalt-acc)] text-[13px] font-bold shadow-xs border border-slate-200 transition-all cursor-pointer"
                      >
                        {copiedField === "riotPw" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedField === "riotPw" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Field: Region */}
                <div>
                  <label className="block text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Account Creation Region / Shard
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{region}</span>
                    <span className="text-[13px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Match Guaranteed
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 text-right">
                <span className="text-[12px] text-slate-400 font-medium">
                  Password last rotated 3 hours ago by SafeTransfer
                </span>
              </div>
            </div>

            {/* SECTION 2: Original Creation Email (OGE) Handover */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clean-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-headline text-xs sm:text-sm font-bold text-slate-900">
                    <Mail className="w-4 h-4 text-[var(--cobalt-acc)]" />
                    <span>Original Creation Email (OGE)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[12px] font-bold text-slate-600">
                    Recovery Ownership
                  </span>
                </div>

                {/* Field: Provider */}
                <div className="mb-3">
                  <label className="block text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    OGE Mailbox Provider
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">ProtonMail Encrypted Domain</span>
                    <span className="text-[13px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      Clean Mailbox Handover
                    </span>
                  </div>
                </div>

                {/* Field: OGE Email */}
                <div className="mb-3">
                  <label className="block text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    OGE Email Address
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                    <span className="font-mono text-xs font-bold text-slate-900 select-all truncate max-w-[210px]">
                      {ogeEmail}
                    </span>
                    <button
                      onClick={() => handleCopy(ogeEmail, "ogeEmail")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[var(--cobalt-acc)] text-[13px] font-bold shadow-xs border border-slate-200 transition-all cursor-pointer shrink-0"
                    >
                      {copiedField === "ogeEmail" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === "ogeEmail" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Field: OGE Password */}
                <div className="mb-3">
                  <label className="block text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    OGE Mailbox Password
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                    <span
                      className={`font-mono text-xs font-bold text-slate-900 select-all ${
                        !showOgePw ? "tracking-widest" : ""
                      }`}
                    >
                      {showOgePw ? ogePassword : "••••••••••••••••"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowOgePw(!showOgePw)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                        title={showOgePw ? "Hide password" : "Show password"}
                      >
                        {showOgePw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(ogePassword, "ogePw")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[var(--cobalt-acc)] text-[13px] font-bold shadow-xs border border-slate-200 transition-all cursor-pointer"
                      >
                        {copiedField === "ogePw" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedField === "ogePw" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Field: First Receipt Proof */}
                <div>
                  <label className="block text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    First Purchase Invoice / Recovery Token
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">{recoveryToken}</span>
                    <span className="text-[13px] text-slate-500 font-medium">
                      Account recovery proof attached
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 text-right">
                <span className="text-[12px] text-emerald-700 font-bold">
                  100% Lifetime Reclaim Protection Guarantee
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: 2FA & Handover Verification Chips */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-800 text-[13px] font-bold shadow-xs border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                2FA Mobile Number Unbound by Seller
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-800 text-[13px] font-bold shadow-xs border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Vanguard HWID Clean Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-800 text-[13px] font-bold shadow-xs border border-slate-200">
                <Laptop className="w-3.5 h-3.5 text-[var(--cobalt-acc)]" />
                All Active Sessions Terminated
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[13px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safedeal Automated Bot Inspected</span>
            </div>
          </div>

          {/* SECTION 4: Mandatory Buyer Handover Checklist */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-clean-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-headline text-sm font-bold text-slate-900">
                <CheckSquare className="w-4 h-4 text-[var(--cobalt-acc)]" />
                <span>Buyer Security Action Protocol</span>
              </div>
              <div
                className={`text-[13px] px-2.5 py-0.5 rounded-full font-bold ${
                  allCompleted
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {completedCount} of 4 Completed
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Complete each step to safely transfer ownership before completing the order. Your funds
              remain safe in escrow until you give final sign-off.
            </p>

            {/* Checklist Items */}
            <div className="space-y-2">
              {/* Step 1 */}
              <label
                onClick={() => toggleChecklist("emailBound")}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/70"
              >
                <input
                  type="checkbox"
                  checked={checklist.emailBound}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 rounded text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-slate-900">
                    Step 1: Log in to account management and bind your personal email address
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Visit account.riotgames.com &gt; Personal Information &gt; Update Email. Confirm
                    code via OGE ProtonMail inbox.
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[12px] font-bold shrink-0 ${
                    checklist.emailBound
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {checklist.emailBound ? "Verified" : "Pending"}
                </span>
              </label>

              {/* Step 2 */}
              <label
                onClick={() => toggleChecklist("twoFactorEnabled")}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/70"
              >
                <input
                  type="checkbox"
                  checked={checklist.twoFactorEnabled}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 rounded text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-slate-900">
                    Step 2: Enable Riot Mobile Authenticator / 2FA with your personal phone number
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Enforces two-factor authentication so no previous party can log in without your device.
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[12px] font-bold shrink-0 ${
                    checklist.twoFactorEnabled
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {checklist.twoFactorEnabled ? "Verified" : "Pending"}
                </span>
              </label>

              {/* Step 3 */}
              <label
                onClick={() => toggleChecklist("passwordChanged")}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/70"
              >
                <input
                  type="checkbox"
                  checked={checklist.passwordChanged}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 rounded text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-slate-900">
                    Step 3: Change the account password to your own unique secret
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Change both Riot Games and ProtonMail passwords to completely new passwords known
                    only to you.
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[12px] font-bold shrink-0 ${
                    checklist.passwordChanged
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {checklist.passwordChanged ? "Verified" : "Pending"}
                </span>
              </label>

              {/* Step 4 */}
              <label
                onClick={() => toggleChecklist("inventoryVerified")}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/70"
              >
                <input
                  type="checkbox"
                  checked={checklist.inventoryVerified}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 rounded text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-slate-900">
                    Step 4: Verify in-game inventory (Champions 2021 Vandal, Peak Immortal rank)
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Launch the Riot client to verify all items match the seller&apos;s initial listing
                    screenshot description.
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[12px] font-bold shrink-0 ${
                    checklist.inventoryVerified
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {checklist.inventoryVerified ? "Verified" : "Pending"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-8 py-4 bg-white border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Inspection Clock Indicator */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-[var(--cobalt-acc)] flex items-center justify-center shrink-0 border border-slate-200">
              <Timer className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span>Inspection Window:</span>
                <span className="text-[var(--cobalt-acc)] font-mono">
                  {hours}h {minutes}m {seconds < 10 ? `0${seconds}` : seconds}s remaining
                </span>
              </div>
              <div className="text-slate-500 text-[13px]">
                Funds held in escrow. Report dispute within this period if credentials fail.
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Download Vault PDF Backup */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                  <span>Generating Backup...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Vault PDF</span>
                </>
              )}
            </button>

            {/* Confirm Verification Button */}
            <button
              onClick={handleConfirm}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-xs shadow-clean-sm transition-all active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Have Saved & Verified</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
