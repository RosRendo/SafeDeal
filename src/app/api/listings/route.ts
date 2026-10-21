import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireRole } from "@/lib/server/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("cat") || undefined;
    const query = searchParams.get("q") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const instant = searchParams.get("instant") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const seller = searchParams.get("seller") || undefined;
    const status = searchParams.get("status") || undefined;

    const listings = db.listings.findMany({ category, query, sort, instant, limit, sellerName: seller, status });

    return NextResponse.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ctx = await requireRole(req, ["seller", "admin"]);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const body = await req.json();

    if (!body.title || typeof body.price !== "number") {
      return NextResponse.json(
        { success: false, error: "Title and price are required fields." },
        { status: 400 }
      );
    }

    // Listings are always attributed to the session seller.
    const created = db.listings.create({
      ...body,
      sellerName: ctx.name,
    });

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}
