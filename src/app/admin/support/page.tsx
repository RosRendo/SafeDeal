"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import EscrowChatWorkspace from "@/components/chat/EscrowChatWorkspace";

export default function AdminSupportInboxPage() {
  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full">
        {/* Top Command Context Bar */}
        <div className="px-8 py-6 bg-white border-b border-slate-200/80 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-slate-500 text-[12px] uppercase tracking-wider font-semibold">
            <Link href="/admin" className="hover:text-[var(--cobalt-acc)] transition-colors">
              Trust &amp; Safety
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[var(--cobalt-acc)] font-bold">Support Inbox</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Support Inbox
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                Answer buyer and seller tickets on live escrow orders.
              </p>
            </div>
          </div>
        </div>

        {/* Shared Escrow Chat Workspace (Admin Perspective) */}
        <EscrowChatWorkspace role="admin" />
      </div>
    </main>
  );
}
