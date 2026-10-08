import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { StaffShell } from "@/components/staff-shell";
import { DEMO_STAFF } from "@/lib/catalog";
import { listSharedOrders } from "@/lib/orders.functions";
import { loadShopDesk, saveShopDocs } from "@/lib/shop.functions";
import { applyingRemoteShop, useDallema } from "@/lib/store";

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
  const apply = useDallema((state) => state.applyRemoteShop);
  useEffect(() => {
    let stop = false;
    let timer = 0;
    let unsub = () => {};
    const deskKey = DEMO_STAFF.password;

    function snapshot() {
      const state = useDallema.getState();
      return {
        deskKey,
        catalog: {
          products: state.products,
          settings: state.settings,
          promotions: state.promotions,
          schoolLists: state.schoolLists,
        },
        desk: {
          customers: state.customers,
          ledger: state.ledger,
          suppliers: state.suppliers,
          purchaseOrders: state.purchaseOrders,
          bakeryJobs: state.bakeryJobs,
          deliveryJobs: state.deliveryJobs,
          stockLog: state.stockLog,
          nextPoSeq: state.nextPoSeq,
        },
      };
    }

    void (async () => {
      const shop = await loadShopDesk({ data: { deskKey } });
      if (stop) return;
      if (shop.ok && shop.catalog) apply({ catalog: shop.catalog, desk: shop.desk });
      else if (shop.ok) await saveShopDocs({ data: snapshot() });
      unsub = useDallema.subscribe((state, prev) => {
        if (applyingRemoteShop || !state.staff) return;
        const changed =
          state.products !== prev.products ||
          state.settings !== prev.settings ||
          state.promotions !== prev.promotions ||
          state.schoolLists !== prev.schoolLists ||
          state.customers !== prev.customers ||
          state.ledger !== prev.ledger ||
          state.suppliers !== prev.suppliers ||
          state.purchaseOrders !== prev.purchaseOrders ||
          state.bakeryJobs !== prev.bakeryJobs ||
          state.deliveryJobs !== prev.deliveryJobs ||
          state.stockLog !== prev.stockLog ||
          state.nextPoSeq !== prev.nextPoSeq;
        if (!changed) return;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          void saveShopDocs({ data: snapshot() }).catch(() => undefined);
        }, 500);
      });
    })();

    async function pullOrders() {
      const result = await listSharedOrders({ data: { deskKey } });
      if (!stop && result.ok) merge(result.orders);
    }
    void pullOrders();
    const poll = window.setInterval(() => void pullOrders(), 12000);
    return () => {
      stop = true;
      unsub();
      window.clearTimeout(timer);
      window.clearInterval(poll);
    };
  }, [apply, merge]);
  return null;
}
