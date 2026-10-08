import { Armchair, BookOpen, Croissant, ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/cn";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-forest", className)}>
      <span className="grid grid-cols-2 gap-0.5" aria-hidden="true">
        <ShoppingBasket className="size-3.5" strokeWidth={2.25} />
        <Croissant className="size-3.5 text-bake-deep" strokeWidth={2.25} />
        <Armchair className="size-3.5 text-walnut" strokeWidth={2.25} />
        <BookOpen className="size-3.5 text-ink-fill" strokeWidth={2.25} />
      </span>
      <span className={cn("font-display text-xl leading-none font-semibold tracking-tight", compact && "max-sm:hidden")}>
        Dalema
      </span>
    </span>
  );
}
