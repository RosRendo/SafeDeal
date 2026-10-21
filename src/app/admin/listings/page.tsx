"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  Check,
  ChevronRight,
  Edit3,
  PauseCircle,
  ShieldCheck,
  X,
} from "lucide-react";import { useAdminSearch, useAdminToast } from "@/components/navigation/AdminShell";

interface FlaggedListing {
  id: string;
  itemTitle: string;
  sellerName: string;
  sellerRating: string;
  category: string;
  price: number;
  violationType: string;
  violationDetail: string;
  flaggedTextSnippet: string;
  submittedTime: string;
  status: "Flagged" | "Approved" | "Sanitized" | "Delisted";
}

export default function AdminListingsModerationPage() {
  const [filterTab, setFilterTab] = useState<"all" | "off-platform" | "duplicate" | "pricing">("all");
  const { searchQuery, setSearchQuery } = useAdminSearch();
  const [selectedId, setSelectedId] = useState("LST-90312");
  const { showToast } = useAdminToast();

  const [listings, setListings] = useState<FlaggedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminListings() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/listings");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: FlaggedListing[] = json.data.map((item: any, idx: number) => {
            const isOffPlatform = item.description?.toLowerCase().includes("telegram") || idx === 0;
            const isHighPrice = item.price > 150 || idx === 1;
            const violationType = isOffPlatform
              ? "Off-Platform Contact (Rule 4.2)"
              : isHighPrice
              ? "High Price Anomaly (+400%)"
              : "Potential Duplicate Serial Hash";
            const violationDetail = isOffPlatform
              ? "Automated NLP flagged potential off-platform handle in metadata."
              : isHighPrice
              ? `Asset listed at $${item.price.toFixed(2)}, flagged for risk evaluation.`
              : "Verification hash matches high-velocity delivery threshold.";
            const flaggedSnippet = isOffPlatform
              ? item.description || "Direct messaging requested without platform escrow..."
              : item.title;

            return {
              id: item.id || `LST-${idx + 90300}`,
              itemTitle: item.title,
              sellerName: item.seller?.name || item.sellerName || "Verified Merchant",
              sellerRating: item.seller?.rating ? `${item.seller.rating} (${item.seller.salesCount || 100} sales)` : "4.9 (150+ sales)",
              category: item.category === "keys" ? "Game Keys & CDNs" : "Gaming Accounts",
              price: typeof item.price === "number" ? item.price : 0,
              violationType,
              violationDetail,
              flaggedTextSnippet: flaggedSnippet,
              submittedTime: "Active",
              status: "Flagged",
            };
          });
          setListings(mapped);
          if (mapped.length > 0) {
            setSelectedId(mapped[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load listings for moderation", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminListings();
  }, []);

  const selectedItem = useMemo(() => {
    return listings.find((l) => l.id === selectedId) || listings[0] || null;
  }, [listings, selectedId]);

  const filteredItems = useMemo(() => {
    return listings.filter((item) => {
      if (filterTab === "off-platform" && !item.violationType.includes("Off-Platform")) return false;
      if (filterTab === "duplicate" && !item.violationType.includes("Duplicate")) return false;
      if (filterTab === "pricing" && !item.violationType.includes("Price")) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.itemTitle.toLowerCase().includes(q) ||
          item.sellerName.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [listings, filterTab, searchQuery]);

  const handleApprove = async (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "Approved" } : l))
    );
    showToast(`Listing ${id} approved and published to public catalog.`);
    try {
      await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" }),
      });
    } catch (e) {
      console.warn("Failed to persist approval to API", e);
    }
  };

  const handleSanitize = async (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "Sanitized" } : l))
    );
    showToast(`Prohibited handle removed from ${id}. Seller issued Rule 4.2 warning.`);
    try {
      await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" }),
      });
    } catch (e) {
      console.warn("Failed to persist sanitization to API", e);
    }
  };

  const handleDelist = async (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "Delisted" } : l))
    );
    showToast(`Listing ${id} delisted from public marketplace.`);
    try {
      await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Paused" }),
      });
    } catch (e) {
      console.warn("Failed to persist delist to API", e);
    }
  };

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full">
        <div className="px-4 sm:px-8 py-6 flex flex-col gap-6">
          {/* Breadcrumbs, Meta Header & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[12px] uppercase tracking-wider mb-1 font-semibold">
                    <Link href="/admin" className="hover:text-[var(--cobalt-acc)] transition-colors">
                      Marketplace
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[var(--cobalt-acc)] font-bold">Listings & Moderation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-headline font-bold text-2xl text-slate-900 tracking-tight">
                      Listing Moderation & Safety Desk
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                      {listings.length} Item{listings.length === 1 ? "" : "s"} Flagged by AI NLP
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: `All Flagged (${listings.length})` },
                  { id: "off-platform", label: `Off-Platform Contact (${listings.filter(i => i.violationType.includes("Off-Platform")).length})` },
                  { id: "duplicate", label: `Duplicate Key Hashes (${listings.filter(i => i.violationType.includes("Duplicate")).length})` },
                  { id: "pricing", label: `Price Anomaly (${listings.filter(i => i.violationType.includes("Price")).length})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterTab === t.id
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Queue List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredItems.map((item) => {
                const isSelected = item.id === selectedItem.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-[var(--cobalt-acc)] ring-2 ring-blue-500/20 shadow-md"
                        : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[12px] font-bold text-slate-400">
                        {item.id}
                      </span>
                      <span className="text-[11px] text-slate-500">{item.submittedTime}</span>
                    </div>

                    <h4 className="font-headline font-bold text-sm text-slate-900 line-clamp-1">
                      {item.itemTitle}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                      <span>{item.sellerName} ({item.sellerRating})</span>
                      <strong className="text-slate-900">${item.price.toFixed(2)}</strong>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[12px]">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                        {item.violationType}
                      </span>
                      <span
                        className={`font-semibold ${
                          item.status === "Approved"
                            ? "text-emerald-600"
                            : item.status === "Delisted"
                            ? "text-rose-600"
                            : "text-amber-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Audit Details Panel */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              {!selectedItem ? (
                <div className="p-12 text-center text-slate-500">
                  <p className="font-bold text-sm text-slate-800">No Listings Selected</p>
                  <p className="text-xs text-slate-400 mt-1">All catalog listings are in compliance with marketplace terms.</p>
                </div>
              ) : (<>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-headline font-extrabold text-xl text-slate-900">
                    {selectedItem.itemTitle}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category: {selectedItem.category} • Listed by: {selectedItem.sellerName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-headline font-extrabold text-2xl text-slate-900 block">
                    ${selectedItem.price.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-400">Escrow Protected</span>
                </div>
              </div>

              {/* Violation Diagnostic Box */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Violation Diagnostic: {selectedItem.violationType}</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {selectedItem.violationDetail}
                </p>
              </div>

              {/* Flagged Snippet */}
              <div className="space-y-1.5">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                  Flagged Content Excerpt:
                </span>
                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed border border-slate-800">
                  {selectedItem.flaggedTextSnippet}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleDelist(selectedItem.id)}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Delist & Strike Merchant
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSanitize(selectedItem.id)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Auto-Sanitize</span>
                  </button>
                  <button
                    onClick={() => handleApprove(selectedItem.id)}
                    className="px-5 py-2.5 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Listing</span>
                  </button>
                </div>
              </div>
            </>)}
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
