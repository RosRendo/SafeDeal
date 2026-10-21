"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SellerHeader from "@/components/navigation/SellerHeader";
import {
  ShieldCheck,
  Shield,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Wallet,
  Clock,
  TrendingUp,
  CheckCircle2,
  CreditCard,
  Settings,
  Download,
  FileText,
  Search,
  Filter,
  Timer,
  AlertCircle,
  Zap,
  Star,
  Plus,
  Bell,
  User,
  X,
  Copy,
  ExternalLink,
  Check,
  Building,
  Percent,
  RefreshCw,
  SlidersHorizontal,
  Lock,
} from "lucide-react";

interface LedgerEntry {
  id: string;
  date: string;
  time: string;
  reference: string;
  refType: string;
  asset: string;
  buyer: string;
  gross: number;
  fee: number;
  feeLabel: string;
  net: number;
  status: "In Escrow" | "Cleared & Available" | "Paid Out" | "Dispute Hold";
  escrowTimeLeft?: string;
  category: "account" | "key" | "currency" | "transfer";
}

export default function EarningsAndPayoutsPage() {
  const router = useRouter();

  // Financial Stats (computed live from orders and payouts database)
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [pendingEscrow, setPendingEscrow] = useState<number>(0);
  const [disputeHold, setDisputeHold] = useState<number>(0);
  const [volume30d, setVolume30d] = useState<number>(0);
  const [lifetimePayouts, setLifetimePayouts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<"all" | "cleared" | "escrow" | "payouts">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [selectedType, setSelectedType] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Interactivity
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("0.00");
  const [withdrawMethod, setWithdrawMethod] = useState<"stripe" | "wire" | "crypto">("stripe");
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<LedgerEntry | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Transaction Ledger Data (dynamically loaded from live API)
  const [transactions, setTransactions] = useState<LedgerEntry[]>([]);

  // Fetch live earnings and real transaction ledger from API
  const loadEarnings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/seller/earnings");
      const json = await res.json();
      if (json.success && json.summary) {
        setAvailableBalance(json.summary.availableBalance ?? 0);
        setPendingEscrow(json.summary.pendingEscrow ?? 0);
        setDisputeHold(json.summary.disputeHold ?? 0);
        setVolume30d(json.summary.volume30d ?? 0);
        setLifetimePayouts(json.summary.lifetimePayouts ?? 0);
        setWithdrawAmount((json.summary.availableBalance ?? 0).toFixed(2));

        if (json.summary.ledger && Array.isArray(json.summary.ledger)) {
          setTransactions(json.summary.ledger);
        } else {
          setTransactions([]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch live earnings:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  // Tab & Search Filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Tab filter
      if (activeTab === "cleared" && t.status !== "Cleared & Available") return false;
      if (activeTab === "escrow" && t.status !== "In Escrow") return false;
      if (activeTab === "payouts" && t.status !== "Paid Out") return false;

      // Type filter
      if (selectedType === "Account Sales" && t.category !== "account") return false;
      if (selectedType === "Game Keys" && t.category !== "key") return false;
      if (selectedType === "Virtual Currencies" && t.category !== "currency") return false;
      if (selectedType === "Bank Transfers" && t.category !== "transfer") return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRef = t.reference.toLowerCase().includes(q);
        const matchAsset = t.asset.toLowerCase().includes(q);
        const matchBuyer = t.buyer.toLowerCase().includes(q);
        if (!matchRef && !matchAsset && !matchBuyer) return false;
      }

      return true;
    });
  }, [transactions, activeTab, selectedType, searchQuery]);

  // Tab counts
  const countAll = transactions.length;
  const countCleared = transactions.filter((t) => t.status === "Cleared & Available").length;
  const countEscrow = transactions.filter((t) => t.status === "In Escrow").length;
  const countPayouts = transactions.filter((t) => t.status === "Paid Out").length;

  // CSV Export
  const handleExportCSV = () => {
    const headers = "Date,Time,Reference,Type,Asset,Buyer,GrossAmount,Fee,NetPayout,Status\n";
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.date}","${t.time}","${t.reference}","${t.refType}","${t.asset}","${t.buyer}",${t.gross},${t.fee},${t.net},"${t.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `safedeal-earnings-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast("Downloaded Financial Ledger CSV report.");
  };

  // Tax Summary Download
  const handleDownloadTax = () => {
    showToast("Generating official 2024 IRS Form 1099-K & Tax Reconciliation statement...");
    setTimeout(() => {
      const content = `SAFEDEAL MERCHANT 1099-K TAX SUMMARY (TAX YEAR 2024)\nMerchant: AeroGamingDeals (Alex V.)\nTax ID: XX-XXX8841\nGross Transactions: $42,390.00 USD\nSafedeal Platform Fees Deducted: $2,119.50 USD\nNet Disbursed Settlements: $40,270.50 USD\nIRS Form Status: Electronically Filed via Stripe Treasury`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Safedeal-1099K-Summary-2024.txt`;
      a.click();
    }, 600);
  };

  // Immediate Payout Execution
  const handleExecutePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > availableBalance) {
      showToast("Invalid payout amount entered. Must be between $0.01 and available balance.");
      return;
    }

    setIsProcessingPayout(true);
    try {
      const res = await fetch("/api/seller/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          method: withdrawMethod,
          destination: withdrawMethod === "stripe" ? "Chase •••• 4892" : withdrawMethod === "crypto" ? "USDC TRC20" : "Wire Transfer",
        }),
      });

      const data = await res.json();
      if (data.success && data.summary) {
        setAvailableBalance(data.summary.availableBalance ?? 0);
        setPendingEscrow(data.summary.pendingEscrow ?? 0);
        setDisputeHold(data.summary.disputeHold ?? 0);
        setVolume30d(data.summary.volume30d ?? 0);
        setLifetimePayouts(data.summary.lifetimePayouts ?? 0);
        setWithdrawAmount((data.summary.availableBalance ?? 0).toFixed(2));
        if (data.summary.ledger) {
          setTransactions(data.summary.ledger);
        }
        setIsWithdrawModalOpen(false);
        showToast(data.message || `Instant payout for $${amt.toFixed(2)} USD dispatched!`);
      } else {
        showToast(data.error || "Failed to process payout.");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to communicate with payout treasury.");
    } finally {
      setIsProcessingPayout(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--ds-navy-2)] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold border border-blue-500/30 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Seller Hub Header */}
      <SellerHeader activeTab="earnings" />

      {/* Main Container */}
      <main className="w-full pt-16 bg-[var(--ds-surface)] min-h-screen pb-16">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
          {/* Header Section with Breadcrumb, Title & Global Ledger Actions */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1">
              <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Link href="/seller" className="hover:text-[var(--cobalt-acc)] cursor-pointer transition-colors">
                  Merchant Hub
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-bold">Finance & Settlement</span>
              </nav>
              <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Earnings & Payouts
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Track available merchant balances, pending escrow disbursements, automated fee statements, and payout history with real-time settlement transparency.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 lg:pt-0">
              <button
                onClick={handleDownloadTax}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                type="button"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download Tax / 1099-K Summary</span>
              </button>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--cobalt-acc)] text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                id="instant-payout-btn"
                type="button"
              >
                <Zap className="w-4 h-4" />
                <span>Request Immediate Payout</span>
              </button>
            </div>
          </div>

          {/* Top Financial Metric Cards (4 High-Level Stat Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Stat 1: Available for Payout */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Available for Payout</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[var(--cobalt-acc)]">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">
                  ${availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                  <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
                <p className="text-xs text-slate-500">Cleared escrow, ready for instant bank transfer</p>
              </div>
              <div className="pt-4 mt-2">
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                  type="button"
                >
                  <span>Withdraw Funds</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stat 2: Pending Escrow Settlement */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Pending Escrow Settlement</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[var(--cobalt-acc)]">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">
                  ${pendingEscrow.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                  <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
                <p className="text-xs text-slate-500">4 active orders under 48h buyer inspection SLA</p>
              </div>
              <div className="pt-4 mt-2">
                <button
                  onClick={() => setActiveTab("escrow")}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 text-[var(--cobalt-acc)] font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100"
                  type="button"
                >
                  <span>View Locked Escrows</span>
                  <Timer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stat 3: 30-Day Total Volume */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">30-Day Total Volume</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[var(--cobalt-acc)]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">
                  ${volume30d.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                  <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +18.4%
                  </span>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>
              <div className="pt-4 mt-2">
                {/* Sparkline representation of 30-day velocity */}
                <div className="h-6 w-full flex items-end gap-1 px-1">
                  <div className="flex-1 bg-slate-200 rounded-t h-[40%] hover:bg-[var(--cobalt-acc)] transition-all" title="Day 1: $620" />
                  <div className="flex-1 bg-slate-200 rounded-t h-[55%] hover:bg-[var(--cobalt-acc)] transition-all" title="Day 5: $840" />
                  <div className="flex-1 bg-slate-200 rounded-t h-[35%] hover:bg-[var(--cobalt-acc)] transition-all" title="Day 10: $490" />
                  <div className="flex-1 bg-slate-200 rounded-t h-[70%] hover:bg-[var(--cobalt-acc)] transition-all" title="Day 15: $1,120" />
                  <div className="flex-1 bg-slate-200 rounded-t h-[65%] hover:bg-[var(--cobalt-acc)] transition-all" title="Day 20: $1,050" />
                  <div className="flex-1 bg-blue-200 rounded-t h-[80%] hover:bg-[var(--cobalt-acc)] transition-all" title="Day 25: $1,340" />
                  <div className="flex-1 bg-[var(--cobalt-acc)] rounded-t h-[95%] hover:bg-blue-700 transition-all" title="Today: $1,680" />
                </div>
              </div>
            </div>

            {/* Stat 4: Lifetime Payouts */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Lifetime Payouts</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-[var(--cobalt-acc)]" />
                  </div>
                </div>
                <div className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">
                  ${lifetimePayouts.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                  <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
                <p className="text-xs text-slate-500">128 total successful payouts to Stripe Express</p>
              </div>
              <div className="pt-4 mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Escrow Disputed Ratio:</span>
                <span className="font-bold text-slate-900">0.08%</span>
              </div>
            </div>
          </div>

          {/* Payout Destination Banner (Stripe Express KYC Status) */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[var(--cobalt-acc)] shrink-0 border border-blue-100">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-headline text-base font-bold text-slate-900">
                    Stripe Express Direct Deposit
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-bold flex items-center gap-1 border border-blue-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--cobalt-acc)] animate-pulse" />
                    Active & Verified
                  </span>
                </div>
                <p className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Checking •••• 4892 (Chase Bank N.A.)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-900 font-semibold">
                    Daily Automated Dispatch (Next run: Today at 5:00 PM UTC)
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <button
                onClick={() => setIsBankModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                type="button"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span>Manage Bank Account / KYC</span>
              </button>
            </div>
          </div>

          {/* Ledger & Transactions Component Container */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
            {/* Navigation Tabs & Ledger Controls */}
            <div className="p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" id="filter-tabs">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === "all"
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                    type="button"
                  >
                    All Transactions ({countAll})
                  </button>
                  <button
                    onClick={() => setActiveTab("cleared")}
                    className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === "cleared"
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                    type="button"
                  >
                    Cleared & Available ({countCleared})
                  </button>
                  <button
                    onClick={() => setActiveTab("escrow")}
                    className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === "escrow"
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                    type="button"
                  >
                    In Escrow Hold ({countEscrow})
                  </button>
                  <button
                    onClick={() => setActiveTab("payouts")}
                    className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === "payouts"
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                    type="button"
                  >
                    Completed Payouts ({countPayouts})
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    type="button"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Search & Parametric Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-6 lg:col-span-7 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)]/30 transition-all bg-white"
                    placeholder="Search by Order ID (#SF-...), customer handle, or payout ID..."
                    type="text"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3 lg:col-span-3">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)]/30 cursor-pointer bg-white"
                  >
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="This Quarter (Q4 2024)">This Quarter (Q4 2024)</option>
                    <option value="Year to Date (2024)">Year to Date (2024)</option>
                    <option value="Custom Date Range">Custom Date Range</option>
                  </select>
                </div>

                <div className="sm:col-span-3 lg:col-span-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)]/30 cursor-pointer bg-white"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Account Sales">Account Sales</option>
                    <option value="Game Keys">Game Keys</option>
                    <option value="Virtual Currencies">Virtual Currencies</option>
                    <option value="Bank Transfers">Bank Transfers</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ledger Table (Fluid Desktop Layout) */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-5" scope="col">Date & Time</th>
                    <th className="py-3 px-5" scope="col">Reference</th>
                    <th className="py-3 px-5" scope="col">Asset / Description</th>
                    <th className="py-3 px-5 text-right" scope="col">Gross Amount</th>
                    <th className="py-3 px-5 text-right" scope="col">Fee Breakdown</th>
                    <th className="py-3 px-5 text-right" scope="col">Net Payout</th>
                    <th className="py-3 px-5 text-center" scope="col">Escrow Status</th>
                    <th className="py-3 px-5 text-right" scope="col">Action / Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => setSelectedReceipt(tx)}
                    >
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{tx.date}</div>
                        <div className="text-[12px] text-slate-400">{tx.time}</div>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-[var(--cobalt-acc)] group-hover:underline">
                          {tx.reference}
                        </div>
                        <div className="text-[12px] text-slate-400">{tx.refType}</div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 max-w-xs truncate">{tx.asset}</div>
                        <div className="text-[12px] text-slate-500 flex items-center gap-1">
                          <span>Buyer:</span>
                          <span className="text-slate-800 font-medium">{tx.buyer}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-right font-bold whitespace-nowrap">
                        {tx.gross < 0 ? (
                          <span className="text-slate-400">
                            -${Math.abs(tx.gross).toFixed(2)}
                          </span>
                        ) : (
                          `$${tx.gross.toFixed(2)}`
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right text-[12px] whitespace-nowrap">
                        <div className={tx.fee > 0 ? "text-rose-600 font-semibold" : "text-slate-400"}>
                          {tx.fee > 0 ? `-$${tx.fee.toFixed(2)}` : "$0.00"}
                        </div>
                        <div className="text-slate-400 text-[11px]">{tx.feeLabel}</div>
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span
                          className={`font-headline text-sm font-extrabold ${
                            tx.status === "Paid Out"
                              ? "text-slate-900"
                              : tx.status === "Dispute Hold"
                              ? "text-slate-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {tx.net < 0
                            ? `-$${Math.abs(tx.net).toFixed(2)}`
                            : `+$${tx.net.toFixed(2)}`}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        {tx.status === "In Escrow" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200/60">
                            <Timer className="w-3 h-3 text-amber-600" />
                            <span>In Escrow ({tx.escrowTimeLeft})</span>
                          </span>
                        )}
                        {tx.status === "Cleared & Available" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Cleared & Available</span>
                          </span>
                        )}
                        {tx.status === "Paid Out" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-bold border border-blue-200/60">
                            <Check className="w-3 h-3 text-[var(--cobalt-acc)]" />
                            <span>Paid Out</span>
                          </span>
                        )}
                        {tx.status === "Dispute Hold" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200/60">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Dispute Hold (Frozen)</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {tx.status === "In Escrow" && (
                          <button
                            onClick={() => setSelectedReceipt(tx)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[var(--cobalt-acc)] font-bold text-[12px] transition-colors cursor-pointer"
                            type="button"
                          >
                            View Order
                          </button>
                        )}
                        {tx.status === "Cleared & Available" && (
                          <button
                            onClick={() => setSelectedReceipt(tx)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[12px] transition-colors cursor-pointer"
                            type="button"
                          >
                            Receipt
                          </button>
                        )}
                        {tx.status === "Paid Out" && (
                          <button
                            onClick={() => setSelectedReceipt(tx)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[var(--cobalt-acc)] font-bold text-[12px] transition-colors cursor-pointer"
                            type="button"
                          >
                            Stripe Ref
                          </button>
                        )}
                        {tx.status === "Dispute Hold" && (
                          <button
                            onClick={() => {
                              showToast("Routing to Trust & Safety dispute resolution desk...");
                              router.push("/admin/disputes");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[12px] transition-colors cursor-pointer"
                            type="button"
                          >
                            Case Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No transactions found matching your search and filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Micro Summary */}
            <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-900">{filteredTransactions.length === 0 ? 0 : 1} - {filteredTransactions.length}</span> of{" "}
                <span className="font-bold text-slate-900">{filteredTransactions.length}</span> transactions (Total Ledger Value:{" "}
                <span className="font-bold text-slate-900">
                  ${filteredTransactions
                    .reduce((acc, t) => acc + (t.gross > 0 ? t.gross : 0), 0)
                    .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  USD
                </span>)
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-300 cursor-not-allowed"
                  type="button"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  className="px-3 py-1 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs"
                  type="button"
                >
                  1
                </button>
                <button
                  onClick={() => showToast("Loaded page 2 ledger archive.")}
                  className="px-3 py-1 rounded-lg hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  type="button"
                >
                  2
                </button>
                <button
                  onClick={() => showToast("Loaded page 3 ledger archive.")}
                  className="px-3 py-1 rounded-lg hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  type="button"
                >
                  3
                </button>
                <button
                  onClick={() => showToast("Loaded next page.")}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  type="button"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Institutional Safety & Settlement Policy Card */}
          <div className="bg-slate-100/70 p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-[var(--cobalt-acc)]">
              <ShieldCheck className="w-5 h-5 text-[var(--cobalt-acc)]" />
              <h3 className="font-headline font-bold text-base text-slate-900">
                Safedeal Merchant Settlement Terms & Escrow Guarantee
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-700" />
                  <h4 className="font-bold text-xs text-slate-900">
                    48-Hour Buyer Inspection SLA
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All digital asset and credential sales enter a mandatory 48-hour escrow lock. Funds disburse instantly once the buyer explicitly confirms delivery or upon SLA expiration without reported incident.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs text-slate-900">
                    Full Chargeback Defense
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Transactions completed through Safedeal Bot-Vault or verified API keys are backed by our 100% Zero-Liability Chargeback Guarantee. Fraudulent bank disputes are absorbed entirely by Safedeal Treasury.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[var(--cobalt-acc)]" />
                  <h4 className="font-bold text-xs text-slate-900">
                    Volume Tiered Fees
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Standard platform commission is 5.0%. Maintain 30-day sales volume above $10,000 USD and an order dispute rate under 0.5% to unlock Elite Merchant status with reduced 3.5% automated processing rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Immediate Payout / Withdraw Funds Modal */}
      {isWithdrawModalOpen && (
        <div
          onClick={() => setIsWithdrawModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-5 border border-slate-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center border border-blue-100">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-slate-900">
                    Request Immediate Payout
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fast-track escrow clearance directly to your verified bank instrument.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePayout} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-700">Withdrawal Amount (USD)</span>
                  <span className="text-slate-500">
                    Available:{" "}
                    <strong className="text-emerald-600">
                      ${availableBalance.toFixed(2)}
                    </strong>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    max={availableBalance}
                    min="10"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-16 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs text-slate-700 block">Payout Destination</span>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    onClick={() => setWithdrawMethod("stripe")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      withdrawMethod === "stripe"
                        ? "border-[var(--cobalt-acc)] bg-blue-50/60 ring-2 ring-[var(--cobalt-acc)]/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[var(--cobalt-acc)]" />
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          Chase Bank N.A. (•••• 4892)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Stripe Express • Instant Dispatch (15-30m)
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      0% Fee
                    </span>
                  </label>

                  <label
                    onClick={() => setWithdrawMethod("crypto")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      withdrawMethod === "crypto"
                        ? "border-[var(--cobalt-acc)] bg-blue-50/60 ring-2 ring-[var(--cobalt-acc)]/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-amber-600" />
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          USDT / USDC (ERC-20 / TRC-20)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Automated Web3 Settlement to 0x71...8841
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      $1.50 Gas
                    </span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Gross Withdrawal:</span>
                  <span className="font-bold text-slate-900">${parseFloat(withdrawAmount || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span className="font-bold text-emerald-600">$0.00 (Tier Free)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                  <span>Net Expected Deposit:</span>
                  <span className="text-[var(--cobalt-acc)] text-sm">
                    ${parseFloat(withdrawAmount || "0").toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayout}
                  className="px-5 py-2.5 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  {isProcessingPayout ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching Payout...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Authorize & Dispatch Payout</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Receipt Modal */}
      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--cobalt-acc)]" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Escrow Transaction Receipt
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fulfillment Method:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.refType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Item:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.asset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer Handle:</span>
                <span className="font-medium text-slate-900">{selectedReceipt.buyer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">{selectedReceipt.date} • {selectedReceipt.time}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Price:</span>
                  <span className="font-bold text-slate-900">${Math.abs(selectedReceipt.gross).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Safedeal Fee ({selectedReceipt.feeLabel}):</span>
                  <span className="font-bold text-rose-600">-${selectedReceipt.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Net Settled:</span>
                  <span className="text-[var(--cobalt-acc)]">${selectedReceipt.net.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[12px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Cryptographically Signed by Safedeal Escrow
              </span>
            </div>

            <button
              onClick={() => {
                showToast("Printing / saving transaction receipt as PDF...");
                setSelectedReceipt(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Download PDF Receipt
            </button>
          </div>
        </div>
      )}

      {/* Manage Bank / KYC Modal */}
      {isBankModalOpen && (
        <div
          onClick={() => setIsBankModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[var(--cobalt-acc)]" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Stripe Express Payout Instrument & KYC
                </h3>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Chase Bank N.A.</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                    VERIFIED
                  </span>
                </div>
                <div className="text-slate-500 space-y-0.5">
                  <p>Routing: ••••• 0021</p>
                  <p>Account: •••••••• 4892 (Checking)</p>
                  <p>Beneficiary: Alex V. / AeroGamingDeals LLC</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Identity & Tax Information</span>
                <p className="text-slate-500">SSN / EIN: Verified on Oct 14, 2024</p>
                <p className="text-slate-500">1099-K Status: Paperless e-delivery enrolled</p>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/70 space-y-1">
                <span className="font-bold text-[var(--cobalt-acc)] block">Automated Dispatch Schedule</span>
                <p className="text-slate-600">
                  Payouts trigger daily at 5:00 PM UTC whenever cleared balance exceeds $25.00 USD.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast("Redirecting to Stripe Express secure verification portal...");
                  setIsBankModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
              >
                Update on Stripe Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-white shadow-xs border-t border-slate-200/80 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--cobalt-acc)] flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-headline font-bold text-lg text-slate-900">
                  Safedeal
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-bold uppercase">
                  Seller Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                High-velocity, bank-grade marketplace infrastructure for verified digital goods sellers, key distributors, and virtual currency merchants.
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Safedeal Shield Protected</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant API Fulfillment</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Seller Policies
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Seller Protection Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Merchant Guidelines
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Prohibited Items & Assets
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Verification Standard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Operations & Finance
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Fee Schedules & Tiers
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/seller/earnings">
                    Payout Timelines
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/seller/earnings">
                    Tax & Invoice Center
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Escrow Security Protocol
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Seller Support
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/admin/disputes">
                    Dispute Resolution Desk
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/help">
                    Seller Knowledge Base
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/protection">
                    Chargeback Defense
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[var(--cobalt-acc)] transition-colors" href="/messages">
                    24/7 Merchant Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Safedeal Global Ltd. All rights reserved. Encrypted escrow marketplace.</p>
            <div className="flex items-center gap-4">
              <Link className="hover:text-slate-900 transition-colors" href="/terms">
                Terms of Service
              </Link>
              <Link className="hover:text-slate-900 transition-colors" href="/privacy">
                Privacy Policy
              </Link>
              <Link className="hover:text-slate-900 transition-colors" href="/protection">
                Security Overview
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
