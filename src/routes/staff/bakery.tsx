import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { addDays, formatDay, lagosDateString } from "@/lib/format";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/staff/bakery")({
  component: BakeryPage,
});

function BakeryPage() {
  const [date, setDate] = useState(lagosDateString());
  const jobs = useDallema((state) => state.bakeryJobs).filter((job) => job.date === date);
  const products = useDallema((state) => state.products);
  const save = useDallema((state) => state.saveBakery);
  const create = useDallema((state) => state.createBakeryJobs);
  return (
    <div>
      <h1 className="font-display text-4xl text-forest-ink">Bakery production</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Preorders are cakes and bakery lines booked for this date. Forecast is yesterday’s sales of the same item. Waste is recorded for the report and does not change shelf stock again.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium">
          Date
          <input type="date" className={`${inputClass} mt-1`} value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <Button
          onClick={() => {
            const result = create(date);
            if (!result.ok) toast.error(result.message);
            else toast.success(result.data.count ? `${result.data.count} jobs on the sheet` : "No preorders or yesterday sales for that date");
          }}
        >
          Create jobs from preorders
        </Button>
        <button type="button" className="text-sm underline" onClick={() => setDate(addDays(date, -1))}>
          Previous day
        </button>
        <button type="button" className="text-sm underline" onClick={() => setDate(addDays(date, 1))}>
          Next day
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">{formatDay(date)}</p>
      {jobs.length === 0 ? (
        <p className="mt-6 text-muted">No jobs for this date yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-card border border-line bg-card">
          <table className="min-w-[680px] w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="p-3 font-medium">Item</th>
                <th className="p-3 font-medium">Source</th>
                <th className="p-3 font-medium">Planned</th>
                <th className="p-3 font-medium">Baked</th>
                <th className="p-3 font-medium">Waste</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const product = products.find((entry) => entry.id === job.productId);
                return (
                  <tr key={job.id} className="border-b border-line">
                    <td className="p-3 font-medium">{product?.name ?? job.productId}</td>
                    <td className="p-3">{job.source}</td>
                    <td className="p-3">
                      <input
                        aria-label={`Planned ${product?.name ?? job.productId}`}
                        className={`${inputClass} w-24`}
                        type="number"
                        min={0}
                        value={job.qtyPlanned}
                        onChange={(event) => save(job.id, { qtyPlanned: Number(event.target.value) })}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        aria-label={`Baked ${product?.name ?? job.productId}`}
                        className={`${inputClass} w-24`}
                        type="number"
                        min={0}
                        value={job.qtyBaked}
                        onChange={(event) => save(job.id, { qtyBaked: Number(event.target.value) })}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        aria-label={`Waste ${product?.name ?? job.productId}`}
                        className={`${inputClass} w-24`}
                        type="number"
                        min={0}
                        value={job.qtyWaste}
                        onChange={(event) => save(job.id, { qtyWaste: Number(event.target.value) })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
