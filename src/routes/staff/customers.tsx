import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Field } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { formatWhen } from "@/lib/format";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/staff/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const customers = useDallema((state) => state.customers);
  const orders = useDallema((state) => state.orders);
  const adjust = useDallema((state) => state.adjustPoints);
  const [open, setOpen] = useState<string | null>(customers[0]?.id ?? null);
  const [delta, setDelta] = useState(50);
  const [reason, setReason] = useState("");
  return (
    <div>
      <h1 className="font-display text-4xl text-forest-ink">Customers</h1>
      <div className="mt-4 overflow-x-auto rounded-card border border-line bg-card">
        <table className="min-w-[680px] w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Points</th>
              <th className="p-3 font-medium">Tier</th>
              <th className="p-3 font-medium">Last order</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const last = orders.find((order) => order.customerId === customer.id);
              return (
                <tr key={customer.id} className="border-b border-line">
                  <td className="p-3">
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-xs text-muted">{customer.phone}</p>
                  </td>
                  <td className="p-3 tabular-nums">{customer.loyaltyPoints}</td>
                  <td className="p-3">{customer.tier}</td>
                  <td className="p-3">{last ? `${last.number} · ${formatWhen(last.createdAt)}` : "—"}</td>
                  <td className="p-3">
                    <button type="button" className="font-semibold underline" onClick={() => setOpen(customer.id)}>
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {open ? (
        <form
          className="mt-4 max-w-lg space-y-3 rounded-card border border-line bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const result = adjust(open, delta, reason);
            if (!result.ok) toast.error(result.message);
            else {
              toast.success("Points updated");
              setReason("");
            }
          }}
        >
          <Field label="Points change" id="delta" hint="Use a negative number to take points off. Balance won’t go below zero.">
            <input id="delta" type="number" className={inputClass} value={delta} onChange={(event) => setDelta(Number(event.target.value))} />
          </Field>
          <Field label="Reason" id="why">
            <input id="why" className={inputClass} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Goodwill after a late van" />
          </Field>
          <Button type="submit">Save points</Button>
        </form>
      ) : null}
    </div>
  );
}
