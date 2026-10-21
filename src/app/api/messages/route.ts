import { NextRequest, NextResponse } from "next/server";
import { db, ensureHydrated } from "@/lib/server/db";
import {
  getAuthContext,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/server/session";

function isParticipant(
  ctx: { role: string; name: string; email: string },
  thread: { sellerName?: string; buyerName?: string; buyerEmail?: string }
): boolean {
  if (ctx.role === "admin") return true;
  if (thread.buyerEmail && ctx.email.toLowerCase() === thread.buyerEmail.toLowerCase()) return true;
  if (thread.sellerName && ctx.name.toLowerCase() === thread.sellerName.toLowerCase()) return true;
  if (thread.buyerName && ctx.name.toLowerCase() === thread.buyerName.toLowerCase() && !thread.buyerEmail) return true;
  return false;
}

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const ctx = await getAuthContext(req);
  if (!ctx) return unauthorized("Sign in to view your messages.");

  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId") || undefined;

    const all = db.messages.getThreads();
    const threads = all.filter((t) => isParticipant(ctx, t));

    if (threadId) {
      const activeThread = db.messages.getThreadById(threadId);
      if (!activeThread) return notFound("Thread not found");
      if (!isParticipant(ctx, activeThread)) {
        return forbidden("This conversation belongs to a different escrow deal.");
      }
      const messages = db.messages.getMessages(threadId);
      return NextResponse.json({
        success: true,
        thread: activeThread,
        messages,
      });
    }

    return NextResponse.json({
      success: true,
      threads,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  const ctx = await getAuthContext(req);
  if (!ctx) return unauthorized("Sign in to send messages.");

  try {
    const body = await req.json();
    const { threadId, text } = body;

    if (!threadId || !text) {
      return NextResponse.json(
        { success: false, error: "threadId and text are required." },
        { status: 400 }
      );
    }

    const thread = db.messages.getThreadById(threadId);
    if (!thread) return notFound("Thread not found");
    if (!isParticipant(ctx, thread)) {
      return forbidden("This conversation belongs to a different escrow deal.");
    }

    // Sender identity is derived from the session, not from the request body.
    const sender: "buyer" | "seller" | "admin" =
      ctx.role === "admin" ? "admin" : ctx.role === "seller" ? "seller" : "buyer";

    const created = db.messages.sendMessage(threadId, { sender, text });

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send message" },
      { status: 500 }
    );
  }
}

