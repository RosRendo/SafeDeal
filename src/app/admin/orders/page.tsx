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
} from "lucide-react";

interface RegistryOrder {
  id: string;
  orderNumber: string;
  flags: { label: string; variant: "escrow" | "high-value" | "bot" | "dispute" | "freeze" }[];
  timeAgo: string;
  title: string;
  category: string;
  botId?: string;
  buyer: { name: string; trustScore: string };
  seller: { name: string; tier: string };
  amount: number;
  currency: string;
  feeAmount: number;
  feePercent: string;
  escrowRef: string;
  lifecycleState: "Buyer Inspecting" | "Auto-Settled" | "Disputed" | "Completed";
  inspectionCountdown?: string;
  image: string;
  imageAlt: string;
  gameMetadata: string;
  payloadHash: string;
  gatewayCharge: string;
  merkleRoot: string;
  security: {
    twoFAUnbind: boolean;
    emailClean: boolean;
    geoParity: string;
    fraudScore: string;
  };
  stages: {
    createdTime: string;
    fundingType: string;
    botDispatch: string;
    inspectingHours: string;
    settlementState: string;
  };
}

export default function AdminOrdersRegistryPage() {
  const router = useRouter();

  // Navigation state
  const [activeNav, setActiveNav] = useState("orders-and-transactions");

  // Filter & Search states
  const { searchQuery, setSearchQuery } = useAdminSearch();
  const [dateFilter, setDateFilter] = useState("This Month");
  const [currencyFilter, setCurrencyFilter] = useState("All Currencies (USD)");
  const [gatewayFilter, setGatewayFilter] = useState("Provider: Stripe 3DS");
  const [filterPill, setFilterPill] = useState<"all" | "escrow" | "bot" | "inspecting" | "settled" | "disputed" | "cancelled">("all");

  // Selection & Inspector
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  // UI Modals
  const { showToast } = useAdminToast();
  const [txHashModalOpen, setTxHashModalOpen] = useState(false);
  const [hashInput, setHashInput] = useState("");
  const [forceSettleModalOpen, setForceSettleModalOpen] = useState(false);
  const [disputeFreezeModalOpen, setDisputeFreezeModalOpen] = useState(false);
  const [extendSlaModalOpen, setExtendSlaModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [fullscreenInspector, setFullscreenInspector] = useState(false);
  const [moreMenuOpenId, setMoreMenuOpenId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Master Dataset of Registry Orders (dynamically loaded from API)
  const [orders, setOrders] = useState<RegistryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Currently inspected order (falls back to a blank record while the
  // registry loads so the static shell can prerender without crashing)
  const selectedOrder = useMemo<RegistryOrder>(() => {
    const found = orders.find((o) => o.id === selectedOrderId) || orders[0];
    if (found) return found;
    return {
      id: "",
      orderNumber: "—",
      flags: [],
      timeAgo: "",
      title: "Awaiting registry sync",
      category: "—",
      buyer: { name: "—", trustScore: "—" },
      seller: { name: "—", tier: "—" },
      amount: 0,
      currency: "USD",
      feeAmount: 0,
      feePercent: "—",
      escrowRef: "—",
      lifecycleState: "Buyer Inspecting",
      image: "",
      imageAlt: "",
      gameMetadata: "",
      payloadHash: "—",
      gatewayCharge: "",
      merkleRoot: "",
      security: { twoFAUnbind: false, emailClean: false, geoParity: "—", fraudScore: "—" },
      stages: { createdTime: "—", fundingType: "—", botDispatch: "—", inspectingHours: "—", settlementState: "—" },
    };
  }, [orders, selectedOrderId]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Pill category filter
      if (filterPill === "escrow" && !order.flags.some((f) => f.variant === "escrow")) return false;
      if (filterPill === "bot" && order.lifecycleState !== "Auto-Settled" && !order.flags.some((f) => f.variant === "bot")) return false;
      if (filterPill === "inspecting" && order.lifecycleState !== "Buyer Inspecting") return false;
      if (filterPill === "settled" && order.lifecycleState !== "Completed" && order.lifecycleState !== "Auto-Settled") return false;
      if (filterPill === "disputed" && order.lifecycleState !== "Disputed") return false;

      // Currency filter
      if (currencyFilter === "CAD" && order.currency !== "CAD") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q) || order.orderNumber.toLowerCase().includes(q);
        const matchesTitle = order.title.toLowerCase().includes(q);
        const matchesBuyer = order.buyer.name.toLowerCase().includes(q);
        const matchesSeller = order.seller.name.toLowerCase().includes(q);
        const matchesEscrow = order.escrowRef.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesBuyer && !matchesSeller && !matchesEscrow) return false;
      }

      return true;
    });
  }, [orders, filterPill, currencyFilter, searchQuery]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (checkedIds.length === filteredOrders.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Order Number",
      "Title",
      "Category",
      "Buyer",
      "Seller",
      "Amount",
      "Currency",
      "Fee",
      "Escrow Ref",
      "Lifecycle State",
      "Payload Hash",
    ];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${o.title.replace(/"/g, '""')}"`,
      `"${o.category}"`,
      `"${o.buyer.name}"`,
      `"${o.seller.name}"`,
      o.amount.toFixed(2),
      o.currency,
      o.feeAmount.toFixed(2),
      o.escrowRef,
      o.lifecycleState,
      o.payloadHash,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `safedeal_orders_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Full immutable order registry downloaded as CSV ledger.");
  };

  // Fetch live orders registry from API on mount
  useEffect(() => {
    async function loadAdminOrders() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/orders");
        const json = await res.json();
        if (json.success && Array.isArray(json.orders)) {
          const apiOrders: RegistryOrder[] = json.orders.map((o: any) => {
            const isCompleted = o.status === "completed" || o.status === "delivered";
            const isDisputed = o.status === "disputed";

            const flags: { label: string; variant: "escrow" | "bot" | "dispute" | "freeze" | "high-value" }[] = [];
            if (!isCompleted && !isDisputed) flags.push({ label: "Escrow Locked", variant: "escrow" });
            if (isDisputed) {
              flags.push({ label: "Disputed", variant: "dispute" });
              flags.push({ label: "Freeze", variant: "freeze" });
            }
            if ((o.price || 0) >= 100) flags.push({ label: "High Value", variant: "high-value" });

            let lifecycleState: "Buyer Inspecting" | "Auto-Settled" | "Disputed" | "Completed" = "Buyer Inspecting";
            if (isDisputed) lifecycleState = "Disputed";
            else if (isCompleted) lifecycleState = "Completed";

            return {
              id: o.id,
              orderNumber: o.orderNumber || "#" + o.id,
              flags,
              timeAgo: o.date ? (o.date + ", " + (o.timestamp || "recent")) : "Recent",
              title: o.itemTitle || o.title || o.item?.title || "Digital Asset Order",
              category: o.category === "keys" ? "Game Keys" : o.category === "currency" ? "In-Game Currency" : "Gaming Accounts",
              botId: "Bot #1",
              buyer: { name: o.buyerName || o.buyer?.username || "Verified Buyer", trustScore: "98%" },
              seller: { name: o.sellerName || o.seller?.username || "AeroGamingDeals", tier: "T1" },
              amount: typeof o.price === "number" ? o.price : (o.amount || 0),
              currency: "USD",
              feeAmount: +((typeof o.price === "number" ? o.price : (o.amount || 0)) * 0.05).toFixed(2),
              feePercent: "5.0%",
              escrowRef: "#ESC-" + (o.id.replace(/[^0-9]/g, "").slice(-5) || "90812") + "-US",
              lifecycleState,
              inspectionCountdown: isCompleted ? undefined : "Inspection (24h left)",
              image: o.image || o.item?.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
              imageAlt: o.itemTitle || "Digital Asset",
              gameMetadata: o.tag || "Digital Handover",
              payloadHash: "sha256-" + o.id.slice(0, 8) + "...vault",
              gatewayCharge: "ch_escrow_" + o.id,
              merkleRoot: "0x" + o.id.replace(/[^a-f0-9]/gi, "").padEnd(16, "0"),
              security: {
                twoFAUnbind: true,
                emailClean: true,
                geoParity: "Buyer vs Seller Verified",
                fraudScore: "0.02 (Standard Risk)",
              },
              stages: {
                createdTime: o.timestamp || "Just now",
                fundingType: "Card Escrow",
                botDispatch: "Direct Vault Handover",
                inspectingHours: isCompleted ? "Completed" : "24h remaining",
                settlementState: isCompleted ? "Settled to Seller" : isDisputed ? "Funds Frozen" : "Pending Inspection",
              },
            };
          });

          setOrders(apiOrders);
          if (apiOrders.length > 0) {
            setSelectedOrderId((prev) => prev || apiOrders[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load admin orders", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminOrders();
  }, []);

  // Staff action: Force settle escrow
  const handleConfirmForceSettle = async () => {
    const orderToSettle = selectedOrder;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderToSettle.id
          ? {
              ...o,
              lifecycleState: "Completed",
              flags: o.flags.filter((f) => f.variant !== "escrow"),
              stages: { ...o.stages, settlementState: "Settled via Dual Auth" },
            }
          : o
      )
    );
    setForceSettleModalOpen(false);

    try {
      await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderToSettle.id, action: "settle" }),
      });
    } catch (e) {
      console.error("Failed to force settle in API", e);
    }

    showToast(`Dual Authorization Succeeded: Escrow released to ${orderToSettle.seller.name}.`);
  };

  // Staff action: Dispute freeze
  const handleConfirmDisputeFreeze = async () => {
    const orderToFreeze = selectedOrder;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderToFreeze.id
          ? {
              ...o,
              lifecycleState: "Disputed",
              flags: [
                ...o.flags.filter((f) => f.variant !== "dispute" && f.variant !== "freeze"),
                { label: "Disputed", variant: "dispute" },
                { label: "Freeze", variant: "freeze" },
              ],
            }
          : o
      )
    );
    setDisputeFreezeModalOpen(false);

    try {
      await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderToFreeze.id, action: "dispute" }),
      });
    } catch (e) {
      console.error("Failed to dispute freeze in API", e);
    }

    showToast(`Dispute Freeze enforced on ${orderToFreeze.orderNumber}. Outbound payout blocked.`);
  };

  // Staff action: Extend SLA
  const handleExtendSLA = () => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              inspectionCountdown: "Extended (+24h) • 68h 28m left",
              stages: { ...o.stages, inspectingHours: "68h 28m remaining" },
            }
          : o
      )
    );
    setExtendSlaModalOpen(false);
    showToast(`Buyer inspection window extended by +24 hours for ${selectedOrder.orderNumber}.`);
  };

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full">
        <div className="px-8 py-6 flex flex-col gap-6">
              {/* Breadcrumbs, Meta Header & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[12px] uppercase tracking-wider mb-1 font-semibold">
                    <Link href="/admin" className="hover:text-[var(--cobalt-acc)] transition-colors">
                      Marketplace
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[var(--cobalt-acc)] font-bold">Orders & Transactions</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Orders & Transactions Registry
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[12px] font-bold border border-blue-200">
                      Immutable Ledger v4.2
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 mt-0.5 max-w-3xl">
                    Immutable ledger of buyer orders, cryptographic escrow holds, automated bot deliveries, and settlement dispute vectors.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={handleExportCSV}
                    className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>Download CSV Ledger</span>
                  </button>
                  <button
                    onClick={() => {
                      setTxHashModalOpen(true);
                      setHashInput("");
                    }}
                    className="h-10 px-4 rounded-lg bg-[var(--cobalt-acc)] text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Query Transaction Hash</span>
                  </button>
                </div>
              </div>

              {/* Escrow Velocity KPI Ribbons (4 cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ribbon 1: Active Escrow Locked */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">
                      Active Escrow Locked
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center">
                      <LockKeyhole className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-headline text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                      ${orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[12px] font-bold text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> ${orders.filter((o) => o.flags.some((f) => f.variant === "escrow")).length} Escrows
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-[var(--cobalt-acc)] h-full rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>

                {/* Ribbon 2: Bot Dispatch Queue */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">
                      Bot Dispatch Queue
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-headline text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                      ${orders.filter((o) => o.category === "Game Keys").length} Vault Keys
                    </span>
                    <span className="text-[12px] font-bold text-emerald-600">
                      0.8s avg ping
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "94%" }} />
                  </div>
                </div>

                {/* Ribbon 3: Buyer Inspection SLA */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">
                      Buyer Inspection SLA
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-headline text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                      ${orders.filter((o) => o.lifecycleState === "Buyer Inspecting").length} Orders
                    </span>
                    <span className="text-[12px] font-semibold text-slate-500">
                      48h countdown active
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: "42%" }} />
                  </div>
                </div>

                {/* Ribbon 4: 24h Dispute Vector */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">
                      24h Dispute Vector
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertOctagon className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-headline text-xl md:text-2xl font-extrabold text-rose-600 tracking-tight">
                      ${orders.filter((o) => o.lifecycleState === "Disputed").length} Cases
                    </span>
                    <span className="text-[12px] font-bold text-rose-600">
                      Critical Review
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: "14%" }} />
                  </div>
                </div>
              </div>

              {/* Command & Filter Workspace Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                {/* Search and Secondary Dropdown Filters */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by Order ID (#SF-...), Buyer, Seller, Listing SKU, or Tx Hash..."
                      className="w-full h-11 pl-10 pr-20 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[11px] font-mono font-bold">
                        ⌘K
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Date Filter */}
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer outline-none hover:bg-slate-100 transition-colors"
                    >
                      <option value="This Month">This Month</option>
                      <option value="Today">Today</option>
                      <option value="Last 7 Days">Last 7 Days</option>
                      <option value="All Time">All Time</option>
                    </select>

                    {/* Currency Filter */}
                    <select
                      value={currencyFilter}
                      onChange={(e) => setCurrencyFilter(e.target.value)}
                      className="h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer outline-none hover:bg-slate-100 transition-colors"
                    >
                      <option value="All Currencies (USD)">All Currencies (USD)</option>
                      <option value="CAD">CAD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>

                    {/* Gateway Provider Filter */}
                    <select
                      value={gatewayFilter}
                      onChange={(e) => setGatewayFilter(e.target.value)}
                      className="h-11 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer outline-none hover:bg-slate-100 transition-colors"
                    >
                      <option value="Provider: Stripe 3DS">Provider: Stripe 3DS</option>
                      <option value="Adyen 3DS2">Adyen 3DS2</option>
                      <option value="SEPA Instant">SEPA Instant</option>
                    </select>

                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilterPill("all");
                        setCurrencyFilter("All Currencies (USD)");
                        setDateFilter("This Month");
                        showToast("Registry filters reset to default.");
                      }}
                      className="h-11 w-11 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                      title="Reset Filters"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {(
                    [
                      { key: "all", label: "All Orders", count: String(orders.length) },
                      { key: "escrow", label: "In Escrow Hold", count: String(orders.filter((o) => o.flags.some((f) => f.variant === "escrow")).length), icon: LockKeyhole },
                      { key: "bot", label: "Bot Dispatched", count: String(orders.filter((o) => o.botId).length), icon: Zap },
                      { key: "inspecting", label: "Buyer Inspecting", count: String(orders.filter((o) => o.lifecycleState === "Buyer Inspecting").length), icon: Eye },
                      { key: "settled", label: "Completed & Settled", count: String(orders.filter((o) => o.lifecycleState === "Completed" || o.lifecycleState === "Auto-Settled").length) },
                      { key: "disputed", label: "Disputed", count: String(orders.filter((o) => o.lifecycleState === "Disputed").length), icon: AlertTriangle, isError: true },
                      { key: "cancelled", label: "Cancelled / Refunded", count: String(orders.filter((o) => (o.lifecycleState as string) === "Cancelled").length) },
                    ] as const
                  ).map((pill) => {
                    const isActive = filterPill === pill.key;
                    const Icon = (pill as any).icon;
                    return (
                      <button
                        key={pill.key}
                        onClick={() => setFilterPill(pill.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                            : (pill as any).isError
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        <span>{pill.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[11px] font-extrabold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : (pill as any).isError
                              ? "bg-rose-600 text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {pill.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Workspace Split: Dense Registry Grid & Order Inspection Flyout */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left Column: Registry Table Master View (7 cols) */}
                <div className="xl:col-span-7 flex flex-col gap-4">
                  {/* Batch Action Tray */}
                  <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-sm flex items-center justify-between border border-slate-800">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checkedIds.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded text-[var(--cobalt-acc)] accent-[var(--cobalt-acc)] cursor-pointer"
                      />
                      <span className="font-bold text-xs">
                        {checkedIds.length} {checkedIds.length === 1 ? "transaction" : "transactions"} highlighted
                      </span>
                      <span className="text-slate-400 text-xs hidden sm:inline">
                        | Ledger state: Audited
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast("Escrow ledger re-synchronized with Stripe 3DS rails.")}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-blue-400" />
                        <span>Escrow Re-sync</span>
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-emerald-400" />
                        <span>Export Selected</span>
                      </button>
                    </div>
                  </div>

                  {/* Master Registry Dense Table Container */}
                  <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                            <th className="p-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={checkedIds.length === filteredOrders.length && filteredOrders.length > 0}
                                onChange={handleToggleSelectAll}
                                className="w-4 h-4 rounded accent-[var(--cobalt-acc)] cursor-pointer"
                              />
                            </th>
                            <th className="p-3">Order Ref & Flags</th>
                            <th className="p-3">Item & Category</th>
                            <th className="p-3">Buyer & Seller</th>
                            <th className="p-3">Settlement / Escrow</th>
                            <th className="p-3">Lifecycle State</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-500">
                                No transactions matching active filters.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((order) => {
                              const isChecked = checkedIds.includes(order.id);
                              const isFocused = selectedOrderId === order.id;
                              return (
                                <tr
                                  key={order.id}
                                  onClick={() => setSelectedOrderId(order.id)}
                                  className={`transition-colors cursor-pointer group ${
                                    isFocused
                                      ? "bg-blue-50/70 border-l-4 border-l-[var(--cobalt-acc)]"
                                      : order.lifecycleState === "Disputed"
                                      ? "bg-rose-50/40 hover:bg-rose-50/70"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <td
                                    className="p-3 text-center align-top"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleRow(order.id);
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleRow(order.id)}
                                      className="w-4 h-4 rounded accent-[var(--cobalt-acc)] cursor-pointer"
                                    />
                                  </td>

                                  {/* Order Ref & Flags */}
                                  <td className="p-3 align-top">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`font-bold text-xs ${isFocused ? "text-[var(--cobalt-acc)]" : "text-slate-900"}`}>
                                          {order.orderNumber}
                                        </span>
                                        {isFocused && (
                                          <span className="w-2 h-2 rounded-full bg-[var(--cobalt-acc)] animate-pulse" title="Active Focus" />
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1 flex-wrap">
                                        {order.flags.map((flag, idx) => (
                                          <span
                                            key={idx}
                                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                              flag.variant === "escrow"
                                                ? "bg-blue-100 text-[var(--cobalt-acc)]"
                                                : flag.variant === "high-value"
                                                ? "bg-amber-100 text-amber-800"
                                                : flag.variant === "bot"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : flag.variant === "dispute"
                                                ? "bg-rose-600 text-white"
                                                : "bg-slate-200 text-slate-800"
                                            }`}
                                          >
                                            {flag.label}
                                          </span>
                                        ))}
                                      </div>
                                      <span className="text-[11px] text-slate-400">{order.timeAgo}</span>
                                    </div>
                                  </td>

                                  {/* Item & Category */}
                                  <td className="p-3 align-top max-w-[190px]">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-[var(--cobalt-acc)] transition-colors" title={order.title}>
                                        {order.title}
                                      </span>
                                      <span className="text-slate-500 text-[12px]">{order.category}</span>
                                      {order.botId && (
                                        <div className="flex items-center gap-1 mt-1 text-emerald-700 font-semibold text-[11px]">
                                          <Zap className="w-3 h-3 fill-current" />
                                          <span>{order.botId}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Buyer & Seller */}
                                  <td className="p-3 align-top max-w-[170px]">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-1">
                                        <span className="text-slate-900 font-medium truncate text-[12px]">
                                          B: {order.buyer.name}
                                        </span>
                                        <span className="px-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                                          {order.buyer.trustScore}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-slate-500 truncate text-[12px]">
                                          S: {order.seller.name}
                                        </span>
                                        <span className="px-1 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                          {order.seller.tier}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Settlement / Escrow */}
                                  <td className="p-3 align-top whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-xs text-slate-900">
                                        ${order.amount.toFixed(2)} {order.currency}
                                      </span>
                                      <span className="text-slate-500 text-[11px]">
                                        Fee: ${order.feeAmount.toFixed(2)} ({order.feePercent})
                                      </span>
                                      <span className="text-[var(--cobalt-acc)] font-mono font-bold text-[11px] mt-0.5">
                                        {order.escrowRef}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Lifecycle State */}
                                  <td className="p-3 align-top">
                                    <div className="flex flex-col gap-1">
                                      {order.lifecycleState === "Buyer Inspecting" && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-[var(--cobalt-acc)] text-[11px] font-bold">
                                          <Search className="w-3 h-3" />
                                          <span>Buyer Inspecting</span>
                                        </span>
                                      )}
                                      {order.lifecycleState === "Auto-Settled" && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                                          <CheckCheck className="w-3 h-3" />
                                          <span>Auto-Settled</span>
                                        </span>
                                      )}
                                      {order.lifecycleState === "Disputed" && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold">
                                          <Gavel className="w-3 h-3" />
                                          <span>Arbitration Open</span>
                                        </span>
                                      )}
                                      {order.lifecycleState === "Completed" && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                                          <Check className="w-3 h-3" />
                                          <span>Completed</span>
                                        </span>
                                      )}
                                      {order.inspectionCountdown && (
                                        <span className="text-[11px] text-slate-500">
                                          {order.inspectionCountdown}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Actions */}
                                  <td className="p-3 align-top text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5 relative">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedOrderId(order.id);
                                        }}
                                        className="px-2.5 py-1 rounded bg-[var(--cobalt-acc)] text-white text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                                      >
                                        Inspect
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setMoreMenuOpenId(moreMenuOpenId === order.id ? null : order.id);
                                        }}
                                        className="p-1 rounded text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>

                                      {moreMenuOpenId === order.id && (
                                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-150">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedOrderId(order.id);
                                              setReceiptModalOpen(true);
                                              setMoreMenuOpenId(null);
                                            }}
                                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Ledger Receipt</span>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigator.clipboard?.writeText(order.escrowRef);
                                              showToast(`Copied escrow ref ${order.escrowRef}`);
                                              setMoreMenuOpenId(null);
                                            }}
                                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Copy Escrow Ref</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-slate-500 text-xs">
                      <span>Showing 1 - {filteredOrders.length} of 48,192 transactions</span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled
                          className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-400 text-xs font-semibold disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1 font-bold text-xs">
                          <span className="w-6 h-6 rounded bg-[var(--cobalt-acc)] text-white flex items-center justify-center">
                            1
                          </span>
                          <span className="w-6 h-6 rounded hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                            2
                          </span>
                          <span className="w-6 h-6 rounded hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                            3
                          </span>
                          <span className="px-1 text-slate-400">...</span>
                          <span className="w-6 h-6 rounded hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                            1,928
                          </span>
                        </div>
                        <button className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer">
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Detail & Escrow Inspection Workspace (5 cols) */}
                <div className="xl:col-span-5 flex flex-col gap-4">
                  <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col gap-4">
                    {/* Drawer Header & Order Lockup */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-lg text-slate-900">
                            Order {selectedOrder.orderNumber}
                          </span>
                          <span className="w-2.5 h-2.5 rounded-full bg-[var(--cobalt-acc)]" />
                        </div>
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono font-semibold">
                          Ledger Partition: SHA-256 Verified
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-extrabold border border-blue-200">
                          {selectedOrder.lifecycleState === "Disputed"
                            ? "DISPUTE ARBITRATION"
                            : selectedOrder.lifecycleState === "Completed"
                            ? "SETTLED IN FULL"
                            : "ESCROW HOLD ACTIVE"}
                        </span>
                        <button
                          onClick={() => setReceiptModalOpen(true)}
                          className="p-1 rounded text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Cryptographic Receipt"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Visual Escrow Lifecycle State Transition Diagram */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Escrow Lifecycle State Transition
                      </span>
                      <div className="grid grid-cols-5 gap-1 items-center pt-2">
                        {/* Step 1: Created */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[12px]">
                            ✓
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 mt-1">Created</span>
                          <span className="text-[10px] text-slate-400 leading-none">
                            {selectedOrder.stages.createdTime}
                          </span>
                        </div>
                        <div className="h-0.5 bg-emerald-500 -mt-4" />

                        {/* Step 2: Funded */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[12px]">
                            ✓
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 mt-1">Funded</span>
                          <span className="text-[10px] text-slate-400 leading-none">
                            {selectedOrder.stages.fundingType}
                          </span>
                        </div>
                        <div className="h-0.5 bg-emerald-500 -mt-4" />

                        {/* Step 3: Vault Dispatched */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[12px]">
                            ✓
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 mt-1">Dispatched</span>
                          <span className="text-[10px] text-slate-400 leading-none">
                            {selectedOrder.stages.botDispatch}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center pt-2">
                        {/* Step 4: Current Stage */}
                        <div className="col-span-2 p-2 rounded-lg bg-[var(--cobalt-acc)] text-white flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
                            <div className="flex flex-col">
                              <span className="text-[12px] font-bold leading-tight">
                                Stage 4: In Buyer Inspection (Current)
                              </span>
                              <span className="text-[11px] text-blue-100 leading-tight">
                                Countdown: {selectedOrder.stages.inspectingHours}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] px-1.5 py-0.5 bg-white/20 rounded font-bold">
                            Active
                          </span>
                        </div>

                        {/* Step 5: Settlement */}
                        <div className="p-2 rounded-lg bg-slate-200/80 flex flex-col justify-center text-center text-slate-600">
                          <span className="text-[12px] font-bold">5: Settlement</span>
                          <span className="text-[11px] leading-tight text-slate-500">
                            {selectedOrder.stages.settlementState}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Product Details & Bot Delivery Snapshot */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                        Digital Asset Metadata
                      </span>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2.5">
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                            {selectedOrder.image && (
                              <img
                                src={selectedOrder.image}
                                alt={selectedOrder.imageAlt}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {selectedOrder.title}
                            </span>
                            <span className="text-[12px] text-slate-500">
                              {selectedOrder.gameMetadata}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-headline font-extrabold text-base text-slate-900">
                                ${selectedOrder.amount.toFixed(2)}
                              </span>
                              <span className="text-[11px] text-slate-500 font-semibold">
                                {selectedOrder.currency} via Stripe
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bot Delivery Handover Snapshot */}
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-slate-600 font-bold">Automated Vault Delivery:</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Key className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Credentials Released</span>
                            </span>
                          </div>
                          <div className="font-mono text-[11px] bg-slate-50 p-1.5 rounded text-slate-700 break-all border border-slate-100">
                            AES-256 GCM Payload Hash:{" "}
                            <span className="text-[var(--cobalt-acc)] font-bold">{selectedOrder.payloadHash}</span>{" "}
                            (Decryption granted to Buyer IP)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security & Compliance Checklist */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                        Security & Fraud Telemetry
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-[12px]">2FA Unbind Confirmed</span>
                            <span className="text-[11px] text-slate-500">Native authenticator reset</span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-[12px]">Native Email Clean</span>
                            <span className="text-[11px] text-slate-500">Original creation unlinked</span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[var(--cobalt-acc)] shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-[12px]">Geo Location Parity</span>
                            <span className="text-[11px] text-slate-500">{selectedOrder.security.geoParity}</span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-[12px]">Fraud Score: 0.02</span>
                            <span className="text-[11px] text-slate-500">Stripe Radar Low-Risk</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cryptographic Vault Fingerprint & Audit Trail */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                        Ledger Cryptographic Proof
                      </span>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 font-mono text-[11px] text-slate-800 flex flex-col gap-1">
                        <div className="flex justify-between text-slate-500">
                          <span>ESCROW VAULT REF:</span>
                          <span className="text-slate-900 font-bold">{selectedOrder.escrowRef}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>GATEWAY CHARGE:</span>
                          <span className="text-[var(--cobalt-acc)] font-bold">{selectedOrder.gatewayCharge}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>MERKLE ROOT HASH:</span>
                          <span className="truncate max-w-[210px] text-slate-600">{selectedOrder.merkleRoot}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dual Authorization Staff Controls */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
                      <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 flex items-start gap-2">
                        <Info className="w-4 h-4 text-[var(--cobalt-acc)] shrink-0 mt-0.5" />
                        <p className="text-[12px] text-slate-700 leading-tight">
                          <strong>Dual Authorization Policy:</strong> Instant release of escrow holds above $150.00 requires secondary sign-off from Finance Lead or Super Admin.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={() => setExtendSlaModalOpen(true)}
                          className="h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Extend SLA (+24h)</span>
                        </button>
                        <button
                          onClick={() => setReceiptModalOpen(true)}
                          className="h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>Signed Ledger Receipt</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-0.5">
                        <button
                          onClick={() => setDisputeFreezeModalOpen(true)}
                          className="h-9 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          <span>Initiate Dispute Freeze</span>
                        </button>
                        <button
                          onClick={() => setForceSettleModalOpen(true)}
                          className="h-9 px-3 rounded-lg bg-[var(--cobalt-acc)] text-white hover:bg-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Force Settle Escrow</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Query Transaction Hash Modal */}
      {txHashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[var(--cobalt-acc)]" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Query Transaction Hash
                </h3>
              </div>
              <button
                onClick={() => setTxHashModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Lookup any cryptographic transaction hash, Merkle root, or Gateway charge ID:
            </p>

            <div>
              <input
                type="text"
                placeholder="e.g. 0x88fca9b12984e7bb... or ch_3Ps7aK..."
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTxHashModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTxHashModalOpen(false);
                  showToast(`Hash verified: Partition node confirmed block proof.`);
                }}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Verify On Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Settle Dual-Auth Modal */}
      {forceSettleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-headline font-bold text-base text-slate-900">
                Force Settle Escrow Hold?
              </h3>
              <p className="text-xs text-slate-600">
                You are about to release{" "}
                <strong className="text-slate-900">${selectedOrder.amount.toFixed(2)} {selectedOrder.currency}</strong>{" "}
                from Escrow Ref <span className="font-mono text-[var(--cobalt-acc)]">{selectedOrder.escrowRef}</span> directly into the seller wallet of{" "}
                <strong className="text-slate-900">{selectedOrder.seller.name}</strong>.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-[12px] text-slate-700 leading-relaxed">
              Super Admin signatory: <strong>Sarah Lin (SL)</strong>. This action is permanently recorded in the immutable audit ledger.
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setForceSettleModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmForceSettle}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Authorize Release
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Freeze Modal */}
      {disputeFreezeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Gavel className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-headline font-bold text-base text-slate-900">
                Initiate Dispute Escrow Freeze
              </h3>
              <p className="text-xs text-slate-600">
                Halt automatic settlement for <strong className="text-slate-900">{selectedOrder.orderNumber}</strong>. Both parties will be directed to Safedeal Concierge Arbitration Desk.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDisputeFreezeModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisputeFreeze}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                Lock Escrow & Open Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend SLA Modal */}
      {extendSlaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-headline font-bold text-base text-slate-900">
                Extend Buyer Inspection SLA
              </h3>
              <p className="text-xs text-slate-600">
                Grant the buyer an extra +24 hours to complete in-game account credentials validation and email recovery verification.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setExtendSlaModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendSLA}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Grant +24h Extension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signed Ledger Receipt Modal */}
      {receiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Cryptographic Ledger Receipt
                </h3>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs space-y-2 text-slate-800">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">LEDGER PARTITION:</span>
                <span className="font-bold">US-EAST-1_V4.2</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">TRANSACTION ID:</span>
                <span className="font-bold text-[var(--cobalt-acc)]">{selectedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">ESCROW VAULT REF:</span>
                <span className="font-bold">{selectedOrder.escrowRef}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">SETTLED AMOUNT:</span>
                <span className="font-bold">${selectedOrder.amount.toFixed(2)} {selectedOrder.currency}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">MERKLE ROOT HASH:</span>
                <span className="text-slate-600 truncate max-w-[200px]">{selectedOrder.merkleRoot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AUDIT TIMESTAMP:</span>
                <span className="font-bold">{new Date().toISOString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(selectedOrder, null, 2));
                  showToast("Signed JSON receipt copied to clipboard.");
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
