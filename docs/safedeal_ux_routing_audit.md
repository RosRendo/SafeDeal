# Safedeal — Marketplace UX, Category & Routing Audit Report

## Architectural Overview & Decisions

### 1. Unified Information Architecture (Canonical Flow)
- **Discovery**: Landing (`/`) -> Header Categories -> Global Search -> Catalog (`/browse?cat=[slug]`)
- **Product Inspection**: Dynamic Product Detail (`/listing/[id]`) with dynamic category breadcrumb and dynamic merchant storefront link (`/store/[seller-slug]`)
- **Escrow Checkout**: `/checkout?item=[id]` dynamically binds item, price, seller, and fee calculations -> redirects to `/orders/ESC-[id]`
- **48-Hour Escrow Inspection**: `/orders/[orderId]` dynamically resolves product data, seller credentials, inspection checklist, and binds parameters to dispute, release, and vault modals
- **Escrow Actions**:
  - `/orders/[orderId]/release`: Order confirmation and funds release
  - `/orders/[orderId]/dispute`: Dispute mediation ticket filing
  - `/orders/[orderId]/vault`: Asset handover and credential verification

### 2. Category Routing Standard
- Replaced fragmented parameters (`?category=`, `?cat=`, `?tab=`) with single canonical parameter:
  `?cat=all | accounts | currency | keys | social | software | gift-cards`
- Added Next.js server redirects in `next.config.ts`:
  - `/accounts` -> `/browse?cat=accounts`
  - `/currency` -> `/browse?cat=currency`
  - `/keys` -> `/browse?cat=keys`
  - `/gift-cards` -> `/browse?cat=gift-cards`
  - `/software` -> `/browse?cat=software`
  - `/social` -> `/browse?cat=social`

### 3. Catalog Data Unification
- Updated `src/lib/allProducts.ts`:
  - Central resolver `getProductById()` now exports `ALL_CATALOG_LISTINGS`, which incorporates all items from Accounts, Keys, Currency, Gift Cards, Software, and Social listings.
  - Eliminated previous 404s on keys (`key-1`) and currency (`curr-1`).

### 4. Route Sanitization & Decoupling
- Eliminated hardcoded redirects to dummy mock IDs (`SF-94821`, `SF-2024-88492`).
- Fixed broken links:
  - `/dashboard` -> `/orders`
  - `/docs` -> `/help`
  - `/browse?tab=categories` -> `/browse?cat=all`
  - `orders/SF-2024-88492/dispute` -> `/protection`
