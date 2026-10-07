import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CakeSlice,
  ClipboardList,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";
import { useDallema } from "@/lib/store";

const LINKS = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/staff/orders", label: "Orders", icon: ClipboardList },
  { to: "/staff/pos", label: "POS", icon: ShoppingBag },
  { to: "/staff/products", label: "Products", icon: Package },
  { to: "/staff/bakery", label: "Bakery", icon: CakeSlice },
  { to: "/staff/deliveries", label: "Furniture", icon: Truck },
  { to: "/staff/school", label: "School lists", icon: Warehouse },
  { to: "/staff/customers", label: "Customers", icon: Users },
  { to: "/staff/promos", label: "Promotions", icon: Percent },
  { to: "/staff/suppliers", label: "Suppliers", icon: Warehouse },
  { to: "/staff/reports", label: "Reports", icon: BarChart3 },
  { to: "/staff/settings", label: "Settings", icon: Settings },
] as const;

export function StaffShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const staff = useDallema((state) => state.staff);
  const logout = useDallema((state) => state.logout);
  return (
    <div className="min-h-dvh bg-page">
      <header className="border-b border-line bg-forest text-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/staff" className="shrink-0 rounded-card bg-cream px-2 py-1.5" aria-label="Staff desk">
            <Logo compact />
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <ThemeToggle onForest />
            <div className="min-w-0 text-right text-sm">
              <p className="truncate font-semibold">{staff?.name}</p>
              <p className="truncate text-cream/80 max-sm:hidden">Owner · sees every desk</p>
            </div>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-3" aria-label="Staff">
          {LINKS.map((link) => {
            const active = "exact" in link && link.exact ? pathname === link.to : pathname.startsWith(link.to);
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-card px-3 text-sm font-medium",
                  active ? "bg-cream text-forest" : "text-cream hover:bg-forest-deep",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex min-h-11 shrink-0 items-center rounded-card px-3 text-sm font-medium text-cream hover:bg-forest-deep"
          >
            Sign out
          </button>
          <Link
            to="/"
            className="inline-flex min-h-11 shrink-0 items-center rounded-card px-3 text-sm font-medium text-cream hover:bg-forest-deep"
          >
            View shop
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
