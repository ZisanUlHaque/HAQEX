"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Package, Search } from "lucide-react";
import type { CourierShipment } from "@/types/courier";
import type { ShipmentStatus } from "@/types";
import { useCourierShipments } from "@/hooks";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";
import {
  EmptyState,
  getErrorMessage,
  QueryError,
  responseList,
  responseMeta,
} from "@/components/dashboard/admin-ui";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;
const historyStatuses: ShipmentStatus[] = [
  "DELIVERED",
  "DELIVERY_FAILED",
  "RETURN_INITIATED",
  "RETURN_IN_TRANSIT",
  "RETURNED",
  "CANCELLED",
];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function CourierShipmentList({ history = false }: { history?: boolean }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const query = useCourierShipments({ page, limit: PAGE_SIZE, ...(status ? { status: status as ShipmentStatus } : {}) });
  const shipments = responseList<CourierShipment>(query.data);
  const meta = responseMeta(query.data);
  const total = typeof meta?.total === "number" ? meta.total : shipments.length;
  const pageSize = typeof meta?.limit === "number" ? meta.limit : PAGE_SIZE;
  const totalPages = Math.max(typeof meta?.totalPages === "number" ? meta.totalPages : 1, 1);
  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return shipments.filter((shipment) => {
      const isHistorical = historyStatuses.includes(shipment.status);
      const matchesMode = history ? isHistorical : !isHistorical;
      const matchesSearch = !needle || shipment.trackingNumber?.toLowerCase().includes(needle);
      return matchesMode && matchesSearch;
    });
  }, [history, search, shipments]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative block min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search tracking number on this page"
              aria-label="Search tracking number on the current API page"
              className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="sr-only" htmlFor="courier-filter-status">Filter by status</label>
          <select
            id="courier-filter-status"
            value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(1); }}
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            {(history ? historyStatuses : [
              "PENDING_PAYMENT",
              "CONFIRMED",
              "PICKUP_SCHEDULED",
              "COURIER_ASSIGNED",
              "PICKED_UP",
              "AT_ORIGIN_HUB",
              "IN_TRANSIT",
              "AT_DESTINATION_HUB",
              "OUT_FOR_DELIVERY",
            ] as ShipmentStatus[]).map((item) => (
              <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {total} assigned {total === 1 ? "shipment" : "shipments"}
            · {pageSize} per page
            {totalPages > 1 ? ` · API page ${page} of ${totalPages}` : ""}
          </p>
          {(search || status) && (
            <Button type="button" variant="ghost" className="h-9 rounded-lg px-3" onClick={resetFilters}>
              Clear filters
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Status and pagination are server-side. The courier shipment API does not currently support search; tracking search checks only the loaded page.</p>
      </section>

      {query.isError ? (
        <QueryError message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2" role="status" aria-label="Loading courier shipments">
          {["one", "two", "three", "four"].map((skeleton) => (
            <div key={skeleton} className="h-48 animate-pulse rounded-2xl bg-muted/70" />
          ))}
          <span className="sr-only">Loading courier shipments</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card">
          <EmptyState
            title={history ? "No delivery history found" : "No active assigned deliveries"}
            description={
              shipments.length === 0
                ? "No shipments have been assigned to your courier account."
                : "No shipments on this page match the selected filters."
            }
          />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((shipment) => {
            const pickup = shipment.addresses?.find((address) => address.type === "PICKUP");
            const delivery = shipment.addresses?.find((address) => address.type === "DELIVERY");
            return (
              <article
                key={shipment.id}
                className="group rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Package className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-mono text-sm font-semibold">{shipment.trackingNumber}</p>
                    <p className="mt-0.5 break-all text-[11px] text-muted-foreground">ID · {shipment.id}</p>
                  </div>
                  <StatusBadge status={shipment.status} />
                </div>
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  {delivery && (
                    <p className="flex items-start gap-2 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">Receiver · {delivery.name}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{delivery.addressLine}, {delivery.city}, {delivery.district}</span>
                      </span>
                    </p>
                  )}
                  {delivery?.phone && (
                    <p className="pl-6"><a href={`tel:${delivery.phone}`} className="inline-flex min-h-9 items-center text-xs font-medium text-primary hover:underline">{delivery.phone}</a></p>
                  )}
                  {pickup && (
                    <p className="pl-6 text-xs text-muted-foreground">Pickup · {pickup.name} · {pickup.city}, {pickup.district}</p>
                  )}
                  {shipment.customer?.name && (
                    <p className="text-xs text-muted-foreground">Sender · {shipment.customer.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {shipment.packageType.replaceAll("_", " ")}
                    {shipment.weight != null ? ` · ${shipment.weight} kg` : ""}
                    {shipment.pickupSchedule ? ` · Pickup ${formatDate(shipment.pickupSchedule)}` : ""}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">Updated {formatDate(shipment.updatedAt)}</span>
                    <Link href={`/courier/shipments/${encodeURIComponent(shipment.id)}`} className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      View delivery
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">API page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-10 rounded-lg px-3" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Button type="button" variant="outline" className="h-10 rounded-lg px-3" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
