"use client";

import React, { Suspense } from "react";
import SellerHeader from "@/components/navigation/SellerHeader";
import EscrowChatWorkspace from "@/components/chat/EscrowChatWorkspace";

export default function SellerMessagesPage() {
  return (
    <div className="min-h-screen bg-[var(--ds-surface)] text-[var(--ds-navy)] flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Seller Hub Dedicated Navigation */}
      <SellerHeader activeTab="messages" />

      {/* Main Seller Messaging Workspace */}
      <div className="pt-16 flex-1 flex flex-col">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading seller escrow threads...</div>}>
          <EscrowChatWorkspace role="seller" />
        </Suspense>
      </div>
    </div>
  );
}
