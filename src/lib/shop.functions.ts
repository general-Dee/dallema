import { createServerFn } from "@tanstack/react-start";
import { DEMO_STAFF } from "@/lib/catalog";
import type {
  BakeryJob,
  Customer,
  DeliveryJob,
  LoyaltyLedger,
  Product,
  Promotion,
  PurchaseOrder,
  SchoolList,
  Settings,
  StockMovement,
  Supplier,
} from "@/lib/types";

export interface ShopCatalog {
  products: Product[];
  settings: Settings;
  promotions: Promotion[];
  schoolLists: SchoolList[];
}

export interface ShopDesk {
  customers: Customer[];
  ledger: LoyaltyLedger[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  bakeryJobs: BakeryJob[];
  deliveryJobs: DeliveryJob[];
  stockLog: StockMovement[];
  nextPoSeq: number;
}

function parse(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function asCatalog(value: unknown): ShopCatalog | null {
  const row = parse(value);
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const catalog = row as ShopCatalog;
  if (!Array.isArray(catalog.products) || !catalog.settings || typeof catalog.settings !== "object") return null;
  return {
    products: catalog.products,
    settings: catalog.settings,
    promotions: Array.isArray(catalog.promotions) ? catalog.promotions : [],
    schoolLists: Array.isArray(catalog.schoolLists) ? catalog.schoolLists : [],
  };
}

function asDesk(value: unknown): ShopDesk | null {
  const row = parse(value);
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const desk = row as ShopDesk;
  if (!Array.isArray(desk.customers) || !Array.isArray(desk.suppliers)) return null;
  return {
    customers: desk.customers,
    ledger: Array.isArray(desk.ledger) ? desk.ledger : [],
    suppliers: desk.suppliers,
    purchaseOrders: Array.isArray(desk.purchaseOrders) ? desk.purchaseOrders : [],
    bakeryJobs: Array.isArray(desk.bakeryJobs) ? desk.bakeryJobs : [],
    deliveryJobs: Array.isArray(desk.deliveryJobs) ? desk.deliveryJobs : [],
    stockLog: Array.isArray(desk.stockLog) ? desk.stockLog : [],
    nextPoSeq: typeof desk.nextPoSeq === "number" ? desk.nextPoSeq : 1,
  };
}

async function readDoc(key: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql.query<{ payload: unknown }>("select payload from shop_docs where key = $1 limit 1", [key]);
  return rows[0]?.payload ?? null;
}

async function writeDoc(key: string, payload: unknown) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await sql.query(
    `insert into shop_docs (key, payload, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (key) do update set payload = excluded.payload, updated_at = now()`,
    [key, JSON.stringify(payload)],
  );
}

export const loadShopCatalog = createServerFn({ method: "POST" })
  .validator((input: Record<string, never>) => input)
  .handler(async () => {
    const catalog = asCatalog(await readDoc("catalog"));
    return { ok: true as const, catalog };
  });

export const loadShopDesk = createServerFn({ method: "POST" })
  .validator((input: { deskKey: string }) => input)
  .handler(async ({ data }) => {
    if (data.deskKey !== DEMO_STAFF.password) {
      return { ok: false as const, message: "Staff sign-in required.", catalog: null, desk: null };
    }
    return {
      ok: true as const,
      catalog: asCatalog(await readDoc("catalog")),
      desk: asDesk(await readDoc("desk")),
    };
  });

export const saveShopDocs = createServerFn({ method: "POST" })
  .validator((input: { deskKey: string; catalog: ShopCatalog; desk: ShopDesk }) => input)
  .handler(async ({ data }) => {
    if (data.deskKey !== DEMO_STAFF.password) {
      return { ok: false as const, message: "Staff sign-in required." };
    }
    const catalog = asCatalog(data.catalog);
    const desk = asDesk(data.desk);
    if (!catalog || !desk) return { ok: false as const, message: "The shop record could not be read." };
    await writeDoc("catalog", catalog);
    await writeDoc("desk", desk);
    return { ok: true as const };
  });
