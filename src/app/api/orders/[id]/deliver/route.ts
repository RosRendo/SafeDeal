import { NextRequest, NextResponse } from "next/server";
import { db, ensureHydrated } from "@/lib/server/db";
import {
  getAuthContext,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/server/session";

// POST /api/orders/[id]/deliver â€” seller submits credentials to vault.
// Only the seller of record (or an admin) may deliver into this order.
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await ensureHydrated();
  try {
    const ctx = await getAuthContext(req);
    if (!ctx) return unauthorized("Sign in to deliver this order.");

    const { id } = await context.params;
    const body = await req.json();
    const creds = body.credentials || body;
    const login = creds.login || body.login;
    const email = creds.email || body.email;
    const pass = creds.pass || body.pass || creds.key || body.key;
    const key = creds.key || body.key;
    const pin = creds.pin || body.pin;
    const token = creds.token || body.token;
    const ogeEmail = creds.ogeEmail || body.ogeEmail;
    const twoFactor = creds.twoFactor || body.twoFactor;
    const hwidStatus = creds.hwidStatus || body.hwidStatus;

    const actualPass = pass || key;
    const actualLogin = login || (key ? "License Key" : "");
    const actualEmail = email || "escrow-vault@safedeal.internal";

    if (!actualPass) {
      return NextResponse.json(
        { success: false, error: "Password or license key is required for vault delivery." },
        { status: 400 }
      );
    }

    const order = db.orders.findById(id);
    if (!order) return notFound("Order not found");

    const isSeller =
      order.sellerName && ctx.name.toLowerCase() === order.sellerName.toLowerCase();
    if (!isSeller && ctx.role !== "admin") {
      return forbidden("Only the seller of this order can deliver into the vault.");
    }

    const credentials = {
      login: actualLogin,
      email: actualEmail,
      pass: actualPass,
      pin: pin || "0000",
      token: token || (key ? `KEY-${Date.now()}` : undefined),
    };
    const securityChecks = ogeEmail
      ? { ogeEmail, twoFactor: twoFactor || "Unverified", hwidStatus: hwidStatus || "Unknown" }
      : undefined;

    const updated = db.orders.deliver(id, credentials, securityChecks);

    if (!updated) {
      return notFound("Order not found");
    }

    return NextResponse.json({
      success: true,
      message: "Credentials delivered to vault. Buyer inspection window is now active.",
      data: updated,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to deliver credentials" },
      { status: 500 }
    );
  }
}

