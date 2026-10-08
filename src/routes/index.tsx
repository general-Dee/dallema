import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ShopShell } from "@/components/shop-shell";
import { ProductArt, DeptIcon } from "@/components/product-art";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui";
import { DEPARTMENTS, tone } from "@/lib/catalog";
import { naira } from "@/lib/format";
import { useDallema } from "@/lib/store";

const DEPT_LINE: Record<string, string> = {
  supermarket: "Rice, oil, the week",
  bakery: "Out of the oven",
  furniture: "For the room",
  bookstore: "For the term",
};

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
  const hero =
    products.find((product) => product.id === "sofa-3") ??
    products.find((product) => product.featured) ??
    products[0];
  const picks = products.filter((product) => product.departmentId === "bookstore" && product.featured).slice(0, 4);

  return (
    <ShopShell>
      <section>
        <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">{settings.address}</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl leading-[1.02] text-forest-ink sm:text-6xl">
              Shop food, fresh bakes, furniture, and books in one place.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted">
              One neighbourhood shop in Kaduna. Groceries for the week, bread from this morning, a chair that fits the room, and the book for next term.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#departments">
                <Button>Shop now</Button>
              </a>
              <Link to="/offers">
                <Button variant="secondary">Today’s deals</Button>
              </Link>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <li>Free pickup at the shop</li>
              <li>Delivery across Kaduna</li>
              <li>Cakes need a day’s notice</li>
            </ul>
            <p className="mt-4 max-w-lg rounded-2xl bg-bake-soft px-4 py-3 text-sm text-soil">{settings.bannerText}</p>
          </div>
          {hero ? (
            <Link
              to="/p/$slug"
              params={{ slug: hero.slug }}
              className="lift grid overflow-hidden rounded-2xl border border-line bg-card shadow-card sm:grid-cols-[1.15fr_0.85fr]"
            >
              <ProductArt product={hero} className="aspect-[5/4] sm:aspect-auto sm:min-h-72" />
              <div className={`flex flex-col justify-center p-5 ${tone(hero.departmentId).panel}`}>
                <p className="text-xs font-semibold tracking-wide uppercase">
                  {hero.departmentId === "furniture" ? "On the floor" : "From the counter"}
                </p>
                <h2 className="mt-2 font-display text-3xl leading-tight">{hero.name}</h2>
                <p className="mt-2 text-sm">{hero.shortDescription}</p>
                <p className="mt-3 text-xl font-semibold">
                  {naira(hero.price)}
                  <span className="text-sm font-normal"> / {hero.unit}</span>
                </p>
                <span className={`mt-4 inline-flex min-h-12 items-center justify-center rounded-card px-4 text-sm font-semibold ${tone(hero.departmentId).solid}`}>
                  See it
                </span>
              </div>
            </Link>
          ) : null}
        </div>
        <div id="departments" className="mt-8 grid scroll-mt-28 grid-cols-2 gap-3 sm:grid-cols-4">
          {DEPARTMENTS.map((dept) => (
            <Link
              key={dept.id}
              to="/shop/$dept"
              params={{ dept: dept.slug }}
              className="lift flex min-h-20 items-center gap-3 rounded-2xl border border-line bg-card px-3 py-3 shadow-card"
            >
              <span className={`grid size-11 shrink-0 place-items-center rounded-full ${tone(dept.id).panel}`}>
                <DeptIcon id={dept.id} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold leading-tight text-soil">{dept.name}</span>
                <span className="mt-0.5 block text-xs text-muted">{DEPT_LINE[dept.id]}</span>
              </span>
            </Link>
          ))}
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

      <Strip
        title="From the bookstore"
        action={
          <Link to="/shop/$dept" params={{ dept: "bookstore" }} className="text-sm font-semibold text-forest-ink underline">
            Browse the bookstore
          </Link>
        }
      >
        {picks.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Strip>

      <section className="mt-12 rounded-2xl bg-forest px-6 py-8 text-cream">
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
    <section className="mt-12">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-3xl text-forest-ink">{title}</h2>
        {action}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}
