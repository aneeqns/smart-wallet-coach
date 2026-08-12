import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  emoji,
  title,
  subtitle,
  action,
}: {
  emoji: string;
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
          <span>{emoji}</span>
          {title}
        </h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  emoji,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
  tone?: "default" | "primary" | "warning" | "info" | undefined;
  emoji?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border p-4 shadow-soft transition-transform hover:-translate-y-0.5",
        tone === "primary" ? "bg-hero-gradient text-primary-foreground border-transparent" : "bg-card-gradient",
      )}
    >
      <p
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium",
          tone === "primary" ? "text-primary-foreground/85" : "text-muted-foreground",
        )}
      >
        {emoji && <span>{emoji}</span>}
        {label}
      </p>
      <p className="num-display mt-1.5 text-2xl font-extrabold sm:text-3xl">{value}</p>
      {hint && (
        <p className={cn("mt-1 text-xs", tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function SectionCard({
  title,
  desc,
  children,
  className,
  action,
}: {
  title?: string | undefined;
  desc?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-soft", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-base font-bold">{title}</h2>}
            {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function TipBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-accent/50 bg-accent/15 p-4 text-sm">
      <span className="mr-1.5">💡</span>
      {children}
    </div>
  );
}
