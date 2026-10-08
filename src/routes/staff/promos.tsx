import { createFileRoute } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HoverTip } from "@/components/hover-tip";
import { Button, Field } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { DEPARTMENTS } from "@/lib/catalog";
import { naira } from "@/lib/format";
import { blankPromo, useDallema } from "@/lib/store";
import type { DeptId, PromoType } from "@/lib/types";

export const Route = createFileRoute("/staff/promos")({
  component: PromosPage,
});

function PromosPage() {
  const promos = useDallema((state) => state.promotions);
  const save = useDallema((state) => state.savePromo);
  const [draft, setDraft] = useState(blankPromo());
  return (
    <div>
      <h1 className="font-display text-4xl text-forest-ink">Promotions</h1>
      <p className="mt-2 text-sm text-muted">Codes don’t stack. Checkout uses the one code the customer typed.</p>
      <ul className="mt-4 space-y-2">
        {promos.map((promo) => (
          <li key={promo.id} className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line bg-card px-3 py-2">
            <div>
              <p className="font-semibold">{promo.code}</p>
              <p className="text-sm text-muted">
                {promo.label || (promo.type === "percent" ? `${promo.value}%` : naira(promo.value))} · min {naira(promo.minSpend)} · {promo.active ? "Active" : "Off"}
              </p>
            </div>
            <HoverTip label="Edit">
              <button
                type="button"
                aria-label={`Edit ${promo.code}`}
                className="inline-flex size-11 items-center justify-center rounded-full text-forest-ink hover:bg-forest-soft"
                onClick={() => setDraft(promo)}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
            </HoverTip>
          </li>
        ))}
      </ul>
      <form
        className="mt-6 max-w-xl space-y-3 rounded-card border border-line bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const isNew = !promos.some((promo) => promo.id === draft.id);
          const result = save({ ...draft, label: draft.label || describe(draft.type, draft.value) }, isNew);
          if (!result.ok) toast.error(result.message);
          else {
            toast.success("Promotion saved");
            setDraft(blankPromo());
          }
        }}
      >
        <h2 className="font-display text-2xl">Code</h2>
        <Field label="Code" id="code">
          <input id="code" className={inputClass} value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })} />
        </Field>
        <Field label="Type" id="type">
          <select id="type" className={inputClass} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as PromoType })}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed naira</option>
            <option value="bundle">Bundle (fixed naira)</option>
          </select>
        </Field>
        <Field label={draft.type === "percent" ? "Percent" : "Naira off"} id="value">
          <input id="value" type="number" className={inputClass} value={draft.value} onChange={(event) => setDraft({ ...draft, value: Number(event.target.value) })} />
        </Field>
        <Field label="Minimum spend" id="min">
          <input id="min" type="number" className={inputClass} value={draft.minSpend} onChange={(event) => setDraft({ ...draft, minSpend: Number(event.target.value) })} />
        </Field>
        <Field label="Label" id="label">
          <input id="label" className={inputClass} value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} />
        </Field>
        <fieldset>
          <legend className="text-sm font-medium">Limit to departments (none means the whole shop)</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {DEPARTMENTS.map((dept) => (
              <label key={dept.id} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.departmentIds.includes(dept.id)}
                  onChange={(event) => {
                    const departmentIds: DeptId[] = event.target.checked
                      ? [...draft.departmentIds, dept.id]
                      : draft.departmentIds.filter((id) => id !== dept.id);
                    setDraft({ ...draft, departmentIds });
                  }}
                />
                {dept.name}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} />
          Active
        </label>
        <Button type="submit">Save code</Button>
      </form>
    </div>
  );
}

function describe(type: PromoType, value: number) {
  return type === "percent" ? `${value}% off` : `${naira(value)} off`;
}
