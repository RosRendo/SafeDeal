import { NextRequest, NextResponse } from "next/server";
import { db, ensureHydrated } from "@/lib/server/db";
import { markOrder } from "@/lib/server/persist";
import {
  captureEscrowHold,
  cancelEscrowHold,
  refundEscrowHold,
} from "@/lib/server/payments";
import {
  getAuthContext,
  unauthorized,
  forbidden,
  notFound,
  userOwnsOrder,
} from "@/lib/server/session";

// GET /api/orders/[id] â€” participant or admin only.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await ensureHydrated();
  const ctx = await getAuthContext(req);
  if (!ctx) return unauthorized("Sign in to view this order.");

  const { id } = await context.params;
  const order = db.orders.findById(id);

  if (!order) return notFound("Order not found");
  if (!userOwnsOrder(ctx, order)) return forbidden("This order belongs to a different account.");

  return NextResponse.json({
    success: true,
    data: order,
  });
}

// PATCH /api/orders/[id] â€” escrow transitions with server-enforced roles:
//   release   â†’ buyer of record (or admin)  â†’ captures the Stripe hold
//   dispute   â†’ buyer or seller of record (or admin) â†’ hold stays frozen
//   warranty  â†’ buyer of record (or admin)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await ensureHydrated();
  const ctx = await getAuthContext(req);
  if (!ctx) return unauthorized("Sign in to manage this order.");

  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  const notes = body?.notes as string | undefined;
  const action = body?.action as string | undefined;

  if (!action || !["release", "dispute", "warranty", "refund"].includes(action)) {
    return NextResponse.json(
      { success: false, error: "action must be one of: release, dispute, warranty, refund." },
      { status: 400 }
    );
  }

  const order = db.orders.findById(id);
  if (!order) return notFound("Order not found");
  if (!userOwnsOrder(ctx, order)) return forbidden("This order belongs to a different account.");

  // Refund and full release after arbitration are admin moves, or a mutual
  // early cancel by the buyer while nothing was delivered yet.
  if (action === "refund") {
    if (ctx.role !== "admin") {
      return forbidden("Refunds after inspection are decided by an escrow officer.");
    }
  } else if (action === "dispute") {
    if (!userOwnsOrder(ctx, order)) {
      return forbidden("Only the buyer or seller of this order can open a dispute.");
    }
  } else {
    // release / warranty: buyer of record or admin
    const isBuyer = order.buyerEmail && ctx.email.toLowerCase() === order.buyerEmail.toLowerCase();
    if (!isBuyer && ctx.role !== "admin") {
      return forbidden("Only the buyer can release or confirm escrow.");
    }
  }

  const lower = (notes || "").toLowerCase();
  const wantsRefund =
    action === "refund" || lower.includes("refund") || lower.includes("100% back to buyer");
  const wantsSplit = lower.includes("split") || lower.includes("50/50");

  let targetStatus: "active" | "delivered" | "warranty" | "disputed" = "delivered";
  if (action === "dispute") targetStatus = "disputed";
  else if (action === "warranty") targetStatus = "warranty";
  else if (action === "refund" || wantsRefund) targetStatus = "active";

  if (action !== "dispute" && order.status === "disputed") {
    // Arbitration outcomes land here: refund â†’ release funds back, else deliver.
    targetStatus = wantsRefund ? "active" : "delivered";
  }

  const settlementNote =
    wantsRefund
      ? notes || "Escrow officer refunded the full hold to the buyer."
      : wantsSplit
      ? notes || "Escrow officer split the settlement 50/50."
      : action === "dispute"
      ? notes || undefined
      : notes;

  const updated =
    targetStatus === "disputed"
      ? db.orders.updateStatus(id, "disputed", settlementNote)
      : targetStatus === "warranty"
      ? db.orders.updateStatus(id, "warranty", "6-month warranty activated")
      : db.orders.updateStatus(
          id,
          "delivered",
          settlementNote,
          wantsRefund ? "Escrow Refunded to Buyer" : undefined
        );

  if (!updated) return notFound("Order not found for status update");

  // Payment side-effects follow the ledger outcome
  const payment = order.payment;
  if (payment) {
    try {
      let next = payment;
      if (wantsRefund && targetStatus !== "disputed") {
        next = payment.status === "captured" ? await refundEscrowHold(payment) : await cancelEscrowHold(payment);
      } else if (wantsSplit) {
        next = await refundEscrowHold(payment, payment.amount * 0.5);
      } else if (targetStatus === "delivered") {
        next = await captureEscrowHold(payment);
      }
      if (next !== payment) {
        updated.payment = next;
        markOrder(updated.id);
      }
    } catch (error) {
      console.warn("[Payments] settlement action failed:", error);
      // The escrow ledger records the attempted state â€” disputes route here.
    }
  }

  return NextResponse.json({
    success: true,
    message: `Order status transitioned to ${updated.status}`,
    data: updated,
  });
}

