"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminSearch, useAdminToast } from "@/components/navigation/AdminShell";
import {
  ShieldCheck,
  Zap,
  Plus,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Store,
  Eye,
  Package,
  Layers,
  DollarSign,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  Camera,
  Ban,
  Lock,
  ChevronRight,
  ChevronLeft,
  X,
  Send,
  Upload,
  Coins,
  Copy,
  Check,
  SlidersHorizontal,
  RefreshCw,
  Bell,
  User,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  Trash2,
  Edit3,
  Bookmark,
  MoreVertical,
  CheckCheck,
  FileSpreadsheet,
  KeyRound,
  ShieldAlert,
  Info,
  Sparkles,
  ArrowUpDown,
  Laptop,
  CheckSquare,
  Square,
  Server,
  Activity,
  Terminal,
  Gavel,
  Users,
  CreditCard,
  History,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  FileText,
  FileCode,
  AlertOctagon,
  Calendar,
  Globe,
  Fingerprint,
  FileCheck,
  Key,
  Shield,
  Maximize2,
  LockKeyhole,
  Timer,
  Scale,
  AlarmClock,
  UserCheck,
  UserPlus,
  UserX,
  LockIcon,
  UnlockIcon,
  Building,
  Mail,
  Smartphone,
  Cpu,
  BadgeAlert,
} from "lucide-react";
import EnforceSanctionModal from "@/components/admin/EnforceSanctionModal";

interface AdminUser {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  location: string;
  registeredDate: string;
  avatarChar: string;
  avatarBg: string;
  role: "Merchant Pro" | "Buyer" | "Flagged Seller";
  roleType: string;
  tier?: string;
  isOnline: boolean;
  onlineText: string;
  completedOrders: number;
  totalVolume: number;
  disputeRate: string;
  handoverSuccessRate: string;
  rating: number;
  reviewsCount: string;
  riskScore: number;
  riskCategory: "Low" | "Moderate" | "Severe";
  riskDetails: string;
  status: "Active" | "Restricted" | "Suspended" | "Pending KYC";
  escrowBalance: number;
  settledVolume: number;
  twoFactor: string;
  payoutMethod: string;
  hardwareFingerprint: string;
  chargebacks: number;
  activeListingsCount: number;
}

export default function AdminUsersManagementPage() {
  const router = useRouter();

  // Navigation state
  const [activeNav, setActiveNav] = useState("users-and-sellers");

  // Search & Filter state
  const { searchQuery, setSearchQuery } = useAdminSearch();
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [savedView, setSavedView] = useState<"all" | "kyc" | "high-escrow" | "disputes">("all");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"storefront" | "risk" | "notes" | "compliance">("storefront");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Modals state
  const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [staffNoteModalOpen, setStaffNoteModalOpen] = useState(false);
  const [newStaffNote, setNewStaffNote] = useState("");
  const { showToast } = useAdminToast();

  // Suspension Form State
  const [suspensionReason, setSuspensionReason] = useState("Severe Fraud / Payment Collusion");
  const [secondaryApprover, setSecondaryApprover] = useState("lead.approver@safedeal.internal");
  const [certifyChecked, setCertifyChecked] = useState(false);

  // Staff notes collection for selected user
  const [staffNotes, setStaffNotes] = useState<{ author: string; timestamp: string; content: string }[]>([]);

  // Master Users Dataset (loaded dynamically from API)
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        if (json.success && Array.isArray(json.users)) {
          setUsers(json.users);
          if (json.users.length > 0) {
            setSelectedUser((prev) => prev || json.users[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load admin users", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  // Set default selected user
  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0]);
    }
  }, [selectedUser, users]);

  // Keyboard shortcut Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Saved views
      if (savedView === "kyc" && u.tier !== "T3 Verified") return false;
      if (savedView === "high-escrow" && u.escrowBalance < 5000) return false;
      if (savedView === "disputes" && parseFloat(u.disputeRate) < 1.0) return false;

      // Dropdown filters
      if (roleFilter === "buyer" && u.role !== "Buyer") return false;
      if (roleFilter === "seller" && u.role !== "Merchant Pro" && u.role !== "Flagged Seller") return false;
      if (roleFilter === "merchant" && u.role !== "Merchant Pro") return false;

      if (statusFilter === "active" && u.status !== "Active") return false;
      if (statusFilter === "restricted" && u.status !== "Restricted") return false;
      if (statusFilter === "suspended" && u.status !== "Suspended") return false;

      if (riskFilter === "low" && u.riskScore >= 25) return false;
      if (riskFilter === "moderate" && (u.riskScore < 25 || u.riskScore > 70)) return false;
      if (riskFilter === "high" && (u.riskScore <= 70 || u.riskScore > 90)) return false;
      if (riskFilter === "severe" && u.riskScore <= 90) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.userId.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, savedView, roleFilter, statusFilter, riskFilter, searchQuery]);

  // Open Inspector Drawer
  const openInspector = (user: AdminUser) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  // Export User Registry CSV
  const handleExportCSV = () => {
    const headers = ["User ID", "Username", "Full Name", "Email", "Role", "Status", "Risk Score", "Escrow Balance", "Volume"];
    const rows = users.map((u) => [
      u.userId,
      u.username,
      `"${u.fullName}"`,
      u.email,
      u.role,
      u.status,
      u.riskScore,
      u.escrowBalance.toFixed(2),
      u.totalVolume.toFixed(2),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `safedeal_user_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("User & Seller registry exported as CSV file.");
  };

  // Compliance: Restrict listings
  const handleRestrictListings = async () => {
    if (!selectedUser) return;
    showToast(`Restriction applied: ${selectedUser.username} blocked from creating new catalog listings.`);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, status: "Restricted" }),
      });
    } catch (e) {
      console.warn("Failed to persist restriction to API", e);
    }
  };

  // Compliance: Freeze escrow
  const handleFreezeEscrow = () => {
    if (!selectedUser) return;
    showToast(`Escrow freeze locked: $${selectedUser.escrowBalance.toFixed(2)} held in staging.`);
  };

  // Compliance: Send formal warning
  const handleSendWarning = () => {
    if (!selectedUser) return;
    showToast(`Formal Policy Notice dispatched to ${selectedUser.email}.`);
  };

  // Compliance: Suspend Account Confirmation
  const handleConfirmSuspension = async () => {
    if (!selectedUser) return;
    const target = selectedUser;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === target.id
          ? {
              ...u,
              status: "Suspended",
              role: "Flagged Seller",
              tier: "Blacklisted",
              riskScore: 99,
              riskCategory: "Severe",
              onlineText: "Blacklisted",
              isOnline: false,
            }
          : u
      )
    );
    setSuspensionModalOpen(false);
    setDrawerOpen(false);
    showToast(`Critical Suspension Executed: ${target.username} terminated. $${target.escrowBalance.toFixed(2)} seized.`);

    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: target.id,
          status: "Suspended",
          tier: "Blacklisted",
        }),
      });
    } catch (e) {
      console.warn("Failed to persist suspension to API", e);
    }
  };

  // Add staff note
  const handleAddStaffNote = () => {
    if (!newStaffNote.trim()) return;
    setStaffNotes((prev) => [
      {
        author: "Sarah Lin (Super Admin)",
        timestamp: "Just now",
        content: newStaffNote.trim(),
      },
      ...prev,
    ]);
    setNewStaffNote("");
    setStaffNoteModalOpen(false);
    showToast("New compliance audit note logged.");
  };

  return (
    <main className="w-full bg-[var(--ds-surface)] min-h-screen">
      <div className="flex flex-col w-full">
        <div className="px-8 py-6 flex flex-col gap-6">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                  {/* Breadcrumbs */}
                  <div className="flex items-center gap-1.5 text-slate-500 text-[12px] uppercase tracking-wider mb-1 font-semibold">
                    <Link href="/admin" className="hover:text-[var(--cobalt-acc)] transition-colors">
                      Marketplace
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-900 font-bold">Users & Sellers</span>
                  </div>

                  <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    User & Seller Management
                  </h1>
                  <p className="text-xs md:text-sm text-slate-600 mt-0.5 max-w-3xl">
                    Inspect user profiles, verify merchant compliance, monitor risk signals, and apply calibrated account restrictions.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 self-start md:self-auto">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
                    type="button"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>Export User Registry</span>
                  </button>
                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--cobalt-acc)] text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                    type="button"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Invite Merchant</span>
                  </button>
                </div>
              </div>

              {/* Metric Quick Cards (4 cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Accounts */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">Total Accounts</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[var(--cobalt-acc)]">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-headline text-2xl font-extrabold text-slate-900 tracking-tight">
                      {users.length}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active 98.2%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[var(--cobalt-acc)] h-full rounded-full" style={{ width: "98.2%" }} />
                  </div>
                </div>

                {/* Card 2: Verified Merchants */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">Verified Merchants (T2/T3)</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-headline text-2xl font-extrabold text-slate-900 tracking-tight">
                      {users.filter((u) => u.role === "Merchant Pro").length}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">+42 this week</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>99.4% Fulfillment SLA</span>
                  </div>
                </div>

                {/* Card 3: Restricted / Under Review */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">Restricted / Under Review</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                      <LockKeyhole className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-headline text-2xl font-extrabold text-slate-900 tracking-tight">
                      {users.filter((u) => u.status === "Restricted").length}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-extrabold border border-rose-200">
                      Action Req.
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-slate-500 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-semibold text-slate-700">$18,450 escrow frozen</span>
                  </div>
                </div>

                {/* Card 4: Suspended for Fraud */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">Suspended for Fraud</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-rose-600">
                      <Gavel className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-headline text-2xl font-extrabold text-slate-900 tracking-tight">
                      {users.filter((u) => u.status === "Suspended").length}
                    </span>
                    <span className="text-[11px] text-slate-500">Last 30 days</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-slate-500 text-[11px]">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-slate-700">100% loss containment</span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by User ID, display name, verified email, IP hash, or payout IBAN..."
                      className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Role Filter */}
                    <div className="flex items-center gap-1.5 px-3 h-11 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                      <span className="text-slate-400 font-normal">Role:</span>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Roles</option>
                        <option value="buyer">Buyer Only</option>
                        <option value="seller">Seller Only</option>
                        <option value="merchant">Merchant Pro / VIP</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 px-3 h-11 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                      <span className="text-slate-400 font-normal">Status:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="restricted">Restricted (Escrow Frozen)</option>
                        <option value="suspended">Suspended</option>
                        <option value="kyc">Pending KYC</option>
                      </select>
                    </div>

                    {/* Risk Level Filter */}
                    <div className="flex items-center gap-1.5 px-3 h-11 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                      <span className="text-slate-400 font-normal">Risk:</span>
                      <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Levels</option>
                        <option value="low">Low (&lt;25)</option>
                        <option value="moderate">Moderate (25-70)</option>
                        <option value="high">High (70-90)</option>
                        <option value="severe">Severe (AI Flagged)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => showToast("Advanced filter parameters loaded.")}
                      className="h-11 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      type="button"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                      <span>More Filters</span>
                    </button>
                  </div>
                </div>

                {/* Quick Filter Pills (Saved Views) */}
                <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 no-scrollbar">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    Saved Views:
                  </span>
                  <button
                    onClick={() => setSavedView("all")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      savedView === "all"
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    All Monitored Accounts (124k)
                  </button>
                  <button
                    onClick={() => setSavedView("kyc")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      savedView === "kyc"
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Pending Identity Verification (14)
                  </button>
                  <button
                    onClick={() => setSavedView("high-escrow")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      savedView === "high-escrow"
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    High Escrow Held (&gt;$10k)
                  </button>
                  <button
                    onClick={() => setSavedView("disputes")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      savedView === "disputes"
                        ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Dispute Spike Alerts (&gt;1%)
                  </button>
                </div>
              </div>

              {/* User Directory Table Container */}
              <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200 select-none">
                        <th className="py-3.5 px-4 font-bold">User ID & Identity</th>
                        <th className="py-3.5 px-4 font-bold">Account Role</th>
                        <th className="py-3.5 px-4 font-bold">Orders & Volume</th>
                        <th className="py-3.5 px-4 font-bold">Escrow Health</th>
                        <th className="py-3.5 px-4 font-bold">Risk Score & Signals</th>
                        <th className="py-3.5 px-4 font-bold">Registration / Activity</th>
                        <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">
                            No users found matching current filter parameters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr
                            key={u.id}
                            onClick={() => openInspector(u)}
                            className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                          >
                            {/* User ID & Identity */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold text-base ${u.avatarBg}`}
                                >
                                  {u.avatarChar}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-slate-900 truncate">
                                      {u.username}
                                    </span>
                                    {u.tier === "T3 Verified" && (
                                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold flex items-center gap-0.5 border border-emerald-200">
                                        <CheckCheck className="w-3 h-3" />
                                        T3 Verified
                                      </span>
                                    )}
                                    {u.status === "Suspended" && (
                                      <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[10px] font-bold">
                                        Suspended
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[12px] text-slate-500">
                                    {u.fullName} • {u.email}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                                    {u.userId}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Account Role */}
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                                  u.role === "Merchant Pro"
                                    ? "text-[var(--cobalt-acc)]"
                                    : u.role === "Flagged Seller"
                                    ? "text-rose-600"
                                    : "text-slate-800"
                                }`}>
                                  {u.role === "Merchant Pro" ? (
                                    <Store className="w-3.5 h-3.5" />
                                  ) : u.role === "Flagged Seller" ? (
                                    <Ban className="w-3.5 h-3.5" />
                                  ) : (
                                    <User className="w-3.5 h-3.5" />
                                  )}
                                  {u.role}
                                </span>
                                <span className="text-[11px] text-slate-500">{u.roleType}</span>
                              </div>
                            </td>

                            {/* Orders & Volume */}
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-xs">
                                  {u.completedOrders} Completed
                                </span>
                                <span className="text-[12px] text-slate-500">
                                  ${u.totalVolume.toLocaleString()} Total Vol.
                                </span>
                                <span className={`text-[11px] font-bold ${
                                  parseFloat(u.disputeRate) > 1 ? "text-rose-600" : "text-emerald-700"
                                }`}>
                                  {u.disputeRate} Dispute Rate
                                </span>
                              </div>
                            </td>

                            {/* Escrow Health */}
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1 text-slate-900">
                                  <span className="font-bold text-xs">{u.handoverSuccessRate}</span>
                                  {u.status === "Suspended" ? (
                                    <span className="text-rose-600 font-bold text-[11px]">(Seized)</span>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">Handover</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5 text-slate-500 text-[11px]">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span className="text-slate-900 font-bold">{u.rating}</span>
                                  <span>({u.reviewsCount} reviews)</span>
                                </div>
                              </div>
                            </td>

                            {/* Risk Score & Signals */}
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                      u.riskCategory === "Low"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : u.riskCategory === "Moderate"
                                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                                        : "bg-rose-600 text-white"
                                    }`}
                                  >
                                    {u.riskCategory} ({u.riskScore}/100)
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 mt-0.5">
                                  {u.riskDetails}
                                </span>
                              </div>
                            </td>

                            {/* Registration / Activity */}
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  {u.isOnline && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  )}
                                  <span className="font-semibold text-xs text-slate-900">
                                    {u.onlineText}
                                  </span>
                                </div>
                                <span className="text-[12px] text-slate-500">{u.location}</span>
                                <span className="text-[11px] text-slate-400">{u.registeredDate}</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 text-right">
                              <div
                                className="flex items-center justify-end gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => openInspector(u)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-[var(--cobalt-acc)] hover:text-white transition-all text-xs font-bold text-[var(--cobalt-acc)] flex items-center gap-1 cursor-pointer"
                                  type="button"
                                >
                                  <span>Inspect</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => showToast(`Options opened for ${u.username}.`)}
                                  className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                                  type="button"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination bar */}
                <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span>
                      Showing <strong>1 - {filteredUsers.length}</strong> of <strong>124,850</strong> users
                    </span>
                    <span className="text-slate-300">|</span>
                    <select className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-800 font-bold focus:outline-none cursor-pointer">
                      <option>25 per page</option>
                      <option>50 per page</option>
                      <option>100 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-xs">
                    <button
                      disabled
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-[var(--cobalt-acc)] text-white flex items-center justify-center shadow-xs">
                      1
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                      2
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                      3
                    </button>
                    <span className="px-1 text-slate-400">...</span>
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                      4,994
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Deep Dive Profile & Governance Slide-out Drawer (Modal Overlay) */}
      <div
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      >
        {selectedUser && (
          <div
            className={`w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out cursor-default overflow-y-auto ${
              drawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200/80 flex flex-col gap-4 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--cobalt-acc)] flex items-center justify-center text-white font-headline text-2xl font-bold shadow-md">
                    {selectedUser.avatarChar}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-lg text-slate-900">
                        {selectedUser.username}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                        {selectedUser.tier || "Member"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {selectedUser.fullName} • {selectedUser.email} • {selectedUser.location}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Metric Badges in Header */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col">
                  <span className="text-[11px] text-slate-500 font-semibold">Merchant Trust Score</span>
                  <span className="font-headline text-lg text-emerald-600 font-extrabold mt-0.5">
                    {100 - selectedUser.riskScore} / 100
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col">
                  <span className="text-[11px] text-slate-500 font-semibold">Settled Volume</span>
                  <span className="font-headline text-lg text-slate-900 font-extrabold mt-0.5">
                    ${selectedUser.settledVolume.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col">
                  <span className="text-[11px] text-slate-500 font-semibold">Current Escrow Balance</span>
                  <span className="font-headline text-lg text-[var(--cobalt-acc)] font-extrabold mt-0.5">
                    ${selectedUser.escrowBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1 border-t border-slate-200/60">
                <button
                  onClick={() => setActiveDrawerTab("storefront")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeDrawerTab === "storefront"
                      ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Storefront & Listings
                </button>
                <button
                  onClick={() => setActiveDrawerTab("risk")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeDrawerTab === "risk"
                      ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Risk & Security
                </button>
                <button
                  onClick={() => setActiveDrawerTab("notes")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeDrawerTab === "notes"
                      ? "bg-[var(--cobalt-acc)] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Staff Notes ({staffNotes.length})
                </button>
                <button
                  onClick={() => setActiveDrawerTab("compliance")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeDrawerTab === "compliance"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-rose-600 hover:bg-rose-50"
                  }`}
                >
                  Compliance Actions
                </button>
              </div>
            </div>

            {/* Tab 1: Storefront & Active Listings */}
            {activeDrawerTab === "storefront" && (
              <div className="p-6 flex flex-col gap-6 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-headline font-bold text-base text-slate-900">Active Inventory</span>
                    <span className="text-slate-500">
                      {selectedUser.activeListingsCount} active listings • 0 prohibited item flags
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center gap-1 border border-emerald-200">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Instant Key Dispatch Active
                  </span>
                </div>

                {/* Sample Listings */}
                <div className="flex flex-col gap-2.5">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-xs">
                          Cyberpunk 2077: Phantom Liberty (Steam Global)
                        </span>
                        <span className="text-slate-500 text-[12px]">
                          Stock: 24 keys • 342 sales • 0 disputes
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="font-headline font-extrabold text-base text-slate-900">$28.50</span>
                      <span className="text-[11px] text-emerald-600 font-bold">Instant Delivery</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-xs">
                          PlayStation Network $50 Card (US Digital Code)
                        </span>
                        <span className="text-slate-500 text-[12px]">
                          Stock: 80 codes • 1,120 sales • 1 refund
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="font-headline font-extrabold text-base text-slate-900">$46.99</span>
                      <span className="text-[11px] text-emerald-600 font-bold">Instant Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics Banner */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-[var(--cobalt-acc)]" />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-900">
                        Average Auto-Fulfillment Speed
                      </span>
                      <span className="text-[12px] text-slate-600">
                        Keys delivered in 1.4 seconds through SafeDeal API
                      </span>
                    </div>
                  </div>
                  <span className="font-headline font-extrabold text-xl text-[var(--cobalt-acc)]">99.98%</span>
                </div>
              </div>
            )}

            {/* Tab 2: Risk Signals & Security */}
            {activeDrawerTab === "risk" && (
              <div className="p-6 flex flex-col gap-6 text-xs animate-in fade-in duration-150">
                <div className="flex flex-col">
                  <span className="font-headline font-bold text-base text-slate-900">
                    Security & Device Integrity
                  </span>
                  <span className="text-slate-500">
                    Real-time fraud telemetry and KYC verification chain
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Two-Factor Authentication
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-emerald-700">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      {selectedUser.twoFactor}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Payout Method
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <Building className="w-3.5 h-3.5 text-slate-600" />
                      {selectedUser.payoutMethod}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Hardware Fingerprint
                    </span>
                    <span className="font-mono text-slate-800 text-[12px]">
                      {selectedUser.hardwareFingerprint}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Lifetime Chargebacks
                    </span>
                    <span className="font-bold text-emerald-700 text-xs">
                      {selectedUser.chargebacks} (0.00% Net Volume)
                    </span>
                  </div>
                </div>

                {/* Risk Sparkline Visual */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Risk Trajectory (Last 90 Days)
                    </span>
                    <span className="text-[12px] text-emerald-600 font-bold">
                      Consistently Low (Avg 11.4)
                    </span>
                  </div>
                  <div className="h-16 w-full flex items-end gap-2 pt-2">
                    <div className="flex-1 bg-slate-200 hover:bg-[var(--cobalt-acc)] h-4 rounded-t transition-all" />
                    <div className="flex-1 bg-slate-200 hover:bg-[var(--cobalt-acc)] h-3 rounded-t transition-all" />
                    <div className="flex-1 bg-slate-200 hover:bg-[var(--cobalt-acc)] h-6 rounded-t transition-all" />
                    <div className="flex-1 bg-slate-200 hover:bg-[var(--cobalt-acc)] h-2 rounded-t transition-all" />
                    <div className="flex-1 bg-slate-200 hover:bg-[var(--cobalt-acc)] h-4 rounded-t transition-all" />
                    <div className="flex-1 bg-slate-200 hover:bg-[var(--cobalt-acc)] h-8 rounded-t transition-all" />
                    <div className="flex-1 bg-slate-200 hover:bg-[var(--cobalt-acc)] h-3 rounded-t transition-all" />
                    <div className="flex-1 bg-[var(--cobalt-acc)] h-3 rounded-t transition-all" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Staff Notes */}
            {activeDrawerTab === "notes" && (
              <div className="p-6 flex flex-col gap-6 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-base text-slate-900">
                    Operational Audit Trail
                  </span>
                  <button
                    onClick={() => setStaffNoteModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-[var(--cobalt-acc)] font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                  >
                    + Add Staff Note
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {staffNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{note.author}</span>
                        <span className="text-[11px] text-slate-400">{note.timestamp}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-xs">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Compliance Actions */}
            {activeDrawerTab === "compliance" && (
              <div className="p-6 flex flex-col gap-6 text-xs animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-rose-800">
                      Administrative Action Console
                    </span>
                    <p className="text-[12px] text-rose-700 mt-0.5 leading-relaxed">
                      Restricting accounts directly impacts active transactions and automated escrow releases. Critical actions require audit logging.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Action 1 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-900">Restrict New Listings</span>
                      <span className="text-[12px] text-slate-500">
                        Prevents merchant from adding new catalog inventory. Current listings remain active.
                      </span>
                    </div>
                    <button
                      onClick={handleRestrictListings}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Apply Restriction
                    </button>
                  </div>

                  {/* Action 2 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-900">Freeze Escrow Payouts</span>
                      <span className="text-[12px] text-slate-500">
                        Halts ${selectedUser.escrowBalance.toLocaleString()} scheduled settlements. Requires a mandatory reason code.
                      </span>
                    </div>
                    <button
                      onClick={handleFreezeEscrow}
                      className="px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors cursor-pointer border border-amber-300"
                    >
                      Freeze Escrow
                    </button>
                  </div>

                  {/* Action 3 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-900">Issue Formal Warning</span>
                      <span className="text-[12px] text-slate-500">
                        Delivers priority dashboard notice and prompts mandatory policy re-acknowledgment.
                      </span>
                    </div>
                    <button
                      onClick={handleSendWarning}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Send Warning
                    </button>
                  </div>

                  {/* Dangerous Action 4 */}
                  <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-rose-800">
                          Suspend Account Permanently
                        </span>
                        <span className="text-[12px] text-slate-600">
                          Immediately terminates active sessions, de-lists all items, and flags associated payment instruments.
                        </span>
                      </div>
                      <button
                        onClick={() => setSuspensionModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        Initiate Suspension
                      </button>
                    </div>
                    <span className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Requires dual-signature validation from a Compliance Lead.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enforce Account Sanction & Restrictions Modal */}
      {suspensionModalOpen && selectedUser && (
        <EnforceSanctionModal
          isOpen={suspensionModalOpen}
          onClose={() => setSuspensionModalOpen(false)}
          onApplySanction={() => {
            handleConfirmSuspension();
          }}
          merchantName={selectedUser.username}
          userId={selectedUser.userId}
          riskScore={selectedUser.riskScore || 88}
          activeInventoryCount={selectedUser.activeListingsCount}
          inFlightEscrowCount={3}
          inFlightEscrowAmount={234.5}
          clearedBalanceAmount={selectedUser.escrowBalance || 1450.0}
        />
      )}

      {/* Invite Merchant Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[var(--cobalt-acc)]" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Invite Verified Merchant
                </h3>
              </div>
              <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Generate an expedited KYC onboarding pass for institutional distributors and digital goods merchants.
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Merchant Business Email</label>
                <input
                  type="email"
                  placeholder="contact@distributor.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Initial Verification Tier</label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none">
                  <option>Tier 2 ($50,000 monthly volume)</option>
                  <option>Tier 3 ($250,000 monthly volume)</option>
                  <option>Tier 4 Enterprise VIP (Unlimited API Handover)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setInviteModalOpen(false);
                  showToast("Expedited onboarding pass sent via encrypted dispatch.");
                }}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 shadow-xs"
              >
                Send Onboarding Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Note Modal */}
      {staffNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--cobalt-acc)]" />
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Log Operational Compliance Note
                </h3>
              </div>
              <button onClick={() => setStaffNoteModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              value={newStaffNote}
              onChange={(e) => setNewStaffNote(e.target.value)}
              placeholder="Enter internal compliance notes, KYC findings, or risk signals..."
              className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStaffNoteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaffNote}
                className="px-4 py-2 rounded-lg bg-[var(--cobalt-acc)] text-white font-bold text-xs hover:bg-blue-700 shadow-xs"
              >
                Save Audit Note
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
