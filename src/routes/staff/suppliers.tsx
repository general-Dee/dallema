import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button, Money } from "@/components/ui";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/staff/suppliers")({
  component: SuppliersPage,
});

function SuppliersPage() {
  const suppliers = useDallema((state) => state.suppliers);
  const orders = useDallema((state) => state.purchaseOrders);
  const draft = useDallema((state) => state.draftLowStockPos);
  const setStatus = useDallema((state) => state.setPoStatus);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl text-forest-ink">Suppliers</h1>
        <Button
          onClick={() => {
            const result = draft();
            if (!result.ok) toast.error(result.message);
            else toast.success(`${result.data.count} draft order${result.data.count === 1 ? "" : "s"} created`);
          }}
        >
          Draft PO from low stock
        </Button>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {suppliers.map((supplier) => (
          <li key={supplier.id} className="rounded-card border border-line bg-card p-4">
            <p className="font-semibold">{supplier.name}</p>
            <p className="text-sm text-muted">{supplier.phone}</p>
            <p className="text-sm">Lead time {supplier.leadDays} days · {supplier.departmentIds.join(", ")}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-display text-2xl text-forest-ink">Purchase orders</h2>
      <div className="mt-3 space-y-3">
        {orders.map((order) => {
          const supplier = suppliers.find((entry) => entry.id === order.supplierId);
          return (
            <article key={order.id} className="rounded-card border border-line bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {order.number} · {supplier?.name}
                </p>
                <p className="text-sm capitalize">{order.status}</p>
              </div>
              <p className="text-sm text-muted">Expected {order.expectedDate}</p>
              <ul className="mt-2 text-sm">
                {order.lines.map((line) => (
                  <li key={line.productId}>
                    {line.qty} × {line.name} · <Money value={line.cost} /> cost
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.status === "draft" ? (
                  <Button onClick={() => run(setStatus(order.id, "sent"))}>Mark sent</Button>
                ) : null}
                {order.status !== "received" ? (
                  <Button variant="secondary" onClick={() => run(setStatus(order.id, "received"))}>
                    Mark received
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function run(result: { ok: true; data: null } | { ok: false; message: string }) {
  if (!result.ok) toast.error(result.message);
  else toast.success("Purchase order updated");
}
