"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Server } from "lucide-react";
import { useAdminToast } from "@/components/navigation/AdminShell";

interface SettingToggle {
  key: string;
  label: string;
  desc: string;
  group: "escrow" | "compliance" | "operations";
  defaultOn: boolean;
  locked?: string;
}

const SETTINGS: SettingToggle[] = [
  {
    key: "auto_release",
    label: "Auto-Release on Buyer Confirmation",
    desc: "Escrow releases automatically when the buyer confirms inspection or the 48h window lapses without a dispute.",
    group: "escrow",
    defaultOn: true,
  },
  {
    key: "sla_pause",
    label: "Pause SLA on Evidence Request",
    desc: "Freezes the 2-hour SLA timer for 24h when new evidence is requested during arbitration.",
    group: "escrow",
    defaultOn: true,
  },
  {
    key: "split_default",
    label: "Split Settlement Cap",
    desc: "Caps 50/50 goodwill settlements at $250 per case; above the cap requires a Super Admin cosign.",
    group: "escrow",
    defaultOn: true,
  },
  {
    key: "kyc_gate",
    label: "Enforce KYC Tier 2 Before Listing",
    desc: "Sellers must clear ID + bank verification before their first listing goes live.",
    group: "compliance",
    defaultOn: true,
    locked: "Regulated under Sec. 1.4 Marketplace Integrity Policy",
  },
  {
    key: "proxy_block",
    label: "Block Tor & Datacenter Proxy Signups",
    desc: "Denies account creation from known anonymization relay ranges. Signup attempts are logged to the risk engine.",
    group: "compliance",
    defaultOn: true,
  },
  {
    key: "offplatform_scan",
    label: "Scan Escrow Chat for Off-Platform Funnels",
    desc: "Flags Discord, Telegram, and PayPal mentions in order chats and appends the transcript to the case file.",
    group: "compliance",
    defaultOn: true,
  },
  {
    key: "fe_collect",
    label: "Immutable Ledger v4.2 (High-Availability)",
    desc: "Append-only, hash-chained action ledger with 15-minute reconciliation sweeps. Disabling breaks your compliance posture.",
    group: "operations",
    defaultOn: true,
    locked: "Cannot be disabled while escrow volume > $0",
  },
  {
    key: "auto_payout",
    label: "Automated 18:00 UTC Payout Daemon",
    desc: "Dispatches cleared escrow batches to verified merchant destinations without manual approval.",
    group: "operations",
    defaultOn: true,
  },
];

const GROUP_META: Record<SettingToggle["group"], { title: string; desc: string }> = {
  escrow: { title: "Escrow Protocol", desc: "How funds are held, released, and arbitrated." },
  compliance: { title: "Compliance & Trust", desc: "Guardrails required by the Marketplace Integrity Policy." },
  operations: { title: "Platform Operations", desc: "Immutable ledger and automated daemons." },
};

export default function AdminSettingsPage() {
  const { showToast } = useAdminToast();
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(SETTINGS.map((s) => [s.key, s.defaultOn]))
  );

  const flip = (s: SettingToggle) => {
    if (s.locked) {
      showToast(`“${s.label}” is protected: ${s.locked}`);
      return;
    }
    const next = !toggles[s.key];
    setToggles((prev) => ({ ...prev, [s.key]: next }));
    showToast(
      `“${s.label}” ${next ? "enabled" : "disabled"}. Change cosigned to the immutable ledger by Staff Sarah Lin (#STF-0042).`
    );
  };

  const groups: SettingToggle["group"][] = ["escrow", "compliance", "operations"];

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
            <span className="text-[var(--cobalt-acc)] font-bold">System Settings</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                System Settings
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                Platform-wide policy switches. Every change is cosigned, logged, and reversible within 1 hour.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                <Server className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-slate-700 font-semibold">Env: PROD-US-EAST-1</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs text-emerald-700 font-semibold">4 of 8 switches gated by policy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 flex flex-col gap-6">
          {groups.map((g) => (
            <div key={g} className="flex flex-col gap-3">
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">{GROUP_META[g].title}</h3>
                <p className="text-[13px] text-slate-500">{GROUP_META[g].desc}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {SETTINGS.filter((s) => s.group === g).map((s) => (
                  <div key={s.key} className="px-6 py-4 flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{s.label}</span>
                        {s.locked && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                            Policy-Locked
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                      {s.locked && <p className="text-[12px] text-amber-700 font-semibold mt-1">{s.locked}</p>}
                    </div>
                    <button
                      onClick={() => flip(s)}
                      role="switch"
                      aria-checked={toggles[s.key]}
                      aria-label={s.label}
                      className={`w-11 h-6 rounded-full shrink-0 relative transition-colors cursor-pointer ${
                        toggles[s.key] ? "bg-[var(--cobalt-acc)]" : "bg-slate-300"
                      } ${s.locked ? "opacity-90" : ""}`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                          toggles[s.key] ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
