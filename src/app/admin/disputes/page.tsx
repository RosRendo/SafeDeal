"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminSearch, useAdminToast } from "@/components/navigation/AdminShell";
import {
  ShieldCheck,
  Zap,
  Plus,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Store,
  Eye,
  Package,
  Layers,
  DollarSign,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  Camera,
  Ban,
  Lock,
  ChevronRight,
  ChevronLeft,
  X,
  Send,
  Upload,
  Coins,
  Copy,
  Check,
  SlidersHorizontal,
  RefreshCw,
  Bell,
  User,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  Trash2,
  Edit3,
  Bookmark,
  MoreVertical,
  CheckCheck,
  FileSpreadsheet,
  KeyRound,
  ShieldAlert,
  Info,
  Sparkles,
  ArrowUpDown,
  Laptop,
  CheckSquare,
  Square,
  Server,
  Activity,
  Terminal,
  Gavel,
  Users,
  CreditCard,
  History,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  FileText,
  FileCode,
  AlertOctagon,
  Calendar,
  Globe,
  Fingerprint,
  FileCheck,
  Key,
  Shield,
  Maximize2,
  LockKeyhole,
  Timer,
  Scale,
  AlarmClock,
  Radio,
} from "lucide-react";

interface DisputeCase {
  id: string;
  caseNumber: string;
  orderNumber: string;
  title: string;
  subTitle: string;
  category: string;
  channel: string;
  slaTimeLeft: string;
  slaUrgent: boolean;
  slaMinutes: number;
  escrowAmount: number;
  sellerNet: number;
  splitBuyer: number;
  splitSeller: number;
  status: "Under Staff Arbitration" | "Awaiting Review" | "Buyer Evidence" | "Escalated";
  officer: { name: string; id: string };
  buyer: {
    username: string;
    avatarInitials: string;
    purchases: number;
    claimSummary: string;
    attachment: { name: string; size: string; hash: string; type: "image" | "log" };
  };
  seller: {
    username: string;
    avatarInitials: string;
    rating: string;
    salesCount: string;
    rebuttalSummary: string;
    attachment: { name: string; size: string; hash: string; type: "log" | "image" };
  };
  botAuditLogs: { time: string; tag: string; message: string; isAlert?: boolean; isHighlight?: boolean }[];
  defaultRationale: string;
}

export default function DisputesArbitrationDeskPage() {
  const router = useRouter();

  // Active navigation
  const [activeNav, setActiveNav] = useState("disputes-and-refunds");

  // Global search input
  const { searchQuery, setSearchQuery } = useAdminSearch();

  // Filter caseload
  const [filterChip, setFilterChip] = useState<"urgent" | "awaiting" | "buyer-evidence" | "escalated" | "all">("urgent");

  // Active selected case
  const [selectedCaseId, setSelectedCaseId] = useState<string>("DSP-1092");

  // Arbitration verdict form state
  const [selectedVerdict, setSelectedVerdict] = useState<"buyer_refund" | "seller_release" | "split" | "pause_evidence">("seller_release");
  const [decisionRationale, setDecisionRationale] = useState<string>(
    "Automated audit confirms credentials were valid at handover. Three consecutive unauthorized logins originating from known Tor exit relay (185.220.101.4) triggered security lock out on buyer's side. Finding in favor of seller under Section 8 (Circumvention & Proxy Abuse). Escrow balance released."
  );

  // Modals & previews
  const [previewAttachment, setPreviewAttachment] = useState<{ title: string; meta: string; type: string } | null>(null);
  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const { showToast } = useAdminToast();

  // Live ticking countdown for urgent case
  const [slaCountdownMinutes, setSlaCountdownMinutes] = useState(38);
  const [slaCountdownSeconds, setSlaCountdownSeconds] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlaCountdownSeconds((prev) => {
        if (prev === 0) {
          setSlaCountdownMinutes((m) => Math.max(0, m - 1));
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Caseload dataset (dynamic from API)
  const [cases, setCases] = useState<DisputeCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDisputes() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/disputes");
        const json = await res.json();
        if (json.success && Array.isArray(json.disputes)) {
          const apiCases: DisputeCase[] = json.disputes.map((d: any) => {
            const amount = typeof d.price === "number" ? d.price : 50;
            return {
              id: d.id,
              caseNumber: "#DSP-" + (d.id.replace(/[^0-9]/g, "").slice(-4) || "1092"),
              orderNumber: d.orderNumber || "#" + d.id,
              title: d.itemTitle || "Digital Asset Order Dispute",
              subTitle: d.statusText || "Escrow Paused (Arbitration Review)",
              category: d.category === "keys" ? "Game Keys" : "Gaming Accounts",
              channel: "Escrow Direct",
              slaTimeLeft: "45m SLA",
              slaUrgent: true,
              slaMinutes: 45,
              escrowAmount: amount,
              sellerNet: +(amount * 0.95).toFixed(2),
              splitBuyer: +(amount * 0.5).toFixed(2),
              splitSeller: +(amount * 0.45).toFixed(2),
              status: "Under Staff Arbitration",
              officer: { name: "Sarah L.", id: "#STF-0042" },
              buyer: {
                username: d.buyerName || "Disputing Buyer",
                avatarInitials: (d.buyerName || "DB").slice(0, 2).toUpperCase(),
                purchases: 3,
                claimSummary: "Buyer requested arbitration review for delivered asset credentials.",
                attachment: {
                  name: "buyer_proof_snapshot.png",
                  size: "1.2 MB",
                  hash: "SHA-256 Verified",
                  type: "image",
                },
              },
              seller: {
                username: d.sellerName || "AeroGamingDeals",
                avatarInitials: (d.sellerName || "AG").slice(0, 2).toUpperCase(),
                rating: "99.4% Pos",
                salesCount: "1.8k",
                rebuttalSummary: "Seller submitted credentials via automated escrow vault.",
                attachment: {
                  name: "vault_handover_receipt.log",
                  size: "18 KB",
                  hash: "Cryptographically Verified",
                  type: "log",
                },
              },
              botAuditLogs: [
                {
                  time: "Recently",
                  tag: "[ESCROW_AUDIT]",
                  message: "Escrow funds locked. Dispute ticket escalated to Staff Arbitration desk.",
                  isHighlight: true,
                },
              ],
              defaultRationale:
                "Staff arbitration review conducted against escrow logs and delivery receipts.",
            };
          });

          setCases(apiCases);
          if (apiCases.length > 0) {
            setSelectedCaseId(apiCases[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load disputes", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDisputes();
  }, []);

  // Active case
  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  // Filtered caseload list
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (filterChip === "urgent" && !c.slaUrgent) return false;
      if (filterChip === "awaiting" && c.status !== "Awaiting Review") return false;
      if (filterChip === "buyer-evidence" && c.status !== "Buyer Evidence") return false;
      if (filterChip === "escalated" && c.status !== "Escalated") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.caseNumber.toLowerCase().includes(q) ||
          c.orderNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.buyer.username.toLowerCase().includes(q) ||
          c.seller.username.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cases, filterChip, searchQuery]);

  // Handle execute arbitration
  const handleConfirmArbitration = async () => {
    if (!activeCase) return;
    try {
      await fetch("/api/admin/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeCase.id,
          verdict: selectedVerdict,
          rationale: decisionRationale,
        }),
      });
    } catch (e) {
      console.error("Failed to submit arbitration verdict", e);
    }
    setCases((prev) => prev.filter((c) => c.id !== activeCase.id));
    setExecuteModalOpen(false);

    let summary = "";
    if (selectedVerdict === "seller_release") {
      summary = `Escrow of $${activeCase.escrowAmount.toFixed(2)} released to seller ${activeCase.seller.username} ($${activeCase.sellerNet.toFixed(2)} net). Case closed.`;
    } else if (selectedVerdict === "buyer_refund") {
      summary = `Full refund of $${activeCase.escrowAmount.toFixed(2)} returned to buyer ${activeCase.buyer.username}. Case closed.`;
    } else if (selectedVerdict === "split") {
      summary = `50/50 split settlement executed: $${activeCase.splitBuyer.toFixed(2)} to buyer / $${activeCase.splitSeller.toFixed(2)} to seller.`;
    } else {
      summary = `SLA timer paused. Verification challenge email dispatched to ${activeCase.buyer.username}.`;
    }

    showToast(summary);
  };

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full">
        {/* Top Command Context Bar */}
            <div className="px-8 py-6 bg-white border-b border-slate-200/80 shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-slate-500 text-[12px] uppercase tracking-wider font-semibold">
                <Link href="/admin" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Trust & Safety
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[var(--cobalt-acc)] font-bold">Disputes & Refunds</span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Disputes & Refund Arbitration Desk
                  </h1>
                  <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                    Review buyer-seller disputes, inspect delivery evidence, and execute compliant escrow settlements or refunds.
                  </p>
                </div>

                {/* Live KPI Pills */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs text-slate-900 font-bold">{cases.length} Active Case{cases.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                    <Timer className="w-4 h-4 text-[var(--cobalt-acc)]" />
                    <span className="text-xs text-slate-700 font-medium">
                      Avg Resolution: <strong className="text-slate-900 font-bold">4.2h</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                    <LockKeyhole className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-slate-700 font-medium">
                      Escrow Hold: <strong className="text-slate-900 font-bold">${cases.reduce((sum, c) => sum + (c.escrowAmount || 0), 0).toFixed(2)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Workspace 2-Column Split Layout */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT QUEUE (4 Cols on desktop, ~35%) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {/* Queue Filter Chips */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">
                        Filter Caseload
                      </span>
                      <button
                        onClick={() => {
                          setFilterChip("all");
                          setSearchQuery("");
                          showToast("Caseload filters reset.");
                        }}
                        className="text-[12px] text-[var(--cobalt-acc)] font-bold hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setFilterChip("urgent")}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                          filterChip === "urgent"
                            ? "bg-rose-600 text-white"
                            : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Urgent SLA (&lt;2h)
                      </button>

                      <button
                        onClick={() => setFilterChip("awaiting")}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          filterChip === "awaiting"
                            ? "bg-slate-900 text-white font-bold"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span>Awaiting Review</span>
                        <span className="bg-white/30 px-1.5 py-0.2 rounded-full font-bold text-[11px]">
                          5
                        </span>
                      </button>

                      <button
                        onClick={() => setFilterChip("buyer-evidence")}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          filterChip === "buyer-evidence"
                            ? "bg-slate-900 text-white font-bold"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span>Buyer Evidence</span>
                        <span className="bg-slate-200 px-1 rounded-full font-bold text-[11px]">
                          2
                        </span>
                      </button>

                      <button
                        onClick={() => setFilterChip("escalated")}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          filterChip === "escalated"
                            ? "bg-slate-900 text-white font-bold"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span>Escalated</span>
                        <span className="bg-slate-200 px-1 rounded-full font-bold text-[11px]">
                          1
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Case Cards List */}
                  <div className="flex flex-col gap-3">
                    {filteredCases.map((c) => {
                      const isSelected = selectedCaseId === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedCaseId(c.id);
                            setDecisionRationale(c.defaultRationale);
                          }}
                          className={`bg-white p-4 rounded-xl transition-all cursor-pointer border flex flex-col gap-2.5 relative ${
                            isSelected
                              ? "border-[var(--cobalt-acc)] ring-2 ring-blue-500/20 shadow-md bg-blue-50/10"
                              : "border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[12px] text-slate-800">
                                {c.caseNumber}
                              </span>
                              {c.slaUrgent ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{c.id === "DSP-1092" ? `${slaCountdownMinutes}m ${slaCountdownSeconds}s SLA` : c.slaTimeLeft}</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] border border-blue-200 text-[11px] font-bold">
                                  {c.slaTimeLeft}
                                </span>
                              )}
                            </div>
                            <span className="font-headline font-extrabold text-base text-slate-900">
                              ${c.escrowAmount.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-slate-900 line-clamp-1">
                              {c.subTitle}
                            </span>
                            <span className="text-[12px] text-slate-500">
                              Order {c.orderNumber} • {c.title.split("|")[0]}
                            </span>
                          </div>

                          <div className="pt-2 flex items-center justify-between bg-slate-50 -mx-4 -mb-4 p-2.5 px-4 rounded-b-xl border-t border-slate-100 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <span className="font-bold text-slate-900">{c.buyer.username}</span>
                              <span className="text-slate-400 text-[12px]">vs</span>
                              <span className="font-bold text-slate-900">{c.seller.username}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-[12px]">
                              <User className="w-3.5 h-3.5 text-[var(--cobalt-acc)]" />
                              <span>{c.officer.name}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT ARBITRATION WORKSPACE (8 Cols on desktop, ~65%) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {!activeCase ? (
                    <div className="bg-white p-12 rounded-xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                      <h3 className="text-base font-bold text-slate-900">No Disputed Caseload Active</h3>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">
                        All escrow orders are progressing normally. When a buyer or seller requests formal arbitration, the docket appears here automatically.
                      </p>
                    </div>
                  ) : (<>
                  {/* Case Top Banner Summary Card */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-3 py-1 bg-slate-100 text-slate-900 font-bold text-xs rounded-lg border border-slate-200">
                          Case {activeCase.caseNumber}
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-[var(--cobalt-acc)] border border-blue-200 font-bold text-xs rounded-full flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--cobalt-acc)] animate-pulse" />
                          <span>{activeCase.status}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg">
                        <AlarmClock className="w-4 h-4 text-rose-600 animate-pulse" />
                        <span className="text-xs font-extrabold tracking-tight">
                          {activeCase.id === "DSP-1092"
                            ? `${slaCountdownMinutes} mins ${slaCountdownSeconds}s remaining`
                            : activeCase.slaTimeLeft}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                      <div>
                        <h2 className="font-headline font-bold text-lg md:text-xl text-slate-900">
                          {activeCase.title}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Order {activeCase.orderNumber} • Transaction Channel: {activeCase.channel} • Category: {activeCase.category}
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-right min-w-[140px]">
                        <span className="text-[11px] uppercase text-slate-500 tracking-wider font-bold block">
                          Escrow Hold
                        </span>
                        <span className="font-headline font-extrabold text-2xl text-slate-900">
                          ${activeCase.escrowAmount.toFixed(2)}{" "}
                          <span className="text-xs font-normal text-slate-500">USD</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comparative Evidence Dossier Bento Grid */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-slate-600 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-[var(--cobalt-acc)]" />
                        <span>Comparative Evidence Dossier</span>
                      </h3>
                      <span className="text-[12px] text-slate-400 font-medium">
                        Cryptographically Signed Submissions
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Buyer Claim Box */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-xs">
                                {activeCase.buyer.avatarInitials}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block leading-tight">
                                  {activeCase.buyer.username} (Buyer)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Buyer Member • {activeCase.buyer.purchases} Purchases
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                              Dispute Initiator
                            </span>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-800 leading-relaxed">
                            {activeCase.buyer.claimSummary}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                            Attachment Proof:
                          </span>
                          <div
                            onClick={() =>
                              setPreviewAttachment({
                                title: activeCase.buyer.attachment.name,
                                meta: `${activeCase.buyer.attachment.size} • ${activeCase.buyer.attachment.hash}`,
                                type: activeCase.buyer.attachment.type,
                              })
                            }
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between hover:bg-blue-50/50 hover:border-blue-200 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Camera className="w-4 h-4 text-slate-500 group-hover:text-[var(--cobalt-acc)]" />
                              <div className="flex flex-col truncate">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {activeCase.buyer.attachment.name}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {activeCase.buyer.attachment.size} • {activeCase.buyer.attachment.hash}
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[var(--cobalt-acc)]" />
                          </div>
                        </div>
                      </div>

                      {/* Seller Rebuttal Box */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-50 text-[var(--cobalt-acc)] border border-blue-200 flex items-center justify-center font-bold text-xs">
                                {activeCase.seller.avatarInitials}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block leading-tight">
                                  {activeCase.seller.username} (Seller)
                                </span>
                                <span className="text-[11px] text-emerald-600 font-semibold">
                                  Verified Merchant • {activeCase.seller.rating} ({activeCase.seller.salesCount})
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">
                              Respondent
                            </span>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-800 leading-relaxed">
                            {activeCase.seller.rebuttalSummary}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                            Attachment Proof:
                          </span>
                          <div
                            onClick={() =>
                              setPreviewAttachment({
                                title: activeCase.seller.attachment.name,
                                meta: `${activeCase.seller.attachment.size} • ${activeCase.seller.attachment.hash}`,
                                type: activeCase.seller.attachment.type,
                              })
                            }
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between hover:bg-blue-50/50 hover:border-blue-200 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-slate-500 group-hover:text-[var(--cobalt-acc)]" />
                              <div className="flex flex-col truncate">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {activeCase.seller.attachment.name}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {activeCase.seller.attachment.size} • {activeCase.seller.attachment.hash}
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[var(--cobalt-acc)]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Automated Audit Bot Log Box (Full Width) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[var(--ds-navy-2)] text-white flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <span className="font-bold text-xs text-slate-900">
                            SafeDeal Automated Audit Bot Ledger
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase">
                          Automated Telemetry
                        </span>
                      </div>

                      <div className="bg-[var(--ds-navy-2)] text-[var(--ds-navy-ink)] p-3 rounded-lg text-xs flex flex-col gap-1.5 font-mono">
                        {activeCase.botAuditLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 ${
                              log.isAlert
                                ? "text-rose-400"
                                : log.isHighlight
                                ? "text-emerald-400"
                                : "text-slate-300"
                            }`}
                          >
                            <span className="text-emerald-400 select-none shrink-0 font-bold">
                              {log.time}
                            </span>
                            <span>{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Policy Decision & Arbitration Controls */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-headline font-bold text-lg text-slate-900">
                          Arbitration Decision & Escrow Execution
                        </h3>
                        <p className="text-xs text-slate-500">
                          Select an enforceable disposition under Safedeal Seller & Buyer Guarantee Policies.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                        Officer ID: {activeCase.officer.id}
                      </span>
                    </div>

                    {/* Structured Resolution Radio Options */}
                    <div className="flex flex-col gap-2.5">
                      {/* Option 1: Full Refund */}
                      <label
                        onClick={() => setSelectedVerdict("buyer_refund")}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          selectedVerdict === "buyer_refund"
                            ? "bg-blue-50/50 border-[var(--cobalt-acc)] ring-2 ring-blue-500/20"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="arbitration_verdict"
                          checked={selectedVerdict === "buyer_refund"}
                          onChange={() => setSelectedVerdict("buyer_refund")}
                          className="mt-1 w-4 h-4 accent-[var(--cobalt-acc)]"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              Full Refund to Buyer (${activeCase.escrowAmount.toFixed(2)})
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-bold">
                              Failed Handover / Invalid 2FA
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            Executes instant reversal via Stripe Idempotency Key. Funds deducted from escrow buffer.
                          </p>
                        </div>
                      </label>

                      {/* Option 2: Release to Seller (SELECTED STATE) */}
                      <label
                        onClick={() => setSelectedVerdict("seller_release")}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          selectedVerdict === "seller_release"
                            ? "bg-blue-50/50 border-[var(--cobalt-acc)] ring-2 ring-blue-500/20"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="arbitration_verdict"
                          checked={selectedVerdict === "seller_release"}
                          onChange={() => setSelectedVerdict("seller_release")}
                          className="mt-1 w-4 h-4 accent-[var(--cobalt-acc)]"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              Release Escrow to Seller (${activeCase.sellerNet.toFixed(2)} net)
                            </span>
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
                              Fraudulent Buyer Claim / Suspicious IP
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            Tor exit node violation confirms breach of Safedeal T&C Section 8. Buyer marked for Trust Review.
                          </p>
                        </div>
                      </label>

                      {/* Option 3: Split Settlement */}
                      <label
                        onClick={() => setSelectedVerdict("split")}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          selectedVerdict === "split"
                            ? "bg-blue-50/50 border-[var(--cobalt-acc)] ring-2 ring-blue-500/20"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="arbitration_verdict"
                          checked={selectedVerdict === "split"}
                          onChange={() => setSelectedVerdict("split")}
                          className="mt-1 w-4 h-4 accent-[var(--cobalt-acc)]"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              Split Settlement (50/50 Goodwill Arbitration)
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-bold">
                              ${activeCase.splitBuyer.toFixed(2)} Buyer / ${activeCase.splitSeller.toFixed(2)} Seller
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            Mutual partial payout without assigning fraud fault. Recommended only for unverified edge latency faults.
                          </p>
                        </div>
                      </label>

                      {/* Option 4: Request Additional Evidence */}
                      <label
                        onClick={() => setSelectedVerdict("pause_evidence")}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          selectedVerdict === "pause_evidence"
                            ? "bg-blue-50/50 border-[var(--cobalt-acc)] ring-2 ring-blue-500/20"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="arbitration_verdict"
                          checked={selectedVerdict === "pause_evidence"}
                          onChange={() => setSelectedVerdict("pause_evidence")}
                          className="mt-1 w-4 h-4 accent-[var(--cobalt-acc)]"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              Request Additional Evidence (Pause SLA Timer)
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-bold">
                              Extends Case 24h
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            Sends automated verification challenge email to buyer requiring non-proxy device verification.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Mandatory Staff Decision Rationale */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-900">
                          Mandatory Staff Decision Rationale
                        </label>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Under Section 4.2 Escrow Protocol
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={decisionRationale}
                        onChange={(e) => setDecisionRationale(e.target.value)}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed"
                        placeholder="Provide detailed rationale for audit trail and automated notification email..."
                      />
                    </div>

                    {/* Audit & Invert Warning Pill */}
                    <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-2 text-xs border border-slate-200">
                      <Info className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-slate-600 leading-tight">
                        <strong className="text-slate-900">Reversible within 1 hour:</strong> Funds remain in staging queue before automated batch banking dispatch. Action cryptographically logged under Staff Sarah Lin (#STF-0042).
                      </span>
                    </div>

                    {/* Execution Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setEscalateModalOpen(true)}
                        type="button"
                        className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Gavel className="w-4 h-4" />
                        <span>Escalate to Legal & Compliance</span>
                      </button>

                      <button
                        onClick={() => setExecuteModalOpen(true)}
                        type="button"
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Execute Arbitration & Close</span>
                      </button>
                    </div>
                  </div>
                  </>)}
                </div>
              </div>
            </div>
        </div>

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--cobalt-acc)]" />
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">
                    {previewAttachment.title}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {previewAttachment.meta}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs max-h-72 overflow-y-auto space-y-1">
              <div>[SHA-256 CHECK: VERIFIED]</div>
              <div>[SIGNER: VERIFIED PROTOCOL CLIENT]</div>
              <div className="text-slate-400 pt-2 pb-1">--- BEGIN ATTACHMENT EVIDENCE PAYLOAD ---</div>
              <div>AUTH_CLIENT: Rockstar Launcher Native / v1.0.84.11</div>
              <div>FAIL_REASON: TWO_STEP_VERIFICATION_REQUIRED</div>
              <div>CHALLENGE_DEST: a***@bk.ru</div>
              <div>ORIGIN_IP: 185.220.101.4 (Tor Exit Node Relay)</div>
              <div>LATENCY: 42ms RTT</div>
              <div className="text-slate-400 pt-1">--- END ATTACHMENT EVIDENCE PAYLOAD ---</div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPreviewAttachment(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation of Arbitration Execution Modal */}
      {executeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center mx-auto">
              <Scale className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-headline font-bold text-base text-slate-900">
                Confirm Arbitration Execution
              </h3>
              <p className="text-xs text-slate-600">
                You are executing verdict:{" "}
                <strong className="text-slate-900">
                  {selectedVerdict === "seller_release"
                    ? `Release Escrow to Seller ($${activeCase.sellerNet.toFixed(2)} net)`
                    : selectedVerdict === "buyer_refund"
                    ? `Full Refund to Buyer ($${activeCase.escrowAmount.toFixed(2)})`
                    : selectedVerdict === "split"
                    ? `50/50 Split Settlement`
                    : `Request Additional Evidence`}
                </strong>{" "}
                for Case {activeCase.caseNumber}.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[12px] text-slate-700 text-left leading-relaxed">
              <strong>Audit Notice:</strong> Reversible within 60 minutes via Super Admin override. Automated dispatch webhook will be triggered immediately.
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setExecuteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmArbitration}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate to Legal Modal */}
      {escalateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Gavel className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-headline font-bold text-base text-slate-900">
                Escalate Case {activeCase.caseNumber}?
              </h3>
              <p className="text-xs text-slate-600">
                Transfer docket to Safedeal Senior Legal & Compliance Counsel. Case SLA will be extended by 48 hours for formal merchant review.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setEscalateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEscalateModalOpen(false);
                  showToast(`Case ${activeCase.caseNumber} escalated to Legal Counsel.`);
                }}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-xs cursor-pointer"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
