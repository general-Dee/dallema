import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { inputClass } from "@/components/ui";
import { DEPARTMENTS } from "@/lib/catalog";
import { whatsappHref } from "@/lib/format";
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

  const whatsapp = whatsappHref(settings.phone, `Hello ${settings.storeName}, I would like to ask about an order.`);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-card focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur">
        <div className="bg-forest text-cream">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-xs">
            <p className="truncate">{settings.address}</p>
            {whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="shrink-0 font-semibold underline decoration-cream/40 underline-offset-2">
                WhatsApp
              </a>
            ) : (
              <a className="shrink-0 font-semibold underline decoration-cream/40 underline-offset-2" href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                Call
              </a>
            )}
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3">
          <Link to="/" aria-label="Dalema home" className="shrink-0 rounded-card bg-cream px-2 py-1.5">
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
                placeholder="Search rice, bread, chairs, books"
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
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-[#072016]"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            ) : null}
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
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${settings.storeName}`}
          className="fixed right-4 bottom-24 z-40 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-[#072016] shadow-card lg:bottom-6"
        >
          <WhatsAppIcon className="size-7" />
        </a>
      ) : null}
    </div>
  );
}

function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 14.15c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.41-.14-.95-.31-1.64-.61-2.89-1.25-4.77-4.16-4.91-4.35-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.24-.27.64-.39 1.02-.39.12 0 .23 0 .33.01.3.01.44.03.64.49.24.58.82 2 .89 2.15.07.14.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.41.5-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.54.73 1.8.86.27.14.44.19.51.3.07.11.07.64-.17 1.32z" />
    </svg>
  );
}
