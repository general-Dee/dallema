import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop-shell";
import { Button } from "@/components/ui";
import { BUNDLES, DEPARTMENTS } from "@/lib/catalog";
import { formatDay, naira } from "@/lib/format";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/offers")({
  component: OffersPage,
});

function OffersPage() {
  const promos = useDallema((state) => state.promotions).filter((promo) => promo.active);
  const products = useDallema((state) => state.products);
  const settings = useDallema((state) => state.settings);
  const add = useDallema((state) => state.addToCart);

  return (
    <ShopShell>
      <h1 className="font-display text-4xl text-forest-ink">Offers and points</h1>
      <p className="mt-2 max-w-xl text-muted">
        One code per order. We don’t stack them. Points are earned when the order is completed, not when it is still pending.
      </p>
      <ul className="mt-6 space-y-3">
        {promos.map((promo) => (
          <li key={promo.id} className="rounded-card border border-line bg-card p-4">
            <p className="font-display text-2xl text-forest-ink">{promo.code}</p>
            <p className="mt-1">{promo.label}</p>
            <p className="mt-1 text-sm text-muted">
              {promo.type === "percent" ? `${promo.value}% off` : `${naira(promo.value)} off`}
              {promo.minSpend ? ` from ${naira(promo.minSpend)}` : ""}
              {promo.departmentIds.length
                ? ` · ${promo.departmentIds.map((id) => DEPARTMENTS.find((dept) => dept.id === id)?.name).join(", ")}`
                : " · whole shop"}
              . Until {formatDay(promo.endsAt.slice(0, 10))}.
            </p>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-3xl text-forest-ink">Bundles the desk would pack</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {BUNDLES.map((bundle) => {
          const items = bundle.productIds
            .map((id) => products.find((product) => product.id === id))
            .filter((product) => product != null);
          const total = items.reduce((sum, product) => sum + product.price, 0);
          return (
            <article key={bundle.id} className="rounded-card border border-line bg-card p-4">
              <h3 className="font-display text-2xl">{bundle.name}</h3>
              <p className="mt-2 text-sm text-muted">{bundle.blurb}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {items.map((product) => (
                  <li key={product.id}>
                    {product.name} · {naira(product.price)}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-semibold">{naira(total)}</p>
              <Button
                className="mt-3"
                onClick={() => {
                  const skipped: string[] = [];
                  items.forEach((product) => {
                    const result = add({ productId: product.id, qty: 1, assembly: product.assemblyRequired });
                    if (!result.ok) skipped.push(product.name);
                  });
                  if (skipped.length) toast.error(`Couldn’t add ${skipped.join(", ")}`);
                  else toast.success(`${bundle.name} is in the basket`);
                }}
              >
                Add bundle
              </Button>
            </article>
          );
        })}
      </div>
      <section className="mt-10 rounded-card bg-cream-deep p-5">
        <h2 className="font-display text-3xl text-forest-ink">Loyalty</h2>
        <p className="mt-2 max-w-xl">
          Spend ₦{settings.earnNairaPerPoint}, get 1 point, after the order is completed. Turn points back into naira at checkout: 100 points = ₦{settings.nairaPer100Points}, and you need at least {settings.minRedeemPoints} points to start. Seed, Sprout, and Harvest are just the names for how often you shop with us.
        </p>
      </section>
    </ShopShell>
  );
}
