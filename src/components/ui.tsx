import { Link } from "@tanstack/react-router";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { DeptIcon } from "@/components/product-art";
import { HoverTip } from "@/components/hover-tip";
import { DEPARTMENTS, STATUS_LABEL, tone } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { naira } from "@/lib/format";
import type { DeptId, OrderStatus } from "@/lib/types";

export const inputClass =
  "min-h-12 w-full rounded-card border border-line bg-card px-3 text-base text-soil placeholder:text-muted";

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "bake";
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-card px-4 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-forest text-cream hover:bg-forest-deep",
        variant === "secondary" && "border border-forest-ink bg-card text-forest-ink hover:bg-forest-soft",
        variant === "ghost" && "bg-transparent text-forest-ink hover:bg-forest-soft",
        variant === "danger" && "border border-line bg-card text-danger hover:bg-danger-soft",
        variant === "bake" && "bg-bake text-on-bake hover:bg-bake-deep hover:text-cream",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  children,
  id,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium text-soil">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-sm text-muted">{hint}</span> : null}
    </label>
  );
}

export function Money({ value, className }: { value: number; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{naira(value)}</span>;
}

export function DeptChip({ id, solid = false }: { id: DeptId; solid?: boolean }) {
  const dept = DEPARTMENTS.find((entry) => entry.id === id);
  const name = dept?.name ?? id;
  return (
    <HoverTip label={name} side="bottom">
      <span
        aria-label={name}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full",
          solid ? tone(id).solid : tone(id).chip,
        )}
      >
        <DeptIcon id={id} className="size-4" />
      </span>
    </HoverTip>
  );
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const toneClass =
    status === "completed"
      ? "bg-forest-soft text-forest-ink"
      : status === "cancelled"
        ? "bg-danger-soft text-danger"
        : status === "pending"
          ? "bg-bake-soft text-bake-ink"
          : "bg-ink-soft text-ink";
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", toneClass)}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-card px-5 py-10 text-center">
      <h2 className="font-display text-2xl text-forest-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function DeptLinks() {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {DEPARTMENTS.map((dept) => (
        <HoverTip key={dept.id} label={dept.name}>
          <Link
            to="/shop/$dept"
            params={{ dept: dept.slug }}
            aria-label={dept.name}
            className={cn(
              "inline-flex size-12 items-center justify-center rounded-full",
              tone(dept.id).panel,
            )}
          >
            <DeptIcon id={dept.id} className="size-5" />
          </Link>
        </HoverTip>
      ))}
    </div>
  );
}
