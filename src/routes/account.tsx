import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop-shell";
import { ProductCard } from "@/components/product-card";
import { Button, Field, Money, StatusPill } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { formatWhen } from "@/lib/format";
import { useDallema, wishlistIds } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const customers = useDallema((state) => state.customers);
  const activeId = useDallema((state) => state.activeCustomerId);
  const setActive = useDallema((state) => state.setActiveCustomer);
  const orders = useDallema((state) => state.orders);
  const products = useDallema((state) => state.products);
  const settings = useDallema((state) => state.settings);
  const reorder = useDallema((state) => state.reorder);
  const saveAddress = useDallema((state) => state.saveAddress);
  const wished = useDallema((state) => wishlistIds(state));
  const customer = customers.find((entry) => entry.id === activeId) ?? null;
  const mine = customer ? orders.filter((order) => order.customerId === customer.id) : [];
  const saved = wished.map((id) => products.find((product) => product.id === id)).filter((product) => product != null);
  const [line, setLine] = useState(customer?.addresses[0]?.line ?? "");
  const [area, setArea] = useState(customer?.addresses[0]?.area ?? "");
  const [zoneId, setZoneId] = useState(customer?.addresses[0]?.zoneId ?? settings.zones[0]?.id ?? "");

  return (
    <ShopShell>
      <h1 className="font-display text-4xl text-forest-ink">Account</h1>
      <p className="mt-2 max-w-xl text-muted">
        This demo keeps a household on this device. Points, orders, and the wishlist stay after a refresh. They are not a bank login.
      </p>
      <Field label="Shopping as" id="who">
        <select
          id="who"
          className={`${inputClass} mt-2`}
          value={activeId ?? ""}
          onChange={(event) => {
            const id = event.target.value || null;
            setActive(id);
            const next = customers.find((entry) => entry.id === id);
            setLine(next?.addresses[0]?.line ?? "");
            setArea(next?.addresses[0]?.area ?? "");
            setZoneId(next?.addresses[0]?.zoneId ?? settings.zones[0]?.id ?? "");
          }}
        >
          <option value="">Guest — no points</option>
          {customers.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
      </Field>
      {customer ? (
        <section className="mt-6 rounded-card bg-forest p-5 text-cream">
          <p className="text-sm font-semibold tracking-wide uppercase">{customer.tier}</p>
          <p className="mt-1 font-display text-5xl">{customer.loyaltyPoints.toLocaleString("en-NG")}</p>
          <p className="text-sm text-cream/80">points</p>
          <p className="mt-3 max-w-lg text-sm text-cream/90">
            1 point per ₦{settings.earnNairaPerPoint} when an order is completed. 100 points = ₦{settings.nairaPer100Points}. Redeem from {settings.minRedeemPoints} points. Seed is under 500, Sprout from 500, Harvest from 1,500.
          </p>
          <p className="mt-3 text-sm">
            Referral code <span className="font-semibold">{customer.referralCode}</span>
          </p>
          <Link to="/offers" className="mt-3 inline-flex text-sm font-semibold underline">
            How offers work
          </Link>
        </section>
      ) : null}
      <section className="mt-8">
        <h2 className="font-display text-3xl text-forest-ink">Orders</h2>
        {mine.length === 0 ? (
          <p className="mt-2 text-muted">No orders on this profile yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {mine.map((order) => (
              <li key={order.id} className="rounded-card border border-line bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link to="/order/$number" params={{ number: order.number }} className="font-semibold text-forest-ink underline">
                    {order.number}
                  </Link>
                  <StatusPill status={order.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatWhen(order.createdAt)} · <Money value={order.total} />
                </p>
                <p className="mt-1 text-sm">{order.lines.map((lineItem) => `${lineItem.qty}× ${lineItem.name}`).join(", ")}</p>
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={() => {
                    const result = reorder(order.id);
                    if (!result.ok) toast.error(result.message);
                    else if (result.data.skipped.length) {
                      toast.success(`Added ${result.data.added}. Skipped: ${result.data.skipped.join(", ")}`);
                    } else toast.success("Added those items back to the basket");
                  }}
                >
                  Reorder
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {customer ? (
        <section className="mt-8">
          <h2 className="font-display text-3xl text-forest-ink">Saved address</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Street" id="line">
              <input id="line" className={inputClass} placeholder="12 Isa Kaita Road" value={line} onChange={(event) => setLine(event.target.value)} />
            </Field>
            <Field label="Area" id="area">
              <input id="area" className={inputClass} placeholder="Ungwan Rimi" value={area} onChange={(event) => setArea(event.target.value)} />
            </Field>
            <Field label="Zone" id="zone">
              <select id="zone" className={inputClass} value={zoneId} onChange={(event) => setZoneId(event.target.value)}>
                {settings.zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Button
            className="mt-3"
            onClick={() => {
              saveAddress(customer.id, line, area, zoneId);
              toast.success("Address saved on this profile");
            }}
          >
            Save address
          </Button>
        </section>
      ) : null}
      <section className="mt-8">
        <h2 className="font-display text-3xl text-forest-ink">Wishlist</h2>
        {saved.length === 0 ? (
          <p className="mt-2 text-muted">Hearts on a product land here.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </ShopShell>
  );
}
