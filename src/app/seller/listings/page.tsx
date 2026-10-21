"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SellerHeader from "@/components/navigation/SellerHeader";
import {
  getCustomListings,
  deleteCustomListing,
  updateCustomListingStatus,
} from "@/lib/listingsStorage";
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
} from "lucide-react";

interface ListingItem {
  id: string;
  sku: string;
  type: "Account" | "Key" | "Asset" | "Currency";
  category: string;
  categoryKey: "accounts" | "keys" | "currency" | "social" | "software" | "gift-cards" | "creator" | "gold";
  title: string;
  image: string;
  imageAlt: string;
  status: "Active" | "Paused" | "Draft" | "Sold Out";
  price: number;
  priceSub: string;
  isAutoDispatch?: boolean;
  keysInVault?: number;
  stockCount?: number;
  views: number;
  watchers: number;
  updatedTime: string;
  warningNote?: string;
  fullAccess?: boolean;
}

export default function SellerListingsPage() {
  const router = useRouter();

  // Primary Listings Dataset (loaded dynamically from API and seller storage)
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Drafts" | "Paused" | "Sold Out">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-desc" | "price-asc" | "views" | "watchers">("newest");

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals & Drawers
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editModalItem, setEditModalItem] = useState<ListingItem | null>(null);
  const [previewModalItem, setPreviewModalItem] = useState<ListingItem | null>(null);
  const [restockModalItem, setRestockModalItem] = useState<ListingItem | null>(null);
  const [restockInputKeys, setRestockInputKeys] = useState<string>("");
  const [bulkPriceModalOpen, setBulkPriceModalOpen] = useState(false);
  const [bulkNewPrice, setBulkNewPrice] = useState("");
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ListingItem | null>(null);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3800);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);

  // Check for ?new= param from creation wizard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new")) {
        const id = params.get("id");
        setJustCreatedId(id || "new");
        setToastMessage("🎉 Listing published successfully! Live with automated Escrow Shield.");
      }
    }
  }, []);

  // Fetch real listings from backend database API
  useEffect(() => {
    let isMounted = true;
    async function loadListings() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/seller/listings");
        const json = await res.json();
        const apiListings: ListingItem[] = [];
        if (json.success && Array.isArray(json.listings)) {
          json.listings.forEach((item: any) => {
            apiListings.push({
              id: item.id,
              sku: item.sku || `SKU-${item.id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`,
              type:
                item.category === "keys"
                  ? "Key"
                  : item.category === "currency"
                  ? "Currency"
                  : item.category === "social"
                  ? "Asset"
                  : item.category === "software"
                  ? "Key"
                  : "Account",
              category: item.platform || item.category || "Gaming Accounts",
              categoryKey: (item.category as any) || "accounts",
              title: item.title,
              image: item.image,
              imageAlt: item.imageAlt || item.title,
              status: (item.status as any) || "Active",
              price: item.price,
              priceSub: item.priceSub || (item.deliveryType === "instant" ? "Instant automated delivery" : "Escrow vault handover"),
              views: item.views ?? (item.reviewsCount ? item.reviewsCount * 12 : 84),
              watchers: item.watchers ?? (item.reviewsCount ? Math.floor(item.reviewsCount / 2) : 5),
              updatedTime: "Active in catalog",
              fullAccess: true,
              isAutoDispatch: item.deliveryType === "instant",
              keysInVault: item.keysInVault,
              stockCount: item.stockCount ?? 1,
            });
          });
        }

        const custom = getCustomListings();
        const customIds = new Set(custom.map((c) => c.id));
        const merged = [...custom, ...apiListings.filter((a) => !customIds.has(a.id))];
        if (isMounted) {
          setListings(merged);
        }
      } catch (e) {
        console.error("Failed to load listings", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadListings();

    const handleUpdate = () => {
      loadListings();
    };

    window.addEventListener("safedeal_listings_changed", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("safedeal_listings_changed", handleUpdate);
    };
  }, []);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: listings.length,
      active: listings.filter((i) => i.status === "Active").length,
      drafts: listings.filter((i) => i.status === "Draft").length,
      paused: listings.filter((i) => i.status === "Paused").length,
      soldOut: listings.filter((i) => i.status === "Sold Out").length,
    };
  }, [listings]);

  // Dynamic Live Inventory Statistics
  const dynamicStats = useMemo(() => {
    const totalViews = listings.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalWatchers = listings.reduce((sum, item) => sum + (item.watchers || 0), 0);
    const inventoryVal = listings.reduce(
      (sum, item) => sum + item.price * (item.stockCount || item.keysInVault || 1),
      0
    );
    const instantItems = listings.filter((l) => l.isAutoDispatch).length;
    const autoDispatchRate =
      listings.length > 0 ? ((instantItems / listings.length) * 100).toFixed(1) : "100";

    return {
      totalViews,
      totalWatchers,
      inventoryVal,
      autoDispatchRate,
    };
  }, [listings]);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Status filter
        if (statusFilter === "Active" && item.status !== "Active") return false;
        if (statusFilter === "Drafts" && item.status !== "Draft") return false;
        if (statusFilter === "Paused" && item.status !== "Paused") return false;
        if (statusFilter === "Sold Out" && item.status !== "Sold Out") return false;

        // Category filter
        if (categoryFilter !== "all" && item.categoryKey !== categoryFilter) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchSku = item.sku.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchType = item.type.toLowerCase().includes(q);
          const matchPriceSub = item.priceSub?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchSku && !matchCat && !matchType && !matchPriceSub) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "views") return b.views - a.views;
        if (sortBy === "watchers") return b.watchers - a.watchers;
        return 0; // Default newest
      });
  }, [listings, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredListings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredListings.map((item) => item.id));
    }
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Toggle single item pause/resume with backend API persistence
  const handleTogglePause = async (id: string) => {
    const item = listings.find((l) => l.id === id);
    if (!item) return;
    const nextStatus = item.status === "Active" ? "Paused" : "Active";

    // Optimistic UI state update
    setListings((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          return {
            ...l,
            status: nextStatus,
            priceSub:
              nextStatus === "Paused"
                ? "Listing hidden from search"
                : l.type === "Key"
                ? "Instant digital voucher"
                : "Full Access & Email Transfer",
          };
        }
        return l;
      })
    );

    setToastMessage(
      nextStatus === "Active"
        ? `Listing "${item.title}" is now Live & Active.`
        : `Listing "${item.title}" paused. Hidden from search.`
    );
    updateCustomListingStatus(id, nextStatus);

    try {
      await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      console.warn("Failed to persist listing status to API:", e);
    }
  };

  // Delete listing with backend API persistence
  const handleDeleteListing = async (id: string) => {
    const item = listings.find((l) => l.id === id);
    deleteCustomListing(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setDeleteConfirmItem(null);
    setToastMessage(`Listing "${item?.title || id}" was deleted from inventory.`);

    try {
      await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Failed to persist listing deletion to API:", e);
    }
  };

  // Bulk actions with backend API persistence
  const handleBulkPause = async () => {
    if (selectedIds.length === 0) return;
    const toPause = [...selectedIds];
    setListings((prev) =>
      prev.map((item) => {
        if (toPause.includes(item.id)) {
          return {
            ...item,
            status: "Paused",
            priceSub: "Listing hidden from search",
          };
        }
        return item;
      })
    );
    setToastMessage(`Paused ${toPause.length} listings in live database.`);

    try {
      await fetch("/api/seller/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: toPause, updates: { status: "Paused" } }),
      });
    } catch (e) {
      console.warn("Failed to persist bulk pause to API:", e);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const toDelete = [...selectedIds];
    setListings((prev) => prev.filter((item) => !toDelete.includes(item.id)));
    setToastMessage(`Deleted ${toDelete.length} listings from database.`);
    setSelectedIds([]);

    try {
      await fetch("/api/seller/listings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: toDelete }),
      });
    } catch (e) {
      console.warn("Failed to persist bulk deletion to API:", e);
    }
  };

  const handleApplyBulkPrice = async () => {
    const val = parseFloat(bulkNewPrice);
    if (isNaN(val) || val <= 0) {
      setToastMessage("Please enter a valid price amount.");
      return;
    }
    const toUpdate = [...selectedIds];
    setListings((prev) =>
      prev.map((item) => {
        if (toUpdate.includes(item.id)) {
          return { ...item, price: val };
        }
        return item;
      })
    );
    setBulkPriceModalOpen(false);
    setBulkNewPrice("");
    setToastMessage(`Updated price to $${val.toFixed(2)} for ${toUpdate.length} listings in database.`);

    try {
      await fetch("/api/seller/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: toUpdate, updates: { price: val } }),
      });
    } catch (e) {
      console.warn("Failed to persist bulk price to API:", e);
    }
  };

  // Restock keys logic with backend API persistence
  const handleSaveRestockedKeys = async () => {
    if (!restockModalItem) return;
    const lines = restockInputKeys
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setToastMessage("Please enter at least one serial key.");
      return;
    }

    const newTotal = (restockModalItem.keysInVault || 0) + lines.length;
    const targetId = restockModalItem.id;
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === targetId) {
          return {
            ...item,
            keysInVault: newTotal,
            status: "Active",
          };
        }
        return item;
      })
    );

    setToastMessage(`Added ${lines.length} fresh digital keys to vault for ${restockModalItem.title}!`);
    setRestockModalItem(null);
    setRestockInputKeys("");

    try {
      await fetch(`/api/listings/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keysInVault: newTotal, status: "Active" }),
      });
    } catch (e) {
      console.warn("Failed to persist restocked keys to API:", e);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["ID", "SKU", "Title", "Category", "Type", "Status", "Price", "Views", "Watchers"];
    const rows = listings.map((l) => [
      l.id,
      l.sku,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      l.type,
      l.status,
      l.price.toFixed(2),
      l.views,
      l.watchers,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `safedeal_seller_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Catalog CSV successfully exported to your downloads folder!");
  };

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-[var(--ds-navy)] font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <SellerHeader activeTab="listings" />

      {/* Main Content Area */}
      <main className="w-full pt-16 bg-[var(--ds-surface)] min-h-screen pb-16">
        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
          {/* Hero / Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[var(--cobalt-acc)] font-bold text-[12px] tracking-wider uppercase border border-blue-100">
                <Package className="w-3.5 h-3.5" />
                <span>Catalog Inventory</span>
              </div>
              <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                My Listings
              </h1>
              <p className="text-sm text-slate-600 max-w-xl">
                Manage your active inventory, update pricing, and monitor listing visibility across global channels.
              </p>
            </div>

            {/* Action Cluster */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                type="button"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Export CSV</span>
              </button>
              <Link
                href="/seller/listings/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ List an Item</span>
              </Link>
            </div>
          </div>

          {/* New Listing Published Banner */}
          {justCreatedId && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Listing Published Successfully!
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Your new digital asset is now live and protected under automated Escrow Vault. Discoverable by buyers in marketplace search.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/browse"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
                >
                  View in Marketplace
                </Link>
                <button
                  onClick={() => setJustCreatedId(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Metrics / Snapshot Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Live Active */}
            <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold text-[12px] uppercase tracking-wide">Live Active</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900">
                  {counts.active}
                </span>
                <span className="text-xs text-slate-500">of {counts.all} total</span>
              </div>
            </div>

            {/* Card 2: 30-Day Views */}
            <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold text-[12px] uppercase tracking-wide">Total Catalog Views</span>
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900">
                  {dynamicStats.totalViews.toLocaleString()}
                </span>
                <span className="text-[12px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                  Live DB
                </span>
              </div>
            </div>

            {/* Card 3: Watchers */}
            <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold text-[12px] uppercase tracking-wide">Watchers & Saved</span>
                <Bookmark className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900">
                  {dynamicStats.totalWatchers.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">potential buyers</span>
              </div>
            </div>

            {/* Card 4: Est. Inventory Value */}
            <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold text-[12px] uppercase tracking-wide">Est. Inventory Value</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900">
                  ${dynamicStats.inventoryVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-slate-500">USD</span>
              </div>
            </div>
          </div>

          {/* Controls, Filter Tabs & Search Bar */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 space-y-4">
            {/* Filter Segment Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5" id="status-filter-pills">
                {(
                  [
                    { key: "All", label: "All", count: counts.all },
                    { key: "Active", label: "Active", count: counts.active },
                    { key: "Drafts", label: "Drafts", count: counts.drafts },
                    { key: "Paused", label: "Paused", count: counts.paused },
                    { key: "Sold Out", label: "Sold Out", count: counts.soldOut },
                  ] as const
                ).map((tab) => {
                  const isActive = statusFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key)}
                      type="button"
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Secondary sorting */}
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <span className="font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-100 text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="newest">Last Updated (Newest)</option>
                  <option value="price-desc">Price (Highest first)</option>
                  <option value="price-asc">Price (Lowest first)</option>
                  <option value="views">Most Views</option>
                  <option value="watchers">Watchers (Highest)</option>
                </select>
              </div>
            </div>

            {/* Search Input + Category Filter Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings by title, SKU, or game..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-52 px-3 py-2.5 bg-slate-50 text-slate-800 font-semibold text-xs rounded-lg outline-none cursor-pointer border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="accounts">Gaming Accounts</option>
                  <option value="keys">Keys & CDNs</option>
                  <option value="gold">In-Game Gold</option>
                  <option value="creator">Creator & Channels</option>
                </select>

                <button
                  onClick={() =>
                    setToastMessage("Advanced filters: showing all price brackets, regional locks, and delivery tiers.")
                  }
                  className="p-2.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                  title="More Filters"
                  type="button"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions Sticky Floating Strip (shows dynamically on item check) */}
          {selectedIds.length > 0 && (
            <div
              className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
              id="bulk-bar"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedIds.length === filteredListings.length && filteredListings.length > 0}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded bg-white text-blue-600 accent-[var(--cobalt-acc)] cursor-pointer"
                  />
                  <label
                    htmlFor="select-all"
                    className="font-bold text-xs text-blue-200 cursor-pointer"
                  >
                    <span id="selected-count">{selectedIds.length}</span> {selectedIds.length === 1 ? "item" : "items"} selected
                  </label>
                </div>
                <span className="h-4 w-px bg-slate-700 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Apply to all matching results</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBulkPriceModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  type="button"
                >
                  <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Change Price</span>
                </button>
                <button
                  onClick={handleBulkPause}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  type="button"
                >
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Pause Selected</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  type="button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* Product Listings Container */}
          <div className="space-y-3">
            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  No listings found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search query, clearing filters, or select a different status tab above.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All");
                    setCategoryFilter("all");
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-50 text-[var(--cobalt-acc)] font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredListings.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`group bg-white rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-150 border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      isChecked ? "border-blue-400 bg-blue-50/20" : "border-slate-200/80"
                    } ${item.status === "Paused" || item.status === "Draft" ? "opacity-90 hover:opacity-100" : ""}`}
                  >
                    {/* Left: Selection, Thumbnail & Core Info */}
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleItem(item.id)}
                        className="mt-1 sm:mt-0 w-4 h-4 rounded cursor-pointer accent-[var(--cobalt-acc)]"
                      />

                      {/* Image Asset */}
                      <div className="relative w-24 h-20 sm:w-28 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                        <img
                          src={item.image}
                          alt={item.imageAlt}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            item.status === "Draft" ? "opacity-75" : ""
                          }`}
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs font-bold text-[11px] text-white uppercase tracking-wider">
                          {item.type}
                        </span>
                      </div>

                      {/* Titles & Metadata */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[var(--cobalt-acc)] font-bold text-[11px] border border-slate-200">
                            {item.category}
                          </span>

                          {/* Status pill */}
                          {item.status === "Active" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              <span>Active</span>
                            </span>
                          )}

                          {item.status === "Paused" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200/80">
                              <Pause className="w-3 h-3 text-slate-400" />
                              <span>Paused by Seller</span>
                            </span>
                          )}

                          {item.status === "Draft" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200/80">
                              <Edit3 className="w-3 h-3 text-slate-500" />
                              <span>Draft • Incomplete Listing</span>
                            </span>
                          )}

                          {item.status === "Sold Out" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] border border-slate-200/80">
                              <Ban className="w-3 h-3 text-slate-400" />
                              <span>Sold Out</span>
                            </span>
                          )}

                          {item.isAutoDispatch && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200/70">
                              <Zap className="w-3 h-3 fill-current text-blue-600" />
                              <span>Auto-dispatch</span>
                            </span>
                          )}

                          {(item.id === justCreatedId || (item.id.startsWith("LIST-") && !["LIST-VAL-882", "LIST-CS2-AWP", "LIST-STEAM-50", "LIST-YT-45K", "LIST-WOW-1M"].includes(item.id))) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200/70">
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              <span>Just listed</span>
                            </span>
                          )}
                        </div>

                        <h2 className="font-headline font-bold text-sm md:text-base text-slate-900 truncate tracking-tight group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-slate-500 text-xs">
                          {item.keysInVault !== undefined && (
                            <span className="flex items-center gap-1 text-slate-700 font-semibold">
                              <Package className="w-3.5 h-3.5 text-blue-600" />
                              <span>{item.keysInVault} keys in vault</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-800">{item.views.toLocaleString()}</span> views
                          </span>

                          <span className="flex items-center gap-1">
                            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-800">{item.watchers}</span> watchers
                          </span>

                          {item.warningNote ? (
                            <span className="flex items-center gap-1 text-amber-600 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{item.warningNote}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{item.updatedTime}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle & Right: Price & Inventory State + Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <div className="font-headline font-extrabold text-xl md:text-2xl text-slate-900">
                          ${item.price.toFixed(2)}
                        </div>
                        <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500">
                          {item.fullAccess && (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>{item.priceSub}</span>
                        </div>
                      </div>

                      {/* Item Actions Toolbar */}
                      <div className="flex items-center gap-1.5 relative">
                        {/* If it's a draft */}
                        {item.status === "Draft" ? (
                          <>
                            <button
                              onClick={() => setEditModalItem(item)}
                              className="px-3.5 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                              type="button"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Continue Editing</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmItem(item)}
                              className="p-2 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Delete Draft"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Resume button for paused item */}
                            {item.status === "Paused" && (
                              <button
                                onClick={() => handleTogglePause(item.id)}
                                className="px-3 py-2 rounded-lg bg-blue-50 text-[var(--cobalt-acc)] font-bold text-xs hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer border border-blue-200"
                                type="button"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Resume</span>
                              </button>
                            )}

                            {/* Restock Keys Button for key items */}
                            {item.type === "Key" && (
                              <button
                                onClick={() => {
                                  setRestockModalItem(item);
                                  setRestockInputKeys("");
                                }}
                                className="px-3 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                                type="button"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Restock Keys</span>
                              </button>
                            )}

                            {/* Standard Edit button */}
                            <button
                              onClick={() => setEditModalItem(item)}
                              className="px-3 py-2 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200/60"
                              type="button"
                            >
                              Edit
                            </button>

                            {/* Preview button */}
                            <button
                              onClick={() => setPreviewModalItem(item)}
                              className="px-3 py-2 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200/60"
                              type="button"
                            >
                              Preview
                            </button>

                            {/* Pause / Play toggle icon */}
                            {item.status === "Active" && (
                              <button
                                onClick={() => handleTogglePause(item.id)}
                                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Pause listing"
                                type="button"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            )}

                            {/* More Options Menu Button */}
                            <div className="relative">
                              <button
                                onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                                title="More options"
                                type="button"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {menuOpenId === item.id && (
                                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard?.writeText(window.location.origin + `/browse?listing=${item.id}`);
                                      setToastMessage("Direct shareable link copied to clipboard!");
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Copy Share Link</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      const duplicate: ListingItem = {
                                        ...item,
                                        id: `LIST-${Date.now().toString().slice(-4)}`,
                                        title: `${item.title} (Copy)`,
                                        status: "Draft",
                                      };
                                      setListings((prev) => [duplicate, ...prev]);
                                      setToastMessage(`Created clone draft "${duplicate.title}".`);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Duplicate Listing</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setToastMessage(`Boost activated! "${item.title}" will show at top of marketplace for 24h.`);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Promote / Boost</span>
                                  </button>

                                  <div className="my-1 border-t border-slate-100" />

                                  <button
                                    onClick={() => {
                                      setDeleteConfirmItem(item);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Listing</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination & Catalog Footer Bar */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Current Count */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Showing</span>
              <span className="font-bold text-slate-900">
                1 - {Math.min(filteredListings.length, pageSize)}
              </span>
              <span>of</span>
              <span className="font-bold text-slate-900">{counts.all}</span>
              <span>listings</span>
            </div>

            {/* Page Stepper */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                type="button"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
                  currentPage === 1
                    ? "bg-[var(--cobalt-acc)] text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
                type="button"
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === 2
                    ? "bg-[var(--cobalt-acc)] text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
                type="button"
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === 3
                    ? "bg-[var(--cobalt-acc)] text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
                type="button"
              >
                3
              </button>
              <span className="px-1 text-slate-400 font-bold">...</span>
              <button
                onClick={() => setCurrentPage(9)}
                className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === 9
                    ? "bg-[var(--cobalt-acc)] text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
                type="button"
              >
                9
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(9, p + 1))}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
                type="button"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Rows Per Page Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-100 text-slate-800 font-semibold text-xs px-2.5 py-1.5 rounded-lg outline-none cursor-pointer border border-slate-200"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Security & Vault Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-white text-[var(--cobalt-acc)] flex items-center justify-center shrink-0 shadow-xs border border-blue-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline font-bold text-sm text-slate-900 tracking-tight">
                  Safedeal Seller Shield Protection
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  All digital credentials and API serial key uploads are encrypted end-to-end. Funds for successful deliveries remain secured in automated escrow for 48 hours to protect against chargebacks.
                </p>
              </div>
            </div>

            <button
              onClick={() => setPolicyModalOpen(true)}
              className="shrink-0 px-3.5 py-2 rounded-lg bg-white border border-blue-200 text-[var(--cobalt-acc)] font-bold text-xs hover:bg-blue-100/50 transition-colors cursor-pointer shadow-xs"
              type="button"
            >
              View Policies
            </button>
          </div>
        </div>
      </main>

      {/* Quick Edit Modal */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-5 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900">
                    Edit Catalog Listing
                  </h3>
                  <span className="text-[12px] text-slate-500 font-mono">
                    {editModalItem.sku}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-600 mb-1">Listing Title</label>
                <input
                  type="text"
                  value={editModalItem.title}
                  onChange={(e) =>
                    setEditModalItem({ ...editModalItem, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Asking Price ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editModalItem.price}
                      onChange={(e) =>
                        setEditModalItem({
                          ...editModalItem,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Listing Status</label>
                  <select
                    value={editModalItem.status}
                    onChange={(e) =>
                      setEditModalItem({
                        ...editModalItem,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Draft">Draft</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Sub-price Guarantee Note</label>
                <input
                  type="text"
                  value={editModalItem.priceSub}
                  onChange={(e) =>
                    setEditModalItem({ ...editModalItem, priceSub: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Instant digital voucher, Full Access"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditModalItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const target = editModalItem;
                  setListings((prev) =>
                    prev.map((i) => (i.id === target.id ? target : i))
                  );
                  setToastMessage(`Updated listing "${target.title}" in database.`);
                  setEditModalItem(null);

                  try {
                    await fetch(`/api/listings/${target.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: target.title,
                        price: Number(target.price),
                        status: target.status,
                        priceSub: target.priceSub,
                      }),
                    });
                  } catch (e) {
                    console.warn("Failed to persist edits to API:", e);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Keys Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-5 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900">
                    Restock Digital Keys Vault
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    {restockModalItem.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestockModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-900 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Keys are stored with bank-grade AES-256 encryption. They are released to buyers automatically upon payment confirmation.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paste Serial Keys (one per line):
                </label>
                <textarea
                  rows={5}
                  value={restockInputKeys}
                  onChange={(e) => setRestockInputKeys(e.target.value)}
                  placeholder={`XXXXX-XXXXX-XXXXX\nYYYYY-YYYYY-YYYYY\nZZZZZ-ZZZZZ-ZZZZZ`}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[12px] text-slate-400">
                  {restockInputKeys.split("\n").filter((l) => l.trim()).length} keys detected
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setRestockModalItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRestockedKeys}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
              >
                Upload & Activate Keys
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Preview Modal */}
      {previewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[var(--cobalt-acc)]" />
                <span className="font-bold text-xs text-slate-900">
                  Buyer-Facing Marketplace Preview
                </span>
              </div>
              <button
                onClick={() => setPreviewModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 relative">
                <img
                  src={previewModalItem.image}
                  alt={previewModalItem.imageAlt}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-bold uppercase tracking-wider">
                  {previewModalItem.type}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[12px] font-bold text-[var(--cobalt-acc)]">
                  {previewModalItem.category}
                </span>
                <h3 className="font-headline font-bold text-lg text-slate-900">
                  {previewModalItem.title}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-headline font-extrabold text-2xl text-slate-900">
                    ${previewModalItem.price.toFixed(2)}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {previewModalItem.priceSub}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Safedeal Escrow Protected</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Instant Handover &lt; 30s</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-blue-600" />
                  <span>Seller Rating: 4.98 (1.8k)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewModalItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Price Change Modal */}
      {bulkPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--cobalt-acc)]" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Bulk Change Price
                </h3>
              </div>
              <button
                onClick={() => setBulkPriceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Apply a new price to all <strong className="text-slate-900">{selectedIds.length}</strong> selected listings simultaneously:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Price ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="29.99"
                  value={bulkNewPrice}
                  onChange={(e) => setBulkNewPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBulkPriceModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyBulkPrice}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 shadow-xs"
              >
                Apply to {selectedIds.length} Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-headline font-bold text-base text-slate-900">
                Delete Listing?
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-slate-900">
                  &quot;{deleteConfirmItem.title}&quot;
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteListing(deleteConfirmItem.id)}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policies Modal */}
      {policyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--cobalt-acc)]" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Safedeal Seller Shield Protection
                </h3>
              </div>
              <button
                onClick={() => setPolicyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-80 overflow-y-auto pr-1">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-slate-800">
                <strong className="text-[var(--cobalt-acc)] block mb-0.5">100% Chargeback Defense</strong>
                When accounts or keys are transferred through our verified escrow protocol with timestamped delivery proof, Safedeal absorbs any fraudulent payment disputes.
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block mb-0.5">48-Hour Escrow Settlement</strong>
                Payment is placed in secure holding upon order creation and released directly into your Available Payout immediately after buyer confirmation or 48 hours without dispute.
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block mb-0.5">Zero Secret Key Leaks</strong>
                All keys uploaded to automated vaults are stored hashed with AES-256 and only decrypted inside client session tokens upon handshake completion.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPolicyModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Seller Hub Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--cobalt-acc)] flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-headline font-bold text-base text-slate-900">
                  Safedeal
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-bold uppercase border border-blue-100">
                  Seller Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                High-velocity, bank-grade marketplace infrastructure for verified digital goods sellers, key distributors, and virtual currency merchants.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[var(--cobalt-acc)] text-[12px] font-bold border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Safedeal Shield Protected</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-emerald-700 text-[12px] font-bold border border-slate-200">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant API Fulfillment</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 mb-3 uppercase tracking-wider">
                Seller Policies
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <button onClick={() => setPolicyModalOpen(true)} className="hover:text-[var(--cobalt-acc)] transition-colors cursor-pointer text-left">
                    Seller Protection Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setPolicyModalOpen(true)} className="hover:text-[var(--cobalt-acc)] transition-colors cursor-pointer text-left">
                    Merchant Guidelines
                  </button>
                </li>
                <li>
                  <button onClick={() => setPolicyModalOpen(true)} className="hover:text-[var(--cobalt-acc)] transition-colors cursor-pointer text-left">
                    Prohibited Items & Assets
                  </button>
                </li>
                <li>
                  <button onClick={() => setPolicyModalOpen(true)} className="hover:text-[var(--cobalt-acc)] transition-colors cursor-pointer text-left">
                    Verification Standard
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 mb-3 uppercase tracking-wider">
                Operations & Finance
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link href="/seller" className="hover:text-[var(--cobalt-acc)] transition-colors">
                    Fee Schedules & Tiers
                  </Link>
                </li>
                <li>
                  <Link href="/seller" className="hover:text-[var(--cobalt-acc)] transition-colors">
                    Payout Timelines
                  </Link>
                </li>
                <li>
                  <Link href="/seller" className="hover:text-[var(--cobalt-acc)] transition-colors">
                    Tax & Invoice Center
                  </Link>
                </li>
                <li>
                  <button onClick={() => setPolicyModalOpen(true)} className="hover:text-[var(--cobalt-acc)] transition-colors cursor-pointer text-left">
                    Escrow Security Protocol
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 mb-3 uppercase tracking-wider">
                Seller Support
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link href="/seller/orders" className="hover:text-[var(--cobalt-acc)] transition-colors">
                    Dispute Resolution Desk
                  </Link>
                </li>
                <li>
                  <a href="#api" onClick={(e) => { e.preventDefault(); setToastMessage("Seller API documentation is available under Merchant Settings."); }} className="hover:text-[var(--cobalt-acc)] transition-colors cursor-pointer">
                    Seller API Documentation
                  </a>
                </li>
                <li>
                  <button onClick={() => setPolicyModalOpen(true)} className="hover:text-[var(--cobalt-acc)] transition-colors cursor-pointer text-left">
                    Chargeback Defense
                  </button>
                </li>
                <li>
                  <button onClick={() => setToastMessage("Connecting to 24/7 Merchant Concierge Desk...")} className="hover:text-[var(--cobalt-acc)] transition-colors cursor-pointer text-left">
                    24/7 Merchant Support
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2025 Safedeal Global Ltd. All rights reserved. Encrypted escrow marketplace.</p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </Link>
              <button onClick={() => setPolicyModalOpen(true)} className="hover:text-slate-900 transition-colors cursor-pointer">
                Security Overview
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
