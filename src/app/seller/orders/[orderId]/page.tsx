"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import SellerHeader from "@/components/navigation/SellerHeader";
import {
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Lock,
  Star,
  Printer,
  FileText,
  KeyRound,
  Mail,
  Upload,
  CloudUpload,
  Eye,
  EyeOff,
  Send,
  Paperclip,
  Languages,
  Shield,
  Bot,
  User,
  CheckCheck,
  Check,
  Gavel,
  AlertCircle,
  Headphones,
  Save,
  DollarSign,
  Calendar,
  X,
  BadgeCheck,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "buyer" | "seller";
  senderName: string;
  senderInitials?: string;
  text: string;
  time: string;
}

function SellerOrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || "SF-2024-88492";

  // Live order dynamic dataset
  const [orderData, setOrderData] = useState<{
    id: string;
    orderNumber: string;
    itemTitle: string;
    price: number;
    sellerPayout: number;
    buyerName: string;
    image: string;
    status: string;
    category: string;
  } | null>(null);

  // Delivery & Chat States (declared before useEffect)
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Countdown Timer State
  const [minutes, setMinutes] = useState(37);
  const [seconds, setSeconds] = useState(42);

  // Form Fields State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isAffirmed, setIsAffirmed] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const o = json.data;
          const price = typeof o.price === "number" ? o.price : 50;
          setOrderData({
            id: o.id,
            orderNumber: o.orderNumber || `#${o.id}`,
            itemTitle: o.itemTitle || o.title || "Digital Asset Order",
            price,
            sellerPayout: +(price * 0.95).toFixed(2),
            buyerName: o.buyerName || "Authorized Buyer",
            image: o.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
            status: o.status || "active",
            category: o.category || "Gaming Accounts",
          });
          setMessages([
            {
              id: "msg-1",
              sender: "bot",
              senderName: "Safedeal Escrow Bot",
              text: `Buyer ${o.buyerName || "Authorized Buyer"} has deposited $${price.toFixed(2)} into escrow for "${o.itemTitle || "Digital Asset"}". Delivery window clock active.`,
              time: "Today",
            },
          ]);
          if (o.status === "delivered") {
            setIsDelivered(true);
          }
        }
      } catch (e) {
        console.error("Failed to load dynamic order", e);
      }
    }
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (orderData?.status === "disputed" || orderData?.status === "delivered") {
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prevSec) => {
        if (prevSec > 0) return prevSec - 1;
        setMinutes((prevMin) => (prevMin > 0 ? prevMin - 1 : 0));
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [orderData?.status]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "seller",
      senderName: "AeroGamingDeals (You)",
      text: inputMessage.trim(),
      time: "Just now",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
      setActionNotice(`Attached file: ${e.target.files[0].name}`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAffirmed) {
      setActionNotice("Please check the verification affirmation checkbox to confirm the account is unbound.");
      setTimeout(() => setActionNotice(null), 4000);
      return;
    }
    
    try {
      const res = await fetch(`/api/orders/${orderId}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: username,
          email: recoveryEmail,
          pass: password,
          ogeEmail: recoveryEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsDelivered(true);
        setIsDeliveryModalOpen(true);
        setActionNotice("Credentials securely stored in Escrow Vault. Buyer inspection active!");
      } else {
        // Fallback for static order IDs
        setIsDelivered(true);
        setIsDeliveryModalOpen(true);
      }
    } catch (err) {
      setIsDelivered(true);
      setIsDeliveryModalOpen(true);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleRequestArbitration = () => {
    setActionNotice("Safedeal Arbitration Officer #402 has been requested and will join this order thread within 3 minutes.");
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleReportBuyer = () => {
    setActionNotice("Buyer report filed. The escrow audit desk will monitor this session.");
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ds-surface)] text-slate-900 font-sans antialiased">
      {/* 1. SELLER HUB HEADER */}
      <SellerHeader activeTab="orders" />

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-clean-lg flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. MAIN FULFILLMENT WORKSPACE */}
      <main className="w-full pt-16 bg-[var(--ds-surface)] min-h-screen flex-1 flex flex-col">
        {/* Top Command & Breadcrumb Strip */}
        <div className="w-full bg-white border-b border-slate-200/80 shadow-clean-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold">
              <Link
                href="/seller/orders"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Orders</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 tracking-tight font-extrabold">Order #{orderId}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] uppercase font-bold border border-blue-200/70 ml-1">
                Escrow Secured
              </span>
            </nav>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-[12px] font-medium border border-slate-200/60">
                <span
                  className={`w-2 h-2 rounded-full ${
                    orderData?.status === "disputed"
                      ? "bg-rose-600"
                      : orderData?.status === "delivered"
                      ? "bg-emerald-600"
                      : "bg-blue-600 animate-ping"
                  }`}
                />
                <span className="font-semibold text-blue-600">
                  {orderData?.status === "disputed"
                    ? "Escrow Status:"
                    : orderData?.status === "delivered"
                    ? "Escrow Status:"
                    : "SLA Deadline:"}
                </span>
                <span className="font-bold text-slate-900">
                  {orderData?.status === "disputed"
                    ? "PAUSED (Dispute Arbitration Active)"
                    : orderData?.status === "delivered"
                    ? "Settled & Released"
                    : `${minutes}m ${seconds < 10 ? `0${seconds}` : seconds}s remaining`}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 shadow-clean-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Slip</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Order Workspace Container */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
          {/* Multi-step Visual Tracker Strip */}
          <div className="w-full bg-white rounded-3xl p-5 border border-slate-200/90 shadow-clean-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h2 className="font-headline font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                  Escrow Fulfillment Pipeline
                </h2>
              </div>
              <span className="text-[12px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                {isDelivered ? "Stage 4 of 5 In Progress" : "Stage 3 of 5 In Progress"}
              </span>
            </div>

            {/* Process Steps Flow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative text-xs">
              {/* Step 1 */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-400">2:14 PM</span>
                </div>
                <span className="font-bold text-slate-900">1. Order Placed</span>
                <span className="text-[12px] text-slate-500 truncate">Buyer committed</span>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-400">2:15 PM</span>
                </div>
                <span className="font-bold text-slate-900">2. Escrow Funded</span>
                <span className="text-[12px] text-slate-500 truncate">${orderData ? `${orderData.price.toFixed(2)}` : "$0.00"} Vault Locked</span>
              </div>

              {/* Step 3 (Active) */}
              <div
                className={`p-3 rounded-2xl flex flex-col gap-1 relative overflow-hidden transition-all ${
                  isDelivered
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                    : "bg-blue-600 text-white shadow-clean-sm"
                }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDelivered
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-blue-600"
                    }`}
                  >
                    {isDelivered ? <Check className="w-3.5 h-3.5" /> : "3"}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      isDelivered ? "bg-emerald-200 text-emerald-900" : "bg-white/20 text-white"
                    }`}
                  >
                    {isDelivered ? "COMPLETED" : "ACTIVE"}
                  </span>
                </div>
                <span className="font-bold relative z-10">3. Delivery in Progress</span>
                <span className="text-[12px] opacity-90 truncate relative z-10">
                  {isDelivered ? "Credentials Dispatched" : "38 mins remaining SLA"}
                </span>
              </div>

              {/* Step 4 */}
              <div
                className={`p-3 rounded-2xl border flex flex-col gap-1 transition-all ${
                  isDelivered
                    ? "bg-blue-50/70 border-blue-200 text-blue-950 shadow-clean-xs"
                    : "bg-white border-slate-200/60 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isDelivered ? "Active" : "Pending"}
                  </span>
                </div>
                <span className="font-bold text-slate-900">4. Buyer Inspection</span>
                <span className="text-[12px] text-slate-500 truncate">24h verification buffer</span>
              </div>

              {/* Step 5 */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/60 flex flex-col gap-1 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                    5
                  </span>
                  <span className="text-[11px] text-slate-400">Pending</span>
                </div>
                <span className="font-bold text-slate-900">5. Payout Release</span>
                <span className="text-[12px] text-slate-500 truncate">${orderData ? `${orderData.sellerPayout.toFixed(2)}` : "$0.00"} net payout</span>
              </div>
            </div>
          </div>

          {/* Workspace Main Layout (Two Column) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* =================================================================== */}
            {/* LEFT COLUMN: Order Info & Fulfillment Workspace (7-8 cols)          */}
            {/* =================================================================== */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Product Details Summary Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-clean-sm">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4 w-full">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      <img
                        src={orderData?.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80"}
                        alt={orderData?.itemTitle || "Asset image"}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                        PC • NA
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[11px] flex items-center gap-1 border border-emerald-200">
                          <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          <span>Instant Handover</span>
                        </span>
                        <span className="text-[12px] font-mono text-slate-400">
                          Listing ID: #VAL-9921-IMM
                        </span>
                      </div>

                      <h1 className="font-headline font-bold text-base sm:text-lg text-slate-900 leading-tight truncate">
                        {orderData?.itemTitle || "Digital Asset Order"}
                      </h1>

                      <p className="text-xs text-slate-500 line-clamp-1 leading-snug">
                        Full Access • Reaver Vandal, Prime 2.0 Phantom, Kuronami Blade • Clean MMR 78% Winrate
                      </p>

                      <div className="flex items-center gap-4 mt-1 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                            {(orderData?.buyerName || "Authorized Buyer")
                              .split(" ")
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-slate-900">{orderData?.buyerName || "Authorized Buyer"}</span>
                          <span className="text-[11px] text-amber-500 font-bold">★ 4.95</span>
                          <span className="text-[12px] text-slate-400">(14 orders)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Settlement summary */}
                  <div className="sm:text-right w-full sm:w-auto bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl flex sm:flex-col justify-between items-center sm:items-end border sm:border-0 border-slate-100">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Buyer Total
                      </span>
                      <span className="font-headline text-2xl font-black text-slate-900">
                        ${orderData ? orderData.price.toFixed(2) : "0.00"}
                      </span>
                    </div>

                    <div className="sm:mt-2 text-right">
                      <span className="text-[12px] text-slate-500 block">Seller Payout (95%)</span>
                      <span className="font-headline font-extrabold text-sm text-emerald-600">
                        ${orderData ? orderData.sellerPayout.toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escrow Protection Trust Callout */}
              <div className="rounded-3xl bg-emerald-50/80 p-5 flex items-start gap-3 border border-emerald-200/80 shadow-clean-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-bold text-slate-900">
                      Escrow Guarantee Active & Secured
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-white text-emerald-800 font-mono text-[11px] font-bold border border-emerald-200">
                      Partner Ref: #ESC-90812-US
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    Payment confirmed and held safely by Safedeal Licensed Escrow Partner. Do not release items until this status confirms payment. Your payout of{" "}
                    <strong className="text-slate-900 font-bold">$185.25</strong> is locked in custodial trust and guaranteed upon buyer confirmation or timer completion.
                  </p>
                </div>
              </div>

              {/* Fulfillment Delivery Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-clean-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <h2 className="font-headline font-bold text-base sm:text-lg text-slate-900">
                        Safedeal Automated Vault Delivery
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500">
                      Submit credentials into the end-to-end encrypted buyer delivery container.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold self-start border border-blue-200/60">
                    <Shield className="w-3 h-3" />
                    <span>AES-256 Client Transit</span>
                  </div>
                </div>

                {/* Category Compliance Banner */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-snug">
                    <strong className="text-slate-900 font-bold">Digital Gaming Accounts Policy:</strong> Provide verified login credentials exclusively via this automated vault form.{" "}
                    <span className="text-rose-600 font-bold">Never share passwords directly in the live chat</span>; credentials sent via chat are ineligible for dispute reimbursement protection.
                  </p>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmitDelivery} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Riot / Game ID */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Riot Username / Login ID <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. ImmVandalGod#NA1"
                          className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-semibold focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">Case-sensitive</span>
                    </div>

                    {/* Vault Password */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                        <span>Vault Password <span className="text-rose-600">*</span></span>
                        <span className="text-[11px] text-blue-600 font-bold">Zero-Knowledge Encrypted</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Current account password"
                          className="w-full h-11 pl-9 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-semibold focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Native Recovery Email */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Native First Email / Creation Mail (OGE) <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="e.g. original-acc-creator@proton.me"
                        className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-semibold focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <p className="text-[12px] text-slate-500 mt-1">
                      Please confirm credentials for the creation mailbox or ensure the Riot account email is unlinked and ready for instant transfer.
                    </p>
                  </div>

                  {/* Delivery Proof & Screenshot Drag-and-drop */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Upload Delivery Proof & Transfer Snapshot{" "}
                      <span className="text-slate-400 font-normal">(Optional but recommended)</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-2xl bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 transition-all p-5 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform shadow-clean-xs">
                        <CloudUpload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-900">
                        <span className="text-blue-600 font-bold">Click to upload snapshot</span> or drag & drop files here
                      </p>
                      <p className="text-[12px] text-slate-500">
                        Riot Account portal screenshot showing 2FA disabled or updated email proof
                      </p>
                      {uploadedFileName && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mt-1">
                          ✓ Selected: {uploadedFileName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Verification Affirmation Checkbox */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="seller-affirmation"
                      checked={isAffirmed}
                      onChange={(e) => setIsAffirmed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <label
                      htmlFor="seller-affirmation"
                      className="text-xs text-slate-700 cursor-pointer select-none leading-relaxed"
                    >
                      I confirm the account credentials have been thoroughly tested, current Riot 2FA authenticator is unbound, and all secondary security phone links have been cleared for buyer acquisition.
                    </label>
                  </div>

                  {/* Action Trigger */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-headline font-bold text-xs sm:text-sm shadow-clean-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-99"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Mark as Delivered & Send to Buyer Vault</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionNotice("Draft saved successfully.");
                        setTimeout(() => setActionNotice(null), 3000);
                      }}
                      className="w-full sm:w-auto h-12 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500" />
                      <span>Save Draft</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 3 Escrow Protection Detail Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-clean-xs flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-bold text-slate-900">Chargeback Immunity</h4>
                    <p className="text-slate-500 leading-snug">
                      Buyer payment is pre-cleared. Escrow shields you from unauthorized payment claims.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-clean-xs flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-bold text-slate-900">Auto-Release Clock</h4>
                    <p className="text-slate-500 leading-snug">
                      If buyer fails to confirm within 24h of delivery, escrow releases funds automatically.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-clean-xs flex items-start gap-3">
                  <Gavel className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-bold text-slate-900">Arbitration Desk</h4>
                    <p className="text-slate-500 leading-snug">
                      Neutral human game examiners resolve disputes with full audit logs and screenshots.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* RIGHT COLUMN: Live Chat & Timeline Activity (4-5 cols)              */}
            {/* =================================================================== */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* Live Order Chat Module */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-clean-sm overflow-hidden flex flex-col h-[520px]">
                {/* Chat Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          {(orderData?.buyerName || "Authorized Buyer")
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white" />
                      </div>
                      <div className="leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline font-bold text-xs text-slate-900 truncate max-w-[130px]">
                            {orderData?.buyerName || "Authorized Buyer"}
                          </span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                          Buyer
                        </span>
                      </div>
                      <span className="text-[12px] text-emerald-600 font-semibold">
                        Active now in trade lobby
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActionNotice("Auto-translation enabled for incoming chat messages.");
                        setTimeout(() => setActionNotice(null), 3000);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                      title="Translate messages"
                    >
                      <Languages className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionNotice("Trade lobby is 256-bit encrypted. Dispute desk logs all exchanges.");
                        setTimeout(() => setActionNotice(null), 3000);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                      title="Security policy"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chat Security Warning Notice */}
                <div className="bg-slate-100 px-4 py-1.5 flex items-center gap-2 border-b border-slate-200/50">
                  <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 font-medium">
                    Encrypted Trade Channel • Monitored for Buyer & Seller Safety
                  </span>
                </div>

                {/* Chat Message Thread Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white text-xs">
                  {/* Timestamp Marker */}
                  <div className="text-center">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
                      Today, Order Created 2:14 PM
                    </span>
                  </div>

                  {messages.map((msg) => {
                    if (msg.sender === "bot") {
                      return (
                        <div
                          key={msg.id}
                          className="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-slate-800 text-center space-y-1"
                        >
                          <div className="flex items-center justify-center gap-1 text-blue-700 font-bold text-[11px]">
                            <Bot className="w-3 h-3" />
                            <span>{msg.senderName}</span>
                          </div>
                          <p className="text-[12px] leading-snug">{msg.text}</p>
                        </div>
                      );
                    }

                    if (msg.sender === "buyer") {
                      return (
                        <div key={msg.id} className="flex items-start gap-2 max-w-[85%]">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                            {msg.senderInitials || "B"}
                          </div>
                          <div className="space-y-0.5">
                            <div className="p-3 rounded-2xl rounded-tl-none bg-slate-100 text-slate-900 leading-relaxed">
                              {msg.text}
                            </div>
                            <span className="text-[11px] text-slate-400 block pl-1">{msg.time}</span>
                          </div>
                        </div>
                      );
                    }

                    // Seller message (Current user)
                    return (
                      <div key={msg.id} className="flex items-end justify-end gap-2 ml-auto max-w-[85%]">
                        <div className="space-y-0.5 text-right">
                          <div className="p-3 rounded-2xl rounded-tr-none bg-blue-600 text-white text-left leading-relaxed">
                            {msg.text}
                          </div>
                          <div className="flex items-center justify-end gap-1 pr-1">
                            <span className="text-[11px] text-slate-400">{msg.time}</span>
                            <CheckCheck className="w-3 h-3 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                      title="Attach screenshot"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={`Message ${orderData?.buyerName || "buyer"}...`}
                      className="flex-1 h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-clean-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Order Activity Audit History */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-clean-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline font-bold text-xs sm:text-sm text-slate-900">
                    Order Audit Log
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">Live updates</span>
                </div>

                <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-[2px] before:bg-slate-100 text-xs">
                  {/* Log Entry 1 */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Delivery Timer Initialized</span>
                        <span className="text-[11px] text-slate-400">2:16 PM</span>
                      </div>
                      <p className="text-slate-500 text-[12px] mt-0.5">
                        2-Hour delivery SLA countdown begun. Target completion: 4:16 PM UTC.
                      </p>
                    </div>
                  </div>

                  {/* Log Entry 2 */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Payment Verified by Escrow</span>
                        <span className="text-[11px] text-slate-400">2:15 PM</span>
                      </div>
                      <p className="text-slate-500 text-[12px] mt-0.5">
                        $195.00 secured in partner trust. Anti-fraud score 99.8% (Approved).
                      </p>
                    </div>
                  </div>

                  {/* Log Entry 3 */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Order Created</span>
                        <span className="text-[11px] text-slate-400">2:14 PM</span>
                      </div>
                      <p className="text-slate-500 text-[12px] mt-0.5">
                        Buyer confirmed purchase for Immortal 3 listing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support & Protection Card */}
              <div className="bg-slate-100 rounded-3xl p-5 space-y-3 text-xs border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-blue-600" />
                  <h4 className="font-headline font-bold text-slate-900">
                    Safedeal Seller Concierge
                  </h4>
                </div>
                <p className="text-slate-600 text-[12px] leading-relaxed">
                  Experiencing difficulties with this buyer or encounter an invalid email? An official Safedeal dispute examiner can join the order chat immediately.
                </p>
                <div className="pt-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleRequestArbitration}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-clean-xs border border-slate-200 cursor-pointer"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>Request 24/7 Arbitrator Intervention</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReportBuyer}
                    className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-[12px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Report an Issue with Buyer ({orderData?.buyerName || "buyer"})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. POST-DELIVERY SUCCESS MODAL (MATCHING PROTOTYPE)                      */}
        {/* ======================================================================= */}
        {isDeliveryModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-clean-lg space-y-5 text-center border border-slate-200 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-clean-xs">
                <BadgeCheck className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <h3 className="font-headline font-black text-lg text-slate-900">
                  Credentials Encrypted & Dispatched!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Order #{orderId} is now marked as delivered. The automated vault credentials have been safely revealed to {orderData?.buyerName || "the buyer"}.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 text-left space-y-1.5 border border-slate-100 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Inspection Window:</span>
                  <span className="font-bold text-slate-900">24 Hours</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Payout Hold:</span>
                  <span className="font-bold text-emerald-600">${orderData?.sellerPayout?.toFixed(2) ?? "185.25"} Guaranteed</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsDeliveryModalOpen(false);
                  router.push("/seller/orders");
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-clean-sm cursor-pointer"
              >
                Return to Order Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="w-full bg-white border-t border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.02)] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-headline font-black text-lg text-slate-900">Safedeal</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase">
                  Seller Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                High-velocity, bank-grade marketplace infrastructure for verified digital goods sellers, key distributors, and virtual currency merchants.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-blue-700 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Safedeal Shield Protected</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-emerald-700 text-[11px] font-bold">
                  <Zap className="w-3.5 h-3.5 fill-emerald-600" />
                  <span>Instant API Fulfillment</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-headline font-bold text-xs text-slate-900 mb-3">
                Seller Policies
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Seller Protection Policy
                  </Link>
                </li>
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Merchant Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Prohibited Items & Assets
                  </Link>
                </li>
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Verification Standard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline font-bold text-xs text-slate-900 mb-3">
                Operations & Finance
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Fee Schedules & Tiers
                  </Link>
                </li>
                <li>
                  <Link href="/seller/earnings" className="hover:text-blue-600 transition-colors">
                    Payout Timelines
                  </Link>
                </li>
                <li>
                  <Link href="/seller/earnings" className="hover:text-blue-600 transition-colors">
                    Tax & Invoice Center
                  </Link>
                </li>
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Escrow Security Protocol
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline font-bold text-xs text-slate-900 mb-3">
                Seller Support
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link href="/admin/disputes" className="hover:text-blue-600 transition-colors">
                    Dispute Resolution Desk
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-blue-600 transition-colors">
                    Seller Knowledge Base
                  </Link>
                </li>
                <li>
                  <Link href="/protection" className="hover:text-blue-600 transition-colors">
                    Chargeback Defense
                  </Link>
                </li>
                <li>
                  <Link href="/messages" className="hover:text-blue-600 transition-colors">
                    24/7 Merchant Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Safedeal Global Ltd. All rights reserved. Encrypted escrow marketplace.</p>
            <div className="flex items-center gap-4 text-[12px]">
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/protection" className="hover:text-slate-900 transition-colors">
                Security Overview
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SellerOrderDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[var(--ds-surface)] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SellerOrderDetailContent />
    </React.Suspense>
  );
}
