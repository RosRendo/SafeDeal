"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateListingWizard from "@/components/seller/CreateListingWizard";
import SellerHeader from "@/components/navigation/SellerHeader";
import { getCustomListings } from "@/lib/listingsStorage";
import { getCurrentUser, onAuthChanged, AuthUser } from "@/lib/auth";
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
} from "lucide-react";

interface ListingItem {
  id: string;
  title: string;
  platform: string;
  region: string;
  price: number;
  stock: number;
  stockText: string;
  views: number;
  status: "Active" | "Auto-Fulfill" | "Sold Out";
  image: string;
}

export default function SellerHubPage() {
  const router = useRouter();

  // Mode: "hub" (default Seller Hub) vs "wizard" (List an Item)
  const [activeView, setActiveView] = useState<"hub" | "wizard">("hub");

  // Dynamic live states
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [attentionOrders, setAttentionOrders] = useState<any[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState<number>(0);
  const [activeListingsCount, setActiveListingsCount] = useState<number>(0);
  const [earningsSummary, setEarningsSummary] = useState<any>(null);

  // Shop Active state
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Modals state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("0.00");
  const [withdrawMethod, setWithdrawMethod] = useState<"wire" | "crypto" | "paypal">("wire");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [activeDeliveryOrder, setActiveDeliveryOrder] = useState<any | null>(null);
  const [activeChatOrder, setActiveChatOrder] = useState<any | null>(null);
  const [activeDisputeOrder, setActiveDisputeOrder] = useState<any | null>(null);

  const [editingItem, setEditingItem] = useState<ListingItem | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadSellerData = async () => {
    try {
      // 1. Load seller orders
      const ordRes = await fetch("/api/seller/orders");
      const ordJson = await ordRes.json();
      if (ordJson.success && Array.isArray(ordJson.orders)) {
        const urgent = ordJson.orders.filter(
          (o: any) => o.status === "active" || o.status === "disputed"
        );
        setAttentionOrders(urgent);
        const completed = ordJson.orders.filter(
          (o: any) => o.status === "delivered" || o.status === "completed"
        ).length;
        setCompletedOrdersCount(completed);
      }

      // 2. Load earnings summary
      const earnRes = await fetch("/api/seller/earnings");
      const earnJson = await earnRes.json();
      if (earnJson.success && earnJson.summary) {
        setEarningsSummary(earnJson.summary);
        setAvailableBalance(earnJson.summary.availableBalance ?? 0);
        setWithdrawAmount((earnJson.summary.availableBalance ?? 0).toFixed(2));
      }

      // 3. Load listings
      const listRes = await fetch("/api/seller/listings");
      const listJson = await listRes.json();
      const apiItems: ListingItem[] = [];
      const incoming = listJson.listings || listJson.data || [];
      if (listJson.success && Array.isArray(incoming)) {
        incoming.forEach((c: any) => {
          apiItems.push({
            id: c.id,
            title: c.title,
            platform: c.platform || "Digital Asset",
            region: c.region || "Global",
            price: c.price,
            stock: c.stockCount || c.keysInVault || 1,
            stockText: `${c.stockCount || c.keysInVault || 1} in stock`,
            views: c.views ?? (c.reviewsCount ? c.reviewsCount * 14 : 32),
            status: c.status || "Active",
            image: c.image,
          });
        });
      }
      const custom = getCustomListings();
      const customIds = new Set(custom.map((c) => c.id));
      const customMapped: ListingItem[] = custom.map((c) => ({
        id: c.id,
        title: c.title,
        platform: c.publisher + " / " + c.type,
        region: c.region,
        price: c.price,
        stock: c.stockCount || c.keysInVault || 1,
        stockText: `${c.stockCount || c.keysInVault || 1} in stock`,
        views: c.views,
        status: (c.status === "Draft" ? "Sold Out" : c.status) as any,
        image: c.image,
      }));
      const merged = [...customMapped, ...apiItems.filter((a) => !customIds.has(a.id))];
      setListings(merged);
      setActiveListingsCount(merged.filter((l) => l.status === "Active").length);
    } catch (e) {
      console.error("Failed to load seller dashboard data", e);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "new" || params.get("view") === "wizard") {
        setActiveView("wizard");
      }
    }

    setCurrentUser(getCurrentUser());
    const unsubAuth = onAuthChanged((u) => {
      setCurrentUser(u !== undefined ? u : getCurrentUser());
    });

    loadSellerData();

    const handleUpdate = () => {
      loadSellerData();
    };

    window.addEventListener("safedeal_listings_changed", handleUpdate);
    return () => {
      unsubAuth();
      window.removeEventListener("safedeal_listings_changed", handleUpdate);
    };
  }, []);
  // Wizard state (for List an Item)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [wizardTitle, setWizardTitle] = useState("Valorant Immortal 3 Account | Champions 2023 Vandal + Prime Karambit");
  const [wizardPrice, setWizardPrice] = useState(185);
  const [wizardCategory, setWizardCategory] = useState("accounts");
  const [isPublishing, setIsPublishing] = useState(false);

  const handleCopyStoreUrl = () => {
    navigator.clipboard.writeText("https://safedeal.com/store/aerogamingdeals");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSavePrice = async () => {
    if (!editingItem) return;
    const p = parseFloat(newPrice);
    if (isNaN(p) || p <= 0) return;

    setListings((prev) =>
      prev.map((item) => (item.id === editingItem.id ? { ...item, price: p } : item))
    );

    try {
      await fetch(`/api/listings/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: p }),
      });
    } catch (e) {
      console.warn("Failed to persist listing price to API:", e);
    }

    setActionNotice(`Updated price for ${editingItem.title} to $${p.toFixed(2)}`);
    setEditingItem(null);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleRestock = (item: ListingItem) => {
    setListings((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, stock: 5, stockText: "5 keys", status: "Active" } : l))
    );
    setActionNotice(`Restocked ${item.title} with 5 digital keys.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handlePromote = (item: ListingItem) => {
    setActionNotice(`🚀 Boosted "${item.title}" to Top Trending Carousel for 24 hours!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleConfirmWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > availableBalance) {
      setActionNotice("Invalid withdrawal amount.");
      setTimeout(() => setActionNotice(null), 3000);
      return;
    }

    try {
      const res = await fetch("/api/seller/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          method: withdrawMethod,
          destination: withdrawMethod === "wire" ? "Verified Bank (•••• 4920)" : "USDC TRC20",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawSuccess(true);
        setTimeout(() => {
          setWithdrawSuccess(false);
          setIsWithdrawModalOpen(false);
          setActionNotice(data.message || "Withdrawal processed successfully!");
          loadSellerData();
          setTimeout(() => setActionNotice(null), 4000);
        }, 800);
      } else {
        setActionNotice(data.error || "Withdrawal failed.");
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err: any) {
      setActionNotice("Withdrawal failed to connect to payout API.");
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ds-surface)] text-slate-900 font-sans antialiased">
      {/* 1. SELLER HUB NAVIGATION BAR */}
      <SellerHeader activeTab="store" />

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

      {/* MAIN CONTAINER */}
      <main className="w-full pt-16 bg-[var(--ds-surface)] min-h-screen flex-1 flex flex-col">
        {activeView === "wizard" ? (
          /* ===================================================================== */
          /* WIZARD VIEW: List an Item Flow (5-Step Stepper + Live Sticky Preview) */
          /* ===================================================================== */
          <CreateListingWizard
            onBack={() => setActiveView("hub")}
            onPublishSuccess={(data) => {
              setListings((prev) => [
                {
                  id: data.id,
                  title: data.title,
                  platform: `${data.publisher} / ${data.type}`,
                  region: data.region || "Global",
                  price: data.price || 195,
                  stock: 1,
                  stockText: "1 in stock",
                  views: 1,
                  status: "Active",
                  image: data.image,
                },
                ...prev.filter((p) => p.id !== data.id),
              ]);
              setActiveView("hub");
              setActionNotice(`Published "${data.title}" with Escrow Protection!`);
              setTimeout(() => setActionNotice(null), 4000);
            }}
          />
        ) : (
          /* ===================================================================== */
          /* HUB VIEW: Merchant Dashboard (Matching Provided HTML Prototype)       */
          /* ===================================================================== */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex flex-col gap-6">
            {/* 2. Warm Welcome Header — open composition */}
            <div className="rounded-3xl bg-paper-2 border border-line p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <div className="inline-flex flex-wrap items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isShopOpen ? "bg-cobalt sd-pulse" : "bg-ink-3"}`} />
                    <span className="text-[13px] uppercase tracking-[0.14em] text-ink-3 font-semibold">
                      {isShopOpen ? "Merchant active · Shop open" : "Merchant paused · Vacation mode"}
                    </span>
                    <button
                      onClick={() => setIsShopOpen(!isShopOpen)}
                      className="text-[13px] font-medium text-cobalt underline underline-offset-4 hover:text-cobalt-hover cursor-pointer"
                    >
                      {isShopOpen ? "Toggle vacation mode" : "Turn shop back on"}
                    </button>
                  </div>

                  {(() => {
                    const merchantName = currentUser?.role === "seller" ? currentUser.name : "AeroGamingDeals";
                    const merchantRating = currentUser?.rating?.toFixed(2) || "4.98";
                    const merchantDeals = currentUser?.dealCount
                      ? `${currentUser.dealCount.toLocaleString()} deals`
                      : "3,842 deals";
                    const storeSlug = merchantName.toLowerCase().replace(/[^a-z0-9]/g, "");

                    return (
                      <>
                        <h1 className="font-headline text-[38px] sm:text-[42px] leading-[1.05] tracking-tight text-ink">
                          Good afternoon, {merchantName.split(" ")[0]}.
                        </h1>
                        <p className="text-[16px] text-ink-2 max-w-[46ch] leading-relaxed">
                          Funds settle 48 hours after the buyer inspects. Every listing ships with escrow protection built in.
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[13px]">
                          <div className="inline-flex items-center gap-1.5 text-ink-2">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="font-semibold text-ink">{merchantRating}</span>
                            <span>({merchantDeals})</span>
                          </div>

                          <span className="w-px h-3.5 bg-line" />

                          <div className="inline-flex items-center gap-1.5 text-ink-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-verified" />
                            <span>Level 3 Verified Merchant</span>
                          </div>

                          <span className="w-px h-3.5 bg-line" />

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://safedeal.com/store/${storeSlug}`);
                              setCopiedUrl(true);
                              setTimeout(() => setCopiedUrl(false), 2000);
                            }}
                            className="inline-flex items-center gap-1 text-ink-2 hover:text-cobalt font-medium transition-colors cursor-pointer"
                          >
                            <span className="font-mono text-[13px] underline underline-offset-4 decoration-line">
                              safedeal.com/store/{storeSlug}
                            </span>
                            {copiedUrl ? (
                              <Check className="w-3 h-3 text-verified" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-3 pt-2 lg:pt-0">
                  <Link
                    href="/store/aerogamingdeals"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-paper border border-line hover:border-ink text-ink text-[16px] transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View storefront</span>
                  </Link>

                  <button
                    onClick={() => setActiveView("wizard")}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-[16px] font-medium transition-colors active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>List an item</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Quick Compact Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Stat 1: Needs Delivery */}
              <div className="bg-paper rounded-2xl p-4 border border-line shadow-clean-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Needs Delivery</div>
                    <div className="font-headline font-black text-base sm:text-lg text-slate-900">
                      {attentionOrders.length} Orders
                    </div>
                  </div>
                </div>
                {attentionOrders.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-line text-[12px] font-bold uppercase tracking-wider">
                    Action
                  </span>
                )}
              </div>

              {/* Stat 2: Active Listings */}
              <div className="bg-paper rounded-2xl p-4 border border-line shadow-clean-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Active Listings</div>
                  <div className="font-headline font-black text-base sm:text-lg text-slate-900">
                    {listings.length} Items
                  </div>
                </div>
              </div>

              {/* Stat 3: Completed This Month */}
              <div className="bg-paper rounded-2xl p-4 border border-line shadow-clean-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Completed This Month</div>
                  <div className="font-headline font-black text-base sm:text-lg text-slate-900">
                    {completedOrdersCount} Orders
                  </div>
                </div>
              </div>

              {/* Stat 4: Available Payout (Hero Financial Metric with Brand Blue Accent) */}
              <div className="bg-paper rounded-2xl p-4 border border-blue-200/80 shadow-clean-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Available Payout</div>
                    <div className="font-headline font-black text-base sm:text-lg text-slate-900">
                      ${availableBalance.toFixed(2)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Withdraw</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4. Main Content Grid (8 cols left, 4 cols right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Urgent Tasks + Recent Listings (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Needs Your Attention */}
                <section className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900">
                        Needs Your Attention
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[12px] font-bold border border-line/60">
                        {attentionOrders.length} Action Items
                      </span>
                    </div>
                    <Link href="/seller/orders" className="text-blue-600 hover:underline text-xs font-bold">
                      View full queue
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {attentionOrders.length === 0 ? (
                      <div className="bg-paper rounded-2xl p-8 border border-line shadow-clean-xs text-center">
                        <CheckCircle2 className="w-9 h-9 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-headline font-bold text-slate-900 text-sm">
                          All orders fulfilled! No urgent actions required.
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          New buyer purchases and escrow alerts will appear here in real time.
                        </p>
                      </div>
                    ) : (
                      attentionOrders.map((order: any) => (
                        <div
                          key={order.id}
                          className="bg-paper rounded-2xl p-4 border border-line shadow-clean-xs hover:shadow-clean-sm transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden relative border border-line">
                              <img
                                src={order.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"}
                                alt={order.itemTitle || "Order asset"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[12px] font-mono text-slate-500">
                                  {order.orderNumber || "#" + order.id}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[12px] font-semibold border border-line/60 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>{order.status === "disputed" ? "Dispute Opened" : "Inspection SLA Active"}</span>
                                </span>
                              </div>
                              <h3 className="font-headline font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                                {order.itemTitle || "Digital Asset Order"}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>
                                  Buyer: <strong className="text-slate-900 font-bold">{order.buyerName || "Authorized Buyer"}</strong>
                                </span>
                                <span>•</span>
                                <span className="font-extrabold text-slate-900">
                                  ${(typeof order.price === "number" ? order.price : 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                            <Link
                              href={`/seller/orders`}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-clean-xs cursor-pointer"
                            >
                              <span>Fulfill in Orders Desk</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <span className="text-[12px] text-slate-500 font-medium hidden sm:inline flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>Escrow Secured</span>
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Recently Updated Listings */}
                <section id="listings" className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900">
                        Recently Updated Listings
                      </h2>
                      <p className="text-xs text-slate-500">
                        Manage your inventory, adjust prices, or restock
                      </p>
                    </div>
                    <Link
                      href="/browse"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs font-bold"
                    >
                      <span>View all {listings.length} items</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="bg-paper rounded-3xl border border-line shadow-clean-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-[13px] font-bold uppercase tracking-wider border-b border-line">
                          <tr>
                            <th className="py-3 px-4">Listing Details</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">Stock</th>
                            <th className="py-3 px-4">Views</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {listings.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 px-4 text-center">
                                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <h3 className="font-headline font-bold text-slate-900 text-sm">
                                  No active listings in your store
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                  You have not created any listings yet. Create your first product or game account to start receiving orders.
                                </p>
                                <Link
                                  href="/seller/listings/new"
                                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-clean-xs"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Create First Listing</span>
                                </Link>
                              </td>
                            </tr>
                          ) : (
                            listings.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-line">
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-headline font-bold text-xs text-slate-900 truncate max-w-[200px] md:max-w-[260px]">
                                      {item.title}
                                    </span>
                                    <span className="text-[13px] text-slate-500">
                                      {item.platform} • {item.region}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-headline font-bold text-slate-900">
                                ${item.price.toFixed(2)}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded-md text-[12px] font-semibold bg-slate-100 text-slate-700 border border-line/60">
                                  {item.stockText}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-slate-500 font-medium">
                                {item.views.toLocaleString()}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-slate-100 text-slate-800 border border-line/60">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      item.status === "Active" || item.status === "Auto-Fulfill"
                                        ? "bg-blue-600"
                                        : "bg-slate-400"
                                    }`}
                                  />
                                  {item.status}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  {item.stock === 0 ? (
                                    <button
                                      onClick={() => handleRestock(item)}
                                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      Restock
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingItem(item);
                                          setNewPrice(item.price.toString());
                                        }}
                                        className="text-slate-600 hover:text-blue-600 text-xs font-bold cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <span className="text-slate-300">•</span>
                                      <button
                                        onClick={() => handlePromote(item)}
                                        className="text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                                      >
                                        Promote
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-line flex items-center justify-between text-xs text-slate-500">
                      <span>Showing {listings.length} active listings</span>
                      <Link
                        href="/browse"
                        className="px-3 py-1.5 rounded-xl bg-paper hover:bg-slate-100 text-slate-900 font-bold border border-line transition-colors shadow-clean-xs"
                      >
                        Open Full Catalog →
                      </Link>
                    </div>
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: Safe Trade Guidance & Store Health (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Safe Trade Guidelines */}
                <div className="bg-paper rounded-3xl p-6 border border-line shadow-clean-sm flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="font-headline font-bold text-base text-slate-900">
                      Safe Trade Guidelines
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Safedeal protects your revenue through encrypted escrow. Maintain 100% protection compliance by following these 3 rules:
                  </p>

                  <div className="space-y-2.5 pt-1">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-line/60 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Ban className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">
                          Never chat or trade off-site
                        </span>
                        <span className="text-[13px] text-slate-500 leading-snug">
                          Discussions outside Safedeal chats void seller chargeback defense.
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-line/60 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">
                          Never accept direct wire or crypto
                        </span>
                        <span className="text-[13px] text-slate-500 leading-snug">
                          All payments must be verified and held by our central escrow ledger.
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-line/60 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">
                          Record credential handovers
                        </span>
                        <span className="text-[13px] text-slate-500 leading-snug">
                          Screen recordings of delivery resolve 99.4% of buyer claims instantly.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <Link
                      href="/orders"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs font-bold"
                    >
                      <span>Read Merchant Protection Handbook</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Store Performance & Health */}
                <div className="bg-paper rounded-3xl p-6 border border-line shadow-clean-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline font-bold text-base text-slate-900">
                      Store Health
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[12px] font-bold border border-blue-200/60">
                      Prime Standard
                    </span>
                  </div>

                  <div className="flex flex-col gap-3.5 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span className="text-slate-500">Avg Delivery Speed</span>
                        <span className="text-slate-900 font-bold">&lt; 3 mins (Instant Bot)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: "95%" }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span className="text-slate-500">Order Dispute Rate</span>
                        <span className="text-slate-900 font-bold">
                          {earningsSummary ? (
                            `${(
                              ((earningsSummary.disputeCount || 0) /
                                Math.max(
                                  1,
                                  (earningsSummary.activeCount || 0) +
                                    (earningsSummary.completedCount || 0) +
                                    (earningsSummary.disputeCount || 0)
                                )) *
                              100
                            ).toFixed(1)}%`
                          ) : (
                            "0.12%"
                          )}{" "}
                          <span className="text-slate-400 font-normal">(Goal &lt;1%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: "98%" }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span className="text-slate-500">Buyer Positive Reviews</span>
                        <span className="text-slate-900 font-bold">
                          {earningsSummary ? (
                            `${(
                              100 -
                              ((earningsSummary.disputeCount || 0) /
                                Math.max(
                                  1,
                                  (earningsSummary.activeCount || 0) +
                                    (earningsSummary.completedCount || 0) +
                                    (earningsSummary.disputeCount || 0)
                                )) *
                                100
                            ).toFixed(1)}%`
                          ) : (
                            "99.8%"
                          )}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: "99.8%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-line flex items-center justify-between text-xs text-slate-900">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span className="font-bold">Top Rated Merchant Status</span>
                    </div>
                    <span className="text-[12px] text-blue-700 font-bold bg-paper px-2 py-0.5 rounded-lg border border-blue-200/80">
                      Tier 3 Active
                    </span>
                  </div>
                </div>

                {/* Quick Management Shortcuts */}
                <div className="bg-paper rounded-3xl p-5 border border-line shadow-clean-sm flex flex-col gap-1 text-xs">
                  <div className="font-headline font-bold text-slate-900 mb-1 px-1">
                    Quick Management
                  </div>

                  <button
                    onClick={() => setActionNotice("Created 10% Flash Sale banner for your store listings!")}
                    className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-left group"
                  >
                    <span className="flex items-center gap-2.5 font-medium">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <span>Run Store Discount Sale</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActionNotice("Delivery API webhooks are verified and operational.")}
                    className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-left group"
                  >
                    <span className="flex items-center gap-2.5 font-medium">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <span>Automated Delivery API</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActionNotice("Connecting to dedicated Merchant Concierge channel...")}
                    className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-left group"
                  >
                    <span className="flex items-center gap-2.5 font-medium">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                      <span>Contact Merchant Concierge</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 5. SELLER HUB DEDICATED FOOTER                                            */}
      {/* ========================================================================= */}
      <footer className="w-full bg-paper border-t border-line shadow-[0_1px_8px_rgba(0,0,0,0.02)] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-headline font-black text-lg text-slate-900">Safedeal</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[12px] font-bold uppercase">
                  Seller Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                High-velocity, bank-grade marketplace infrastructure for verified digital goods sellers, key distributors, and virtual currency merchants.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-blue-700 text-[12px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Safedeal Shield Protected</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[12px] font-bold">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
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

          <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Safedeal Global Ltd. All rights reserved. Encrypted escrow marketplace.</p>
            <div className="flex items-center gap-4 text-[13px]">
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

      {/* Modal 1: Withdraw Payout */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-paper rounded-3xl p-6 sm:p-7 max-w-md w-full border border-line shadow-clean-lg space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Withdraw Escrow Payout
                </h3>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmWithdraw} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">
                    $
                  </span>
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-line rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-[12px] text-slate-500 mt-1 block">
                  Available in balance: <strong>${availableBalance.toFixed(2)} USD</strong>
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Payout Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("wire")}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      withdrawMethod === "wire"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-line bg-slate-50 text-slate-700"
                    }`}
                  >
                    Bank Wire
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("crypto")}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      withdrawMethod === "crypto"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-line bg-slate-50 text-slate-700"
                    }`}
                  >
                    USDC Web3
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("paypal")}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      withdrawMethod === "paypal"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-line bg-slate-50 text-slate-700"
                    }`}
                  >
                    PayPal
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-line text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Merchant Processing Fee:</span>
                  <span className="font-bold text-blue-600">FREE ($0.00)</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Arrival:</span>
                  <span className="font-bold text-slate-900">Under 15 minutes</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={withdrawSuccess}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-clean-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {withdrawSuccess ? (
                  <span>Processing Withdrawal...</span>
                ) : (
                  <span>Confirm Withdraw ${withdrawAmount}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Deliver Item Now */}
      {activeDeliveryOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-paper rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-line shadow-clean-lg space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Instant Vault Handover
                </h3>
              </div>
              <button
                onClick={() => setActiveDeliveryOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-xs text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                Buyer <strong>{activeDeliveryOrder.buyer}</strong> has paid $
                {activeDeliveryOrder.price.toFixed(2)} in cold escrow. You have 38 minutes to deliver.
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
                  className="w-full p-2.5 bg-slate-50 border border-line rounded-xl font-mono text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Current Account Password
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-line rounded-xl font-mono text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  First Creation / Recovery Email Address
                </label>
                <input
                  type="email"
                  defaultValue="aerogaming.riot.original@mail.com"
                  className="w-full p-2.5 bg-slate-50 border border-line rounded-xl font-mono text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveDeliveryOrder(null)}
                className="px-4 py-2 rounded-xl border border-line text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setActionNotice(
                    `Credentials vaulted and securely released to ${activeDeliveryOrder.buyer}!`
                  );
                  setActiveDeliveryOrder(null);
                  setTimeout(() => setActionNotice(null), 3000);
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

      {/* Modal 3: View Chat & Confirm */}
      {activeChatOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-paper rounded-3xl p-6 max-w-lg w-full border border-line shadow-clean-lg space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Buyer Chat: {activeChatOrder.buyer}
                </h3>
              </div>
              <button
                onClick={() => setActiveChatOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-2xl border border-line text-xs">
              <div className="text-right">
                <span className="inline-block bg-blue-600 text-white p-2.5 rounded-2xl rounded-tr-none text-left max-w-xs">
                  Hi Dennis! Code has been dispatched to your encrypted orders tab.
                </span>
                <span className="text-[12px] text-slate-400 block mt-0.5">12m ago</span>
              </div>
              <div className="text-left">
                <span className="inline-block bg-paper border border-line p-2.5 rounded-2xl rounded-tl-none text-slate-900 max-w-xs">
                  Got it, logging in right now! Thanks for the super fast delivery.
                </span>
                <span className="text-[12px] text-slate-400 block mt-0.5">3m ago</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Reply to Dennis_K..."
                className="flex-1 p-2.5 bg-slate-50 border border-line rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  setActionNotice("Message sent to Dennis_K.");
                  setActiveChatOrder(null);
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

      {/* Modal 4: Review Dispute */}
      {activeDisputeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-paper rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-line shadow-clean-lg space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Dispute Case #{activeDisputeOrder.id}
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
              <p className="font-bold">Inquiry Reason: Email Verification Code</p>
              <p className="text-slate-600 text-[13px]">
                Buyer states Steam requires 6-digit confirmation code sent to original email. Provide the code or upload screenshots below to release escrow.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Provide Steam Guard / Verification Code
              </label>
              <input
                type="text"
                placeholder="e.g. 783921"
                className="w-full p-2.5 bg-slate-50 border border-line rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveDisputeOrder(null)}
                className="px-4 py-2 rounded-xl border border-line text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setActionNotice("Verification code sent to dispute arbitration desk. Funds will unfreeze upon buyer check.");
                  setActiveDisputeOrder(null);
                  setTimeout(() => setActionNotice(null), 3500);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-clean-sm cursor-pointer"
              >
                Submit Code & Resolve Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Quick Edit Listing Price */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-paper rounded-3xl p-6 max-w-sm w-full border border-line shadow-clean-lg space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h3 className="font-headline font-bold text-sm text-slate-900">
                Edit Listing Price
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 line-clamp-1 mb-2">
                {editingItem.title}
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-line rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 rounded-xl border border-line text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePrice}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
