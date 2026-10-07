import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { inputClass } from "@/components/ui";
import { DEPARTMENTS } from "@/lib/catalog";
import { useDallema } from "@/lib/store";

export function ShopShell({ children }: { children: ReactNode }) {
  const settings = useDallema((state) => state.settings);
  const count = useDallema((state) => state.cart.reduce((sum, line) => sum + line.qty, 0));
  const customer = useDallema((state) =>
    state.customers.find((entry) => entry.id === state.activeCustomerId),
  );
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const search = useRouterState({ select: (state) => state.location.search as { q?: string } });
  const [query, setQuery] = useState(pathname === "/search" ? (search.q ?? "") : "");

  useEffect(() => {
    if (pathname === "/search") setQuery(search.q ?? "");
  }, [pathname, search.q]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    void navigate({ to: "/search", search: { q: query } });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-card focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3">
          <Link to="/" aria-label="Dallema home" className="shrink-0 rounded-card bg-cream px-2 py-1.5">
            <Logo compact />
          </Link>
          <form onSubmit={onSearch} className="min-w-0 flex-1" role="search">
            <label htmlFor="shop-search" className="sr-only">
              Search the shop
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                id="shop-search"
                value={query}
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  void navigate({ to: "/search", search: { q: value }, replace: true });
                }}
                placeholder="Search rice, loaves, chairs, books"
                className={`${inputClass} pl-9`}
              />
            </div>
          </form>
          <ThemeToggle />
          <Link
            to="/account"
            aria-label={customer ? `Account, ${customer.name}` : "Account"}
            className="inline-flex size-12 items-center justify-center rounded-card text-forest-ink hover:bg-forest-soft"
          >
            <UserRound className="size-5" />
          </Link>
          <Link
            to="/cart"
            aria-label={`Basket, ${count} items`}
            className="relative inline-flex size-12 items-center justify-center rounded-card text-forest-ink hover:bg-forest-soft"
          >
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <span className="absolute top-1 right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-forest px-1 text-xs font-semibold text-cream">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
      <footer className="mt-8 border-t border-line bg-forest text-cream">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl">{settings.storeName}</p>
            <p className="mt-2 text-sm text-cream/85">{settings.address}</p>
            <p className="mt-2 text-sm">
              <a className="underline decoration-cream/40 underline-offset-2" href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                {settings.phone}
              </a>
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide uppercase">Hours</p>
            <p className="mt-2 text-sm text-cream/85">{settings.hours}</p>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide uppercase">Delivery</p>
            <ul className="mt-2 space-y-1 text-sm text-cream/85">
              {settings.zones.map((zone) => (
                <li key={zone.id}>
                  {zone.name}: ₦{zone.fee.toLocaleString("en-NG")} · from ₦{zone.minimum.toLocaleString("en-NG")}
                </li>
              ))}
              <li>Pickup at the shop is free.</li>
              <li>Furniture delivery from ₦{settings.furnitureDeliveryFee.toLocaleString("en-NG")}.</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide uppercase">Departments</p>
            <ul className="mt-2 space-y-1 text-sm">
              {DEPARTMENTS.map((dept) => (
                <li key={dept.id}>
                  <Link to="/shop/$dept" params={{ dept: dept.slug }} className="underline decoration-cream/40 underline-offset-2">
                    {dept.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/offers" className="underline decoration-cream/40 underline-offset-2">
                  Offers
                </Link>
              </li>
              <li>
                <Link to="/store" className="underline decoration-cream/40 underline-offset-2">
                  Store info
                </Link>
              </li>
              <li>
                <Link to="/staff/login" className="underline decoration-cream/40 underline-offset-2">
                  Staff entrance
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
