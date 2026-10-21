"use client";

import React from "react";
import {
  Gamepad2,
  Coins,
  KeyRound,
  Sparkles,
  Terminal,
  Gift,
  ChevronRight,
} from "lucide-react";

interface CategoryGridProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryGrid({
  activeCategory,
  onSelectCategory,
}: CategoryGridProps) {
  const categories = [
    {
      id: "accounts",
      fullId: "gaming-accounts",
      title: "Gaming Accounts",
      subtext: "Valorant, LoL, CS2, WoW",
      listingCount: "24,800+ listings",
      badge: "Hot",
      badgeClass: "bg-rose-50 text-rose-600 border-rose-200",
      icon: Gamepad2,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      id: "currency",
      fullId: "in-game-currency",
      title: "In-Game Gold & Coins",
      subtext: "OSRS GP, WoW Gold, Robux",
      listingCount: "15,200+ listings",
      badge: "Instant",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Coins,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      id: "keys",
      fullId: "game-keys-cdns",
      title: "Game Keys & CDNs",
      subtext: "Steam, Xbox, PlayStation",
      listingCount: "48,100+ listings",
      badge: "Global",
      badgeClass: "bg-blue-50 text-blue-600 border-blue-200",
      icon: KeyRound,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      id: "social",
      fullId: "social-media-assets",
      title: "Social & Creator",
      subtext: "Verified Handles, YouTube",
      listingCount: "4,200+ listings",
      badge: "Escrow",
      badgeClass: "bg-purple-50 text-purple-600 border-purple-200",
      icon: Sparkles,
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      id: "software",
      fullId: "software-licenses",
      title: "Software & Licenses",
      subtext: "Dev tools, VPNs, OS Keys",
      listingCount: "8,900+ listings",
      badge: "Pro",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Terminal,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      id: "gift-cards",
      fullId: "gift-cards",
      title: "Digital Gift Cards",
      subtext: "Amazon, Apple, Steam",
      listingCount: "18,400+ listings",
      badge: "-12% Avg",
      badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
      icon: Gift,
      iconBg: "bg-cyan-50 text-cyan-600 border-cyan-100",
    },
  ];

  const handleCategoryClick = (id: string) => {
    onSelectCategory(id);
    const listingsEl = document.getElementById("featured-listings");
    listingsEl?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="catalog-directory"
      className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[12px] font-bold uppercase tracking-wider text-blue-600">
            Catalog Directory
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Popular Marketplaces
          </h2>
        </div>
        <button
          onClick={() => {
            onSelectCategory("all");
            const listingsEl = document.getElementById("featured-listings");
            listingsEl?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors cursor-pointer"
        >
          <span>Explore All Categories</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id || activeCategory === cat.fullId;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`p-4 rounded-2xl transition-all flex flex-col justify-between text-left border cursor-pointer ${
                isSelected
                  ? "bg-blue-50/50 border-blue-500 shadow-clean-sm ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-clean-sm hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center justify-between mb-3 w-full">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${cat.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeClass}`}
                >
                  {cat.badge}
                </span>
              </div>

              <div>
                <h3 className="font-headline text-xs sm:text-sm font-bold text-slate-900 mb-1 leading-snug">
                  {cat.title}
                </h3>
                <p className="text-[12px] text-slate-500 mb-2 line-clamp-1">
                  {cat.subtext}
                </p>
                <span className="text-[12px] font-semibold text-emerald-600">
                  {cat.listingCount}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
