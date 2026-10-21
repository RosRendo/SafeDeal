"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import AdminSidebar, { AdminActiveNav } from "@/components/navigation/AdminSidebar";
import AdminHeader, { AdminNotification } from "@/components/navigation/AdminHeader";

interface AdminShellContextValue {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  showToast: (msg: string) => void;
}

const AdminShellContext = createContext<AdminShellContextValue>({
  searchQuery: "",
  setSearchQuery: () => {},
  showToast: () => {},
});

export function useAdminSearch(): Pick<AdminShellContextValue, "searchQuery" | "setSearchQuery"> {
  const ctx = useContext(AdminShellContext);
  return {
    searchQuery: ctx.searchQuery,
    setSearchQuery: ctx.setSearchQuery,
  };
}

export function useAdminToast(): Pick<AdminShellContextValue, "showToast"> {
  return { showToast: useContext(AdminShellContext).showToast };
}

const ACTIVE_BY_PATH: [string, AdminActiveNav][] = [
  ["/admin/users", "users"],
  ["/admin/listings", "listings"],
  ["/admin/orders", "orders"],
  ["/admin/verifications", "verifications"],
  ["/admin/disputes", "disputes"],
  ["/admin/messages", "arbitration"],
  ["/admin/support", "support"],
  ["/admin/finance", "finance"],
];

const PLACEHOLDER_BY_PATH: [string, string][] = [
  ["/admin/listings", "Search flagged title or merchant..."],
  ["/admin/users", "Search by User ID, display name, email, IP..."],
  ["/admin/verifications", "Search applicant or doc ID..."],
  ["/admin/finance", "Search payout batch, merchant, or TXN..."],
];

function findPrefixValue<T>(pathname: string, map: [string, T][]): T | undefined {
  for (const [prefix, value] of map) {
    if (pathname === prefix || pathname.startsWith(prefix + "/") || pathname.startsWith(prefix + "?")) {
      return value;
    }
  }
  return undefined;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [badgeCounts, setBadgeCounts] = useState({ disputes: 0, verifications: 0 });

  // Reset the page-scoped omni search when navigating between sections
  useEffect(() => {
    setSearchQuery("");
    setToastMessage(null);
  }, [pathname]);

  // Live notification feed derived from operational data
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success || !json.data) return;
        const overview: Record<string, number> = json.data.overview || {};
        setBadgeCounts({
          disputes: overview.activeDisputes || 0,
          verifications: overview.kycPendingCount || 0,
        });
        const incidents: any[] = json.data.incidents || [];
        const feed: AdminNotification[] = [];

        for (const incident of incidents.filter((i) => i.severity === "CRITICAL")) {
          feed.push({
            id: incident.id,
            title: incident.type,
            meta: `${incident.resourceId} • ${incident.slaRemaining || "SLA ticking"} • ${incident.financialAmount || ""}`,
            time: "Awaiting triage",
            severity: "critical",
            href: "/admin/disputes",
          });
        }
        for (const incident of incidents.filter((i) => i.severity === "NORMAL")) {
          feed.push({
            id: incident.id,
            title: incident.type,
            meta: `${incident.resourceId} • ${incident.slaRemaining || "awaiting confirmation"}`,
            time: incident.ageText || "Today",
            severity: "info",
            href: "/admin/orders",
          });
        }
        if ((overview.kycPendingCount || 0) > 0) {
          feed.push({
            id: "kyc-pending",
            title: `${overview.kycPendingCount} merchant verification${overview.kycPendingCount === 1 ? "" : "s"} pending`,
            meta: "ID & bank checks awaiting staff review",
            time: "Review queue",
            severity: "warn",
            href: "/admin/verifications",
          });
        }
        if ((overview.aiFlaggedCount || 0) > 0) {
          feed.push({
            id: "ai-flags",
            title: `${overview.aiFlaggedCount} listing${overview.aiFlaggedCount === 1 ? "" : "s"} AI-flagged`,
            meta: "Moderation queue needs a decision",
            time: "Listings & Moderation",
            severity: "warn",
            href: "/admin/listings",
          });
        }
        if ((overview.fraudAlertsCount || 0) > 0) {
          feed.push({
            id: "fraud-alerts",
            title: `${overview.fraudAlertsCount} fraud alert${overview.fraudAlertsCount === 1 ? "" : "s"} active`,
            meta: "Velocity & ATO signals in the risk engine",
            time: "Risk & Fraud",
            severity: "critical",
            href: "/admin/risk",
          });
        }
        setNotifications(feed);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (msg) {
      window.setTimeout(() => {
        setToastMessage((current) => (current === msg ? null : current));
      }, 6000);
    }
  }, []);

  const activeItem = findPrefixValue(pathname, ACTIVE_BY_PATH) ?? "overview";
  const searchPlaceholder = findPrefixValue(pathname, PLACEHOLDER_BY_PATH) ?? "Search accounts, listings, txns...";

  const ctxValue: AdminShellContextValue = {
    searchQuery,
    setSearchQuery,
    showToast,
  };

  return (
    <AdminShellContext.Provider value={ctxValue}>
      <div className="min-h-screen bg-[var(--ds-surface)] text-[var(--ds-navy)] font-sans antialiased selection:bg-blue-600 selection:text-white">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span className="text-[13px] font-semibold">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Persistent Ops Back Office Shell */}
        <AdminSidebar
          activeItem={activeItem}
          onActionToast={showToast}
          verificationCount={badgeCounts.verifications}
          disputeCount={badgeCounts.disputes}
        />

        {/* Main Content Pane */}
        <div className="md:pl-72 pt-14 md:pt-0 min-h-screen">
          <AdminHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={searchPlaceholder}
            notifications={notifications}
          />
          {children}
        </div>
      </div>
    </AdminShellContext.Provider>
  );
}
