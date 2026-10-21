"use client";

import React from "react";
import { ShieldCheck, Lock } from "lucide-react";

interface EscrowTrade {
  id: string;
  txHash: string;
  item: string;
  seller: string;
  buyer: string;
  price: string;
  type: string;
  status: string;
  time: string;
  platform: string;
  image: string;
}

// Unseeded / Empty initial trades
const INITIAL_TRADES: EscrowTrade[] = [];

export default function LiveTradeActivitySection() {
  const tickerItems = [...INITIAL_TRADES, ...INITIAL_TRADES];

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800/90 text-white relative z-20 overflow-hidden select-none">
      <div className="flex items-center h-11 sm:h-12 w-full">
        {/* Left Fixed Live Beacon Badge */}
        <div className="flex-shrink-0 flex items-center gap-2 pl-4 sm:pl-6 pr-3 sm:pr-4 py-1.5 bg-slate-950 border-r border-slate-800/80 z-20 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>

          <span className="font-headline font-black text-[12px] sm:text-xs tracking-wider uppercase text-white whitespace-nowrap flex items-center gap-1.5">
            <span>Live Escrow</span>
          </span>

          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Dual-Sig</span>
          </span>
        </div>

        {/* Continuous Gliding Ticker Tape */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center [mask-image:linear-gradient(to_right,black_0%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_90%,transparent_100%)]">
          {tickerItems.length === 0 ? (
            <div className="flex items-center gap-2 px-4 text-xs text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Escrow network online • 0 active settlement queue</span>
            </div>
          ) : (
            <div className="flex items-center gap-4 sm:gap-6 animate-marquee-left whitespace-nowrap will-change-transform hover:[animation-play-state:paused] py-1">
              {tickerItems.map((trade, idx) => (
                <div
                  key={`${trade.id}-${idx}`}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors text-xs text-slate-300 flex-shrink-0 cursor-default shadow-clean-xs group"
                >
                  <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 uppercase">
                    {trade.platform}
                  </span>
                  <span className="text-[12px] font-mono text-slate-500">
                    {trade.txHash}
                  </span>
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors max-w-[140px] sm:max-w-[210px] truncate text-[12px] sm:text-xs">
                    {trade.item}
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {trade.price}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>{trade.status}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {trade.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Subtle 24/7 Protection Tag on Desktop */}
        <div className="hidden lg:flex items-center gap-1.5 pr-6 pl-4 flex-shrink-0 border-l border-slate-800/80 bg-slate-950 text-[12px] font-mono text-slate-400 z-20">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>48h Vault Custody</span>
        </div>
      </div>
    </div>
  );
}
