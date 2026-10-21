"use client";

import React, { useState, useEffect } from "react";
import { RECENT_TRADES } from "@/lib/data";
import { RecentTrade } from "@/types/marketplace";
import {
  History,
  Gamepad2,
  Gift,
  Coins,
  Terminal,
} from "lucide-react";

export default function RecentTradesFeed() {
  const [trades, setTrades] = useState<RecentTrade[]>(RECENT_TRADES);

  useEffect(() => {
    const liveSimulations: RecentTrade[] = [
      {
        id: "sim-1",
        item: "Apex Legends 4K 20-Bomb Badge Account",
        buyer: "WraithGod",
        timeAgo: "Just now",
        price: "$65.00",
        icon: "gamepad",
      },
      {
        id: "sim-2",
        item: "Discord 3-Month Nitro Global Gift Link",
        buyer: "PixelVibe",
        timeAgo: "Just now",
        price: "$9.50",
        icon: "gift",
      },
      {
        id: "sim-3",
        item: "Genshin Impact AR 58 with C6 Raiden Shogun",
        buyer: "TeyvatTraveler",
        timeAgo: "Just now",
        price: "$310.00",
        icon: "gamepad",
      },
    ];

    let simIndex = 0;
    const interval = setInterval(() => {
      if (simIndex < liveSimulations.length) {
        const nextTrade = liveSimulations[simIndex];
        setTrades((prev) => [nextTrade, ...prev.slice(0, 5)]);
        simIndex++;
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (iconName: string) => {
    if (iconName.includes("card") || iconName === "gift") return Gift;
    if (iconName.includes("monetization") || iconName === "coins") return Coins;
    if (iconName.includes("terminal")) return Terminal;
    return Gamepad2;
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-clean-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h3 className="font-headline text-lg sm:text-xl font-bold text-slate-900">
              Recently Completed Trades
            </h3>
          </div>

          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Updating in real-time</span>
          </span>
        </div>

        {/* Live Trades Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {trades.slice(0, 6).map((trade) => {
            const IconComponent = getIcon(trade.icon);
            return (
              <div
                key={trade.id}
                className="p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/60 transition-all hover:border-slate-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-700 flex-shrink-0 shadow-clean-xs">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">
                      {trade.item}
                    </div>
                    <div className="text-[12px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>
                        Sold to <strong className="text-slate-700">{trade.buyer}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">{trade.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <span className="font-headline text-xs sm:text-sm font-bold text-slate-900 ml-3 flex-shrink-0">
                  {trade.price}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
