import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopShell } from "@/components/shop-shell";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/store")({
  component: StorePage,
});

function StorePage() {
  const settings = useDallema((state) => state.settings);
  return (
    <ShopShell>
      <h1 className="font-display text-4xl text-forest-ink">{settings.storeName}</h1>
      <p className="mt-2 max-w-xl text-muted">
        Shop from the comfort of home. Dalema packs the supermarket, the oven, and the bookstore, then brings the order to your door in Kaduna, often the same day if you send it before 4pm. The van leaves from No. 70 Isa Kaita Road, Ungwan Munchi, beside Zamani College. You can still collect at the shop if you prefer.
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card title="Address" body={settings.address} />
        <Card title="Phone" body={settings.phone} />
        <Card title="Hours" body={settings.hours} />
        <div className="rounded-card border border-line bg-card p-4">
          <dt className="text-sm font-semibold tracking-wide uppercase">Delivery zones</dt>
          <dd className="mt-2 space-y-2 text-sm">
            {settings.zones.map((zone) => (
              <p key={zone.id}>
                {zone.name}: ₦{zone.fee.toLocaleString("en-NG")}, minimum shop of ₦{zone.minimum.toLocaleString("en-NG")} for groceries, bakes, and books.
              </p>
            ))}
            <p>The near zone is the college side: Malali, Ungwan Rimi, and Ungwan Munchi, plus Kabala. The farther zone covers Barnawa, Kawo, Sabon Tasha, and Kakuri.</p>
            <p>Pickup at the shop is free.</p>
            <p>Furniture delivery is ₦{settings.furnitureDeliveryFee.toLocaleString("en-NG")} unless the zone fee is higher. We charge the higher one, not both.</p>
          </dd>
        </div>
      </dl>
      <p className="mt-6 text-sm">
        <Link to="/school/$id" params={{ id: "sch_p4t1" }} className="font-semibold text-forest-ink underline">
          Primary 4 Term 1 school list
        </Link>
      </p>
    </ShopShell>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-card border border-line bg-card p-4">
      <dt className="text-sm font-semibold tracking-wide uppercase">{title}</dt>
      <dd className="mt-2">{body}</dd>
    </div>
  );
}
