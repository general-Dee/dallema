import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopShell } from "@/components/shop-shell";
import { ProductCard } from "@/components/product-card";
import { Empty } from "@/components/ui";
import { inputClass } from "@/components/ui";
import { CATEGORIES, departmentBySlug, tone } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { useDallema } from "@/lib/store";

export const Route = createFileRoute("/shop/$dept")({
  validateSearch: (search: Record<string, unknown>) => {
    const result: {
      cat?: string;
      sort?: "featured" | "price" | "name";
      stock?: "1";
    } = {};
    if (typeof search.cat === "string" && search.cat) result.cat = search.cat;
    if (search.sort === "price" || search.sort === "name" || search.sort === "featured") result.sort = search.sort;
    if (search.stock === "1") result.stock = "1";
    return result;
  },
  component: DepartmentPage,
});

function DepartmentPage() {
  const { dept: slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const dept = departmentBySlug(slug);
  const products = useDallema((state) => state.products);
  if (!dept) {
    return (
      <ShopShell>
        <Empty title="That department isn’t here" body="Dalema has supermarket, bakery, furniture, and bookstore." />
      </ShopShell>
    );
  }
  const cats = CATEGORIES.filter((category) => category.departmentId === dept.id);
  const sort = search.sort ?? "featured";
  const stock = search.stock ?? "0";
  let list = products.filter((product) => product.active && product.departmentId === dept.id);
  if (search.cat) list = list.filter((product) => product.categoryId === search.cat);
  if (stock === "1") list = list.filter((product) => product.isMadeToOrder || product.stockOnHand > 0);
  list = [...list].sort((a, b) => {
    if (sort === "price") return a.price - b.price;
    if (sort === "name") return a.name.localeCompare(b.name);
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <ShopShell>
      <div className={cn("rounded-card p-5", tone(dept.id).panel)}>
        <p className="text-sm font-semibold tracking-wide uppercase">Department</p>
        <h1 className="mt-1 font-display text-4xl">{dept.name}</h1>
        <p className="mt-2 max-w-xl">{dept.description}</p>
      </div>
      {dept.id === "bakery" ? (
        <p className="mt-4 rounded-card bg-bake-soft px-4 py-3 text-sm text-soil">
          Order before 4pm for tomorrow. Made-to-order cakes need a full day — the page will stop a date that is too soon.
        </p>
      ) : null}
      {dept.id === "furniture" ? (
        <p className="mt-4 rounded-card bg-walnut-soft px-4 py-3 text-sm text-walnut-deep">
          Furniture leaves on its own van, from two days out, inside our Kaduna zones. Assembly can be ticked on the product. It does not ride with the grocery order.
        </p>
      ) : null}
      {dept.id === "bookstore" ? (
        <p className="mt-4 rounded-card bg-ink-soft px-4 py-3 text-sm text-ink">
          School lists are packed in the shop.{" "}
          <Link to="/school/$id" params={{ id: "sch_p4t1" }} className="font-semibold underline">
            Open Primary 4 Term 1
          </Link>
          .
        </p>
      ) : null}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={!search.cat}
          onClick={() => void navigate({ search: { ...search, cat: undefined } })}
          label="All"
        />
        {cats.map((category) => (
          <FilterChip
            key={category.id}
            active={search.cat === category.id}
            onClick={() => void navigate({ search: { ...search, cat: category.id } })}
            label={category.name}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium" htmlFor="sort">
          Sort
        </label>
        <select
          id="sort"
          className={`${inputClass} w-auto`}
          value={sort}
          onChange={(event) =>
            void navigate({
              search: { ...search, sort: event.target.value as "featured" | "price" | "name" },
            })
          }
        >
          <option value="featured">Featured</option>
          <option value="price">Price</option>
          <option value="name">Name</option>
        </select>
        <label className="inline-flex min-h-12 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={stock === "1"}
            onChange={(event) =>
              void navigate({ search: { ...search, stock: event.target.checked ? "1" : undefined } })
            }
          />
          In stock only
        </label>
      </div>
      {list.length === 0 ? (
        <div className="mt-6">
          <Empty title="Nothing in this filter" body="Clear the category or the stock toggle. The shelf is not empty." />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </ShopShell>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold",
        active ? "bg-forest text-cream" : "bg-card text-forest-ink",
      )}
    >
      {label}
    </button>
  );
}
