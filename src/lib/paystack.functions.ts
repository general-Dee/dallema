import { createServerFn } from "@tanstack/react-start";
import type { Order, PaymentStatus } from "@/lib/types";

function secret() {
  return process.env.PAYSTACK_SECRET_KEY?.trim() ?? "";
}

function asOrder(value: unknown): Order | null {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const order = parsed as Order;
  if (!order.id || !order.number || !Array.isArray(order.lines)) return null;
  return order;
}

function kobo(total: number) {
  return Math.round(Number(total) * 100);
}

function payEmail(email: string, phone: string) {
  const trimmed = email.trim();
  if (trimmed.includes("@") && !trimmed.includes(" ")) return trimmed;
  const digits = phone.replace(/\D/g, "") || "shop";
  return `pay+${digits}@dalema.shop`;
}

function callbackOrigin(given: string) {
  try {
    const url = new URL(given);
    const host = url.hostname;
    const local = host === "127.0.0.1" || host === "localhost";
    const allowed = host === "dallema.vercel.app" || host.endsWith(".vercel.app") || local;
    if (allowed && (url.protocol === "https:" || local)) return url.origin;
  } catch {
    // Fall through to the live shop.
  }
  return "https://dallema.vercel.app";
}

async function loadOrder(number: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql.query<{ payload: unknown }>(
    "select payload from shop_orders where lower(number) = lower($1) limit 1",
    [number],
  );
  return { sql, order: rows[0] ? asOrder(rows[0].payload) : null };
}

async function markPaid(order: Order) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const paid: PaymentStatus = "paid";
  const next = { ...order, paymentStatus: paid };
  await sql.query(
    "update shop_orders set payment_status = $2, payload = $3::jsonb where id = $1",
    [next.id, paid, JSON.stringify(next)],
  );
  return next;
}

export const startPaystackPayment = createServerFn({ method: "POST" })
  .validator((input: { number: string; email: string; phone: string; origin: string }) => input)
  .handler(async ({ data }) => {
    const key = secret();
    if (!key) return { ok: false as const, message: "Paystack is not set up on the shop yet." };
    const number = data.number.trim();
    const { order } = await loadOrder(number);
    if (!order) return { ok: false as const, message: "That order is not on the desk yet." };
    if (order.paymentStatus === "paid" || order.paymentStatus === "paid_demo") {
      return { ok: false as const, message: "This order is already paid." };
    }
    const amount = kobo(order.total);
    if (amount < 10000) return { ok: false as const, message: "Paystack takes payments from ₦100." };
    const origin = callbackOrigin(data.origin);
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payEmail(data.email || order.contactEmail, data.phone || order.contactPhone),
        amount,
        currency: "NGN",
        callback_url: `${origin}/order/${encodeURIComponent(order.number)}`,
        metadata: { order_number: order.number },
      }),
    });
    const body = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string };
    };
    const authorizationUrl = body.data?.authorization_url;
    if (!response.ok || !body.status || !authorizationUrl) {
      return { ok: false as const, message: body.message || "Paystack could not open the payment." };
    }
    return { ok: true as const, authorizationUrl };
  });

export const confirmPaystackPayment = createServerFn({ method: "POST" })
  .validator((input: { reference: string }) => input)
  .handler(async ({ data }) => {
    const key = secret();
    if (!key) return { ok: false as const, message: "Paystack is not set up on the shop yet.", order: null };
    const reference = data.reference.trim();
    if (!reference) return { ok: false as const, message: "Missing payment reference.", order: null };
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const body = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: { status?: string; amount?: number; currency?: string; metadata?: { order_number?: string } };
    };
    const paid = body.data;
    if (!response.ok || !body.status || paid?.status !== "success" || paid.currency !== "NGN") {
      return { ok: false as const, message: body.message || "Paystack has not confirmed this payment.", order: null };
    }
    const number = paid.metadata?.order_number?.trim() ?? "";
    if (!number) return { ok: false as const, message: "This payment is not tied to a Dalema order.", order: null };
    const { order } = await loadOrder(number);
    if (!order) return { ok: false as const, message: "The paid order is not on the desk.", order: null };
    if (paid.amount !== kobo(order.total)) {
      return { ok: false as const, message: "The amount paid does not match the order.", order: null };
    }
    if (order.paymentStatus === "paid") return { ok: true as const, order };
    return { ok: true as const, order: await markPaid(order) };
  });
