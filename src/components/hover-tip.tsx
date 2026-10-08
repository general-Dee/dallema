import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function HoverTip({
  label,
  children,
  className,
  side = "top",
}: {
  label: string;
  children: ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left";
}) {
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 hidden rounded-full bg-forest px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-cream opacity-0 shadow-card transition duration-150 [@media(hover:hover)]:block",
          "group-hover/tip:opacity-100 group-focus-within/tip:opacity-100",
          side === "top" &&
            "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1 group-hover/tip:translate-y-0 group-focus-within/tip:translate-y-0",
          side === "bottom" &&
            "top-[calc(100%+8px)] left-1/2 -translate-x-1/2 -translate-y-1 group-hover/tip:translate-y-0 group-focus-within/tip:translate-y-0",
          side === "left" && "top-1/2 right-[calc(100%+8px)] -translate-y-1/2",
        )}
      >
        {label}
      </span>
    </span>
  );
}
