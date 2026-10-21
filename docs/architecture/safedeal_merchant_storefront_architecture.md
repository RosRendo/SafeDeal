# Safedeal Architecture: Merchant Storefront & Verified Seller Profile System

**System**: Safedeal Escrow Digital Goods Marketplace  
**Date**: October 2026  
**Module**: Public Merchant Storefront & Verified Seller Identity (`/store/[slug]`)

---

## 1. Overview & Purpose
The **Merchant Storefront & Verified Seller Profile** provides public trust, transparent metrics, and interactive catalog browsing for verified merchants (Tier-1 to Tier-3). It bridges the gap between merchant back-office management (`/sell`, `/seller`) and buyer inspection/checkout flows (`/orders`, `/checkout`).

### Flagship Merchant
- **Storefront URL**: `/store/aerogamingdeals` (and alias route `/store`)
- **Seller Identity**: `AeroGamingDeals` (Level 3 Top Merchant, 4+ Years on Platform, 4,120+ completed deals, 99.8% handover SLA, 4.98 rating).

---

## 2. Key Architecture & UI Components

### 2.1 Double-Height Top Navigation
- Tier 1: Brand logo with link to `/`, omnisearch bar with category selector dropdown, `Sell` CTA button, escrow orders badge (`2`), and encrypted messages badge (`1`).
- Tier 2: Category pill navigation with instant filtering for Gaming Accounts, In-Game Currency, Game Keys & CDNs, Social Media Assets, Software Licenses, and Gift Cards.

### 2.2 Cyber Geometric Hero Banner
- Deep container (`bg-[#131b2e]`) with SVG geometric grid pattern overlay.
- Dual glowing gradient cyber orbs (`#0051d5` blur-3xl and `#4edea3` blur-3xl).
- Tier-1 Premier Merchant Partner pill badge with shield icon.
- Interactive CTA toolbar:
  - **Contact Seller**: Opens an encrypted real-time chat modal with instant dispatch support bot simulation.
  - **Favorite Storefront**: Interactive toggle with dynamic count update and toast notification.
  - **Share Storefront**: Copies canonical store URL to clipboard with confirmation toast.
  - **Report Storefront**: Compliance dialog for suspected fraud, off-platform dealing, or misleading descriptions.

### 2.3 Storefront Identity Card & Micro-Bento Bar (`-mt-16`)
- Floating profile lockup with `AG` monogram, KYC verified checkmark badge, and live "Online & Dispatching Now" pulse indicator.
- 4-Column Micro-Bento quantitative performance indicators:
  1. **Completed Deals**: `4,120+` (100% digital goods)
  2. **Avg. Delivery Speed**: `4m 12s` (Top 3% fastest seller)
  3. **Dispute Ratio**: `0.12%` (Benchmark vs 1.8% marketplace average)
  4. **Escrow Guarantee**: `48 Hours` (Inspection safeguard SLA)

### 2.4 Product Catalog Engine
- **Filter Tabs**: All Listings, Gaming Accounts, Keys & Gift Cards, Currencies, Buyer Reviews (`#reviews`), Store Policies (`#policies`).
- **Live Search & Sort**: Real-time title/platform/tag matching, sorting by Best Selling, Price (Asc/Desc).
- **View Modes**: Grid View (4-column responsive) and List View (horizontal detailed rows).
- **Quick Buy & Escrow Protection Modal**:
  - Detailed escrow pricing breakdown with $0 escrow surcharge covered by seller fee.
  - Multi-payment support: Safedeal Balance ($480.00), Credit/Debit Card/Apple Pay, USDC/Crypto.
  - Simulates instant order creation with redirection to the 48-hour inspection hub (`/orders/ESC-94821`).

### 2.5 Buyer Feedback & Store Policies Accordion
- **Verified Buyer Reviews**: 4.98 / 5.0 score with authentic 48h-inspection verified testimonials and interactive "Add Review" modal.
- **Fulfillment SLA Policies**: Expandable accordion detailing Automated Vault API delivery, 48-hour inspection clock safeguards, and 6-Month Pull-Back / Recovery Warranty backed by merchant bonds.

---

## 3. Route Map
| Route | Component | Purpose |
|---|---|---|
| `/store/[slug]` | `src/app/store/[slug]/page.tsx` | Dynamic merchant storefront page (AeroGamingDeals default) |
| `/store` | `src/app/store/page.tsx` | Index route redirecting to `/store/aerogamingdeals` |
| `/sell` | `src/app/sell/page.tsx` | Linked via "View Public Storefront" action button |
| `/orders/[orderId]` | `src/app/orders/[orderId]/page.tsx` | Linked via seller avatar & name lockup |
| `/orders` | `src/app/orders/page.tsx` | Linked via seller credit tag on order cards |
