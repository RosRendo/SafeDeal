"use client";

import React from "react";
import Link from "next/link";
import EscrowChatWorkspace from "@/components/chat/EscrowChatWorkspace";
import { useAdminToast } from "@/components/navigation/AdminShell";
import { ChevronRight, Gavel } from "lucide-react";

export default function AdminArbitrationMessagesPage() {
  const { showToast } = useAdminToast();

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen pb-12">
      {/* Top Command Context Bar */}
      <div className="px-8 py-5 bg-white border-b border-slate-200/80 shadow-xs flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-slate-500 text-[12px] uppercase tracking-wider font-semibold">
          <Link href="/admin" className="hover:text-[var(--cobalt-acc)] transition-colors">
            Trust & Safety
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/admin/disputes" className="hover:text-[var(--cobalt-acc)] transition-colors">
            Disputes
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-purple-700 font-bold">Arbitration Live Mediation Chat</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Official Arbitrator Mediation Console</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
                Live Channel
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">
              Direct official arbitrator oversight across Buyer and Seller communications. Issue enforceable rulings, freeze escrow clocks, and cross-reference account telemetry.
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
              <span className="text-xs text-purple-900 font-bold">SafeDeal Staff Officer Mode</span>
            </div>
            <Link
              href="/admin/disputes/force-settle"
              className="px-3.5 py-1.5 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Force Settle Case</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Arbitrator Chat Engine */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4">
            <React.Suspense fallback={<div className="p-12 text-center text-[13px] text-slate-400">Loading arbitrator channels...</div>}>
          <EscrowChatWorkspace role="admin" />
        </React.Suspense>
      </div>
    </main>
  );
}
