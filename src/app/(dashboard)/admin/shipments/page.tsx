"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Package, RefreshCw } from "lucide-react";
import { useAllShipments } from "@/hooks";
import type { Shipment } from "@/types";
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
  SearchField,
  TablePager,
} from "@/components/dashboard/admin-ui";

const PAGE_SIZE = 10;
const shipmentStatuses = [
  "PENDING_PAYMENT", "CONFIRMED", "PICKUP_SCHEDULED", "COURIER_ASSIGNED",
  "PICKED_UP", "AT_ORIGIN_HUB", "IN_TRANSIT", "OUT_FOR_DELIVERY",
  "DELIVERED", "DELIVERY_FAILED", "RETURN_INITIATED", "RETURN_IN_TRANSIT",
  "CANCELLED", "RETURNED", "FAILED",
];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default function AdminShipmentsPage() {
  const query = useAllShipments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const shipments = responseList<Shipment>(query.data);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return shipments.filter((shipment) => {
      const matchesSearch =
        !needle ||
        shipment.trackingNumber?.toLowerCase().includes(needle) ||
        shipment.customer?.name?.toLowerCase().includes(needle) ||
        shipment.customer?.email?.toLowerCase().includes(needle) ||
        shipment.courier?.name?.toLowerCase().includes(needle);
      return matchesSearch && (!status || shipment.status === status);
    });
  }, [search, shipments, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        eyebrow="Operations"
        title="Shipments"
        description="Review shipment progress, payment state, customer details and courier assignments."
        action={
          <Button type="button" variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}>
            <RefreshCw className={query.isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />
      <AdminSurface className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <SearchField
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder="Search tracking, customer or courier"
          />
          <select
            value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(1); }}
            aria-label="Filter shipments by status"
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            {shipmentStatuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
          </select>
          <span className="whitespace-nowrap px-1 text-xs text-muted-foreground">{filtered.length} records</span>
        </div>
        {query.isError ? (
          <div className="p-4">
            <QueryError message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
          </div>
        ) : query.isLoading ? (
          <div className="space-y-3 p-5"><AdminSkeleton rows={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={shipments.length === 0 ? "No shipments found" : "No matching shipments"}
            description={shipments.length === 0 ? "Shipment records will appear here when returned by the API." : "Try adjusting your search or status filter."}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-muted/45 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">Shipment</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Courier</th>
                    <th className="px-5 py-3.5">Shipment status</th>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Created</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageRows.map((shipment) => (
                    <tr key={shipment.id} className="transition hover:bg-muted/30">
                      <td className="px-5 py-4">
                        <Link href={`/admin/shipments/${shipment.id}`} className="font-semibold text-primary hover:underline">
                          {shipment.trackingNumber || shipment.id}
                        </Link>
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
                      <td className="px-5 py-4 font-medium tabular-nums">
                        {shipment.deliveryFee == null ? "—" : `৳${new Intl.NumberFormat().format(shipment.deliveryFee)}`}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(shipment.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/shipments/${shipment.id}`}
                          aria-label={`View shipment ${shipment.trackingNumber}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
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
          Shipment amounts display the delivery fee returned by the API.
        </p>
      )}
    </div>
  );
}
