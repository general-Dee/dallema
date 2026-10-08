import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop-shell";
import { Button, DeptChip, Empty, Money, StatusPill } from "@/components/ui";
import { STATUS_LABEL } from "@/lib/catalog";
import { formatWhen, orderWhatsAppText, whatsappHref } from "@/lib/format";
import { fetchSharedOrder } from "@/lib/orders.functions";
import { confirmPaystackPayment, startPaystackPayment } from "@/lib/paystack.functions";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/order/$number")({
  component: OrderPage,
});

function OrderPage() {
  const { number } = Route.useParams();
  const order = useDallema((state) => state.orders.find((entry) => entry.number.toLowerCase() === number.toLowerCase()));
  const merge = useDallema((state) => state.mergeSharedOrders);
  const customer = useDallema((state) => state.customers.find((entry) => entry.id === order?.customerId) ?? null);
  const settings = useDallema((state) => state.settings);
  const [missing, setMissing] = useState(false);
  const [paying, setPaying] = useState(false);
  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference) return;
    let stop = false;
    void confirmPaystackPayment({ data: { reference } }).then((result) => {
      if (stop) return;
      window.history.replaceState({}, "", window.location.pathname);
      if (result.ok && result.order) {
        merge([result.order]);
        toast.success("Payment received. We’re packing your order.");
      } else if (!result.ok) toast.error(result.message);
    });
    return () => {
      stop = true;
    };
  }, [merge]);
  useEffect(() => {
    let stop = false;
    async function pull() {
      const result = await fetchSharedOrder({ data: { number } });
      if (stop) return;
      if (result.ok && result.order) {
        merge([result.order]);
        setMissing(false);
      } else if (!useDallema.getState().orders.some((entry) => entry.number.toLowerCase() === number.toLowerCase())) {
        setMissing(true);
      }
    }
    void pull();
    const timer = window.setInterval(() => void pull(), 10000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [merge, number]);
  if (!order) {
    return (
      <ShopShell>
        <Empty title="No order with that number" body={missing ? "Check the code, or look under Account if you used a household profile." : "Looking up that order on the desk…"} />
      </ShopShell>
    );
  }
  const next =
    order.status === "pending"
      ? "The shop will confirm it, then start packing."
      : order.status === "confirmed"
        ? "It’s confirmed. The counter is preparing it."
        : order.status === "preparing"
          ? "We’re putting it together now."
          : order.status === "ready"
            ? order.fulfillment === "pickup"
              ? `It’s ready for pickup at ${settings.address}.`
              : "It’s packed and waiting for the rider or van."
            : order.status === "out_for_delivery"
              ? "It’s on the way. Keep your phone near."
              : order.status === "completed"
                ? "This one is done. Points land when an order is completed."
                : "This order was cancelled. Stock has been put back if we had already taken it.";

  return (
    <ShopShell>
      <p className="text-sm font-semibold tracking-wide text-forest-ink uppercase">Order {order.number}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl text-forest-ink">{STATUS_LABEL[order.status]}</h1>
        <StatusPill status={order.status} />
      </div>
      <p className="mt-3 max-w-xl text-muted">{next}</p>
      <p className="mt-2 text-sm text-muted">Placed {formatWhen(order.createdAt)} · {order.channel === "pos" ? "Till" : "Web"} · {order.paymentStatus === "unpaid" ? "Awaiting payment" : "Paid"}</p>
      {order.paymentStatus === "unpaid" ? (
        <div className="mt-4">
          <p className="max-w-xl text-sm text-muted">Payment is on Paystack: card, transfer, or USSD. The rider leaves once it clears.</p>
          <Button
            className="mt-3"
            disabled={paying}
            onClick={() => {
              setPaying(true);
              void startPaystackPayment({
                data: {
                  number: order.number,
                  email: order.contactEmail,
                  phone: order.contactPhone,
                  origin: window.location.origin,
                },
              }).then((pay) => {
                if (!pay.ok) {
                  setPaying(false);
                  toast.error(pay.message);
                  return;
                }
                window.location.assign(pay.authorizationUrl);
              });
            }}
          >
            {paying ? "Opening Paystack…" : "Pay now"}
          </Button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-forest-ink">
          {order.fulfillment === "pickup" ? "Paid. We’ll have it ready at the shop." : "Paid. We’re getting it to your door."}
        </p>
      )}
      {whatsappHref(settings.phone, orderWhatsAppText(order)) ? (
        <a
          href={whatsappHref(settings.phone, orderWhatsAppText(order))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-12 items-center rounded-card bg-[#25D366] px-4 text-sm font-semibold text-[#072016]"
        >
          Send this order on WhatsApp
        </a>
      ) : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-card p-4">
          <h2 className="font-semibold">What you ordered</h2>
          <ul className="mt-3 space-y-3">
            {order.lines.map((line, index) => (
              <li key={`${line.productId}-${index}`} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {line.qty} × {line.name}
                  </p>
                  <DeptChip id={line.departmentId} />
                  {line.cakeDate ? <p className="mt-1 text-sm text-muted">Needed {line.cakeDate}</p> : null}
                  {line.specialInstructions ? <p className="text-sm text-muted">{line.specialInstructions}</p> : null}
                </div>
                <Money value={line.unitPrice * line.qty} />
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
            <Row label="Subtotal" value={order.subtotal} />
            <Row label="Delivery" value={order.deliveryFee} />
            <Row label="Discount" value={-order.discount} />
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>
                <Money value={order.total} />
              </dd>
            </div>
          </dl>
        </section>
        <section className="rounded-card border border-line bg-card p-4">
          <h2 className="font-semibold">How it arrives</h2>
          <p className="mt-2 text-sm">
            {order.groceryMethod === "delivery" ? "Delivery" : order.groceryMethod === "pickup" ? "Pickup" : "No counter goods"}
            {order.slot ? ` · ${order.slot}` : ""}
          </p>
          {order.furnitureSlot ? <p className="mt-1 text-sm">Furniture · {order.furnitureSlot}</p> : null}
          {order.address ? <p className="mt-2 text-sm text-muted">{order.address}</p> : <p className="mt-2 text-sm text-muted">Collect at {settings.address}</p>}
          {order.notes ? <p className="mt-2 text-sm">Note: {order.notes}</p> : null}
          {customer ? (
            <div className="mt-4 rounded-card bg-forest-soft p-3 text-sm text-forest-ink">
              <p className="font-semibold">Your referral code is {customer.referralCode}</p>
              <button
                type="button"
                className="mt-2 underline"
                onClick={() => {
                  void navigator.clipboard?.writeText(customer.referralCode);
                  toast.success("Code copied");
                }}
              >
                Copy code
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Guest orders don’t earn points. Pick a household profile next time.</p>
          )}
          <Link to="/account" className="mt-4 inline-flex text-sm font-semibold text-forest-ink underline">
            Your orders
          </Link>
        </section>
      </div>
    </ShopShell>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>
        <Money value={value} />
      </dd>
    </div>
  );
}
