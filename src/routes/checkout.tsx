import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop-shell";
import { Button, Empty, Field, Money } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { furnitureSlots, grocerySlots } from "@/lib/format";
import { startPaystackPayment } from "@/lib/paystack.functions";
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
  const [placing, setPlacing] = useState(false);

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
      <h1 className="font-display text-4xl text-forest-ink">To your door</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Stay home. Pay online by card, transfer, or USSD. We pack it and ride it to you, often the same day if you order before 4pm.
      </p>
      <p className="mt-1 text-sm text-muted">
        {customer ? `Shopping as ${customer.name}. ` : "Guest checkout. "}
        <Link to="/account" className="font-semibold text-forest-ink underline">
          Change profile
        </Link>
      </p>
      <form
        className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        onSubmit={(event) => {
          event.preventDefault();
          if (placing) return;
          setPlacing(true);
          void (async () => {
            const result = await placeOrder({
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
              setPlacing(false);
              toast.error(result.message);
              return;
            }
            const pay = await startPaystackPayment({
              data: {
                number: result.data.number,
                email,
                phone,
                origin: window.location.origin,
              },
            });
            if (!pay.ok) {
              setPlacing(false);
              toast.error(pay.message);
              void navigate({ to: "/order/$number", params: { number: result.data.number } });
              return;
            }
            window.location.assign(pay.authorizationUrl);
            window.location.assign(pay.authorizationUrl);
          })();
        }}
      >
        <div className="space-y-4">
          <Field label="Name" id="name">
            <input id="name" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
          </Field>
          <Field label="Phone" id="phone" hint="Required. The rider calls this number when they are close.">
            <input
              id="phone"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="0803 000 0000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Email" id="email" hint="Optional.">
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
          </Field>
          {preview.hasCounter ? (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">How it reaches you</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["delivery", "pickup"] as const).map((option) => (
                  <label key={option} className="flex min-h-12 items-center gap-2 rounded-card border border-line bg-card px-3">
                    <input type="radio" name="method" checked={method === option} onChange={() => setMethod(option)} />
                    {option === "delivery" ? "To your door · fast" : "I’ll collect · free"}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="rounded-card bg-walnut-soft px-4 py-3 text-sm text-walnut-deep">This order is furniture only, so the van brings it. Grocery pickup does not apply.</p>
          )}
          {preview.hasCounter ? (
            <Field label="When should it arrive?" id="slot">
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
          {method === "pickup" && preview.hasCounter && !preview.hasFurniture ? (
            <p className="rounded-card bg-forest-soft px-4 py-3 text-sm text-forest-ink">
              Collect at {settings.address}. Bring the order number. Pickup is free.
            </p>
          ) : null}
          {needsAddress ? (
            <>
              <Field label="Where should we bring it?" id="address" hint="House number, street, and area in Kaduna.">
                <textarea
                  id="address"
                  required
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="12 Isa Kaita Road, Ungwan Rimi"
                  className={`${inputClass} min-h-24 py-3`}
                />
              </Field>
              <Field
                label="Which part of Kaduna?"
                id="zone"
                hint="The near zone is Malali, Ungwan Rimi, and Ungwan Munchi, by Zamani College, plus Kabala. The other zone is Barnawa, Kawo, Sabon Tasha, and Kakuri."
              >
                <select id="zone" className={inputClass} value={zoneId} onChange={(event) => setZoneId(event.target.value)}>
                  {settings.zones.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name} · ₦{entry.fee.toLocaleString("en-NG")}
                      {method === "delivery" && preview.hasCounter ? ` · shop from ₦${entry.minimum.toLocaleString("en-NG")}` : ""}
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
          <p className="mt-3 text-sm text-muted">You’ll finish on Paystack: card, bank transfer, or USSD. We pack after the payment clears, then bring it to your door.</p>
          <Button type="submit" className="mt-4 w-full" disabled={placing}>
            {placing ? "Opening Paystack…" : method === "pickup" && !preview.hasFurniture ? "Pay and I’ll collect" : "Pay and send it"}
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
