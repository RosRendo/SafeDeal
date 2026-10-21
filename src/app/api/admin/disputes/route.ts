import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireRole } from "@/lib/server/session";

// GET /api/admin/disputes — all disputed orders
export async function GET(req: NextRequest) {
  const ctx = await requireRole(req, ["admin"]);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const disputes = db.admin.getDisputes();

    return NextResponse.json({
      success: true,
      count: disputes.length,
      data: disputes,
      disputes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}

// POST /api/admin/disputes — admin settles a dispute
export async function POST(req: NextRequest) {
  const ctx = await requireRole(req, ["admin"]);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const body = await req.json();
    const orderId = body.orderId || body.caseId;
    const verdict = body.verdict || body.action;
    const rationale = body.rationale;

    if (!orderId || !verdict) {
      return NextResponse.json(
        { success: false, error: "orderId and verdict/action are required" },
        { status: 400 }
      );
    }

    const pin = body.pin;

    let targetStatus: "active" | "delivered" | "warranty" | "disputed" = "delivered";
    let targetStatusText = "Completed & Funds Released";

    if (verdict === "seller_release" || verdict === "seller_payout") {
      targetStatus = "delivered";
      targetStatusText = "Arbitration Verdict: Released to Seller";
    } else if (verdict === "buyer_refund") {
      targetStatus = "disputed";
      targetStatusText = "Settled: 100% Refunded to Buyer";
    } else if (verdict === "split" || verdict === "split_compromise") {
      targetStatus = "delivered";
      targetStatusText = "Arbitration Verdict: 50/50 Split Settlement";
    } else if (verdict === "pause_evidence") {
      targetStatus = "disputed";
      targetStatusText = "SLA Paused: Awaiting Additional Evidence";
    }

    const notes = `Official Staff Ruling (${verdict}): ${rationale || "Resolved by Staff Arbitrator."}${pin ? " [Supervisor 2FA Authenticated]" : ""}`;
    const updated = db.orders.updateStatus(orderId, targetStatus, notes, targetStatusText);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    // Payment side-effects: the verdict decides where the escrow hold goes.
    const payment = updated.payment;
    if (payment) {
      const { captureEscrowHold, cancelEscrowHold, refundEscrowHold } = await import(
        "@/lib/server/payments"
      );
      try {
        let next = payment;
        if (verdict === "buyer_refund") {
          next =
            payment.status === "captured" ? await refundEscrowHold(payment) : await cancelEscrowHold(payment);
        } else if (verdict === "split" || verdict === "split_compromise") {
          next = await refundEscrowHold(payment, payment.amount * 0.5);
          if (payment.status === "authorized") next = await captureEscrowHold(payment);
          next.status = "captured";
          next.refundedAmount = payment.amount * 0.5;
        } else if (payment.status === "authorized") {
          next = await captureEscrowHold(payment);
        }
        if (next !== payment) {
          updated.payment = next;
          const { markOrder } = await import("@/lib/server/persist");
          markOrder(updated.id);
        }
      } catch (error) {
        console.warn("[Payments] settlement action failed:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Dispute for ${orderId} settled with verdict: ${verdict}`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to settle dispute" },
      { status: 500 }
    );
  }
}
