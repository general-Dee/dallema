import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HoverTip } from "@/components/hover-tip";
import { Button, DeptChip, Field, Money } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { CATEGORIES, DEPARTMENTS, TAGS } from "@/lib/catalog";
import { blankProduct, lowStockProducts, slugify, useDallema } from "@/lib/store";
import type { Product, StockReason, Tag, Unit } from "@/lib/types";

export const Route = createFileRoute("/staff/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const products = useDallema((state) => state.products);
  const suppliers = useDallema((state) => state.suppliers);
  const log = useDallema((state) => state.stockLog);
  const save = useDallema((state) => state.saveProduct);
  const remove = useDallema((state) => state.deleteProduct);
  const adjust = useDallema((state) => state.adjustStock);
  const [query, setQuery] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [delta, setDelta] = useState(1);
  const [reason, setReason] = useState<StockReason>("count");
  const [note, setNote] = useState("");
  const needle = query.trim().toLowerCase();
  const rows = (lowOnly ? lowStockProducts(products) : products)
    .filter((product) => {
      if (!needle) return true;
      return [product.name, product.sku, product.barcode, product.categoryId].join(" ").toLowerCase().includes(needle);
    })
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl text-forest-ink">Products</h1>
        <Button
          onClick={() => {
            setEditing(blankProduct());
            setIsNew(true);
          }}
        >
          Add product
        </Button>
      </div>
      <label className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={lowOnly} onChange={(event) => setLowOnly(event.target.checked)} />
        Low stock only
      </label>
      <input
        className={`${inputClass} mt-3`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search name, SKU, or barcode"
        aria-label="Search products"
      />
      <p className="mt-2 text-sm text-muted">{rows.length} items</p>
      <div className="mt-3 overflow-x-auto rounded-card border border-line bg-card">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Department</th>
              <th className="p-3 font-medium">SKU</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-0">
                <td className="p-3 font-medium">{product.name}</td>
                <td className="p-3">
                  <DeptChip id={product.departmentId} />
                </td>
                <td className="p-3">{product.sku}</td>
                <td className="p-3">
                  <Money value={product.price} />
                </td>
                <td className="p-3">{product.isMadeToOrder ? "Made to order" : product.stockOnHand}</td>
                <td className="p-3">{product.active ? "On sale" : "Hidden"}</td>
                <td className="p-3">
                  {pendingDelete === product.id ? (
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-muted">Remove {product.name}?</span>
                      <button
                        type="button"
                        className="font-semibold text-danger underline"
                        onClick={() => {
                          const result = remove(product.id);
                          if (!result.ok) toast.error(result.message);
                          else {
                            toast.success(`${product.name} removed. Past orders stay.`);
                            if (editing?.id === product.id) setEditing(null);
                            setPendingDelete(null);
                          }
                        }}
                      >
                        Yes, remove
                      </button>
                      <button type="button" className="font-semibold underline" onClick={() => setPendingDelete(null)}>
                        Keep
                      </button>
                    </span>
                  ) : (
                    <span className="flex gap-1">
                      <HoverTip label="Edit">
                        <button
                          type="button"
                          aria-label={`Edit ${product.name}`}
                          className="inline-flex size-11 items-center justify-center rounded-full text-forest-ink hover:bg-forest-soft"
                          onClick={() => {
                            setEditing(product);
                            setIsNew(false);
                            setPendingDelete(null);
                          }}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                      </HoverTip>
                      <HoverTip label="Remove">
                        <button
                          type="button"
                          aria-label={`Remove ${product.name}`}
                          className="inline-flex size-11 items-center justify-center rounded-full text-danger hover:bg-danger-soft"
                          onClick={() => setPendingDelete(product.id)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </HoverTip>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing ? (
        <form
          className="mt-6 space-y-3 rounded-card border border-line bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const next = {
              ...editing,
              slug: slugify(editing.name) || editing.id,
              imageLabel: editing.imageLabel || editing.name,
            };
            const result = save(next, isNew);
            if (!result.ok) toast.error(result.message);
            else {
              toast.success(isNew ? "Product added" : "Product saved");
              setEditing(null);
            }
          }}
        >
          <h2 className="font-display text-2xl">{isNew ? "New product" : `Edit ${editing.name}`}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" id="pname">
              <input id="pname" className={inputClass} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
            </Field>
            <Field label="SKU" id="sku">
              <input id="sku" className={inputClass} value={editing.sku} onChange={(event) => setEditing({ ...editing, sku: event.target.value })} />
            </Field>
            <Field label="Department" id="dept">
              <select
                id="dept"
                className={inputClass}
                value={editing.departmentId}
                onChange={(event) => {
                  const departmentId = event.target.value as Product["departmentId"];
                  const categoryId = CATEGORIES.find((category) => category.departmentId === departmentId)?.id ?? editing.categoryId;
                  setEditing({ ...editing, departmentId, categoryId });
                }}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Category" id="cat">
              <select id="cat" className={inputClass} value={editing.categoryId} onChange={(event) => setEditing({ ...editing, categoryId: event.target.value })}>
                {CATEGORIES.filter((category) => category.departmentId === editing.departmentId).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Short description" id="short">
              <input id="short" className={inputClass} value={editing.shortDescription} onChange={(event) => setEditing({ ...editing, shortDescription: event.target.value })} />
            </Field>
            <Field label="Barcode" id="barcode">
              <input id="barcode" className={inputClass} value={editing.barcode} onChange={(event) => setEditing({ ...editing, barcode: event.target.value })} />
            </Field>
            <Num label="Price" value={editing.price} onChange={(price) => setEditing({ ...editing, price })} />
            <Num label="Cost" value={editing.costPrice} onChange={(costPrice) => setEditing({ ...editing, costPrice })} />
            <Num label="Compare-at" value={editing.compareAtPrice ?? 0} onChange={(compareAtPrice) => setEditing({ ...editing, compareAtPrice: compareAtPrice || undefined })} />
            <Field label="Unit" id="unit">
              <select id="unit" className={inputClass} value={editing.unit} onChange={(event) => setEditing({ ...editing, unit: event.target.value as Unit })}>
                {(["kg", "piece", "loaf", "set"] as Unit[]).map((unit) => (
                  <option key={unit}>{unit}</option>
                ))}
              </select>
            </Field>
            <Num label="Tax %" value={editing.taxRate} onChange={(taxRate) => setEditing({ ...editing, taxRate })} />
            <Num label="Stock" value={editing.stockOnHand} onChange={(stockOnHand) => setEditing({ ...editing, stockOnHand })} />
            <Num label="Reorder at" value={editing.reorderLevel} onChange={(reorderLevel) => setEditing({ ...editing, reorderLevel })} />
            <Num label="Lead hours" value={editing.leadTimeHours} onChange={(leadTimeHours) => setEditing({ ...editing, leadTimeHours })} />
            <Num label="Shelf life days" value={editing.shelfLifeDays ?? 0} onChange={(shelfLifeDays) => setEditing({ ...editing, shelfLifeDays: shelfLifeDays || undefined })} />
            <Num label="Weight kg" value={editing.weightKg} onChange={(weightKg) => setEditing({ ...editing, weightKg })} />
            <Field label="Supplier" id="sup">
              <select id="sup" className={inputClass} value={editing.supplierId ?? ""} onChange={(event) => setEditing({ ...editing, supplierId: event.target.value || undefined })}>
                <option value="">None</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Long description" id="long">
            <textarea id="long" className={`${inputClass} min-h-24 py-2`} value={editing.longDescription} onChange={(event) => setEditing({ ...editing, longDescription: event.target.value })} />
          </Field>
          <div className="flex flex-wrap gap-3 text-sm">
            <Check label="Active" checked={editing.active} onChange={(active) => setEditing({ ...editing, active })} />
            <Check label="Featured" checked={editing.featured} onChange={(featured) => setEditing({ ...editing, featured })} />
            <Check label="Track expiry" checked={editing.trackExpiry} onChange={(trackExpiry) => setEditing({ ...editing, trackExpiry })} />
            <Check label="Made to order" checked={editing.isMadeToOrder} onChange={(isMadeToOrder) => setEditing({ ...editing, isMadeToOrder })} />
            <Check label="Assembly" checked={Boolean(editing.assemblyRequired)} onChange={(assemblyRequired) => setEditing({ ...editing, assemblyRequired })} />
          </div>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <label key={tag} className="inline-flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={editing.tags.includes(tag)}
                  onChange={(event) => {
                    const tags: Tag[] = event.target.checked ? [...editing.tags, tag] : editing.tags.filter((entry) => entry !== tag);
                    setEditing({ ...editing, tags });
                  }}
                />
                {tag}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Save product</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Close
            </Button>
            {!isNew && pendingDelete !== editing.id ? (
              <Button type="button" variant="danger" onClick={() => setPendingDelete(editing.id)}>
                Remove item
              </Button>
            ) : null}
            {!isNew && pendingDelete === editing.id ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  const result = remove(editing.id);
                  if (!result.ok) toast.error(result.message);
                  else {
                    toast.success(`${editing.name} removed. Past orders stay.`);
                    setEditing(null);
                    setPendingDelete(null);
                  }
                }}
              >
                Yes, remove {editing.name}
              </Button>
            ) : null}
          </div>
          {!isNew ? (
            <div className="border-t border-line pt-3">
              <h3 className="font-semibold">Stock adjustment</h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                <input className={inputClass} type="number" value={delta} onChange={(event) => setDelta(Number(event.target.value))} aria-label="Quantity change" />
                <select className={inputClass} value={reason} onChange={(event) => setReason(event.target.value as StockReason)} aria-label="Reason">
                  <option value="received">Received</option>
                  <option value="sold">Sold</option>
                  <option value="waste">Waste</option>
                  <option value="count">Count</option>
                </select>
                <input className={inputClass} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why" aria-label="Adjustment note" />
                <Button
                  type="button"
                  onClick={() => {
                    const result = adjust(editing.id, delta, reason, note);
                    if (!result.ok) toast.error(result.message);
                    else {
                      toast.success("Stock updated");
                      setEditing({ ...editing, stockOnHand: editing.stockOnHand + delta });
                      setNote("");
                    }
                  }}
                >
                  Adjust
                </Button>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {log
                  .filter((entry) => entry.productId === editing.id)
                  .slice(0, 5)
                  .map((entry) => (
                    <li key={entry.id}>
                      {entry.delta > 0 ? "+" : ""}
                      {entry.delta} · {entry.reason} · {entry.note}
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <Field label={label}>
      <input className={inputClass} type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </Field>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline-flex min-h-11 items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
