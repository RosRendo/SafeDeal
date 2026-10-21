"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import EscrowGuaranteeModal from "@/components/pages/EscrowGuaranteeModal";
import { getCurrentUser } from "@/lib/auth";
import {
  ShieldCheck,
  User,
  KeyRound,
  CreditCard,
  BadgeCheck,
  Smartphone,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Mail,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Laptop,
  Shield,
  Zap,
} from "lucide-react";

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<"security" | "profile" | "payments" | "kyc">("security");
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);
  const [account, setAccount] = useState<{ name: string; email: string; avatar: string } | null>(null);

  // Security States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [smsBackupEnabled, setSmsBackupEnabled] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setAccount({ name: user.name || "Account Holder", email: user.email || user.name || "member@safedeal.com", avatar: user.avatar || "" });
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-slate-900 flex flex-col antialiased selection:bg-[var(--cobalt-acc)] selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[var(--ds-navy)] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold border border-emerald-500/40 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Header
        activeCategory="all"
        onSelectCategory={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
      />

      <main className="w-full pt-28 flex-1">
        {/* Breadcrumb & Title */}
        <div className="bg-white border-b border-slate-200 py-8">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-slate-900">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 font-bold">Account Settings</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {account?.avatar ? (
                    <img
                      src={account.avatar}
                      alt={`${account.name} profile`}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[var(--cobalt-acc)]/20 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-headline font-bold text-lg ring-2 ring-[var(--cobalt-acc)]/20 shadow-xs">
                      {(account?.name || "A")
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white" />
                </div>
                <div>
                  <h1 className="font-headline text-2xl font-bold text-slate-900">
                    {account?.name || "Account Holder"}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {account?.email || ""} • User ID: <span className="font-mono text-slate-700">#USR-10892</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      KYC Tier 2 Verified
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-bold">
                      Escrow Shield Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/orders"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  My Transactions
                </Link>
                <Link
                  href="/seller"
                  className="px-4 py-2 bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Seller Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Layout */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="space-y-1">
              {[
                { id: "security", label: "Security & 2FA", icon: KeyRound },
                { id: "profile", label: "Profile & Identity", icon: User },
                { id: "payments", label: "Payment & Payout Methods", icon: CreditCard },
                { id: "kyc", label: "Verification Tiers (KYC)", icon: BadgeCheck },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Tab Panel */}
            <div className="md:col-span-3 space-y-6">
              {activeTab === "security" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Two-Factor Authentication Box */}
                  <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline font-bold text-base text-slate-900">
                            Two-Factor Authentication (2FA)
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Requires an authenticator code (Google Authenticator, 1Password, or Authy) to decrypt vault credentials and authorize escrow releases.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setTwoFactorEnabled(!twoFactorEnabled);
                          showToast(
                            twoFactorEnabled
                              ? "2FA disabled (Not recommended)"
                              : "2FA Authenticator activated successfully!"
                          );
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          twoFactorEnabled
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {twoFactorEnabled ? "Active & Protected" : "Enable 2FA"}
                      </button>
                    </div>

                    {twoFactorEnabled && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-[var(--cobalt-acc)] shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900">
                              Authenticator App Linked
                            </p>
                            <p className="text-[12px] text-slate-500">
                              iPhone 15 Pro • Last verified today at 2:16 PM UTC
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => showToast("Test code sent to Authenticator App.")}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                        >
                          Test 2FA Prompt
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Vault Decryption Password Rotation */}
                  <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                    <h3 className="font-headline font-bold text-base text-slate-900">
                      Primary Account Password
                    </h3>
                    <p className="text-xs text-slate-500">
                      Used to log into SafeDeal Escrow. Never share your password with anyone.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-slate-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value="••••••••••••••••"
                          disabled
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-slate-700">
                          New Secure Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter new 12+ char password"
                          className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => showToast("Password updated successfully!")}
                        className="px-4 py-2.5 bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Active Hardware Sessions */}
                  <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline font-bold text-base text-slate-900">
                        Active Hardware Sessions & Devices
                      </h3>
                      <button
                        onClick={() => showToast("All other sessions terminated.")}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Terminate All Other Sessions
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Laptop className="w-5 h-5 text-slate-600" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              Windows PC • Chrome 129 (Current Session)
                            </p>
                            <p className="text-[12px] text-slate-500">
                              IP: 198.51.100.42 • Los Angeles, United States
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          This Device
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-5 animate-in fade-in duration-200">
                  <h3 className="font-headline font-bold text-base text-slate-900">
                    Profile & Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Display Name</label>
                      <input
                        type="text"
                        defaultValue={account?.name || ""}
                        className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Primary Email</label>
                      <input
                        type="email"
                        defaultValue={account?.email || ""}
                        className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => showToast("Profile information saved.")}
                      className="px-5 py-2.5 bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "payments" && (
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline font-bold text-base text-slate-900">
                      Saved Payment & Escrow Refund Cards
                    </h3>
                    <button
                      onClick={() => showToast("Add card form opened.")}
                      className="px-3.5 py-1.5 bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + Add New Card
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-[var(--cobalt-acc)]" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Visa ending in •••• 4242
                          </p>
                          <p className="text-[12px] text-slate-500">
                            Expires 08/2028 • Default for escrow refunds
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] font-bold">
                        Default
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "kyc" && (
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-5 animate-in fade-in duration-200">
                  <h3 className="font-headline font-bold text-base text-slate-900">
                    Identity Verification Status
                  </h3>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">
                        Tier 2 PRO Verified Merchant & Buyer
                      </h4>
                      <p className="text-[12px] text-emerald-700">
                        Passport biometric validation verified. Up to $10,000 instant escrow transactions enabled.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/protection"
                      className="text-xs font-bold text-[var(--cobalt-acc)] hover:underline flex items-center gap-1"
                    >
                      <span>Learn about Tier 3 VIP Bonded status</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer
        onSelectCategory={() => {}}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
      />

      <EscrowGuaranteeModal
        isOpen={isProtectionModalOpen}
        onClose={() => setIsProtectionModalOpen(false)}
      />
    </div>
  );
}
