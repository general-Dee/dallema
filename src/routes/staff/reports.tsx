import { createFileRoute } from "@tanstack/react-router";
import { DEPARTMENTS } from "@/lib/catalog";
import { addDays, lagosDateString, naira } from "@/lib/format";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/staff/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const orders = useDallema((state) => state.orders);
  const products = useDallema((state) => state.products);
  const jobs = useDallema((state) => state.bakeryJobs);
  const today = lagosDateString();
  const from = addDays(today, -6);
  const completed = orders.filter((order) => order.status === "completed" && order.createdAt.slice(0, 10) >= from);
  const deptRows = DEPARTMENTS.map((dept) => {
    const revenue = completed.reduce(
      (sum, order) =>
        sum + order.lines.filter((line) => line.departmentId === dept.id).reduce((inner, line) => inner + line.unitPrice * line.qty, 0),
      0,
    );
    return { name: dept.name, revenue, orders: completed.filter((order) => order.lines.some((line) => line.departmentId === dept.id)).length };
  });
  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  let goods = 0;
  let cost = 0;
  let discounts = 0;
  for (const order of completed) {
    discounts += order.discount;
    for (const line of order.lines) {
      const product = products.find((entry) => entry.id === line.productId);
      goods += line.unitPrice * line.qty;
      cost += (product?.costPrice ?? 0) * line.qty;
      const current = productMap.get(line.productId) ?? { name: line.name, qty: 0, revenue: 0 };
      current.qty += line.qty;
      current.revenue += line.unitPrice * line.qty;
      productMap.set(line.productId, current);
    }
  }
  const top = [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  const wasteMap = new Map<string, number>();
  for (const job of jobs) {
    if (!job.qtyWaste) continue;
    wasteMap.set(job.productId, (wasteMap.get(job.productId) ?? 0) + job.qtyWaste);
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-forest-ink">Reports</h1>
      <p className="mt-2 text-sm text-muted">Completed orders from {from} through {today}. Margin is shelf price minus cost, before delivery. Discounts are shown apart so the goods margin stays readable.</p>
      <section className="mt-6">
        <h2 className="font-display text-2xl">Sales by department</h2>
        <Table
          headers={["Department", "Orders touching it", "Merchandise"]}
          rows={deptRows.map((row) => [row.name, String(row.orders), naira(row.revenue)])}
        />
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Top products</h2>
        <Table headers={["Product", "Qty", "Revenue"]} rows={top.map((row) => [row.name, String(row.qty), naira(row.revenue)])} />
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Gross margin estimate</h2>
        <Table
          headers={["", "Amount"]}
          rows={[
            ["Merchandise at shelf price", naira(goods)],
            ["Cost", naira(cost)],
            ["Margin before discounts", naira(goods - cost)],
            ["Discounts given", naira(discounts)],
            ["Margin after discounts", naira(goods - cost - discounts)],
          ]}
        />
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Bakery waste</h2>
        {wasteMap.size === 0 ? (
          <p className="mt-2 text-sm text-muted">No waste recorded.</p>
        ) : (
          <Table
            headers={["Item", "Waste qty"]}
            rows={[...wasteMap.entries()].map(([id, qty]) => [products.find((product) => product.id === id)?.name ?? id, String(qty)])}
          />
        )}
      </section>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-card border border-line bg-card">
      <table className="min-w-[480px] w-full text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="p-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-line last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
