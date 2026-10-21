"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, ShieldAlert, ShieldCheck, Info, History as HistoryIcon, LogOut, Settings } from "lucide-react";
import { AuthUser, getCurrentUser, logout, onAuthChanged } from "@/lib/auth";

export interface AdminNotification {
  id: string;
  title: string;
  meta: string;
  time: string;
  severity: "critical" | "warn" | "info";
  href: string;
}

interface AdminHeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  notifications?: AdminNotification[];
}

export default function AdminHeader({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search accounts, listings, txns...",
  notifications = [],
}: AdminHeaderProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<AuthUser | null>(null);

  const unreadCount = notifications.filter((n) => !seenIds.has(n.id)).length;

  useEffect(() => {
    setUser(getCurrentUser());
    return onAuthChanged((u) => setUser(u));
  }, []);

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

  useEffect(() => {
    if (!accountOpen && !notifOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-account-menu]")) {
        setAccountOpen(false);
      }
      if (!target.closest("[data-notif-menu]")) {
        setNotifOpen(false);
      }
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [accountOpen, notifOpen]);

  const initials =
    user
      ?.name.split(" ")
      .map((w) => w.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SL";

  const signOut = () => {
    setAccountOpen(false);
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-14 md:top-0 h-16 bg-white/90 backdrop-blur-xl z-30 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Omni Search with Cmd+K */}
      <div className="flex items-center gap-4 w-72 sm:w-96">
        <div className="flex items-center w-full h-10 px-3 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="bg-transparent border-none outline-none text-xs text-slate-900 placeholder:text-slate-400 w-full font-medium"
          />
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white text-slate-500 text-[12px] font-mono font-bold border border-slate-200 shadow-xs">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Header Cluster */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Panel */}
        <div className="relative" data-notif-menu>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-expanded={notifOpen}
            aria-haspopup="menu"
            aria-label="Notifications"
            className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer ${
              notifOpen ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+10px)] w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">Notifications</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} new item${unreadCount === 1 ? "" : "s"}` : "All caught up"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setSeenIds(new Set(notifications.map((n) => n.id)))}
                    className="text-[12px] font-bold text-[var(--cobalt-acc)] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 && (
                  <div className="px-4 py-10 flex flex-col items-center text-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
                    <span className="font-bold text-[13px] text-slate-900">All clear</span>
                    <span className="text-[12px] text-slate-500 mt-0.5">No critical alerts right now.</span>
                  </div>
                )}
                {notifications.map((n) => {
                  const unread = !seenIds.has(n.id);
                  const icon =
                    n.severity === "critical" ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    ) : n.severity === "warn" ? (
                      <Bell className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Info className="w-4 h-4 text-[var(--cobalt-acc)]" />
                    );
                  return (
                    <button
                      key={n.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setSeenIds((prev) => new Set(prev).add(n.id));
                        setNotifOpen(false);
                        router.push(n.href);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        unread ? "bg-blue-50/40 hover:bg-blue-50/70" : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                          n.severity === "critical"
                            ? "bg-rose-100 border-rose-200"
                            : n.severity === "warn"
                            ? "bg-amber-100 border-amber-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[13px] text-slate-900 leading-snug">{n.title}</div>
                        <div className="text-[12px] text-slate-500 mt-0.5 leading-snug">{n.meta}</div>
                        <div className="text-[11px] text-slate-400 font-semibold mt-1">{n.time}</div>
                      </div>
                      {unread && <span className="w-1.5 h-1.5 rounded-full bg-[var(--cobalt-acc)] shrink-0 mt-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Account Menu */}
        <div className="relative" data-account-menu>
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            title="Account menu"
            className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-colors cursor-pointer ${
              accountOpen ? "bg-slate-100" : "hover:bg-slate-100/80"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--cobalt-acc)] text-white flex items-center justify-center font-extrabold text-xs ring-2 ring-cobalt-soft shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-bold text-xs text-slate-900 leading-tight">
                {user?.name || "Sarah Lin"}
              </span>
              <span className="text-[12px] text-slate-500 font-semibold leading-tight capitalize">
                {user?.role || "Super Admin"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform ${accountOpen ? "rotate-180" : ""}`}
            />
          </button>

          {accountOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+10px)] w-60 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-3 py-3 border-b border-slate-100">
                <p className="truncate text-[13px] font-bold text-slate-900">
                  {user?.name || "Sarah Lin"}
                </p>
                <p className="truncate text-[12px] text-slate-500 mt-0.5">
                  {user?.email || "admin@safedeal.com"}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded bg-blue-50 text-[var(--cobalt-acc)] border border-blue-200 text-[11px] font-bold uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  {user?.role ? `${user.role} session` : "Super Admin session"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  router.push("/admin/audit");
                }}
                role="menuitem"
                className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 text-left text-[13px] text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <HistoryIcon className="w-4 h-4" />
                My Recent Actions
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  router.push("/admin/settings");
                }}
                role="menuitem"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-[13px] text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                System Settings
              </button>
              <div className="my-1 h-px bg-slate-100" />
              <button
                type="button"
                onClick={signOut}
                role="menuitem"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-[13px] text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
