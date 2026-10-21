import crypto from "node:crypto";

const STRIPE_API = "https://api.stripe.com/v1";

export interface OrderPayment {
  provider: "stripe" | "simulated";
  // Stripe PaymentIntent id, or a sim_* reference in simulated mode.
  reference: string;
  clientSecret?: string;
  status: "authorized" | "captured" | "refunded" | "canceled" | "failed";
  amount: number; // major units (USD)
  currency: string;
  capturedAt?: string;
  refundedAmount?: number;
}

function key(): string | undefined {
  return process.env.STRIPE_SECRET_KEY;
}

export function paymentsLive(): boolean {
  return Boolean(key());
}

async function stripeForm(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const json = (await res.json()) as Record<string, unknown> & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message || `Stripe request failed (${res.status})`);
  }
  return json;
}

// Places the escrow hold: a manual-capture Card PaymentIntent (funds are
// authorized, not charged) or a simulated ledger entry without Stripe keys.
export async function authorizeEscrowHold(params: {
  orderId: string;
  amount: number;
  buyerEmail: string;
  itemTitle: string;
}): Promise<OrderPayment> {
  const currency = "usd";
  const cents = Math.round(params.amount * 100);

  if (!paymentsLive()) {
    return {
      provider: "simulated",
      reference: `sim_pi_${crypto.randomBytes(8).toString("hex")}`,
      status: "authorized",
      amount: params.amount,
      currency,
    };
  }

  const intent = await stripeForm("/payment_intents", {
    amount: String(cents),
    currency,
    "payment_method_types[]": "card",
    capture_method: "manual",
    receipt_email: params.buyerEmail,
    description: `Safedeal escrow hold · ${params.itemTitle}`.slice(0, 120),
    "metadata[order_id]": params.orderId,
  });

  return {
    provider: "stripe",
    reference: String(intent.id),
    clientSecret: intent.client_secret ? String(intent.client_secret) : undefined,
    status: "authorized",
    amount: params.amount,
    currency,
  };
}

export async function captureEscrowHold(payment: OrderPayment): Promise<OrderPayment> {
  if (payment.provider === "simulated") {
    // Simulated ledger mirrors the same state machine without Stripe.
    return payment.status === "authorized"
      ? { ...payment, status: "captured", capturedAt: new Date().toISOString() }
      : payment;
  }
  if (payment.status !== "authorized") return payment;
  await stripeForm(`/payment_intents/${payment.reference}/capture`, {});
  return { ...payment, status: "captured", capturedAt: new Date().toISOString() };
}

// Voids an uncaptured authorization (no charge happened).
export async function cancelEscrowHold(payment: OrderPayment): Promise<OrderPayment> {
  if (payment.provider === "simulated") {
    return payment.status === "authorized" ? { ...payment, status: "canceled" } : payment;
  }
  if (payment.status !== "authorized") return payment;
  await stripeForm(`/payment_intents/${payment.reference}/cancel`, {});
  return { ...payment, status: "canceled" };
}

export async function refundEscrowHold(
  payment: OrderPayment,
  amount?: number
): Promise<OrderPayment> {
  if (payment.provider === "simulated") {
    if (payment.status === "canceled" || payment.status === "refunded") return payment;
    const cents =
      amount !== undefined
        ? Math.min(Math.round(amount * 100), Math.round(payment.amount * 100))
        : Math.round(payment.amount * 100);
    return {
      ...payment,
      status: "refunded",
      refundedAmount: (payment.refundedAmount ?? 0) + cents / 100,
    };
  }
  if (payment.status === "canceled") return payment;
  const cents =
    amount !== undefined
      ? Math.min(Math.round(amount * 100), Math.round(payment.amount * 100))
      : Math.round(payment.amount * 100);
  await stripeForm("/refunds", {
    payment_intent: payment.reference,
    ...(amount !== undefined ? { amount: String(cents) } : {}),
  });
  return {
    ...payment,
    status: "refunded",
    refundedAmount: (payment.refundedAmount ?? 0) + cents / 100,
  };
}

// Stripe webhook signature verification (t=timestamp, v1=HMAC-SHA256 hex of
// `${t}.${rawPayload}`), timing-safe compare with a 300s tolerance.
export function verifyStripeSignature(
  rawPayload: string,
  header: string | null,
  toleranceSeconds = 300
): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!header) return false;

  const parts = header.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [k, v] = part.split("=");
    if (!k || !v) return acc;
    (acc[k] ??= []).push(v);
    return acc;
  }, {});

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 ?? [];
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawPayload}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  return signatures.some((s) => {
    const given = Buffer.from(s, "hex");
    return given.length === expectedBuf.length && crypto.timingSafeEqual(given, expectedBuf);
  });
}
