"use client";

import React, { useState, useEffect } from "react";
import { TICKER_ITEMS } from "@/lib/data";
import { ShieldCheck, Zap } from "lucide-react";

export default function LiveTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
        setIsFading(false);
      }, 200);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const current = TICKER_ITEMS[currentIndex];

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200/60 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between text-xs">
        {/* Left: Live Trade updates */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>

          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] flex-shrink-0">
            Live Trades
          </span>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div
            className={`text-slate-700 transition-opacity duration-200 truncate ${
              isFading ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="font-semibold text-slate-900">{current.buyer}</span> purchased{" "}
            <span className="font-medium text-blue-600">{current.item}</span> for{" "}
            <span className="font-semibold text-slate-900">{current.price}</span>{" "}
            <span className="text-slate-400">({current.time})</span>
          </div>
        </div>

        {/* Right: Escrow Metrics */}
        <div className="hidden md:flex items-center gap-4 text-slate-500 font-medium text-[12px] flex-shrink-0">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50/60 px-2 py-0.5 rounded-full border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Escrow Active</span>
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Settlement Avg: 1.8m</span>
          </span>
        </div>
      </div>
    </div>
  );
}
