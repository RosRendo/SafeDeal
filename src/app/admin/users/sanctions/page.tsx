"use client";

import React, { useState } from "react";
import EnforceSanctionModal, {
  SanctionTier,
} from "@/components/admin/EnforceSanctionModal";
import { useAdminToast } from "@/components/navigation/AdminShell";

export default function MerchantSanctionsPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const { showToast } = useAdminToast();

  const handleApplySanction = (data: {
    tier: SanctionTier;
    reasonCode: string;
    notes: string;
    notifyMerchant: boolean;
    notifyBuyers: boolean;
  }) => {
    setIsModalOpen(false);
    const tierName =
      data.tier === "tier_3"
        ? "Level 3 Full Suspension & Blacklist"
        : data.tier === "tier_2"
        ? "Level 2 Escrow & Payout Freeze"
        : "Level 1 Listing Restrictions";

    showToast(
      `Sanction enforced against GlobalKeysDirect! Enforced: ${tierName} under Code ${data.reasonCode}.`
    );
  };

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full relative">
        {/* Underlying Blurred Admin Back-Office Context (Users & Sellers Directory) */}
        <div
          aria-hidden={isModalOpen}
          className={`w-full px-8 py-6 flex flex-col gap-6 transition-all duration-300 ${
            isModalOpen
              ? "filter blur-[6px] select-none pointer-events-none opacity-40"
              : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="font-headline text-2xl font-bold text-[var(--ds-navy)]">
                Users & Merchant Governance
              </h1>
              <span className="text-[13px] text-slate-500">
                Real-time surveillance, risk thresholds, and merchant identity verification.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-[13px] shadow-2xs hover:bg-slate-50 cursor-pointer">
                Export CSV
              </button>
              <button className="px-4 py-2 bg-[var(--cobalt-acc)] text-white rounded-xl font-bold text-[13px] shadow-xs hover:bg-blue-700 cursor-pointer">
                Add Merchant Filter
              </button>
            </div>
          </div>

          {/* Bento 4 Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                Total Accounts
              </span>
              <span className="font-headline text-2xl font-extrabold text-slate-900 font-mono">
                148,920
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                High Risk Watchlist
              </span>
              <span className="font-headline text-2xl font-extrabold text-rose-600 font-mono">
                42 flagged
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                Frozen Escrow Reserves
              </span>
              <span className="font-headline text-2xl font-extrabold text-slate-900 font-mono">
                $38,410.50
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                Pending Arbitrations
              </span>
              <span className="font-headline text-2xl font-extrabold text-[var(--cobalt-acc)] font-mono">
                19 cases
              </span>
            </div>
          </div>

          {/* Governance Table Mockup */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 p-5 flex flex-col gap-4">
            <div className="grid grid-cols-5 gap-4 py-3 bg-slate-50 px-4 rounded-xl text-[12px] font-bold uppercase tracking-wider text-slate-500">
              <span>User ID</span>
              <span>Merchant Entity</span>
              <span>Score</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Row 1 - Critical Target */}
              <div className="grid grid-cols-5 gap-4 py-4 px-4 items-center bg-rose-50/40 rounded-xl mt-1 border border-rose-200/40">
                <span className="font-mono text-[13px] font-bold text-slate-900">
                  #USR-90214
                </span>
                <span className="text-[13px] font-bold text-slate-900">
                  GlobalKeysDirect
                </span>
                <span className="inline-flex w-fit px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                  Critical 88
                </span>
                <span className="text-[13px] font-bold text-rose-600">
                  Investigation
                </span>
                <div className="text-right">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[13px] transition-colors shadow-xs cursor-pointer"
                  >
                    Enforce Sanction
                  </button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-5 gap-4 py-4 px-4 items-center mt-1">
                <span className="font-mono text-[13px] text-slate-600">
                  #USR-88102
                </span>
                <span className="text-[13px] font-bold text-slate-800">
                  ApexAccounts_EU
                </span>
                <span className="inline-flex w-fit px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  Moderate 24
                </span>
                <span className="text-[13px] font-bold text-[var(--acc-green)]">
                  Verified
                </span>
                <div className="text-right">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[13px] transition-colors cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ENFORCE SANCTION MODAL OVERLAY */}
        <EnforceSanctionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onApplySanction={handleApplySanction}
          merchantName="GlobalKeysDirect"
          userId="#USR-90214"
          riskScore={88}
          activeInventoryCount={14}
          inFlightEscrowCount={3}
          inFlightEscrowAmount={234.5}
          clearedBalanceAmount={1450.0}
        />
      </div>
    </main>
  );
}
