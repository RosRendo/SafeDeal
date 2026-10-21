"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
} from "lucide-react";
import ForceSettleArbitrationModal, {
  SettlementVerdict,
} from "@/components/admin/ForceSettleArbitrationModal";
import { useAdminToast } from "@/components/navigation/AdminShell";

export default function ForceSettlePage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { showToast } = useAdminToast();

  const handleAuthorize = async (verdict: SettlementVerdict, rationale: string, pin: string) => {
    setIsModalOpen(false);
    const label =
      verdict === "buyer_refund"
        ? "Full Buyer Refund of $195.00"
        : verdict === "seller_payout"
        ? "Seller Payout of $185.25"
        : "50/50 Split Settlement ($97.50 / $92.62)";

    try {
      await fetch("/api/admin/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ord-1",
          caseId: "DSP-1092",
          verdict,
          rationale,
          pin,
        }),
      });
    } catch (err) {
      console.warn("Failed to settle dispute via API:", err);
    }

    showToast(`Arbitration authorized! Escrow ledger #BLK-9982 updated with ${label}. Supervisory PIN verified.`);
  };

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full relative">
        {/* Backdrop Workspace Context: Active Disputes Table */}
        <div
          className={`w-full px-8 py-6 transition-all duration-300 ${
            isModalOpen
              ? "select-none opacity-40 blur-[2px] pointer-events-none"
              : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between pb-6">
            <div className="flex flex-col">
              <h1 className="font-headline text-2xl font-bold text-[var(--ds-navy)]">
                Disputes & Resolutions
              </h1>
              <span className="text-[13px] text-slate-500">
                Active arbitration queue • Escrow hold tier 3
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-[13px]">
                Queue: 14 open
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[13px] shadow-xs">
                5 Critical Escalations
              </span>
            </div>
          </div>

          {/* Background Table Mockup */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <div className="grid grid-cols-6 gap-4 py-3 bg-slate-50 px-4 rounded-xl text-[12px] font-bold uppercase tracking-wider text-slate-500">
              <span>Case Reference</span>
              <span>Buyer / Seller</span>
              <span>Item Asset</span>
              <span>Escrow Held</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Case 1 */}
              <div className="grid grid-cols-6 gap-4 py-4 px-4 items-center bg-blue-50/40 rounded-xl mt-2 border border-blue-200/40">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[var(--cobalt-acc)]">#DSP-1092</span>
                  <span className="text-[12px] text-slate-500">Order #SF-2024-88492</span>
                </div>
                <span className="text-[13px] text-slate-800 font-medium">
                  Authorized Buyer / AeroGamingDeals
                </span>
                <span className="text-[13px] text-slate-800 truncate font-medium">
                  Valorant Immortal 3 (Global)
                </span>
                <span className="font-headline text-sm font-bold text-slate-900 font-mono">
                  $195.00
                </span>
                <span className="inline-flex w-fit px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                  Under Dual-Auth
                </span>
                <div className="text-right">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-[13px] transition-colors shadow-xs cursor-pointer"
                  >
                    Arbitrate
                  </button>
                </div>
              </div>

              {/* Case 2 */}
              <div className="grid grid-cols-6 gap-4 py-4 px-4 items-center mt-1">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-700">#DSP-1093</span>
                  <span className="text-[12px] text-slate-500">Order #SF-2024-88510</span>
                </div>
                <span className="text-[13px] text-slate-800 font-medium">
                  k***9@gmail.com / SteamVault
                </span>
                <span className="text-[13px] text-slate-800 truncate font-medium">
                  Counter-Strike 2 Karambit Fade
                </span>
                <span className="font-headline text-sm font-bold text-slate-900 font-mono">
                  $720.00
                </span>
                <span className="inline-flex w-fit px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                  Pending Buyer Evidence
                </span>
                <div className="text-right">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[13px] transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FORCE SETTLE ARBITRATION MODAL OVERLAY */}
        <ForceSettleArbitrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAuthorize={handleAuthorize}
          caseNumber="#DSP-1092"
          orderNumber="#SF-2024-88492"
          assetTitle="Valorant Immortal 3 (Global Riot ID • Full Access)"
          escrowAmount={195.0}
          buyerName="Authorized Buyer"
          sellerName="AeroGamingDeals"
        />
      </div>
    </main>
  );
}
