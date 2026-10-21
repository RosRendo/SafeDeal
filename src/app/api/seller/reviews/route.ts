import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireRole, sellerScope } from "@/lib/server/session";

// GET /api/seller/reviews — Returns live reviews and ratings summary for the merchant
export async function GET(req: NextRequest) {
  const ctx = await requireRole(req, ["seller", "admin"]);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const { searchParams } = new URL(req.url);
    const seller = sellerScope(ctx, searchParams.get("seller") || "AeroGamingDeals");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const summary = db.reviews.getSummary(seller);
    const reviews = db.reviews.findMany({ sellerName: seller, limit });

    return NextResponse.json({
      success: true,
      summary: {
        totalReviews: summary.totalReviews,
        averageRating: summary.averageRating,
      },
      reviews,
    });
  } catch (error) {
    console.error("[API Seller Reviews GET] Error:", error);
    return NextResponse.json({ error: "Failed to load seller reviews" }, { status: 500 });
  }
}

// POST /api/seller/reviews — Submit a review for the merchant
export async function POST(req: NextRequest) {
  try {
    const ctx = await requireRole(req, ["buyer", "seller", "admin"]);
    if (ctx instanceof NextResponse) return ctx;
    const body = await req.json();
    if (!body.reviewText || !body.rating) {
      return NextResponse.json(
        { error: "rating, and reviewText are required fields." },
        { status: 400 }
      );
    }

    // Review authorship comes from the session, never from the request body.
    const review = db.reviews.create({
      author: ctx.name,
      rating: body.rating,
      reviewText: body.reviewText,
      verifiedPurchase: body.verifiedPurchase || "Verified Escrow Transaction",
      sellerName: body.sellerName || "AeroGamingDeals",
      productCategory: body.productCategory || "accounts",
      avatarUrl: body.avatarUrl,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("[API Seller Reviews POST] Error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
