import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/server/session";

// GET /api/auth/me — resolves the current user from the session cookie.
// Returns 404 when there is no valid session so clients fall back to
// their logged-out state.
export async function GET(req: NextRequest) {
  const user = await getAuthContext(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "No active session" }, { status: 404 });
  }
  return NextResponse.json({ success: true, user });
}
