# Safedeal Digital Asset Handover & Access Credentials Vault Architecture

## Context & Purpose
The Safedeal Digital Asset Vault acts as the final and most critical security phase of the escrow transaction workflow. When purchasing digital game accounts, licenses, or keys, buyers require absolute confidence that:
1. Credentials are encrypted and securely decrypted in their private session.
2. The original creation email (OGE) and account recovery tokens are transferred.
3. 2FA phone numbers, HWID locks, and active sessions are verified as unlinked.
4. An interactive protocol prevents premature release of funds until the buyer has verified and rebound the account.

## Component Hierarchy & Implementation
1. **`AssetVaultModal.tsx` (`src/components/orders/AssetVaultModal.tsx`)**:
   - Reusable client-side modal dialog implementing AES-256 decrypted vault presentation.
   - Interactive features:
     - 60s clipboard auto-expiration feedback.
     - Toggle visibility for both Game Account and OGE passwords.
     - Interactive 4-step Buyer Handover Protocol with dynamic completion pill (`X of 4 Completed`).
     - Simulation of offline PDF backup generation.
     - Live countdown timer for the 48-hour inspection period.
2. **Dedicated Route: `/orders/[orderId]/vault` (`src/app/orders/[orderId]/vault/page.tsx`)**:
   - Renders the dimmed and blurred underlying inspection viewport featuring order metadata, Immortal 3 Valorant account asset preview, and $5,000 seller security bond card.
   - Auto-mounts the modal backdrop with support for dismissing to reveal the full order inspection viewport.
3. **Shortcut Redirect: `/vault` (`src/app/vault/page.tsx`)**:
   - Direct alias redirecting to `/orders/SF-2024-88492/vault`.
4. **Order Detail Integration (`src/app/orders/[orderId]/page.tsx`)**:
   - "Decrypt & Reveal Credentials" button seamlessly launches the modal without leaving the inspection console.
5. **Messenger Integration (`src/app/messages/page.tsx`)**:
   - Chat attachment "Digital Vault Handover Ready" and right sidebar "Inspect Vault Credentials" open the exact same high-security modal.

## UX Security Guardrails
- **Clipboard Safety**: Copy actions show immediate feedback and advise users that values auto-clear after 60s.
- **Checklist Enforcement**: The "I Have Saved & Verified" confirmation prompts users if any of the 4 security protocol steps remain unverified.
- **Dispute Access**: Users can seamlessly pivot from the vault to the Escrow Dispute modal if credentials fail validation during the inspection window.
