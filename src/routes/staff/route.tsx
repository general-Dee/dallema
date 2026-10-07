import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { StaffShell } from "@/components/staff-shell";
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
      <Outlet />
    </StaffShell>
  );
}
