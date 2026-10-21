# Safedeal Architecture: Unified Messenger & Order Inbox System

**System**: Safedeal Escrow Digital Goods Marketplace  
**Date**: October 2026  
**Module**: Unified Messenger & Order Inbox (`/messages`, `/inbox`)

---

## 1. Overview & Purpose
The **Messages & Order Inbox** provides an end-to-end encrypted (E2EE) communication channel between buyers, verified sellers, and Safedeal Concierge Staff Arbitrators. It is deeply integrated with the 48-hour escrow inspection lifecycle, providing real-time telemetry, credential vault inspection, dispute controls, and milestone tracking directly within the chat workspace.

---

## 2. 3-Column Split Unified Architecture

### 2.1 Column 1: Conversation List (`lg:col-span-4 xl:col-span-3`)
- **Header & Search**: Unread counter (`Unread (1)`), search input filtering threads by merchant, order #, or item title.
- **Filter Tabs**: `All (4)`, `Active Orders (2)`, `Archived (2)`.
- **4 Real-Time Threads**:
  1. **AeroGamingDeals**: Active inspection SLA (`#SF-2024-88492`, Valorant Immortal 3, $195.00, 1 unread message).
  2. **KeyMaster_Direct**: Archived completed order (`#SF-2024-88519`, Cyberpunk 2077 Key, $26.80).
  3. **Safedeal Concierge**: Active Staff Arbitration case (`DSP-1092`, Evidence Review).
  4. **ApexHoldings**: Archived completed order (`#SF-2024-87994`, Elden Ring Steam, $42.00).

### 2.2 Column 2: Active Chat Workspace (`lg:col-span-8 xl:col-span-6`)
- **Chat Header**:
  - Merchant status: Online with pulsing green dot, rating badge (`★ 4.98`), merchant level (`Lvl 3 Merchant`), typical reply speed.
  - Action buttons: Quick link to Order Details (`/orders/[orderId]`), Mute Notifications toggle, Report User / Dispute flag.
- **Security Banners**:
  - Dismissable 48-Hour Buyer Protection sticky banner warning against off-platform dealing.
- **Chat Feed**:
  - System event bubbles (`Payment Held in Escrow`, `Digital Vault Handover Ready`).
  - Interactive Vault Preview card with "Open Secure Vault" CTA.
  - Buyer message bubbles (`bg-[#131b2e] text-white`) with delivered status.
  - Seller message bubbles (`bg-white text-slate-900`) with timestamps and seller role tags.
- **Real-Time Input Area**:
  - 4 Quick reply prompt tags ("Confirming delivery...", "Need password help", "Everything looks great!", "Request OGE verification code").
  - Form bar with attachment trigger, text input (Enter to send, Shift+Enter for new line), emoji helper, and send action.
  - Real-time simulated automated bot replies with credential and escrow guidance.

### 2.3 Column 3: Persistent Order Context Sidebar (`lg:col-span-12 xl:col-span-3`)
- **Linked Order Snapshot**: Order ID, price, escrow lock badge, product thumbnail.
- **Inspection Countdown Timer**: Dynamic ticking countdown (`37h 12m 45s`) reflecting the active inspection SLA.
- **5-Step Mini Stepper Timeline**:
  1. Order Placed & Registered (Completed)
  2. Escrow Funds Deposited (Completed)
  3. Encrypted Vault Delivery (Completed)
  4. Buyer Inspection (In Progress / Verified)
  5. Seller Payout Released (Pending / Done)
- **Verified Security Checkpoints**:
  - OGE Creation Email: ProtonMail
  - 2FA Mobile Unbound: Verified Yes
  - HWID Ban Status: Clean Passed
- **Order Action Toolbar**:
  - **Inspect Vault Credentials**: Modal revealing Username, Password, Original Email (OGE), Recovery PIN, and Vault Token with one-click copy buttons and reveal/hide password toggles.
  - **Confirm & Complete Order**: Modal allowing buyer to disburse funds to seller, updating order state to Completed and advancing the timeline to step 5.
  - **Open Escrow Dispute**: Modal pausing the escrow clock and summoning a Safedeal Arbitrator with evidence notes.
- **Seller Mini Trust Card**: Profile summary, orders handled count (`1,482`), and average transfer speed (`4 mins`).

---

## 3. Route Map
| Route | Component | Purpose |
|---|---|---|
| `/messages` | `src/app/messages/page.tsx` | Main 3-column unified messenger & order inbox |
| `/inbox` | `src/app/inbox/page.tsx` | Canonical redirect (HTTP 307) to `/messages` |
| `/orders` | `src/app/orders/page.tsx` | Header messages icon links to `/messages` |
| `/store/[slug]` | `src/app/store/[slug]/page.tsx` | Header messages icon links to `/messages` |
| `/orders/[orderId]` | `src/app/orders/[orderId]/page.tsx` | Deep linked from chat header "Order Details" |
