import { Armchair, BookOpen, Croissant, ShoppingBasket, type LucideIcon } from "lucide-react";
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
  product: Pick<Product, "name" | "departmentId" | "imageLabel">;
  className?: string;
}) {
  const paint = tone(product.departmentId);
  return (
    <div className={cn("relative flex aspect-[5/4] items-center justify-center overflow-hidden", paint.panel, className)}>
      <DeptIcon id={product.departmentId} className="size-16 opacity-80" />
      <span className="absolute right-3 bottom-3 left-3 truncate text-xs font-medium tracking-wide uppercase">
        {product.imageLabel || product.name}
      </span>
    </div>
  );
}
