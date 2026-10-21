import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { clearSessionCookie, SESSION_COOKIE } from "@/lib/server/session";

// POST /api/auth/logout â€” deletes the session row and clears the cookie.
export async function POST(req: NextRequest) {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  if (raw) {
    const [nonce] = raw.split(".");
    if (nonce) {
      const tokenHash = crypto.createHash("sha256").update(nonce).digest("hex");
      await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
    }
  }
  const response = NextResponse.json({ success: true, message: "Signed out." });
  clearSessionCookie(response);
  return response;
}

