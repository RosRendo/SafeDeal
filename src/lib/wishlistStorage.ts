"use client";

const WISHLIST_STORAGE_KEY = "escrow_social_wishlist_items";
const DEFAULT_WISHLIST_IDS = ["val-1", "key-1", "cur-1"];

export function getWishlistIds(): string[] {
  if (typeof window === "undefined") return DEFAULT_WISHLIST_IDS;
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(DEFAULT_WISHLIST_IDS));
      return DEFAULT_WISHLIST_IDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_WISHLIST_IDS;
  } catch {
    return DEFAULT_WISHLIST_IDS;
  }
}

export function isItemInWishlist(id: string): boolean {
  const ids = getWishlistIds();
  return ids.includes(id);
}

export function toggleWishlistItem(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const ids = getWishlistIds();
    const exists = ids.includes(id);
    let nextIds: string[];
    if (exists) {
      nextIds = ids.filter((item) => item !== id);
    } else {
      nextIds = [id, ...ids];
    }
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(nextIds));
    window.dispatchEvent(new Event("escrow_wishlist_updated"));
    return !exists;
  } catch {
    return false;
  }
}

export function removeWishlistItem(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const ids = getWishlistIds();
    const nextIds = ids.filter((item) => item !== id);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(nextIds));
    window.dispatchEvent(new Event("escrow_wishlist_updated"));
  } catch {}
}

export function clearWishlist(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("escrow_wishlist_updated"));
  } catch {}
}
