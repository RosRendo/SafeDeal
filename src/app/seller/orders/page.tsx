"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SellerHeader from "@/components/navigation/SellerHeader";
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
  Calendar,
  KeyRound,
  FileText,
  Key,
  Flame,
  CheckCheck,
  Shield,
  Gauge,
  Info,
} from "lucide-react";

type OrderTab = "all" | "to-deliver" | "awaiting" | "completed" | "cancelled" | "disputes";

interface MerchantOrder {
  id: string;
  orderNumber: string;
  title: string;
  category: "Account" | "Key" | "Currency";
  image: string;
  imageAlt: string;
  price: number;
  timeText: string;
  statusBadge: {
    label: string;
    variant: "urgent" | "escrow" | "info" | "delivered" | "dispute" | "completed";
  };
  subBadge?: string;
  platformText: string;
  buyer: {
    name: string;
    avatarInitials: string;
    rating?: number;
    purchasesCount: number;
  };
  indicatorColor: string;
  disputeReason?: string;
  subFinancialText?: string;
  autoReleaseText?: string;
  tabCategory: OrderTab;
}

export default function MerchantOrdersPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [dateFilter, setDateFilter] = useState("Last 30 Days");

  // Interactive Action Modals
  const [activeDeliverOrder, setActiveDeliverOrder] = useState<MerchantOrder | null>(null);
  const [activeKeyOrder, setActiveKeyOrder] = useState<MerchantOrder | null>(null);
  const [activeChatOrder, setActiveChatOrder] = useState<MerchantOrder | null>(null);
  const [activeDisputeOrder, setActiveDisputeOrder] = useState<MerchantOrder | null>(null);
  const [activeProofOrder, setActiveProofOrder] = useState<MerchantOrder | null>(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<MerchantOrder | null>(null);

  // Form states inside modals
  const [keyInput, setKeyInput] = useState("CYBER-88219-STEAM-PRIME-X");
  const [chatMessage, setChatMessage] = useState("");
  const [disputeResponse, setDisputeResponse] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Orders state initialized to empty (loaded dynamically from database API)
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real seller orders from API on mount
  const loadSellerOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/seller/orders");
      const json = await res.json();
      if (json.success && Array.isArray(json.orders)) {
        const mappedApiOrders: MerchantOrder[] = json.orders.map((o: any) => {
          const isDisputed = o.status === "disputed";
          const isCompleted = o.status === "delivered" || o.status === "completed" || o.status === "warranty";
          const isAwaiting = o.statusText?.includes("Awaiting") || (o.credentials && o.status === "active");
          const isToDeliver = o.status === "active" && !isAwaiting;

          let tabCategory: OrderTab = "all";
          if (isDisputed) tabCategory = "disputes";
          else if (isCompleted) tabCategory = "completed";
          else if (isAwaiting) tabCategory = "awaiting";
          else tabCategory = "to-deliver";

          let statusBadgeVariant: "urgent" | "escrow" | "info" | "delivered" | "dispute" | "completed" = "urgent";
          let statusBadgeLabel = "Deliver within 38m";
          if (isCompleted) {
            statusBadgeVariant = "completed";
            statusBadgeLabel = "Completed • Funds Settled";
          } else if (isDisputed) {
            statusBadgeVariant = "dispute";
            statusBadgeLabel = "Escrow Frozen • Dispute Review";
          } else if (isAwaiting) {
            statusBadgeVariant = "delivered";
            statusBadgeLabel = "Delivered • Inspection Grace Period (22h left)";
          }

          const categoryFormatted: "Account" | "Key" | "Currency" =
            o.category === "keys" ? "Key" : o.category === "currency" ? "Currency" : "Account";

          return {
            id: o.id,
            orderNumber: o.orderNumber || `#${o.id}`,
            title: o.itemTitle || o.title || "Digital Asset Order",
            category: categoryFormatted,
            image:
              o.image ||
              "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
            imageAlt: o.itemTitle || "Order Asset",
            price: typeof o.price === "number" ? o.price : 0,
            timeText: o.date ? `${o.date}, ${o.timestamp || "recent"}` : "Today, 2:14 PM",
            statusBadge: {
              label: statusBadgeLabel,
              variant: statusBadgeVariant,
            },
            subBadge: isDisputed ? "Release Paused • In Arbitration" : "Payment Confirmed • In Escrow",
            platformText: o.tag || "Verified Escrow",
            buyer: {
              name: o.buyerName || (o.buyer && o.buyer.name) || "Authorized Buyer",
              avatarInitials: ((o.buyerName || (o.buyer && o.buyer.name) || "Authorized Buyer") as string)
                .slice(0, 2)
                .toUpperCase(),
              rating: 4.95,
              purchasesCount: 18,
            },
            indicatorColor: isDisputed
              ? "bg-rose-500"
              : isCompleted
              ? "bg-slate-400"
              : "bg-blue-600",
            tabCategory,
          };
        });

        setOrders(mappedApiOrders);
      }
    } catch (e) {
      console.error("Failed to load seller orders", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSellerOrders();
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === "to-deliver" && order.tabCategory !== "to-deliver") return false;
      if (activeTab === "awaiting" && order.tabCategory !== "awaiting") return false;
      if (activeTab === "completed" && order.tabCategory !== "completed") return false;
      if (activeTab === "disputes" && order.tabCategory !== "disputes") return false;
      if (activeTab === "cancelled" && order.tabCategory !== "cancelled") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          order.title.toLowerCase().includes(q) ||
          order.orderNumber.toLowerCase().includes(q) ||
          order.buyer.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders({});
      setSelectAll(false);
    } else {
      const next: Record<string, boolean> = {};
      filteredOrders.forEach((o) => (next[o.id] = true));
      setSelectedOrders(next);
      setSelectAll(true);
    }
  };

  const handleToggleOrder = (id: string) => {
    setSelectedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ds-surface)] text-slate-900 font-sans antialiased">
      {/* 1. SELLER HUB NAVIGATION HEADER */}
      <SellerHeader activeTab="orders" />

      {/* Floating Notice Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-clean-lg flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. MAIN ORDERS FULFILLMENT CANVASS */}
      <main className="w-full pt-16 bg-[var(--ds-surface)] min-h-screen flex-1 flex flex-col">
        {/* Interactive & Quick Metrics Top Banner */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          {/* Breadcrumb & Status Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link href="/seller" className="text-slate-500 hover:text-blue-600 transition-colors">
                Merchant Desk
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-blue-600 font-bold">Orders Fulfillment</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[12px] font-bold border border-blue-200/60">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Escrow Auto-Disbursement Engine: Active</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[12px] font-medium">
                <RefreshCw className="w-3 h-3 text-blue-600" />
                <span>Synced 12s ago</span>
              </div>
            </div>
          </div>

          {/* Title + Search Layout */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
            <div className="space-y-1">
              <h1 className="font-headline text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Orders
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Manage your high-velocity sales, deliver game keys and accounts safely via escrow, and resolve pending buyer verifications.
              </p>
            </div>

            {/* Quick Action Desk Search Bar */}
            <div className="w-full lg:max-w-md">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search product, buyer handle, or Order ID (#SF-...)"
                  className="w-full h-11 pl-10 pr-20 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xs font-medium placeholder:text-slate-400 shadow-clean-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <div className="absolute right-2.5 flex items-center gap-1">
                  <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded font-mono">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Mini KPI strip for merchant momentum */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pb-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-clean-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Pending Delivery
                </div>
                <div className="font-headline font-black text-base sm:text-lg text-slate-900 pt-0.5">
                  ${orders.filter((o) => o.tabCategory === "to-deliver").reduce((s, o) => s + o.price, 0).toFixed(2)}{" "}
                  <span className="text-xs text-blue-600 font-bold">
                    ({orders.filter((o) => o.tabCategory === "to-deliver").length} items)
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Zap className="w-5 h-5 fill-blue-600" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-clean-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  In Escrow Holding
                </div>
                <div className="font-headline font-black text-base sm:text-lg text-slate-900 pt-0.5">
                  ${orders.filter((o) => o.tabCategory === "awaiting" || o.tabCategory === "to-deliver").reduce((s, o) => s + o.price, 0).toFixed(2)}{" "}
                  <span className="text-xs text-slate-500 font-medium">
                    ({orders.filter((o) => o.tabCategory === "awaiting" || o.tabCategory === "to-deliver").length} items)
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-clean-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Avg Fulfillment Speed
                </div>
                <div className="font-headline font-black text-base sm:text-lg text-slate-900 pt-0.5">
                  4m 12s{" "}
                  <span className="text-xs text-emerald-600 font-extrabold">Top 3%</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Gauge className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-clean-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Fulfillment Rate
                </div>
                <div className="font-headline font-black text-base sm:text-lg text-slate-900 pt-0.5">
                  99.7%{" "}
                  <span className="text-xs text-slate-400 font-normal">30-day</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Tabs Bar with Live Counts */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-4">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar max-w-full text-xs font-bold">
              {/* Tab: All */}
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-clean-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-clean-xs"
                }`}
              >
                <span>All Orders</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {orders.length}
                </span>
              </button>

              {/* Tab: To Deliver (Alert highlighted) */}
              <button
                onClick={() => setActiveTab("to-deliver")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "to-deliver"
                    ? "bg-blue-600 text-white shadow-clean-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-clean-xs"
                }`}
              >
                <span className={activeTab === "to-deliver" ? "text-white" : "text-blue-600 font-bold"}>
                  To Deliver
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold animate-pulse">
                  {orders.filter((o) => o.tabCategory === "to-deliver").length}
                </span>
              </button>

              {/* Tab: Awaiting Buyer */}
              <button
                onClick={() => setActiveTab("awaiting")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "awaiting"
                    ? "bg-blue-600 text-white shadow-clean-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-clean-xs"
                }`}
              >
                <span>Awaiting Buyer</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  {orders.filter((o) => o.tabCategory === "awaiting").length}
                </span>
              </button>

              {/* Tab: Completed */}
              <button
                onClick={() => setActiveTab("completed")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "completed"
                    ? "bg-blue-600 text-white shadow-clean-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-clean-xs"
                }`}
              >
                <span>Completed</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  {orders.filter((o) => o.tabCategory === "completed").length}
                </span>
              </button>

              {/* Tab: Cancelled */}
              <button
                onClick={() => setActiveTab("cancelled")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "cancelled"
                    ? "bg-blue-600 text-white shadow-clean-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-clean-xs"
                }`}
              >
                <span>Cancelled</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold">
                  {orders.filter((o) => o.tabCategory === "cancelled").length}
                </span>
              </button>

              {/* Tab: Disputes */}
              <button
                onClick={() => setActiveTab("disputes")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "disputes"
                    ? "bg-rose-600 text-white shadow-clean-sm"
                    : "bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 shadow-clean-xs"
                }`}
              >
                <span className="font-bold">Disputes</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold">
                  {orders.filter((o) => o.tabCategory === "disputes").length}
                </span>
              </button>
            </div>

            {/* Action Tools: Date Window & Filters */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() =>
                  setDateFilter(
                    dateFilter === "Last 30 Days" ? "Last 7 Days" : "Last 30 Days"
                  )
                }
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-700 font-bold text-xs shadow-clean-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{dateFilter}</span>
              </button>
              <button
                onClick={() => setActionNotice("Filters applied: Showing active merchant ledger.")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-700 font-bold text-xs shadow-clean-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. ORDERS CATALOG LIST (MATCHING PROTOTYPE EXACTLY)                      */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-clean-sm">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-headline font-bold text-base text-slate-900">
                No orders match your filter
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Try switching filter tabs or clearing your search term.
              </p>
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = !!selectedOrders[order.id];

              return (
                <article
                  key={order.id}
                  className="p-4 md:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-clean-sm hover:shadow-clean-md transition-all relative overflow-hidden"
                >
                  {/* Accent Left Indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.indicatorColor}`} />

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Product Media + Meta details */}
                    <div className="flex items-start gap-3.5 md:gap-4 flex-1 min-w-0">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-inner">
                        <img
                          src={order.image}
                          alt={order.imageAlt}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                          {order.category}
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        {/* Badges & Tagging */}
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {order.statusBadge.variant === "urgent" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
                              <Zap className="w-3 h-3 fill-amber-700 text-amber-700" />
                              <span>{order.statusBadge.label}</span>
                            </span>
                          )}

                          {order.statusBadge.variant === "info" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                              <Clock className="w-3 h-3" />
                              <span>{order.statusBadge.label}</span>
                            </span>
                          )}

                          {order.statusBadge.variant === "delivered" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              <span>{order.statusBadge.label}</span>
                            </span>
                          )}

                          {order.statusBadge.variant === "dispute" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[11px] font-extrabold">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>{order.statusBadge.label}</span>
                            </span>
                          )}

                          {order.statusBadge.variant === "completed" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{order.statusBadge.label}</span>
                            </span>
                          )}

                          {order.subBadge && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                order.statusBadge.variant === "dispute"
                                  ? "text-rose-600"
                                  : "bg-blue-50/80 text-blue-700"
                              }`}
                            >
                              <span>{order.subBadge}</span>
                            </span>
                          )}

                          <span className="text-slate-400 text-[11px] font-semibold">
                            {order.platformText}
                          </span>
                        </div>

                        {/* Title */}
                        <h2
                          onClick={() => {
                            if (order.id === "SF-2024-88492") {
                              setActiveDeliverOrder(order);
                            } else if (order.category === "Key") {
                              setActiveKeyOrder(order);
                            }
                          }}
                          className="font-headline font-bold text-sm sm:text-base text-slate-900 tracking-tight line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {order.title}
                        </h2>

                        {/* Order info bar */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 text-xs mt-1">
                          <span className="font-mono font-bold text-slate-800">
                            {order.orderNumber}
                          </span>
                          <span>•</span>
                          <span>{order.timeText}</span>
                          <span>•</span>

                          {/* Buyer Pill */}
                          <div className="inline-flex items-center gap-1.5 text-slate-800 font-semibold">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                              {order.buyer.avatarInitials}
                            </span>
                            <span>{order.buyer.name}</span>
                            {order.buyer.rating && (
                              <span className="inline-flex items-center text-amber-500 font-bold text-[12px]">
                                ★ {order.buyer.rating}
                              </span>
                            )}
                            <span className="text-slate-400 font-normal text-[12px]">
                              ({order.buyer.purchasesCount} orders)
                            </span>
                          </div>
                        </div>

                        {/* Dispute reason box */}
                        {order.disputeReason && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/60 text-slate-700 text-xs flex items-center gap-2">
                            <Info className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span className="truncate">
                              {order.disputeReason}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Financial amount & Contextual Action Stack */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 shrink-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <div className="font-headline font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
                          ${order.price.toFixed(2)}
                        </div>

                        {order.statusBadge.variant === "urgent" && (
                          <div className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Safedeal Escrow Locked</span>
                          </div>
                        )}

                        {order.autoReleaseText && (
                          <div className="text-slate-500 text-[12px] font-medium">
                            {order.autoReleaseText}
                          </div>
                        )}

                        {order.subFinancialText && (
                          <div
                            className={`text-[12px] font-semibold ${
                              order.statusBadge.variant === "dispute"
                                ? "text-rose-600"
                                : "text-slate-500"
                            }`}
                          >
                            {order.subFinancialText}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveChatOrder(order)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Chat</span>
                        </button>

                        {/* Pending Delivery */}
                        {order.tabCategory === "to-deliver" && (
                          order.category === "Key" ? (
                            <button
                              onClick={() => setActiveKeyOrder(order)}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-clean-sm active:scale-98 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Digital Key</span>
                            </button>
                          ) : (
                            <Link
                              href={`/seller/orders/${order.id}`}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-clean-sm active:scale-98 cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Deliver Item</span>
                            </Link>
                          )
                        )}

                        {/* Awaiting Inspection */}
                        {order.tabCategory === "awaiting" && (
                          <button
                            onClick={() => setActiveProofOrder(order)}
                            className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Delivery Proof</span>
                          </button>
                        )}

                        {/* Dispute Opened */}
                        {order.tabCategory === "disputes" && (
                          <button
                            onClick={() => setActiveDisputeOrder(order)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-clean-sm cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Respond to Inquiry</span>
                          </button>
                        )}

                        {/* Completed */}
                        {order.tabCategory === "completed" && (
                          <>
                            <Link
                              href={`/seller/orders/${order.id}`}
                              className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </Link>
                            <button
                              onClick={() => setActiveInvoiceOrder(order)}
                              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Invoice</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* ========================================================================= */}
        {/* 4. BOTTOM BATCH OPS & PAGINATION                                          */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-clean-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left side: Batch Selection status */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Select All on Page</span>
              </label>
              <div className="hidden sm:flex items-center gap-2 text-slate-500 text-xs">
                <span>
                  Showing <strong className="text-slate-900">{filteredOrders.length}</strong> of 48 orders
                </span>
              </div>
            </div>

            {/* Right side: Clean Modern Pagination */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <button
                disabled
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-clean-xs">
                1
              </button>
              <button
                onClick={() => setActionNotice("Navigated to Orders Page 2")}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                2
              </button>
              <button
                onClick={() => setActionNotice("Navigated to Orders Page 3")}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button
                onClick={() => setActionNotice("Navigated to Orders Page 10")}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                10
              </button>
              <button
                onClick={() => setActionNotice("Navigated to Next Page")}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 5. SELLER HUB TAILORED FOOTER                                             */}
      {/* ========================================================================= */}
      <footer className="w-full bg-white border-t border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-headline font-black text-lg text-slate-900">Safedeal</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase">
                  Seller Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                High-velocity, bank-grade marketplace infrastructure for verified digital goods sellers, key distributors, and virtual currency merchants.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-blue-700 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Safedeal Shield Protected</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-emerald-700 text-[11px] font-bold">
                  <Zap className="w-3.5 h-3.5 fill-emerald-600" />
                  <span>Instant API Fulfillment</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-headline font-bold text-xs text-slate-900 mb-3">
                Seller Policies
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Seller Protection Policy
                  </Link>
                </li>
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Merchant Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Prohibited Items & Assets
                  </Link>
                </li>
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Verification Standard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline font-bold text-xs text-slate-900 mb-3">
                Operations & Finance
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Fee Schedules & Tiers
                  </Link>
                </li>
                <li>
                  <Link href="/seller/earnings" className="hover:text-blue-600 transition-colors">
                    Payout Timelines
                  </Link>
                </li>
                <li>
                  <Link href="/seller/earnings" className="hover:text-blue-600 transition-colors">
                    Tax & Invoice Center
                  </Link>
                </li>
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Escrow Security Protocol
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline font-bold text-xs text-slate-900 mb-3">
                Seller Support
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link href="/admin/disputes" className="hover:text-blue-600 transition-colors">
                    Dispute Resolution Desk
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-blue-600 transition-colors">
                    Seller Knowledge Base
                  </Link>
                </li>
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Chargeback Defense
                  </Link>
                </li>
                <li>
                  <Link href="/messages" className="hover:text-blue-600 transition-colors">
                    24/7 Merchant Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Safedeal Global Ltd. All rights reserved. Encrypted escrow marketplace.</p>
            <div className="flex items-center gap-4 text-[12px]">
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/protection" className="hover:text-slate-900 transition-colors">
                Security Overview
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE MODALS                                                     */}
      {/* ========================================================================= */}

      {/* Modal 1: Deliver Account Credentials */}
      {activeDeliverOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-clean-lg space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Instant Vault Handover
                </h3>
              </div>
              <button
                onClick={() => setActiveDeliverOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Buyer <strong>{activeDeliverOrder.buyer.name}</strong> paid ${activeDeliverOrder.price.toFixed(2)} in cold escrow. You have 38 minutes to deliver.
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Riot Username / Login ID
                </label>
                <input
                  type="text"
                  defaultValue="VAL_IMMORTAL_NA"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Current Account Password
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Original Email Address (OGE)
                </label>
                <input
                  type="email"
                  defaultValue="aerogaming.riot.original@mail.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveDeliverOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/orders/${activeDeliverOrder.id}/deliver`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        login: "riot_account_pro",
                        pass: "RiotMaster2024!",
                        ogeEmail: "aerogaming.riot.original@mail.com",
                      }),
                    });
                    const json = await res.json();
                    if (json.success) {
                      setActionNotice(
                        `Credentials vaulted and securely released to ${activeDeliverOrder.buyer.name}!`
                      );
                      loadSellerOrders();
                    } else {
                      setActionNotice(json.error || "Failed to deliver credentials.");
                    }
                  } catch (e) {
                    setActionNotice("Delivery request failed.");
                  }
                  setActiveDeliverOrder(null);
                  setTimeout(() => setActionNotice(null), 3500);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-clean-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Vault Credentials & Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Send Digital Key */}
      {activeKeyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-clean-lg space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Send Digital License Key
                </h3>
              </div>
              <button
                onClick={() => setActiveKeyOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/70 text-xs text-blue-900">
              Delivering for order <strong>{activeKeyOrder.orderNumber}</strong> (${activeKeyOrder.price.toFixed(2)}) to <strong>{activeKeyOrder.buyer.name}</strong>.
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enter License / Steam CD-Key
              </label>
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 uppercase"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveKeyOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/orders/${activeKeyOrder.id}/deliver`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        key: keyInput,
                      }),
                    });
                    const json = await res.json();
                    if (json.success) {
                      setActionNotice(`Key sent to ${activeKeyOrder.buyer.name}!`);
                      loadSellerOrders();
                    } else {
                      setActionNotice(json.error || "Failed to release key.");
                    }
                  } catch (e) {
                    setActionNotice("Key delivery failed.");
                  }
                  setActiveKeyOrder(null);
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-clean-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Release Key</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Chat with Buyer */}
      {activeChatOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-clean-lg space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Chat with {activeChatOrder.buyer.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveChatOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-44 overflow-y-auto space-y-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div className="text-right">
                <span className="inline-block bg-blue-600 text-white p-2.5 rounded-2xl rounded-tr-none text-left max-w-xs leading-relaxed">
                  Hi {activeChatOrder.buyer.name}! Thanks for your purchase of {activeChatOrder.title}. Your order is actively being processed via automated escrow.
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Today 2:15 PM</span>
              </div>
              <div className="text-left">
                <span className="inline-block bg-white border border-slate-200 p-2.5 rounded-2xl rounded-tl-none text-slate-900 max-w-xs leading-relaxed">
                  Sounds great! Looking forward to testing it once delivered.
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Today 2:16 PM</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={`Type a message to ${activeChatOrder.buyer.name}...`}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  setActionNotice(`Sent reply to ${activeChatOrder.buyer.name}`);
                  setActiveChatOrder(null);
                  setChatMessage("");
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Respond to Dispute */}
      {activeDisputeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-clean-lg space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Dispute Desk: {activeDisputeOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveDisputeOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1">
              <p className="font-bold">Buyer Claim: Phone Verification Prompt</p>
              <p className="text-slate-600 text-[12px] leading-relaxed">
                {activeDisputeOrder.disputeReason}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Provide Verification / Confirmation Code
              </label>
              <input
                type="text"
                value={disputeResponse}
                onChange={(e) => setDisputeResponse(e.target.value)}
                placeholder="Enter 6-digit SMS / Email code or resolution note..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveDisputeOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setActionNotice("Evidence submitted to Safedeal live arbitration desk. Escrow will resolve shortly.");
                  setActiveDisputeOrder(null);
                  setTimeout(() => setActionNotice(null), 3500);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-clean-sm cursor-pointer"
              >
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Delivery Proof Snapshot */}
      {activeProofOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-clean-lg space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Escrow Delivery Audit Trail
                </h3>
              </div>
              <button
                onClick={() => setActiveProofOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-slate-500 font-medium">Order Number:</p>
                <p className="font-mono font-bold text-slate-900">{activeProofOrder.orderNumber}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-slate-500 font-medium">Encrypted Vault Hash:</p>
                <p className="font-mono text-[12px] text-slate-700 break-all">
                  sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                <p className="font-bold">Status: Bot Verified Settlement</p>
                <p className="text-[12px] text-slate-600">
                  Transferred via institutional multi-sig vault. Buyer has 22 hours remaining to inspect before final disbursement.
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setActiveProofOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Invoice View */}
      {activeInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-clean-lg space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Merchant Sales Receipt
                </h3>
              </div>
              <button
                onClick={() => setActiveInvoiceOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Item Subtotal:</span>
                <span className="font-bold text-slate-900">${activeInvoiceOrder.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Safedeal Tier 3 Fee (2.5%):</span>
                <span className="font-bold text-slate-900">-${(activeInvoiceOrder.price * 0.025).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dispute Insurance:</span>
                <span className="font-bold text-emerald-600">FREE ($0.00)</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm text-slate-900">
                <span>Net Credited to Balance:</span>
                <span className="text-emerald-600 font-headline">
                  ${(activeInvoiceOrder.price * 0.975).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionNotice("Receipt PDF exported to downloads.");
                  setActiveInvoiceOrder(null);
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
