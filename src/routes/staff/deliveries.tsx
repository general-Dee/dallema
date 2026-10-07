import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/staff/deliveries")({
  component: DeliveriesPage,
});

function DeliveriesPage() {
  const jobs = useDallema((state) => state.deliveryJobs).filter((job) => job.type === "furniture");
  const orders = useDallema((state) => state.orders);
  const mark = useDallema((state) => state.markDelivery);
  return (
    <div>
      <h1 className="font-display text-4xl text-forest-ink">Furniture deliveries</h1>
      <p className="mt-2 text-sm text-muted">The van is separate from grocery runs. Assembly is noted when the customer asked for it.</p>
      <div className="mt-4 overflow-x-auto rounded-card border border-line bg-card">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Window</th>
              <th className="p-3 font-medium">Address</th>
              <th className="p-3 font-medium">Assembly</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const order = orders.find((entry) => entry.id === job.orderId);
              return (
                <tr key={job.id} className="border-b border-line">
                  <td className="p-3 font-semibold">{order?.number}</td>
                  <td className="p-3">{job.window}</td>
                  <td className="p-3">{job.address}</td>
                  <td className="p-3">{job.assemblyRequired ? "Yes" : "No"}</td>
                  <td className="p-3">{job.status === "delivered" ? "Delivered" : "Scheduled"}</td>
                  <td className="p-3">
                    {job.status !== "delivered" ? (
                      <Button
                        onClick={() => {
                          const result = mark(job.id, "delivered");
                          if (!result.ok) toast.error(result.message);
                          else toast.success("Marked delivered");
                        }}
                      >
                        Mark delivered
                      </Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
