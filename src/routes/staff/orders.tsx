import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { DeptChip, Money, StatusPill } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { DEPARTMENTS, STATUS_LABEL } from "@/lib/catalog";
import { formatWhen } from "@/lib/format";
import { useDallema } from "@/lib/store";
import type { DeptId, OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/staff/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const orders = useDallema((state) => state.orders);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [dept, setDept] = useState<DeptId | "all">("all");
  if (pathname !== "/staff/orders") return <Outlet />;
  const list = orders.filter((order) => {
    if (status !== "all" && order.status !== status) return false;
    if (dept !== "all" && !order.lines.some((line) => line.departmentId === dept)) return false;
    return true;
  });
  return (
    <div>
      <h1 className="font-display text-4xl text-forest-ink">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="text-sm font-medium">
          Status
          <select className={`${inputClass} mt-1`} value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | "all")}>
            <option value="all">All</option>
            {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((key) => (
              <option key={key} value={key}>
                {STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Department
          <select className={`${inputClass} mt-1`} value={dept} onChange={(event) => setDept(event.target.value as DeptId | "all")}>
            <option value="all">All</option>
            {DEPARTMENTS.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 overflow-x-auto rounded-card border border-line bg-card">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">When</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Departments</th>
              <th className="p-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {list.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-0">
                <td className="p-3">
                  <Link to="/staff/orders/$id" params={{ id: order.id }} className="font-semibold underline">
                    {order.number}
                  </Link>
                  <p className="text-xs text-muted">{order.channel}</p>
                </td>
                <td className="p-3">{formatWhen(order.createdAt)}</td>
                <td className="p-3">{order.contactName}</td>
                <td className="p-3">
                  <StatusPill status={order.status} />
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(order.lines.map((line) => line.departmentId))].map((id) => (
                      <DeptChip key={id} id={id} />
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <Money value={order.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 ? <p className="p-4 text-sm text-muted">No orders in this filter.</p> : null}
      </div>
    </div>
  );
}
