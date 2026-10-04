import { cn } from "@/lib/utils";
import type { ShipmentStatus, PaymentStatus } from "@/types";

const statusStyles: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  CONFIRMED: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  PICKUP_SCHEDULED: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30",
  COURIER_ASSIGNED: "bg-violet-500/15 text-violet-700 border-violet-500/30",
  PICKED_UP: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  IN_TRANSIT: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  OUT_FOR_DELIVERY: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  DELIVERED: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  CANCELLED: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  FAILED: "bg-red-500/15 text-red-700 border-red-500/30",
  INITIATED: "bg-slate-500/15 text-slate-700 border-slate-500/30",
  PENDING: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  UNPAID: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  PAID: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  REFUNDED: "bg-slate-500/15 text-slate-700 border-slate-500/30",
};

export function StatusBadge({
  status,
}: {
  status: ShipmentStatus | PaymentStatus | string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        statusStyles[status] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}