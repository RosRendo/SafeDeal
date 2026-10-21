import { NextRequest, NextResponse } from "next/server";
import { db, ensureHydrated } from "@/lib/server/db";
import { getAuthContext, unauthorized } from "@/lib/server/session";
import { authorizeEscrowHold } from "@/lib/server/payments";
import { markOrder } from "@/lib/server/persist";

// GET /api/orders â€” buyers see their own orders, sellers see their own,
// admins see everything. Unauthenticated callers get nothing.
export async function GET(req: NextRequest) {
  await ensureHydrated();
  const ctx = await getAuthContext(req);
  if (!ctx) return unauthorized("Sign in to view your orders.");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  let orders = db.orders.findMany({ status });
  if (ctx.role === "buyer") {
    orders = orders.filter(
      (o) => (o.buyerEmail || "").toLowerCase() === ctx.email.toLowerCase()
    );
  } else if (ctx.role === "seller") {
    orders = orders.filter(
      (o) => (o.sellerName || "").toLowerCase() === ctx.name.toLowerCase()
    );
  }

  return NextResponse.json({
    success: true,
    count: orders.length,
    data: orders,
  });
}

// POST /api/orders â€” creates an escrow order for the signed-in buyer and
// attempts the escrow hold (Stripe manual-capture PaymentIntent, or a
// simulated ledger entry when Stripe keys are not configured).
export async function POST(req: NextRequest) {
  await ensureHydrated();
  const ctx = await getAuthContext(req);
  if (!ctx) return unauthorized("Sign in to place an escrow order.");

  const body = await req.json().catch(() => null);

  if (!body || !body.itemTitle || typeof body.price !== "number") {
    return NextResponse.json(
      { success: false, error: "itemTitle and price are required." },
      { status: 400 }
    );
  }

  if (body.price <= 0 || body.price > 100000) {
    return NextResponse.json(
      { success: false, error: "Order amount is out of range." },
      { status: 400 }
    );
  }

  // Buyer identity comes from the session, never from the request body.
  const created = db.orders.create({
    ...body,
    buyerName: ctx.name,
    buyerEmail: ctx.email,
  });

  let payment: Awaited<ReturnType<typeof authorizeEscrowHold>> | null = null;
  try {
    payment = await authorizeEscrowHold({
      orderId: created.id,
      amount: created.price,
      buyerEmail: ctx.email,
      itemTitle: created.itemTitle,
    });
  } catch (error) {
    payment = {
      provider: "stripe",
      reference: "failed",
      status: "failed",
      amount: created.price,
      currency: "usd",
    };
    created.payment = payment;
    markOrder(created.id);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? `Escrow hold failed: ${error.message}`
            : "Escrow hold failed.",
        data: created,
      },
      { status: 402 }
    );
  }

  created.payment = payment;
  markOrder(created.id);

  return NextResponse.json(
    { success: true, data: created },
    { status: 201 }
  );
}

