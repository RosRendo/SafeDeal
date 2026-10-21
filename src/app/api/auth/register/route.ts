import { NextRequest, NextResponse } from "next/server";
import { db, ensureHydrated } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/password";
import { flushUsers } from "@/lib/server/persist";
import {
  attachSessionCookie,
  createSessionToken,
  SESSION_COOKIE,
} from "@/lib/server/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register â€” creates an account with a scrypt password hash
// and signs the user in (HttpOnly session cookie).
export async function POST(req: NextRequest) {
  await ensureHydrated();

  let body: { fullName?: string; email?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Malformed request body." },
      { status: 400 }
    );
  }

  const fullName = body.fullName?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const role = (body.role === "seller" ? "seller" : "buyer") as "buyer" | "seller";

  if (!fullName || !email) {
    return NextResponse.json(
      { success: false, error: "Full name and email address are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { success: false, error: "That email address doesn't look valid." },
      { status: 400 }
    );
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { success: false, error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = db.users.findByEmail(email);
  if (existing) {
    return NextResponse.json(
      { success: false, error: "An account with this email address already exists. Please sign in." },
      { status: 409 }
    );
  }

  const user = db.users.create({
    name: fullName,
    email,
    password: hashPassword(password),
    role,
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Failed to register account." },
      { status: 400 }
    );
  }

  // User row must be durable before the Session row references it.
  await flushUsers();
  let token: string;
  try {
    const created = await createSessionToken(user.id);
    token = created.token;
  } catch {
    return NextResponse.json(
      { success: false, error: "Account created but sign-in failed. Please sign in manually." },
      { status: 500 }
    );
  }

  const response = NextResponse.json(
    {
      success: true,
      message: `Account created successfully. Welcome to SafeDeal, ${user.name}!`,
      user,
    },
    { status: 201 }
  );
  return attachSessionCookie(response, token);
}

