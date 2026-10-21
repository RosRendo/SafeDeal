"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoginModal from "@/components/modals/LoginModal";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "signup" || searchParams.get("tab") === "register" ? "signup" : "signin";

  return (
    <div className="min-h-screen bg-[var(--ds-surface)] flex items-center justify-center font-sans relative selection:bg-[var(--cobalt-acc)] selection:text-white">
      <Link
        href="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        ← Back to marketplace
      </Link>
      <Link
        href="/register"
        className="hidden sm:block absolute top-6 right-6 sm:top-8 sm:right-8 text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        Create account
      </Link>
      <LoginModal isOpen={true} onClose={() => router.push("/")} initialMode={mode} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--ds-surface)]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
