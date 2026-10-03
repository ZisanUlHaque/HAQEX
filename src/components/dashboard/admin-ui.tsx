"use client";

import { useEffect, type ReactNode } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, LoaderCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function unwrapData(value: unknown): unknown {
  let current = value;
  for (let depth = 0; depth < 3; depth += 1) {
    if (!isRecord(current) || !("data" in current)) return current;
    current = current.data;
  }
  return current;
}

export function responseList<T>(value: unknown): T[] {
  let current = value;
  for (let depth = 0; depth < 4; depth += 1) {
    if (Array.isArray(current)) return current.filter(isRecord) as T[];
    if (!isRecord(current) || !("data" in current)) return [];
    current = current.data;
  }
  return Array.isArray(current) ? (current.filter(isRecord) as T[]) : [];
}

export function responseRecord<T>(value: unknown): T | undefined {
  const record = unwrapData(value);
  return isRecord(record) ? (record as T) : undefined;
}

export function responseMeta(value: unknown) {
  let current = value;
  for (let depth = 0; depth < 4; depth += 1) {
    if (!isRecord(current)) return undefined;
    if (isRecord(current.meta)) return current.meta;
    if (!("data" in current)) return undefined;
    current = current.data;
  }
  return undefined;
}

export function getNumericMetrics(value: unknown) {
  const record = unwrapData(value);
  if (!isRecord(record)) return [];

  return Object.entries(record)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
    .map(([key, amount]) => ({
      key,
      label: key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase()),
      amount,
    }));
}

export type NumericMetric = ReturnType<typeof getNumericMetrics>[number];

export type PieCategory = {
  name: string;
  value: number;
};

export type DashboardPieBreakdown = {
  title: string;
  categories: PieCategory[];
};

export function getDashboardPieBreakdown(
  metrics: NumericMetric[],
): DashboardPieBreakdown | undefined {
  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    pickupscheduled: "Pickup scheduled",
    courierassigned: "Courier assigned",
    pickedup: "Picked up",
    atoriginhub: "At origin hub",
    intransit: "In transit",
    outfordelivery: "Out for delivery",
    delivered: "Delivered",
    deliveryfailed: "Delivery failed",
    returninitiated: "Return initiated",
    returnintransit: "Return in transit",
    cancelled: "Cancelled",
    returned: "Returned",
    failed: "Failed",
  };
  const normalizedKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");
  const total = metrics.find((metric) => {
    const key = normalizedKey(metric.key);
    return key.includes("shipment") && key.includes("total");
  });
  if (total && total.amount > 0) {
    const counts = metrics.filter((metric) => {
      const key = normalizedKey(metric.key);
      return (
        key.includes("shipment") &&
        Object.keys(statusLabels).some((status) => key.includes(status))
      );
    });
    const knownCount = counts.reduce((sum, metric) => sum + Math.max(0, metric.amount), 0);
    if (counts.length >= 2 && knownCount <= total.amount) {
      const categories = counts
        .map((metric) => {
          const key = normalizedKey(metric.key);
          const status = Object.keys(statusLabels).find((item) => key.includes(item));
          return status
            ? { name: statusLabels[status], value: Math.max(0, metric.amount) }
            : undefined;
        })
        .filter((category): category is PieCategory => !!category && category.value > 0);
      const remainder = total.amount - knownCount;
      if (remainder > 0) categories.push({ name: "Other statuses", value: remainder });
      if (categories.length >= 2) {
        return { title: "Shipment status", categories };
      }
    }
  }

  const totalUsers = metrics.find((metric) => {
    const key = normalizedKey(metric.key);
    return key.includes("user") && key.includes("total");
  });
  if (!totalUsers || totalUsers.amount <= 0) return undefined;

  const roleMetrics = metrics.filter((metric) => {
    const key = normalizedKey(metric.key);
    return (
      key.includes("total") &&
      (key.includes("courier") || key.includes("customer") || key.includes("admin")) &&
      !key.includes("shipment")
    );
  });
  const roleCount = roleMetrics.reduce((sum, metric) => sum + Math.max(0, metric.amount), 0);
  if (roleMetrics.length === 0 || roleCount > totalUsers.amount) return undefined;

  const roles = roleMetrics
    .map((metric) => {
      const key = normalizedKey(metric.key);
      const role = key.includes("courier")
        ? "Courier"
        : key.includes("customer")
          ? "Customer"
          : "Admin";
      return { name: role, value: Math.max(0, metric.amount) };
    })
    .filter((category) => category.value > 0);
  const otherUsers = totalUsers.amount - roleCount;
  if (otherUsers > 0) roles.push({ name: "Other roles", value: otherUsers });
  return roles.length >= 2 ? { title: "User roles", categories: roles } : undefined;
}

export type AnalyticsSeries = {
  points: Array<Record<string, string | number>>;
  categoryKey: string;
  series: string[];
  sourceKey: string;
};

export function getAnalyticsSeries(value: unknown): AnalyticsSeries | undefined {
  const record = unwrapData(value);
  if (!isRecord(record)) return undefined;

  for (const [sourceKey, candidate] of Object.entries(record)) {
    if (!Array.isArray(candidate) || candidate.length < 2) continue;
    const rows = candidate.filter(isRecord);
    if (rows.length < 2) continue;

    const keys = Object.keys(rows[0]);
    const categoryKey = keys.find((key) =>
      rows.some((row) => typeof row[key] === "string" || typeof row[key] === "number"),
    );
    const series = keys.filter((key) =>
      key !== categoryKey &&
      rows.some((row) => typeof row[key] === "number" && Number.isFinite(row[key])),
    );
    if (series.length === 0 || !categoryKey) continue;

    const points = rows.map((row) => {
      const point: Record<string, string | number> = {};
      for (const key of [categoryKey, ...series]) {
        const field = row[key];
        if (typeof field === "string" || (typeof field === "number" && Number.isFinite(field))) {
          point[key] = field;
        }
      }
      return point;
    });
    return { points, categoryKey, series, sourceKey };
  }
  return undefined;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </header>
  );
}

export function AdminSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border/80 bg-card shadow-sm", className)}>
      {children}
    </section>
  );
}

export function AdminSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4" aria-label="Loading" role="status">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-12 rounded-xl bg-muted/70" />
      ))}
      <span className="sr-only">Loading data</span>
    </div>
  );
}

export function QueryError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 sm:flex-row sm:items-center">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Couldn&apos;t load this data</p>
        <p className="mt-0.5 break-words text-sm text-muted-foreground">{message}</p>
      </div>
      <Button type="button" variant="outline" onClick={onRetry}>Try again</Button>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Search className="h-5 w-5" />
      </span>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

export function StatusPill({ value }: { value: string }) {
  const normalized = value.toUpperCase();
  const style =
    ["ACTIVE", "COMPLETED", "DELIVERED", "PAID"].includes(normalized)
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : ["SUSPENDED", "FAILED", "CANCELLED", "INACTIVE", "REFUNDED"].includes(normalized)
        ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
        : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", style)}>
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function TablePager({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">Page {page} of {pages}</p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function AdminDialog({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        className="max-h-[90dvh] w-full max-w-xl animate-in slide-in-from-bottom-3 overflow-y-auto rounded-t-3xl border border-border bg-card shadow-2xl duration-200 sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2 id="admin-dialog-title" className="text-lg font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close dialog" onClick={onClose}>
            <X />
          </Button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">{footer}</div>}
      </section>
    </div>
  );
}

export function LoadingIndicator({ label = "Loading" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <LoaderCircle className="h-4 w-4 animate-spin" /> {label}
    </span>
  );
}

export function getErrorMessage(error: unknown) {
  if (isRecord(error) && typeof error.message === "string") return error.message;
  return "An unexpected error occurred. Please try again.";
}
