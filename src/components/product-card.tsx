import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { ProductArt } from "@/components/product-art";
import { Button, DeptChip, Money } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useDallema, wishlistIds } from "@/lib/store";
import type { Product } from "@/lib/types";

export function WishButton({ productId }: { productId: string }) {
  const wished = useDallema((state) => wishlistIds(state).includes(productId));
  const toggle = useDallema((state) => state.toggleWishlist);
  return (
    <button
      type="button"
      aria-pressed={wished}
      aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
      onClick={() => toggle(productId)}
      className="inline-flex size-11 items-center justify-center rounded-full hover:bg-cream-deep"
    >
      <Heart className={cn("size-5", wished ? "fill-danger text-danger" : "text-forest-ink")} />
    </button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const add = useDallema((state) => state.addToCart);
  const onOffer = product.compareAtPrice != null && product.compareAtPrice > product.price;
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-line bg-card shadow-card">
      <Link to="/p/$slug" params={{ slug: product.slug }} className="block">
        <ProductArt product={product} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <DeptChip id={product.departmentId} />
          <WishButton productId={product.id} />
        </div>
        <Link to="/p/$slug" params={{ slug: product.slug }} className="font-semibold leading-snug text-soil">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-muted">{product.shortDescription}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-lg font-semibold">
              <Money value={product.price} />
              <span className="text-sm font-normal text-muted"> / {product.unit}</span>
            </p>
            {onOffer ? (
              <p className="text-sm text-muted line-through">
                <Money value={product.compareAtPrice ?? 0} />
              </p>
            ) : null}
            <p className="text-xs text-muted">
              {product.isMadeToOrder
                ? `${product.leadTimeHours}h notice`
                : product.stockOnHand <= 0
                  ? "Out of stock"
                  : product.stockOnHand <= product.reorderLevel
                    ? `Only ${product.stockOnHand} left`
                    : "In stock"}
            </p>
          </div>
          {product.isMadeToOrder ? (
            <Link
              to="/p/$slug"
              params={{ slug: product.slug }}
              className="inline-flex min-h-12 items-center rounded-card bg-bake px-3 text-sm font-semibold text-on-bake"
            >
              Choose date
            </Link>
          ) : (
            <Button
              className="px-3"
              disabled={product.stockOnHand <= 0}
              onClick={() => {
                const result = add({
                  productId: product.id,
                  qty: 1,
                  assembly: product.assemblyRequired,
                });
                if (!result.ok) toast.error(result.message);
                else toast.success(`${result.data.name} added to your basket`);
              }}
            >
              Add
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
