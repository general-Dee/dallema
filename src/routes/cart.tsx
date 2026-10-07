import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop-shell";
import { Button, DeptChip, Empty, Field, Money } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { DEPARTMENTS } from "@/lib/catalog";
import { buildQuote } from "@/lib/pricing";
import { deptSort, useDallema } from "@/lib/store";
import type { DeptId } from "@/lib/types";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const cart = useDallema((state) => state.cart);
  const products = useDallema((state) => state.products);
  const promotions = useDallema((state) => state.promotions);
  const settings = useDallema((state) => state.settings);
  const promoCode = useDallema((state) => state.promoCode);
  const setPromo = useDallema((state) => state.setPromoCode);
  const setQty = useDallema((state) => state.setQty);
  const remove = useDallema((state) => state.removeLine);
  const [draft, setDraft] = useState(promoCode ?? "");
  const quote = buildQuote({
    cart,
    products,
    promotions,
    settings,
    promoCode,
    groceryDelivery: false,
    zoneFee: 0,
    redeemPoints: 0,
    customer: null,
  });
  const groups = DEPARTMENTS.map((dept) => ({
    dept,
    lines: quote.lines.filter((line) => line.product.departmentId === dept.id),
  })).filter((group) => group.lines.length > 0);

  return (
    <ShopShell>
      <h1 className="font-display text-4xl text-forest-ink">Basket</h1>
      {quote.lines.length === 0 ? (
        <div className="mt-6">
          <Empty
            title="The basket is empty"
            body="Add a loaf, a tin of tomatoes, a book, or a table. Mixed departments are welcome."
            action={
              <Link to="/shop/$dept" params={{ dept: "supermarket" }}>
                <Button>Start with the supermarket</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            {groups
              .sort((a, b) => deptSort(a.dept.id, b.dept.id))
              .map((group) => (
                <section key={group.dept.id}>
                  <DeptChip id={group.dept.id as DeptId} />
                  <ul className="mt-3 divide-y divide-line rounded-card border border-line bg-card">
                    {group.lines.map((line) => (
                      <li key={line.line.key} className="flex flex-wrap items-center gap-3 p-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{line.product.name}</p>
                          <p className="text-sm text-muted">
                            <Money value={line.unitPrice} /> / {line.product.unit}
                            {line.line.cakeDate ? ` · needed ${line.line.cakeDate}` : ""}
                            {line.line.specialInstructions ? ` · “${line.line.specialInstructions}”` : ""}
                            {line.line.assembly ? " · assembly requested" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            className="size-11 px-0"
                            aria-label={`Decrease ${line.product.name}`}
                            onClick={() => {
                              const result = setQty(line.line.key, line.line.qty - 1);
                              if (!result.ok) toast.error(result.message);
                            }}
                          >
                            −
                          </Button>
                          <span className="w-6 text-center tabular-nums">{line.line.qty}</span>
                          <Button
                            variant="secondary"
                            className="size-11 px-0"
                            aria-label={`Increase ${line.product.name}`}
                            onClick={() => {
                              const result = setQty(line.line.key, line.line.qty + 1);
                              if (!result.ok) toast.error(result.message);
                            }}
                          >
                            +
                          </Button>
                        </div>
                        <p className="w-24 text-right font-semibold">
                          <Money value={line.lineTotal} />
                        </p>
                        <button
                          type="button"
                          className="text-sm font-semibold text-danger underline"
                          onClick={() => remove(line.line.key)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            {quote.hasFurniture && quote.hasCounter ? (
              <p className="rounded-card bg-walnut-soft px-4 py-3 text-sm text-walnut-deep">
                This basket mixes departments. Groceries and bakes can come today or tomorrow. Furniture is booked from two days out, on a separate van.
              </p>
            ) : null}
          </div>
          <aside className="h-fit rounded-card border border-line bg-card p-4 shadow-card lg:sticky lg:top-24">
            <Field label="Promo code" id="promo">
              <div className="flex gap-2">
                <input id="promo" value={draft} onChange={(event) => setDraft(event.target.value)} className={inputClass} placeholder="WELCOME10" />
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPromo(draft);
                    toast.success(draft.trim() ? "Code applied to the total" : "Code cleared");
                  }}
                >
                  Apply
                </Button>
              </div>
            </Field>
            {promoCode ? <p className="mt-2 text-sm text-forest-ink">Using {promoCode}</p> : null}
            {quote.promoError ? <p className="mt-2 text-sm text-danger">{quote.promoError}</p> : null}
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={quote.subtotal} />
              <Row label="Promo" value={-quote.promoDiscount} />
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Delivery</dt>
                <dd className="text-right">Added at checkout. Pickup is free. Zones from ₦800. Furniture from ₦{settings.furnitureDeliveryFee.toLocaleString("en-NG")}.</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>Goods total</dt>
                <dd>
                  <Money value={quote.subtotal - quote.promoDiscount} />
                </dd>
              </div>
            </dl>
            <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card p-3 lg:static lg:mt-4 lg:border-0 lg:p-0">
              <Link to="/checkout" className="block">
                <Button className="w-full">Checkout</Button>
              </Link>
            </div>
          </aside>
        </div>
      )}
      <div className="h-20 lg:hidden" />
    </ShopShell>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd>
        <Money value={value} />
      </dd>
    </div>
  );
}
