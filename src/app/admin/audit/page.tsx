"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, PauseCircle, TriangleAlert, X } from "lucide-react";
import { useAdminSearch, useAdminToast } from "@/components/navigation/AdminShell";

interface LedgerRow {
  id: string;
  level: "critical" | "warning" | "info" | "success";
  actor: string;
  action: string;
  target: string;
  time: string;
}

interface IncidentFeed {
  id: string;
  incidentNumber: string;
  type: string;
  subType?: string;
  severity: "CRITICAL" | "NORMAL";
  category: string;
  resourceId?: string;
  resourceTitle?: string;
  counterparty?: string;
  financialAmount?: string;
  ageText?: string;
  slaRemaining?: string;
  evidenceNotes?: string;
}

const LEVEL_STYLES: Record<LedgerRow["level"], string> = {
  critical: "bg-rose-100 text-rose-700 border-rose-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  info: "bg-blue-50 text-[var(--cobalt-acc)] border-blue-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const LEVEL_ICON: Record<LedgerRow["level"], React.ReactNode> = {
  critical: <TriangleAlert className="w-3.5 h-3.5" />,
  warning: <PauseCircle className="w-3.5 h-3.5" />,
  info: <ChevronRight className="w-3.5 h-3.5" />,
  success: <CheckCircle2 className="w-3.5 h-3.5" />,
};

export default function AdminAuditLogsPage() {
  const { searchQuery, setSearchQuery } = useAdminSearch();
  const { showToast } = useAdminToast();
  const [levelFilter, setLevelFilter] = useState<"all" | LedgerRow["level"]>("all");
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLedger() {
      try {
        const res = await fetch("/api/admin");
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.incidents)) {
          const incidents: IncidentFeed[] = json.data.incidents;
          const rows: LedgerRow[] = incidents.map((i) => ({
            id: i.incidentNumber,
            level:
              i.severity === "CRITICAL"
                ? "critical"
                : i.category === "payout"
                ? "success"
                : "warning",
            actor: i.category === "dispute" ? "Escrow Arbitration Bot" : "System",
            action: i.type,
            target: `${i.resourceId || ""}${i.financialAmount ? ` • ${i.financialAmount}` : ""}`,
            time: i.ageText || "Today",
          }));
          setRows(rows);
        }
      } catch (e) {
        console.error("Failed to load audit ledger", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadLedger();
  }, []);

  const visible = rows.filter((r) => {
    if (levelFilter !== "all" && r.level !== levelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q) ||
        r.target.toLowerCase().includes(q) ||
        r.actor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full">
        {/* Context Bar */}
        <div className="px-4 sm:px-8 py-6 bg-white border-b border-slate-200/80 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-[12px] uppercase tracking-wider font-semibold">
            <Link href="/admin" className="hover:text-[var(--cobalt-acc)] transition-colors">
              Platform
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[var(--cobalt-acc)] font-bold">Audit Logs</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                System Activity Ledger
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                Recent automated and staff actions across escrow operations.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-700 font-semibold">
                  {rows.length} ent{rows.length === 1 ? "ry" : "ries"} on record
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 flex flex-col gap-6">
          {/* Level Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "critical", "warning", "info", "success"] as const).map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => setLevelFilter(lv)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  levelFilter === lv
                    ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {lv === "all" ? "All Levels" : lv}
              </button>
            ))}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-headline font-bold text-base text-slate-900">Activity Entries</h3>
              <p className="text-[13px] text-slate-500 mt-0.5">{visible.length} entries matched.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {visible.map((r) => (
                <div key={r.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${LEVEL_STYLES[r.level]}`}
                    >
                      {LEVEL_ICON[r.level]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[13px] font-bold text-slate-400">{r.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded border text-[11px] font-bold uppercase ${LEVEL_STYLES[r.level]}`}
                        >
                          {r.level}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 mt-0.5">{r.action}</div>
                      <div className="text-[13px] text-slate-500">
                        {r.actor} • {r.target} • {r.time}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Link
                      href="/admin"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      Open Overview
                    </Link>
                  </div>
                </div>
              ))}
              {visible.length === 0 && !isLoading && (
                <div className="p-12 flex flex-col items-center text-center">
                  <X className="w-10 h-10 text-slate-300 mb-2" />
                  <span className="font-bold text-sm text-slate-900">No entries match</span>
                  <span className="text-[13px] text-slate-500 mt-0.5">Adjust the level filter or clear the search.</span>
                </div>
              )}
              {isLoading && <div className="p-6 text-[13px] text-slate-400">Loading activity ledger...</div>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
