# SafeDeal Ops Back Office — Enforce Account Sanction & Restrictions Architecture

## Context & Purpose
When merchant accounts exhibit critical fraud indicators, chargeback velocity, or account reclaim patterns, SafeDeal Compliance and Risk Officers execute account sanctions through the **Enforce Account Sanction & Restrictions** workflow.

## Key Functional Capabilities
1. **Critical Incident Telemetry**:
   - Captures real-time triggers (e.g. 3 consecutive chargeback disputes within 48h, Tor exit node IP login tokens `tok_991b_tor`).
   - Displays real-time risk rating with animated status pills (e.g., Risk Score 88/100 Critical).
2. **Tri-Tier Severity Selection**:
   - **Level 1 (Listing Restrictions Only)**: Soft restriction pausing active listings while keeping sales & payout channels operational for manual identity verification.
   - **Level 2 (Escrow & Payout Freeze)**: 14-day reserve lock allowing in-flight deliveries to complete while freezing cleared withdrawal balances.
   - **Level 3 (Full Account Suspension & Blacklist)**: High impact permanent ban, store URL revocation, escrow seizure, hardware HWID blacklisting, and payment instrument flagging.
3. **Financial & Order Impact Assessment**:
   - Real-time impact telemetry: Active inventory delisted (14), in-flight escrows routed to buyer review (3 / $234.50), and cleared balance frozen in Stripe reserve ($1,450.00).
4. **Compliance Codification & Ops Logging**:
   - Standardized compliance reason codes:
     - `A-4`: Prohibited Goods / Account Reclaim Fraud
     - `A-1`: Stolen Payment Instruments / Carding
     - `A-2`: Invalid or Duplicate Digital CD-Keys
     - `A-9`: Hardware Spoofing / Anti-Circumvention
     - `M-0`: Operational Compliance Review (Manual Override)
   - Mandatory internal investigation notes logged confidentially to compliance audit trail.
   - Dual notification dispatch switches for automated merchant appeal guides and active buyer escrow alerts.
5. **Appeals & Discovery Legal Safeguard**:
   - Transparent legal disclosure regarding 14-day calendar appeal window via `arbitration.safedeal.com`.

## Implemented Components & Routes
- **Component**: [`src/components/admin/EnforceSanctionModal.tsx`](file:///d:/FOR%20RENDO%20%28ONLY%20%29/Personal%20Project/EscrowSocial/src/components/admin/EnforceSanctionModal.tsx)
- **Dedicated Ops Route**: [`src/app/ops/users/sanctions/page.tsx`](file:///d:/FOR%20RENDO%20%28ONLY%20%29/Personal%20Project/EscrowSocial/src/app/ops/users/sanctions/page.tsx)
- **Shortcut Route**: [`src/app/sanctions/page.tsx`](file:///d:/FOR%20RENDO%20%28ONLY%20%29/Personal%20Project/EscrowSocial/src/app/sanctions/page.tsx) -> redirects to `/ops/users/sanctions`
- **Admin Users Integration**: [`src/app/admin/users/page.tsx`](file:///d:/FOR%20RENDO%20%28ONLY%20%29/Personal%20Project/EscrowSocial/src/app/admin/users/page.tsx)
