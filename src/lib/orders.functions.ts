import { createServerFn } from "@tanstack/react-start";
import { DEMO_STAFF } from "@/lib/catalog";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

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

function deskOk(key: unknown) {
  return key === DEMO_STAFF.password;
}

export const saveSharedOrder = createServerFn({ method: "POST" })
  .validator((input: { order: Order }) => input)
  .handler(async ({ data }) => {
    const draft = asOrder(data.order);
    if (!draft) return { ok: false as const, message: "That order could not be read." };
    if (!draft.contactName.trim() || draft.contactPhone.replace(/\s/g, "").length < 10) {
      return { ok: false as const, message: "Name and phone are required." };
    }
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const seq = await sql.query<{ value: number }>(
      "update shop_counters set value = value + 1 where name = 'order_seq' returning value",
    );
    const value = seq[0]?.value;
    if (!value) return { ok: false as const, message: "The desk could not number this order." };
    const order: Order = {
      ...draft,
      number: `DL-${value}`,
      status: "pending",
      paymentStatus: "unpaid",
      channel: "web",
      createdAt: new Date().toISOString(),
    };
    await sql.query(
      "insert into shop_orders (id, number, status, payment_status, payload) values ($1, $2, $3, $4, $5::jsonb)",
      [order.id, order.number, order.status, order.paymentStatus, JSON.stringify(order)],
    );
    return { ok: true as const, order };
  });

export const saveDeskOrder = createServerFn({ method: "POST" })
  .validator((input: { deskKey: string; order: Order }) => input)
  .handler(async ({ data }) => {
    if (!deskOk(data.deskKey)) return { ok: false as const, message: "Staff sign-in required." };
    const order = asOrder(data.order);
    if (!order) return { ok: false as const, message: "That order could not be read." };
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query(
      `insert into shop_orders (id, number, status, payment_status, payload)
       values ($1, $2, $3, $4, $5::jsonb)
       on conflict (id) do update set
         status = excluded.status,
         payment_status = excluded.payment_status,
         payload = excluded.payload`,
      [order.id, order.number, order.status, order.paymentStatus, JSON.stringify(order)],
    );
    return { ok: true as const, order };
  });

export const listSharedOrders = createServerFn({ method: "POST" })
  .validator((input: { deskKey: string }) => input)
  .handler(async ({ data }) => {
    if (!deskOk(data.deskKey)) return { ok: false as const, message: "Staff sign-in required.", orders: [] as Order[] };
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ payload: unknown }>(
      "select payload from shop_orders order by created_at desc limit 100",
    );
    return { ok: true as const, orders: rows.map((row) => asOrder(row.payload)).filter((order): order is Order => Boolean(order)) };
  });

export const fetchSharedOrder = createServerFn({ method: "POST" })
  .validator((input: { number: string }) => input)
  .handler(async ({ data }) => {
    const number = data.number.trim();
    if (!number) return { ok: false as const, message: "Missing order number.", order: null };
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ payload: unknown }>(
      "select payload from shop_orders where lower(number) = lower($1) limit 1",
      [number],
    );
    return { ok: true as const, order: rows[0] ? asOrder(rows[0].payload) : null };
  });

export const updateSharedOrder = createServerFn({ method: "POST" })
  .validator((input: { deskKey: string; id: string; status?: OrderStatus; paymentStatus?: PaymentStatus }) => input)
  .handler(async ({ data }) => {
    if (!deskOk(data.deskKey)) return { ok: false as const, message: "Staff sign-in required." };
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ payload: unknown }>("select payload from shop_orders where id = $1 limit 1", [data.id]);
    const order = rows[0] ? asOrder(rows[0].payload) : null;
    if (!order) return { ok: false as const, message: "Not on the shared desk." };
    if (data.status) order.status = data.status;
    if (data.paymentStatus) order.paymentStatus = data.paymentStatus;
    await sql.query(
      "update shop_orders set status = $2, payment_status = $3, payload = $4::jsonb where id = $1",
      [order.id, order.status, order.paymentStatus, JSON.stringify(order)],
    );
    return { ok: true as const, order };
  });
