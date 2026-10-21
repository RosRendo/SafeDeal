"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import {
  ShieldCheck,
  Star,
  Zap,
  Store,
  CheckCircle2,
  ChevronRight,
  Search,
  Award,
  Lock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { FEATURED_SELLERS_LIST } from "@/lib/data";

interface MerchantDirectoryItem {
  id: string;
  slug: string;
  name: string;
  tier: "PREMIER" | "API" | "PRO" | "VIP";
  badgeText: string;
  rating: number;
  reviewsCount: string;
  totalOrders: string;
  deliverySpeed: string;
  bondAmount: string;
  specialty: string;
  avatarUrl: string;
  bannerImage: string;
  tags: string[];
  topProducts: {
    id: string;
    title: string;
    price: number;
  }[];
}

const ALL_MERCHANTS: MerchantDirectoryItem[] = [
  {
    id: "m-aero",
    slug: "aerogamingdeals",
    name: "AeroGamingDeals",
    tier: "PREMIER",
    badgeText: "Safedeal Tier-1 Premier Partner",
    rating: 4.98,
    reviewsCount: "3.8k",
    totalOrders: "14,200+",
    deliverySpeed: "Instant (<60s)",
    bondAmount: "$10,000 Bond",
    specialty: "High-Tier Competitive Accounts & Game Licenses",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    tags: ["Valorant Radiant", "CS2 Prime", "Steam Keys", "Automated Vault"],
    topProducts: [
      { id: "prod-1", title: "Valorant Peak Immortal 3 (342 RR)", price: 195.0 },
      { id: "prod-2", title: "CS2 Prime 10-Yr Coin Medal", price: 65.0 },
      { id: "prod-3", title: "Cyberpunk 2077 Phantom Liberty", price: 26.8 },
    ],
  },
  {
    id: "m-keyhub",
    slug: "keyhubdirect",
    name: "KeyHubDirect",
    tier: "API",
    badgeText: "High-Volume Key Vault API",
    rating: 4.99,
    reviewsCount: "48.1k",
    totalOrders: "112,400+",
    deliverySpeed: "Instant (0s)",
    bondAmount: "$25,000 Bond",
    specialty: "Automated Steam & Epic Games License Keys",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
    tags: ["Global Steam Keys", "Prepaid PSN", "Lifetime DLC", "REST API"],
    topProducts: [
      { id: "p1", title: "Steam $50 USD Wallet Card", price: 44.9 },
      { id: "p2", title: "Cyberpunk 2077 Global Key", price: 26.8 },
      { id: "p3", title: "Elden Ring DLC Shadow Key", price: 38.5 },
    ],
  },
  {
    id: "m-valkyrie",
    slug: "valkyrievault",
    name: "ValkyrieVault",
    tier: "PRO",
    badgeText: "Competitive Esports Verified",
    rating: 4.98,
    reviewsCount: "12.4k",
    totalOrders: "34,180+",
    deliverySpeed: "Avg: 2 mins",
    bondAmount: "$15,000 Bond",
    specialty: "High-Rank Tactical FPS Accounts & OG Smurfs",
    avatarUrl:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
    tags: ["Valorant Radiant", "CS2 FaceIT 10", "LoL Master", "Clean MMR"],
    topProducts: [
      { id: "p4", title: "Valorant Radiant NA Account", price: 185.0 },
      { id: "p5", title: "CS2 20K Premier Smurf", price: 42.0 },
      { id: "p6", title: "LoL Master Peak Unranked", price: 68.0 },
    ],
  },
  {
    id: "m-lossantos",
    slug: "lossantossupply",
    name: "LosSantosSupply",
    tier: "PRO",
    badgeText: "Virtual Economy Provider",
    rating: 4.96,
    reviewsCount: "8.9k",
    totalOrders: "21,900+",
    deliverySpeed: "Avg: 4 mins",
    bondAmount: "$8,500 Bond",
    specialty: "In-Game Gold, Modded Currency & MMO Resources",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    tags: ["GTA V $1.2B Modded", "WoW Illidan Gold", "OSRS 50M GP", "In-Game Auction"],
    topProducts: [
      { id: "p7", title: "GTA V $1.2B Modded Assets", price: 34.5 },
      { id: "p8", title: "WoW 1M Gold (US-Illidan)", price: 29.99 },
      { id: "p9", title: "OSRS 50M GP Instant Transfer", price: 12.5 },
    ],
  },
  {
    id: "m-creator",
    slug: "creatorassets",
    name: "CreatorAssets",
    tier: "VIP",
    badgeText: "Verified Creator Escrow",
    rating: 5.0,
    reviewsCount: "1.5k",
    totalOrders: "3,240+",
    deliverySpeed: "Avg: 12 mins",
    bondAmount: "$12,000 Bond",
    specialty: "Monetized YouTube Channels & Premium Social Handles",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop",
    tags: ["YouTube Monetized", "Instagram OG Handles", "TikTok Verified", "Clean AdSense"],
    topProducts: [
      { id: "p10", title: "YouTube Partner Channel 24K Subs", price: 420.0 },
      { id: "p11", title: "TikTok Creator Fund 58K Followers", price: 280.0 },
      { id: "p12", title: "OG Instagram Gaming Handle", price: 150.0 },
    ],
  },
];

export default function StoreDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  const filterTags = [
    { id: "all", label: "All Merchant Stores" },
    { id: "accounts", label: "Gaming Accounts" },
    { id: "keys", label: "License Keys" },
    { id: "currency", label: "In-Game Gold" },
    { id: "creator", label: "Creator & Social" },
  ];

  const filteredMerchants = useMemo(() => {
    return ALL_MERCHANTS.filter((merchant) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        merchant.name.toLowerCase().includes(q) ||
        merchant.specialty.toLowerCase().includes(q) ||
        merchant.tags.some((t) => t.toLowerCase().includes(q)) ||
        merchant.topProducts.some((p) => p.title.toLowerCase().includes(q));

      const matchesTag =
        selectedTag === "all" ||
        (selectedTag === "accounts" && merchant.tags.some((t) => t.toLowerCase().includes("account") || t.toLowerCase().includes("valorant") || t.toLowerCase().includes("cs2"))) ||
        (selectedTag === "keys" && merchant.tags.some((t) => t.toLowerCase().includes("key") || t.toLowerCase().includes("steam"))) ||
        (selectedTag === "currency" && merchant.tags.some((t) => t.toLowerCase().includes("gold") || t.toLowerCase().includes("gp") || t.toLowerCase().includes("currency") || t.toLowerCase().includes("modded"))) ||
        (selectedTag === "creator" && merchant.tags.some((t) => t.toLowerCase().includes("youtube") || t.toLowerCase().includes("tiktok") || t.toLowerCase().includes("social")));

      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-600/10 selection:text-blue-600">
      <Header
        activeCategory="browse"
        onSelectCategory={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProtectionModal={() => {}}
      />

      <main className="w-full pt-[102px] sm:pt-[106px] flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="w-full bg-slate-950 text-white py-12 sm:py-16 relative overflow-hidden border-b border-slate-800">
          {/* Real Downloaded Gaming Arena Background Layer */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src="/images/backgrounds/tactical-arena-bg.jpg"
              alt="Merchant Directory Arena Background"
              className="w-full h-full object-cover object-center opacity-45 scale-105"
            />
            {/* Directional scrim: darker on left for text legibility, atmospheric on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
          </div>

          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Marketplace
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white">Verified Merchant Directory</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Heading, Subhead, Search */}
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>KYC Bonded & Institutional Partners</span>
                </div>
                <h1 className="font-headline text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  Verified Merchant Stores
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-xl">
                  Discover accredited merchant storefronts on Safedeal. Every merchant maintains a dedicated
                  security deposit bond, automated credential vault dispatch, and guaranteed 48-hour escrow protection.
                </p>

                {/* In-Directory Search Bar */}
                <div className="pt-3 max-w-xl relative">
                  <div className="flex items-center h-12 bg-white/10 backdrop-blur-md rounded-2xl px-4 border border-white/20 focus-within:bg-white focus-within:text-slate-900 focus-within:border-blue-500 transition-all shadow-clean-sm">
                    <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search stores by merchant name, game, or asset type..."
                      className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm text-white focus:text-slate-900 placeholder:text-slate-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-slate-400 hover:text-white focus:hover:text-slate-700 text-xs font-bold ml-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: High-Trust Merchant Verification Badges Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Directory Safeguards
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      Institutional Tier
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span><strong>$10,000 Security Deposit Bond</strong> in reserve</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span><strong>Automated Credential Vault</strong> 0-second handover</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span><strong>48-Hour Inspection Escrow</strong> hold protection</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Controls & Merchant Grid */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {filterTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedTag === tag.id
                    ? "bg-slate-900 text-white shadow-clean-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Directory Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/70 pb-3">
            <span>
              Showing <strong>{filteredMerchants.length}</strong> accredited merchant stores
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Escrow Protected
            </span>
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-clean-sm hover:shadow-clean-md transition-all overflow-hidden flex flex-col justify-between group hover:-translate-y-0.5"
              >
                <div>
                  {/* Banner Image Preview */}
                  <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                    <img
                      src={merchant.bannerImage}
                      alt={merchant.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Security Bond Pill */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 backdrop-blur-md">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>{merchant.bondAmount}</span>
                    </div>

                    {/* Tier badge */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                      {merchant.tier}
                    </div>
                  </div>

                  {/* Header Row: Avatar & Bio */}
                  <div className="p-5 sm:p-6 pb-4">
                    <div className="flex items-start gap-4 -mt-10 mb-3 relative z-10">
                      <div className="relative">
                        <img
                          src={merchant.avatarUrl}
                          alt={merchant.name}
                          className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-clean-sm bg-white"
                        />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center ring-2 ring-white">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 pt-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {merchant.name}
                          </h3>
                          <Award className="w-4 h-4 text-blue-600 shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {merchant.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Metric Badges Strip */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-4">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate-400 block">
                          Rating
                        </span>
                        <div className="flex items-center gap-1 font-bold text-slate-900 mt-0.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{merchant.rating}</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            ({merchant.reviewsCount})
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate-400 block">
                          Orders
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {merchant.totalOrders}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate-400 block">
                          Delivery
                        </span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                          <Zap className="w-3 h-3 fill-emerald-600" />
                          {merchant.deliverySpeed}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {merchant.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Featured items snippet */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                        Featured in Store
                      </span>
                      {merchant.topProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs py-1 text-slate-700"
                        >
                          <span className="truncate pr-2 font-medium">• {p.title}</span>
                          <span className="font-bold text-slate-900 shrink-0 font-mono">
                            ${p.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="p-5 sm:p-6 pt-3 border-t border-slate-100 bg-slate-50/50">
                  <Link
                    href={`/store/${merchant.slug}`}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-clean-xs hover:shadow-clean-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Store className="w-4 h-4" />
                    <span>Enter {merchant.name} Storefront</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Seller Recruitment Banner */}
          <div className="mt-12 bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-clean-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Safedeal Merchant Program</span>
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-white">
                Are you a high-volume digital merchant?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Open your dedicated storefront with automated bot vault dispatch, 0% introductory fees,
                and zero chargeback risk under our institutional escrow architecture.
              </p>
            </div>

            <Link
              href="/seller"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-clean-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <span>Apply for Merchant Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer onSelectCategory={() => {}} onOpenProtectionModal={() => {}} />
    </div>
  );
}
