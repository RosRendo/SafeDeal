# Safedeal — Production Deploy Checklist

Updated 2026-10-21 for the production-hardening pass: durable PostgreSQL
persistence, server-side sessions and route authorization, and real Stripe
escrow rails with a simulated fallback.

## 1. What changed in the hardening pass

| Area | Before | Now |
| --- | --- | --- |
| Auth | Client-only localStorage demo personas | Strict email+password (`scrypt` hashes in `User` table), HttpOnly session cookie `sd_session` backed by a `Session` row |
| Authorization | Any API route open to the internet | Every admin/seller route requires a session; ownership enforced per order/listing/thread/message; buyer identity always taken from the session |
| Persistence | In-memory per server instance | Postgres via Prisma: `User`, `Listing`, `Order`, `Payout`, `Thread`, plus `Session`, `OrderRecord` (full order JSON) and `BundleRecord` (listings/threads/reviews/payouts bundles). Hydrate-on-start + write-behind flush (~400 ms coalesce) |
| Payments | Simulated everywhere | `/api/orders` POST authorizes a Stripe manual-capture PaymentIntent (escrow hold); order PATCH + admin dispute verdict capture / refund / cancel it. Without `STRIPE_SECRET_KEY` exactly the same ledger runs in simulated mode (`sim_pi_*` refs) |
| Fake success paths | Client fabricated orders/messages/payout fallbacks | Removed — failed server calls now surface honest errors |

## 2. Environment variables

| Var | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string. Local run: in `.env`. Host: Neon / Supabase / RDS, etc. |
| `SESSION_SECRET` | Prod: yes | Random 32+ byte string; bad HMAC signatures invalidate their tokens. Dev falls back to a fixed dev secret. Rotate by resetting sessions |
| `STRIPE_SECRET_KEY` | For live payments | Without it the app runs the identical ledger in simulated mode |
| `STRIPE_WEBHOOK_SECRET` | For live payments | Signs `/api/webhooks/stripe`; if unset: dev returns 202 (ignored), **prod returns 503** |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL for metadata/OG |

Local `.env` example (already present in dev):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/safedeal
SESSION_SECRET=<random string>
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

## 3. Demo credentials (dev/demo installs)

All three seed accounts share the password `demo1234`:

| Role | Name | Email |
| --- | --- | --- |
| Buyer | Alex Mercer | `alex.mercer@gmail.com` |
| Seller | AeroGamingDeals | `aero@safedeal.com` |
| Admin | Sarah Lin | `admin@safedeal.com` |

Never reuse these in a real launch — create fresh accounts (the login modal
supports buyer/seller signup), and change or remove the seeded demo set.

## 4. Data model & scaling limits (know these)

- Store state is hydrated once per server instance from Postgres, then every
  mutation is written behind with a coalesced flush. **Single-node safe**:
  a serverless/cold-start host (Vercel) creates one instance per isolate, so
  concurrent isolates can briefly serve divergent in-memory state for reads.
  Production money-moves (escrow state changes) are written through
  immediately on demand (`flushNow`); for multi-instance scale move the whole
  store to Prisma queries or introduce a single-region durable store.
- `GET /api/seed` auto-seeds on an empty database (dev or admin only in
  prod); `POST /api/seed` is a full reset — dev or admin only.

## 5. What you must do (user-only steps)

1. **Host** — create the project on Vercel, connect the repo, `main` deploys.
2. **Env vars** — set the five variables from §2 in project settings.
3. **Stripe** — configure a webhook endpoint pointing at
   `https://yourdomain.com/api/webhooks/stripe` with events
   `payment_intent.succeeded`, `payment_intent.canceled`,
   `payment_intent.amount_capturable_updated`, `charge.refunded`.
4. **Domain DNS** (your registrar):
   | record | name | value |
   | --- | --- | --- |
   | A | @ | Vercel apex IP (from domain settings) |
   | CNAME | www | `cname.vercel-dns.com` |
5. **After first deploy** — visit `/` then sign in once; the dataset
   bootstrap runs on the first API miss (or hit `/api/seed` once).
6. **Watch** — uptime check on `/` and `/api/seed`; error tracking.
7. **Core flow on live site** — sign up → checkout (`POST /api/orders`, escrow
   hold authorized) → deliver as seller → release as buyer (hold captured) —
   run once in Stripe test mode, then once live.

## 6. Verification commands (local, any time)

```powershell
npm run lint
npm run build
# dev server up, then:
node C:\Users\ROSREN~1\AppData\Local\Temp\opencode\route-probe.mjs http://localhost:3000/
node C:\Users\ROSREN~1\AppData\Local\Temp\opencode\shot-authed.mjs http://localhost:3000/seller out.png
```

Auth probes must now log in first (session cookie): post to
`/api/auth/login` with the demo credentials and mirror the `Set-Cookie`.
