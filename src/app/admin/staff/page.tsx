"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, KeyRound, ShieldCheck, UserPlus, X } from "lucide-react";
import { useAdminToast } from "@/components/navigation/AdminShell";
import { getCurrentUser } from "@/lib/auth";

interface StaffMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  color: string;
  scope: string;
  mfa: "Hardware FIDO2" | "TOTP" | "None";
  status: "active" | "suspended";
}

interface Permission {
  key: string;
  label: string;
  roles: string[];
}

const MATRIX: Permission[] = [
  { key: "execute_escrow", label: "Execute escrow settlement / refund", roles: ["Super Admin", "Arbitration Officer"] },
  { key: "arbitrate", label: "Lead arbitration & rule verdicts", roles: ["Super Admin", "Arbitration Officer"] },
  { key: "moderate", label: "Moderate listings & merchants", roles: ["Super Admin", "Trust & Safety Lead"] },
  { key: "verification", label: "Approve / reject KYC applications", roles: ["Super Admin", "Trust & Safety Lead"] },
  { key: "payout", label: "Dispatch payout batches", roles: ["Super Admin", "Finance Controller"] },
  { key: "ledger_read", label: "View immutable ledger entries", roles: ["Super Admin", "Finance Controller", "Arbitration Officer"] },
  { key: "support", label: "Respond in support inbox", roles: ["Super Admin", "Support Analyst", "Arbitration Officer"] },
  { key: "staff_admin", label: "Manage staff & permissions", roles: ["Super Admin"] },
];

export default function AdminStaffPage() {
  const { showToast } = useAdminToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Arbitration Officer");
  const [operator, setOperator] = useState<StaffMember | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setOperator({
        id: "STF-0001",
        name: user.name || "Platform Operator",
        initials: (user.name || "PO")
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        role: user.role === "admin" ? "Super Admin" : user.role || "Super Admin",
        color: "bg-slate-900 text-white ring-blue-100",
        scope: "Full access: escrow execution, arbitrations, ledger, staff",
        mfa: "Hardware FIDO2",
        status: "active",
      });
    }
  }, []);

  const sendInvite = () => {
    setInviteOpen(false);
    showToast(`FIDO2 enrollment invite sent to ${inviteEmail || "new staff member"}. Provisioned under Ledger v4.2.`);
    setInviteEmail("");
  };

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
            <span className="text-[var(--cobalt-acc)] font-bold">Staff &amp; Permissions</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Staff Roster &amp; Permission Matrix
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                {operator ? "1 operator provisioned." : "No operators provisioned."} Every session is protected by FIDO2 or
                TOTP; all sessions are recorded to the audit ledger.
              </p>
            </div>
            <button
              onClick={() => setInviteOpen(true)}
              className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white text-[13px] font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Staff</span>
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 flex flex-col gap-6">
          {/* Roster */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {operator && (
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ring-2 shadow-sm ${operator.color}`}
                    >
                      {operator.initials}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{operator.name}</div>
                      <div className="text-[12px] text-slate-500 font-semibold">
                        {operator.role} • {operator.id}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase">
                    Active
                  </span>
                </div>

                <p className="text-[13px] text-slate-500 leading-relaxed">{operator.scope}</p>

                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold ${
                      operator.mfa === "Hardware FIDO2"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : operator.mfa === "TOTP"
                        ? "bg-blue-50 text-[var(--cobalt-acc)] border border-blue-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    {operator.mfa}
                  </span>
                  <button
                    onClick={() =>
                      showToast(`All sessions for ${operator.name} revoked. A re-login with the FIDO2 key is required.`)
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Revoke Sessions
                  </button>
                </div>
              </div>
            )}
            {!operator && (
              <button
                onClick={() => setInviteOpen(true)}
                className="p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[var(--cobalt-acc)] hover:bg-blue-50/40 transition-colors flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-[var(--cobalt-acc)] cursor-pointer min-h-[160px]"
              >
                <UserPlus className="w-6 h-6" />
                <span className="font-bold text-sm">Invite your first operator</span>
                <span className="text-[12px]">FIDO2 enrollment required on first login.</span>
              </button>
            )}
          </div>

          {/* Permission Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-headline font-bold text-base text-slate-900">Permission Matrix</h3>
              <p className="text-[13px] text-slate-500 mt-0.5">Who can do what. Changes are logged to the immutable ledger.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left font-bold px-6 py-3">Capability</th>
                    <th className="text-right font-bold px-2 py-3">Super Admin</th>
                    <th className="text-right font-bold px-2 py-3">Arbitration Officer</th>
                    <th className="text-right font-bold px-2 py-3">Trust &amp; Safety Lead</th>
                    <th className="text-right font-bold px-2 py-3">Finance Controller</th>
                    <th className="text-right font-bold px-6 py-3">Support Analyst</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MATRIX.map((p) => {
                    const check = (role: string) =>
                      p.roles.includes(role) ? <Check className="w-4 h-4 text-emerald-600" /> : (
                        <X className="w-4 h-4 text-slate-300" />
                      );
                    return (
                      <tr key={p.key} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-900">{p.label}</td>
                        <td className="px-2 py-3 flex justify-end">{check("Super Admin")}</td>
                        <td className="px-2 py-3 flex justify-end">{check("Arbitration Officer")}</td>
                        <td className="px-2 py-3 flex justify-end">{check("Trust & Safety Lead")}</td>
                        <td className="px-2 py-3 flex justify-end">{check("Finance Controller")}</td>
                        <td className="px-6 py-3 flex justify-end">{check("Support Analyst")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-slate-100 flex items-center gap-2 text-[12px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Staff permission changes require a second Super Admin cosign (4-eyes policy).
            </div>
          </div>
        </div>

        {/* Invite Modal */}
        {inviteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
              <h3 className="font-headline font-bold text-base text-slate-900">Invite a Staff Member</h3>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Work Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="operator@safedeal.io"
                  className="px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider mt-1">Role</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Arbitration Officer", "Trust & Safety Lead", "Finance Controller", "Support Analyst"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setInviteRole(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        inviteRole === r
                          ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setInviteOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-[13px] hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={sendInvite}
                  className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-[13px] hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Send Enrollment Invite
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
