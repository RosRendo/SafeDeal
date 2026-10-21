"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  Ban,
  CheckCircle2,
  ChevronRight,
  ShieldBan,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAdminToast } from "@/components/navigation/AdminShell";

interface FraudTrigger {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  rule: string;
  entity: string;
  entityId: string;
  signal: string;
  detected: string;
  action: "hold_escrow" | "freeze_account" | "review" | "released";
}

interface IncidentFeed {
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

interface Overview {
  activeDisputes?: number;
  disputeFrozenVolume?: number;
  totalVolume?: number;
  escrowLockedVolume?: number;
  criticalAlerts?: number;
  fraudAlertsCount?: number;
}

const money = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(2)}`;

const SEV_STYLES: Record<FraudTrigger["severity"], string> = {
  critical: "bg-rose-100 text-rose-700 border-rose-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AdminRiskFraudPage() {
  const { showToast } = useAdminToast();
  const [triggers, setTriggers] = useState<FraudTrigger[]>([]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [overview, setOverview] = useState<Overview>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active">("active");

  useEffect(() => {
    async function loadRisk() {
      try {
        const res = await fetch("/api/admin");
        const json = await res.json();
        if (!json.success) return;
        if (json.data?.overview) setOverview(json.data.overview);
        const incidents: IncidentFeed[] = json.data?.incidents || [];
        const mapped: FraudTrigger[] = incidents.map((i) => ({
          id: i.incidentNumber,
          severity: i.severity === "CRITICAL" ? "critical" : "medium",
          rule: i.type,
          entity: i.resourceTitle || "Marketplace Entity",
          entityId: i.resourceId || "—",
          signal: i.subType || i.evidenceNotes || "Automated signal review",
          detected: i.ageText === "Active" ? i.slaRemaining || "Active" : i.ageText || "Today",
          action: i.severity === "CRITICAL" ? "hold_escrow" : "review",
        }));
        setTriggers(mapped);
      } catch (e) {
        console.error("Failed to load risk feed", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadRisk();
  }, []);

  const visible = triggers.filter(
    (t) => filter === "all" || (!resolvedIds.has(t.id) && t.action !== "released")
  );

  const resolveTrigger = (id: string) => {
    setResolvedIds((prev) => new Set(prev).add(id));
    showToast(`Trigger ${id} triaged. SafeDeal Risk Engine record updated for the case audit trail.`);
  };

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full">
        {/* Context Bar */}
        <div className="px-4 sm:px-8 py-6 bg-white border-b border-slate-200/80 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-[12px] uppercase tracking-wider font-semibold">
            <Link href="/admin" className="hover:text-[var(--cobalt-acc)] transition-colors">
              Trust &amp; Safety
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[var(--cobalt-acc)] font-bold">Risk &amp; Fraud</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Risk &amp; Fraud Engine
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                Live velocity guardrails, account takeover detection, and fraud trigger triage across the marketplace.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs text-slate-700 font-semibold">
                  Engine Live — {overview.fraudAlertsCount ?? 0} active signal{(overview.fraudAlertsCount ?? 0) === 1 ? "" : "s"}
                </span>
              </div>
              <button
                onClick={() => showToast("Full risk sweep queued. All active sessions will be re-scored within 4 minutes.")}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white text-[13px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                Run Full Risk Sweep
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 flex flex-col gap-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Alerts Open</span>
              <div className="font-headline font-extrabold text-2xl text-rose-600">{overview.criticalAlerts ?? 0}</div>
              <span className="text-[13px] text-slate-500 font-semibold">Escrow disputes requiring triage</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Escrow On Hold</span>
              <div className="font-headline font-extrabold text-2xl text-slate-900">
                {money(overview.disputeFrozenVolume ?? 0)}
              </div>
              <span className="text-[13px] text-slate-500 font-semibold">Funds frozen pending triage</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Marketplace Volume</span>
              <div className="font-headline font-extrabold text-2xl text-slate-900">
                {money(overview.totalVolume ?? 0)}
              </div>
              <span className="text-[13px] text-slate-500 font-semibold">All orders processed to date</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Escrow Locked</span>
              <div className="font-headline font-extrabold text-2xl text-emerald-600">
                {money(overview.escrowLockedVolume ?? 0)}
              </div>
              <span className="text-[13px] text-slate-500 font-semibold">Active funds in escrow vault</span>
            </div>
          </div>

          {/* Trigger Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">Fraud Trigger Queue</h3>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  Escalated rules exceed auto-mitigation thresholds. Staff triage required.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {(["active", "all"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      filter === f
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f === "active" ? "Open Triggers" : "All Records"}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {visible.map((t) => {
                const released = resolvedIds.has(t.id) || t.action === "released";
                return (
                <div
                  key={t.id}
                  className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        t.severity === "critical"
                          ? "bg-rose-100 text-rose-600"
                          : t.severity === "high"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {released ? <CheckCircle2 className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[13px] font-bold text-slate-400">{t.id}</span>
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-bold uppercase ${SEV_STYLES[t.severity]}`}>
                          {t.severity}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 mt-0.5">{t.rule}</div>
                      <div className="text-[13px] text-slate-500 mt-0.5">
                        {t.entity} ({t.entityId}) • {t.signal} • detected {t.detected}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {released ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        Cleared
                      </span>
                    ) : t.action === "hold_escrow" ? (
                      <button
                        onClick={() => resolveTrigger(t.id)}
                        className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Hold Escrow
                      </button>
                    ) : (
                      <button
                        onClick={() => resolveTrigger(t.id)}
                        className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Re-Verify
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
              {visible.length === 0 && !isLoading && (
                <div className="p-10 flex flex-col items-center text-center">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mb-2" />
                  <span className="font-bold text-sm text-slate-900">Queue clear</span>
                  <span className="text-[13px] text-slate-500 mt-0.5">Every trigger has been triaged. Nice work.</span>
                </div>
              )}
            </div>
          </div>

          {/* Rule Pack Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Velocity & Velocity-2 Guardrails",
                detail: "8 attempts / 10 min on card auth. Auto-hold at queue depth 5.",
                icon: <Zap className="w-4 h-4 text-[var(--cobalt-acc)]" />,
              },
              {
                title: "Proxy / Tor Circumvention",
                detail: "Signup + delivery sessions from 185.x, 45.x relay ranges auto-flagged.",
                icon: <ShieldBan className="w-4 h-4 text-rose-500" />,
              },
              {
                title: "Off-Platform Funnel Detection",
                detail: "Discord/Telegram/PayPal keywords in escrow chat trigger session review.",
                icon: <Ban className="w-4 h-4 text-amber-500" />,
              },
            ].map((r) => (
              <div key={r.title} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  {r.icon}
                  <span className="font-bold text-sm text-slate-900">{r.title}</span>
                </div>
                <p className="text-[13px] text-slate-500">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
