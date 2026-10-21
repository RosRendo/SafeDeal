"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/navigation/Header";
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Star,
  Search,
  Share2,
  Heart,
  Flag,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  Lock,
  Grid,
  List,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  BadgeCheck,
  Gavel,
  Clock,
  Coins,
  CreditCard,
  X,
  Send,
  HelpCircle,
  FileCheck,
  Layers,
  Award,
  CircleDollarSign,
  Headphones,
  Check,
} from "lucide-react";

interface ListingItem {
  id: string;
  name: string;
  price: number;
  sales: number;
  category: "accounts" | "keys" | "currencies";
  image: string;
  badgeType: string;
  platform: string;
  sellerTag: string;
  stock: string;
  features: string[];
}

interface ReviewItem {
  id: string;
  author: string;
  avatarColor: string;
  timeAgo: string;
  productBadge: string;
  stars: number;
  comment: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [];

function MerchantStorefrontContent() {
  const params = useParams();
  const router = useRouter();

  // Dynamic merchant name resolution from slug
  const merchantName = useMemo(() => {
    const slug = (params?.slug as string) || "";
    if (!slug) return "AeroGamingDeals";
    if (slug.toLowerCase() === "keyhubdirect") return "KeyHubDirect";
    if (slug.toLowerCase() === "valkyrievault") return "ValkyrieVault";
    if (slug.toLowerCase() === "lossantossupply") return "LosSantosSupply";
    if (slug.toLowerCase() === "creatorassets") return "CreatorAssets";
    if (slug.toLowerCase() === "aerogamingdeals") return "AeroGamingDeals";
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }, [params?.slug]);

  // Dynamic Storefront Listings
  const [storeListings, setStoreListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoreListings() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/listings");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const merchantMatches = json.data.filter((l: any) => {
            const sName = l.seller?.name || l.sellerName || "";
            return !merchantName || sName.toLowerCase().includes(merchantName.toLowerCase()) || merchantName.toLowerCase().includes(sName.toLowerCase());
          });
          const target = merchantMatches.length > 0 ? merchantMatches : json.data;
          const mapped: ListingItem[] = target.map((item: any, idx: number) => ({
            id: item.id || `prod-${idx + 1}`,
            name: item.title,
            price: typeof item.price === "number" ? item.price : 0,
            sales: item.seller?.salesCount || 100 + idx * 12,
            category: item.category === "keys" ? "keys" : item.category === "currencies" ? "currencies" : "accounts",
            image: item.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
            badgeType: item.deliveryType === "instant" ? "Instant Automated Vault" : "Escrow Handover",
            platform: item.game || "Region Free",
            sellerTag: item.seller?.name || merchantName,
            stock: "Available",
            features: item.features || ["Escrow Protected", "Clean MMR / Unbound"],
          }));
          setStoreListings(mapped);
        }
      } catch (e) {
        console.error("Failed to load storefront listings", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoreListings();
  }, [merchantName]);

  // Active states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Interaction states
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [favCount, setFavCount] = useState<number>(1420);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [contactMessage, setContactMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "seller"; text: string; time: string }[]
  >([]);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>("suspected-fraud");
  const [reportNote, setReportNote] = useState<string>("");

  // Buy modal
  const [quickBuyItem, setQuickBuyItem] = useState<ListingItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"balance" | "card" | "crypto">("balance");
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // Accordion state
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({
    "policy-1": true,
    "policy-2": true,
    "policy-3": false,
  });

  // Reviews
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [writeReviewModalOpen, setWriteReviewModalOpen] = useState<boolean>(false);
  const [newReviewComment, setNewReviewComment] = useState<string>("");
  const [newReviewRating, setNewReviewRating] = useState<number>(5);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const toggleFavorite = () => {
    if (!isFavorited) {
      setIsFavorited(true);
      setFavCount((c) => c + 1);
      showToast(`Saved ${merchantName} to your Favorite Merchants!`);
    } else {
      setIsFavorited(false);
      setFavCount((c) => c - 1);
      showToast("Removed from Favorite Merchants");
    }
  };

  const copyStoreUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Merchant storefront link copied to clipboard!");
    }
  };

  const toggleAccordion = (id: string) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSendMessage = () => {
    if (!contactMessage.trim()) return;
    const userText = contactMessage.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userText, time: "Just now" },
    ]);
    setContactMessage("");

    // Simulated instant seller dispatch bot reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "seller",
          text: `Thanks for your inquiry regarding "${userText.slice(0, 30)}..."! All our listed items are in stock with instant vault dispatch. Funds are protected 100% under Safedeal's 48-hour inspection escrow.`,
          time: "Just now",
        },
      ]);
    }, 1000);
  };

  const handleConfirmPurchase = () => {
    if (!quickBuyItem) return;
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      const boughtItem = quickBuyItem;
      setQuickBuyItem(null);
      showToast(`Escrow order created for ${boughtItem.name.slice(0, 35)}...! Redirecting to Inspection Hub.`);
      setTimeout(() => {
        router.push("/orders/ESC-94821");
      }, 1200);
    }, 1400);
  };

  const handlePostReview = () => {
    if (!newReviewComment.trim()) return;
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: "VerifiedBuyer_" + Math.floor(Math.random() * 900 + 100),
      avatarColor: "bg-emerald-600 text-white",
      timeAgo: "Just now",
      productBadge: "Verified Escrow Deal",
      stars: newReviewRating,
      comment: `“${newReviewComment.trim()}”`,
    };
    setReviewsList((prev) => [newRev, ...prev]);
    setNewReviewComment("");
    setWriteReviewModalOpen(false);
    showToast("Thank you! Your verified escrow review has been published.");
  };

  // Filtered & Sorted listings
  const filteredListings = useMemo(() => {
    return storeListings.filter((item) => {
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "popular") return b.sales - a.sales;
      return 0; // default order
    });
  }, [selectedCategory, searchQuery, sortBy, storeListings]);

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-slate-900 flex flex-col antialiased selection:bg-[var(--cobalt-acc)] selection:text-white">
      {/* Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--ds-navy)] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold border border-blue-500/40 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
        searchQuery=""
        onSearchChange={() => {}}
        onOpenProtectionModal={() => router.push("/protection")}
        wishlistCount={0}
      />

      {/* Main Container */}
      <main className="w-full pt-[104px] sm:pt-[108px] bg-[var(--ds-surface)] flex-1">
        <div className="flex flex-col w-full">
          {/* Merchant Hero Banner */}
          <div className="w-full relative overflow-hidden bg-[var(--ds-navy)] text-white">
            {/* SVG Background Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg
                className="w-full h-full text-blue-500"
                fill="none"
                viewBox="0 0 1200 360"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="grid-pattern-hero"
                    width="36"
                    height="36"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 36 0 L 0 0 0 36"
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity="0.25"
                      strokeWidth="0.75"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern-hero)" />
              </svg>
            </div>

            {/* Glowing Gradient Cyber Orbs */}
            <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-[var(--cobalt-acc)] opacity-35 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 right-10 w-80 h-80 rounded-full bg-[#4edea3] opacity-25 blur-3xl pointer-events-none" />

            <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-6 pb-28 relative z-10">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold mb-6">
                <Link href="/browse" className="hover:text-white transition-colors">
                  Marketplace
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <Link href="/browse" className="hover:text-white transition-colors">
                  Verified Sellers
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-white font-bold">{merchantName}</span>
              </nav>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#6ffbbe] text-xs font-bold border border-white/10 shadow-clean-xs">
                    <ShieldCheck className="w-4 h-4 text-[#6ffbbe]" />
                    <span>Safedeal Tier-1 Premier Merchant Partner</span>
                  </div>
                  <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {merchantName}
                  </h1>
                  <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Specialized distributor of high-tier competitive gaming accounts, automated
                    Steam/Epic license CDNs, and verified in-game assets. 100% clean provenance guaranteed.
                  </p>
                </div>

                {/* Hero Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setContactModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--cobalt-acc)] text-white text-xs font-bold shadow-clean-md hover:bg-blue-600 transition-all cursor-pointer"
                    id="btn-contact"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Contact Seller</span>
                  </button>

                  <button
                    onClick={toggleFavorite}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-md transition-all text-xs font-bold cursor-pointer ${
                      isFavorited
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    }`}
                    id="btn-favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavorited ? "fill-rose-500 text-rose-500" : "text-white"
                      }`}
                    />
                    <span>
                      {isFavorited ? "Favorited" : "Favorite"} ({(favCount / 1000).toFixed(1)}k)
                    </span>
                  </button>

                  <button
                    onClick={copyStoreUrl}
                    className="p-3 rounded-xl bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border border-white/10 transition-all cursor-pointer"
                    title="Share Storefront"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="p-3 rounded-xl bg-white/10 text-slate-300 hover:text-rose-400 hover:bg-white/20 border border-white/10 transition-all cursor-pointer"
                    title="Report Storefront"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Storefront Floating Card & Key Metrics */}
          <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 -mt-16 relative z-20">
            <div className="bg-white rounded-2xl shadow-clean-xl border border-slate-200/80 p-6 md:p-8 flex flex-col gap-6">
              {/* Profile Lockup + Verified Pills */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl bg-[var(--ds-navy)] text-white flex items-center justify-center font-headline text-2xl font-black shadow-md border-2 border-white">
                    <span className="tracking-tighter text-[#b4c5ff]">AG</span>
                    <span
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#009668] flex items-center justify-center text-white ring-2 ring-white shadow-xs"
                      title="Identity & KYC Fully Verified"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-headline text-xl font-bold text-slate-900">
                        {merchantName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[12px] font-bold border border-slate-200">
                        ID & Phone Verified
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[12px] font-bold flex items-center gap-1 border border-emerald-200">
                        <Award className="w-3 h-3 text-emerald-600" />
                        Level 3 Top Merchant
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>Member since March 2021 (4+ Years)</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Online & Dispatching Now
                      </span>
                    </p>
                  </div>
                </div>

                {/* Rating Quick Block */}
                <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-3 self-stretch md:self-auto justify-between md:justify-start border border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <Star className="w-6 h-6 fill-amber-500 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-headline text-lg font-bold text-slate-900 leading-none">
                        4.98
                      </div>
                      <div className="text-[12px] text-slate-500 font-medium">3,842 ratings</div>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <div className="text-sm font-bold text-emerald-700">99.8%</div>
                    <div className="text-[12px] text-slate-500 font-medium">Handover SLA</div>
                  </div>
                </div>
              </div>

              {/* Quantitative Performance Indicators (Micro-Bento Bar) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-200/60 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>Completed Deals</span>
                    <BadgeCheck className="w-4 h-4 text-[var(--cobalt-acc)]" />
                  </div>
                  <div className="font-headline text-xl font-extrabold text-slate-900">
                    4,120+
                  </div>
                  <span className="text-[12px] text-slate-500 mt-1">100% digital goods</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-200/60 hover:border-amber-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>Avg. Delivery Speed</span>
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="font-headline text-xl font-extrabold text-slate-900">
                    4m 12s
                  </div>
                  <span className="text-[12px] text-emerald-700 font-bold mt-1">
                    Top 3% fastest seller
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-200/60 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>Dispute Ratio</span>
                    <Gavel className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-headline text-xl font-extrabold text-slate-900">
                    0.12%
                  </div>
                  <span className="text-[12px] text-slate-500 mt-1">Avg marketplace: 1.8%</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-200/60 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                    <span>Escrow Guarantee</span>
                    <ShieldCheck className="w-4 h-4 text-[var(--cobalt-acc)]" />
                  </div>
                  <div className="font-headline text-xl font-extrabold text-slate-900">
                    48 Hours
                  </div>
                  <span className="text-[12px] text-slate-500 mt-1">Inspection safeguard SLA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Guarantee Ribbon */}
          <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 mt-4">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50/50 rounded-2xl p-4 flex items-center justify-between gap-4 border border-emerald-200/80 shadow-clean-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-xs shrink-0 border border-emerald-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-headline text-sm font-bold text-slate-900">
                    Safedeal Escrow Shield Active
                  </p>
                  <p className="text-xs text-slate-600">
                    All purchases from {merchantName} are 100% held in escrow. Merchant is credited
                    only after your 48-hour inspection confirmation.
                  </p>
                </div>
              </div>
              <a
                href="#policies"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[var(--cobalt-acc)] hover:text-blue-700 transition-colors whitespace-nowrap"
              >
                <span>Review Warranty</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Main Storefront Catalog Section */}
          <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 mt-10">
            {/* Category Tabs Navigation */}
            <div className="flex items-center justify-between overflow-x-auto gap-3 pb-2 border-b-0 no-scrollbar">
              <div className="flex items-center gap-2 whitespace-nowrap text-xs font-bold">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-[var(--cobalt-acc)] text-white shadow-clean-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  All Listings (42)
                </button>
                <button
                  onClick={() => setSelectedCategory("accounts")}
                  className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategory === "accounts"
                      ? "bg-[var(--cobalt-acc)] text-white shadow-clean-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  Gaming Accounts (18)
                </button>
                <button
                  onClick={() => setSelectedCategory("keys")}
                  className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategory === "keys"
                      ? "bg-[var(--cobalt-acc)] text-white shadow-clean-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  Keys & Gift Cards (16)
                </button>
                <button
                  onClick={() => setSelectedCategory("currencies")}
                  className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategory === "currencies"
                      ? "bg-[var(--cobalt-acc)] text-white shadow-clean-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  Currencies (8)
                </button>
                <a
                  href="#reviews"
                  className="px-4 py-2.5 rounded-xl bg-white text-slate-600 hover:bg-slate-100 transition-all border border-slate-200/80"
                >
                  Buyer Reviews (3,842)
                </a>
                <a
                  href="#policies"
                  className="px-4 py-2.5 rounded-xl bg-white text-slate-600 hover:bg-slate-100 transition-all border border-slate-200/80"
                >
                  Store Policies
                </a>
              </div>
            </div>

            {/* Catalog Filtering Bar */}
            <div className="mt-4 bg-white rounded-2xl p-4 shadow-clean-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search within Store */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${merchantName} inventory (e.g. Valorant, Steam, WoW Gold)...`}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 rounded-xl text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-slate-200 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls: Sort & Grid View Toggle */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-11 px-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer border border-slate-200 focus:border-blue-500"
                  >
                    <option value="popular">Best Selling</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>

                <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Grid Layout"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="List Layout"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid / List */}
            {filteredListings.length > 0 ? (
              <div
                className={`mt-6 ${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    : "flex flex-col gap-4"
                }`}
              >
                {filteredListings.map((item) => (
                  <div
                    key={item.id}
                    className={`group bg-white rounded-2xl shadow-clean-sm hover:shadow-clean-xl border border-slate-200/80 transition-all duration-300 flex overflow-hidden ${
                      viewMode === "grid"
                        ? "flex-col justify-between"
                        : "flex-col sm:flex-row items-center justify-between p-4"
                    }`}
                  >
                    {/* Media / Thumbnail */}
                    <div
                      className={
                        viewMode === "grid"
                          ? "w-full"
                          : "w-full sm:w-64 sm:shrink-0 rounded-xl overflow-hidden"
                      }
                    >
                      <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-emerald-800 text-[12px] font-bold flex items-center gap-1 shadow-xs border border-white/50">
                          <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                          <span>{item.badgeType}</span>
                        </span>
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-[var(--ds-navy)]/90 text-white text-[11px] font-semibold backdrop-blur-xs">
                          {item.platform}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div
                      className={
                        viewMode === "grid"
                          ? "p-4 flex-1 flex flex-col justify-between"
                          : "p-4 flex-1 w-full"
                      }
                    >
                      <div>
                        <div className="flex items-center justify-between text-slate-500 text-[12px] font-semibold mb-1.5">
                          <span className="text-[var(--cobalt-acc)] font-bold">{item.sellerTag}</span>
                          <span>Stock: {item.stock}</span>
                        </div>

                        <h3 className="font-headline text-sm font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>

                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          {item.features.map((feat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-600"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                            Guaranteed Price
                          </span>
                          <span className="font-headline text-lg font-extrabold text-slate-900 leading-none">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuickBuyItem(item)}
                            className="px-3.5 py-2 rounded-xl bg-[var(--cobalt-acc)] text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <span>Buy Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty Fallback State */
              <div className="py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200/80 mt-6 shadow-clean-xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Search className="w-8 h-8" />
                </div>
                <h4 className="font-headline text-base font-bold text-slate-900">
                  No listings match your search filter
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Try searching for general keywords like &quot;Steam&quot;, &quot;Account&quot;,
                  &quot;Valorant&quot;, or &quot;Gold&quot;.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Recent Buyer Feedback Section */}
          <section
            className="max-w-[1280px] w-full mx-auto px-4 md:px-8 mt-12 scroll-mt-32"
            id="reviews"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-clean-sm border border-slate-200/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-headline text-xl font-bold text-slate-900">
                      Verified Buyer Feedback
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[12px] font-bold border border-emerald-200">
                      100% Escrow Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Authentic testimonials from verified customers who completed their 48-hour inspection.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-headline text-xl font-extrabold text-slate-900 leading-none">
                      4.98 / 5.0
                    </div>
                    <span className="text-[12px] text-slate-500">Based on 3,842 deals</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <button
                    onClick={() => setWriteReviewModalOpen(true)}
                    className="ml-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Add Review
                  </button>
                </div>
              </div>

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {reviewsList.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-slate-500 text-xs">
                    No reviews posted yet for this merchant. Be the first to leave a verified review after completing an escrow deal!
                  </div>
                ) : (
                  reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-slate-50 rounded-2xl p-5 flex flex-col justify-between border border-slate-200/60 hover:border-slate-300 transition-all shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex text-amber-500">
                          {Array.from({ length: rev.stars }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-amber-500 text-amber-500"
                            />
                          ))}
                        </div>
                        <span className="text-[12px] text-slate-400 font-medium">{rev.timeAgo}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed mb-4">
                        {rev.comment}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/50">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${rev.avatarColor}`}
                        >
                          {rev.author[0]}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-white text-[11px] font-medium text-slate-600 flex items-center gap-1 border border-slate-200/80">
                        <BadgeCheck className="w-3 h-3 text-emerald-600" />
                        {rev.productBadge}
                      </span>
                    </div>
                  </div>
                )))}
              </div>
            </div>
          </section>

          {/* Store Policies & Warranty Accordion */}
          <section
            className="max-w-[1280px] w-full mx-auto px-4 md:px-8 mt-12 mb-12 scroll-mt-32"
            id="policies"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-clean-sm border border-slate-200/80">
              <div className="mb-6">
                <h3 className="font-headline text-xl font-bold text-slate-900">
                  Store Policies & Fulfillment SLA
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {merchantName} operates under Safedeal&apos;s Tier-1 Merchant protocol with strict security compliance.
                </p>
              </div>

              <div className="space-y-3">
                {/* Accordion 1 */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/70 overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("policy-1")}
                    className="w-full p-4 flex items-center justify-between text-left font-headline text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <FileCheck className="w-5 h-5 text-[var(--cobalt-acc)]" />
                      <span>Delivery Methods: Automated Vault vs Bot Handover</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        accordionOpen["policy-1"] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {accordionOpen["policy-1"] && (
                    <div className="px-4 pb-4 text-slate-600 text-xs space-y-2 border-t border-slate-200/60 pt-3">
                      <p>
                        <strong>1. Automated Vault Delivery:</strong> 85% of listings (Game Keys,
                        CDNs, Pre-configured Accounts) are dispatched immediately via Safedeal&apos;s
                        automated key vault API. Credentials appear on your checkout confirmation
                        page within 60 seconds.
                      </p>
                      <p>
                        <strong>2. In-Game Virtual Commodities:</strong> Gold and currencies are
                        transferred using in-game safe-trade practices (Guild Bank Deposit or In-Game
                        Auction reimbursement) within an average delivery window of 4 minutes and 12
                        seconds.
                      </p>
                    </div>
                  )}
                </div>

                {/* Accordion 2 */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/70 overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("policy-2")}
                    className="w-full p-4 flex items-center justify-between text-left font-headline text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>48-Hour Inspection Escrow Protection</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        accordionOpen["policy-2"] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {accordionOpen["policy-2"] && (
                    <div className="px-4 pb-4 text-slate-600 text-xs space-y-2 border-t border-slate-200/60 pt-3">
                      <p>
                        Your payment remains strictly in Safedeal&apos;s central escrow custody. You
                        are granted an unalterable 48-hour inspection clock from the exact second
                        login credentials or keys are released.
                      </p>
                      <p>
                        During this window, you must verify account ownership, link your personal
                        email, and inspect all in-game inventories. Funds are never released to{" "}
                        {merchantName} until either you mark &apos;Order Completed&apos; or the
                        inspection window completes without dispute.
                      </p>
                    </div>
                  )}
                </div>

                {/* Accordion 3 */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/70 overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("policy-3")}
                    className="w-full p-4 flex items-center justify-between text-left font-headline text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <RotateCcw className="w-5 h-5 text-indigo-600" />
                      <span>Lifetime Recovery & Pull-Back Warranty</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        accordionOpen["policy-3"] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {accordionOpen["policy-3"] && (
                    <div className="px-4 pb-4 text-slate-600 text-xs space-y-2 border-t border-slate-200/60 pt-3">
                      <p>
                        Every account cataloged by {merchantName} includes our signature 6-Month
                        Pull-Back Protection Guarantee. If an original creator attempts to file a
                        ticket with Riot, Valve, or Epic to reclaim the profile, {merchantName} will
                        provide either a full equivalent tier replacement or a 100% store credit
                        refund backed by our merchant bond deposit with Safedeal.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Quick Buy & Escrow Protection Modal */}
      {quickBuyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setQuickBuyItem(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-slate-900">
                  Secure Escrow Checkout
                </h3>
                <p className="text-xs text-slate-500">
                  Instant Vault Delivery & 48h Inspection Protection
                </p>
              </div>
            </div>

            {/* Product Snapshot */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-200/80 flex items-center gap-4">
              <img
                src={quickBuyItem.image}
                alt={quickBuyItem.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-[var(--cobalt-acc)] block">
                  {quickBuyItem.platform}
                </span>
                <h4 className="font-headline text-xs font-bold text-slate-900 line-clamp-2">
                  {quickBuyItem.name}
                </h4>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Seller: AeroGamingDeals</span>
                  <span className="font-headline text-sm font-extrabold text-slate-900">
                    ${quickBuyItem.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Escrow Shield Guarantee Box */}
            <div className="bg-blue-50/70 rounded-2xl p-4 mb-5 border border-blue-200/80 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Safedeal 48-Hour Escrow Custody</span>
              </div>
              <p className="text-slate-600">
                Your payment will be securely held in Safedeal escrow. The seller cannot withdraw funds
                until you inspect credentials and confirm order satisfaction.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-6 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Select Payment Method:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("balance")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === "balance"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                  }`}
                >
                  <CircleDollarSign className="w-4 h-4 mb-1 text-emerald-600" />
                  <div className="text-[12px]">Safedeal Balance</div>
                  <div className="text-[11px] text-slate-400 font-mono">$480.00 Available</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1 text-blue-600" />
                  <div className="text-[12px]">Card / Apple Pay</div>
                  <div className="text-[11px] text-slate-400 font-mono">0% Escrow Surcharge</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === "crypto"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                  }`}
                >
                  <Coins className="w-4 h-4 mb-1 text-amber-600" />
                  <div className="text-[12px]">USDC / Crypto</div>
                  <div className="text-[11px] text-slate-400 font-mono">Instant Confirmation</div>
                </button>
              </div>
            </div>

            {/* Total and Action */}
            <div className="flex items-center justify-between mb-5 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Total Escrow Amount:</span>
              <span className="font-headline text-2xl font-black text-slate-900">
                ${quickBuyItem.price.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setQuickBuyItem(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={isCheckingOut}
                className="flex-2 py-3 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-clean-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isCheckingOut ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Locking in Escrow...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Lock in Escrow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Seller Chat Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full h-[580px] shadow-2xl border border-slate-200 flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[var(--ds-navy)] text-white flex items-center justify-center font-bold text-sm">
                    AG
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                </div>
                <div>
                  <h3 className="font-headline text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>AeroGamingDeals Support</span>
                    <BadgeCheck className="w-4 h-4 text-blue-600" />
                  </h3>
                  <span className="text-[12px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online • Typical response &lt; 2 minutes
                  </span>
                </div>
              </div>
              <button
                onClick={() => setContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-[var(--ds-surface)]">
              <div className="text-center my-2">
                <span className="px-3 py-1 rounded-full bg-slate-200/70 text-[11px] font-semibold text-slate-600">
                  🔒 Encrypted Safedeal Trading Channel
                </span>
              </div>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[var(--cobalt-acc)] text-white rounded-br-xs"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[10px] block text-right mt-1.5 ${
                        msg.sender === "user" ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setContactMessage("Is the Valorant Immortal 3 account still in stock?")}
                className="px-2.5 py-1 rounded-full bg-white text-[12px] font-medium text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 whitespace-nowrap cursor-pointer transition-colors"
              >
                Valorant Stock?
              </button>
              <button
                onClick={() => setContactMessage("How fast is Steam Wallet Card PIN delivery?")}
                className="px-2.5 py-1 rounded-full bg-white text-[12px] font-medium text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 whitespace-nowrap cursor-pointer transition-colors"
              >
                Delivery Speed?
              </button>
              <button
                onClick={() => setContactMessage("Can you provide receipt proof for the Fortnite account?")}
                className="px-2.5 py-1 rounded-full bg-white text-[12px] font-medium text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 whitespace-nowrap cursor-pointer transition-colors"
              >
                Proof of Receipt?
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder={`Ask ${merchantName} about an account or custom order...`}
                className="flex-1 h-11 px-4 bg-slate-100 rounded-xl text-xs text-slate-900 outline-none border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!contactMessage.trim()}
                className="h-11 px-4 bg-[var(--cobalt-acc)] text-white rounded-xl font-bold text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Storefront Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-slate-900">
                  Report {merchantName}
                </h3>
                <p className="text-xs text-slate-500">
                  Safedeal Trust & Safety Compliance Review
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-bold text-slate-700 block">Select Violation:</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-800 border border-slate-200 outline-none"
              >
                <option value="suspected-fraud">Suspected Fraud or Impersonation</option>
                <option value="off-platform">Attempted Off-Platform Transaction / Discord</option>
                <option value="inaccurate-description">Misleading Listing Description or MMR</option>
                <option value="other">Other Violation</option>
              </select>

              <label className="text-xs font-bold text-slate-700 block pt-1">
                Additional Details:
              </label>
              <textarea
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Describe any suspicious behavior or violated terms..."
                className="w-full h-24 p-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200 outline-none resize-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setReportModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  setReportNote("");
                  showToast("Report submitted to Safedeal Trust & Safety. Case opened.");
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {writeReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setWriteReviewModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-slate-900">
                  Rate {merchantName}
                </h3>
                <p className="text-xs text-slate-500">
                  Review verified under 48h escrow inspection
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 block mb-2">Overall Rating:</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= newReviewRating
                          ? "fill-amber-500 text-amber-500"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {newReviewRating}.0 / 5.0
                </span>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Your Testimonial:
              </label>
              <textarea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Describe your account handover experience, speed of delivery, or customer service..."
                className="w-full h-28 p-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200 outline-none resize-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setWriteReviewModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePostReview}
                disabled={!newReviewComment.trim()}
                className="flex-1 py-2.5 bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 shadow-xs"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Trust Pillars & Marketplace Footer */}
      <footer className="w-full bg-white shadow-[0_-1px_8px_rgba(0,0,0,0.02)] mt-16 border-t border-slate-200/80">
        {/* 3 Pillars Strip */}
        <div className="bg-slate-50/80 py-10 border-b border-slate-200/60">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-headline text-sm font-bold text-slate-900">
                  100% Escrow Protection
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Funds held securely until inspection verified
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-[var(--cobalt-acc)] shadow-xs shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-headline text-sm font-bold text-slate-900">
                  Instant Automated Delivery
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive keys and digital assets within seconds
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-headline text-sm font-bold text-slate-900">
                  24/7 Dispute Resolution
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time arbitration and live customer assistance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Columns */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[var(--cobalt-acc)] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-headline text-lg font-bold text-slate-900">Safedeal</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
              The leading peer-to-peer and verified merchant trading network for game accounts,
              software licenses, codes, and digital commodities with guaranteed escrow security.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200">
                SSL 256-Bit
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200">
                PCI-DSS Compliant
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200">
                Verified Merchant
              </span>
            </div>
          </div>

          <div>
            <h5 className="font-headline text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Popular Markets
            </h5>
            <ul className="space-y-2 text-xs text-slate-500 font-medium">
              <li>
                <Link href="/browse?cat=accounts" className="hover:text-blue-600 transition-colors">
                  Game Accounts
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=keys" className="hover:text-blue-600 transition-colors">
                  Steam & Epic Keys
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=gift-cards" className="hover:text-blue-600 transition-colors">
                  Prepaid Cards
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=currency" className="hover:text-blue-600 transition-colors">
                  Virtual Currency
                </Link>
              </li>
              <li>
                <Link href="/browse?cat=software" className="hover:text-blue-600 transition-colors">
                  Product Licenses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-headline text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Buyer & Seller
            </h5>
            <ul className="space-y-2 text-xs text-slate-500 font-medium">
              <li>
                <a href="#policies" className="hover:text-blue-600 transition-colors">
                  Buyer Protection
                </a>
              </li>
              <li>
                <Link href="/seller" className="hover:text-blue-600 transition-colors">
                  Fee Schedule
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-blue-600 transition-colors">
                  Escrow Protocol
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-blue-600 transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-blue-600 transition-colors">
                  Seller Hub
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-headline text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Preferences
            </h5>
            <div className="space-y-2">
              <div className="bg-slate-100 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  English (US)
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="bg-slate-100 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <CircleDollarSign className="w-3.5 h-3.5 text-slate-500" />
                  USD ($)
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="bg-slate-100/70 py-4 border-t border-slate-200/60">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2025 Safedeal Global Inc. All rights reserved. Registered digital marketplace facilitator.</p>
            <div className="flex items-center gap-4 text-[12px] font-medium text-slate-500">
              <span className="hover:text-slate-900 transition-colors cursor-pointer">
                Privacy Policy
              </span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">
                Terms of Escrow
              </span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">
                Dispute Guidelines
              </span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">
                AML Policy
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function MerchantStorefrontPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MerchantStorefrontContent />
    </React.Suspense>
  );
}
