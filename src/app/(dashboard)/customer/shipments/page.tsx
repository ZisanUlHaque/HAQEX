"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo, useCallback, useState, useEffect, Suspense } from "react";
import {
  Package,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  SearchX,
  FilterX,
} from "lucide-react";
import { useMyShipments } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Shipment, ShipmentListQuery, ShipmentStatus } from "@/types";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";

const STATUS_OPTIONS: Array<ShipmentStatus | ""> = [
  "",
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PICKUP_SCHEDULED",
  "COURIER_ASSIGNED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELIVERY_FAILED",
  "RETURN_INITIATED",
  "RETURN_IN_TRANSIT",
  "CANCELLED",
  "RETURNED",
  "FAILED",
];
function ShipmentsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query: ShipmentListQuery = useMemo(
    () => ({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      status: (searchParams.get("status") as ShipmentStatus) || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    }),
    [searchParams]
  );

  const [searchTerm, setSearchTerm] = useState(query.search || "");

  useEffect(() => {
    setSearchTerm(query.search || "");
  }, [query.search]);

  const { data, isLoading, isError, error } = useMyShipments(query);

  const payload = (data as any)?.data?.data
    ? (data as any).data
    : (data as any)?.data
      ? data
      : data;
  const shipments: Shipment[] = payload?.data ?? payload?.data ?? [];
  const meta = payload?.meta ?? {
    page: query.page || 1,
    limit: query.limit || 10,
    total: 0,
    totalPages: 1,
  };

  const setParams = useCallback(
    (patch: Record<string, string | number | undefined>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === "" || v === null) p.delete(k);
        else p.set(k, String(v));
      });
      router.push(`${pathname}?${p.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setParams({
      search: searchTerm.trim() || undefined,
      page: 1,
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setParams({
      search: undefined,
      page: 1,
    });
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    router.push(pathname);
  };

  const isFiltered = Boolean(query.search || query.status);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            My Shipments
          </h1>
          <p className="text-sm text-muted-foreground">
            Track, manage and create parcel deliveries
          </p>
        </div>
        <Link
          href="/customer/shipments/create"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-chart-1 px-4 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-chart-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Shipment
        </Link>
      </div>

      <div className="space-y-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 pr-10"
              placeholder="Search by Tracking ID (e.g. CRX-2026...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full"
                title="Clear Search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="shrink-0 font-medium"
          >
            Search
          </Button>

          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-chart-1/20"
            value={query.status || ""}
            onChange={(e) =>
              setParams({ status: e.target.value || undefined, page: 1 })
            }
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {String(s).replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </form>

        {isFiltered && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <span>Active filters:</span>
            {query.search && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-foreground font-mono">
                Searching: &quot;{query.search}&quot;
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="hover:text-rose-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {query.status && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-foreground">
                Status: {query.status.replaceAll("_", " ")}
                <button
                  type="button"
                  onClick={() => setParams({ status: undefined, page: 1 })}
                  className="hover:text-rose-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="h-6 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2"
            >
              Reset All
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-rose-600">
            {(error as any)?.message || "Failed to load shipments"}
          </div>
        ) : shipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            {isFiltered ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mb-4">
                  <SearchX className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  No Shipment Found
                </h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm leading-relaxed">
                  We couldn&apos;t find any parcel matching{" "}
                  {query.search && (
                    <span className="font-semibold text-foreground">
                      &quot;{query.search}&quot;
                    </span>
                  )}
                  {query.status && (
                    <span>
                      {" "}
                      with status <span className="font-semibold">{query.status}</span>
                    </span>
                  )}
                  . Please check for typos in the Tracking ID.
                </p>
                <div className="mt-5 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClearAllFilters}
                    className="rounded-full"
                  >
                    <FilterX className="mr-2 h-4 w-4" /> Clear Search & Filters
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground/60 mb-4">
                  <Package className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  No Shipments Yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  You haven&apos;t created any shipments yet. Create your first delivery to get started!
                </p>
                <Link
                  href="/customer/shipments/create"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-chart-1 px-4 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-chart-2"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Shipment
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Tracking</th>
                  <th className="px-4 py-3 font-medium">Package</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Fee</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">
                      {s.trackingNumber}
                    </td>
                    <td className="px-4 py-3">
                      {s.packageType?.replaceAll("_", " ")}
                      {s.weight ? ` · ${s.weight} kg` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.paymentStatus} />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {s.deliveryFee != null ? `৳${s.deliveryFee}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/customer/shipments/${s.id}`)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Page {meta.page} of {meta.totalPages} · {meta.total} total
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={meta.page <= 1}
                onClick={() => setParams({ page: meta.page - 1 })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setParams({ page: meta.page + 1 })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyShipmentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading shipments…</div>}>
      <ShipmentsContent />
    </Suspense>
  );
}