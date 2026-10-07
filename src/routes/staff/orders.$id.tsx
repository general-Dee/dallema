import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button, DeptChip, Money, StatusPill } from "@/components/ui";
import { formatWhen } from "@/lib/format";
import { useDallema } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/staff/orders/$id")({
  component: OrderDesk,
});

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }[]>> = {
  pending: [
    { status: "confirmed", label: "Confirm" },
    { status: "cancelled", label: "Cancel" },
  ],
  confirmed: [
    { status: "preparing", label: "Mark preparing" },
    { status: "cancelled", label: "Cancel" },
  ],
  preparing: [
    { status: "ready", label: "Mark ready" },
    { status: "cancelled", label: "Cancel" },
  ],
  ready: [
    { status: "out_for_delivery", label: "Out for delivery" },
    { status: "completed", label: "Complete" },
    { status: "cancelled", label: "Cancel" },
  ],
  out_for_delivery: [
    { status: "completed", label: "Complete" },
    { status: "cancelled", label: "Cancel" },
  ],
};

function OrderDesk() {
  const { id } = Route.useParams();
  const order = useDallema((state) => state.orders.find((entry) => entry.id === id));
  const update = useDallema((state) => state.updateOrderStatus);
  if (!order) {
    return <p>That order isn’t on the queue.</p>;
  }
  const actions = (NEXT[order.status] ?? []).filter(
    (action) => action.status !== "out_for_delivery" || order.fulfillment !== "pickup" || order.furnitureSlot,
  );
  return (
    <div>
      <Link to="/staff/orders" className="text-sm font-semibold text-forest-ink underline">
        All orders
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl text-forest-ink">{order.number}</h1>
        <StatusPill status={order.status} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {formatWhen(order.createdAt)} · {order.channel} · {order.paymentStatus === "paid_demo" ? "Paid demo" : "Unpaid"} · stock {order.stockDeducted ? "taken" : "not yet taken"}
      </p>
      <div className="no-print mt-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.status}
            variant={action.status === "cancelled" ? "danger" : "primary"}
            onClick={() => {
              const result = update(order.id, action.status);
              if (!result.ok) toast.error(result.message);
              else toast.success(`${order.number} is now ${action.label.toLowerCase()}`);
            }}
          >
            {action.label}
          </Button>
        ))}
        <Button variant="secondary" onClick={() => window.print()}>
          Print summary
        </Button>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2" id="print-sheet">
        <section className="rounded-card border border-line bg-card p-4">
          <h2 className="font-semibold">Lines</h2>
          <ul className="mt-3 space-y-3">
            {order.lines.map((line, index) => (
              <li key={`${line.productId}-${index}`}>
                <p className="font-medium">
                  {line.qty} × {line.name} · <Money value={line.unitPrice * line.qty} />
                </p>
                <DeptChip id={line.departmentId} />
                {line.cakeDate ? <p className="text-sm">Cake date {line.cakeDate}</p> : null}
                {line.specialInstructions ? <p className="text-sm text-muted">{line.specialInstructions}</p> : null}
                {line.assembly ? <p className="text-sm">Assembly yes</p> : null}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            Subtotal <Money value={order.subtotal} /> · Delivery <Money value={order.deliveryFee} /> · Discount <Money value={order.discount} />
          </p>
          <p className="text-lg font-semibold">
            Total <Money value={order.total} />
          </p>
        </section>
        <section className="rounded-card border border-line bg-card p-4">
          <h2 className="font-semibold">{order.contactName}</h2>
          <p className="text-sm">{order.contactPhone}</p>
          <p className="text-sm">{order.contactEmail}</p>
          <p className="mt-3 text-sm">{order.address || "Pickup"}</p>
          <p className="mt-2 text-sm">{order.slot}</p>
          <p className="text-sm">{order.furnitureSlot}</p>
          <p className="mt-2 text-sm">Note: {order.notes || "—"}</p>
          <p className="mt-2 text-sm">Code: {order.promoCode || "none"}</p>
        </section>
      </div>
    </div>
  );
}
