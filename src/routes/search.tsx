import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopShell } from "@/components/shop-shell";
import { ProductCard } from "@/components/product-card";
import { DeptLinks, Empty } from "@/components/ui";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const query = q ?? "";
  const products = useDallema((state) => state.products);
  const needle = query.trim().toLowerCase();
  const results = needle
    ? products.filter((product) => {
        const hay = [product.name, product.shortDescription, product.sku, product.tags.join(" "), product.departmentId]
          .join(" ")
          .toLowerCase();
        return product.active && hay.includes(needle);
      })
    : [];

  return (
    <ShopShell>
      <h1 className="font-display text-4xl text-forest-ink">Search</h1>
      <p className="mt-2 text-muted">
        {needle ? `Showing matches for “${query.trim()}”.` : "Type in the search bar. We’ll look across all four departments."}
      </p>
      {!needle ? (
        <div className="mt-6">
          <Empty
            title="Start with a word"
            body="Try rice, loaf, sofa, or WAEC. If you’re not sure, pick a department."
            action={<DeptLinks />}
          />
        </div>
      ) : results.length === 0 ? (
        <div className="mt-6">
          <Empty
            title="Nothing under that name"
            body="Check the spelling, or walk the departments. The shelf is one shop, not a warehouse."
            action={<DeptLinks />}
          />
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">{results.length} items</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <p className="mt-6 text-sm">
            <Link to="/" className="font-semibold text-forest-ink underline">
              Back to the front of the shop
            </Link>
          </p>
        </>
      )}
    </ShopShell>
  );
}
