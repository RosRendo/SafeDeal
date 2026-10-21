import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireRole, sellerScope } from "@/lib/server/session";

// GET /api/seller/earnings — real earnings dynamically derived from orders
export async function GET(req: NextRequest) {
  const ctx = await requireRole(req, ["seller", "admin"]);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const { searchParams } = new URL(req.url);
    const seller = sellerScope(ctx, searchParams.get("seller"));

    const summary = db.earnings.getSummary(seller);

    return NextResponse.json({
      success: true,
      data: summary,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}

// POST /api/seller/earnings — process withdrawal payout request
export async function POST(req: NextRequest) {
  const ctx = await requireRole(req, ["seller", "admin"]);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const body = await req.json();
    const { amount, method, destination } = body;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid payout amount greater than $0.00." },
        { status: 400 }
      );
    }

    // Payouts always move the session seller's ledger, never a client-supplied one.
    const sellerName = ctx.name;
    const result = db.earnings.requestPayout({
      amount: numericAmount,
      method: method || "stripe",
      destination: destination || "Verified Bank Account (•••• 4920)",
      sellerName,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Payout request failed." },
        { status: 400 }
      );
    }

    const updatedSummary = db.earnings.getSummary(sellerName);

    return NextResponse.json({
      success: true,
      message: `Payout of $${numericAmount.toFixed(2)} processed successfully via ${method || "direct transfer"}.`,
      payout: result.payout,
      summary: updatedSummary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process withdrawal payout" },
      { status: 500 }
    );
  }
}
