import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/lib/server/db";
import {
  authenticateCredentials,
  attachSessionCookie,
  createSessionToken,
} from "@/lib/server/session";
import { flushUsers } from "@/lib/server/persist";

// POST /api/auth/login — strict credential check (scrypt), issues an
// HttpOnly session cookie. No auto-provisioning: unknown accounts register.
export async function POST(req: NextRequest) {
  await ensureHydrated();

  let body: { email?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Malformed request body." },
      { status: 400 }
    );
  }

  const { email, password, role } = body;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email address and password are required." },
      { status: 400 }
    );
  }

  const user = authenticateCredentials(email, password, role);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Incorrect email address or password." },
      { status: 401 }
    );
  }

  // The Session row references the User row — make sure it is durable first.
  await flushUsers();
  let token: string;
  try {
    const created = await createSessionToken(user.id);
    token = created.token;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error && error.message.includes("Foreign key")
            ? "User record is not synced yet. Try again."
            : "Could not create session.",
      },
      { status: 500 }
    );
  }

  const response = NextResponse.json({
    success: true,
    message: `Signed in successfully as ${user.name}`,
    user,
  });
  return attachSessionCookie(response, token);
}
