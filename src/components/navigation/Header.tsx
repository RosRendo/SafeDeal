"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Heart,
  LogOut,
  Package,
  MessageSquare,
  Store,
  Settings,
} from "lucide-react";
import Wordmark from "@/components/brand/Wordmark";
import LoginModal from "@/components/modals/LoginModal";
import {
  getCurrentUser,
  onAuthChanged,
  logout,
  onOpenLoginModal,
  AuthUser,
} from "@/lib/auth";
import { getWishlistIds } from "@/lib/wishlistStorage";

interface HeaderProps {
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenProtectionModal?: () => void;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
}

const navLinks = [
  { href: "/browse", label: "Marketplace" },
  { href: "/seller", label: "Sell" },
  { href: "/protection", label: "How escrow works" },
  { href: "/help", label: "Help" },
];

export default function Header({
  searchQuery = "",
  onSearchChange,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchQuery);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [wishlist, setWishlist] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<"signin" | "signup" | "2fa">("signin");

  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    setWishlist(getWishlistIds().length);

    const offAuth = onAuthChanged((next) => {
      setUser(next !== undefined ? next : getCurrentUser());
    });
    const offLogin = onOpenLoginModal((mode) => {
      setLoginMode(mode);
      setLoginOpen(true);
    });
    const onWishlist = () => setWishlist(getWishlistIds().length);

    window.addEventListener("escrow_wishlist_updated", onWishlist);
    return () => {
      offAuth();
      offLogin();
      window.removeEventListener("escrow_wishlist_updated", onWishlist);
    };
  }, []);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setMenuOpen(false);
      }
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        document.getElementById("sd-header-search")?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const submitSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const value = query.trim();
    setMenuOpen(false);
    router.push(value ? `/browse?q=${encodeURIComponent(value)}` : "/browse");
  };

  const handleQuery = (value: string) => {
    setQuery(value);
    onSearchChange?.(value);
  };

  const signOut = () => {
    logout();
    setUser(null);
    setAccountOpen(false);
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-paper-2">
        <div className="sd-container flex h-[76px] items-center gap-5">
          <Wordmark />

          <nav className="ml-4 hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-6 text-[13px] font-medium transition-colors ${
                  isActive(link.href) ? "text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute inset-x-0 bottom-4 h-[2px] bg-ink" />
                )}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={submitSearch}
            className="ml-auto hidden w-[260px] items-center gap-2 md:flex xl:w-[320px]"
            role="search"
          >
            <Search className="h-4 w-4 flex-none text-ink-2" strokeWidth={1.8} />
            <input
              id="sd-header-search"
              value={query}
              onChange={(event) => handleQuery(event.target.value)}
              placeholder="Search accounts, keys, currency"
              aria-label="Search listings"
              className="w-full border-b border-ink/25 bg-transparent pb-1.5 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none"
            />

          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-3">
            <Link
              href="/wishlist"
              aria-label={`Saved items (${wishlist})`}
              className="relative hidden h-10 w-10 items-center justify-center text-ink-2 transition-colors hover:text-ink sm:flex"
            >
              <Heart className="h-[19px] w-[19px]" strokeWidth={1.8} />
              {wishlist > 0 && (
                <span className="absolute right-0 top-1 flex h-[18px] min-w-[18px] items-center justify-center bg-ink px-1 text-[13px] font-semibold leading-none text-paper">
                  {wishlist}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="flex h-10 items-center gap-2 text-left"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="h-8 w-8 object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center bg-ink text-[13px] font-semibold text-paper">
                      {user.name.charAt(0)}
                    </span>
                  )}
                  <span className="hidden max-w-[110px] truncate text-[13px] font-medium xl:block">
                    {user.name}
                  </span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-ink-2 xl:block" />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+14px)] w-60 bg-paper p-2 shadow-clean-xl"
                  >
                    <div className="px-3 py-3">
                      <p className="truncate text-[13px] font-semibold">{user.name}</p>
                      <p className="truncate text-[13px] text-ink-2">{user.email}</p>
                    </div>
                    <div className="h-[1px] bg-line" />
                    <AccountLink href="/orders" icon={Package} label="Purchases & orders" />
                    <AccountLink href="/messages" icon={MessageSquare} label="Messages" />
                    <AccountLink href="/seller" icon={Store} label="Seller dashboard" />
                    <AccountLink href="/settings" icon={Settings} label="Settings" />
                    <button
                      type="button"
                      onClick={signOut}
                      role="menuitem"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.8} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("signin");
                    setLoginOpen(true);
                  }}
                  className="hidden px-3 py-2 text-[13px] font-medium text-ink transition-colors hover:text-cobalt sm:block"
                >
                  Sign in
                </button>
                <Link href="/seller" className="sd-btn sd-btn-primary hidden sm:inline-flex">
                  Start selling
                </Link>
              </>
            )}

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center text-ink lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-paper lg:hidden">
            <div className="sd-container py-6">
              <form onSubmit={submitSearch} className="flex items-center gap-2 border-b border-ink/25 pb-2">
                <Search className="h-4 w-4 text-ink-2" strokeWidth={1.8} />
                <input
                  value={query}
                  onChange={(event) => handleQuery(event.target.value)}
                  placeholder="Search the marketplace"
                  aria-label="Search listings"
                  className="w-full bg-transparent py-2 text-[16px] placeholder:text-ink-3 focus:outline-none"
                />
              </form>

              <nav className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="py-2.5 text-[16px] font-medium text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/orders" className="py-2.5 text-[16px] text-ink-2">
                  Orders
                </Link>
                <Link href="/messages" className="py-2.5 text-[16px] text-ink-2">
                  Messages
                </Link>
                <Link href="/wishlist" className="py-2.5 text-[16px] text-ink-2">
                  Saved ({wishlist})
                </Link>
                {user ? (
                  <button
                    type="button"
                    onClick={signOut}
                    className="py-2.5 text-left text-[16px] text-ink-2"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setLoginOpen(true);
                    }}
                    className="py-2.5 text-left text-[16px] font-medium text-ink"
                  >
                    Sign in
                  </button>
                )}
              </nav>

              <Link
                href="/seller"
                className="sd-btn sd-btn-primary mt-5 w-full"
                onClick={() => setMenuOpen(false)}
              >
                Start selling
              </Link>
            </div>
          </div>
        )}
      </header>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        initialMode={loginMode}
      />
    </>
  );
}

function AccountLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
    >
      <Icon className="h-4 w-4" strokeWidth={1.8} />
      {label}
    </Link>
  );
}


