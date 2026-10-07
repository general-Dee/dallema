import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop-shell";
import { Button, Empty, Field, Money } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { furnitureSlots, grocerySlots } from "@/lib/format";
import { buildQuote } from "@/lib/pricing";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useDallema((state) => state.cart);
  const products = useDallema((state) => state.products);
  const promotions = useDallema((state) => state.promotions);
  const settings = useDallema((state) => state.settings);
  const promoCode = useDallema((state) => state.promoCode);
  const customer = useDallema((state) => state.customers.find((entry) => entry.id === state.activeCustomerId) ?? null);
  const placeOrder = useDallema((state) => state.placeOrder);
  const address0 = customer?.addresses[0];
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [method, setMethod] = useState<"pickup" | "delivery">("delivery");
  const [zoneId, setZoneId] = useState(address0?.zoneId ?? settings.zones[0]?.id ?? "");
  const [address, setAddress] = useState(address0 ? `${address0.line}, ${address0.area}` : "");
  const slots = grocerySlots();
  const furn = furnitureSlots();
  const [slotId, setSlotId] = useState(slots[0]?.id ?? "");
  const preset = cart.find((line) => line.furnitureSlotId)?.furnitureSlotId;
  const [furnitureSlotId, setFurnitureSlotId] = useState(preset && furn.some((slot) => slot.id === preset) ? preset : (furn[0]?.id ?? ""));
  const [notes, setNotes] = useState("");
  const [redeem, setRedeem] = useState(0);

  const preview = useMemo(() => {
    const hasFurniture = cart.some((line) => products.find((product) => product.id === line.productId)?.departmentId === "furniture");
    const hasCounter = cart.some((line) => products.find((product) => product.id === line.productId)?.departmentId !== "furniture");
    return { hasFurniture, hasCounter };
  }, [cart, products]);
  const zone = settings.zones.find((entry) => entry.id === zoneId);
  const needsAddress = method === "delivery" || preview.hasFurniture;
  const quote = buildQuote({
    cart,
    products,
    promotions,
    settings,
    promoCode,
    groceryDelivery: method === "delivery" && preview.hasCounter,
    zoneFee: needsAddress ? (zone?.fee ?? 0) : 0,
    redeemPoints: redeem,
    customer,
  });

  const pointSteps = customer
    ? Array.from({ length: Math.floor(customer.loyaltyPoints / 100) }, (_, index) => (index + 1) * 100).filter(
        (points) => points >= settings.minRedeemPoints,
      )
    : [];

  if (cart.length === 0) {
    return (
      <ShopShell>
        <Empty title="Nothing to check out" body="Your basket is empty." action={<Link to="/cart" className="font-semibold text-forest-ink underline">Back to the basket</Link>} />
      </ShopShell>
    );
  }

  return (
    <ShopShell>
      <h1 className="font-display text-4xl text-forest-ink">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        {customer ? `Shopping as ${customer.name}. ` : "Guest checkout. "}
        <Link to="/account" className="font-semibold text-forest-ink underline">
          Change profile
        </Link>
      </p>
      <form
        className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        onSubmit={(event) => {
          event.preventDefault();
          const result = placeOrder({
            name,
            phone,
            email,
            customerId: customer?.id ?? null,
            groceryMethod: preview.hasCounter ? method : "pickup",
            zoneId: needsAddress ? zoneId : "",
            address: needsAddress ? address : "",
            slotId: preview.hasCounter ? slotId : "",
            furnitureSlotId: preview.hasFurniture ? furnitureSlotId : "",
            notes,
            redeemPoints: redeem,
          });
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          toast.success(`Order ${result.data.number} placed`);
          void navigate({ to: "/order/$number", params: { number: result.data.number } });
        }}
      >
        <div className="space-y-4">
          <Field label="Name" id="name">
            <input id="name" required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
          </Field>
          <Field label="Phone" id="phone" hint="Required. We call if the loaf or the van is early.">
            <input id="phone" required inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
          </Field>
          <Field label="Email" id="email" hint="Optional.">
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
          </Field>
          {preview.hasCounter ? (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Groceries, bakery, and books</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["pickup", "delivery"] as const).map((option) => (
                  <label key={option} className="flex min-h-12 items-center gap-2 rounded-card border border-line bg-card px-3">
                    <input type="radio" name="method" checked={method === option} onChange={() => setMethod(option)} />
                    {option === "pickup" ? "Pickup · free" : "Delivery"}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="rounded-card bg-walnut-soft px-4 py-3 text-sm text-walnut-deep">This order is furniture only, so it goes on the van.</p>
          )}
          {preview.hasCounter ? (
            <Field label="Time" id="slot">
              <select id="slot" className={inputClass} value={slotId} onChange={(event) => setSlotId(event.target.value)}>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          {preview.hasFurniture ? (
            <Field label="Furniture window" id="fslot" hint="Separate from the grocery slot. From two days out.">
              <select id="fslot" className={inputClass} value={furnitureSlotId} onChange={(event) => setFurnitureSlotId(event.target.value)}>
                {furn.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          {needsAddress ? (
            <>
              <Field label="Address" id="address">
                <textarea id="address" required value={address} onChange={(event) => setAddress(event.target.value)} className={`${inputClass} min-h-24 py-3`} />
              </Field>
              <Field label="Zone" id="zone">
                <select id="zone" className={inputClass} value={zoneId} onChange={(event) => setZoneId(event.target.value)}>
                  {settings.zones.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name} · ₦{entry.fee.toLocaleString("en-NG")}
                      {method === "delivery" && preview.hasCounter ? ` · minimum ₦${entry.minimum.toLocaleString("en-NG")}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}
          <Field label="Note for the shop" id="notes">
            <textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} className={`${inputClass} min-h-24 py-3`} placeholder="Gate code, icing colour, who to call" />
          </Field>
          {customer && pointSteps.length > 0 ? (
            <Field label="Loyalty points" id="points" hint={`${customer.loyaltyPoints} points. 100 points = ₦${settings.nairaPer100Points}. Minimum ${settings.minRedeemPoints}.`}>
              <select
                id="points"
                className={inputClass}
                value={redeem}
                onChange={(event) => setRedeem(Number(event.target.value))}
              >
                <option value={0}>Don’t use points</option>
                {pointSteps.map((points) => (
                  <option key={points} value={points}>
                    Use {points} points · ₦{((points / 100) * settings.nairaPer100Points).toLocaleString("en-NG")}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          {quote.loyaltyError ? <p className="text-sm text-danger">{quote.loyaltyError}</p> : null}
        </div>
        <aside className="h-fit rounded-card border border-line bg-card p-4 shadow-card">
          <h2 className="font-display text-2xl text-forest-ink">To pay</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Line label="Subtotal" value={quote.subtotal} />
            <Line label="Delivery" value={quote.deliveryFee} />
            <Line label="Promo" value={-quote.promoDiscount} />
            <Line label="Points" value={-quote.loyaltyDiscount} />
            <div className="flex justify-between border-t border-line pt-2 text-lg font-semibold">
              <dt>Total</dt>
              <dd>
                <Money value={quote.total} />
              </dd>
            </div>
          </dl>
          {quote.promoError ? <p className="mt-2 text-sm text-danger">{quote.promoError}</p> : null}
          {promoCode ? <p className="mt-2 text-sm text-forest-ink">Code {promoCode}</p> : null}
          <p className="mt-3 text-sm text-muted">Demo payment only. We mark the order paid and put it on the shop queue. No card is charged.</p>
          <Button type="submit" className="mt-4 w-full">
            Place order (demo payment)
          </Button>
        </aside>
      </form>
    </ShopShell>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>
        <Money value={value} />
      </dd>
    </div>
  );
}
