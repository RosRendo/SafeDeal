"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import CheckoutModal from "@/components/pages/CheckoutModal";
import EscrowGuaranteeModal from "@/components/pages/EscrowGuaranteeModal";
import { ProductItem } from "@/types/marketplace";
import { getProductById } from "@/lib/allProducts";
import { apiGetListingById } from "@/lib/apiClient";
import {
  ShieldCheck,
  Zap,
  Star,
  ShoppingBag,
  Heart,
  ChevronRight,
  Lock,
  ArrowRight,
  Clock,
  CheckCircle2,
  Share2,
  MessageSquare,
  BadgeCheck,
  ShieldAlert,
  Sparkles,
  Eye,
  Mail,
  Award,
  Globe,
  Coins,
  History,
  Check,
  Shield,
  Store,
} from "lucide-react";

interface GalleryThumbnail {
  id: string;
  label: string;
  url: string;
  alt: string;
}

const GALLERY_IMAGES: GalleryThumbnail[] = [
  {
    id: "hero",
    label: "Main Showcase",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    alt: "Valorant rank badge Immortal 3 alongside rare Champions Karambit and glowing gold weapon skins",
  },
  {
    id: "rank",
    label: "Rank",
    url: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?q=80&w=600&auto=format&fit=crop",
    alt: "Competitive career summary showing Immortal 3 rank emblem and peak 342 RR",
  },
  {
    id: "champions",
    label: "Champ 21/23",
    url: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=600&auto=format&fit=crop",
    alt: "Champions 2021 Vandal and Champions 2023 Vandal with golden kill banner effects",
  },
  {
    id: "knives",
    label: "6 Knives",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop",
    alt: "Melee knife collection displaying Kuronami no Yaiba, Prime Karambit, and Reaver Dagger",
  },
  {
    id: "oge",
    label: "OGE Email",
    url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=600&auto=format&fit=crop",
    alt: "Account security panel showing original creation email verification confirmation",
  },
  {
    id: "rifles",
    label: "Rifles",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    alt: "Weapon skin showcase showing Prelude to Chaos, Araxys, and Ion rifles",
  },
  {
    id: "currencies",
    label: "Currencies",
    url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop",
    alt: "In-game store and currency wallet showing 850 VP and 140 Radianite Points",
  },
];

const RELATED_LISTINGS = [
  {
    id: "rel-1",
    title: "Radiant 450 RR | Arcane Sheriff + Champions 2021 | 52 Skins | Clean OGE",
    server: "EU Central",
    subCategory: "Valorant • Radiant Peak",
    sellerName: "ValkyrieVault",
    rating: 4.99,
    reviews: "1.8k",
    price: 240.0,
    delivery: "Instant",
    image:
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "rel-2",
    title: "Full Kuronami Bundle + Reaver 2.0 Karambit | Level 160 | First Owner",
    server: "NA East",
    subCategory: "Valorant • Ascendant 3",
    sellerName: "ApexSmurfs",
    rating: 4.95,
    reviews: "640",
    price: 135.0,
    delivery: "Instant",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "rel-3",
    title: "China Server Launch Ignite Fan + VCT Lock//In Misericórdia | Immortal Peak",
    server: "Asia (AP)",
    subCategory: "Valorant • Rare Cosmetics",
    sellerName: "LotusGlobal",
    rating: 5.0,
    reviews: "412",
    price: 280.0,
    delivery: "15 Min",
    image:
      "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "rel-4",
    title: "Fresh Ranked Ready Level 20+ | Unranked 5 Placement Matches Available",
    server: "Global Account",
    subCategory: "Valorant • Smurf Account",
    sellerName: "FastRankDirect",
    rating: 4.91,
    reviews: "4.2k",
    price: 18.5,
    delivery: "Instant",
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=600&auto=format&fit=crop",
  },
];

function ListingDetailContent() {
  const params = useParams();
  const listingId = typeof params?.id === "string" ? params.id : "SF-94821";
  const productData = useMemo(() => getProductById(listingId), [listingId]);

  const [liveProduct, setLiveProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    let active = true;
    apiGetListingById(listingId).then((data) => {
      if (active && data) {
        setLiveProduct(data);
      }
    });
    return () => {
      active = false;
    };
  }, [listingId]);

  const activeProduct = liveProduct || productData;

  const [selectedImage, setSelectedImage] = useState<GalleryThumbnail>(() => ({
    id: "hero",
    label: "Main Showcase",
    url: productData.image,
    alt: productData.imageAlt || productData.title,
  }));

  useEffect(() => {
    if (activeProduct?.image) {
      setSelectedImage((prev) => ({
        ...prev,
        url: activeProduct.image,
        alt: activeProduct.imageAlt || activeProduct.title,
      }));
    }
  }, [activeProduct]);

  const [activeTab, setActiveTab] = useState<"inventory" | "delivery" | "guarantee">("inventory");
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [offerSent, setOfferSent] = useState(false);

  // Listing item mapped to ProductItem for CheckoutModal compatibility
  const currentProductItem: ProductItem = {
    ...activeProduct,
    image: selectedImage.url,
  };

  const sellerSlug = (currentProductItem.seller?.name || "AeroGamingDeals")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased">
      <Header
        activeCategory={productData.category || "all"}
        onSelectCategory={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
        wishlistCount={isSaved ? 1 : 0}
        onOpenWishlist={() => {}}
      />

      <main className="w-full pt-[102px] sm:pt-[106px] flex-1 flex flex-col">
        {/* Clean Inline Breadcrumbs & Viewer Activity */}
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-1 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href={`/browse?cat=${productData.category || "all"}`} className="hover:text-blue-600 transition-colors capitalize">
              {productData.category ? productData.category.replace("-", " ") : "Catalog"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">{productData.platform || productData.region || "Verified Asset"}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">#{productData.id}</span>
          </nav>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Escrow Lock Active</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-slate-700">28 buyers viewing now</span>
            </span>
          </div>
        </div>

        {/* Main Showcase Container */}
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ========================================================================= */}
            {/* LEFT COLUMN: Media Showcase, Key Specs, Technical Tabs (lg:col-span-8)   */}
            {/* ========================================================================= */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Header Badges & Title */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[12px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600" /> {currentProductItem.platform} • {currentProductItem.category.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[12px] font-bold">
                    {currentProductItem.region}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" /> {currentProductItem.deliveryType === "instant" ? "Instant Auto-Vault" : currentProductItem.deliveryTimeText}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-slate-400 font-mono text-[12px]">
                    ID: #{currentProductItem.id}
                  </span>
                </div>

                <h1 className="font-headline text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                  {currentProductItem.title}
                </h1>
              </div>

              {/* Gallery Section */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-clean-sm flex flex-col gap-3">
                {/* Main Hero Image Frame */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 group">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold rounded-full shadow-clean-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Genuine Riot Screenshots
                    </span>
                    <span className="px-3 py-1 bg-slate-900/90 text-white text-xs font-bold rounded-full shadow-clean-sm">
                      Clean Anti-Cheat Log
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-lg">
                    {selectedImage.label}
                  </div>
                </div>

                {/* Thumbnails Row */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
                  {GALLERY_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-video rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        selectedImage.id === img.id
                          ? "ring-2 ring-blue-600 border-blue-600 shadow-clean-sm scale-102"
                          : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 px-1 bg-black/70 text-white font-bold text-[10px] rounded">
                        {img.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Account Attributes Matrix */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-clean-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline text-lg font-bold text-slate-900">
                    Verified Account Attributes
                  </h2>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-mono text-xs font-bold border border-blue-100">
                    Automated API Audit
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Region / Shard
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>NA (US / CA)</span>
                    </div>
                    <span className="text-[12px] text-slate-500 mt-0.5 block">Low Ping NA East/West</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Rank Status
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-rose-600">
                      <Award className="w-4 h-4 text-rose-600" />
                      <span>Immortal 3 (342 RR)</span>
                    </div>
                    <span className="text-[12px] text-slate-500 mt-0.5 block">Current: Ascendant 2</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Account Level
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>Level 214</span>
                    </div>
                    <span className="text-[12px] text-slate-500 mt-0.5 block">High MMR Matchmaking</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Inventory Volume
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      <span>64 Skins • 6 Knives</span>
                    </div>
                    <span className="text-[12px] text-slate-500 mt-0.5 block">Rare Champions Vault</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Email Ownership
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-700">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span>First OGE Included</span>
                    </div>
                    <span className="text-[12px] text-slate-500 mt-0.5 block">Complete Creation Mail</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Penalties / History
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Clean Record</span>
                    </div>
                    <span className="text-[12px] text-slate-500 mt-0.5 block">Zero bans / restrictions</span>
                  </div>
                </div>
              </div>

              {/* Interactive Deep Tabs */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-clean-sm overflow-hidden">
                {/* Tab Switcher Headers */}
                <div className="flex bg-slate-50 border-b border-slate-200/80 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("inventory")}
                    className={`px-6 py-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                      activeTab === "inventory"
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Full Inventory & Bundles</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("delivery")}
                    className={`px-6 py-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                      activeTab === "delivery"
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Delivery Process</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("guarantee")}
                    className={`px-6 py-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                      activeTab === "guarantee"
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Protection & Warranty</span>
                  </button>
                </div>

                {/* Tab 1: Full Inventory Content */}
                {activeTab === "inventory" && (
                  <div className="p-6 sm:p-8 space-y-6">
                    <div>
                      <h3 className="font-headline text-base font-extrabold text-slate-900 mb-1">
                        Account Highlights & Vault Provenance
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Hand-leveled since Episode 1 Act 2. Clean MMR ladder history with verified Immortal 3 peak finishes. Never shared, botted, or boosted. Comes with both time-limited, vaulted Champions collector packs that will never re-appear in the daily item shop.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bundle Box 1 */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5 mb-2.5">
                          <Star className="w-4 h-4 fill-blue-600" /> Exclusive Vault Bundles
                        </span>
                        <ul className="space-y-2 text-xs text-slate-700">
                          <li className="flex justify-between">
                            <span>Champions 2021 Vandal (All variants)</span>
                            <span className="font-bold text-emerald-600 text-[12px]">Vaulted</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Champions 2021 Karambit (Level 3 Glow)</span>
                            <span className="font-bold text-emerald-600 text-[12px]">Vaulted</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Champions 2023 Vandal (Finisher active)</span>
                            <span className="font-bold text-emerald-600 text-[12px]">Vaulted</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Champions 2023 Kunai Knife</span>
                            <span className="font-bold text-emerald-600 text-[12px]">Vaulted</span>
                          </li>
                          <li className="flex justify-between">
                            <span>VCT LOCK//IN Misericórdia</span>
                            <span className="font-bold text-blue-600 text-[12px]">Rare</span>
                          </li>
                        </ul>
                      </div>

                      {/* Bundle Box 2 */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5 mb-2.5">
                          <Sparkles className="w-4 h-4 text-blue-600" /> Premium Weapon Skins
                        </span>
                        <ul className="space-y-2 text-xs text-slate-700">
                          <li className="flex justify-between">
                            <span>Prime Vandal + Reaver Vandal</span>
                            <span className="text-slate-400 text-[12px]">Max Upgraded</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Prelude to Chaos Vandal</span>
                            <span className="text-slate-400 text-[12px]">Black Variant</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Oni Phantom + Protocol 781-A</span>
                            <span className="text-slate-400 text-[12px]">Max Level</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Kuronami no Yaiba Dual Blades</span>
                            <span className="text-slate-400 text-[12px]">Max Upgraded</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Sovereign Ghost & Prime Classic</span>
                            <span className="text-slate-400 text-[12px]">Variants Unlocked</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Currencies Summary */}
                    <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span>850 VP in Wallet</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>140 Radianite Available</span>
                        </div>
                      </div>
                      <span className="text-slate-500 font-medium">Battle Pass Ep. 8: Tier 48 Unlocked</span>
                    </div>
                  </div>
                )}

                {/* Tab 2: Delivery Process Content */}
                {activeTab === "delivery" && (
                  <div className="p-6 sm:p-8 space-y-6">
                    <div>
                      <h3 className="font-headline text-base font-extrabold text-slate-900 mb-1">
                        Safedeal Automated Escrow Dispatch
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Zero waiting time. Our automated backend vaults hold the credentials securely and transfer them the millisecond payment is confirmed.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          1
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">Automated Vault Unlock</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Instant access to Riot ID, current password, and First Creation Email inbox login delivered to your orders inbox.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          2
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">Change Email & Attach 2FA</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Safedeal guided checklist assists you in linking your personal phone number, updating recovery credentials, and turning on authenticator.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          3
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">Inspection & Release</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          You have a full 48-hour inspection period. Funds stay frozen in escrow until you click 'Confirm Satisfied' or inspection expires.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Protection & Warranty Content */}
                {activeTab === "guarantee" && (
                  <div className="p-6 sm:p-8 space-y-4">
                    <div>
                      <h3 className="font-headline text-base font-extrabold text-slate-900 mb-1">
                        Safedeal 100% Protection Shield
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        We eliminate peer-to-peer trading risks with automated legal escrow agreements and dedicated dispute agents.
                      </p>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">48-Hour Inspection Window</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Login to the client, inspect weapon inventory, test matchmaking, and ensure rank integrity before funds are released to the seller.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-start gap-3">
                        <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Anti-Recall Warranty</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            First Original Email (OGE) access provides lifelong security. If an account is ever recalled or recovered by an original creator, Safedeal issues a full refund from seller deposit.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Live 24/7 Human Arbitration</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Encountered an incorrect region or missing advertised skin? Open a 1-click dispute to halt escrow and connect with a gaming specialist.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* RIGHT COLUMN: Sticky Buy Box & Verified Merchant Card (lg:col-span-4)     */}
            {/* ========================================================================= */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-32">
              {/* Buy Box Card */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-clean-md flex flex-col gap-4">
                {/* Price Header */}
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Buyout Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline text-3xl font-extrabold text-slate-900">
                      ${currentProductItem.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-slate-400">USD</span>
                    {currentProductItem.originalPrice && (
                      <span className="text-xs text-slate-400 line-through ml-1">
                        ${currentProductItem.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tax included, 0% buyer processing fee</span>
                  </div>
                </div>

                {/* Instant Delivery & Stock Status */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-800">
                    <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                    <span>Instant Delivery via Automated Vault</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>1 in stock (Unique account)</span>
                    </span>
                    <span className="font-mono text-slate-400 text-[12px]">Ref: VLO-882</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <Link
                    href={`/checkout?item=${currentProductItem.id}`}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-headline font-bold text-sm shadow-clean-sm hover:shadow-clean-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Buy Now with Escrow Protection</span>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOfferSent(true)}
                      className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>{offerSent ? "Offer Sent ✓" : "Make Offer"}</span>
                    </button>

                    <button
                      onClick={() => setIsSaved(!isSaved)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSaved
                          ? "bg-rose-50 border-rose-200 text-rose-600"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
                      <span>{isSaved ? "Saved" : "Save Item"}</span>
                    </button>
                  </div>
                </div>

                {/* Safedeal Escrow Shield Guarantee Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                  <div className="p-1.5 rounded-xl bg-white text-emerald-600 shadow-clean-xs flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="font-headline font-bold text-xs text-slate-900 block mb-0.5">
                      Safedeal 48-Hour Guarantee
                    </span>
                    <p className="text-[12px] text-slate-500 leading-relaxed">
                      Your payment is kept safely in escrow. The seller is not paid until you inspect and confirm full access.
                    </p>
                  </div>
                </div>

                {/* Payment Methods Accepted */}
                <div className="flex items-center justify-between text-slate-400 text-[12px] font-semibold pt-1 px-1">
                  <span>Accepted: Visa, MC, Apple Pay, Crypto</span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> 256-bit SSL
                  </span>
                </div>
              </div>

              {/* Verified Merchant Profile Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-clean-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Merchant Profile
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-extrabold uppercase tracking-wider">
                    Verified Pro
                  </span>
                </div>

                {/* Seller Identity */}
                <Link
                  href={`/store/${sellerSlug}`}
                  className="flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={currentProductItem.seller.avatarUrl}
                      alt={currentProductItem.seller.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm">
                      ✓
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-headline font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {currentProductItem.seller.name}
                      </h4>
                      <span title="Safedeal Elite Seller">
                        <Award className="w-4 h-4 text-blue-600" />
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <span className="text-amber-500 font-bold">★ {currentProductItem.seller.rating}</span>
                      <span className="text-slate-400">/ 5.0 ({currentProductItem.seller.reviewsCount || currentProductItem.seller.dealCount} reviews)</span>
                    </div>
                  </div>
                </Link>

                {/* Seller Stats Matrix */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">
                      Completed Orders
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      {currentProductItem.seller.dealCount?.toLocaleString()} orders
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold">99.4% success</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">
                      Avg Response
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">~4 minutes</span>
                    <span className="text-[11px] text-slate-500">Online Now</span>
                  </div>
                </div>

                {/* Badges Pill Cloud */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold">
                    Safedeal Elite
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold">
                    ID Verified
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold">
                    Auto-Dispatch
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[11px]">
                    Joined Mar 2021
                  </span>
                </div>

                <Link
                  href={`/store/${sellerSlug}`}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 text-center rounded-xl text-xs font-bold border border-slate-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Visit {currentProductItem.seller.name} Storefront</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RELATED LISTINGS ("You May Also Like")                                    */}
          {/* ========================================================================= */}
          <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-headline text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  You May Also Like
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Other vetted competitive accounts & limited edition skin collections
                </p>
              </div>

              <Link
                href="/browse"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Explore all Valorant accounts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4 Cards Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {RELATED_LISTINGS.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-clean-xs hover:shadow-clean-md transition-all flex flex-col overflow-hidden group"
                >
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 fill-emerald-600" /> {item.delivery}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white rounded text-[11px] font-bold">
                      {item.server}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                        {item.subCategory}
                      </span>
                      <h3 className="font-headline text-xs font-bold text-slate-900 mt-1 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2 text-[12px] text-slate-500">
                        <span className="font-semibold text-slate-700">{item.sellerName}</span>
                        <span className="text-amber-500 font-bold">★ {item.rating}</span>
                        <span className="text-slate-400">({item.reviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="font-headline text-base font-extrabold text-slate-900 block">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">0% Buyer Fee</span>
                      </div>

                      <Link
                        href={`/listing/${item.id}`}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        View Offer
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer
        onSelectCategory={() => {}}
        onOpenProtectionModal={() => setIsProtectionModalOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        product={isCheckoutOpen ? currentProductItem : null}
        onClose={() => setIsCheckoutOpen(false)}
        onOpenProtectionModal={() => {
          setIsCheckoutOpen(false);
          setIsProtectionModalOpen(true);
        }}
      />

      {/* 48-Hour Escrow Protection Guarantee Modal */}
      <EscrowGuaranteeModal
        isOpen={isProtectionModalOpen}
        onClose={() => setIsProtectionModalOpen(false)}
      />
    </div>
  );
}

export default function ListingDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ListingDetailContent />
    </React.Suspense>
  );
}
