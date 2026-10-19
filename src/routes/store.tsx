import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopShell } from "@/components/shop-shell";
import { branchLines, zonesByBranch } from "@/lib/branches";
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
        Shop from the comfort of home. Dalema packs the supermarket, the oven, and the bookstore, then brings the order to your door in Kaduna and Abuja, often the same day if you send it before 4pm. The Kaduna van leaves from No. 70 Isa Kaita Road, Ungwan Munchi, beside Zamani College, and the Abuja van from 45 Gana Street, Maitama. You can still collect at either branch if you prefer.
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {branchLines(settings).map((line) => (
          <Card key={line} title={line.split(": ")[0] + " branch"} body={line.split(": ").slice(1).join(": ")} />
        ))}
        {settings.phone.trim() ? <Card title="Phone" body={settings.phone} /> : null}
        <Card title="Hours" body={settings.hours} />
        <div className="rounded-card border border-line bg-card p-4">
          <dt className="text-sm font-semibold tracking-wide uppercase">Delivery zones</dt>
          <dd className="mt-2 space-y-2 text-sm">
            {zonesByBranch(settings).map((group) => (
              <div key={group.branch?.id ?? "other"} className="space-y-1">
                {group.branch ? <p className="font-semibold">{group.branch.city}</p> : null}
                {group.zones.map((zone) => (
                  <p key={zone.id}>
                    {zone.name}: ₦{zone.fee.toLocaleString("en-NG")}, minimum shop of ₦{zone.minimum.toLocaleString("en-NG")} for groceries, bakes, and books.
                  </p>
                ))}
              </div>
            ))}
            <p>In Kaduna, the near zone is the college side: Malali, Ungwan Rimi, and Ungwan Munchi, plus Kabala. The farther zone covers Barnawa, Kawo, Sabon Tasha, and Kakuri.</p>
            <p>In Abuja, the near zone is Maitama and Asokoro, around the Gana Street branch. Wuse, Garki, Central Area, Jabi, Utako, and Wuye come next, then Gwarinpa, Life Camp, Kado, Lugbe, Airport Road, Kubwa, Nyanya, and Karu.</p>
            <p>Pickup at either branch is free.</p>
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
