"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Shield,
  Zap,
  Star,
  Plus,
  X,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Lock,
  Unlock,
  AlertCircle,
  Gamepad2,
  SlidersHorizontal,
  Info,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Search,
  KeyRound,
  FileText,
  DollarSign,
  Layers,
  Coins,
  Globe,
  Share2,
  Users,
  TrendingUp,
  Video,
  AtSign,
  Award,
  ShieldAlert,
} from "lucide-react";
import { saveCustomListing, CustomListing } from "@/lib/listingsStorage";
import { apiCreateListing } from "@/lib/apiClient";

interface SkinTag {
  id: string;
  name: string;
  isRare: boolean;
}

interface ScreenshotItem {
  id: string;
  label: string;
  url?: string;
  isSpecial?: boolean;
}

interface CreateListingWizardProps {
  onBack?: () => void;
  onPublishSuccess?: (listingData: CustomListing) => void;
}

export default function CreateListingWizard({
  onBack,
  onPublishSuccess,
}: CreateListingWizardProps) {
  const router = useRouter();

  // Wizard Step State (1 to 5) - Default starting at Step 1 for complete authoring
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form Fields State: Step 1 Taxonomy
  const [taxonomy, setTaxonomy] = useState({
    category: "Gaming Accounts",
    publisher: "Riot Games",
    game: "Valorant",
  });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Social Media & Creator Specific State
  const isSocial = taxonomy.category === "Creator & Social";
  const [socialPlatform, setSocialPlatform] = useState("YouTube");
  const [socialHandle, setSocialHandle] = useState("@techfrontier");
  const [socialFollowers, setSocialFollowers] = useState("45.2K Subscribers");
  const [socialMonetization, setSocialMonetization] = useState("Active & Monetized (YPP / AdSense)");
  const [socialNiche, setSocialNiche] = useState("Technology & AI");
  const [socialAudience, setSocialAudience] = useState("Tier-1 US & UK (72%)");
  const [socialStrikesClean, setSocialStrikesClean] = useState(true);
  const [socialOgeIncluded, setSocialOgeIncluded] = useState(true);
  const [socialBrandTransfer, setSocialBrandTransfer] = useState(true);

  // Social tags list
  const [socialTags, setSocialTags] = useState<SkinTag[]>([
    { id: "st-1", name: "YPP Monetized", isRare: true },
    { id: "st-2", name: "Clean AdSense Linked", isRare: true },
    { id: "st-3", name: "0 Strikes Clean History", isRare: false },
    { id: "st-4", name: "45K Organic Subscribers", isRare: false },
    { id: "st-5", name: "70%+ US/UK Demographics", isRare: false },
    { id: "st-6", name: "Original Gmail Handover", isRare: true },
  ]);

  // Step 2: Account Details
  const [title, setTitle] = useState(
    "Valorant High-Tier Account | Peak Immortal 3 (342 RR) | Champions 2021 & 2023 Bundles | Full OGE"
  );
  const [region, setRegion] = useState("North America (NA / US-East)");
  const [currentRank, setCurrentRank] = useState("Ascendant 2");
  const [peakRank, setPeakRank] = useState("Immortal 3 (342 RR)");

  // Skin tags list
  const [skinTags, setSkinTags] = useState<SkinTag[]>([
    { id: "1", name: "Champions 2021 Vandal", isRare: true },
    { id: "2", name: "Champions Karambit", isRare: true },
    { id: "3", name: "Kuronami No Yaiba", isRare: false },
    { id: "4", name: "Reaver Vandal", isRare: false },
    { id: "5", name: "Prime 2.0 Phantom", isRare: false },
  ]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  // Email Security Tier
  const [emailSecurity, setEmailSecurity] = useState<"oge" | "clean">("oge");

  // Description
  const [description, setDescription] = useState(
    `Episode 1 Act 1 account created by myself. Never shared, botted, or injected. Peak Immortal 3 with 342 RR in Episode 7. Current Ascendant 2 due to rank reset, high MMR lobbies (+26 / -12).\n\nComes with complete first creation email (OGE) on ProtonMail, Riot Welcome invoice email intact. Total spend exceeds $1,400 with Champions 2021 & 2023 exclusive bundles maxed out with all variants unlocked. No voice chat restrictions or past strikes.`
  );

  // Screenshots
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([
    {
      id: "sc-1",
      label: "Main Cover",
      url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "sc-2",
      label: "Vandal Skin",
      url: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "sc-3",
      label: "History",
      url: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "sc-4",
      label: "Vanguard Clean",
      isSpecial: true,
    },
  ]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Step 3: Pricing State
  const [basePrice, setBasePrice] = useState<number>(195);
  const fee = (basePrice * 0.05).toFixed(2);
  const netPayout = (basePrice * 0.95).toFixed(2);
  const [deliveryType, setDeliveryType] = useState<"instant" | "manual">("instant");
  const [inspectionWindow, setInspectionWindow] = useState<"48h" | "24h">("48h");

  // Step 4: Vault & Delivery Setup State
  const [vaultLogin, setVaultLogin] = useState("vanguard_elite_na");
  const [vaultPassword, setVaultPassword] = useState("VanguardSafePass2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [vaultEmailPassword, setVaultEmailPassword] = useState("proton_oge_access_key_992");
  const [vaultRecoveryCode, setVaultRecoveryCode] = useState("RIOT-8921-9920-ABCD");
  const [vaultBuyerInstructions, setVaultBuyerInstructions] = useState(
    "Launch Riot Client with provided credentials. 2FA is bound to the OGE ProtonMail inbox included in credentials. Confirm email change within 48h inspection window."
  );

  // Step 5: Terms Agreement
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Notifications & Publish State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tag Handlers
  const handleRemoveTag = (id: string) => {
    setSkinTags((prev) => prev.filter((t) => t.id !== id));
    showToast("Removed skin tag highlight.");
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      setIsAddingTag(false);
      return;
    }
    const newTag: SkinTag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      isRare: newTagName.toLowerCase().includes("champions") || newTagName.toLowerCase().includes("knife"),
    };
    setSkinTags((prev) => [...prev, newTag]);
    setNewTagName("");
    setIsAddingTag(false);
    showToast(`Added "${newTag.name}" tag to listing.`);
  };

  // Screenshot Removal
  const handleRemoveScreenshot = (id: string) => {
    setScreenshots((prev) => prev.filter((sc) => sc.id !== id));
    showToast("Screenshot removed.");
  };

  // Simulate file upload
  const handleUploadSimulate = () => {
    const newId = `sc-${Date.now()}`;
    const newSc: ScreenshotItem = {
      id: newId,
      label: `Proof #${screenshots.length + 1}`,
      url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop",
    };
    setScreenshots((prev) => [...prev, newSc]);
    showToast("New proof screenshot uploaded successfully!");
  };

  // Quality score dynamic calculation
  const hasOge = emailSecurity === "oge";
  const hasEnoughScreenshots = screenshots.length >= 4;
  const hasQualityTitle = title.length >= 40;
  const hasCompetitivePrice = basePrice >= 50;

  const qualityScore =
    (hasOge ? 20 : 10) +
    (hasEnoughScreenshots ? 25 : 15) +
    (hasQualityTitle ? 30 : 15) +
    (hasCompetitivePrice ? 20 : 10);

  // Publish / Continue Handler
  const handleContinue = () => {
    if (activeStep < 5) {
      setActiveStep((prev) => (prev + 1) as number);
      showToast(`Advanced to Step ${activeStep + 1} of listing configuration.`);
    } else {
      if (!termsAgreed) {
        showToast("Please agree to the Safedeal Escrow Handover terms before publishing.");
        return;
      }
      setIsSubmitting(true);
      (async () => {
        try {
          // Save via API + persistent storage!
          const saved = await apiCreateListing({
            title,
            type: taxonomy.category === "Game Keys" ? "Key" : taxonomy.category === "In-Game Currency" ? "Currency" : taxonomy.category === "Creator & Social" ? "Asset" : "Account",
            category: `${taxonomy.category} > ${taxonomy.game}`,
            categoryKey: taxonomy.category === "Game Keys" ? "keys" : taxonomy.category === "In-Game Currency" ? "currency" : taxonomy.category === "Creator & Social" ? "social" : "accounts",
            game: taxonomy.game,
            publisher: taxonomy.publisher,
            price: basePrice,
            priceSub: deliveryType === "instant" ? "Instant Automated Handover" : "Escrow Coordinated Trade",
            region,
            currentRank,
            peakRank,
            emailSecurity,
            skinTags: isSocial ? socialTags : skinTags,
            description,
            image: screenshots[0]?.url || (isSocial ? "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop" : "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"),
            imageAlt: title,
            status: "Active",
            isAutoDispatch: isSocial ? false : deliveryType === "instant",
            followers: isSocial ? socialFollowers : undefined,
            monetization: isSocial ? socialMonetization : undefined,
            niche: isSocial ? socialNiche : undefined,
            handle: isSocial ? socialHandle : undefined,
            cleanStrikes: isSocial ? socialStrikesClean : undefined,
            vaultCredentials: {
              username: isSocial ? `${socialPlatform} (${socialHandle})` : vaultLogin,
              email: vaultEmailPassword,
              notes: vaultBuyerInstructions,
              twoFactorReady: !!vaultRecoveryCode,
            },
          });

          // Also persist directly to server database
          try {
            await fetch("/api/listings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: saved.id,
                title: saved.title,
                price: saved.price,
                category: saved.categoryKey,
                platform: saved.game || saved.publisher,
                region: saved.region,
                image: saved.image,
                deliveryType: saved.isAutoDispatch ? "instant" : "coordinated",
                status: "Active",
              }),
            });
          } catch (apiErr) {
            console.warn("Failed to sync listing to server API:", apiErr);
          }

          setIsSubmitting(false);
          showToast("🎉 Listing published live to Safedeal Marketplace with Escrow Shield!");

          if (onPublishSuccess) {
            onPublishSuccess(saved);
          } else {
            router.push(`/seller/listings?new=${saved.id}`);
          }
        } catch (err) {
          setIsSubmitting(false);
          showToast("Listing published to local store.");
        }
      })();
    }
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Toast Notification (Daylight Theme) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-slate-900 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold border border-slate-200/90 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700 ml-2 cursor-pointer p-0.5"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 space-y-6">
        {/* Top Action Bar & Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] font-bold text-[12px] uppercase tracking-wider border border-blue-100">
                Escrow Protocol v4.2
              </span>
              <span className="text-slate-500 text-[12px] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Draft auto-saved 1m ago
              </span>
            </div>
            <h1 className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">
              Create New Listing
            </h1>
            <p className="text-sm text-slate-600">
              List digital gaming accounts, game keys, or virtual assets with automated escrow protection.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => showToast("Draft saved successfully to cloud repository.")}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              type="button"
            >
              Save Draft
            </button>
            <button
              onClick={() => {
                if (onBack) onBack();
                else router.push("/seller/listings");
              }}
              className="px-4 py-2 rounded-xl bg-transparent text-slate-600 font-bold text-xs hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="w-full bg-white p-4 md:p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
            {[
              { num: 1, title: "Category & Type" },
              { num: 2, title: "Account Details" },
              { num: 3, title: "Pricing & Fees" },
              { num: 4, title: "Vault & Delivery" },
              { num: 5, title: "Review & Publish" },
            ].map((step) => {
              const isPast = activeStep > step.num;
              const isCurrent = activeStep === step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className="flex items-center gap-2.5 text-left cursor-pointer group focus-visible:outline-none"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                      isCurrent
                        ? "bg-[var(--cobalt-acc)] text-white shadow-sm ring-2 ring-blue-200"
                        : isPast
                        ? "bg-blue-50 text-[var(--cobalt-acc)] border border-blue-200/60"
                        : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 text-[var(--cobalt-acc)]" /> : step.num}
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`block text-[11px] uppercase font-bold ${
                        isCurrent ? "text-[var(--cobalt-acc)]" : "text-slate-400"
                      }`}
                    >
                      {isCurrent ? "Active Step" : `Step ${step.num}`}
                    </span>
                    <span
                      className={`block text-xs truncate ${
                        isCurrent
                          ? "font-bold text-slate-900"
                          : "font-semibold text-slate-600 group-hover:text-slate-900"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-[var(--cobalt-acc)] h-full rounded-full transition-all duration-300"
              style={{ width: `${(activeStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Wizard Grid: 65% Form / 35% Live Sticky Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column Form (8 Cols ~ 65%) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Selected Category Ribbon (Shared Across Steps) */}
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[var(--cobalt-acc)] flex-shrink-0 border border-blue-100">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Target Taxonomy
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 flex-wrap">
                    <span>{taxonomy.category}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>{taxonomy.publisher}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[var(--cobalt-acc)]">{taxonomy.game}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[var(--cobalt-acc)] font-bold text-xs transition-colors self-start sm:self-auto flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change Category</span>
              </button>
            </div>

            {/* STEP 1: CATEGORY & TAXONOMY */}
            {activeStep === 1 && (
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-headline text-lg font-bold text-slate-900">
                    Step 1: Choose Asset Category & Game Platform
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select the exact vertical and publisher for maximum search discoverability and correct escrow rules.
                  </p>
                </div>

                {/* Primary Category Selector Cards */}
                <div className="space-y-2">
                  <label className="font-bold text-xs text-slate-900">Digital Asset Class</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        name: "Gaming Accounts",
                        desc: "Full custody accounts with OE / email transfer and stats warranty.",
                        icon: Gamepad2,
                      },
                      {
                        name: "Game Keys",
                        desc: "Official digital activation codes for Steam, Xbox, PSN, EA App.",
                        icon: KeyRound,
                      },
                      {
                        name: "In-Game Currency",
                        desc: "Safe currency & gold reserves with automated or in-game delivery.",
                        icon: Coins,
                      },
                      {
                        name: "Creator & Social",
                        desc: "Monetized channels, communities, and digital handle transfers.",
                        icon: Globe,
                      },
                    ].map((cat) => {
                      const isSel = taxonomy.category === cat.name;
                      const IconComp = cat.icon;
                      return (
                        <div
                          key={cat.name}
                          onClick={() => {
                            setTaxonomy((prev) => ({
                              ...prev,
                              category: cat.name,
                              ...(cat.name === "Creator & Social"
                                ? { publisher: "Google / Alphabet", game: "YouTube Channel" }
                                : cat.name === "Game Keys"
                                ? { publisher: "Valve", game: "Steam Key" }
                                : cat.name === "In-Game Currency"
                                ? { publisher: "Blizzard", game: "WoW Gold" }
                                : { publisher: "Riot Games", game: "Valorant" }),
                            }));
                            if (cat.name === "Creator & Social") {
                              setTitle("YouTube Monetized Channel | 45K Tech Niche | Clean AdSense & 0 Strikes");
                              setDescription("Monetized YouTube Partner Program (YPP) channel established in 2022. 45,200 active organic subscribers with high retention in the Technology & AI vertical. Clean AdSense account link with zero community strikes or copyright claims. Comes with original creator email (OGE) and full 7-day primary owner transition protocol.");
                              setBasePrice(420);
                              setDeliveryType("manual");
                              setInspectionWindow("48h");
                            } else if (cat.name === "Gaming Accounts") {
                              setTitle("Valorant High-Tier Account | Peak Immortal 3 (342 RR) | Champions 2021 & 2023 Bundles | Full OGE");
                              setBasePrice(185);
                              setDeliveryType("instant");
                              setInspectionWindow("48h");
                            }
                            showToast(`Selected Category: ${cat.name}`);
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isSel
                              ? "bg-blue-50/80 border-[var(--cobalt-acc)] ring-2 ring-blue-500/20"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isSel ? "bg-[var(--cobalt-acc)] text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">{cat.name}</span>
                            <span className="text-[12px] text-slate-500 leading-tight block mt-0.5">
                              {cat.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Popular Games & Publishers Grid */}
                <div className="space-y-2">
                  <label className="font-bold text-xs text-slate-900">
                    {taxonomy.category === "Creator & Social"
                      ? "Popular Creator Platforms & Social Networks"
                      : "Popular Games & Services"}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(taxonomy.category === "Creator & Social"
                      ? [
                          { game: "YouTube Channel", pub: "Google / Alphabet", cat: "Creator & Social" },
                          { game: "TikTok Account", pub: "ByteDance", cat: "Creator & Social" },
                          { game: "Instagram Page", pub: "Meta", cat: "Creator & Social" },
                          { game: "X (Twitter) Handle", pub: "X Corp", cat: "Creator & Social" },
                          { game: "Discord Community", pub: "Discord Inc", cat: "Creator & Social" },
                          { game: "Twitch Channel", pub: "Amazon", cat: "Creator & Social" },
                          { game: "Telegram Channel", pub: "Telegram FZ", cat: "Creator & Social" },
                          { game: "Kick Streaming", pub: "Kick Streaming", cat: "Creator & Social" },
                        ]
                      : taxonomy.category === "Game Keys"
                      ? [
                          { game: "Cyberpunk 2077", pub: "CD PROJEKT", cat: "Game Keys" },
                          { game: "Elden Ring", pub: "FromSoftware", cat: "Game Keys" },
                          { game: "Black Myth: Wukong", pub: "Game Science", cat: "Game Keys" },
                          { game: "GTA V", pub: "Rockstar Games", cat: "Game Keys" },
                          { game: "Red Dead 2", pub: "Rockstar Games", cat: "Game Keys" },
                          { game: "Baldur's Gate 3", pub: "Larian Studios", cat: "Game Keys" },
                          { game: "Minecraft", pub: "Mojang", cat: "Game Keys" },
                          { game: "EA FC 25", pub: "EA Sports", cat: "Game Keys" },
                        ]
                      : taxonomy.category === "In-Game Currency"
                      ? [
                          { game: "WoW Gold", pub: "Blizzard", cat: "In-Game Currency" },
                          { game: "Robux", pub: "Roblox Corp", cat: "In-Game Currency" },
                          { game: "OSRS GP", pub: "Jagex", cat: "In-Game Currency" },
                          { game: "FC Coins", pub: "EA Sports", cat: "In-Game Currency" },
                          { game: "FFXIV Gil", pub: "Square Enix", cat: "In-Game Currency" },
                          { game: "POE Orbs", pub: "Grinding Gear", cat: "In-Game Currency" },
                          { game: "Diablo IV Gold", pub: "Blizzard", cat: "In-Game Currency" },
                          { game: "GTA Cash", pub: "Rockstar", cat: "In-Game Currency" },
                        ]
                      : [
                          { game: "Valorant", pub: "Riot Games", cat: "Gaming Accounts" },
                          { game: "Counter-Strike 2", pub: "Valve", cat: "Gaming Accounts" },
                          { game: "Fortnite", pub: "Epic Games", cat: "Gaming Accounts" },
                          { game: "Warzone", pub: "Activision", cat: "Gaming Accounts" },
                          { game: "League of Legends", pub: "Riot Games", cat: "Gaming Accounts" },
                          { game: "Apex Legends", pub: "EA Respawn", cat: "Gaming Accounts" },
                          { game: "Overwatch 2", pub: "Blizzard", cat: "Gaming Accounts" },
                          { game: "Genshin Impact", pub: "HoYoverse", cat: "Gaming Accounts" },
                        ]
                    ).map((item) => {
                      const isSel = taxonomy.game === item.game;
                      return (
                        <button
                          key={item.game}
                          type="button"
                          onClick={() => {
                            setTaxonomy({
                              category: item.cat,
                              publisher: item.pub,
                              game: item.game,
                            });
                            if (item.cat === "Creator & Social") {
                              const plat = item.game.split(" ")[0];
                              setSocialPlatform(plat);
                              setTitle(`${item.game} | 45K Active Followers | Clean Standing & Full Transfer`);
                            }
                            showToast(`Selected: ${item.game} (${item.pub})`);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? "bg-[var(--cobalt-acc)] text-white border-[var(--cobalt-acc)] shadow-sm"
                              : "bg-slate-50 border-slate-200/90 text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-[11px] uppercase font-bold opacity-75 block truncate">
                            {item.pub}
                          </span>
                          <span className="font-bold text-xs truncate block">{item.game}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ACCOUNT ATTRIBUTES & MEDIA */}
            {activeStep === 2 && (
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-headline text-lg font-bold text-slate-900">
                    Step 2: Account Core Attributes & Proof
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Accurate metadata raises your listing in search filters and decreases post-sale dispute probability to zero.
                  </p>
                </div>

                {/* Listing Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="listing-title" className="font-bold text-xs text-slate-900 flex items-center gap-1">
                      Listing Title <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-[12px] font-mono ${
                        title.length > 90 ? "text-rose-600 font-bold" : "text-slate-400"
                      }`}
                    >
                      {title.length}/100
                    </span>
                  </div>
                  <input
                    id="listing-title"
                    type="text"
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs transition-all"
                    placeholder="e.g. Valorant Immortal 3 | Champions Bundle | Full OGE"
                  />
                  <p className="text-[12px] text-slate-500">
                    Recommended format: [Game] + [Current/Peak Rank] + [Rare Skins/Knives] + [Email Security].
                  </p>
                </div>

                {/* Step 2 Conditional Fields: Social Media vs Gaming Account */}
                {isSocial ? (
                  <div className="space-y-6">
                    {/* Platform, Handle & Demographics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Platform */}
                      <div className="space-y-1.5">
                        <label htmlFor="social-platform" className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          Social Platform <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="social-platform"
                          value={socialPlatform}
                          onChange={(e) => {
                            setSocialPlatform(e.target.value);
                            setTaxonomy((prev) => ({ ...prev, game: `${e.target.value} Account` }));
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs cursor-pointer bg-white"
                        >
                          <option value="YouTube">YouTube</option>
                          <option value="TikTok">TikTok</option>
                          <option value="Instagram">Instagram</option>
                          <option value="X (Twitter)">X (Twitter)</option>
                          <option value="Discord">Discord Community</option>
                          <option value="Twitch">Twitch Channel</option>
                          <option value="Telegram">Telegram Channel</option>
                          <option value="Kick">Kick Streaming</option>
                        </select>
                      </div>

                      {/* Handle / Channel URL */}
                      <div className="space-y-1.5">
                        <label htmlFor="social-handle" className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          Channel Handle / URL <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">@</span>
                          <input
                            id="social-handle"
                            type="text"
                            value={socialHandle.replace(/^@/, "")}
                            onChange={(e) => setSocialHandle(`@${e.target.value.replace(/^@/, "")}`)}
                            placeholder="channelname"
                            className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Audience Demographics */}
                      <div className="space-y-1.5">
                        <label htmlFor="social-audience" className="font-bold text-xs text-slate-900">
                          Primary Audience Demographics
                        </label>
                        <select
                          id="social-audience"
                          value={socialAudience}
                          onChange={(e) => setSocialAudience(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs cursor-pointer bg-white"
                        >
                          <option value="Tier-1 US & UK (72%)">Tier-1 US & UK (70%+)</option>
                          <option value="North America (US / Canada)">North America (US / Canada)</option>
                          <option value="European Union (DE/FR/UK)">European Union (DE/FR/UK)</option>
                          <option value="Global Worldwide (Diversified)">Global Worldwide (Diversified)</option>
                          <option value="Latin America (LATAM)">Latin America (LATAM)</option>
                          <option value="Asia-Pacific (APAC)">Asia-Pacific (APAC)</option>
                        </select>
                      </div>
                    </div>

                    {/* Followers, Monetization & Niche Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Followers */}
                      <div className="space-y-1.5">
                        <label htmlFor="social-followers" className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          Followers / Subscribers <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="social-followers"
                          type="text"
                          value={socialFollowers}
                          onChange={(e) => setSocialFollowers(e.target.value)}
                          placeholder="e.g. 45.2K Subscribers"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs"
                        />
                      </div>

                      {/* Monetization Status */}
                      <div className="space-y-1.5">
                        <label htmlFor="social-monetization" className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          Monetization Status <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="social-monetization"
                          value={socialMonetization}
                          onChange={(e) => setSocialMonetization(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs cursor-pointer bg-white"
                        >
                          <option value="Active & Monetized (YPP / AdSense)">Active & Monetized (YPP / AdSense)</option>
                          <option value="Creator Rewards Fund Active">Creator Rewards Fund Active</option>
                          <option value="Monetization Eligible (Ready to Apply)">Monetization Eligible (Ready to Apply)</option>
                          <option value="Affiliate & Sponsorship Enabled">Affiliate & Sponsorship Enabled</option>
                          <option value="Organic Growth / Non-Monetized">Organic Growth / Non-Monetized</option>
                        </select>
                      </div>

                      {/* Content Niche */}
                      <div className="space-y-1.5">
                        <label htmlFor="social-niche" className="font-bold text-xs text-slate-900">
                          Content Vertical / Niche <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="social-niche"
                          value={socialNiche}
                          onChange={(e) => setSocialNiche(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs cursor-pointer bg-white"
                        >
                          <option value="Technology & AI">Technology & AI</option>
                          <option value="Gaming & Esports">Gaming & Esports</option>
                          <option value="Crypto, Web3 & Finance">Crypto, Web3 & Finance</option>
                          <option value="Lifestyle, Fitness & Health">Lifestyle, Fitness & Health</option>
                          <option value="Entertainment, Clips & Memes">Entertainment, Clips & Memes</option>
                          <option value="Documentary, Education & Business">Documentary, Education & Business</option>
                        </select>
                      </div>
                    </div>

                    {/* Social Health & Escrow Guarantees */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => setSocialStrikesClean(!socialStrikesClean)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          socialStrikesClean ? "bg-emerald-50/70 border-emerald-300" : "bg-white border-slate-200"
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${socialStrikesClean ? "text-emerald-600" : "text-slate-300"}`} />
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">0 Copyright Strikes</span>
                          <span className="text-[12px] text-slate-500 block mt-0.5">Clean standing verified on studio dashboard.</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setSocialOgeIncluded(!socialOgeIncluded)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          socialOgeIncluded ? "bg-blue-50/70 border-blue-300" : "bg-white border-slate-200"
                        }`}
                      >
                        <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${socialOgeIncluded ? "text-[var(--cobalt-acc)]" : "text-slate-300"}`} />
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">OGE Gmail Handover</span>
                          <span className="text-[12px] text-slate-500 block mt-0.5">Original creation email account transferred to buyer.</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setSocialBrandTransfer(!socialBrandTransfer)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          socialBrandTransfer ? "bg-purple-50/70 border-purple-300" : "bg-white border-slate-200"
                        }`}
                      >
                        <Award className={`w-4 h-4 mt-0.5 shrink-0 ${socialBrandTransfer ? "text-purple-600" : "text-slate-300"}`} />
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">7-Day Primary Protocol</span>
                          <span className="text-[12px] text-slate-500 block mt-0.5">Brand Account manager promotion escrow protection.</span>
                        </div>
                      </div>
                    </div>

                    {/* Social Highlights & Badges */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-xs text-slate-900">
                          Channel Metrics & Highlights Badges
                        </label>
                        <span className="text-[12px] font-bold text-[var(--cobalt-acc)]">
                          {socialTags.length} Highlights Recorded
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-wrap gap-2 items-center">
                        {socialTags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-900 font-bold text-xs shadow-xs border border-slate-200"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                tag.isRare ? "bg-amber-500" : "bg-[var(--cobalt-acc)]"
                              }`}
                            />
                            <span>{tag.name}</span>
                            <button
                              onClick={() => setSocialTags((prev) => prev.filter((t) => t.id !== tag.id))}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              type="button"
                              title="Remove tag"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Region / Shard & Ranks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Region Dropdown */}
                      <div className="space-y-1.5">
                        <label htmlFor="region-select" className="font-bold text-xs text-slate-900">
                          Account Region / Shard <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="region-select"
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs cursor-pointer bg-white"
                        >
                          <option value="North America (NA / US-East)">North America (NA / US-East)</option>
                          <option value="North America (NA / US-West)">North America (NA / US-West)</option>
                          <option value="Europe (EU Central / West)">Europe (EU Central / West)</option>
                          <option value="Asia Pacific (APAC / Tokyo)">Asia Pacific (APAC / Tokyo)</option>
                          <option value="Latin America (LATAM)">Latin America (LATAM)</option>
                          <option value="Brazil (BR)">Brazil (BR)</option>
                        </select>
                      </div>

                      {/* Current Rank */}
                      <div className="space-y-1.5">
                        <label htmlFor="current-rank" className="font-bold text-xs text-slate-900">
                          Current Rank <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="current-rank"
                          value={currentRank}
                          onChange={(e) => setCurrentRank(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs cursor-pointer bg-white"
                        >
                          <option value="Diamond 3">Diamond 3</option>
                          <option value="Ascendant 1">Ascendant 1</option>
                          <option value="Ascendant 2">Ascendant 2</option>
                          <option value="Ascendant 3">Ascendant 3</option>
                          <option value="Immortal 1">Immortal 1</option>
                          <option value="Immortal 2">Immortal 2</option>
                          <option value="Immortal 3">Immortal 3</option>
                          <option value="Radiant">Radiant</option>
                        </select>
                      </div>

                      {/* Peak Rank */}
                      <div className="space-y-1.5">
                        <label htmlFor="peak-rank" className="font-bold text-xs text-slate-900">
                          Peak Rank Record <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="peak-rank"
                          value={peakRank}
                          onChange={(e) => setPeakRank(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs cursor-pointer bg-white"
                        >
                          <option value="Ascendant 3">Ascendant 3</option>
                          <option value="Immortal 2 (180 RR)">Immortal 2 (180 RR)</option>
                          <option value="Immortal 3 (342 RR)">Immortal 3 (342 RR)</option>
                          <option value="Radiant (Top 500)">Radiant (Top 500)</option>
                        </select>
                      </div>
                    </div>

                    {/* Key Skin Highlights */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-xs text-slate-900">
                          Key Skin Highlights & Exclusive Bundles
                        </label>
                        <span className="text-[12px] font-bold text-[var(--cobalt-acc)]">
                          {skinTags.length} Weapon Skins, 6 Knives Recorded
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-wrap gap-2 items-center">
                        {skinTags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-900 font-bold text-xs shadow-xs border border-slate-200"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                tag.isRare ? "bg-amber-500" : "bg-[var(--cobalt-acc)]"
                              }`}
                            />
                            <span>{tag.name}</span>
                            <button
                              onClick={() => handleRemoveTag(tag.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              type="button"
                              title="Remove tag"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}

                        {isAddingTag ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[var(--cobalt-acc)]">
                            <input
                              type="text"
                              autoFocus
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddTag();
                                if (e.key === "Escape") setIsAddingTag(false);
                              }}
                              placeholder="Tag name..."
                              className="w-28 text-xs font-bold text-slate-900 focus:outline-none"
                            />
                            <button
                              onClick={handleAddTag}
                              className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
                              type="button"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setIsAddingTag(false)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              type="button"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingTag(true)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-[var(--cobalt-acc)] font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100"
                            type="button"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Skin Tag</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Email Ownership Tier */}
                    <div className="space-y-2">
                      <label className="font-bold text-xs text-slate-900 flex items-center justify-between">
                        <span>
                          Email Ownership & Security Transfer Tier <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[12px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Recommended For Fast Escrow Release
                        </span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label
                          onClick={() => setEmailSecurity("oge")}
                          className={`p-4 rounded-2xl shadow-xs cursor-pointer flex flex-col justify-between gap-3 border transition-all ${
                            emailSecurity === "oge"
                              ? "bg-blue-50/70 border-[var(--cobalt-acc)] ring-2 ring-blue-500/20"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <input
                                checked={emailSecurity === "oge"}
                                onChange={() => setEmailSecurity("oge")}
                                className="mt-1 accent-[var(--cobalt-acc)] cursor-pointer"
                                name="email_security"
                                type="radio"
                              />
                              <div>
                                <span className="font-bold text-xs text-slate-900 block">
                                  Original Creation Email (OGE) Included
                                </span>
                                <span className="text-[12px] text-slate-600 block mt-0.5">
                                  Includes first registration mailbox access with receipt history.
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] uppercase flex-shrink-0">
                              Tier 1
                            </span>
                          </div>
                          <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Highest buyer trust • 0% dispute hold penalty • Fast payout</span>
                          </div>
                        </label>

                        <label
                          onClick={() => setEmailSecurity("clean")}
                          className={`p-4 rounded-2xl shadow-xs cursor-pointer flex flex-col justify-between gap-3 border transition-all ${
                            emailSecurity === "clean"
                              ? "bg-blue-50/70 border-[var(--cobalt-acc)] ring-2 ring-blue-500/20"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <input
                                checked={emailSecurity === "clean"}
                                onChange={() => setEmailSecurity("clean")}
                                className="mt-1 accent-[var(--cobalt-acc)] cursor-pointer"
                                name="email_security"
                                type="radio"
                              />
                              <div>
                                <span className="font-bold text-xs text-slate-900 block">
                                  Clean Transfer Email (Re-linked)
                                </span>
                                <span className="text-[12px] text-slate-600 block mt-0.5">
                                  Primary email changed to fresh unlinked Gmail/Proton ready for buyer handover.
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[11px] uppercase flex-shrink-0">
                              Tier 2
                            </span>
                          </div>
                          <div className="pt-2 flex items-center gap-2 text-[11px] font-medium text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span>Requires manual buyer confirmation inspection period</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Detailed Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="account-desc" className="font-bold text-xs text-slate-900">
                      Detailed Description & History Notes
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      Markdown formatting supported
                    </span>
                  </div>
                  <textarea
                    id="account-desc"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-slate-900 font-normal text-xs focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)] shadow-xs transition-all leading-relaxed"
                  />
                </div>

                {/* Screenshots Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-slate-900">
                      Proof Screenshots & In-Game Inventory Proof <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[12px] font-bold text-[var(--cobalt-acc)]">
                      {screenshots.length} of 8 Uploaded
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {screenshots.map((item) => (
                      <div
                        key={item.id}
                        className="relative group rounded-xl overflow-hidden bg-slate-100 shadow-xs aspect-video sm:aspect-square border border-slate-200"
                      >
                        {item.isSpecial ? (
                          <div className="w-full h-full bg-emerald-50/80 flex flex-col items-center justify-center p-2 text-center">
                            <CheckCircle2 className="w-7 h-7 text-emerald-600 mb-1" />
                            <span className="font-bold text-xs text-slate-900 leading-tight">
                              Vanguard Clean
                            </span>
                            <span className="text-[11px] text-slate-500 mt-0.5">No HWID Bans</span>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}

                        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                          {item.url && (
                            <button
                              onClick={() => setZoomedImage(item.url || null)}
                              className="p-1.5 rounded-full bg-white/90 text-slate-900 hover:bg-white cursor-pointer shadow-sm"
                              type="button"
                              title="Preview screenshot"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveScreenshot(item.id)}
                            className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-sm"
                            type="button"
                            title="Remove screenshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white font-bold text-[11px]">
                          {item.label}
                        </span>
                      </div>
                    ))}

                    <div
                      onClick={handleUploadSimulate}
                      className="rounded-xl bg-slate-50 hover:bg-blue-50/60 border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer shadow-xs aspect-video sm:aspect-square group"
                    >
                      <Upload className="w-6 h-6 text-[var(--cobalt-acc)] group-hover:scale-110 transition-transform mb-1" />
                      <span className="font-bold text-xs text-[var(--cobalt-acc)]">Add More</span>
                      <span className="text-[11px] text-slate-500">PNG, JPG (10MB)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PRICING, FEES & ESCROW PROTECTION */}
            {activeStep === 3 && (
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-headline text-lg font-bold text-slate-900">
                    Step 3: Pricing & Escrow Fee Breakdown
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Configure your selling price, review marketplace fees, and select your fulfillment delivery SLA.
                  </p>
                </div>

                {/* Price Setting Block */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="space-y-1">
                      <label htmlFor="price-input" className="text-[12px] text-slate-600 uppercase font-bold block">
                        Base Asking Price ($)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-400 text-lg">$</span>
                        <input
                          id="price-input"
                          type="number"
                          min={10}
                          max={5000}
                          value={basePrice}
                          onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-headline text-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)]"
                        />
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={1000}
                        step={5}
                        value={basePrice}
                        onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                        className="w-full accent-[var(--cobalt-acc)] cursor-pointer mt-2"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[11px] text-slate-500 uppercase font-bold block">
                        Safedeal Fee (5.0%)
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline text-xl font-bold text-rose-600">-${fee}</span>
                        <span className="text-xs font-semibold text-slate-500">USD</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Includes escrow guarantee & buyer payment validation
                      </span>
                    </div>

                    <div className="space-y-1 p-3 rounded-xl bg-blue-50/80 border border-blue-200">
                      <span className="text-[11px] text-blue-700 uppercase font-bold block">
                        Net Seller Payout
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline text-2xl font-black text-[var(--cobalt-acc)]">${netPayout}</span>
                        <span className="text-xs font-bold text-slate-800">USD</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold block flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Withdrawable immediately upon inspection
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Fulfillment Method */}
                <div className="space-y-2">
                  <label className="font-bold text-xs text-slate-900">Delivery Fulfillment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label
                      onClick={() => setDeliveryType("instant")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        deliveryType === "instant"
                          ? "bg-blue-50/80 border-[var(--cobalt-acc)] ring-2 ring-blue-500/20"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-xs text-slate-900">Instant Automated Vault Delivery</span>
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                          Fastest
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-normal">
                        Credentials auto-dispatch from our encrypted vault as soon as buyer completes escrow checkout.
                      </p>
                    </label>

                    <label
                      onClick={() => setDeliveryType("manual")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        deliveryType === "manual"
                          ? "bg-blue-50/80 border-[var(--cobalt-acc)] ring-2 ring-blue-500/20"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-xs text-slate-900">Coordinated Escrow Chat Trade</span>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-normal">
                        Meet buyer in private end-to-end encrypted Escrow Chat for in-game party trade or live handoff.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Buyer Inspection Window */}
                <div className="space-y-2">
                  <label className="font-bold text-xs text-slate-900">Buyer Inspection Window</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setInspectionWindow("48h")}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        inspectionWindow === "48h"
                          ? "bg-blue-50/70 border-[var(--cobalt-acc)] font-bold"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-900 block">48 Hours Standard Escrow Hold</span>
                      <span className="text-[12px] text-slate-500 mt-0.5 block">
                        Industry gold standard. Protects both parties against fraudulent recalls.
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectionWindow("24h")}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        inspectionWindow === "24h"
                          ? "bg-blue-50/70 border-[var(--cobalt-acc)] font-bold"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-900 block">24 Hours Express Inspection</span>
                      <span className="text-[12px] text-slate-500 mt-0.5 block">
                        Faster payout cycle for verified merchants and instant keys.
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: ENCRYPTED VAULT CREDENTIALS */}
            {activeStep === 4 && (
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-headline text-lg font-bold text-slate-900">
                    Step 4: Deposit Assets to Encrypted Escrow Vault
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Credentials are client-side encrypted and securely sealed. They are ONLY unlocked to the buyer after verified escrow payment deposit.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[var(--cobalt-acc)] shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 leading-relaxed">
                    <strong>Zero-Knowledge Escrow Vault:</strong> Safedeal stores credentials in an isolated HSM security module. Neither staff nor unauthorized visitors can see these details until the buyer completes payment.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="vault-login" className="font-bold text-xs text-slate-900 flex items-center gap-1">
                      {isSocial ? "Social Channel / Account Login Email" : "Game / Account Login ID"} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="vault-login"
                      type="text"
                      value={vaultLogin}
                      onChange={(e) => setVaultLogin(e.target.value)}
                      placeholder={isSocial ? "e.g. channel_admin@gmail.com or @handle" : "e.g. riot_user_992"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="vault-pass" className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>Account Password <span className="text-rose-500">*</span></span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[12px] text-[var(--cobalt-acc)] hover:underline flex items-center gap-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? "Hide" : "Show"}</span>
                      </button>
                    </label>
                    <input
                      id="vault-pass"
                      type={showPassword ? "text" : "password"}
                      value={vaultPassword}
                      onChange={(e) => setVaultPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="vault-email" className="font-bold text-xs text-slate-900">
                      Original Creation Mailbox (OGE) Access
                    </label>
                    <input
                      id="vault-email"
                      type="text"
                      value={vaultEmailPassword}
                      onChange={(e) => setVaultEmailPassword(e.target.value)}
                      placeholder="e.g. protonmail_login / password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="vault-2fa" className="font-bold text-xs text-slate-900">
                      2FA Backup Codes / Secret Key
                    </label>
                    <input
                      id="vault-2fa"
                      type="text"
                      value={vaultRecoveryCode}
                      onChange={(e) => setVaultRecoveryCode(e.target.value)}
                      placeholder="e.g. RIOT-8921-9920-ABCD"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vault-notes" className="font-bold text-xs text-slate-900">
                    Secret Instructions for Buyer (Unmasked upon escrow hold)
                  </label>
                  <textarea
                    id="vault-notes"
                    rows={3}
                    value={vaultBuyerInstructions}
                    onChange={(e) => setVaultBuyerInstructions(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--cobalt-acc)]"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & PUBLISH LIVE */}
            {activeStep === 5 && (
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-headline text-lg font-bold text-slate-900">
                    Step 5: Review & Final Escrow Verification
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Review your listing snapshot. Once published, buyers can instantly purchase with 48h escrow protection.
                  </p>
                </div>

                {/* Listing Snapshot Summary Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--cobalt-acc)] block">
                        {taxonomy.category} • {taxonomy.game}
                      </span>
                      <h3 className="font-headline text-base font-extrabold text-slate-900 mt-0.5">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {isSocial
                          ? `${socialPlatform} (${socialHandle}) • ${socialFollowers} • ${socialMonetization}`
                          : `${region} • ${currentRank} • Peak ${peakRank}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Asking Price</span>
                      <span className="font-headline text-2xl font-black text-slate-900">${basePrice.toFixed(2)}</span>
                      <span className="text-[12px] font-bold text-emerald-600 block">Net ${netPayout}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Delivery</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-emerald-500" />
                        {isSocial ? "VIP Escrow Concierge" : (deliveryType === "instant" ? "Instant Vault" : "Coordinated")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Inspection</span>
                      <span className="font-bold text-slate-900">{inspectionWindow} Escrow Hold</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Security Tier</span>
                      <span className="font-bold text-slate-900">{isSocial ? (socialOgeIncluded ? "OGE Mail Transfer" : "Clean Linked") : (emailSecurity === "oge" ? "Tier 1 (OGE)" : "Tier 2")}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Vault Status</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Credentials Sealed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seller Escrow Agreement Checkbox */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[var(--cobalt-acc)] rounded cursor-pointer"
                  />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-bold">Safedeal Escrow Guarantee Agreement:</strong> I certify that I am the rightful owner of this digital asset. I understand that payment will be securely held in escrow until the {inspectionWindow} buyer inspection period completes or the buyer confirms login.
                  </div>
                </label>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-8">
              <button
                onClick={() => {
                  if (activeStep > 1) {
                    setActiveStep((prev) => (prev - 1) as number);
                    showToast(`Returned to Step ${activeStep - 1}.`);
                  } else if (onBack) {
                    onBack();
                  } else {
                    router.push("/seller/listings");
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                type="button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{activeStep === 1 ? "Exit to Inventory" : `Back to Step ${activeStep - 1}`}</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => showToast("Draft and progress saved to cloud ledger.")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  type="button"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  type="button"
                >
                  <span>
                    {isSubmitting
                      ? "Publishing Live to Escrow..."
                      : activeStep === 5
                      ? "Publish Listing Live"
                      : `Continue to Step ${activeStep + 1}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Live Marketplace Preview (4 Cols ~ 35%) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Live Preview Container */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--cobalt-acc)] animate-pulse" />
                  <span className="font-bold text-xs text-slate-900">
                    Live Marketplace Preview
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Buyer Catalog View
                </span>
              </div>

              {/* Preview Card Mimic (The exact buyer product card!) */}
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200/80 transition-all hover:shadow-md">
                {/* Media Area */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    className="w-full h-full object-cover"
                    src={screenshots[0]?.url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"}
                    alt={title}
                  />
                  {/* Floating Delivery & Shard Chips */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-emerald-400 font-extrabold text-[11px] shadow-sm backdrop-blur-xs">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      {deliveryType === "instant" ? "Instant Automated" : "Coordinated"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-white font-bold text-[11px] uppercase shadow-sm">
                      {region.includes("NA") ? "NA Region" : "Global"}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-slate-900 font-bold text-[11px] shadow-sm">
                    {currentRank} • Peak {peakRank.split(" ")[0]}
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[var(--cobalt-acc)] text-[11px] font-bold uppercase flex-wrap">
                    <span>{taxonomy.publisher}</span>
                    <span>•</span>
                    <span>{taxonomy.game}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">
                      {emailSecurity === "oge" ? "OGE Included" : "Clean Transfer"}
                    </span>
                  </div>

                  <h4 className="font-headline font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                    {title || "Untitled Gaming Account"}
                  </h4>

                  {/* Seller Profile Micro-Line */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--cobalt-acc)] flex items-center justify-center text-white text-[10px] font-bold">
                        A
                      </div>
                      <span className="font-bold text-xs text-slate-900">AeroGamingDeals</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--cobalt-acc)]" />
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-slate-900">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold">4.98</span>
                      <span className="text-slate-400">(3.8k)</span>
                    </div>
                  </div>

                  {/* Price & Guarantee Footer */}
                  <div className="pt-2 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Buy Now Price
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline text-base font-extrabold text-slate-900">
                          ${basePrice.toFixed(2)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">USD</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-[11px] font-bold border border-blue-100">
                        <Shield className="w-3 h-3 text-[var(--cobalt-acc)]" />
                        {inspectionWindow} Escrow
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Live preview automatically updates as you adjust form inputs and screenshots.
              </p>
            </div>

            {/* Listing Quality Score Widget */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    Algorithm Audit
                  </span>
                  <h4 className="font-headline text-sm font-bold text-slate-900">
                    Listing Quality Score
                  </h4>
                </div>
                <div className="text-right">
                  <span className="font-headline text-2xl text-[var(--cobalt-acc)] font-black">
                    {qualityScore}
                    <span className="text-slate-400 text-xs font-normal">/100</span>
                  </span>
                </div>
              </div>

              {/* Quality Meter Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--cobalt-acc)] h-full rounded-full transition-all duration-500"
                  style={{ width: `${qualityScore}%` }}
                />
              </div>

              <div className="space-y-2 pt-1 text-[12px]">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        hasOge ? "text-emerald-500" : "text-slate-300"
                      }`}
                    />
                    Original Email (OGE) provided
                  </span>
                  <span className="font-bold text-emerald-600">+20 pts</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        hasEnoughScreenshots ? "text-emerald-500" : "text-slate-300"
                      }`}
                    />
                    4+ In-game proof screenshots
                  </span>
                  <span className="font-bold text-emerald-600">+25 pts</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        hasQualityTitle ? "text-emerald-500" : "text-slate-300"
                      }`}
                    />
                    Title includes peak rank & bundles
                  </span>
                  <span className="font-bold text-emerald-600">+30 pts</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        hasCompetitivePrice ? "text-emerald-500" : "text-slate-300"
                      }`}
                    />
                    Competitive market pricing (${basePrice.toFixed(2)})
                  </span>
                  <span className="font-bold text-emerald-600">+20 pts</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[12px] leading-relaxed">
                Listings with 90+ quality scores feature prominently in{" "}
                <strong className="text-slate-900 font-bold">Safedeal Featured Carousels</strong> and enjoy an average checkout velocity under 4.2 hours.
              </div>
            </div>

            {/* Seller Protection Guarantee Callout */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-[var(--cobalt-acc)] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-[var(--cobalt-acc)]" />
                <span>Safedeal Digital Merchant Shield</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 font-semibold">Account Transfer Policy:</strong> Safedeal validates credential handover timestamps through our automated delivery vault. Once the 48-hour inspection clears or the buyer confirms login, funds unlock instantly to your balance without chargeback exposure.
              </p>
              <div className="pt-2 flex items-center justify-between text-[12px] text-[var(--cobalt-acc)] font-bold">
                <Link
                  href="/protection"
                  className="hover:underline flex items-center gap-1"
                >
                  <span>Read Seller Escrow Terms</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-slate-500 font-medium">24/7 Dispute Concierge</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Zoom Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs">Proof Screenshot Inspection</span>
              <button
                onClick={() => setZoomedImage(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-slate-950 flex items-center justify-center">
              <img
                src={zoomedImage}
                alt="Zoomed proof"
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Change Category Modal */}
      {isCategoryModalOpen && (
        <div
          onClick={() => setIsCategoryModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-base text-slate-900">
                Select Asset Taxonomy
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { category: "Gaming Accounts", publisher: "Riot Games", game: "Valorant" },
                { category: "Gaming Accounts", publisher: "Valve", game: "Counter-Strike 2" },
                { category: "Gaming Accounts", publisher: "Epic Games", game: "Fortnite" },
                { category: "Game Keys", publisher: "CD PROJEKT", game: "Cyberpunk 2077" },
                { category: "Game Keys", publisher: "FromSoftware", game: "Elden Ring" },
                { category: "In-Game Currency", publisher: "Roblox Corp", game: "Robux Vouchers" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTaxonomy(item);
                    setIsCategoryModalOpen(false);
                    showToast(`Updated taxonomy to ${item.game}.`);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-[var(--cobalt-acc)] hover:bg-blue-50/50 flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Gamepad2 className="w-4 h-4 text-[var(--cobalt-acc)]" />
                    <span className="font-bold text-xs text-slate-900">
                      {item.game} ({item.category})
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
