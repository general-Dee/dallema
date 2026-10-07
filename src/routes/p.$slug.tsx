import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ProductArt } from "@/components/product-art";
import { ProductCard, WishButton } from "@/components/product-card";
import { ShopShell } from "@/components/shop-shell";
import { Button, DeptChip, Empty, Field, Money } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { BOUGHT_TOGETHER, categoryName } from "@/lib/catalog";
import { earliestMadeDate, formatDay, furnitureSlots, naira } from "@/lib/format";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/p/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const products = useDallema((state) => state.products);
  const settings = useDallema((state) => state.settings);
  const add = useDallema((state) => state.addToCart);
  const product = products.find((entry) => entry.slug === slug && entry.active);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");
  const [cakeDate, setCakeDate] = useState("");
  const [assembly, setAssembly] = useState(product?.assemblyRequired ?? false);
  const [windowId, setWindowId] = useState(furnitureSlots()[0]?.id ?? "");
  if (!product) {
    return (
      <ShopShell>
        <Empty title="We couldn’t find that item" body="It may have left the shelf. Try search or a department." />
      </ShopShell>
    );
  }
  const earliest = product.isMadeToOrder ? earliestMadeDate(product.leadTimeHours) : "";
  const related = products
    .filter((entry) => entry.active && entry.categoryId === product.categoryId && entry.id !== product.id)
    .slice(0, 4);
  const pairedIds = BOUGHT_TOGETHER[product.id] ?? [];
  const paired = pairedIds
    .map((id) => products.find((entry) => entry.id === id && entry.active && entry.departmentId !== product.departmentId))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, 2);
  const windows = furnitureSlots();

  return (
    <ShopShell>
      <p className="text-sm text-muted">
        <Link to="/" className="underline">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/shop/$dept" params={{ dept: product.departmentId }} className="underline">
          {product.departmentId}
        </Link>{" "}
        / {categoryName(product.categoryId)}
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <ProductArt product={product} className="aspect-square rounded-card" />
        <div>
          <div className="flex items-start justify-between gap-3">
            <DeptChip id={product.departmentId} />
            <WishButton productId={product.id} />
          </div>
          <h1 className="mt-3 font-display text-4xl text-forest-ink">{product.name}</h1>
          <p className="mt-2 text-lg text-muted">{product.shortDescription}</p>
          <p className="mt-4 text-3xl font-semibold">
            <Money value={product.price} />
            <span className="text-base font-normal text-muted"> / {product.unit}</span>
          </p>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <p className="text-muted line-through">
              Was <Money value={product.compareAtPrice} />
            </p>
          ) : null}
          <p className="mt-2 text-sm text-muted">
            {product.isMadeToOrder
              ? `Made to order. Allow ${product.leadTimeHours} hours. Earliest date is ${formatDay(earliest)}.`
              : product.stockOnHand <= 0
                ? "Out of stock."
                : `${product.stockOnHand} ${product.unit} on the shelf.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-cream-deep px-2.5 py-1 text-xs font-semibold text-soil">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-5 space-y-4">
            <Field label="Quantity" id="qty">
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="size-12 px-0" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                  −
                </Button>
                <span className="min-w-8 text-center text-lg font-semibold tabular-nums">{qty}</span>
                <Button variant="secondary" className="size-12 px-0" onClick={() => setQty((value) => value + 1)} aria-label="Increase quantity">
                  +
                </Button>
              </div>
            </Field>
            {product.isMadeToOrder ? (
              <>
                <Field label="Date needed" id="cake-date" hint="We won’t take a date inside the lead time.">
                  <input id="cake-date" type="date" min={earliest} value={cakeDate} onChange={(event) => setCakeDate(event.target.value)} className={inputClass} />
                </Field>
                <Field label="Message on the cake" id="cake-note">
                  <textarea id="cake-note" value={message} onChange={(event) => setMessage(event.target.value)} className={`${inputClass} min-h-24 py-3`} placeholder="Happy birthday Zara" />
                </Field>
              </>
            ) : null}
            {product.departmentId === "furniture" ? (
              <>
                <Field label="Delivery window preview" id="furn-window" hint="The real booking is confirmed at checkout. Furniture starts two days out.">
                  <select id="furn-window" className={inputClass} value={windowId} onChange={(event) => setWindowId(event.target.value)}>
                    {windows.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <label className="flex min-h-12 items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={assembly} onChange={(event) => setAssembly(event.target.checked)} />
                  Assemble it in the room (₦{settings.furnitureDeliveryFee.toLocaleString("en-NG")} delivery, or the zone fee if higher)
                </label>
              </>
            ) : null}
            <Button
              onClick={() => {
                const result = add({
                  productId: product.id,
                  qty,
                  cakeDate: product.isMadeToOrder ? cakeDate : undefined,
                  specialInstructions: message,
                  assembly,
                  furnitureSlotId: product.departmentId === "furniture" ? windowId : undefined,
                });
                if (!result.ok) toast.error(result.message);
                else toast.success(`${result.data.name} added to your basket`);
              }}
            >
              Add to basket · {naira(product.price * qty)}
            </Button>
          </div>
          <p className="mt-6 text-soil">{product.longDescription}</p>
          <p className="mt-3 text-sm text-muted">SKU {product.sku}</p>
        </div>
      </div>
      {paired.length > 0 ? (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-forest-ink">Often taken together</h2>
            <Button
              variant="secondary"
              onClick={() => {
                const first = add({
                  productId: product.id,
                  qty: 1,
                  cakeDate: product.isMadeToOrder ? cakeDate : undefined,
                  specialInstructions: message,
                  assembly,
                });
                if (!first.ok && !product.isMadeToOrder) toast.error(first.message);
                paired.forEach((item) => {
                  const result = add({ productId: item.id, qty: 1, assembly: item.assemblyRequired });
                  if (!result.ok) toast.error(result.message);
                });
                if (first.ok) toast.success("Added the set to your basket");
              }}
            >
              Add all
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {paired.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-3xl text-forest-ink">More in {categoryName(product.categoryId)}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </ShopShell>
  );
}
