import { NextRequest, NextResponse } from "next/server";
import { db, ensureHydrated } from "@/lib/server/db";
import {
  requireUser,
  forbidden,
} from "@/lib/server/session";

// GET stays public: the catalog is browsable without an account.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const listing = db.listings.findById(id);

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await ensureHydrated();
  const ctx = await requireUser(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const { id } = await context.params;
    const body = await req.json();

    const existing = db.listings.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Only the seller of record (or an admin) may edit a listing.
    if (
      ctx.role !== "admin" &&
      (existing as unknown as { sellerName?: string }).sellerName !== ctx.name
    ) {
      return forbidden("This listing belongs to a different seller.");
    }

    const updated = db.listings.update(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await ensureHydrated();
  const ctx = await requireUser(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const { id } = await context.params;

    const existing = db.listings.findById(id);
    if (
      ctx.role !== "admin" &&
      (!existing || (existing as unknown as { sellerName?: string }).sellerName !== ctx.name)
    ) {
      return forbidden("This listing belongs to a different seller.");
    }

    const deleted = db.listings.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete listing" },
      { status: 500 }
    );
  }
}

