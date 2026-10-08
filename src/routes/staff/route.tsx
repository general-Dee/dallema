import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { StaffShell } from "@/components/staff-shell";
import { DEMO_STAFF } from "@/lib/catalog";
import { listSharedOrders } from "@/lib/orders.functions";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/staff")({
  component: StaffLayout,
});

function StaffLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const staff = useDallema((state) => state.staff);
  const hydrated = useDallema((state) => state.hydrated);
  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-page px-6 text-forest-ink">
        <p className="font-display text-3xl">Opening the desk…</p>
      </main>
    );
  }
  if (pathname === "/staff/login") return <Outlet />;
  if (!staff) return <Navigate to="/staff/login" />;
  return (
    <StaffShell>
      <DeskSync />
      <Outlet />
    </StaffShell>
  );
}

function DeskSync() {
  const merge = useDallema((state) => state.mergeSharedOrders);
  useEffect(() => {
    let stop = false;
    async function pull() {
      const result = await listSharedOrders({ data: { deskKey: DEMO_STAFF.password } });
      if (!stop && result.ok) merge(result.orders);
    }
    void pull();
    const timer = window.setInterval(() => void pull(), 12000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [merge]);
  return null;
}
