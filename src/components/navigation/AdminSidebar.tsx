"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import {
  ShieldCheck,
  Menu,
  X,
  Server,
  Activity,
  Users,
  Layers,
  FileText,
  Gavel,
  MessageSquare,
  AlertOctagon,
  FileCode,
  DollarSign,
  FileSpreadsheet,
  History,
  KeyRound,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";

export type AdminActiveNav =
  | "overview"
  | "users"
  | "listings"
  | "orders"
  | "verifications"
  | "disputes"
  | "arbitration"
  | "support"
  | "risk"
  | "finance"
  | "fees"
  | "audit"
  | "staff"
  | "settings";

interface AdminSidebarProps {
  activeItem?: AdminActiveNav;
  onActionToast?: (msg: string) => void;
  verificationCount?: number;
  disputeCount?: number;
}

export default function AdminSidebar({
  activeItem = "overview",
  onActionToast,
  verificationCount = 0,
  disputeCount = 0,
}: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const isActive = (nav: AdminActiveNav) => activeItem === nav;
  const itemCls = (nav: AdminActiveNav) =>
    `flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all font-semibold cursor-pointer ${
      isActive(nav)
        ? "bg-[var(--cobalt-acc)] text-white shadow-sm"
        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
    }`;

  const sidebarContent = (
      <div className="flex flex-col justify-between h-full select-none bg-[var(--ds-navy-2)]">
        <div className="flex flex-col min-h-0 flex-1">
          {/* Logo Brand Header */}
          <div className="shrink-0 p-6 pb-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            aria-label="SafeDeal Ops Back Office Home"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--cobalt-acc)] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-extrabold text-xl tracking-tight text-white leading-none">
                SafeDeal
              </span>
              <span className="text-[11px] text-[var(--ds-navy-muted)] mt-1 uppercase tracking-wider font-bold">
                Ops Back Office
              </span>
            </div>
          </Link>
          <button
            onClick={() => (onActionToast ? onActionToast("Sidebar navigation pinned.") : undefined)}
            className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center text-[var(--ds-navy-muted)] hover:text-white transition-colors cursor-pointer hidden md:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Pin Sidebar"
            aria-label="Pin Sidebar"
          >
            <Menu className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center text-[var(--ds-navy-muted)] md:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Environment Status Badge */}
        <div className="shrink-0 px-4 mb-3">
          <div className="w-full py-1.5 px-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[var(--ds-navy-muted)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span className="text-[12px] text-emerald-400 uppercase tracking-wider font-bold">
                PROD - US-EAST-1
              </span>
            </div>
            <Server className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="dark-scrollbar flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 px-4 pt-1 pb-4 text-[13px]">
          {/* Group 1: Overview */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[11px] uppercase tracking-wider text-[var(--ds-navy-muted)] font-bold">
              Overview
            </span>
            <Link href="/admin" aria-current={isActive("overview") ? "page" : undefined} className={itemCls("overview")}>
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4" aria-hidden="true" />
                <span>Operations Overview</span>
              </div>
            </Link>
          </div>

          {/* Group 2: Marketplace */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[11px] uppercase tracking-wider text-[var(--ds-navy-muted)] font-bold">
              Marketplace
            </span>
            <Link href="/admin/users" aria-current={isActive("users") ? "page" : undefined} className={itemCls("users")}>
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>Users & Sellers</span>
              </div>
            </Link>
            <Link
              href="/admin/listings"
              aria-current={isActive("listings") ? "page" : undefined}
              className={itemCls("listings")}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" aria-hidden="true" />
                <span>Listings & Moderation</span>
              </div>
            </Link>
            <Link href="/admin/orders" aria-current={isActive("orders") ? "page" : undefined} className={itemCls("orders")}>
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>Orders & Transactions</span>
              </div>
            </Link>
          </div>

          {/* Group 3: Trust & Safety */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[11px] uppercase tracking-wider text-[var(--ds-navy-muted)] font-bold">
              Trust & Safety
            </span>
            <Link
              href="/admin/verifications"
              aria-current={isActive("verifications") ? "page" : undefined}
              className={itemCls("verifications")}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Verification Reviews</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  verificationCount === 0
                    ? "bg-white/5 text-[var(--ds-navy-muted)]"
                    : isActive("verifications")
                    ? "bg-white/20 text-white"
                    : "bg-[var(--cobalt-acc)]/40 text-blue-200"
                }`}
              >
                {verificationCount}
              </span>
            </Link>
            <Link
              href="/admin/disputes"
              aria-current={isActive("disputes") ? "page" : undefined}
              className={itemCls("disputes")}
            >
              <div className="flex items-center gap-2.5">
                <Gavel className="w-4 h-4" aria-hidden="true" />
                <span>Disputes & Refunds</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  disputeCount === 0 ? "bg-white/5 text-[var(--ds-navy-muted)]" : "bg-rose-500 text-white"
                }`}
              >
                {disputeCount}
              </span>
            </Link>
            <Link
              href="/admin/messages"
              aria-current={isActive("arbitration") ? "page" : undefined}
              className={itemCls("arbitration")}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                <span>Arbitration Chat</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isActive("arbitration") ? "bg-white/20 text-white" : "bg-amber-500/40 text-amber-200"
                }`}
              >
                Live
              </span>
            </Link>
            <Link
              href="/admin/risk"
              aria-current={isActive("risk") ? "page" : undefined}
              className={itemCls("risk")}
            >
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>Risk &amp; Fraud</span>
              </div>
            </Link>
            <Link
              href="/admin/support"
              aria-current={isActive("support") ? "page" : undefined}
              className={itemCls("support")}
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4" aria-hidden="true" />
                <span>Support Inbox</span>
              </div>
            </Link>
          </div>

          {/* Group 4: Finance */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[11px] uppercase tracking-wider text-[var(--ds-navy-muted)] font-bold">
              Finance
            </span>
            <Link href="/admin/finance" aria-current={isActive("finance") ? "page" : undefined} className={itemCls("finance")}>
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4" aria-hidden="true" />
                <span>Payouts & Settlement</span>
              </div>
            </Link>
            <Link
              href="/admin/fees"
              aria-current={isActive("fees") ? "page" : undefined}
              className={itemCls("fees")}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
                <span>Fees &amp; Reconciliation</span>
              </div>
            </Link>
          </div>

          {/* Group 5: Platform */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[11px] uppercase tracking-wider text-[var(--ds-navy-muted)] font-bold">
              Platform
            </span>
            <Link
              href="/admin/audit"
              aria-current={isActive("audit") ? "page" : undefined}
              className={itemCls("audit")}
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4" aria-hidden="true" />
                <span>Audit Logs</span>
              </div>
            </Link>
            <Link
              href="/admin/staff"
              aria-current={isActive("staff") ? "page" : undefined}
              className={itemCls("staff")}
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4" aria-hidden="true" />
                <span>Staff &amp; Permissions</span>
              </div>
            </Link>
            <Link
              href="/admin/settings"
              aria-current={isActive("settings") ? "page" : undefined}
              className={itemCls("settings")}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" aria-hidden="true" />
                <span>System Settings</span>
              </div>
            </Link>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="shrink-0 p-4 border-t border-slate-800 flex flex-col gap-3">
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white font-semibold">Systems Healthy</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
          </div>
          <span className="text-[12px] text-[var(--ds-navy-muted)]">
            Escrow Ledger synchronized
          </span>
        </div>
        <div className="flex items-center justify-between text-[var(--ds-navy-muted)] text-[13px]">
          <Link
            href="/browse"
            className="flex items-center gap-1 hover:text-white transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Marketplace</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-1 hover:text-rose-400 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-md cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Log Out</span>
          </button>
          </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 text-[var(--ds-navy-ink)] z-50 hidden md:flex flex-col shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Toggle Header Bar (Shown only when screen < 768px) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--ds-navy-2)] text-[var(--ds-navy-ink)] z-40 flex items-center justify-between px-4 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--cobalt-acc)] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="font-headline font-bold text-base text-white">SafeDeal Ops</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg bg-slate-800/60 text-[var(--ds-navy-ink)] hover:bg-slate-700/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full text-[var(--ds-navy-ink)] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
