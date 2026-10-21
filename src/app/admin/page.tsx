"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGetAdminData } from "@/lib/apiClient";
import { useAdminSearch, useAdminToast } from "@/components/navigation/AdminShell";
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Search,
  Bell,
  User,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Gavel,
  Zap,
  Download,
  ExternalLink,
  Lock,
  Unlock,
  MoreVertical,
  ChevronRight,
  Filter,
  Server,
  Activity,
  Terminal,
  Ban,
  TrendingUp,
  X,
  Check,
  Eye,
  Store,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  KeyRound,
  FileSpreadsheet,
  Cpu,
  Radio,
  FileCode,
  Users,
  CreditCard,
  History,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";

interface IncidentItem {
  id: string;
  incidentNumber: string;
  type: string;
  subType: string;
  alertNote?: string;
  severity: "CRITICAL" | "HIGH" | "NORMAL";
  category: "fraud" | "dispute" | "kyc" | "moderation" | "payout";
  resourceId: string;
  resourceTitle: string;
  counterparty?: string;
  financialAmount?: string;
  ageText: string;
  slaRemaining: string;
  isOverdue?: boolean;
  officer: {
    name: string;
    initials: string;
    isUnassigned?: boolean;
  };
  evidenceNotes?: string;
}

export default function OperationsOverviewPage() {
  const router = useRouter();

  // Active navigation tab
  const [activeNav, setActiveNav] = useState("operations-overview");

  // Telemetry time-frame filter
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h");

  // Queue tab filter
  const [queueTab, setQueueTab] = useState<"all" | "high" | "disputes" | "fraud" | "payout">("all");

  // Global search input
  const { searchQuery, setSearchQuery } = useAdminSearch();

  // Live telemetry pulse
  const [lastSyncSeconds, setLastSyncSeconds] = useState(12);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live admin overview stats from API (with seed fallback)
  const [adminStats, setAdminStats] = useState({
    ordersInQueue: 0,
    slaRiskOrders: 0,
    activeDisputes: 0,
    disputeFrozenVolume: 0,
    listingModCount: 0,
    aiFlaggedCount: 0,
    kycPendingCount: 0,
    settlementErrorsCount: 0,
    fraudAlertsCount: 0,
  });

  // Notification toast
  const { showToast } = useAdminToast();

  // Modals state
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyArmed, setEmergencyArmed] = useState(false);
  const [auditLogModalOpen, setAuditLogModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Incident queue dataset (dynamic from API)
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);

  // Fetch live API admin telemetry
  useEffect(() => {
    let isMounted = true;
    apiGetAdminData()
      .then((data: any) => {
        if (!isMounted || !data) return;
        if (data.overview) {
          const ov = data.overview;
          setAdminStats({
            ordersInQueue: ov.ordersInQueue ?? 0,
            slaRiskOrders: ov.slaRiskOrders ?? 0,
            activeDisputes: ov.activeDisputes ?? 0,
            disputeFrozenVolume: typeof ov.disputeFrozenVolume === "number" ? ov.disputeFrozenVolume : 0,
            listingModCount: ov.listingModCount ?? 0,
            aiFlaggedCount: ov.aiFlaggedCount ?? 0,
            kycPendingCount: ov.kycPendingCount ?? 0,
            settlementErrorsCount: ov.settlementErrorsCount ?? 0,
            fraudAlertsCount: ov.fraudAlertsCount ?? 0,
          });
        }
        if (Array.isArray(data.incidents)) {
          setIncidents(data.incidents);
        }
      })
      .catch((err) => {
        console.warn("[SafeDeal Admin] Error loading admin overview:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Ticking sync timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSeconds((prev) => (prev > 50 ? 5 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      // Tab filter
      if (queueTab === "high" && item.severity !== "CRITICAL" && item.severity !== "HIGH") return false;
      if (queueTab === "disputes" && item.category !== "dispute") return false;
      if (queueTab === "fraud" && item.category !== "fraud") return false;
      if (queueTab === "payout" && item.category !== "payout" && item.severity !== "CRITICAL") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.incidentNumber.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.resourceId.toLowerCase().includes(q) ||
          item.resourceTitle.toLowerCase().includes(q) ||
          item.officer.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [incidents, queueTab, searchQuery]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    apiGetAdminData()
      .then((data: any) => {
        if (data?.overview) {
          const ov = data.overview;
          setAdminStats({
            ordersInQueue: ov.ordersInQueue ?? 0,
            slaRiskOrders: ov.slaRiskOrders ?? 0,
            activeDisputes: ov.activeDisputes ?? 0,
            disputeFrozenVolume: typeof ov.disputeFrozenVolume === "number" ? ov.disputeFrozenVolume : 0,
            listingModCount: ov.listingModCount ?? 0,
            aiFlaggedCount: ov.aiFlaggedCount ?? 0,
            kycPendingCount: ov.kycPendingCount ?? 0,
            settlementErrorsCount: ov.settlementErrorsCount ?? 0,
            fraudAlertsCount: ov.fraudAlertsCount ?? 0,
          });
        }
        if (Array.isArray(data?.incidents)) {
          setIncidents(data.incidents);
        }
      })
      .finally(() => {
        setIsRefreshing(false);
        setLastSyncSeconds(0);
        showToast("Telemetry stream refreshed with live API event logs.");
      });
  };

  // Assign ticket to current user
  const handleAssignToMe = (id: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, officer: { name: "Sarah Lin", initials: "SL", isUnassigned: false } }
          : i
      )
    );
    showToast(`Incident ${id} assigned to Super Admin Sarah Lin.`);
    setMenuOpenId(null);
  };

  // Hold escrow action
  const handleHoldEscrow = (incident: IncidentItem) => {
    showToast(`Escrow freeze locked for ${incident.resourceId}. Funds halted.`);
  };

  // Export incident report CSV
  const handleExportReport = () => {
    const headers = ["Incident ID", "Severity", "Category", "Type", "Resource", "Officer", "Age", "SLA"];
    const rows = incidents.map((i) => [
      i.incidentNumber,
      i.severity,
      i.category,
      `"${i.type}"`,
      `"${i.resourceId} - ${i.resourceTitle}"`,
      i.officer.name,
      i.ageText,
      i.slaRemaining,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `safedeal_incident_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Incident telemetry CSV downloaded to your device.");
  };
  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full">
        {/* Command Center Header Banner */}
            <div className="px-6 sm:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 bg-white/40">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight [text-wrap:balance]">
                    Operations Overview
                  </h1>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold tabular-nums">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                    <span>Live Sync: {lastSyncSeconds}s ago</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  Real-time marketplace telemetry, incident queues, and back-office action items across digital asset fulfillment.
                </p>
              </div>

              {/* Header Action Toolbar */}
              <div className="flex items-center flex-wrap gap-2.5">
                {/* Timeframe Segmented Switch */}
                <div
                  className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-xs"
                  role="group"
                  aria-label="Telemetry timeframe"
                >
                  {(
                    [
                      { key: "24h", label: "Last 24 Hours" },
                      { key: "7d", label: "7 Days" },
                      { key: "30d", label: "30 Days" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTimeframe(t.key)}
                      aria-pressed={timeframe === t.key}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        timeframe === t.key
                          ? "bg-white text-slate-900 shadow-clean-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Quick Action Utilities */}
                <button
                  onClick={() => showToast("Telemetry filter preset: Showing high-priority operational queues.")}
                  aria-label="Filter operational queues"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <span>Filters</span>
                </button>

                <button
                  onClick={handleExportReport}
                  aria-label="Export incident report as CSV"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-600 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* Dash Content Body */}
            <div className="px-6 sm:px-8 flex flex-col gap-6 py-6 pb-14">
              {/* Row 1: Top 6 Dense Metric & SLA Alert Cards */}
              <section
                aria-label="High-Priority Operational Metrics"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5"
              >
                {/* Metric 1: Orders in Queue */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/admin/orders")}
                  onKeyDown={(e) => e.key === "Enter" && router.push("/admin/orders")}
                  aria-label={`${adminStats.ordersInQueue} orders in queue, ${adminStats.slaRiskOrders} at SLA risk. Press enter to view.`}
                  className="group flex flex-col p-4 rounded-xl bg-white hover:bg-blue-50/40 border border-slate-200/90 shadow-clean-xs hover:shadow-clean-sm hover:border-blue-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[13px] uppercase tracking-wider font-bold">Orders in Queue</span>
                    <FileText className="w-4 h-4 text-[var(--cobalt-acc)] group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-headline text-2xl font-extrabold text-slate-900 leading-none tabular-nums">{adminStats.ordersInQueue}</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[12px] font-extrabold border border-rose-200">
                      {adminStats.slaRiskOrders} SLA Risk
                    </span>
                  </div>
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-rose-600 font-semibold truncate text-[13px]">&lt; 2h SLA deadline</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" aria-hidden="true" />
                  </div>
                </div>

                {/* Metric 2: Open Disputes */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/admin/disputes")}
                  onKeyDown={(e) => e.key === "Enter" && router.push("/admin/disputes")}
                  aria-label={`${adminStats.activeDisputes} open disputes, ${adminStats.disputeFrozenVolume} dollars frozen. Press enter to view.`}
                  className="group flex flex-col p-4 rounded-xl bg-white hover:bg-rose-50/40 border border-slate-200/90 shadow-clean-xs hover:shadow-clean-sm hover:border-rose-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[13px] uppercase tracking-wider font-bold">Open Disputes</span>
                    <Gavel className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-headline text-2xl font-extrabold text-slate-900 leading-none tabular-nums">{adminStats.activeDisputes}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[12px] font-bold border border-slate-200">
                      Active
                    </span>
                  </div>
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-slate-600 truncate text-[13px]">
                      Freeze: <strong className="text-slate-900 font-semibold tabular-nums">${adminStats.disputeFrozenVolume.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" aria-hidden="true" />
                  </div>
                </div>

                {/* Metric 3: Listing Mod */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/admin/listings")}
                  onKeyDown={(e) => e.key === "Enter" && router.push("/admin/listings")}
                  aria-label={`${adminStats.listingModCount} listings in moderation queue, ${adminStats.aiFlaggedCount} AI flags. Press enter to view.`}
                  className="group flex flex-col p-4 rounded-xl bg-white hover:bg-blue-50/40 border border-slate-200/90 shadow-clean-xs hover:shadow-clean-sm hover:border-blue-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[13px] uppercase tracking-wider font-bold">Listing Mod</span>
                    <Layers className="w-4 h-4 text-[var(--cobalt-acc)] group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-headline text-2xl font-extrabold text-slate-900 leading-none tabular-nums">{adminStats.listingModCount}</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[var(--cobalt-acc)] text-[12px] font-extrabold border border-blue-200">
                      {adminStats.aiFlaggedCount} AI Flags
                    </span>
                  </div>
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-slate-600 truncate text-[13px]">Catalog safety triage</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" aria-hidden="true" />
                  </div>
                </div>

                {/* Metric 4: Merchant KYC */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/admin/verifications")}
                  onKeyDown={(e) => e.key === "Enter" && router.push("/admin/verifications")}
                  aria-label={`${adminStats.kycPendingCount} merchant KYC applications pending. Press enter to view.`}
                  className="group flex flex-col p-4 rounded-xl bg-white hover:bg-emerald-50/40 border border-slate-200/90 shadow-clean-xs hover:shadow-clean-sm hover:border-emerald-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[13px] uppercase tracking-wider font-bold">Merchant KYC</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-headline text-2xl font-extrabold text-slate-900 leading-none tabular-nums">{adminStats.kycPendingCount}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[12px] font-bold border border-slate-200">
                      Tier 3 (4)
                    </span>
                  </div>
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-slate-600 truncate text-[13px]">ID & Bank validation</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" aria-hidden="true" />
                  </div>
                </div>

                {/* Metric 5: Settlement Errors */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/admin/finance")}
                  onKeyDown={(e) => e.key === "Enter" && router.push("/admin/finance")}
                  aria-label={`${adminStats.settlementErrorsCount} settlement errors, 2 retrying. Press enter to view.`}
                  className="group flex flex-col p-4 rounded-xl bg-white hover:bg-rose-50/40 border border-slate-200/90 shadow-clean-xs hover:shadow-clean-sm hover:border-rose-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[13px] uppercase tracking-wider font-bold">Settlement Errors</span>
                    <RefreshCw className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-headline text-2xl font-extrabold text-slate-900 leading-none tabular-nums">{adminStats.settlementErrorsCount}</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[12px] font-extrabold border border-rose-200">
                      2 Retrying
                    </span>
                  </div>
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-slate-600 truncate text-[13px]">Webhook timeout SEPA</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" aria-hidden="true" />
                  </div>
                </div>

                {/* Metric 6: High Risk & Fraud Alerts */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setQueueTab("fraud");
                    showToast("Filtered to Active Fraud Engine incidents.");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setQueueTab("fraud");
                      showToast("Filtered to Active Fraud Engine incidents.");
                    }
                  }}
                  aria-label={`${adminStats.fraudAlertsCount} critical fraud alerts active. Press enter to filter.`}
                  className="group flex flex-col p-4 rounded-xl bg-white hover:bg-rose-50/40 border border-slate-200/90 shadow-clean-xs hover:shadow-clean-sm hover:border-rose-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[13px] uppercase tracking-wider font-bold">Fraud Engine</span>
                    <AlertOctagon className="w-4 h-4 text-rose-600 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-headline text-2xl font-extrabold text-slate-900 leading-none tabular-nums">{adminStats.fraudAlertsCount}</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[12px] font-extrabold animate-pulse">
                      Critical
                    </span>
                  </div>
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-slate-600 truncate text-[13px]">Velocity / ATO alarms</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" aria-hidden="true" />
                  </div>
                </div>
              </section>

              {/* Row 2: Operational Trend Telemetry (Sparklines & Ratio Cards) */}
              <section aria-label="Operational Telemetry Trends" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Trend 1: GMV Escrow Volume */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-clean-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] uppercase tracking-wider text-slate-500 font-bold">
                      Active Escrow Value
                    </span>
                    <span className="flex items-center text-emerald-600 text-[13px] font-extrabold tabular-nums">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" aria-hidden="true" />
                      +14.2% DoD
                    </span>
                  </div>
                  <div className="font-headline text-2xl font-extrabold text-slate-900 tracking-tight my-1 tabular-nums">
                    $148,920.00
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100">
                    <svg className="w-24 h-7 text-[var(--cobalt-acc)]" fill="none" viewBox="0 0 100 30" aria-hidden="true">
                      <path
                        d="M0 24 L15 20 L30 22 L45 14 L60 18 L75 8 L100 4"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M0 24 L15 20 L30 22 L45 14 L60 18 L75 8 L100 4 V 30 H 0 Z"
                        fill="currentColor"
                        fillOpacity="0.1"
                      />
                    </svg>
                    <span className="text-xs text-right font-medium tabular-nums">3,892 Txns locked</span>
                  </div>
                </div>

                {/* Trend 2: Escrow Settlement Rate */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-clean-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] uppercase tracking-wider text-slate-500 font-bold">
                      Settlement Rate
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-bold border border-emerald-200">
                      Optimal
                    </span>
                  </div>
                  <div className="font-headline text-2xl font-extrabold text-slate-900 tracking-tight my-1 tabular-nums">
                    99.4%
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100">
                    <svg className="w-24 h-7 text-blue-500" fill="none" viewBox="0 0 100 30" aria-hidden="true">
                      <path
                        d="M0 16 L20 18 L40 10 L60 12 L80 6 L100 5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                      />
                    </svg>
                    <span className="text-xs text-right font-medium tabular-nums">Avg release: 3h 12m</span>
                  </div>
                </div>

                {/* Trend 3: Dispute Ratio */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-clean-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] uppercase tracking-wider text-slate-500 font-bold">
                      Market Dispute Ratio
                    </span>
                    <span className="text-emerald-600 text-[13px] font-extrabold">
                      Target &lt; 0.50%
                    </span>
                  </div>
                  <div className="font-headline text-2xl font-extrabold text-slate-900 tracking-tight my-1 tabular-nums">
                    0.18%
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100">
                    <svg className="w-24 h-7 text-emerald-600" fill="none" viewBox="0 0 100 30" aria-hidden="true">
                      <path
                        d="M0 6 L25 10 L50 7 L75 12 L100 9"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                      />
                    </svg>
                    <span className="text-xs text-right font-medium tabular-nums">0.02% Chargebacks</span>
                  </div>
                </div>

                {/* Trend 4: Payment Gateway Success */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-clean-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] uppercase tracking-wider text-slate-500 font-bold">
                      Gateway Auth Health
                    </span>
                    <span className="flex items-center gap-1 text-slate-800 text-[13px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[var(--cobalt-acc)]" aria-hidden="true" /> 3 Providers
                    </span>
                  </div>
                  <div className="font-headline text-2xl font-extrabold text-slate-900 tracking-tight my-1 tabular-nums">
                    98.7%
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100">
                    <svg className="w-24 h-7 text-[var(--cobalt-acc)]" fill="none" viewBox="0 0 100 30" aria-hidden="true">
                      <path
                        d="M0 12 L20 8 L40 14 L60 6 L80 8 L100 4"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                      />
                    </svg>
                    <span className="text-xs text-right font-medium">Stripe • Adyen • SEPA</span>
                  </div>
                </div>
              </section>

              {/* Row 3: Master Triage Queue & Side Telemetry Layout (8 cols + 4 cols) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Main Column: Needs Attention Operations Queue (8 cols) */}
                <section
                  aria-labelledby="queue-heading"
                  className="xl:col-span-8 flex flex-col bg-white rounded-xl shadow-clean-xs border border-slate-200/80 overflow-hidden"
                >
                  {/* Queue Header with Density Controls & Filters */}
                  <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" aria-hidden="true" />
                      <h2 id="queue-heading" className="font-headline font-bold text-base text-slate-900">
                        Needs Attention Operations Queue
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[13px] text-slate-500 uppercase tracking-wider font-semibold tabular-nums">
                        Action SLA: 60m strict
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[var(--cobalt-acc)] text-[12px] font-bold tabular-nums">
                        14 Active
                      </span>
                    </div>
                  </div>

                  {/* Filter Segmented Tabs */}
                  <div className="px-4 pt-3 flex items-center justify-between overflow-x-auto bg-white border-b border-slate-100 pb-2" role="tablist">
                    <div className="flex items-center gap-1.5">
                      {[
                        { key: "all", label: `All (${incidents.length})` },
                        { key: "high", label: `High Priority (${incidents.filter(i => i.severity === "CRITICAL" || i.severity === "HIGH").length})` },
                        { key: "disputes", label: `Disputes (${incidents.filter(i => i.category === "dispute").length})` },
                        { key: "fraud", label: `Fraud Triggers (${incidents.filter(i => i.category === "fraud").length})` },
                        { key: "payout", label: `Payout Blockers (${incidents.filter(i => i.category === "payout").length})` },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          role="tab"
                          aria-selected={queueTab === tab.key}
                          onClick={() => setQueueTab(tab.key as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                            queueTab === tab.key
                              ? "bg-slate-900 text-white shadow-xs"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 pl-4">
                      <button
                        onClick={handleRefresh}
                        aria-label="Refresh operational queue"
                        className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                          isRefreshing ? "animate-spin text-blue-600" : ""
                        }`}
                        title="Refresh queue"
                      >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => showToast("Columns adjusted: Default dense operational layout.")}
                        aria-label="Adjust column layout"
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        title="Columns view"
                      >
                        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* High-Density Operations Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider font-bold border-b border-slate-200">
                          <th scope="col" className="py-3 px-4">Severity</th>
                          <th scope="col" className="py-3 px-4">Incident ID & Type</th>
                          <th scope="col" className="py-3 px-4">Resource / Entity</th>
                          <th scope="col" className="py-3 px-4">Age & SLA</th>
                          <th scope="col" className="py-3 px-4">Officer</th>
                          <th scope="col" className="py-3 px-4 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {filteredIncidents.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">
                              No incidents matching the active filter tab.
                            </td>
                          </tr>
                        ) : (
                          filteredIncidents.map((item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-blue-50/30 transition-colors group"
                            >
                              {/* Severity Badge */}
                              <td className="py-3.5 px-4 align-top">
                                {item.severity === "CRITICAL" && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[12px] font-extrabold shadow-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" aria-hidden="true" />
                                    CRITICAL
                                  </span>
                                )}
                                {item.severity === "HIGH" && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[12px] font-extrabold border border-rose-200">
                                    HIGH
                                  </span>
                                )}
                                {item.severity === "NORMAL" && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[12px] font-bold border border-blue-200">
                                    NORMAL
                                  </span>
                                )}
                              </td>

                              {/* Incident ID & Type */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="flex flex-col">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedIncident(item)}
                                    className="font-bold text-xs text-[var(--cobalt-acc)] hover:underline text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
                                  >
                                    {item.incidentNumber}
                                  </button>
                                  <span className="font-semibold text-slate-800 mt-0.5">
                                    {item.type}
                                  </span>
                                  <span
                                    className={`text-[12px] mt-0.5 ${
                                      item.severity === "CRITICAL"
                                        ? "text-rose-600 font-bold"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {item.subType}
                                  </span>
                                </div>
                              </td>

                              {/* Resource / Entity */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="flex flex-col">
                                  <span className="font-mono text-slate-900 font-semibold text-[13px]">
                                    {item.resourceId}
                                  </span>
                                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                    <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                                    <span className="truncate max-w-[140px] font-medium text-slate-700">
                                      {item.resourceTitle}
                                    </span>
                                  </div>
                                  {item.counterparty && (
                                    <span className="text-slate-500 text-[13px] truncate max-w-[140px]">
                                      {item.counterparty}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Age & SLA */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="flex flex-col tabular-nums">
                                  <span className="text-slate-700 font-medium">
                                    {item.ageText}
                                  </span>
                                  <span
                                    className={`text-[12px] font-bold mt-0.5 ${
                                      item.isOverdue
                                        ? "text-rose-600 font-extrabold"
                                        : item.severity === "CRITICAL"
                                        ? "text-rose-600"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {item.slaRemaining}
                                  </span>
                                </div>
                              </td>

                              {/* Officer */}
                              <td className="py-3.5 px-4 align-top">
                                {item.officer.isUnassigned ? (
                                  <button
                                    onClick={() => handleAssignToMe(item.id)}
                                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[12px] font-bold border border-slate-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                  >
                                    + Assign to Me
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold text-white ${
                                        item.officer.initials === "SL"
                                          ? "bg-[var(--cobalt-acc)]"
                                          : "bg-slate-700"
                                      }`}
                                    >
                                      {item.officer.initials}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-900">
                                      {item.officer.name}
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Quick Action Button */}
                              <td className="py-3.5 px-4 align-top text-right">
                                <div className="inline-flex items-center gap-1.5 relative">
                                  {item.severity === "CRITICAL" && (
                                    <button
                                      onClick={() => handleHoldEscrow(item)}
                                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                                    >
                                      Hold Escrow
                                    </button>
                                  )}

                                  {item.category === "dispute" && (
                                    <button
                                      onClick={() => setSelectedIncident(item)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                    >
                                      Review Audit
                                    </button>
                                  )}

                                  {item.category === "fraud" && item.severity !== "CRITICAL" && (
                                    <button
                                      onClick={() => setSelectedIncident(item)}
                                      className="px-2.5 py-1 rounded-lg bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                    >
                                      Triage Incident
                                    </button>
                                  )}

                                  {item.category === "kyc" && (
                                    <button
                                      onClick={() => setSelectedIncident(item)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                    >
                                      Review Docs
                                    </button>
                                  )}

                                  {item.category === "moderation" && (
                                    <button
                                      onClick={() => setSelectedIncident(item)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                    >
                                      Moderate
                                    </button>
                                  )}

                                  {/* More options menu */}
                                  <button
                                    onClick={() =>
                                      setMenuOpenId(menuOpenId === item.id ? null : item.id)
                                    }
                                    aria-haspopup="menu"
                                    aria-expanded={menuOpenId === item.id}
                                    aria-label={`Options for incident ${item.incidentNumber}`}
                                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                    title="Quick view"
                                  >
                                    <MoreVertical className="w-4 h-4" aria-hidden="true" />
                                  </button>

                                  {menuOpenId === item.id && (
                                    <div
                                      role="menu"
                                      className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-150"
                                    >
                                      <button
                                        role="menuitem"
                                        onClick={() => {
                                          setSelectedIncident(item);
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer focus-visible:bg-slate-100 focus-visible:outline-none"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                                        <span>View Dossier</span>
                                      </button>
                                      <button
                                        role="menuitem"
                                        onClick={() => handleAssignToMe(item.id)}
                                        className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer focus-visible:bg-slate-100 focus-visible:outline-none"
                                      >
                                        <User className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                                        <span>Reassign to Sarah Lin</span>
                                      </button>
                                      <button
                                        role="menuitem"
                                        onClick={() => {
                                          showToast(`Elevated incident ${item.incidentNumber} to Lead Fraud Specialist.`);
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer focus-visible:bg-slate-100 focus-visible:outline-none"
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                                        <span>Elevate to Lead</span>
                                      </button>
                                      <div className="my-1 border-t border-slate-100" />
                                      <button
                                        role="menuitem"
                                        onClick={() => {
                                          setIncidents((prev) => prev.filter((i) => i.id !== item.id));
                                          showToast(`Incident ${item.incidentNumber} resolved & dismissed.`);
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer focus-visible:bg-emerald-50 focus-visible:outline-none"
                                      >
                                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                        <span>Mark as Resolved</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination & Footer Status */}
                  <div className="p-3 px-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-slate-500 text-xs">
                    <span className="tabular-nums">
                      Showing {filteredIncidents.length} of 14 urgent operational incidents
                    </span>
                    <div className="flex items-center gap-1 font-bold text-xs" role="navigation" aria-label="Pagination">
                      <button aria-current="page" className="px-2.5 py-1 rounded bg-white text-slate-900 shadow-xs border border-slate-200">
                        1
                      </button>
                      <button className="px-2.5 py-1 rounded hover:bg-white text-slate-600 transition-colors">
                        2
                      </button>
                      <button className="px-2.5 py-1 rounded hover:bg-white text-slate-600 transition-colors">
                        3
                      </button>
                    </div>
                  </div>
                </section>

                {/* Side Column: Live Infrastructure Health & Staff Audit Stream (4 cols) */}
                <aside aria-label="Infrastructure and Staff Activity" className="xl:col-span-4 flex flex-col gap-6">
                  {/* Live Provider Gateway Health Panel */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-clean-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-[var(--cobalt-acc)]" aria-hidden="true" />
                        <h2 className="font-headline font-bold text-sm text-slate-900">
                          Gateway Health
                        </h2>
                      </div>
                      <span className="text-[13px] text-slate-500 font-mono tabular-nums">RTT: 34ms</span>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs">
                      {/* Stripe Gateway */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">Stripe Core</span>
                            <span className="text-[13px] text-slate-500">Cards & Apple Pay</span>
                          </div>
                        </div>
                        <div className="text-right tabular-nums">
                          <span className="font-bold text-slate-900">99.98%</span>
                          <span className="block text-[12px] text-emerald-600 font-bold">Operational</span>
                        </div>
                      </div>

                      {/* Adyen 3DS2 */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">Adyen 3DS2</span>
                            <span className="text-[13px] text-slate-500">EU SCA Authentication</span>
                          </div>
                        </div>
                        <div className="text-right tabular-nums">
                          <span className="font-bold text-slate-900">100.0%</span>
                          <span className="block text-[12px] text-emerald-600 font-bold">Operational</span>
                        </div>
                      </div>

                      {/* SEPA Instant (Degraded) */}
                      <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/70 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" aria-hidden="true" />
                          <div className="flex flex-col">
                            <span className="font-bold text-rose-900">SEPA Instant Rail</span>
                            <span className="text-[13px] text-rose-700">EU Bank Transfers</span>
                          </div>
                        </div>
                        <div className="text-right tabular-nums">
                          <span className="font-bold text-rose-600">Degraded</span>
                          <span className="block text-[12px] text-rose-600 font-bold">4m webhook lag</span>
                        </div>
                      </div>

                      {/* Automated Escrow Bot Workers */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">Escrow Bot Daemon</span>
                            <span className="text-[13px] text-slate-500">Steam / PSN API Sync</span>
                          </div>
                        </div>
                        <div className="text-right tabular-nums">
                          <span className="font-bold text-slate-900">48 Workers</span>
                          <span className="block text-[12px] text-slate-500">Queue: 0 items</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Staff Audit Activity Stream */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-clean-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-[var(--cobalt-acc)]" aria-hidden="true" />
                        <h2 className="font-headline font-bold text-sm text-slate-900">
                          Staff Audit Stream
                        </h2>
                      </div>
                      <button
                        onClick={() => setAuditLogModalOpen(true)}
                        className="text-[13px] text-[var(--cobalt-acc)] hover:underline font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
                      >
                        Full Logs
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 text-xs">
                      {/* Audit Item 1 */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[12px] mt-0.5 shrink-0">
                          DC
                        </div>
                        <div className="flex flex-col">
                          <p className="text-slate-800 leading-snug">
                            <strong className="font-bold text-slate-900">David Chen</strong> unlocked escrow release for order{" "}
                            <span className="font-mono text-[var(--cobalt-acc)] font-semibold">#SF-2024-87102</span>
                          </p>
                          <span className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                            4 minutes ago • Reason: Buyer confirmed Steam key
                          </span>
                        </div>
                      </div>

                      {/* Audit Item 2 */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[12px] mt-0.5 shrink-0">
                          <Zap className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-slate-800 leading-snug">
                            <strong className="font-bold text-slate-900">Automated Guard</strong> permanently suspended user{" "}
                            <span className="font-mono text-rose-600 font-semibold">#USR-88219</span>
                          </p>
                          <span className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                            16 minutes ago • Rule: IP proxy spoofing & multiple accounts
                          </span>
                        </div>
                      </div>

                      {/* Audit Item 3 */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[var(--cobalt-acc)] text-white flex items-center justify-center font-bold text-[12px] mt-0.5 shrink-0">
                          SL
                        </div>
                        <div className="flex flex-col">
                          <p className="text-slate-800 leading-snug">
                            <strong className="font-bold text-slate-900">Sarah Lin</strong> approved Tier 2 KYC for{" "}
                            <span className="font-semibold text-slate-900">NeoKeys_Global</span>
                          </p>
                          <span className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                            42 minutes ago • ID document manually verified
                          </span>
                        </div>
                      </div>

                      {/* Audit Item 4 */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-[var(--cobalt-acc)] flex items-center justify-center font-bold text-[12px] mt-0.5 shrink-0">
                          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-slate-800 leading-snug">
                            <strong className="font-bold text-slate-900">System Configuration</strong> updated by Sarah Lin
                          </p>
                          <span className="text-[12px] text-slate-400 mt-0.5 tabular-nums">
                            1 hour ago • Decreased escrow auto-release time to 4 hours
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Ops Tooling: Daylight Emergency Console Card */}
                  <div className={`p-4 rounded-xl border transition-colors flex items-center justify-between shadow-clean-xs ${
                    emergencyArmed
                      ? "bg-rose-50 border-rose-300"
                      : "bg-white border-slate-200/90"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                        emergencyArmed ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        <AlertOctagon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-900">Emergency Ledger Freeze</span>
                        <span className="text-[13px] text-slate-500">
                          Halt all outbound bank & crypto payouts
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmergencyModalOpen(true)}
                      aria-label={emergencyArmed ? "Disarm emergency pause" : "Arm emergency ledger pause"}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 ${
                        emergencyArmed
                          ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
              {emergencyArmed ? "HALT ACTIVE" : "Arm Freeze"}
            </button>
          </div>
        </aside>
      </div>
      </div>

      {/* Incident Detail Dossier Modal */}
      {selectedIncident && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dossier-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="dossier-modal-title" className="font-headline font-bold text-base text-slate-900">
                    Incident Dossier {selectedIncident.incidentNumber}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Category: {selectedIncident.category.toUpperCase()} • Severity: {selectedIncident.severity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                aria-label="Close dossier modal"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Incident Summary</div>
                <div className="font-bold text-sm text-slate-900">{selectedIncident.type}</div>
                <div className="text-slate-600">{selectedIncident.subType}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 font-semibold block text-[13px]">Associated Resource</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">{selectedIncident.resourceId}</span>
                  <span className="text-slate-600">{selectedIncident.resourceTitle}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 font-semibold block text-[13px]">Financial Exposure</span>
                  <span className="font-headline font-extrabold text-base text-slate-900 mt-0.5 block tabular-nums">
                    {selectedIncident.financialAmount || "$0.00"}
                  </span>
                  <span className="text-slate-600">Escrow Protected</span>
                </div>
              </div>

              {selectedIncident.evidenceNotes && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                  <div className="text-[13px] font-bold text-[var(--cobalt-acc)] uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Investigative Evidence & OCR Trace</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {selectedIncident.evidenceNotes}
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-semibold text-slate-500">Current Officer</span>
                  <div className="font-bold text-slate-900">{selectedIncident.officer.name}</div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">{selectedIncident.slaRemaining}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleHoldEscrow(selectedIncident);
                    setSelectedIncident(null);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  Freeze Escrow Release
                </button>
                <button
                  onClick={() => {
                    showToast(`Refund initiated to buyer for ${selectedIncident.resourceId}.`);
                    setSelectedIncident(null);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Issue Escrow Refund
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Close Dossier
                </button>
                <button
                  onClick={() => {
                    setIncidents((prev) => prev.filter((i) => i.id !== selectedIncident.id));
                    showToast(`Incident ${selectedIncident.incidentNumber} marked as resolved.`);
                    setSelectedIncident(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Approve & Settle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Killswitch Modal */}
      {emergencyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-6 h-6 animate-pulse" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h3 id="emergency-modal-title" className="font-headline font-bold text-lg text-slate-900">
                {emergencyArmed ? "Disarm Emergency Pause?" : "Arm Emergency Ledger Pause?"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {emergencyArmed
                  ? "This will resume automated payout dispatches across all active payment gateways (Stripe, Adyen, SEPA)."
                  : "This immediately halts all outbound bank payouts and cryptocurrency releases across the entire platform. Requires Super Admin clearance."}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium text-left border border-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Two-man authorization logged: Sarah Lin (Super Admin) session verified via hardware security key.</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEmergencyArmed(!emergencyArmed);
                  setEmergencyModalOpen(false);
                  showToast(
                    emergencyArmed
                      ? "Ledger payouts resumed. Normal settlement active."
                      : "EMERGENCY HALT ACTIVE: All pending payouts locked."
                  );
                }}
                className={`px-4 py-2 rounded-lg font-bold text-xs text-white shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 ${
                  emergencyArmed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {emergencyArmed ? "Resume Payouts" : "Confirm Emergency Lock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {auditLogModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[var(--cobalt-acc)]" aria-hidden="true" />
                <h3 id="audit-modal-title" className="font-headline font-bold text-base text-slate-900">
                  Full Staff Operations Audit Log
                </h3>
              </div>
              <button
                onClick={() => setAuditLogModalOpen(false)}
                aria-label="Close audit log modal"
                className="text-slate-400 hover:text-slate-700 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>David Chen (DC) • ESCROW_RELEASE</span>
                  <span className="text-[12px] text-slate-400 tabular-nums">4m ago</span>
                </div>
                <p className="text-slate-600">Manual release unlocked for order #SF-2024-87102 after buyer confirmation.</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-100 space-y-0.5">
                <div className="flex items-center justify-between font-bold text-rose-900">
                  <span>Automated Guard (SYSTEM) • ACCOUNT_SUSPEND</span>
                  <span className="text-[12px] text-slate-400 tabular-nums">16m ago</span>
                </div>
                <p className="text-slate-600">Account #USR-88219 flagged and suspended for Tor exit node carding attempt.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Sarah Lin (SL) • KYC_TIER_UPGRADE</span>
                  <span className="text-[12px] text-slate-400 tabular-nums">42m ago</span>
                </div>
                <p className="text-slate-600">Approved Tier 2 limits for NeoKeys_Global following ID verification.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Sarah Lin (SL) • CONFIG_PARAMETER_UPDATE</span>
                  <span className="text-[12px] text-slate-400 tabular-nums">1h ago</span>
                </div>
                <p className="text-slate-600">Updated escrow auto-release grace window parameter to 4 hours.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setAuditLogModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Close Audit Viewer
              </button>
             </div>
           </div>
         </div>
       )}
      </div>
    </main>
  );
}
