# EscrowDeal 🛡️

A production-grade escrow marketplace for high-value digital assets, social media accounts, domain names, and digital contracts.

Built with Next.js 16 (Turbopack + Partial Prerendering), Tailwind CSS v4, Prisma ORM (PostgreSQL), and Stripe Escrow rails.

---

## ⚡ Core Features

- **Automated Escrow Hold & Release**: Funds are authorized and held in escrow (`manual_capture` or simulated) until buyer confirms asset delivery.
- **Role-Based Workflows**: Buyer, Seller, and Admin dashboards with granular permissions and audit logging.
- **Dispute Resolution Protocol**: Multi-stage dispute handling, evidence submission, and admin-mediated settlement (refund / partial split / release).
- **Hardened Server Authentication**: Scrypt password hashing with HttpOnly session cookies (`sd_session`) and CSRF protection.
- **Real-Time Activity & Webhooks**: Webhook event processing for Stripe payment intents, dispute state transitions, and delivery notifications.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design System
- **Database**: PostgreSQL with Prisma ORM
- **Animations & UX**: Motion (Framer Motion v14) & Lenis smooth scroll
- **Payments**: Stripe API (Manual Capture Escrow & Webhook listener) / Simulation fallback

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/ROS-RENDO/EscrowDeal.git
cd EscrowDeal
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/safedeal"
SESSION_SECRET="your-32-character-secret-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

See [deploy.md](deploy.md) for the complete production checklist (Vercel, Railway, Neon/Supabase PostgreSQL, and Stripe webhook configuration).
