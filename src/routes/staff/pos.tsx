import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, Money } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/staff/pos")({
  component: PosPage,
});

function PosPage() {
  const products = useDallema((state) => state.products).filter(
    (product) => product.active && !product.isMadeToOrder,
  );
  const customers = useDallema((state) => state.customers);
  const checkout = useDallema((state) => state.posCheckout);
  const [query, setQuery] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<{ productId: string; qty: number }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const popular = ["agege-loaf", "meat-pie", "bottled-water", "farm-eggs", "exercise-books", "chin-chin"];
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = needle
      ? products.filter((product) => product.name.toLowerCase().includes(needle) || product.sku.toLowerCase().includes(needle))
      : products.filter((product) => popular.includes(product.id));
    return pool.slice(0, 12);
  }, [products, query]);
  const total = lines.reduce((sum, line) => {
    const product = products.find((entry) => entry.id === line.productId);
    return sum + (product ? product.price * line.qty : 0);
  }, 0);

  function add(productId: string) {
    setLines((current) => {
      const found = current.find((line) => line.productId === productId);
      if (found) return current.map((line) => (line.productId === productId ? { ...line, qty: line.qty + 1 } : line));
      return [...current, { productId, qty: 1 }];
    });
    setSelected(productId);
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-forest-ink">Till</h1>
      <p className="mt-1 text-sm text-muted">Walk-in sales complete immediately and take stock off the shelf.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <label className="sr-only" htmlFor="pos-search">
            Search items
          </label>
          <input id="pos-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or SKU" className={inputClass} />
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {shown.map((product) => (
              <button key={product.id} type="button" onClick={() => add(product.id)} className="rounded-card border border-line bg-card p-3 text-left">
                <p className="font-semibold leading-snug">{product.name}</p>
                <p className="text-sm text-muted">
                  <Money value={product.price} /> · {product.stockOnHand} left
                </p>
              </button>
            ))}
          </div>
          {shown.length === 0 ? <p className="mt-4 text-sm text-muted">No item matches that.</p> : null}
        </div>
        <aside className="rounded-card border border-line bg-card p-4">
          <h2 className="font-semibold">Ticket</h2>
          {lines.length === 0 ? <p className="mt-2 text-sm text-muted">Tap an item.</p> : null}
          <ul className="mt-2 space-y-2">
            {lines.map((line) => {
              const product = products.find((entry) => entry.id === line.productId);
              if (!product) return null;
              return (
                <li key={line.productId} className={`rounded-card px-2 py-1 ${selected === line.productId ? "bg-forest-soft" : ""}`}>
                  <button type="button" className="w-full text-left" onClick={() => setSelected(line.productId)}>
                    <span className="font-medium">{product.name}</span>
                    <span className="float-right tabular-nums">
                      {line.qty} · <Money value={product.price * line.qty} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm font-medium">Quantity keypad</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <Button
                key={digit}
                variant="secondary"
                onClick={() => {
                  if (!selected) {
                    toast.error("Tap a line on the ticket first");
                    return;
                  }
                  setLines((current) => current.map((line) => (line.productId === selected ? { ...line, qty: digit } : line)));
                }}
              >
                {digit}
              </Button>
            ))}
          </div>
          <label className="mt-4 block text-sm font-medium" htmlFor="pos-customer">
            Customer (optional)
          </label>
          <select id="pos-customer" className={`${inputClass} mt-1`} value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">Walk-in</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          <p className="mt-4 text-2xl font-semibold">
            <Money value={total} />
          </p>
          <Button
            className="mt-3 w-full"
            onClick={() => {
              const result = checkout({ lines, customerId: customerId || null });
              if (!result.ok) toast.error(result.message);
              else {
                toast.success(`${result.data.number} taken at the till`);
                setLines([]);
                setSelected(null);
              }
            }}
          >
            Take payment (demo)
          </Button>
        </aside>
      </div>
    </div>
  );
}
