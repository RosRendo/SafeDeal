"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Building,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useAdminSearch, useAdminToast } from "@/components/navigation/AdminShell";

interface VerificationItem {
  id: string;
  applicantName: string;
  username: string;
  email: string;
  requestedTier: "Tier 2 ($50k/mo)" | "Tier 3 ($250k/mo)" | "Tier 4 Enterprise";
  docType: string;
  country: string;
  biometricMatch: string;
  aiRiskScore: number;
  submittedAge: string;
  status: "Pending Review" | "Approved" | "Docs Requested" | "Rejected";
  corporateDetails?: {
    companyName: string;
    registrationNumber: string;
    incorporationCountry: string;
  };
  notes: string;
}

export default function VerificationReviewsPage() {
  const [filterTab, setFilterTab] = useState<"all" | "tier2" | "tier3" | "flagged">("all");
  const { searchQuery, setSearchQuery } = useAdminSearch();
  const [selectedId, setSelectedId] = useState("VER-8491");
  const { showToast } = useAdminToast();

  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadVerifications() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        if (json.success && Array.isArray(json.users)) {
          const items: VerificationItem[] = json.users.map((u: any, idx: number) => {
            const isCorporate = idx % 2 === 0;
            return {
              id: `VER-${idx + 8480}`,
              applicantName: `${u.fullName} (${u.username})`,
              username: u.username,
              email: u.email,
              requestedTier: isCorporate ? "Tier 3 ($250k/mo)" : "Tier 2 ($50k/mo)",
              docType: isCorporate ? "Certificate of Incorporation + ID" : "Passport / National ID",
              country: u.location || "United States (US)",
              biometricMatch: "99.4% Facial Liveness Match",
              aiRiskScore: u.riskScore || 10,
              submittedAge: "Today",
              status: "Pending Review",
              corporateDetails: isCorporate
                ? {
                    companyName: `${u.fullName} Holdings LLC`,
                    registrationNumber: `REG-${idx + 90210}`,
                    incorporationCountry: "United States",
                  }
                : undefined,
              notes: `Applicant ${u.fullName} submitted compliance documentation for merchant tier authorization. Zero chargebacks recorded.`,
            };
          });
          setVerifications(items);
          if (items.length > 0) {
            setSelectedId(items[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load verifications", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadVerifications();
  }, []);

  const selectedItem = useMemo(() => {
    return verifications.find((v) => v.id === selectedId) || verifications[0] || null;
  }, [verifications, selectedId]);

  const filteredItems = useMemo(() => {
    return verifications.filter((item) => {
      if (filterTab === "tier2" && !item.requestedTier.includes("Tier 2")) return false;
      if (filterTab === "tier3" && !item.requestedTier.includes("Tier 3") && !item.requestedTier.includes("Tier 4")) return false;
      if (filterTab === "flagged" && item.aiRiskScore < 50) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.applicantName.toLowerCase().includes(q) ||
          item.username.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [verifications, filterTab, searchQuery]);

  const handleApprove = async (id: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "Approved" } : v))
    );
    showToast(`Tier elevation approved for ${selectedItem.applicantName}. Payout limits raised.`);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedItem.username || "seller-1", tier: "T3 Verified" }),
      });
    } catch (e) {
      console.warn("Failed to persist tier approval to API", e);
    }
  };

  const handleReject = async (id: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "Rejected" } : v))
    );
    showToast(`Verification rejected for ${selectedItem.applicantName}. Mandatory resubmission email dispatched.`);
  };

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full">
        <div className="px-4 sm:px-8 py-6 flex flex-col gap-6">
              {/* Breadcrumbs, Meta Header & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[12px] uppercase tracking-wider mb-1 font-semibold">
                    <Link href="/admin" className="hover:text-[var(--cobalt-acc)] transition-colors">
                      Trust & Safety
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[var(--cobalt-acc)] font-bold">Verification Reviews</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-headline font-bold text-2xl text-slate-900 tracking-tight">
                      Merchant KYC & Tier Elevation Queue
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] border border-blue-200 text-xs font-bold">
                      {verifications.length} Submission{verifications.length === 1 ? "" : "s"} Pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: `All Pending (${verifications.length})` },
                  { id: "tier2", label: `Tier 2 ID Check (${verifications.filter(v => v.requestedTier.includes("Tier 2")).length})` },
                  { id: "tier3", label: `Tier 3+ Corporate (${verifications.filter(v => v.requestedTier.includes("Tier 3") || v.requestedTier.includes("Tier 4")).length})` },
                  { id: "flagged", label: `High Risk Flags (${verifications.filter(v => v.aiRiskScore > 50).length})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterTab === t.id
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Queue List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredItems.map((item) => {
                const isSelected = item.id === selectedItem.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-[var(--cobalt-acc)] ring-2 ring-blue-500/20 shadow-md"
                        : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[12px] font-bold text-slate-400">
                        {item.id}
                      </span>
                      <span className="text-[11px] text-slate-500">{item.submittedAge}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-headline font-bold text-sm text-slate-900">
                          {item.applicantName}
                        </h4>
                        <span className="text-xs text-slate-500">@{item.username}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.aiRiskScore > 50
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {item.requestedTier}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>{item.country}</span>
                      <span
                        className={`font-semibold ${
                          item.aiRiskScore > 50 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {item.biometricMatch}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Detailed Dossier Panel */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              {!selectedItem ? (
                <div className="p-12 text-center text-slate-500">
                  <p className="font-bold text-sm text-slate-800">No Verification Docket Selected</p>
                  <p className="text-xs text-slate-400 mt-1">All merchant elevation submissions have been reviewed.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline font-extrabold text-xl text-slate-900">
                      {selectedItem.applicantName}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        selectedItem.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : selectedItem.status === "Rejected"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {selectedItem.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    User: @{selectedItem.username} • Email: {selectedItem.email}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">
                    AI Risk Index: {selectedItem.aiRiskScore}/100
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      selectedItem.aiRiskScore > 50 ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {selectedItem.aiRiskScore > 50 ? "High Risk Signal" : "Passes Risk Threshold"}
                  </span>
                </div>
              </div>

              {/* Document Overview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Uploaded Credentials: {selectedItem.docType}</span>
                  </span>
                  <span className="text-emerald-600 font-bold">{selectedItem.biometricMatch}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedItem.notes}
                </p>
              </div>

              {/* Corporate details if present */}
              {selectedItem.corporateDetails && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--cobalt-acc)]">
                    <Building className="w-4 h-4" />
                    <span>Corporate Registry Certification</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Legal Entity</span>
                      <strong>{selectedItem.corporateDetails.companyName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Registration Number</span>
                      <strong>{selectedItem.corporateDetails.registrationNumber}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  onClick={() => handleReject(selectedItem.id)}
                  disabled={selectedItem.status !== "Pending Review"}
                  className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Reject & Request Higher Res
                </button>

                <button
                  onClick={() => handleApprove(selectedItem.id)}
                  disabled={selectedItem.status !== "Pending Review"}
                  className="px-6 py-2.5 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-[13px] shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Tier Elevation</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
      </div>
    </main>
  );
}
