# Safedeal Architecture: Escrow Dispute Protocol & Emergency Freeze Modal

**System**: Safedeal Escrow Digital Goods Marketplace  
**Date**: October 2026  
**Module**: Escrow Dispute & Funds Freeze Modal (`/orders/[orderId]/dispute`, `/dispute`, and modal inside `/orders/[orderId]`)

---

## 1. Overview & Purpose
The **Escrow Dispute & Funds Freeze Protocol** gives buyers guaranteed recourse when a seller's delivered digital credentials fail verification during the 48-hour inspection window. Filing a dispute halts the countdown timer, freezes seller disbursement in the smart escrow vault, and summons a live Safedeal Concierge Arbitrator.

---

## 2. 4-Step Incident Filing Workflow

### 2.1 Visual Risk & Emergency Framing
- **Risk Gradient Indicator**: Urgent amber/red top pulse (`from-rose-600 via-[#0051d5] to-rose-600`).
- **Emergency Protocol Badges**: `Emergency Freeze Protocol` + `Tier-1 Escrow Vault`.
- **Order Scope Snapshot**: Order ID (`#SF-2024-88492`), Seller (`AeroGamingDeals`), Escrow Value (`$195.00 USD`).
- **Immediate Legal Freeze Banner**: Explicitly informs the user that submitting immediately pauses the 48-hour inspection clock and freezes seller payout until resolved by arbitration.

### 2.2 Step 1: Primary Dispute Reason
Interactive radio cards providing instant classification:
1. **Credentials Invalid / Incorrect Password** (`Common` badge): Authentication failure on official client upon receipt.
2. **2FA Mobile Authenticator Still Bound**: Cannot transfer email/phone without seller security prompt.
3. **OGE (Original Email) Inaccessible or Recovered**: First creation email mailbox inaccessible or recovery initiated.
4. **Item Not as Described / Missing Inventory**: Missing advertised skins, competitive cooldown, or rank discrepancy.
5. **Other Issue / Suspicious Account Activity**: Concurrent sign-ins or safety flags.

### 2.3 Step 2: Factual Incident Statement
- **Live Character Validator**: Real-time length counter dynamically validating minimum requirement (`142 / 50 min characters met`).
- **Structured Error Guidance**: Guidance reminding buyers to include exact client error codes and timestamps for faster arbitration SLA. Markdown supported.

### 2.4 Step 3: Cryptographic Evidence Upload
- **SHA-256 Anti-Tamper Verification**: Watermarked with cryptographic session hash `#SF-88492-DISPUTE`.
- **Drag & Drop Canvas**: Accepts PNG, JPG, MP4 up to 50MB with "Choose Images" and "Attach Video" triggers.
- **Uploaded Evidence Chips**:
  - `riot_invalid_password_error.png` (Verified Capture, 1.4 MB • Hash: e3b0c442...98fc).
  - `client_auth_failed_log.txt` (Plaintext Diagnostic, 24 KB • UTF-8 Encoded).

### 2.5 Step 4: Legal Escrow Affirmations
- Affirmation 1: Confirms attempted contact with seller via Safedeal Messages.
- Affirmation 2: Acknowledges fraud penalties, account termination, and KYC forfeiture for bad-faith claims.

### 2.6 Modal Actions & SLA Guarantees
- **Action Buttons**: "Cancel & Return to Order" and "Pause Timer & Submit Formal Dispute" (with animated loading spinner).
- **Arbitration SLA**: Human arbitrator assigned within **15 minutes**.
- **Case Tracking**: Escrow Case ID: `#DIS-88492-A`, PCI-DSS secured.

---

## 3. Route Map
| Route | Component | Purpose |
|---|---|---|
| `/orders/[orderId]` | `src/app/orders/[orderId]/page.tsx` | Main inspection room with triggerable dispute modal |
| `/orders/[orderId]/dispute` | `src/app/orders/[orderId]/dispute/page.tsx` | Order inspection room with dispute modal open in active stage |
| `/dispute` | `src/app/dispute/page.tsx` | Canonical redirect to `/orders/SF-2024-88492/dispute` |
| Component | `src/components/orders/EscrowDisputeModal.tsx` | Modular 4-step dispute modal component |
