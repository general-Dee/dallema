import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { HoverTip } from "@/components/hover-tip";
import { ShopShell } from "@/components/shop-shell";
import { ProductArt, DeptIcon } from "@/components/product-art";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui";
import { DEPARTMENTS, tone } from "@/lib/catalog";
import { naira, whatsappHref } from "@/lib/format";
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
  const ask = whatsappHref(settings.phone, `Hello ${settings.storeName}, I would like to shop for the week.`);

  return (
    <ShopShell>
      <section>
        <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Stay in. We ride.</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl leading-[1.02] text-forest-ink sm:text-6xl">
              Shop from home. We bring it fast.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted">
              Groceries, fresh bread, and school books, ordered from the comfort of your house. Send it before 4pm and Kaduna delivery can be the same day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#departments">
                <Button>Shop from home</Button>
              </a>
              {ask ? (
                <a href={ask} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">Ask on WhatsApp</Button>
                </a>
              ) : (
                <Link to="/offers">
                  <Button variant="secondary">Today’s deals</Button>
                </Link>
              )}
            </div>
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
                <p className="text-xs font-semibold tracking-wide uppercase">To your door</p>
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

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            ["1", "Choose", "From the sofa. Groceries, bread, a chair, the school list. One basket."],
            ["2", "Pay online", "Card, transfer, or USSD on Paystack. No cash at the door."],
            ["3", "We bring it", "Fast, to your address in Kaduna. Same day if you order before 4pm."],
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-2xl border border-line bg-card px-4 py-4 shadow-card">
              <p className="font-display text-3xl text-forest-ink">{step}</p>
              <h2 className="mt-1 font-display text-2xl text-soil">{title}</h2>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>

        <div id="departments" className="mt-10 scroll-mt-28">
          <h2 className="font-display text-3xl text-forest-ink">What should come home?</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">Pick the part of the week that is missing. You can mix all four.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DEPARTMENTS.map((dept) => (
              <HoverTip key={dept.id} label={dept.name} side="bottom" className="w-full">
                <Link
                  to="/shop/$dept"
                  params={{ dept: dept.slug }}
                  aria-label={dept.name}
                  className="lift flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-card px-3 py-4 text-center shadow-card"
                >
                  <span className={`grid size-14 shrink-0 place-items-center rounded-full ${tone(dept.id).panel}`}>
                    <DeptIcon id={dept.id} className="size-7" />
                  </span>
                  <span className="hidden text-sm font-semibold text-soil [@media(hover:none)]:block">{dept.name}</span>
                  <span className="text-xs text-muted">{DEPT_LINE[dept.id]}</span>
                </Link>
              </HoverTip>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-line bg-card px-5 py-6">
        <h2 className="font-display text-3xl text-forest-ink">Going out is the hard way.</h2>
        <p className="mt-2 max-w-2xl text-muted">
          The heat, the traffic, a second stop for bread, a third for the book list. Stay home. The rider does that part.
        </p>
      </section>

      <Strip
        title="Bread that is ready today"
        action={
          <HoverTip label="See the bakery">
            <Link
              to="/shop/$dept"
              params={{ dept: "bakery" }}
              aria-label="See the bakery"
              className="inline-flex size-11 items-center justify-center rounded-full bg-bake-soft text-bake-ink"
            >
              <DeptIcon id="bakery" className="size-5" />
            </Link>
          </HoverTip>
        }
      >
        {bakery.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Strip>
      <Strip
        title="Fill the cupboard for less"
        action={
          <HoverTip label="All groceries">
            <Link
              to="/shop/$dept"
              params={{ dept: "supermarket" }}
              aria-label="All groceries"
              className="inline-flex size-11 items-center justify-center rounded-full bg-forest-soft text-forest-ink"
            >
              <DeptIcon id="supermarket" className="size-5" />
            </Link>
          </HoverTip>
        }
      >
        {offers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Strip>
      <Strip
        title="The term can start with the right books"
        action={
          <HoverTip label="Browse the bookstore">
            <Link
              to="/shop/$dept"
              params={{ dept: "bookstore" }}
              aria-label="Browse the bookstore"
              className="inline-flex size-11 items-center justify-center rounded-full bg-ink-soft text-ink"
            >
              <DeptIcon id="bookstore" className="size-5" />
            </Link>
          </HoverTip>
        }
      >
        {picks.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Strip>

      <section className="mt-12 rounded-2xl bg-forest px-6 py-8 text-cream">
        <p className="text-xs font-semibold tracking-[0.16em] text-cream/70 uppercase">Delivered to your door</p>
        <h2 className="mt-2 max-w-xl font-display text-3xl">You shop where you are. We ride the rest.</h2>
        <p className="mt-3 max-w-xl text-cream/85">
          Dalema packs the supermarket, the oven, and the bookstore, then brings them across Kaduna. {settings.hours}. Furniture still needs its own van, from two days out.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#departments">
            <Button variant="secondary">Shop from home</Button>
          </a>
          {ask ? (
            <a
              href={ask}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center rounded-card bg-[#25D366] px-4 text-base font-semibold text-[#072016]"
            >
              Ask on WhatsApp
            </a>
          ) : null}
        </div>
        <p className="mt-6 max-w-xl text-sm text-cream/80">
          Come back and the points add up: 1 point for every ₦{settings.earnNairaPerPoint} once an order is completed. 100 points are worth ₦{settings.nairaPer100Points}.
          {customer ? ` You’re shopping as ${customer.name}.` : " Open Account if you want the points kept on this phone."}
        </p>
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
