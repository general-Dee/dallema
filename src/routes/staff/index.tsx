import { createFileRoute, Link } from "@tanstack/react-router";
import { DeptChip, Money, StatusPill } from "@/components/ui";
import { DEPARTMENTS } from "@/lib/catalog";
import { addDays, lagosDateString, naira, sameLagosDay, whatsappHref } from "@/lib/format";
import { lowStockProducts, useDallema } from "@/lib/store";

export const Route = createFileRoute("/staff/")({
  component: Dashboard,
});

function Dashboard() {
  const orders = useDallema((state) => state.orders);
  const products = useDallema((state) => state.products);
  const jobs = useDallema((state) => state.bakeryJobs);
  const deliveries = useDallema((state) => state.deliveryJobs);
  const settings = useDallema((state) => state.settings);
  const today = lagosDateString();
  const weekStart = addDays(today, -6);
  const todays = orders.filter((order) => order.status === "completed" && sameLagosDay(order.createdAt, today));
  const sales = todays.reduce((sum, order) => sum + order.total, 0);
  const openOrders = orders.filter((order) => !["completed", "cancelled"].includes(order.status));
  const low = lowStockProducts(products);
  const openJobs = jobs.filter((job) => job.date === today && job.qtyBaked < job.qtyPlanned);
  const furnToday = deliveries.filter(
    (job) => job.type === "furniture" && job.window.startsWith(today) && job.status !== "delivered",
  );
  const tomorrow = addDays(today, 1);
  const cakes = orders
    .filter((order) => order.status !== "cancelled" && order.status !== "completed")
    .flatMap((order) => order.lines.filter((line) => line.cakeDate === tomorrow).map((line) => ({ order, line })));
  const week = orders.filter((order) => order.status === "completed" && order.createdAt.slice(0, 10) >= weekStart);
  const byDept = DEPARTMENTS.map((dept) => ({
    dept,
    value: week.reduce(
      (sum, order) =>
        sum + order.lines.filter((line) => line.departmentId === dept.id).reduce((inner, line) => inner + line.unitPrice * line.qty, 0),
      0,
    ),
  }));
  const max = Math.max(...byDept.map((row) => row.value), 1);

  return (
    <div>
      <h1 className="font-display text-4xl text-forest-ink">Today at the shop</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Today’s sales" value={naira(sales)} />
        <Stat label="Orders to fulfill" value={String(openOrders.length)} />
        <Stat label="Low stock" value={String(low.length)} />
        <Stat label="Bakery jobs open" value={String(openJobs.length)} />
        <Stat label="Furniture today" value={String(furnToday.length)} />
      </div>
      <section className="mt-8">
        <h2 className="font-display text-2xl text-forest-ink">Completed this week, by department</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {byDept.map((row) => (
            <div key={row.dept.id}>
              <div className="flex h-32 items-end rounded-card bg-card">
                <div className={`w-full rounded-card ${row.dept.id === "supermarket" ? "bg-forest" : row.dept.id === "bakery" ? "bg-bake" : row.dept.id === "furniture" ? "bg-walnut" : "bg-ink-fill"}`} style={{ height: `${Math.max(8, (row.value / max) * 100)}%` }} />
              </div>
              <p className="mt-2 text-sm font-semibold">{row.dept.name}</p>
              <p className="text-sm text-muted">{naira(row.value)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl text-forest-ink">Recent orders</h2>
        <ul className="mt-3 divide-y divide-line rounded-card border border-line bg-card">
          {orders.slice(0, 6).map((order) => (
            <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <Link to="/staff/orders/$id" params={{ id: order.id }} className="font-semibold underline">
                {order.number}
              </Link>
              <span className="text-sm">{order.contactName}</span>
              <Money value={order.total} />
              <StatusPill status={order.status} />
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl text-forest-ink">Alerts</h2>
        {low.length > 0 && whatsappHref(settings.phone, lowStockText(low)) ? (
          <a
            href={whatsappHref(settings.phone, lowStockText(low))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-12 items-center rounded-card bg-[#25D366] px-4 text-sm font-semibold text-[#072016]"
          >
            WhatsApp the low-stock list
          </a>
        ) : null}
        <ul className="mt-3 space-y-2">
          {low.map((product) => (
            <li key={product.id} className="rounded-card border border-line bg-card px-3 py-2 text-sm">
              <span className="font-semibold">{product.name}</span> is at {product.stockOnHand}, reorder {product.reorderLevel}.{" "}
              <DeptChip id={product.departmentId} />
            </li>
          ))}
          {cakes.map(({ order, line }) => (
            <li key={`${order.id}-${line.productId}`} className="rounded-card bg-bake-soft px-3 py-2 text-sm">
              Cake due tomorrow: {line.specialInstructions || line.name} on {order.number} for {order.contactName}.
            </li>
          ))}
          {low.length === 0 && cakes.length === 0 ? <li className="text-sm text-muted">No alerts.</li> : null}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-card p-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-forest-ink">{value}</p>
    </div>
  );
}

function lowStockText(products: { name: string; stockOnHand: number }[]) {
  return `Low stock at Dalema:\n${products.map((product) => `${product.name}: ${product.stockOnHand} left`).join("\n")}`;
}
