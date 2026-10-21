import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  Package,
  HelpCircle,
  Home,
  ShieldCheck,
} from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans relative overflow-hidden">
      {/* Soft ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Header bar */}
      <header className="w-full h-18 sm:h-20 px-6 sm:px-12 flex items-center justify-between z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#0052ff] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-lg tracking-tight text-slate-900 leading-none">
              SafeDeal
            </span>
            <span className="text-[11px] text-emerald-600 font-bold tracking-wider uppercase mt-0.5">
              Escrow Network
            </span>
          </div>
        </Link>
        <Link
          href="/login"
          className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-[#0052ff] text-xs font-bold transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 sm:py-20 flex flex-col items-center justify-center text-center z-10 space-y-8">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-50 border border-blue-200 text-[#0052ff] flex items-center justify-center mx-auto shadow-clean-sm">
            <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-[#0052ff]" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-rose-500 text-white font-mono font-bold text-xs shadow-md">
            404
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Vault Asset or Page Not Found
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            The requested escrow record, listing, or destination URL does not exist or may have expired from our active ledger.
          </p>
        </div>

        {/* Quick Navigation Directory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left">
          <Link
            href="/browse"
            className="p-4 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200 shadow-clean-xs hover:shadow-clean-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0052ff] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Marketplace</div>
            <div className="text-[12px] text-slate-500">Browse verified listings</div>
          </Link>

          <Link
            href="/orders"
            className="p-4 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200 shadow-clean-xs hover:shadow-clean-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">My Orders</div>
            <div className="text-[12px] text-slate-500">Track active escrow holds</div>
          </Link>

          <Link
            href="/help"
            className="p-4 rounded-2xl bg-white hover:bg-purple-50/50 border border-slate-200 shadow-clean-xs hover:shadow-clean-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Help Center</div>
            <div className="text-[12px] text-slate-500">Escrow FAQ & dispute rules</div>
          </Link>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0052ff] hover:bg-[#0043d9] active:scale-95 text-white font-headline text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white/50 z-10">
        <p>© 2026 SafeDeal Global Inc. Encrypted digital escrow network.</p>
      </footer>
    </div>
  );
}
