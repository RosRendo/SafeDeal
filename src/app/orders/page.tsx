"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/navigation/Header";
import { apiGetOrders, apiUpdateOrderStatus } from "@/lib/apiClient";
import {
  ShieldCheck,
  Shield,
  Zap,
  Clock,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Star,
  Download,
  Search,
  Filter,
  Receipt,
  Hourglass,
  Eye,
  Key,
  Check,
  X,
  Copy,
  RotateCcw,
  Sparkles,
  Headphones,
  ExternalLink,
  MessageSquare,
  FileText,
  HelpCircle,
  FolderLock,
  Archive,
} from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber: string;
  itemTitle: string;
  image: string;
  tag: string;
  category: "accounts" | "keys" | "currency" | "licenses";
  date: string;
  timestamp: string;
  deliveryType: string;
  price: number;
  sellerName: string;
  sellerLevel?: string;
  sellerRating: number;
  sellerSales: string;
  status: "active" | "delivered" | "warranty" | "disputed";
  statusText: string;
  warrantyLeft?: string;
  escrowTimeRemaining?: string;
  decryptedKey?: string;
  credentials?: {
    login: string;
    email: string;
    pass: string;
    pin: string;
  };
  disputeCaseId?: string;
  disputeResolutionNote?: string;
}

export default function MyPurchasesPage() {
  const router = useRouter();

  // Active filter tab
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "delivered" | "warranty" | "disputed"
  >("all");

  // Search & Select Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("last-6-months");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Real-time Ticking Countdown Timer for Order #SF-2024-88492
  const [timerSeconds, setTimerSeconds] = useState(48);
  const [timerMinutes, setTimerMinutes] = useState(11);
  const [timerHours, setTimerHours] = useState(37);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prevSec) => {
        if (prevSec > 0) return prevSec - 1;
        setTimerMinutes((prevMin) => {
          if (prevMin > 0) return prevMin - 1;
          setTimerHours((prevH) => (prevH > 0 ? prevH - 1 : 0));
          return 59;
        });
        return 59;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Modals & Interactivity State
  const [selectedVaultOrder, setSelectedVaultOrder] = useState<OrderItem | null>(null);
  const [isVaultDecrypted, setIsVaultDecrypted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [selectedKeyOrder, setSelectedKeyOrder] = useState<OrderItem | null>(null);
  const [confirmReleaseOrder, setConfirmReleaseOrder] = useState<OrderItem | null>(null);
  const [disputeOrder, setDisputeOrder] = useState<OrderItem | null>(null);
  const [disputeReason, setDisputeReason] = useState("Invalid Credentials / 2FA Locked");
  const [disputeNote, setDisputeNote] = useState("");

  const [warrantyOrder, setWarrantyOrder] = useState<OrderItem | null>(null);
  const [caseFileOrder, setCaseFileOrder] = useState<OrderItem | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Orders Dataset (loaded dynamically from database API)
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === "active" && order.status !== "active") return false;
      if (activeTab === "delivered" && order.status !== "delivered") return false;
      if (activeTab === "warranty" && order.status !== "warranty") return false;
      if (activeTab === "disputed" && order.status !== "disputed") return false;

      // Category filter
      if (categoryFilter !== "all" && order.category !== categoryFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = order.itemTitle.toLowerCase().includes(q);
        const matchSeller = order.sellerName.toLowerCase().includes(q);
        const matchNum = order.orderNumber.toLowerCase().includes(q);
        const matchTag = order.tag?.toLowerCase().includes(q) || false;
        const matchCat = order.category?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchSeller && !matchNum && !matchTag && !matchCat) return false;
      }

      return true;
    });
  }, [orders, activeTab, categoryFilter, searchQuery]);

  // Load orders from API with fallback
  useEffect(() => {
    let active = true;
    apiGetOrders("buyer").then((data) => {
      if (active && data && data.length > 0) {
        setOrders(data as any);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Handle Release Confirm
  const handleReleaseEscrow = (orderId: string) => {
    apiUpdateOrderStatus(orderId, "release");
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "delivered",
              statusText: "Delivered & Funds Released",
            }
          : o
      )
    );
    setConfirmReleaseOrder(null);
    showToast("Escrow funds released to AeroGamingDeals! Order marked completed.");
  };

  // Handle Open Dispute
  const handleConfirmDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrder) return;

    apiUpdateOrderStatus(disputeOrder.id, "dispute", `${disputeReason} - ${disputeNote}`);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === disputeOrder.id
          ? {
              ...o,
              status: "disputed",
              statusText: "Escrow Frozen • Arbitrating",
              disputeCaseId: `#CS-${Math.floor(1000 + Math.random() * 9000)}`,
              disputeResolutionNote: `Dispute opened for reason: ${disputeReason}. Safedeal Trust & Safety lead assigned.`,
            }
          : o
      )
    );
    setDisputeOrder(null);
    showToast("Escrow payment frozen. Dispute case dispatched to Safedeal Arbitration Lead.");
  };

  // Download All Tax Receipts
  const handleDownloadAllReceipts = () => {
    showToast("Generating comprehensive purchase statement & tax receipts...");
    setTimeout(() => {
      const summary = `SAFEDEAL BUYER TRANSACTION SUMMARY & TAX INVOICES (2024)\nAccount: Alex V. (Verified Consumer)\nTotal Purchases: 14 Orders ($1,280.40 USD)\nSafedeal Escrow Shielded: 100%\nZero-Liability Protection Active\nDownloaded on: ${new Date().toLocaleDateString()}`;
      const blob = new Blob([summary], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Safedeal-Purchase-Receipts-2024.txt`;
      a.click();
    }, 600);
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--ds-navy)] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold border border-blue-500/30 animate-in fade-in slide-in-from-bottom-2">
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

      {/* Global Unified Header */}
      <Header
        activeCategory="all"
        onSelectCategory={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProtectionModal={() => router.push("/protection")}
        wishlistCount={0}
      />

      {/* Main Content Area */}
      <main className="w-full pt-[104px] sm:pt-[108px] bg-[var(--ds-surface)] min-h-screen">
        <section className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-6 pb-16">
          {/* Breadcrumb & Top Utility Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
              <Link href="/" className="hover:text-slate-800 transition-colors">
                Account
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[var(--cobalt-acc)] font-bold">My Purchases & Orders</span>
            </nav>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadAllReceipts}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 transition-colors text-slate-800 text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--cobalt-acc)]" />
                <span>Download All Tax Receipts</span>
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--cobalt-acc)] text-white shadow-xs hover:bg-blue-700 transition-colors text-xs font-bold cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>1 Active Escrow</span>
              </button>
            </div>
          </div>

          {/* Header Block */}
          <div className="mb-6">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Purchases & Digital Orders
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[12px] font-bold border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-[var(--cobalt-acc)] animate-pulse" />
                REAL-TIME ESCROW SYNCED
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-3xl mt-1.5 leading-relaxed">
              Track your 48-hour escrow inspection SLA, inspect account credentials safely in your personal vault, download official transaction receipts, and manage active warranties.
            </p>
          </div>

          {/* 4 Compact Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Metric 1: Active Escrow */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Hourglass className="w-6 h-6 text-[var(--cobalt-acc)]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active Escrow
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline text-2xl font-extrabold text-[var(--cobalt-acc)]">
                    {orders.filter((o) => o.status === "active").length} Orders
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Inspection SLA
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>{orders.find((o) => o.status === "active") ? orders.find((o) => o.status === "active")?.orderNumber : "No Active Orders"}</span>
                <span className="font-bold text-[var(--cobalt-acc)]">{timerHours}h {timerMinutes}m left</span>
              </div>
            </div>

            {/* Metric 2: Total Completed */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Completed
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline text-2xl font-extrabold text-slate-900">
                    {orders.filter((o) => o.status === "delivered" || o.status === "warranty").length} Orders
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    100% Fulfilled
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Total Volume</span>
                <span className="font-headline font-bold text-slate-900">
                  ${orders
                    .filter((o) => o.status === "delivered" || o.status === "warranty")
                    .reduce((sum, o) => sum + o.price, 0)
                    .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  USD
                </span>
              </div>
            </div>

            {/* Metric 3: Vault Storage */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Vault Storage
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline text-2xl font-extrabold text-slate-900">
                    {orders.filter((o) => !!o.credentials || !!o.decryptedKey).length} Assets
                  </span>
                  <span className="text-[11px] font-bold text-[var(--cobalt-acc)] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Keys & Logins
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Instant Decryption</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Secured
                </span>
              </div>
            </div>

            {/* Metric 4: Safedeal Escrow Shield */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Safedeal Escrow Shield
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline text-2xl font-extrabold text-emerald-600">
                    100% Protected
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Zero-Risk Guarantee</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Filter and Search Toolbar */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-200/80 mb-6 flex flex-col gap-3">
            {/* Horizontal Filter Tabs */}
            <div className="flex items-center overflow-x-auto gap-2 pb-1" id="order-tabs">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-[var(--ds-navy)] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
                type="button"
              >
                All Purchases ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "active"
                    ? "bg-[var(--ds-navy)] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
                type="button"
              >
                Active Escrow & Inspection ({orders.filter((o) => o.status === "active").length})
              </button>
              <button
                onClick={() => setActiveTab("delivered")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "delivered"
                    ? "bg-[var(--ds-navy)] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
                type="button"
              >
                Delivered & Completed ({orders.filter((o) => o.status === "delivered").length})
              </button>
              <button
                onClick={() => setActiveTab("warranty")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "warranty"
                    ? "bg-[var(--ds-navy)] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
                type="button"
              >
                Warranty Active ({orders.filter((o) => o.status === "warranty").length})
              </button>
              <button
                onClick={() => setActiveTab("disputed")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "disputed"
                    ? "bg-[var(--ds-navy)] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
                type="button"
              >
                Disputed / Refunded ({orders.filter((o) => o.status === "disputed").length})
              </button>
            </div>

            {/* Search & Select Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by game, product name, seller handle, or Order ID..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 rounded-xl outline-none text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[var(--cobalt-acc)]/30 border border-slate-200/80 transition-all"
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

              <div className="md:col-span-3">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-100 text-slate-900 rounded-xl outline-none cursor-pointer border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-[var(--cobalt-acc)]/30 font-semibold"
                >
                  <option value="last-6-months">Time: Last 6 Months</option>
                  <option value="2024">Time: Year 2024</option>
                  <option value="all-time">Time: All Time</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-100 text-slate-900 rounded-xl outline-none cursor-pointer border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-[var(--cobalt-acc)]/30 font-semibold"
                >
                  <option value="all">All Categories (Accounts, Keys, Currency)</option>
                  <option value="accounts">Gaming Accounts</option>
                  <option value="keys">Steam / Epic CDNs & Keys</option>
                  <option value="currency">In-Game Currency & Assets</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Feed */}
          <div className="space-y-4" id="orders-container">
            {filteredOrders.map((order) => {
              if (order.status === "active") {
                // CARD 1: ACTIVE ESCROW (Highest Visual Prominence)
                return (
                  <article
                    key={order.id}
                    className="bg-white rounded-2xl p-5 shadow-md border-2 border-[var(--cobalt-acc)]/30 relative overflow-hidden transition-all hover:shadow-lg"
                  >
                    {/* Live Alert Ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/80 px-4 py-2.5 rounded-xl mb-4 border border-blue-100">
                      <div className="flex items-center gap-3">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cobalt-acc)] opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--cobalt-acc)]" />
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[var(--cobalt-acc)]">
                            In 48h Inspection Window
                          </span>
                          <span className="text-[12px] text-slate-500 font-medium hidden sm:inline">
                            • Automated Bot Vault Handover Confirmed
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg shadow-xs border border-blue-100">
                        <Clock className="w-3.5 h-3.5 text-[var(--cobalt-acc)]" />
                        <span className="text-xs text-slate-900 font-mono font-bold tracking-tight">
                          {timerHours}h {timerMinutes}m {timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}s remaining
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Image and Info */}
                      <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200">
                          <img
                            src={order.image}
                            alt={order.itemTitle}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-bold text-slate-900 shadow-xs">
                            {order.tag}
                          </span>
                        </div>
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-400 mb-1">
                              <span className="font-mono text-slate-900 font-bold">
                                {order.orderNumber}
                              </span>
                              <span>•</span>
                              <span>{order.date}, {order.timestamp}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold inline-flex items-center gap-0.5">
                                <Zap className="w-3 h-3 text-emerald-600" /> {order.deliveryType}
                              </span>
                            </div>
                            <Link
                              href={`/orders/${order.orderNumber.replace('#', '')}`}
                              className="font-headline text-base font-bold text-slate-900 line-clamp-2 hover:text-[var(--cobalt-acc)] transition-colors"
                            >
                              {order.itemTitle}
                            </Link>
                          </div>

                          {/* Seller Micro-profile */}
                          <div className="flex flex-wrap items-center gap-4 mt-3 pt-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">Seller:</span>
                              <Link
                                href="/store/aerogamingdeals"
                                className="font-bold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                              >
                                <span>{order.sellerName}</span>
                                <span title="Level 3 Verified Merchant">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                </span>
                              </Link>
                              {order.sellerLevel && (
                                <span className="text-[11px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                  {order.sellerLevel}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-slate-600 text-xs">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="font-bold text-slate-900">{order.sellerRating}</span>
                              <span className="text-slate-400">({order.sellerSales})</span>
                            </div>
                            <Link
                              href={`/messages?orderId=${order.orderNumber.replace('#', '')}`}
                              className="text-[var(--cobalt-acc)] hover:underline text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Contact Seller</span>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Price & Buyer Action Box */}
                      <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                        <div>
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="text-xs text-slate-500 font-medium">Held in Escrow:</span>
                            <span className="font-headline text-2xl font-black text-slate-900">
                              ${order.price.toFixed(2)}{" "}
                              <span className="text-xs font-normal text-slate-400">USD</span>
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-500 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Stripe 3DS Escrow • Funds released upon your inspection confirmation
                          </p>
                        </div>

                        {/* Multi Actions */}
                        <div className="space-y-2 mt-4">
                          <button
                            onClick={() => {
                              setSelectedVaultOrder(order);
                              setIsVaultDecrypted(true);
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                          >
                            <Key className="w-4 h-4" />
                            <span>Inspect Credentials & Vault</span>
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setConfirmReleaseOrder(order)}
                              className="py-2 px-2 rounded-xl bg-white text-emerald-700 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-xs flex items-center justify-center gap-1 border border-emerald-200 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Confirm & Release</span>
                            </button>
                            <button
                              onClick={() => setDisputeOrder(order)}
                              className="py-2 px-2 rounded-xl bg-white text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors shadow-xs flex items-center justify-center gap-1 border border-rose-200 cursor-pointer"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Open Dispute</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Credential Quick-Peep / Security SLA Banner */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                      <div className="flex items-center gap-2 text-[12px]">
                        <span className="text-slate-600 font-medium">Auto-release schedule:</span>
                        <span className="text-slate-900 font-bold">Oct 26, 2024 at 2:14 PM UTC</span>
                        <span className="text-slate-400">(If no dispute is logged)</span>
                      </div>
                      <div className="flex items-center gap-3 font-semibold text-[12px]">
                        <Link href="/seller/earnings" className="text-[var(--cobalt-acc)] hover:underline">
                          View Transaction Ledger
                        </Link>
                        <Link
                          href="/help"
                          className="text-[var(--cobalt-acc)] hover:underline"
                        >
                          Escrow Rules FAQ
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              }

              if (order.status === "delivered") {
                // CARD 2: COMPLETED & DELIVERED
                return (
                  <article
                    key={order.id}
                    className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 transition-all hover:shadow-md"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200">
                          <img
                            src={order.image}
                            alt={order.itemTitle}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-bold text-slate-900 shadow-xs">
                            {order.tag}
                          </span>
                        </div>
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-400 mb-1">
                              <span className="font-mono text-slate-900 font-bold">
                                {order.orderNumber}
                              </span>
                              <span>•</span>
                              <span>{order.date}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                {order.statusText}
                              </span>
                            </div>
                            <h3 className="font-headline text-base font-bold text-slate-900 line-clamp-1 hover:text-[var(--cobalt-acc)] cursor-pointer transition-colors">
                              {order.itemTitle}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">Seller:</span>
                              <span className="font-bold text-slate-900">{order.sellerName}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                              ★ {order.sellerRating}{" "}
                              <span className="text-slate-400 font-normal">
                                ({order.sellerSales})
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              Delivery:{" "}
                              <span className="text-slate-900 font-semibold">
                                {order.deliveryType}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/60 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-400 font-medium">Price Paid:</span>
                          <span className="font-headline text-xl font-bold text-slate-900">
                            ${order.price.toFixed(2)}{" "}
                            <span className="text-xs font-normal text-slate-400">USD</span>
                          </span>
                        </div>
                        <div className="space-y-2 mt-3">
                          <button
                            onClick={() => setSelectedKeyOrder(order)}
                            className="w-full py-2 px-3 rounded-xl bg-blue-50 text-[var(--cobalt-acc)] font-bold text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-blue-100"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Digital Key (Decrypted)</span>
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() =>
                                showToast(`Downloading tax invoice for ${order.orderNumber}...`)
                              }
                              className="py-1.5 px-2 rounded-xl bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5 text-slate-500" />
                              <span>Invoice</span>
                            </button>
                            <button
                              onClick={() => showToast("Review already submitted (5★ Verified Purchase)")}
                              className="py-1.5 px-2 rounded-xl bg-white text-amber-500 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              <span>Rated 5★</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }

              if (order.status === "warranty") {
                // CARD 3: WARRANTY ACTIVE
                return (
                  <article
                    key={order.id}
                    className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 transition-all hover:shadow-md"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200">
                          <img
                            src={order.image}
                            alt={order.itemTitle}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-bold text-slate-900 shadow-xs">
                            {order.tag}
                          </span>
                        </div>
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-400 mb-1">
                              <span className="font-mono text-slate-900 font-bold">
                                {order.orderNumber}
                              </span>
                              <span>•</span>
                              <span>{order.date}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-extrabold border border-blue-100">
                                <Shield className="w-3 h-3 text-[var(--cobalt-acc)]" />
                                6-Month Warranty Active ({order.warrantyLeft})
                              </span>
                            </div>
                            <h3 className="font-headline text-base font-bold text-slate-900 line-clamp-1 hover:text-[var(--cobalt-acc)] cursor-pointer transition-colors">
                              {order.itemTitle}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">Seller:</span>
                              <span className="font-bold text-slate-900">{order.sellerName}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                              ★ {order.sellerRating}{" "}
                              <span className="text-slate-400 font-normal">
                                ({order.sellerSales})
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Protection:{" "}
                              <span className="text-[var(--cobalt-acc)] font-bold">
                                Safedeal Vault Replacement Guard
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/60 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-400 font-medium">Price Paid:</span>
                          <span className="font-headline text-xl font-bold text-slate-900">
                            ${order.price.toFixed(2)}{" "}
                            <span className="text-xs font-normal text-slate-400">USD</span>
                          </span>
                        </div>
                        <div className="space-y-2 mt-3">
                          <button
                            onClick={() => setWarrantyOrder(order)}
                            className="w-full py-2 px-3 rounded-xl bg-white text-[var(--cobalt-acc)] font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center gap-1.5 border border-blue-200 cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-[var(--cobalt-acc)]" />
                            <span>Claim Warranty Service</span>
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedKeyOrder(order)}
                              className="py-1.5 px-2 rounded-xl bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Receipt</span>
                            </button>
                            <Link
                              href="/browse"
                              className="py-1.5 px-2 rounded-xl bg-white text-[var(--cobalt-acc)] font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center gap-1 border border-slate-200 text-center"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Buy Again</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }

              if (order.status === "disputed") {
                // CARD 4: RESOLVED DISPUTE / REFUNDED
                return (
                  <article
                    key={order.id}
                    className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 transition-all hover:shadow-md opacity-95"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200">
                          <img
                            src={order.image}
                            alt={order.itemTitle}
                            className="w-full h-full object-cover grayscale contrast-75"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-bold text-slate-500 shadow-xs">
                            {order.tag}
                          </span>
                        </div>
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-400 mb-1">
                              <span className="font-mono text-slate-900 font-bold">
                                {order.orderNumber}
                              </span>
                              <span>•</span>
                              <span>{order.date}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-100">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {order.statusText}
                              </span>
                            </div>
                            <h3 className="font-headline text-base font-bold text-slate-900 line-clamp-1">
                              {order.itemTitle}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">Merchant:</span>
                              <span className="font-bold text-slate-900">{order.sellerName}</span>
                            </div>
                            <div className="text-xs text-emerald-700 font-semibold">
                              Dispute Case {order.disputeCaseId} Resolved in 14m by Safedeal Concierge
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/60 rounded-2xl p-4 border border-slate-100">
                        <div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-slate-400 font-medium">Reversed to Card:</span>
                            <span className="font-headline text-xl font-bold line-through text-slate-400">
                              ${order.price.toFixed(2)}{" "}
                              <span className="text-xs font-normal">USD</span>
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-500 mt-1">
                            Refund processed to Visa ending in{" "}
                            <span className="font-mono font-bold text-slate-900">4242</span>
                          </p>
                        </div>
                        <div className="space-y-2 mt-3">
                          <button
                            onClick={() => setCaseFileOrder(order)}
                            className="w-full py-2 px-3 rounded-xl bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                          >
                            <FolderLock className="w-4 h-4 text-[var(--cobalt-acc)]" />
                            <span>View Arbitrated Case File</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }

              return null;
            })}

            {filteredOrders.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-900 text-sm">No purchases found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search keywords or switching filter tabs.
                </p>
              </div>
            )}
          </div>

          {/* Pagination / Activity Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-900">{filteredOrders.length === 0 ? "0" : `1 - ${filteredOrders.length}`}</span> of{" "}
              <span className="font-bold text-slate-900">{filteredOrders.length}</span> recorded marketplace purchases
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-3.5 py-1.5 rounded-xl bg-[var(--cobalt-acc)] text-white font-bold text-xs">
                1
              </button>
              <button
                onClick={() => showToast("Loaded page 2 of purchases.")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                2
              </button>
              <button
                onClick={() => showToast("Loaded next page.")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          {/* Safedeal Buyer Guarantee Detailed Trust Banner */}
          <div className="mt-10 bg-gradient-to-r from-blue-50/70 via-slate-50 to-emerald-50/50 rounded-3xl p-6 md:p-8 border border-blue-100/80 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2.5 mb-2">
                  <ShieldCheck className="w-7 h-7 text-[var(--cobalt-acc)]" />
                  <h2 className="font-headline text-xl font-bold text-slate-900 tracking-tight">
                    Safedeal 100% Buyer Protection Protocol
                  </h2>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every transaction is locked in military-grade smart escrow. Funds are never released to sellers until you inspect credentials or your 48-hour inspection timer expires without issue.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">48-Hour Inspection</h4>
                      <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                        Full SLA window to verify credentials, logins, and key status.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <RotateCcw className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Zero-Risk Replacement</h4>
                      <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                        Instant replacement or full refund if digital items are non-functioning.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Headphones className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">24/7 Human Arbitration</h4>
                      <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                        Real disputes answered by certified escrow specialists in under 15 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-2.5 w-full lg:w-auto">
                <button
                  onClick={() =>
                    showToast("Opening Official Safedeal Buyer Escrow Terms & Protocol...")
                  }
                  className="px-6 py-3 rounded-xl bg-[var(--cobalt-acc)] text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Read Buyer Escrow Terms</span>
                </button>
                <button
                  onClick={() =>
                    showToast("Connecting to certified Escrow Dispute Arbitrator...")
                  }
                  className="text-center font-bold text-xs text-[var(--cobalt-acc)] hover:underline cursor-pointer"
                >
                  Contact 24/7 Escrow Support
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL 1: Credential Inspection Vault */}
      {selectedVaultOrder && selectedVaultOrder.credentials && (
        <div
          onClick={() => setSelectedVaultOrder(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900">
                    Encrypted Credential Vault
                  </h3>
                  <span className="text-[12px] text-slate-500 font-mono">
                    {selectedVaultOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVaultOrder(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Decrypted via Safedeal End-to-End Key Exchange. Test login before confirming release.
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Game Client Username / Login
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">
                    {selectedVaultOrder.credentials.login}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(selectedVaultOrder.credentials!.login, "Username")
                    }
                    className="p-1 text-slate-400 hover:text-[var(--cobalt-acc)] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Original Email Address (OGE)
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">
                    {selectedVaultOrder.credentials.email}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(selectedVaultOrder.credentials!.email, "Email")
                    }
                    className="p-1 text-slate-400 hover:text-[var(--cobalt-acc)] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Primary Account Password
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">
                    {showPassword
                      ? selectedVaultOrder.credentials.pass
                      : "••••••••••••••••••••"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopy(selectedVaultOrder.credentials!.pass, "Password")
                      }
                      className="p-1 text-slate-400 hover:text-[var(--cobalt-acc)] cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedVaultOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close Vault
              </button>
              <button
                onClick={() => {
                  setSelectedVaultOrder(null);
                  setConfirmReleaseOrder(selectedVaultOrder);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
              >
                Confirm & Release Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: View Decrypted Steam Key */}
      {selectedKeyOrder && (
        <div
          onClick={() => setSelectedKeyOrder(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[var(--cobalt-acc)]" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Decrypted Digital License Key
                </h3>
              </div>
              <button
                onClick={() => setSelectedKeyOrder(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Redeem this digital product key on your Steam / Epic Games client under{" "}
              <strong>Games &gt; Activate a Product on Steam</strong>.
            </p>

            <div className="p-4 bg-slate-900 rounded-2xl text-center space-y-2 border border-slate-800">
              <span className="text-[11px] text-emerald-400 uppercase font-mono font-bold tracking-wider">
                100% Authentic Key • Global Region
              </span>
              <div className="font-mono text-base font-black text-white tracking-widest selection:bg-blue-600">
                {selectedKeyOrder.decryptedKey || "CP77-PLIB-99X8-4820-VALT"}
              </div>
            </div>

            <button
              onClick={() =>
                handleCopy(
                  selectedKeyOrder.decryptedKey || "CP77-PLIB-99X8-4820-VALT",
                  "Digital Key"
                )
              }
              className="w-full py-2.5 rounded-xl bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Digital Key to Clipboard</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Confirm & Release Escrow Funds */}
      {confirmReleaseOrder && (
        <div
          onClick={() => setConfirmReleaseOrder(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Release Escrow Funds
                </h3>
                <span className="text-xs text-slate-500">{confirmReleaseOrder.orderNumber}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              By confirming, you certify that you have logged into the account, verified in-game inventory, changed all passwords, and are completely satisfied with the delivery.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Release to Seller:</span>
                <span className="font-bold text-slate-900">{confirmReleaseOrder.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Escrow Settlement:</span>
                <span className="font-bold text-[var(--cobalt-acc)]">
                  ${confirmReleaseOrder.price.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmReleaseOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Continue Inspecting
              </button>
              <button
                onClick={() => handleReleaseEscrow(confirmReleaseOrder.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer shadow-md"
              >
                Release Payment Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Open Dispute */}
      {disputeOrder && (
        <div
          onClick={() => setDisputeOrder(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Open Formal Escrow Dispute
                </h3>
                <span className="text-xs text-slate-500">
                  Order {disputeOrder.orderNumber} • ${disputeOrder.price.toFixed(2)} USD
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Opening a dispute immediately halts automated escrow timers and freezes funds. A certified Safedeal Arbitration Specialist will review seller audit trails within 15 minutes.
            </p>

            <form onSubmit={handleConfirmDispute} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Dispute Reason Category
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Invalid Credentials / 2FA Locked">
                    Invalid Credentials / 2FA Locked
                  </option>
                  <option value="Item Not as Described / Missing Skins">
                    Item Not as Described / Missing Skins
                  </option>
                  <option value="Account Banned / Restricted Prior to Delivery">
                    Account Banned / Restricted Prior to Delivery
                  </option>
                  <option value="Seller Failed to Relink OGE Email">
                    Seller Failed to Relink OGE Email
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Description of Issue & Evidence
                </label>
                <textarea
                  required
                  rows={3}
                  value={disputeNote}
                  onChange={(e) => setDisputeNote(e.target.value)}
                  placeholder="Provide error screenshot details or client rejection messages..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-md"
                >
                  Submit & Freeze Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Warranty Service Claim */}
      {warrantyOrder && (
        <div
          onClick={() => setWarrantyOrder(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center gap-2 text-[var(--cobalt-acc)]">
              <ShieldCheck className="w-5 h-5 text-[var(--cobalt-acc)]" />
              <h3 className="font-headline font-bold text-base text-slate-900">
                Safedeal Replacement Warranty
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your purchase of <strong>{warrantyOrder.itemTitle}</strong> is backed by 6-month replacement guard. If your game code is revoked by publisher, Safedeal Vault automatically reissues a fresh replacement or credits 100% of your payment.
            </p>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-[var(--cobalt-acc)] font-semibold">
              Remaining Active Period: {warrantyOrder.warrantyLeft}
            </div>
            <button
              onClick={() => {
                showToast("Warranty claim initiated. Certified agent checking Steam key validity...");
                setWarrantyOrder(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Dispatch Automated Key Verification
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: Arbitrated Case File */}
      {caseFileOrder && (
        <div
          onClick={() => setCaseFileOrder(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <FolderLock className="w-5 h-5 text-[var(--cobalt-acc)]" />
                <h3 className="font-headline font-bold text-base">
                  Arbitrated Case File ({caseFileOrder.disputeCaseId})
                </h3>
              </div>
              <button
                onClick={() => setCaseFileOrder(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Case ID:</span>
                <span className="font-mono font-bold text-slate-900">{caseFileOrder.disputeCaseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Resolution Time:</span>
                <span className="font-bold text-emerald-600">14 minutes (Auto-Reversal)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Outcome:</span>
                <span className="font-bold text-slate-900">100% Refund ($34.50 USD)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-600 leading-relaxed">
                {caseFileOrder.disputeResolutionNote}
              </div>
            </div>

            <button
              onClick={() => setCaseFileOrder(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close Case Summary
            </button>
          </div>
        </div>
      )}

      {/* 3-Pillar Value Proposition Strip */}
      <section className="w-full bg-slate-100/60 py-8 border-t border-slate-200/80">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-xs border border-slate-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-slate-900">
                100% Escrow Protection
              </h4>
              <p className="text-xs text-slate-500">
                Funds held securely until inspection verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[var(--cobalt-acc)] shadow-xs border border-slate-200">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-slate-900">
                Instant Automated Delivery
              </h4>
              <p className="text-xs text-slate-500">
                Receive keys and digital assets within seconds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-700 shadow-xs border border-slate-200">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-slate-900">
                24/7 Dispute Resolution
              </h4>
              <p className="text-xs text-slate-500">
                Real-time arbitration and live customer assistance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Marketplace Footer */}
      <footer className="w-full bg-white shadow-xs border-t border-slate-200/80">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--cobalt-acc)] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-headline font-bold text-lg text-slate-900">
                Safedeal
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              The leading peer-to-peer and verified merchant trading network for game accounts, software licenses, codes, and digital commodities with guaranteed escrow security.
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600">
                SSL 256-Bit
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600">
                PCI-DSS Compliant
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600">
                Verified Merchant
              </span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Popular Markets
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/browse?cat=accounts" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Game Accounts
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=keys" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Steam & Epic Keys
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=gift-cards" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Prepaid Cards
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=currency" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Virtual Currency
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=software" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Product Licenses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Buyer & Seller
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/orders" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Buyer Protection
                </Link>
              </li>
              <li>
                <Link href="/seller/earnings" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Fee Schedule
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Escrow Protocol
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Community Rules
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="hover:text-[var(--cobalt-acc)] transition-colors">
                  Verification Tiers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Preferences
            </h5>
            <div className="space-y-2">
              <div className="bg-slate-100 rounded-xl p-2.5 flex items-center justify-between text-slate-700 text-xs font-semibold">
                <span>English (US)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="bg-slate-100 rounded-xl p-2.5 flex items-center justify-between text-slate-700 text-xs font-semibold">
                <span>USD ($)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 py-4 border-t border-slate-100">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2025 Safedeal Global Inc. All rights reserved. Registered digital marketplace facilitator.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="hover:text-slate-800 transition-colors cursor-pointer">
                Privacy Policy
              </span>
              <span className="hover:text-slate-800 transition-colors cursor-pointer">
                Terms of Escrow
              </span>
              <span className="hover:text-slate-800 transition-colors cursor-pointer">
                Dispute Guidelines
              </span>
              <span className="hover:text-slate-800 transition-colors cursor-pointer">
                AML Policy
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
