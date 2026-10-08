import { Armchair, BookOpen, Croissant, ShoppingBasket, type LucideIcon } from "lucide-react";
import { ProductMark } from "@/components/product-marks";
import { tone } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { DeptId, Product } from "@/lib/types";

const ICONS: Record<DeptId, LucideIcon> = {
  supermarket: ShoppingBasket,
  bakery: Croissant,
  furniture: Armchair,
  bookstore: BookOpen,
};

export function DeptIcon({ id, className }: { id: DeptId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon className={className} aria-hidden="true" />;
}

export function ProductArt({
  product,
  className,
}: {
  product: Pick<Product, "id" | "departmentId">;
  className?: string;
}) {
  const paint = tone(product.departmentId);
  return (
    <div
      className={cn("relative flex aspect-[5/4] items-center justify-center overflow-hidden", paint.panel, className)}
      aria-hidden="true"
    >
      <ProductMark id={product.id} departmentId={product.departmentId} />
    </div>
  );
}
