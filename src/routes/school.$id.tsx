import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop-shell";
import { Button, Empty, Money } from "@/components/ui";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/school/$id")({
  component: SchoolPage,
});

function SchoolPage() {
  const { id } = Route.useParams();
  const list = useDallema((state) => state.schoolLists.find((entry) => entry.id === id));
  const products = useDallema((state) => state.products);
  const add = useDallema((state) => state.addToCart);
  if (!list) {
    return (
      <ShopShell>
        <Empty title="That list isn’t on the desk" body="Ask in the bookstore. We keep the current term’s list here." />
      </ShopShell>
    );
  }
  const rows = list.items.map((item) => ({
    item,
    product: products.find((product) => product.id === item.productId),
  }));
  return (
    <ShopShell>
      <p className="text-sm font-semibold tracking-wide text-ink uppercase">Bookstore</p>
      <h1 className="mt-1 font-display text-4xl text-forest-ink">{list.name}</h1>
      <p className="mt-2 max-w-xl text-muted">
        In-stock items can go straight into your basket. If something is short, the shop will say so rather than promise it.
      </p>
      <ul className="mt-6 divide-y divide-line rounded-card border border-line bg-card">
        {rows.map(({ item, product }) => (
          <li key={item.productId} className="flex items-center justify-between gap-3 p-4">
            <div>
              {product ? (
                <Link to="/p/$slug" params={{ slug: product.slug }} className="font-semibold underline">
                  {product.name}
                </Link>
              ) : (
                <p>{item.productId}</p>
              )}
              <p className="text-sm text-muted">
                Qty {item.qty}
                {product ? ` · ${product.stockOnHand} in stock` : ""}
              </p>
            </div>
            {product ? <Money value={product.price * item.qty} /> : null}
          </li>
        ))}
      </ul>
      <Button
        className="mt-4"
        onClick={() => {
          const skipped: string[] = [];
          rows.forEach(({ item, product }) => {
            if (!product) return;
            const result = add({ productId: product.id, qty: item.qty });
            if (!result.ok) skipped.push(product.name);
          });
          if (skipped.length) toast.error(`Left out: ${skipped.join(", ")}`);
          else toast.success("In-stock list items are in your basket");
        }}
      >
        Add in-stock items
      </Button>
    </ShopShell>
  );
}
