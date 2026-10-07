import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ShopShell } from "@/components/shop-shell";
import { ProductCard } from "@/components/product-card";
import { Button, DeptChip } from "@/components/ui";
import { DeptIcon } from "@/components/product-art";
import { DEPARTMENTS, tone } from "@/lib/catalog";
import { naira } from "@/lib/format";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const products = useDallema((state) => state.products).filter((product) => product.active);
  const settings = useDallema((state) => state.settings);
  const customer = useDallema((state) =>
    state.customers.find((entry) => entry.id === state.activeCustomerId),
  );
  const bakery = products.filter((product) => product.departmentId === "bakery" && !product.isMadeToOrder).slice(0, 4);
  const offers = products.filter((product) => product.departmentId === "supermarket" && (product.compareAtPrice ?? 0) > product.price).slice(0, 4);
  const furniture = products.find((product) => product.id === "sofa-3");
  const picks = products.filter((product) => product.departmentId === "bookstore" && product.featured).slice(0, 3);

  return (
    <ShopShell>
      <section className="grid items-end gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm font-semibold tracking-wide text-forest-ink uppercase">14 Market Road, Surulere</p>
          <h1 className="mt-2 max-w-xl font-display text-4xl leading-tight text-forest-ink sm:text-5xl">
            Shop food, fresh bakes, furniture, and books in one place.
          </h1>
          <p className="mt-3 max-w-lg text-lg text-muted">
            One neighbourhood shop. Groceries for the week, bread from this morning, a chair that fits the room, and the book for next term.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#departments">
              <Button>Shop now</Button>
            </a>
            <Link to="/offers">
              <Button variant="secondary">Today’s deals</Button>
            </Link>
          </div>
          <p className="mt-4 max-w-lg rounded-card bg-bake-soft px-4 py-3 text-sm text-soil">{settings.bannerText}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {DEPARTMENTS.map((dept) => (
            <Link
              key={dept.id}
              to="/shop/$dept"
              params={{ dept: dept.slug }}
              className={`rounded-card p-4 ${tone(dept.id).panel}`}
            >
              <DeptIcon id={dept.id} className="size-7" />
              <p className="mt-3 font-display text-2xl leading-none">{dept.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="departments" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-3xl text-forest-ink">Four counters, one till</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DEPARTMENTS.map((dept) => {
            const items = products.filter((product) => product.departmentId === dept.id);
            const from = Math.min(...items.map((product) => product.price));
            return (
              <Link
                key={dept.id}
                to="/shop/$dept"
                params={{ dept: dept.slug }}
                className="overflow-hidden rounded-card border border-line bg-card shadow-card"
              >
                <div className={`h-1.5 ${tone(dept.id).bar}`} />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl text-soil">{dept.name}</h3>
                    <DeptChip id={dept.id} />
                  </div>
                  <p className="mt-2 text-muted">{dept.description}</p>
                  <p className="mt-3 text-sm font-semibold text-forest-ink">
                    {items.length} items · from {naira(from)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Strip
        title="Fresh from the bakery today"
        action={
          <Link to="/shop/$dept" params={{ dept: "bakery" }} className="text-sm font-semibold text-forest-ink underline">
            See the bakery
          </Link>
        }
      >
        {bakery.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Strip>
      <Strip
        title="This week’s supermarket offers"
        action={
          <Link to="/shop/$dept" params={{ dept: "supermarket" }} className="text-sm font-semibold text-forest-ink underline">
            All groceries
          </Link>
        }
      >
        {offers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Strip>

      {furniture ? (
        <section className="mt-10 overflow-hidden rounded-card border border-line bg-card shadow-card md:grid md:grid-cols-2">
          <div className="bg-walnut-soft p-6 text-walnut-deep">
            <p className="text-sm font-semibold tracking-wide uppercase">Furniture</p>
            <h2 className="mt-2 font-display text-3xl">{furniture.name}</h2>
            <p className="mt-2">{furniture.shortDescription}</p>
            <p className="mt-3 text-sm">
              Delivery is on its own van, from two days out. Assembly is optional and noted on the order. The trip is ₦
              {settings.furnitureDeliveryFee.toLocaleString("en-NG")}, or the zone fee if that is higher.
            </p>
            <Link to="/p/$slug" params={{ slug: furniture.slug }} className="mt-4 inline-flex">
              <Button variant="bake">View the sofa</Button>
            </Link>
          </div>
          <div className="p-6">
            <p className="text-sm font-semibold tracking-wide text-ink uppercase">Bookstore staff picks</p>
            <ul className="mt-3 space-y-3">
              {picks.map((product) => (
                <li key={product.id}>
                  <Link to="/p/$slug" params={{ slug: product.slug }} className="font-semibold text-ink">
                    {product.name}
                  </Link>
                  <p className="text-sm text-muted">{product.shortDescription}</p>
                </li>
              ))}
            </ul>
            <Link to="/shop/$dept" params={{ dept: "bookstore" }} className="mt-4 inline-flex text-sm font-semibold text-forest-ink underline">
              Browse the bookstore
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-10 rounded-card bg-forest px-5 py-6 text-cream">
        <h2 className="font-display text-3xl">Points for the regulars</h2>
        <p className="mt-2 max-w-xl text-cream/85">
          You earn 1 point for every ₦{settings.earnNairaPerPoint} once an order is completed. 100 points are worth ₦
          {settings.nairaPer100Points}. Redeem from {settings.minRedeemPoints} points.
        </p>
        <p className="mt-3 text-sm">
          {customer
            ? `You’re shopping as ${customer.name}. Share ${customer.referralCode} when you send a neighbour.`
            : "Pick a household profile in Account to keep points on this device."}
        </p>
        <Link to="/account" className="mt-4 inline-flex">
          <Button variant="secondary">See your points</Button>
        </Link>
      </section>
    </ShopShell>
  );
}

function Strip({ title, action, children }: { title: string; action: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-3xl text-forest-ink">{title}</h2>
        {action}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}
