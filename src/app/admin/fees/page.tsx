"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useAdminToast } from "@/components/navigation/AdminShell";

interface FinanceBatch {
  id: string;
  gateway: string;
  merchantCount: number;
  totalAmount: number;
  feeAmount: number;
  scheduledTime: string;
  status: string;
}

interface FinanceTelemetry {
  totalRingFenced: number;
  pendingSettlement: number;
  rollingReserves: number;
  platformFees: number;
  batches: FinanceBatch[];
}

interface Overview {
  totalVolume?: number;
  escrowLockedVolume?: number;
  settlementErrorsCount?: number;
}

const money = (v: number) =>
  `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminFeesPage() {
  const { showToast } = useAdminToast();
  const [telemetry, setTelemetry] = useState<FinanceTelemetry | null>(null);
  const [overview, setOverview] = useState<Overview>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFinance() {
      try {
        const [financeRes, adminRes] = await Promise.all([
          fetch("/api/admin/finance"),
          fetch("/api/admin"),
        ]);
        const financeJson = await financeRes.json();
        const adminJson = await adminRes.json();
        if (financeJson.success && financeJson.data) setTelemetry(financeJson.data);
        if (adminJson.success && adminJson.data?.overview) setOverview(adminJson.data.overview);
      } catch (e) {
        console.error("Failed to load finance telemetry", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadFinance();
  }, []);

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full">
        {/* Context Bar */}
        <div className="px-4 sm:px-8 py-6 bg-white border-b border-slate-200/80 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-[12px] uppercase tracking-wider font-semibold">
            <Link href="/admin" className="hover:text-[var(--cobalt-acc)] transition-colors">
              Finance
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[var(--cobalt-acc)] font-bold">Fees &amp; Reconciliation</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Fee Capture &amp; Ledger Reconciliation
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                Every settlement pipe is scored continuously. Zero-delta is a release gate for merchant payouts.
              </p>
            </div>
            <button
              onClick={() => showToast("Reconciliation sweep queued. Ledgers will be diffed across all settlement pipes.")}
              className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white text-[13px] font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Sweep Now</span>
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 flex flex-col gap-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Platform Fees Captured</span>
              <div className="font-headline font-extrabold text-2xl text-emerald-600">
                {money(telemetry?.platformFees ?? 0)}
              </div>
              <span className="text-[13px] text-slate-500 font-semibold">Escrow take rate on delivered orders</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Volume</span>
              <div className="font-headline font-extrabold text-2xl text-slate-900">
                {money(overview.totalVolume ?? 0)}
              </div>
              <span className="text-[13px] text-slate-500 font-semibold">All orders processed to date</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reconciliation Deltas</span>
              <div className="font-headline font-extrabold text-2xl text-slate-900">
                {money(overview.settlementErrorsCount ?? 0)}
              </div>
              <span className="text-[13px] text-emerald-600 font-semibold">
                {(overview.settlementErrorsCount ?? 0) === 0 ? "All ledger batches balanced" : "Mismatches pending review"}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Settlement</span>
              <div className="font-headline font-extrabold text-2xl text-slate-900">
                {money(telemetry?.pendingSettlement ?? 0)}
              </div>
              <span className="text-[13px] text-slate-500 font-semibold">Cleared for merchant payout</span>
            </div>
          </div>

          {/* Fee Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">Settlement Batches — Fee Capture</h3>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  Live gateway batches with escrow fee take per dispatch.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-blue-50 text-[var(--cobalt-acc)] font-bold text-[13px] border border-blue-200">
                Daemon Active
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-100">
                    <th className="text-left font-bold px-6 py-3">Batch</th>
                    <th className="text-left font-bold px-2 py-3">Gateway Rail</th>
                    <th className="text-right font-bold px-2 py-3">Merchants</th>
                    <th className="text-right font-bold px-2 py-3">Escrow Fees</th>
                    <th className="text-left font-bold px-2 py-3">Schedule</th>
                    <th className="text-right font-bold px-6 py-3">Batch Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(telemetry?.batches ?? []).map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-400">{row.id}</td>
                      <td className="px-2 py-3.5 font-bold text-slate-900">{row.gateway}</td>
                      <td className="px-2 py-3.5 text-right text-slate-600">{row.merchantCount}</td>
                      <td className="px-2 py-3.5 text-right text-emerald-600 font-semibold">
                        {money(row.feeAmount)}
                      </td>
                      <td className="px-2 py-3.5 text-slate-600">{row.scheduledTime}</td>
                      <td className="px-6 py-3.5 text-right font-headline font-extrabold text-slate-900">
                        {money(row.totalAmount)}
                      </td>
                    </tr>
                  ))}
                  {(telemetry?.batches ?? []).length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                        No settlement batches on record yet.
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-slate-400">
                        Loading settlement telemetry...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ledger Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-headline font-bold text-base text-slate-900">Escrow Ledger Snapshot</h3>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Ring-fenced balances cosigned against the SafeDeal escrow ledger every 15 minutes.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="px-6 py-5">
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Total Ring-Fenced</div>
                <div className="font-headline font-extrabold text-xl text-slate-900 mt-1">
                  {money(telemetry?.totalRingFenced ?? 0)}
                </div>
              </div>
              <div className="px-6 py-5">
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Rolling Reserves</div>
                <div className="font-headline font-extrabold text-xl text-slate-900 mt-1">
                  {money(telemetry?.rollingReserves ?? 0)}
                </div>
              </div>
              <div className="px-6 py-5">
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Escrow Locked</div>
                <div className="font-headline font-extrabold text-xl text-emerald-600 mt-1">
                  {money(overview.escrowLockedVolume ?? 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
