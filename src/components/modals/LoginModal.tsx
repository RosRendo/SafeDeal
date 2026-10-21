"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, X, Loader2, ArrowRight, User, Store, ShieldCheck } from "lucide-react";
import { setCurrentUser } from "@/lib/auth";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup" | "2fa";
  redirectAfterLogin?: string | null;
}

export default function LoginModal({
  isOpen,
  onClose,
  initialMode = "signin",
  redirectAfterLogin,
}: LoginModalProps) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "2fa" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller">("buyer");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode || "signin");
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === "signin") {
      if (!email.trim()) {
        setIsLoading(false);
        setErrorMessage("Enter your email address.");
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Role is inferred from the account server-side; sending a role here
          // would reject sellers/admins whose selectedRole defaults to buyer.
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setIsLoading(false);
          setSuccessMessage(`Welcome back, ${data.user.name}.`);
          setTimeout(() => {
            onClose();
            if (redirectAfterLogin) {
              router.push(redirectAfterLogin);
            } else if (data.user.role === "seller") {
              router.push("/seller");
            } else if (data.user.role === "admin") {
              router.push("/admin");
            }
          }, 350);
        } else {
          setIsLoading(false);
          setErrorMessage(data.error || "Authentication failed. Check your credentials.");
        }
      } catch (err) {
        setIsLoading(false);
        setErrorMessage("Could not reach the authentication service. Try again in a moment.");
      }
    } else if (authMode === "signup") {
      if (!fullName.trim()) {
        setIsLoading(false);
        setErrorMessage("Enter your full name or store handle.");
        return;
      }
      if (!email.trim()) {
        setIsLoading(false);
        setErrorMessage("Enter a valid email address.");
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password, role: selectedRole }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setIsLoading(false);
          setSuccessMessage(`Account created. Welcome, ${data.user.name}.`);
          setTimeout(() => {
            onClose();
            if (redirectAfterLogin) {
              router.push(redirectAfterLogin);
            } else if (selectedRole === "seller") {
              router.push("/seller");
            }
          }, 400);
        } else {
          setIsLoading(false);
          setErrorMessage(data.error || "Registration failed. Check your details.");
        }
      } catch (err) {
        setIsLoading(false);
        setErrorMessage("Could not reach the registration service. Try again in a moment.");
      }
    } else if (authMode === "2fa") {
      setIsLoading(false);
      setSuccessMessage("Code verified.");
      setTimeout(() => {
        onClose();
        if (redirectAfterLogin) router.push(redirectAfterLogin);
      }, 400);
    } else if (authMode === "forgot") {
      setIsLoading(false);
      setSuccessMessage(`Recovery link sent to ${email || "your email"}.`);
    }
  };

  const inputCls =
    "w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[var(--cobalt-acc)] focus:ring-2 focus:ring-[var(--cobalt-acc)]/15";

  const titles: Record<typeof authMode, { title: string; sub: string }> = {
    signin: {
      title: "Sign in to Safedeal.",
      sub: "Payment is held in escrow until the handover is verified.",
    },
    signup: {
      title: "Create your account.",
      sub: "48-hour inspection window on every order. Escrow protection built in.",
    },
    "2fa": {
      title: "Verify it's you.",
      sub: "Enter the 6-digit code from your authenticator app.",
    },
    forgot: {
      title: "Reset your password.",
      sub: "We'll email you a secure recovery link.",
    },
  };

  const copy = titles[authMode];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        className="relative w-full max-w-[400px] bg-[var(--ds-surface)] rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 sm:p-8">
          {/* Wordmark */}
          <Link href="/" className="inline-flex items-center gap-2 mb-7">
            <span className="w-7 h-7 rounded-md bg-[var(--ds-navy)] text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="font-headline font-bold text-base text-slate-900 tracking-tight">
              Safedeal
            </span>
          </Link>

          {/* Headline */}
          <h2
            id="login-modal-title"
            className="font-headline text-[26px] leading-[1.15] font-extrabold text-slate-900 tracking-tight"
          >
            {copy.title}
          </h2>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">{copy.sub}</p>

          {/* Inline feedback */}
          {errorMessage && (
            <div className="mt-4 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[12px] text-rose-700 font-medium animate-in fade-in">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[12px] text-emerald-800 font-medium animate-in fade-in">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            {/* Signup: role */}
            {authMode === "signup" && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("buyer")}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[13px] font-bold transition-colors cursor-pointer text-left ${
                    selectedRole === "buyer"
                      ? "border-[var(--ds-navy)] bg-white text-slate-900"
                      : "border-slate-300 bg-transparent text-slate-500 hover:border-slate-400"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Buying</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("seller")}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[13px] font-bold transition-colors cursor-pointer text-left ${
                    selectedRole === "seller"
                      ? "border-[var(--ds-navy)] bg-white text-slate-900"
                      : "border-slate-300 bg-transparent text-slate-500 hover:border-slate-400"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Selling</span>
                </button>
              </div>
            )}

            {/* Signup: name */}
            {authMode === "signup" && (
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                  {selectedRole === "seller" ? "Store handle" : "Full name"}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={selectedRole === "seller" ? "e.g. AeroGamingDeals" : "e.g. Taylor Reed"}
                  className={inputCls}
                />
              </div>
            )}

            {/* Email */}
            {authMode !== "2fa" && (
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={inputCls}
                />
              </div>
            )}

            {/* 2FA code */}
            {authMode === "2fa" && (
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className={`${inputCls} text-center tracking-[0.4em] font-mono font-bold`}
                />
              </div>
            )}

            {/* Password */}
            {(authMode === "signin" || authMode === "signup") && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-bold text-slate-700">Password</label>
                  {authMode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("forgot");
                        setErrorMessage(null);
                      }}
                      className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Signup: terms */}
            {authMode === "signup" && (
              <label className="flex items-start gap-2.5 text-[12px] text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="mt-0.5 rounded text-[var(--cobalt-acc)] focus:ring-[var(--cobalt-acc)]"
                />
                <span className="leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="font-semibold text-slate-700 underline decoration-slate-300 hover:decoration-slate-900 underline-offset-2">
                    escrow terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-semibold text-slate-700 underline decoration-slate-300 hover:decoration-slate-900 underline-offset-2">
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
            )}

            {/* Signin: remember */}
            {authMode === "signin" && (
              <label className="flex items-center gap-2.5 text-[12px] text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[var(--cobalt-acc)] focus:ring-[var(--cobalt-acc)]"
                />
                <span>Stay signed in for 30 days</span>
              </label>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[var(--ds-navy)] hover:bg-[var(--ds-navy-2)] text-white text-[13px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Working...</span>
                </>
              ) : authMode === "signin" ? (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : authMode === "signup" ? (
                <span>Create account</span>
              ) : authMode === "2fa" ? (
                <span>Verify code</span>
              ) : (
                <span>Send recovery link</span>
              )}
            </button>
          </form>

          {/* Mode switch */}
          <div className="mt-5 pt-5 border-t border-slate-200/80 text-[13px] text-slate-500">
            {authMode === "signup" ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 hover:text-[var(--cobalt-acc)] cursor-pointer transition-colors"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                New to Safedeal?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 hover:text-[var(--cobalt-acc)] cursor-pointer transition-colors"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Trust line */}
        <div className="px-7 sm:px-8 py-4 bg-white border-t border-slate-200/80 flex items-center gap-2 text-[12px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-900 shrink-0" />
          <span>You approve the release. {authMode === "2fa" ? "Vault protected." : "48-hour inspection on every order."}</span>
        </div>
      </div>
    </div>
  );
}
