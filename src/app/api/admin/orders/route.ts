import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireRole } from "@/lib/server/session";

// GET /api/admin/orders — all orders for admin oversight
export async function GET(req: NextRequest) {
  const ctx = await requireRole(req, ["admin"]);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "0", 10);

    const orders = db.admin.getAllOrders({ status, limit: limit || undefined });

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch admin orders" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders — admin force-settle or status override
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action, notes } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, error: "orderId and action are required" },
        { status: 400 }
      );
    }

    const statusMap: Record<string, "active" | "delivered" | "disputed" | "warranty"> = {
      release: "delivered",
      settle: "delivered",
      dispute: "disputed",
      refund: "delivered",
      "force-settle": "delivered",
      reopen: "active",
    };

    const targetStatus = statusMap[action] || "delivered";
    const updated = db.orders.updateStatus(orderId, targetStatus, notes || `Admin ${action} action`);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Admin action '${action}' applied to order ${orderId}`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Admin order action failed" },
      { status: 500 }
    );
  }
}

export const POST = PATCH;
