"use client";

import React, { Suspense } from "react";
import Header from "@/components/navigation/Header";
import EscrowChatWorkspace from "@/components/chat/EscrowChatWorkspace";

export default function BuyerMessagesPage() {
  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-slate-900 flex flex-col antialiased selection:bg-[var(--cobalt-acc)] selection:text-white">
      {/* Shared Marketplace Header for Buyer */}
      <Header
        activeCategory="all"
        onSelectCategory={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenProtectionModal={() => {}}
        wishlistCount={0}
      />

      {/* Dedicated Buyer Messaging Workspace */}
      <div className="pt-2">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading escrow conversations...</div>}>
          <EscrowChatWorkspace role="buyer" />
        </Suspense>
      </div>
    </div>
  );
}
