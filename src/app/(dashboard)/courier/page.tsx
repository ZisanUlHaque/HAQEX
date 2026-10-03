"use client";

import Link from "next/link";
import { Activity, ArrowRight, MapPin, PackageSearch, UserRound, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourierAnalytics, useCourierProfile, useCourierShipments, useGetMe } from "@/hooks";
import {
  getAnalyticsSeries,
  getErrorMessage,
  QueryError,
  responseList,
  responseRecord,
  unwrapData,
} from "@/components/dashboard/admin-ui";
import AnalyticsChart from "@/components/dashboard/analytics-chart";
import { CourierMetrics, getCourierMetrics } from "@/components/dashboard/courier-metrics";
import type { CourierShipment } from "@/types/courier";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";

type CurrentUser = { name?: string };

const shortcuts = [
  {
    href: "/courier/shipments",
    title: "Open a delivery",
    description: "Look up a shipment using its shipment ID.",
    icon: PackageSearch,
  },
  {
    href: "/courier/tracking",
    title: "Track a shipment",
    description: "Review the latest events with a tracking number.",
    icon: Activity,
  },
  {
    href: "/courier/hubs",
    title: "Hub network",
    description: "View hub locations and operating status.",
    icon: Warehouse,
  },
  {
    href: "/courier/profile",
    title: "Courier profile",
    description: "Update your personal details and profile image.",
    icon: UserRound,
  },
];

function nextAction(status: string) {
  const actions: Record<string, string> = {
    COURIER_ASSIGNED: "Pickup required",
    PICKED_UP: "Continue to hub",
    AT_ORIGIN_HUB: "Move shipment in transit",
    IN_TRANSIT: "Continue shipment routing",
    AT_DESTINATION_HUB: "Start delivery",
    OUT_FOR_DELIVERY: "Complete delivery",
    DELIVERY_FAILED: "Retry delivery or return",
    RETURN_INITIATED: "Return shipment",
    RETURN_IN_TRANSIT: "Complete return",
  };
  return actions[status] ?? "View shipment";
}

function formatSchedule(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Schedule unavailable"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function CourierOverviewPage() {
  const analytics = useCourierAnalytics();
  const courierProfileQuery = useCourierProfile();
  const me = useGetMe();
  const assignments = useCourierShipments({ page: 1, limit: 10 });
  const metrics = getCourierMetrics(analytics.data);
  const series = getAnalyticsSeries(analytics.data);
  const user = responseRecord<CurrentUser>(me.data);
  const courierProfile = responseRecord<{ availabilityStatus?: string }>(courierProfileQuery.data);
  const assignedShipments = responseList<CourierShipment>(assignments.data);
  const activeStatuses = [
    "OUT_FOR_DELIVERY",
    "DELIVERY_FAILED",
    "AT_DESTINATION_HUB",
    "IN_TRANSIT",
    "AT_ORIGIN_HUB",
    "PICKED_UP",
    "COURIER_ASSIGNED",
    "RETURN_INITIATED",
    "RETURN_IN_TRANSIT",
  ];
  const currentDelivery = assignedShipments
    .filter((shipment) => activeStatuses.includes(shipment.status))
    .sort((left, right) => activeStatuses.indexOf(left.status) - activeStatuses.indexOf(right.status))[0];
  const pickupAddress = currentDelivery?.addresses?.find((address) => address.type === "PICKUP");
  const deliveryAddress = currentDelivery?.addresses?.find((address) => address.type === "DELIVERY");
  const rawAnalytics = unwrapData(analytics.data);
  const hasAnalytics = rawAnalytics !== undefined && rawAnalytics !== null;

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Courier operations</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {user?.name ? `Good day, ${user.name.split(" ")[0]}` : "Your operations"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Your assigned work, courier performance, and operational tools.</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {courierProfile?.availabilityStatus && (
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-semibold">
              <span className={`h-2 w-2 rounded-full ${courierProfile.availabilityStatus === "AVAILABLE" ? "bg-emerald-500" : courierProfile.availabilityStatus === "BUSY" ? "bg-amber-500" : "bg-muted-foreground"}`} />
              {courierProfile.availabilityStatus === "AVAILABLE" ? "Ready for deliveries" : courierProfile.availabilityStatus === "BUSY" ? "Currently handling deliveries" : "Not accepting new work"}
            </span>
          )}
          <Link href="/courier/shipments" className="w-full sm:w-auto">
            <Button className="h-11 w-full rounded-xl px-5 text-sm sm:w-auto">
              <PackageSearch className="mr-2 h-4 w-4" /> Assigned shipments <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {analytics.isError ? (
        <QueryError
          message={getErrorMessage(analytics.error)}
          onRetry={() => void analytics.refetch()}
        />
      ) : analytics.isLoading ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Loading courier analytics" role="status">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-muted/70" />
          ))}
          <span className="sr-only">Loading courier analytics</span>
        </div>
      ) : (
        <>
          <CourierMetrics metrics={metrics} />
          <p className="text-xs text-muted-foreground">
            Active-workload and success-rate figures are withheld because the current analytics response does not consistently account for every active shipment stage.
          </p>
          {!hasAnalytics && (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-center">
              <Activity className="mx-auto mb-3 h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium">Courier analytics are not available yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No courier statistics were returned by the analytics service.
              </p>
            </div>
          )}
          {hasAnalytics && metrics.length === 0 && !series && (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
              The analytics response does not include numeric performance metrics or trend data.
            </div>
          )}
          {series && <AnalyticsChart data={series} title="Courier delivery trends" />}
        </>
      )}

      {assignments.isError ? (
        <QueryError
          message={getErrorMessage(assignments.error)}
          onRetry={() => void assignments.refetch()}
        />
      ) : assignments.isLoading ? (
        <div className="h-36 animate-pulse rounded-2xl bg-muted/70" role="status" aria-label="Loading current delivery" />
      ) : currentDelivery ? (
        <section className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm">
          <div className="flex flex-col gap-4 bg-primary/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Current delivery · {nextAction(currentDelivery.status)}</p>
              <h2 className="mt-2 break-all font-mono text-lg font-semibold">{currentDelivery.trackingNumber}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {deliveryAddress ? `Receiver: ${deliveryAddress.name} · ${deliveryAddress.city}, ${deliveryAddress.district}` : "Receiver details are not available"}
              </p>
              {deliveryAddress?.phone && <a href={`tel:${deliveryAddress.phone}`} className="mt-1 inline-flex min-h-9 items-center text-sm font-medium text-primary hover:underline">{deliveryAddress.phone}</a>}
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <StatusBadge status={currentDelivery.status} />
              <Link href={`/courier/shipments/${encodeURIComponent(currentDelivery.id)}`}>
                <Button className="h-10 shrink-0 rounded-xl px-4">Open task <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-3 border-t border-border p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pickup</p>
              <p className="mt-1 text-sm font-medium">{pickupAddress?.name || "Pickup contact unavailable"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{[pickupAddress?.addressLine, pickupAddress?.city, pickupAddress?.district].filter(Boolean).join(", ") || "Pickup address unavailable"}</p>
              {pickupAddress?.phone && <a href={`tel:${pickupAddress.phone}`} className="mt-1 inline-flex min-h-8 items-center text-xs text-primary">{pickupAddress.phone}</a>}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schedule</p>
              <p className="mt-1 text-sm">{currentDelivery.pickupSchedule ? formatSchedule(currentDelivery.pickupSchedule) : "No pickup time provided"}</p>
              <p className="mt-2 text-xs text-muted-foreground">Assigned shipment from your courier account.</p>
            </div>
          </div>
        </section>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <PackageSearch className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">No active deliveries</p>
            <p className="mt-0.5 text-xs text-muted-foreground">There are no in-progress assigned shipments on your current page.</p>
          </div>
          <Link href="/courier/shipments" className="ml-auto shrink-0 text-xs font-semibold text-primary hover:underline">View all</Link>
        </div>
      )}

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Quick access</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Tools for your day</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-28 items-start gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{title}</span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span>
              </span>
              <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      <aside className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/[0.045] p-4 sm:p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MapPin className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold">Shipment access</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Assigned-delivery listing is not available in the current API. Open deliveries by shipment ID; access and event permissions remain enforced by the shipment and tracking services.
          </p>
        </div>
      </aside>
    </div>
  );
}
