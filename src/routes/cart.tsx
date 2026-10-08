import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HoverTip } from "@/components/hover-tip";
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
            title="Nothing is on its way yet"
            body="Choose what the house needs. We bring groceries, bread, and books to your door, often the same day."
            action={
              <Link to="/" hash="departments">
                <Button>Shop from home</Button>
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
                          <HoverTip label="Less">
                            <Button
                              variant="secondary"
                              className="size-11 px-0"
                              aria-label={`Decrease ${line.product.name}`}
                              onClick={() => {
                                const result = setQty(line.line.key, line.line.qty - 1);
                                if (!result.ok) toast.error(result.message);
                              }}
                            >
                              <Minus className="size-4" aria-hidden="true" />
                            </Button>
                          </HoverTip>
                          <span className="w-6 text-center tabular-nums">{line.line.qty}</span>
                          <HoverTip label="More">
                            <Button
                              variant="secondary"
                              className="size-11 px-0"
                              aria-label={`Increase ${line.product.name}`}
                              onClick={() => {
                                const result = setQty(line.line.key, line.line.qty + 1);
                                if (!result.ok) toast.error(result.message);
                              }}
                            >
                              <Plus className="size-4" aria-hidden="true" />
                            </Button>
                          </HoverTip>
                        </div>
                        <p className="w-24 text-right font-semibold">
                          <Money value={line.lineTotal} />
                        </p>
                        <HoverTip label="Remove">
                          <button
                            type="button"
                            aria-label={`Remove ${line.product.name}`}
                            className="inline-flex size-11 items-center justify-center rounded-full text-danger hover:bg-danger-soft"
                            onClick={() => remove(line.line.key)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </HoverTip>
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
              <div>
                <dt className="text-muted">Delivery</dt>
                <dd className="mt-1 text-muted">
                  To your door across Kaduna, often the same day if you order before 4pm, from ₦800. Collecting at the shop is free. Furniture from ₦
                  {settings.furnitureDeliveryFee.toLocaleString("en-NG")}.
                </dd>
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
