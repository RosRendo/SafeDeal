export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  avatar: string;
  rating?: number;
  dealCount?: number;
  isVerified?: boolean;
}

const STORAGE_KEY = "safedeal_active_user";
const AUTH_EVENT = "safedeal:auth_changed";
const LOGIN_MODAL_EVENT = "safedeal:open_login_modal";

export function openLoginModal(mode: "signin" | "signup" | "2fa" = "signin") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LOGIN_MODAL_EVENT, { detail: { mode } }));
}

export function onOpenLoginModal(callback: (mode: "signin" | "signup" | "2fa") => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    callback(detail?.mode || "signin");
  };
  window.addEventListener(LOGIN_MODAL_EVENT, handler);
  return () => window.removeEventListener(LOGIN_MODAL_EVENT, handler);
}

export function hasRoleAccess(
  user: AuthUser | null,
  allowedRoles: ("admin" | "seller" | "buyer")[]
): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "logged_out" || raw === "null") {
      return null;
    }
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function setCurrentUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, "logged_out");
      document.cookie = "safedeal_role=; path=/; max-age=0";
      document.cookie = "safedeal_user=; path=/; max-age=0";
      window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: null }));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      document.cookie = `safedeal_role=${user.role}; path=/; max-age=2592000`;
      document.cookie = `safedeal_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000`;
      window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: user }));
    }
  } catch (e) {
    // ignore
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, "logged_out");
    document.cookie = "safedeal_role=; path=/; max-age=0";
    document.cookie = "safedeal_user=; path=/; max-age=0";
    // Kill the server session row too (fire-and-forget).
    void fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: null }));
  } catch (e) {
    // ignore
  }
}

export function onAuthChanged(callback: (user: AuthUser | null) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    callback(detail !== undefined ? detail : getCurrentUser());
  };
  window.addEventListener(AUTH_EVENT, handler);
  return () => window.removeEventListener(AUTH_EVENT, handler);
}
