"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  Key,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Send,
  Paperclip,
  Smile,
  Receipt,
  BellOff,
  Bell,
  Flag,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShoppingBag,
  MessageSquare,
  HelpCircle,
  FileText,
  SlidersHorizontal,
  CircleAlert,
  Headphones,
  CircleDollarSign,
  Info,
  Timer,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import AssetVaultModal from "@/components/orders/AssetVaultModal";
import OrderCompletionReleaseModal from "@/components/orders/OrderCompletionReleaseModal";
import {
  apiGetThreads,
  apiGetMessages,
  apiSendMessage,
  apiUpdateOrderStatus,
} from "@/lib/apiClient";

export type EscrowChatRole = "buyer" | "seller" | "admin";

export interface Thread {
  id: string;
  sellerName: string;
  sellerTag: string;
  avatar: string;
  buyerName?: string;
  buyerTag?: string;
  buyerAvatar?: string;
  buyerEmail?: string;
  buyerRating?: number;
  buyerDealCount?: string;
  buyerVerified?: boolean;
  buyerLevel?: string;
  isOnline: boolean;
  isVerified: boolean;
  isStaff?: boolean;
  time: string;
  orderNumber: string;
  itemTitle: string;
  lastMessage: string;
  unreadCount?: number;
  badgeText?: string;
  type: "active" | "archived" | "dispute";
  rating: number;
  dealCount: string;
  sellerLevel: string;
  slaSpeed: string;
  orderPrice: number;
  orderImage: string;
  orderPlatform: string;
  orderSubtext: string;
  orderStatus: "inspection" | "completed" | "disputed";
  credentials: {
    login: string;
    email: string;
    pass: string;
    pin: string;
    token: string;
  };
  securityChecks: {
    ogeEmail: string;
    twoFactor: string;
    hwidStatus: string;
  };
}

export const INITIAL_THREADS: Thread[] = [];

export interface ChatMessage {
  id: string;
  sender: "buyer" | "seller" | "admin" | "system";
  text?: string;
  time: string;
  systemTitle?: string;
  systemSub?: string;
  hasVaultAction?: boolean;
}

export const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {};

export interface EscrowChatWorkspaceProps {
  role?: EscrowChatRole;
  initialOrderId?: string;
}

function EscrowChatWorkspaceInner({
  role = "buyer",
  initialOrderId,
}: EscrowChatWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderParam = initialOrderId || searchParams.get("orderId") || searchParams.get("order") || "";

  // Active role perspective: 'buyer' | 'seller' | 'admin'
  const [currentRole, setCurrentRole] = useState<EscrowChatRole>(role);

  // Collapsible order-context rail (defaults closed in admin to keep the inbox focused)
  const [contextOpen, setContextOpen] = useState(role !== "admin");

  useEffect(() => {
    setCurrentRole(role);
    setContextOpen(role !== "admin");
  }, [role]);

  // Dynamic threads dataset from API
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState<boolean>(true);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("");

  useEffect(() => {
    async function loadThreadsData() {
      try {
        setIsLoadingThreads(true);
        const fetchedThreads = await apiGetThreads(currentRole);
        if (Array.isArray(fetchedThreads) && fetchedThreads.length > 0) {
          setThreads(fetchedThreads as unknown as Thread[]);
          if (orderParam) {
            const cleanParam = orderParam.replace(/[^0-9a-zA-Z]/g, "").toLowerCase();
            const matched = fetchedThreads.find((t: any) => {
              const cleanNum = t.orderNumber?.replace(/[^0-9a-zA-Z]/g, "").toLowerCase() || "";
              const cleanId = t.id?.toLowerCase() || "";
              return cleanNum.includes(cleanParam) || cleanId === cleanParam;
            });
            setSelectedThreadId(matched ? matched.id : fetchedThreads[0].id);
          } else {
            setSelectedThreadId((prev) => (prev && fetchedThreads.some((t: any) => t.id === prev) ? prev : fetchedThreads[0].id));
          }
        } else {
          setThreads([]);
          setSelectedThreadId("");
        }
      } catch (e) {
        console.error("Failed to load threads", e);
      } finally {
        setIsLoadingThreads(false);
      }
    }
    loadThreadsData();
  }, [currentRole, orderParam]);

  const [filterType, setFilterType] = useState<"all" | "active" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Messages map state
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [inputMessage, setInputMessage] = useState<string>("");

  // Notifications
  const [stickyBannerDismissed, setStickyBannerDismissed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  const [showCredentialsSecret, setShowCredentialsSecret] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [isConfirmCompleteOpen, setIsConfirmCompleteOpen] = useState<boolean>(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState<boolean>(false);
  const [disputeReason, setDisputeReason] = useState<string>("credentials-invalid");
  const [disputeDetails, setDisputeDetails] = useState<string>("");

  // Dynamic order statuses override map (populated on user action)
  const [orderStatuses, setOrderStatuses] = useState<
    Record<string, "inspection" | "completed" | "disputed">
  >({});

  // Countdown timer for active inspection SLA
  const [timerRemaining, setTimerRemaining] = useState<number>(37 * 3600 + 12 * 60 + 45);
  const [isTimerFrozen, setIsTimerFrozen] = useState<boolean>(false);

  useEffect(() => {
    if (isTimerFrozen) return;
    const interval = setInterval(() => {
      setTimerRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerFrozen]);

  const timerHours = Math.floor(timerRemaining / 3600);
  const timerMinutes = Math.floor((timerRemaining % 3600) / 60);
  const timerSeconds = timerRemaining % 60;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeThread = useMemo(() => {
    return (
      threads.find((t) => t.id === selectedThreadId) || threads[0] || null
    );
  }, [threads, selectedThreadId]);

  const isSellerView = currentRole === "seller";
  const headerName = isSellerView
    ? (activeThread?.buyerName || "Alex Mercer")
    : (activeThread?.sellerName || "Seller");
  const headerAvatar = isSellerView
    ? (activeThread?.buyerAvatar || activeThread?.avatar || "")
    : (activeThread?.avatar || "");
  const headerRating = isSellerView
    ? (activeThread?.buyerRating || 4.98)
    : (activeThread?.rating || 5.0);
  const headerDeals = isSellerView
    ? (activeThread?.buyerDealCount || "14 deals")
    : (activeThread?.dealCount || "100+ deals");
  const headerBadge = isSellerView
    ? (activeThread?.buyerLevel || "Verified Customer")
    : (activeThread?.sellerLevel || "Merchant");

  const currentMessages = (selectedThreadId && messagesMap[selectedThreadId]) || [];

  // Fetch live API messages with fallback
  useEffect(() => {
    if (!selectedThreadId) return;
    let isMounted = true;
    apiGetMessages(selectedThreadId)
      .then((apiMsgs) => {
        if (isMounted && apiMsgs && apiMsgs.length > 0) {
          setMessagesMap((prev) => ({
            ...prev,
            [selectedThreadId]: apiMsgs as ChatMessage[],
          }));
        }
      })
      .catch((err) => {
        console.warn("[SafeDeal Chat] Falling back to local thread messages:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedThreadId]);

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchType =
        filterType === "all" ||
        (filterType === "active" && t.type === "active") ||
        (filterType === "archived" && t.type === "archived");
      const matchSearch =
        !searchQuery.trim() ||
        t.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.buyerName && t.buyerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.itemTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [threads, filterType, searchQuery]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !selectedThreadId) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentRole,
      text,
      time: "Just now",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedThreadId]: [...(prev[selectedThreadId] || []), newMsg],
    }));

    if (!textToSend) setInputMessage("");

    // Synchronize to API in background (with resilient fallback)
    apiSendMessage(selectedThreadId, currentRole, text).catch(() => {});

    // Simulate reply depending on role perspective
    setTimeout(() => {
      let replySender: "buyer" | "seller" | "admin" = "seller";
      let replyText = `Thanks for your message regarding order ${activeThread?.orderNumber || "SF-2024"}! Automated dispatch bot and live agent are monitoring this chat.`;

      if (currentRole === "buyer") {
        replySender = "seller";
        if (text.toLowerCase().includes("password") || text.toLowerCase().includes("oge")) {
          replyText =
            "To access your credentials, click 'Inspect Vault Credentials'. The OGE creation recovery token is included in your encrypted payload!";
        } else if (text.toLowerCase().includes("great")) {
          replyText =
            "Awesome! When you're finished checking all inventories, please click 'Confirm & Complete Order' to release funds from escrow. Thank you!";
        }
      } else if (currentRole === "seller") {
        replySender = "buyer";
        replyText =
          "Thanks for the update! Checking the vault credentials now and testing in-game login.";
      } else {
        replySender = "system" as any;
        replyText =
          "Arbitrator directive logged in official escrow audit record.";
      }

      const botReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: replySender,
        text: replyText,
        time: "Just now",
      };

      setMessagesMap((prev) => ({
        ...prev,
        [selectedThreadId]: [...(prev[selectedThreadId] || []), botReply],
      }));

      // Synchronize bot response to API in background
      apiSendMessage(selectedThreadId, replySender as any, replyText).catch(() => {});
    }, 1200);
  };

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedKey(label);
      showToast(`Copied ${label} to clipboard!`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleConfirmOrder = () => {
    if (!activeThread) return;
    setOrderStatuses((prev) => ({
      ...prev,
      [selectedThreadId]: "completed",
    }));
    setIsConfirmCompleteOpen(false);
    showToast(
      `Escrow funds released to ${activeThread?.sellerName || "Seller"}. Order marked Completed!`
    );

    // Sync release to API
    apiUpdateOrderStatus(
      activeThread?.orderNumber || "",
      "release",
      "Order inspection verified and escrow released via chat workspace"
    ).catch(() => {});

    const completionMsg: ChatMessage = {
      id: `msg-comp-${Date.now()}`,
      sender: "system",
      systemTitle: "Order Inspection Verified & Escrow Released",
      systemSub: `${(activeThread?.orderPrice || 0).toFixed(2)} has been credited to seller. 6-Month Pull-Back Protection Guarantee is active.`,
      time: "Just now",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedThreadId]: [...(prev[selectedThreadId] || []), completionMsg],
    }));
  };

  const handleFileDispute = () => {
    if (!activeThread) return;
    setOrderStatuses((prev) => ({
      ...prev,
      [selectedThreadId]: "disputed",
    }));
    setIsDisputeModalOpen(false);
    showToast(
      "Escrow clock paused! Safedeal Staff Arbitrator has joined the channel."
    );

    // Sync dispute to API
    apiUpdateOrderStatus(
      activeThread.orderNumber,
      "dispute",
      `Reason: ${disputeReason}. Inspection dispute filed in chat workspace.`
    ).catch(() => {});

    const disputeMsg: ChatMessage = {
      id: `msg-disp-${Date.now()}`,
      sender: "system",
      systemTitle: "Escrow Dispute Case Opened",
      systemSub: `Reason: ${disputeReason}. Escrow timer frozen. An arbitration officer will review chat and verify credentials within 4 hours.`,
      time: "Just now",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedThreadId]: [...(prev[selectedThreadId] || []), disputeMsg],
    }));
  };

  const currentStatus =
    (selectedThreadId && orderStatuses[selectedThreadId]) ||
    activeThread?.orderStatus ||
    "inspection";

  return (
    <div className="w-full flex flex-col">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--ds-navy-2)] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold border border-blue-500/40 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}



      {/* Main 3-Column Layout */}
      <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Role Perspective Context Banner */}
        <div
          className={`mb-4 px-4 py-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            currentRole === "seller"
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
              : currentRole === "admin"
              ? "bg-purple-50/80 border-purple-200 text-purple-950"
              : "bg-blue-50/80 border-blue-200 text-blue-950"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                currentRole === "seller"
                  ? "bg-emerald-600 text-white"
                  : currentRole === "admin"
                  ? "bg-purple-600 text-white"
                  : "bg-[var(--cobalt-acc)] text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>
              {currentRole === "seller" ? (
                <>
                  <strong>Seller Hub Active:</strong> Viewing customer orders and communicating with your <strong>buyers</strong>.
                </>
              ) : currentRole === "admin" ? (
                <>
                  <strong>Admin Perspective:</strong> Live support &amp; arbitration threads across all escrow orders.
                </>
              ) : (
                <>
                  <strong>Buyer Protection Active:</strong> Viewing purchases and communicating with verified <strong>sellers & merchants</strong>.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentRole === "buyer" ? (
              <Link
                href="/seller/messages"
                className="px-3 py-1 rounded-lg bg-white border border-blue-200 text-[var(--cobalt-acc)] font-bold hover:bg-blue-50 transition-colors shadow-2xs"
              >
                Go to Seller Hub Inbox →
              </Link>
            ) : currentRole === "seller" ? (
              <Link
                href="/messages"
                className="px-3 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                Go to Buyer Messages →
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* COLUMN 1: CONVERSATIONS LIST SIDEBAR (~320px) */}
          {/* ========================================================= */}
          <aside className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl shadow-clean-sm border border-slate-200/80 overflow-hidden flex flex-col h-[740px]">
            {/* Inbox Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h1 className="font-headline text-lg font-bold text-slate-900 tracking-tight">
                  {currentRole === "buyer"
                    ? "Buyer Messages"
                    : currentRole === "seller"
                    ? "Seller Hub Inbox"
                    : "Support Inbox"}
                </h1>
                <p className="text-[13px] text-slate-500 font-medium">
                  {currentRole === "admin"
                    ? "Escalated support threads"
                    : "48-Hour Escrow Protected"}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[var(--cobalt-acc)] text-xs font-bold border border-blue-100">
                {filteredThreads.length} Deals
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    currentRole === "seller"
                      ? "Search order #, customer or game..."
                      : "Search order #, seller or game..."
                  }
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1 mt-2.5">
                {(["all", "active", "archived"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`flex-1 py-1 text-[13px] font-bold rounded-lg transition-colors capitalize cursor-pointer ${
                      filterType === tab
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Threads List Stream */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {isLoadingThreads ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading active threads...</div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No active conversations found.</div>
              ) : (
                filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                const status = orderStatuses[thread.id] || thread.orderStatus;
                const isSellerView = currentRole === "seller";
                const contactName = isSellerView ? (thread.buyerName || "Alex Mercer") : thread.sellerName;
                const contactAvatar = isSellerView ? (thread.buyerAvatar || thread.avatar) : thread.avatar;
                const contactTag = isSellerView ? (thread.buyerTag || "BUYER") : (thread.isStaff ? "Staff" : thread.sellerTag);

                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full p-3.5 text-left transition-all flex items-start gap-3 hover:bg-slate-50 cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/70 border-l-4 border-l-[var(--cobalt-acc)]"
                        : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      {contactAvatar ? (
                        <img
                          src={contactAvatar}
                          alt={contactName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[var(--cobalt-acc)] font-bold flex items-center justify-center text-xs border border-blue-200">
                          {contactName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      {thread.isOnline && (
                        <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0 shadow-xs" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-headline text-xs font-bold text-slate-900 truncate">
                            {contactName}
                          </span>
                          {isSellerView ? (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[var(--cobalt-acc)] text-[11px] font-extrabold uppercase">
                              {contactTag}
                            </span>
                          ) : thread.isStaff ? (
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[11px] font-extrabold uppercase">
                              Staff
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[11px] font-bold">
                              {contactTag}
                            </span>
                          )}
                        </div>
                        <span className="text-[12px] text-slate-400 shrink-0 font-medium">
                          {thread.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[13px] font-semibold text-slate-800 truncate">
                          {thread.itemTitle}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[12px] text-[var(--cobalt-acc)] font-mono font-bold">
                          {thread.orderNumber}
                        </span>
                      </div>

                      <p className="text-[13px] text-slate-500 truncate mt-0.5">
                        {thread.lastMessage}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                        <span
                          className={`px-2 py-0.5 rounded text-[12px] font-bold ${
                            status === "inspection"
                              ? "bg-blue-100 text-[var(--cobalt-acc)]"
                              : status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {status === "inspection"
                            ? "In Inspection"
                            : status === "completed"
                            ? "Completed"
                            : "Disputed"}
                        </span>
                        <div className="text-right">
                          <span className="font-headline text-xs font-extrabold text-slate-900 block">
                            {isSellerView
                              ? `$${(thread.orderPrice * 0.95).toFixed(2)} Net`
                              : `$${thread.orderPrice.toFixed(2)}`}
                          </span>
                          {isSellerView && (
                            <span className="text-[11px] text-slate-400 block -mt-0.5">
                              (${thread.orderPrice.toFixed(2)} gross)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              }))}
            </div>
          </aside>

          {/* ========================================================= */}
          {/* COLUMN 2: ACTIVE CHAT ENGINE (~640px) */}
          {/* ========================================================= */}
          <section
            className={`bg-white rounded-2xl shadow-clean-sm border border-slate-200/80 overflow-hidden flex flex-col h-[740px] ${
              currentRole === "admin" && !contextOpen ? "lg:col-span-12 xl:col-span-9" : "lg:col-span-8 xl:col-span-6"
            }`}
          >
            {!activeThread ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="font-bold text-base text-slate-800">No Conversation Selected</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Select an escrow conversation from the left drawer, or start a new order to open a secure direct thread.
                </p>
              </div>
            ) : (<>
            {/* Chat Top Header */}
            <div className="p-4 border-b border-slate-200/80 bg-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {headerAvatar ? (
                    <img
                      src={headerAvatar}
                      alt={headerName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-100 text-[var(--cobalt-acc)] font-bold flex items-center justify-center text-sm border border-blue-200">
                      {headerName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  {activeThread.isOnline && (
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0 shadow-xs" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-headline text-base font-bold text-slate-900 leading-none">
                      {headerName}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[13px] font-bold flex items-center gap-1">
                      <span className="text-[var(--cobalt-acc)]">★ {headerRating}</span>
                      <span className="text-slate-400 font-normal">
                        ({headerDeals})
                      </span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[13px] font-bold border ${
                        isSellerView
                          ? "bg-blue-50 text-[var(--cobalt-acc)] border-blue-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      {headerBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[13px]">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {isSellerView ? "Customer Online • 48h Inspection" : `Online • ${activeThread.slaSpeed}`}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <Lock className="w-3 h-3" />
                      Escrow Monitored
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Role Indicator & Switcher */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    currentRole === "buyer"
                      ? "bg-blue-50 text-[var(--cobalt-acc)] border-blue-200"
                      : currentRole === "seller"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-purple-50 text-purple-800 border-purple-200"
                  }`}
                >
                  {currentRole === "buyer"
                    ? "Buyer Perspective"
                    : currentRole === "seller"
                    ? "Seller Perspective"
                    : "Arbitrator Perspective"}
                </span>
                {currentRole === "buyer" ? (
                  <Link
                    href="/seller/messages"
                    className="hidden sm:inline-flex text-[13px] font-semibold text-slate-500 hover:text-[var(--cobalt-acc)] hover:underline transition-colors"
                    title="Switch to Seller Hub Inbox"
                  >
                    Seller View →
                  </Link>
                ) : currentRole === "seller" ? (
                  <Link
                    href="/messages"
                    className="hidden sm:inline-flex text-[13px] font-semibold text-slate-500 hover:text-emerald-700 hover:underline transition-colors"
                    title="Switch to Buyer Messages"
                  >
                    Buyer View →
                  </Link>
                ) : null}
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-1.5">
                {currentRole === "admin" && (
                  <button
                    onClick={() => setContextOpen((v) => !v)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                      contextOpen
                        ? "bg-[var(--cobalt-acc)] text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                    }`}
                    title={contextOpen ? "Hide order context panel" : "Show order context panel"}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Order Context</span>
                  </button>
                )}
                <Link
                  href={`/orders/${activeThread.orderNumber.replace("#", "")}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <Receipt className="w-3.5 h-3.5 text-[var(--cobalt-acc)]" />
                  <span>Order Details</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    showToast(isMuted ? "Notifications unmuted" : "Notifications muted");
                  }}                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isMuted
                      ? "bg-slate-200 text-slate-800"
                      : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                  title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
                >
                  {isMuted ? (
                    <BellOff className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsDisputeModalOpen(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Report User or Dispute"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Stream Workspace */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {/* Escrow Protection Sticky Notice (buyer + seller only) */}
              {!stickyBannerDismissed && currentRole !== "admin" && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-slate-900 flex items-start gap-3 border border-rose-200 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-rose-950">
                      Safedeal 48-Hour Buyer Protection Active
                    </p>
                    <p className="text-slate-600 leading-relaxed mt-0.5">
                      Never trade or pay outside Safedeal. Sharing Discord, Telegram, or PayPal
                      off-platform immediately voids your 48h Escrow Guarantee and refund recourse.
                    </p>
                  </div>
                  <button
                    onClick={() => setStickyBannerDismissed(true)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Day Separator */}
              <div className="flex items-center justify-center my-2">
                <span className="px-3 py-1 rounded-full bg-white text-slate-400 text-[13px] font-semibold border border-slate-200 shadow-xs">
                  Today, October 24, 2024
                </span>
              </div>

              {/* Message Flow */}
              {currentMessages.map((msg) => {
                if (msg.sender === "system") {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="max-w-md w-full p-3.5 rounded-2xl bg-white shadow-clean-xs border border-slate-200/80 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[var(--cobalt-acc)] flex items-center justify-center shrink-0 border border-blue-100">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              {msg.systemTitle}
                            </span>
                            <span className="text-[12px] text-slate-400">{msg.time}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">
                            {msg.systemSub}
                          </p>

                          {/* Vault Action Card if handover ready */}
                          {msg.hasVaultAction && (
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mt-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                              <div>
                                <span className="text-[12px] uppercase font-bold text-slate-400 block tracking-wider">
                                  Attached Asset
                                </span>
                                <p className="font-bold text-slate-900 text-xs">
                                  {activeThread.orderNumber} Credentials Package
                                </p>
                                <p className="text-[13px] text-slate-500">
                                  Login, Original Email Token, Recovery PDF (3 files)
                                </p>
                              </div>
                              <button
                                onClick={() => setIsVaultModalOpen(true)}
                                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Open Secure Vault</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                const isMyMessage = msg.sender === currentRole;

                // Admin / Arbitrator message
                if (msg.sender === "admin") {
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col space-y-1 ${
                        isMyMessage ? "items-end" : "items-center"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-purple-700">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>
                          {isMyMessage
                            ? "You (SafeDeal Official Arbitrator)"
                            : "SafeDeal Official Arbitrator"}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400 font-normal">{msg.time}</span>
                      </div>
                      <div className="max-w-[85%] p-3.5 rounded-2xl bg-purple-50 text-purple-950 border border-purple-200/90 shadow-clean-xs leading-relaxed text-xs">
                        <p>{msg.text}</p>
                      </div>
                      {isMyMessage && (
                        <span className="text-[12px] text-slate-400 flex items-center gap-0.5 pr-1">
                          <CheckCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Official Ruling Sent</span>
                        </span>
                      )}
                    </div>
                  );
                }

                // If this is my message -> Align Right
                if (isMyMessage) {
                  const myLabel =
                    currentRole === "buyer"
                      ? "You (Buyer)"
                      : `You (Seller - ${activeThread.sellerName})`;
                  const myBg =
                    currentRole === "buyer"
                      ? "bg-[var(--cobalt-acc)] text-white"
                      : "bg-emerald-600 text-white";

                  return (
                    <div key={msg.id} className="flex flex-col items-end space-y-1">
                      <div className="flex items-center gap-1 text-[12px] font-semibold text-slate-400 pr-1">
                        <span>{myLabel}</span>
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>
                      <div
                        className={`max-w-[82%] p-3.5 rounded-2xl rounded-tr-xs ${myBg} shadow-clean-xs leading-relaxed text-xs`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[12px] text-slate-400 flex items-center gap-0.5 pr-1">
                        <CheckCheck
                          className={`w-3.5 h-3.5 ${
                            currentRole === "buyer" ? "text-[var(--cobalt-acc)]" : "text-emerald-600"
                          }`}
                        />
                        <span>Delivered</span>
                      </span>
                    </div>
                  );
                }

                // Counterparty message -> Align Left
                const otherName =
                  msg.sender === "seller" ? activeThread.sellerName : "Alex Mercer";
                const otherRoleBadge =
                  msg.sender === "seller" ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-[11px] font-extrabold text-emerald-800">
                      SELLER
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[11px] font-extrabold text-[var(--cobalt-acc)]">
                      BUYER
                    </span>
                  );

                return (
                  <div key={msg.id} className="flex flex-col items-start space-y-1">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 pl-1">
                      <span className="font-bold text-slate-900">{otherName}</span>
                      {otherRoleBadge}
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                    <div className="max-w-[82%] p-3.5 rounded-2xl rounded-tl-xs bg-white text-slate-900 border border-slate-200/80 shadow-clean-xs leading-relaxed text-xs">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              {/* Quick Reply Suggestion Tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 no-scrollbar">
                {(currentRole === "seller"
                  ? [
                      "Credentials uploaded to Vault",
                      "Please check your inbox for OGE invite",
                      "Let me know if you need help with 2FA",
                      "Please inspect & confirm release when ready",
                    ]
                  : currentRole === "admin"
                  ? [
                      "Escrow clock paused pending inspection",
                      "Please upload unedited screen recording",
                      "48-Hour evidence window active",
                      "Arbitration ruling issued under Escrow Policy",
                    ]
                  : [
                      "Confirming delivery...",
                      "Need password help",
                      "Everything looks great!",
                      "Request OGE verification code",
                    ]
                ).map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(tag)}
                    className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[13px] font-semibold transition-colors whitespace-nowrap cursor-pointer border border-slate-200/70"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Form Input Bar */}
              <div className="flex items-center gap-2 bg-slate-100/90 rounded-2xl p-1.5 px-3 border border-slate-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <button
                  onClick={() => showToast("Attachment upload dialog: PNG, JPG, PDF up to 15MB")}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Attach proof (PNG, JPG, PDF)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Type your message as ${
                    currentRole === "admin" ? "Escrow Arbitrator" : currentRole
                  }...`}
                  className="flex-1 bg-transparent border-0 outline-none text-xs text-slate-900 placeholder:text-slate-400"
                />
                <button
                  onClick={() => setInputMessage((prev) => prev + " 😊")}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 px-1 text-[13px] text-slate-400 font-medium">
                <span>Press Enter to send. Shift + Enter for new line.</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Safedeal Anti-Fraud Shield Enabled
                </span>
              </div>
            </div>
            </>)}
          </section>

          {/* ========================================================= */}
          {/* COLUMN 3: PERSISTENT ORDER CONTEXT SIDEBAR (~320px) */}
          {/* ========================================================= */}
          <aside className={`lg:col-span-12 xl:col-span-3 flex flex-col gap-4 ${currentRole === "admin" && !contextOpen ? "hidden" : ""}`}>
            {!activeThread ? (
              <div className="bg-white rounded-2xl p-6 shadow-clean-sm border border-slate-200/80 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
                <ShieldCheck className="w-10 h-10 text-slate-300 mb-2" />
                <h4 className="font-bold text-sm text-slate-700">Order Context</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Select an escrow conversation to inspect linked transaction details, credentials vault status, and release controls.
                </p>
              </div>
            ) : (
              <>
            {/* Main Linked Order Card */}
            <div className="bg-white rounded-2xl p-5 shadow-clean-sm border border-slate-200/80">
              {/* Order ID & State Pill */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block">
                    Linked Transaction
                  </span>
                  <h3 className="font-headline text-sm font-bold text-slate-900">
                    {activeThread.orderNumber}
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[13px] font-bold ${
                    currentStatus === "inspection"
                      ? "bg-blue-100 text-[var(--cobalt-acc)]"
                      : currentStatus === "completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {currentStatus === "inspection"
                    ? "In Inspection SLA"
                    : currentStatus === "completed"
                    ? "Order Completed"
                    : "Dispute Paused"}
                </span>
              </div>

              {/* Product Image & Meta */}
              <div className="flex gap-3 mb-4">
                <img
                  src={activeThread.orderImage}
                  alt={activeThread.itemTitle}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-xs border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[12px] font-bold uppercase">
                    {activeThread.orderPlatform}
                  </span>
                  <h4 className="font-headline text-sm font-bold text-slate-900 leading-snug truncate mt-1">
                    {activeThread.itemTitle}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{activeThread.orderSubtext}</p>
                  <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                    {currentRole === "seller" ? (
                      <>
                        <span className="font-headline text-base font-extrabold text-slate-900">
                          ${(activeThread.orderPrice * 0.95).toFixed(2)} Net
                        </span>
                        <span className="text-[13px] text-slate-400">
                          (${activeThread.orderPrice.toFixed(2)} gross)
                        </span>
                        <span className="text-[13px] text-emerald-700 font-bold">
                          Held in Escrow
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-headline text-base font-extrabold text-slate-900">
                          ${activeThread.orderPrice.toFixed(2)}
                        </span>
                        <span className="text-[13px] text-emerald-700 font-bold">
                          Escrow Locked
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Inspection Countdown Timer Widget */}
              {currentStatus === "inspection" && (
                <div
                  className={`p-3 rounded-2xl mb-4 flex items-center justify-between border ${
                    isTimerFrozen
                      ? "bg-purple-50 border-purple-200"
                      : "bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Timer
                      className={`w-5 h-5 ${
                        isTimerFrozen ? "text-purple-600" : "text-[var(--cobalt-acc)]"
                      }`}
                    />
                    <div>
                      <p className="text-[12px] font-bold uppercase text-slate-400">
                        {isTimerFrozen ? "Arbitration Hold Active" : "Inspection Window"}
                      </p>
                      <p
                        className={`font-mono text-sm font-bold ${
                          isTimerFrozen ? "text-purple-700" : "text-slate-900"
                        }`}
                      >
                        {isTimerFrozen
                          ? "PAUSED BY ARBITRATOR"
                          : `${timerHours}h ${timerMinutes}m ${
                              timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds
                            }s remaining`}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={
                      isTimerFrozen
                        ? "Escrow timer is frozen pending arbitrator dispute review."
                        : "You have 48 hours from delivery to verify credentials and ensure no unexpected lockouts."
                    }
                  >
                    <Info className="w-4 h-4" />
                  </span>
                </div>
              )}

              {/* 5-Step Mini Stepper Timeline */}
              <div className="mb-4">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Escrow Progress
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[12px] font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="font-medium text-slate-800">
                      Order Placed & Registered
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[12px] font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="font-medium text-slate-800">
                      Escrow Funds Deposited (${activeThread.orderPrice.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[12px] font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="font-medium text-slate-800">
                      Encrypted Vault Delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[13px] font-bold ${
                        currentStatus === "completed"
                          ? "bg-emerald-600 text-white"
                          : "bg-[var(--cobalt-acc)] text-white animate-pulse"
                      }`}
                    >
                      {currentStatus === "completed" ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        "4"
                      )}
                    </div>
                    <span
                      className={`font-bold ${
                        currentStatus === "completed"
                          ? "text-slate-800"
                          : "text-[var(--cobalt-acc)]"
                      }`}
                    >
                      {currentStatus === "completed"
                        ? "Buyer Inspection (Verified)"
                        : "Buyer Inspection (In Progress)"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2.5 ${
                      currentStatus === "completed" ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[13px] font-bold ${
                        currentStatus === "completed"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-300 text-slate-700"
                      }`}
                    >
                      {currentStatus === "completed" ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        "5"
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        currentStatus === "completed"
                          ? "text-emerald-700 font-bold"
                          : "text-slate-500"
                      }`}
                    >
                      {currentStatus === "completed"
                        ? "Seller Payout Released (Done)"
                        : "Seller Payout Released"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Checkpoints Checklist */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 space-y-2 text-xs">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block">
                  Verified Security Checks
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    OGE Creation Email
                  </span>
                  <span className="font-bold text-slate-900">
                    {activeThread.securityChecks.ogeEmail}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    2FA Mobile Unbound
                  </span>
                  <span className="font-bold text-slate-900">
                    {activeThread.securityChecks.twoFactor}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    HWID Ban Status
                  </span>
                  <span className="font-bold text-emerald-700">
                    {activeThread.securityChecks.hwidStatus}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Contextually Adapted by Role */}
              <div className="space-y-2 pt-1">
                {currentRole === "buyer" && (
                  <>
                    <button
                      onClick={() => setIsVaultModalOpen(true)}
                      className="w-full h-11 rounded-xl bg-[var(--cobalt-acc)] hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Key className="w-4 h-4" />
                      <span>Inspect Vault Credentials</span>
                    </button>

                    {currentStatus === "inspection" && (
                      <button
                        onClick={() => setIsConfirmCompleteOpen(true)}
                        className="w-full h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Confirm & Complete Order</span>
                      </button>
                    )}

                    {currentStatus === "inspection" && (
                      <div className="pt-2 text-center">
                        <button
                          onClick={() => setIsDisputeModalOpen(true)}
                          className="text-rose-600 font-bold text-xs hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CircleAlert className="w-3.5 h-3.5" />
                          <span>Need Help? Open Escrow Dispute</span>
                        </button>
                      </div>
                    )}
                  </>
                )}

                {currentRole === "seller" && (
                  <>
                    <button
                      onClick={() => setIsVaultModalOpen(true)}
                      className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Inspect Vault Handover Payload</span>
                    </button>

                    {currentStatus === "inspection" && (
                      <button
                        onClick={() => {
                          handleSendMessage(
                            "Hey Alex, checking in! Did you have a chance to test the login credentials? Let me know if you need anything else so we can finalize the order!"
                          );
                          showToast("Friendly inspection reminder sent to buyer!");
                        }}
                        className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span>Nudge Buyer for Confirmation</span>
                      </button>
                    )}

                    <Link
                      href="/seller/earnings"
                      className="w-full h-11 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                      <span>View Pending Escrow Balance</span>
                    </Link>
                  </>
                )}

                {currentRole === "admin" && (
                  <>
                    <button
                      onClick={() => setIsVaultModalOpen(true)}
                      className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Inspect Vault Telemetry & Logs</span>
                    </button>

                    <button
                      onClick={() => {
                        const nextState = !isTimerFrozen;
                        setIsTimerFrozen(nextState);
                        const adminMsg: ChatMessage = {
                          id: `msg-admin-freeze-${Date.now()}`,
                          sender: "admin",
                          text: nextState
                            ? "⚠️ OFFICIAL ESCROW NOTICE: Inspection timer has been frozen by SafeDeal Arbitrator while cross-referencing telemetry."
                            : "✅ OFFICIAL ESCROW NOTICE: Inspection countdown has resumed. Both parties have active recourse.",
                          time: "Just now",
                        };
                        setMessagesMap((prev) => ({
                          ...prev,
                          [selectedThreadId]: [
                            ...(prev[selectedThreadId] || []),
                            adminMsg,
                          ],
                        }));
                        showToast(
                          nextState
                            ? "Arbitration Freeze: Escrow timer paused"
                            : "Arbitration Resumed: Escrow timer restarted"
                        );
                      }}
                      className={`w-full h-11 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs border ${
                        isTimerFrozen
                          ? "bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300"
                          : "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200"
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        {isTimerFrozen
                          ? "Unfreeze Escrow Countdown"
                          : "Freeze Escrow Timer (Arbitration Hold)"}
                      </span>
                    </button>

                    <Link
                      href="/admin/disputes/force-settle"
                      className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                      <span>Dispute Force Settlement Console</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Role-Specific Profile & Trust Card */}
            {currentRole === "seller" ? (
              <div className="bg-white rounded-2xl p-4 shadow-clean-sm border border-slate-200/80">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      activeThread.buyerAvatar ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
                    }
                    alt={activeThread.buyerName || "Buyer"}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <h4 className="font-headline text-xs font-bold text-slate-900">
                      {activeThread.buyerName || "Alex Mercer"}
                    </h4>
                    <p className="text-[13px] text-slate-500">
                      {activeThread.buyerEmail || "alex.mercer@gmail.com"}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[13px] text-blue-900 font-medium mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--cobalt-acc)] shrink-0" />
                  <span>Identity & 3D Secure Payment Verified</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[12px] text-slate-400 font-semibold">Total Purchases</p>
                    <p className="font-headline text-sm font-extrabold text-slate-900">
                      {activeThread.buyerDealCount || "14 deals"}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[12px] text-slate-400 font-semibold">Buyer Rating</p>
                    <p className="font-headline text-sm font-extrabold text-[var(--cobalt-acc)]">
                      ★ {activeThread.buyerRating || 4.98}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-4 shadow-clean-sm border border-slate-200/80">
                <div className="flex items-center gap-3 mb-3">
                  <Link href={`/store/${activeThread.sellerName.toLowerCase()}`}>
                    <img
                      src={
                        activeThread.avatar ||
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
                      }
                      alt={activeThread.sellerName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs hover:opacity-80 transition-opacity"
                    />
                  </Link>
                  <div>
                    <Link
                      href={`/store/${activeThread.sellerName.toLowerCase()}`}
                      className="font-headline text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {activeThread.sellerName}
                    </Link>
                    <p className="text-[13px] text-slate-500">
                      Member since Jan 2022 • 99.8% Positive
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[12px] text-slate-400 font-semibold">Orders Handled</p>
                    <p className="font-headline text-base font-extrabold text-slate-900">
                      1,482
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[12px] text-slate-400 font-semibold">Avg Transfer</p>
                    <p className="font-headline text-base font-extrabold text-emerald-700">
                      4 mins
                    </p>
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </aside>
        </div>

        {/* Escrow Protection Trust Bar Banner Below Inbox */}
        <section className="mt-8 rounded-3xl bg-[var(--ds-surface)] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-clean-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-xs shrink-0 border border-emerald-200">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-headline text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                How Safedeal Escrow Keeps You Safe
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                When you trade on Safedeal, payment is securely quarantined in neutral escrow.
                Funds are only released once the buyer inspects credentials and confirms complete satisfaction.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/protection"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 transition-colors shadow-xs"
            >
              Buyer Escrow Rules
            </Link>
            <Link
              href="/help"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Support Center
            </Link>
          </div>
        </section>
      </main>

      {/* MODAL 1: ASSET VAULT HANDOVER MODAL */}
      {activeThread && (
        <AssetVaultModal
          isOpen={isVaultModalOpen}
          onClose={() => setIsVaultModalOpen(false)}
          orderNumber={activeThread.orderNumber}
          sellerName={activeThread.sellerName}
          riotId={activeThread.credentials.login}
          password={activeThread.credentials.pass}
          region={activeThread.orderPlatform}
          ogeEmail={activeThread.credentials.email}
          recoveryToken={activeThread.credentials.token}
        />
      )}

      {/* MODAL 2: CONFIRM & COMPLETE ESCROW RELEASE */}
      {activeThread && (
        <OrderCompletionReleaseModal
          isOpen={isConfirmCompleteOpen}
          onClose={() => setIsConfirmCompleteOpen(false)}
          onConfirmRelease={handleConfirmOrder}
          orderNumber={activeThread.orderNumber}
          assetName={activeThread.itemTitle}
          sellerName={activeThread.sellerName}
          totalAmount={activeThread.orderPrice}
        />
      )}

      {/* MODAL 3: ESCROW DISPUTE / ARBITRATION FILING */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-headline text-base font-bold text-slate-900">
                  Open Official Escrow Dispute
                </h3>
              </div>
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-4">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-950">
                <strong>Attention:</strong> Filing a dispute immediately{" "}
                <strong>freezes the 48-hour escrow countdown</strong>. A Safedeal
                arbitrator will join this chat within 4 hours to review evidence.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Primary Dispute Reason
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-500 font-medium"
                >
                  <option value="credentials-invalid">
                    Invalid Credentials / Password Wrong
                  </option>
                  <option value="item-not-as-described">
                    Item / Rank / Skins Not as Described
                  </option>
                  <option value="oge-missing">
                    OGE Original Email Access Not Delivered
                  </option>
                  <option value="account-locked">
                    Account Locked / HWID Ban Detected
                  </option>
                  <option value="seller-unresponsive">
                    Seller Not Responding to Vault Handover
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Describe what went wrong:
                </label>
                <textarea
                  value={disputeDetails}
                  onChange={(e) => setDisputeDetails(e.target.value)}
                  rows={3}
                  placeholder="Provide details and mention any screenshots you have ready..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-500 font-medium resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDisputeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFileDispute}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                Freeze Escrow & Open Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EscrowChatWorkspace(props: EscrowChatWorkspaceProps) {
  return (
    <React.Suspense
      fallback={
        <div className="h-[750px] w-full bg-white rounded-3xl border border-slate-200/80 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EscrowChatWorkspaceInner {...props} />
    </React.Suspense>
  );
}
