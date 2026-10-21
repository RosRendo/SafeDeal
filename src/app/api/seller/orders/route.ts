import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireRole, sellerScope } from "@/lib/server/session";

// GET /api/seller/orders — returns all orders for the authenticated seller
export async function GET(req: NextRequest) {
  const ctx = await requireRole(req, ["seller", "admin"]);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const { searchParams } = new URL(req.url);
    const seller = sellerScope(ctx, searchParams.get("seller"));
    const status = searchParams.get("status") || undefined;

    let orders = db.orders.findForSeller(seller);

    if (status && status !== "all") {
      orders = orders.filter((o) => o.status === status);
    }

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch seller orders" },
      { status: 500 }
    );
  }
}
