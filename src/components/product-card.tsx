import { Link } from "@tanstack/react-router";
import { CalendarDays, Heart, Plus, Tag } from "lucide-react";
import { toast } from "sonner";
import { HoverTip } from "@/components/hover-tip";
import { ProductArt } from "@/components/product-art";
import { Button, DeptChip, Money } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useDallema, wishlistIds } from "@/lib/store";
import type { Product } from "@/lib/types";

export function WishButton({ productId, floating = false }: { productId: string; floating?: boolean }) {
  const wished = useDallema((state) => wishlistIds(state).includes(productId));
  const toggle = useDallema((state) => state.toggleWishlist);
  const label = wished ? "Saved" : "Save";
  return (
    <HoverTip label={label} side={floating ? "bottom" : "top"}>
      <button
        type="button"
        aria-pressed={wished}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        onClick={() => toggle(productId)}
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-full",
          floating ? "bg-card/95 shadow-sm hover:bg-cream-deep" : "hover:bg-cream-deep",
        )}
      >
        <Heart className={cn("size-5", wished ? "fill-danger text-danger" : "text-forest-ink")} />
      </button>
    </HoverTip>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const add = useDallema((state) => state.addToCart);
  const onOffer = product.compareAtPrice != null && product.compareAtPrice > product.price;
  return (
    <article className="lift flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-card">
      <div className="relative">
        <Link to="/p/$slug" params={{ slug: product.slug }} className="block" tabIndex={-1} aria-hidden="true">
          <ProductArt product={product} />
        </Link>
        <div className="absolute top-2.5 left-2.5">
          <DeptChip id={product.departmentId} solid />
        </div>
        {onOffer ? (
          <div className="absolute bottom-2.5 left-2.5">
            <HoverTip label="Offer">
              <span
                aria-label="Offer"
                className="inline-flex size-8 items-center justify-center rounded-full bg-bake text-on-bake"
              >
                <Tag className="size-4" aria-hidden="true" />
              </span>
            </HoverTip>
          </div>
        ) : null}
        <div className="absolute top-1.5 right-1.5">
          <WishButton productId={product.id} floating />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <Link to="/p/$slug" params={{ slug: product.slug }} className="line-clamp-2 font-display text-xl leading-tight text-soil">
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2">
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
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  product.isMadeToOrder || (product.stockOnHand > 0 && product.stockOnHand > product.reorderLevel)
                    ? "bg-forest"
                    : product.stockOnHand <= 0
                      ? "bg-danger"
                      : "bg-bake",
                )}
              />
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
            <HoverTip label="Choose a date">
              <Link
                to="/p/$slug"
                params={{ slug: product.slug }}
                aria-label="Choose a date"
                className="inline-flex size-12 items-center justify-center rounded-card bg-bake text-on-bake"
              >
                <CalendarDays className="size-5" aria-hidden="true" />
              </Link>
            </HoverTip>
          ) : (
            <HoverTip label={product.stockOnHand <= 0 ? "Out of stock" : "Add to basket"}>
              <Button
                className="size-12 px-0"
                aria-label="Add to basket"
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
                <Plus className="size-5" aria-hidden="true" />
              </Button>
            </HoverTip>
          )}
        </div>
      </div>
    </article>
  );
}
