"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Package, RefreshCw } from "lucide-react";
import { useAllShipments } from "@/hooks";
import type { PaymentStatus, Shipment, ShipmentListQuery, ShipmentStatus } from "@/types";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  AdminSkeleton,
  AdminSurface,
  EmptyState,
  getErrorMessage,
  PageHeader,
  QueryError,
  responseList,
  responseMeta,
  SearchField,
  TablePager,
} from "@/components/dashboard/admin-ui";

const PAGE_SIZE = 20;
const shipmentStatuses: ShipmentStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PICKUP_SCHEDULED",
  "COURIER_ASSIGNED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "AT_DESTINATION_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELIVERY_FAILED",
  "RETURN_INITIATED",
  "RETURN_IN_TRANSIT",
  "RETURNED",
  "CANCELLED",
];
const paymentStatuses: PaymentStatus[] = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function AdminShipmentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ShipmentStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ShipmentListQuery["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] = useState<ShipmentListQuery["sortOrder"]>("desc");
  const params = useMemo<ShipmentListQuery>(() => ({
    page,
    limit: PAGE_SIZE,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    sortBy,
    sortOrder,
  }), [page, paymentStatus, search, sortBy, sortOrder, status]);
  const query = useAllShipments(params);
  const shipments = responseList<Shipment>(query.data);
  const meta = responseMeta(query.data);
  const total = typeof meta?.total === "number" ? meta.total : shipments.length;
  const totalPages = typeof meta?.totalPages === "number" ? Math.max(meta.totalPages, 1) : 1;

  const toggleSort = (field: NonNullable<ShipmentListQuery["sortBy"]>) => {
    setSortOrder((current) => (sortBy === field && current === "desc" ? "asc" : "desc"));
    setSortBy(field);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        eyebrow="Operations"
        title="Shipments"
        description="Search and manage shipment operations using the paginated shipment service."
        action={
          <Button type="button" variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}>
            <RefreshCw className={query.isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />
      <AdminSurface className="overflow-hidden">
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_220px_180px_auto_auto]">
          <SearchField
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder="Search tracking or customer"
          />
          <label className="sr-only" htmlFor="admin-shipment-status">Shipment status</label>
          <select
            id="admin-shipment-status"
            value={status}
            onChange={(event) => { setStatus(event.target.value as ShipmentStatus | ""); setPage(1); }}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">All shipment statuses</option>
            {shipmentStatuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
          </select>
          <label className="sr-only" htmlFor="admin-payment-status">Payment status</label>
          <select
            id="admin-payment-status"
            value={paymentStatus}
            onChange={(event) => { setPaymentStatus(event.target.value as PaymentStatus | ""); setPage(1); }}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">All payment states</option>
            {paymentStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-input bg-background px-3 text-xs text-muted-foreground">
            Sort
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(event) => {
                const [field, direction] = event.target.value.split(":") as [NonNullable<ShipmentListQuery["sortBy"]>, NonNullable<ShipmentListQuery["sortOrder"]>];
                setSortBy(field);
                setSortOrder(direction);
                setPage(1);
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground"
              aria-label="Sort shipments"
            >
              <option value="createdAt:desc">Newest</option>
              <option value="createdAt:asc">Oldest</option>
              <option value="updatedAt:desc">Recently updated</option>
              <option value="trackingNumber:asc">Tracking A–Z</option>
              <option value="trackingNumber:desc">Tracking Z–A</option>
            </select>
          </label>
          <Button type="button" variant="ghost" className="h-10" onClick={clearFilters} disabled={!search && !status && !paymentStatus}>
            Clear filters
          </Button>
          <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-5">
            {total.toLocaleString()} shipments · Page {page} of {totalPages}
          </p>
        </div>
        {query.isError ? (
          <div className="p-4"><QueryError message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} /></div>
        ) : query.isLoading ? (
          <div className="space-y-3 p-5"><AdminSkeleton rows={6} /></div>
        ) : shipments.length === 0 ? (
          <EmptyState title="No shipments found" description="No shipments matched this API query. Try clearing some filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-muted/45 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">
                      <button type="button" onClick={() => toggleSort("trackingNumber")} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        Shipment {sortBy === "trackingNumber" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                      </button>
                    </th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Courier</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5">Destination</th>
                    <th className="px-5 py-3.5">
                      <button type="button" onClick={() => toggleSort("createdAt")} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        Created {sortBy === "createdAt" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                      </button>
                    </th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shipments.map((shipment) => {
                    const destination = shipment.addresses?.find((address) => address.type === "DELIVERY");
                    return (
                      <tr key={shipment.id} className="transition hover:bg-muted/30">
                        <td className="px-5 py-4">
                          <Link href={`/admin/shipments/${shipment.id}`} className="font-semibold text-primary hover:underline">{shipment.trackingNumber || shipment.id}</Link>
                          <p className="mt-1 text-xs text-muted-foreground">{shipment.packageType?.replaceAll("_", " ") || "Shipment"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{shipment.customer?.name || "—"}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{shipment.customer?.email || "—"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{shipment.courier?.name || "Unassigned"}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{shipment.courier?.phone || "—"}</p>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={shipment.status} /></td>
                        <td className="px-5 py-4"><StatusBadge status={shipment.paymentStatus} /></td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{destination?.city || "—"}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{destination?.district || ""}</p>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(shipment.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link href={`/admin/shipments/${shipment.id}`} aria-label={`View shipment ${shipment.trackingNumber}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TablePager page={page} pages={totalPages} onChange={setPage} />
          </>
        )}
      </AdminSurface>
      {shipments.length > 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          Courier and hub/date filters are not exposed by the current shipment-list endpoint.
        </p>
      )}
    </div>
  );
}
