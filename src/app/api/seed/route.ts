import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getAuthContext, forbidden } from "@/lib/server/session";

function isAuthorized(req: NextRequest): Promise<boolean> {
  return (async () => {
    if (process.env.NODE_ENV !== "production") return true;
    const ctx = await getAuthContext(req);
    return ctx?.role === "admin";
  })();
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return forbidden("Seeding tools are restricted in production (admin session required).");
  }
  try {
    let listings = db.listings.findMany();

    if (listings.length === 0) {
      db.reset();
      listings = db.listings.findMany();
    }

    const orders = db.orders.findMany();
    const threads = db.messages.getThreads();
    const admin = db.admin.getOverview();

    return NextResponse.json({
      success: true,
      message: "Seed database is initialized and operational.",
      counts: {
        listings: listings.length,
        orders: orders.length,
        threads: threads.length,
        disputes: admin.activeDisputes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to inspect seed state" },
      { status: 500 }
    );
  }
}

// POST /api/seed â€” full reset + re-seed. Dev convenience; admin-only in prod.
export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return forbidden("Seeding tools are restricted in production (admin session required).");
  }
  try {
    const result = db.reset();

    return NextResponse.json({
      success: true,
      message: "Database successfully re-seeded with production seed dataset.",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to re-seed database" },
      { status: 500 }
    );
  }
}

