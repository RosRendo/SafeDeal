"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import EscrowGuaranteeModal from "@/components/pages/EscrowGuaranteeModal";
import EscrowDisputeModal from "@/components/orders/EscrowDisputeModal";
import AssetVaultModal from "@/components/orders/AssetVaultModal";
import OrderCompletionReleaseModal from "@/components/orders/OrderCompletionReleaseModal";
import { getProductById } from "@/lib/allProducts";
import { apiUpdateOrderStatus } from "@/lib/apiClient";
import {
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  ChevronRight,
  Lock,
  Unlock,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  FileText,
  HelpCircle,
  Star,
  ExternalLink,
  PhoneCall,
  Flame,
} from "lucide-react";

function OrderInspectionDetailContent() {
  const params = useParams();
  const orderId = typeof params?.orderId === "string" ? params.orderId : "ESC-94821";

  // Resolve dynamic product details if order is linked to a product ID
  const extractedItemId = orderId.startsWith("ESC-") ? orderId.replace("ESC-", "") : orderId;
  const orderProduct = useMemo(() => getProductById(extractedItemId), [extractedItemId]);
  const sellerSlug = (orderProduct.seller?.name || "AeroGamingDeals")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  // Modal states
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);
  const [isReleaseConfirmOpen, setIsReleaseConfirmOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  // Escrow status: 'inspecting' | 'completed' | 'disputed'
  const [escrowStatus, setEscrowStatus] = useState<"inspecting" | "completed" | "disputed">("inspecting");

  // Credential vault state
  const [isVaultDecrypted, setIsVaultDecrypted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailPass, setShowEmailPass] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Inspection Checklist State
  const [checklist, setChecklist] = useState({
    loginVerified: true,
    emailChanged: false,
    twoFactorAdded: false,
    inventoryVerified: false,
  });

  // 48h Countdown Timer (simulated in state)
  const [secondsRemaining, setSecondsRemaining] = useState(47 * 3600 + 41 * 60 + 20);

  useEffect(() => {
    if (escrowStatus !== "inspecting") return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [escrowStatus]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmRelease = () => {
    setIsReleaseConfirmOpen(false);
    setEscrowStatus("completed");
    apiUpdateOrderStatus(orderId, "release");
  };

  const handleOpenDispute = () => {
    setIsDisputeModalOpen(false);
    setEscrowStatus("disputed");
    apiUpdateOrderStatus(orderId, "dispute");
  };

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedSteps = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* Header */}
      <Header
        activeCategory="all"
        onSelectCategory={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
      />

      <main className="w-full pt-[102px] sm:pt-[106px] flex-1 flex flex-col">
        {/* Dynamic Breadcrumbs & Escrow Banner */}
        <div className="w-full bg-white border-b border-slate-200/80 shadow-clean-xs">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/orders" className="hover:text-blue-600 transition-colors">
                My Escrow Transactions
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold">Order #{orderId}</span>
            </nav>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>$195.00 Protected in Escrow Vault</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Inspection Room Grid */}
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ========================================================================= */}
            {/* LEFT / CENTER: Inspection Countdown & Credentials Decryption (lg:col-span-8) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Status Header Box */}
              <div
                className={`p-6 sm:p-7 rounded-3xl border transition-all shadow-clean-sm flex flex-col gap-4 bg-[var(--ds-navy)] text-white`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {escrowStatus === "inspecting" && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                        <span>48-Hour Inspection Active</span>
                      </span>
                    )}
                    {escrowStatus === "completed" && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Transaction Completed & Escrow Settled</span>
                      </span>
                    )}
                    {escrowStatus === "disputed" && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Escrow Frozen • Mediation in Progress</span>
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-mono">Reference: {orderId}</span>
                </div>

                {escrowStatus === "inspecting" && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div>
                      <h2 className="font-headline text-lg sm:text-xl font-bold">
                        Inspection Guarantee Window
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-md">
                        Log in, change recovery emails, and verify your in-game inventory. The seller will NOT receive your $195.00 payment until you confirm satisfaction or the 48-hour inspection timer expires.
                      </p>
                    </div>

                    {/* Live Clock Digits */}
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center gap-2 flex-shrink-0 self-start sm:self-auto font-mono">
                      <Clock className="w-5 h-5 text-blue-400 animate-spin" style={{ animationDuration: "8s" }} />
                      <div className="flex items-baseline gap-1 text-xl sm:text-2xl font-black tracking-tight text-white">
                        <span>{String(hours).padStart(2, "0")}h</span>
                        <span className="text-slate-400">:</span>
                        <span>{String(minutes).padStart(2, "0")}m</span>
                        <span className="text-slate-400">:</span>
                        <span className="text-blue-400">{String(seconds).padStart(2, "0")}s</span>
                      </div>
                    </div>
                  </div>
                )}

                {escrowStatus === "completed" && (
                  <div className="pt-2">
                    <h2 className="font-headline text-xl font-bold text-emerald-300">
                      Payment Successfully Released!
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      ${orderProduct.price.toFixed(2)} has been transferred to seller {orderProduct.seller?.name || "AeroGamingDeals"}. You have permanent ownership of this digital asset. Thank you for trading safely with Safedeal Escrow.
                    </p>
                  </div>
                )}
              </div>

              {/* AUTOMATED CREDENTIAL VAULT CARD */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-clean-sm flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-headline text-base font-bold text-slate-900">
                        Automated Asset Vault (Encrypted Credentials)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Zero-wait dispatch. Decrypt login credentials deposited by the seller.
                      </p>
                    </div>
                  </div>

                  {!isVaultDecrypted ? (
                    <button
                      onClick={() => {
                        setIsVaultDecrypted(true);
                        setIsVaultModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-headline text-xs font-bold rounded-xl shadow-clean-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Decrypt & Reveal Credentials</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Vault Decrypted
                      </span>
                      <button
                        onClick={() => setIsVaultModalOpen(true)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" /> Open Vault Dialog
                      </button>
                    </div>
                  )}
                </div>

                {/* Vault Decrypted Data Table */}
                {isVaultDecrypted ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Riot Login */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                          Riot Client Login / Username
                        </span>
                        <div className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                          ValkyrieAce#NA1
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy("ValkyrieAce#NA1", "login")}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedField === "login" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === "login" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Riot Password */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                          Current Account Password
                        </span>
                        <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{showPassword ? "V@l0rantP@ss2025!" : "••••••••••••••••"}</span>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy("V@l0rantP@ss2025!", "pass")}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedField === "pass" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === "pass" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Original Email (OGE) */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                          Original Creation Email (OGE Access)
                        </span>
                        <div className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                          valkyrie.original.oge@gmail.com
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy("valkyrie.original.oge@gmail.com", "email")}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedField === "email" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === "email" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* OGE Email Password */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                          OGE Email Password
                        </span>
                        <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{showEmailPass ? "MailSecure#2024!" : "••••••••••••••••"}</span>
                          <button
                            onClick={() => setShowEmailPass(!showEmailPass)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            {showEmailPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy("MailSecure#2024!", "emailPass")}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedField === "emailPass" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === "emailPass" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                    <Lock className="w-8 h-8 text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">
                      Credentials are locked in end-to-end encrypted storage.
                    </p>
                    <p className="text-[12px] text-slate-500 max-w-sm">
                      Click "Decrypt & Reveal Credentials" above to inspect Riot username, initial password, and verified creation email credentials.
                    </p>
                  </div>
                )}
              </div>

              {/* BUYER GUIDED INSPECTION CHECKLIST */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-clean-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-headline text-base font-bold text-slate-900">
                      Step-by-Step Security Inspection Checklist
                    </h3>
                    <p className="text-xs text-slate-500">
                      Complete all 4 verification steps before releasing escrow funds to the seller.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 font-headline font-bold text-xs rounded-full">
                    {completedSteps} / 4 Completed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      id: "loginVerified" as const,
                      title: "1. Log into Riot Client",
                      desc: "Verify initial login credentials work and account is not banned or restricted.",
                    },
                    {
                      id: "emailChanged" as const,
                      title: "2. Change Password & Link Your Personal Email",
                      desc: "Navigate to account settings, update primary recovery email, and change password.",
                    },
                    {
                      id: "twoFactorAdded" as const,
                      title: "3. Enable Two-Factor Authenticator (2FA)",
                      desc: "Attach your personal smartphone or authenticator app for lifelong anti-recovery protection.",
                    },
                    {
                      id: "inventoryVerified" as const,
                      title: "4. Verify In-Game Weapons & Rank",
                      desc: "Confirm Champions 2021 & 2023 skins, Immortal 3 Act rank, and 850 VP balance in client.",
                    },
                  ].map((step) => {
                    const isChecked = checklist[step.id];

                    return (
                      <div
                        key={step.id}
                        onClick={() => toggleChecklistItem(step.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isChecked
                            ? "bg-emerald-50/60 border-emerald-200"
                            : "bg-slate-50/80 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-colors ${
                            isChecked
                              ? "bg-emerald-600 text-white"
                              : "border border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5">
                          <h4
                            className={`font-headline text-xs sm:text-sm font-bold ${
                              isChecked ? "text-emerald-950 line-through" : "text-slate-900"
                            }`}
                          >
                            {step.title}
                          </h4>
                          <p className="text-[12px] text-slate-500">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PRIMARY ESCROW DECISION BUTTONS */}
              {escrowStatus === "inspecting" && (
                <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-clean-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-0.5 text-left">
                    <h4 className="font-headline font-bold text-sm text-slate-900">
                      Ready to Complete the Deal?
                    </h4>
                    <p className="text-xs text-slate-500">
                      Release payment to the seller if everything matches, or freeze escrow if you found an issue.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setIsDisputeModalOpen(true)}
                      className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Halt & Dispute</span>
                    </button>

                    <button
                      onClick={() => setIsReleaseConfirmOpen(true)}
                      className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-headline font-bold text-xs shadow-clean-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Release Funds ($195.00)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* RIGHT COLUMN: Order Summary & Seller Contact (lg:col-span-4)              */}
            {/* ========================================================================= */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-32">
              {/* Product Summary Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-clean-sm flex flex-col gap-4">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Order Summary
                </span>

                <div className="flex items-center gap-3.5">
                  <img
                    src={orderProduct.image}
                    alt={orderProduct.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-headline font-bold text-xs text-slate-900 line-clamp-2">
                      {orderProduct.title}
                    </h4>
                    <span className="text-[12px] text-slate-500 block mt-0.5">
                      {orderProduct.platform || "Digital Asset"} • {orderProduct.region || "Global"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Item Escrow Value</span>
                    <span className="font-bold text-slate-900">${orderProduct.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Safedeal Escrow Fee</span>
                    <span className="font-bold text-emerald-600">$0.00 (Free for Buyers)</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-headline font-bold text-sm pt-2 border-t border-slate-100">
                    <span>Total Held in Escrow</span>
                    <span className="text-blue-600">${orderProduct.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Seller Contact Block */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/store/${sellerSlug}`}
                    className="flex items-center gap-2.5 hover:opacity-85 transition-opacity group"
                  >
                    <img
                      src={orderProduct.seller?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"}
                      alt={orderProduct.seller?.name || "Merchant"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block group-hover:text-blue-600 transition-colors">
                        {orderProduct.seller?.name || "Verified Merchant"}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold">Online now • Avg: 4m</span>
                    </div>
                  </Link>

                  <Link
                    href={`/messages?orderId=${orderId}`}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors inline-flex items-center justify-center gap-1.5 text-xs font-semibold"
                    title="Open Escrow Inspection Chat"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-600 font-bold">Chat</span>
                  </Link>
                </div>
              </div>

              {/* 24/7 Arbitration Support Card */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>24/7 Human Mediation Standing By</span>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Need help recovering an account or inspecting email headers? Our gaming arbitrators are online 24/7 to inspect transaction evidence.
                </p>
                <button
                  onClick={() => setIsProtectionModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:underline self-start flex items-center gap-1"
                >
                  <span>Review Escrow Agreement</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer
        onSelectCategory={() => {}}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
      />

      {/* CONFIRM RELEASE ESCROW MODAL */}
      <OrderCompletionReleaseModal
        isOpen={isReleaseConfirmOpen}
        onClose={() => setIsReleaseConfirmOpen(false)}
        onConfirmRelease={() => {
          handleConfirmRelease();
        }}
        orderNumber={`#${orderId}`}
        sellerName={orderProduct.seller?.name || "AeroGamingDeals"}
        assetName={orderProduct.title}
        totalAmount={orderProduct.price}
        netPayout={Number((orderProduct.price * 0.95).toFixed(2))}
        hoursRemaining={Math.floor(secondsRemaining / 3600)}
      />

      {/* DISPUTE MEDIATION MODAL */}
      <EscrowDisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onSubmitDispute={() => {
          setIsDisputeModalOpen(false);
          setEscrowStatus("disputed");
        }}
        orderNumber={`#${orderId}`}
        sellerName={orderProduct.seller?.name || "AeroGamingDeals"}
        escrowAmount={orderProduct.price}
      />

      {/* FULL ASSET VAULT HANDOVER MODAL */}
      <AssetVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        orderNumber={`#${orderId}`}
        sellerName={orderProduct.seller?.name || "AeroGamingDeals"}
        riotId="ApexVandal_99#NA1"
        password="K#9mX$7vLq!2024"
        region="North America (NA / US-East)"
        ogeEmail="apexvandal_original@proton.me"
        ogePassword="Vand4l!Proton#Secure98"
        recoveryToken="RPT-2021-994821"
        onConfirmVerification={() => {
          setIsVaultModalOpen(false);
          setChecklist({
            loginVerified: true,
            emailChanged: true,
            twoFactorAdded: true,
            inventoryVerified: true,
          });
          setIsReleaseConfirmOpen(true);
        }}
      />

      {/* Escrow Guarantee Modal */}
      <EscrowGuaranteeModal
        isOpen={isProtectionModalOpen}
        onClose={() => setIsProtectionModalOpen(false)}
      />
    </div>
  );
}

export default function OrderInspectionDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderInspectionDetailContent />
    </React.Suspense>
  );
}
