import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Field } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/staff/school")({
  component: SchoolDesk,
});

function SchoolDesk() {
  const lists = useDallema((state) => state.schoolLists);
  const products = useDallema((state) => state.products);
  const customers = useDallema((state) => state.customers);
  const create = useDallema((state) => state.createSchoolOrder);
  const [listId, setListId] = useState(lists[0]?.id ?? "");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const list = lists.find((entry) => entry.id === listId);
  return (
    <div>
      <h1 className="font-display text-4xl text-forest-ink">School lists</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Pack the in-stock lines as a confirmed pickup for a named customer. Short items are skipped and named in the toast.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="List" id="list">
          <select id="list" className={inputClass} value={listId} onChange={(event) => setListId(event.target.value)}>
            {lists.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Customer" id="cust">
          <select id="cust" className={inputClass} value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {list ? (
        <ul className="mt-4 space-y-2">
          {list.items.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            return (
              <li key={item.productId} className="rounded-card border border-line bg-card px-3 py-2 text-sm">
                {item.qty} × {product?.name ?? item.productId}
                {product ? ` · ${product.stockOnHand} on hand` : ""}
              </li>
            );
          })}
        </ul>
      ) : null}
      <Button
        className="mt-4"
        onClick={() => {
          const result = create(listId, customerId);
          if (!result.ok) toast.error(result.message);
          else {
            const skip = result.data.skipped.length ? ` Skipped: ${result.data.skipped.join(", ")}.` : "";
            toast.success(`${result.data.number} created.${skip}`);
          }
        }}
      >
        Create pickup order
      </Button>
    </div>
  );
}
