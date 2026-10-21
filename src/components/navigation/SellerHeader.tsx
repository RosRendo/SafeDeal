"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Package,
  Layers,
  MessageSquare,
  DollarSign,
  Store,
  Bell,
  ChevronDown,
  User,
  ExternalLink,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  KeyRound,
} from "lucide-react";
import { logout } from "@/lib/auth";
import LoginModal from "@/components/modals/LoginModal";
import { Seal } from "@/components/brand/Wordmark";

export interface SellerHeaderProps {
  activeTab?: "store" | "orders" | "listings" | "messages" | "earnings" | "new-listing";
  unreadOrdersCount?: number;
  unreadMessagesCount?: number;
}

const SELLER_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop";

export default function SellerHeader({
  activeTab = "store",
  unreadOrdersCount,
  unreadMessagesCount,
}: SellerHeaderProps) {
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [liveOrdersCount, setLiveOrdersCount] = useState<number>(unreadOrdersCount ?? 0);
  const [liveMessagesCount, setLiveMessagesCount] = useState<number>(unreadMessagesCount ?? 0);

  useEffect(() => {
    if (unreadOrdersCount === undefined) {
      fetch("/api/seller/orders")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.orders)) {
            const pending = d.orders.filter((o: any) => o.status === "active" || o.status === "disputed").length;
            setLiveOrdersCount(pending);
          }
        })
        .catch(() => {});
    }
    if (unreadMessagesCount === undefined) {
      fetch("/api/messages?role=seller")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.threads)) {
            const unread = d.threads.reduce((acc: number, t: any) => acc + (t.unreadCount || 0), 0);
            setLiveMessagesCount(unread);
          }
        })
        .catch(() => {});
    }
  }, [unreadOrdersCount, unreadMessagesCount]);

  const navLinks: { id: string; label: string; href: string; badge?: number }[] = [
    { id: "store", label: "My Store", href: "/seller" },
    { id: "orders", label: "Orders", href: "/seller/orders", badge: liveOrdersCount },
    { id: "listings", label: "Listings", href: "/seller/listings" },
    { id: "messages", label: "Messages", href: "/seller/messages", badge: liveMessagesCount },
    { id: "earnings", label: "Earnings", href: "/seller/earnings" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 border-b border-line bg-paper/90 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75 transition-all duration-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <Link href="/seller" className="flex items-center gap-3 group cursor-pointer" aria-label="Seller hub">
            <span className="inline-flex items-center gap-2.5">
              <Seal tone="ink" className="h-8 w-8 text-[24px]" />
              <span className="sd-display text-[28px] tracking-[-0.03em] text-ink">Safedeal</span>
            </span>
            <span className="hidden md:inline text-[13px] uppercase tracking-[0.14em] text-ink-3 font-semibold border-l border-line pl-3 whitespace-nowrap">
              Merchant OS
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 text-[16px] whitespace-nowrap transition-colors cursor-pointer ${
                    isActive ? "text-ink font-medium" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {link.label}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="min-w-[19px] h-[19px] px-1 rounded-full bg-cobalt text-white text-[13px] font-semibold flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute left-3 right-3 bottom-[-13px] h-[2px] bg-ink" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/browse"
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1.5 text-[16px] text-ink-2 hover:text-ink transition-colors cursor-pointer"
            >
              <span>Marketplace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/seller/listings/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-[16px] font-medium transition-colors active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create listing</span>
            </Link>

            <span className="hidden sm:block h-5 w-px bg-line" />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 py-1 pl-1 pr-1.5 rounded-full hover:bg-paper-2 transition-colors cursor-pointer"
              >
                <span className="relative">
                  <img
                    src={SELLER_AVATAR}
                    alt="Seller profile"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-line"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-verified ring-2 ring-paper" />
                </span>
                <span className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-[13px] font-semibold text-ink">AeroGamingDeals</span>
                  <span className="text-[13px] text-ink-3">$10,000 Bond Active</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-ink-3" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-paper rounded-2xl shadow-xl border border-line py-2 z-50 text-[16px] text-ink animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2.5 border-b border-line">
                    <p className="font-medium text-ink">AeroGamingDeals</p>
                    <div className="flex items-center gap-2 mt-1 text-[13px]">
                      <span className="px-1.5 py-0.5 rounded bg-cobalt-soft text-cobalt uppercase tracking-wide font-semibold text-[11px]">
                        Tier-1 Premier
                      </span>
                      <span className="text-ink-3">4.98 (3.8k)</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/store/aerogamingdeals"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer"
                    >
                      <Store className="w-4 h-4" />
                      <span>View public storefront</span>
                    </Link>
                    <Link
                      href="/seller/earnings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Payouts &amp; bond</span>
                    </Link>
                    <Link
                      href="/admin/disputes"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Merchant dispute desk</span>
                    </Link>
                  </div>

                  <div className="border-t border-line pt-1">
                    <Link
                      href="/browse"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>Switch to buyer mode</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer text-left"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Switch merchant / Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        setIsLoginModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left cursor-pointer hover:bg-paper-2 transition-colors"
                      style={{ color: "#a63d3d" }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-ink-2 hover:text-ink rounded-lg hover:bg-paper-2 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="py-3 lg:hidden border-t border-line flex flex-col text-[16px]">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  activeTab === link.id ? "bg-paper-2 text-ink font-medium" : "text-ink-2 hover:bg-paper-2"
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="min-w-[19px] h-[19px] px-1 rounded-full bg-cobalt text-white text-[13px] font-semibold flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <span className="border-t border-line my-2" />
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-ink-2 hover:bg-paper-2 rounded-xl cursor-pointer"
            >
              Marketplace
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsLoginModalOpen(true);
              }}
              className="mt-1 px-3 py-2.5 text-ink hover:bg-paper-2 rounded-xl text-left font-medium flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Switch account / Sign in</span>
            </button>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialMode="signin"
      />
    </header>
  );
}
