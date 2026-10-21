import { NextRequest, NextResponse } from "next/server";
import { db, ensureHydrated } from "@/lib/server/db";
import { markOrder, flushNow } from "@/lib/server/persist";
import { verifyStripeSignature } from "@/lib/server/payments";
import type { OrderPayment } from "@/lib/server/seedData";

// Stripe webhook: keep the escrow ledger in sync with payment lifecycle
// events (authorization, capture, refunds, cancellation). The escrow flows
// themselves are driven server-side; this endpoint is reconciliation.
export async function POST(req: NextRequest) {
  await ensureHydrated();

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    const status = process.env.NODE_ENV === "production" ? 503 : 202;
    return NextResponse.json(
      {
        success: false,
        skipped: true,
        error: "STRIPE_WEBHOOK_SECRET is not configured; webhook ignored.",
      },
      { status }
    );
  }

  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!verifyStripeSignature(raw, signature)) {
    return NextResponse.json(
      { success: false, error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  let event: {
    type?: string;
    data?: { object?: Record<string, unknown> };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const type = event.type || "";
  const object = (event.data?.object ?? {}) as {
    id?: string;
    metadata?: Record<string, string>;
    last_refund_details?: { amount_refunded?: number };
  };

  // Only escrow orders (those we created) carry our metadata tag.
  const orderId: string | undefined = object.metadata?.order_id;
  if (!orderId) {
    return NextResponse.json({ success: true, ignored: "no order_id metadata", event: type });
  }

  const order = db.orders.findById(orderId);
  if (!order || !order.payment) {
    return NextResponse.json({ success: true, ignored: "unknown order", event: type });
  }

  let payment: OrderPayment = order.payment;
  let touched = false;

  // Only reconcile against our own PaymentIntent / refunds.
  if (
    (type.startsWith("payment_intent.") && object.id && object.id === payment.reference) ||
    type.startsWith("charge.refund")
  ) {
    switch (type) {
      case "payment_intent.amount_capturable_updated":
        payment = { ...payment, status: "authorized", reference: object.id || payment.reference };
        touched = true;
        break;
      case "payment_intent.succeeded":
        payment = { ...payment, status: "captured", capturedAt: new Date().toISOString() };
        touched = true;
        break;
      case "payment_intent.canceled":
        payment = { ...payment, status: "canceled" };
        touched = true;
        break;
      case "charge.refunded":
      case "charge.refund.updated":
        payment = {
          ...payment,
          status: "refunded",
          refundedAmount: (object.last_refund_details?.amount_refunded ?? payment.amount * 100) / 100,
        };
        touched = true;
        break;
      default:
        break;
    }

    if (touched) {
      order.payment = payment;
      markOrder(order.id);
      await flushNow().catch(() => {});
    }
  }

  return NextResponse.json({ success: true, event: type });
}

