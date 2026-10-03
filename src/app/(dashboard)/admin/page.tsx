"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  CircleAlert,
  Package,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminAnalytics, useAdminStats, useAllPayments, useAllShipments } from "@/hooks";
import type { Payment, Shipment } from "@/types";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";
import {
  AdminSkeleton,
  AdminSurface,
  EmptyState,
  getAnalyticsSeries,
  getErrorMessage,
  getNumericMetrics,
  PageHeader,
  QueryError,
  responseMeta,
  responseList,
  StatusPill,
} from "@/components/dashboard/admin-ui";

const metricIcons = [Users, Package, CreditCard, Activity];
const chartColors = ["#079c88", "#5b7cfa", "#e29a35", "#a16cf4"];
const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export default function AdminDashboardPage() {
  const statsQuery = useAdminStats();
  const analyticsQuery = useAdminAnalytics();
  const shipmentsQuery = useAllShipments();
  const failedShipmentsQuery = useAllShipments({ status: "DELIVERY_FAILED", page: 1, limit: 5, sortBy: "updatedAt", sortOrder: "desc" });
  const pendingPaymentsQuery = useAllPayments({ status: "PENDING", page: 1, limit: 5, sortBy: "createdAt", sortOrder: "desc" });
  const metrics = getNumericMetrics(statsQuery.data);
  const analytics = getAnalyticsSeries(analyticsQuery.data);
  const recentShipments = responseList<Shipment>(shipmentsQuery.data)
    .slice()
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 5);
  const failedShipments = responseList<Shipment>(failedShipmentsQuery.data);
  const pendingPayments = responseList<Payment>(pendingPaymentsQuery.data);
  const failedMeta = responseMeta(failedShipmentsQuery.data);
  const pendingPaymentMeta = responseMeta(pendingPaymentsQuery.data);

  return (
    <div className="mx-auto max-w-360 space-y-8 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        eyebrow="Platform overview"
        title="Good day. Here’s your operation."
        description="A live view of platform performance, shipment activity and the metrics returned by your admin services."
        action={
          <Link
            href="/admin/analytics"
            className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-border bg-card px-4 text-sm font-semibold shadow-sm transition hover:border-primary/40 hover:bg-muted sm:self-auto"
          >
            <BarChart3 className="h-4 w-4 text-primary" />
            View analytics
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        }
      />

      {statsQuery.isError ? (
        <QueryError
          message={getErrorMessage(statsQuery.error)}
          onRetry={() => void statsQuery.refetch()}
        />
      ) : statsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["one", "two", "three", "four"].map((skeleton) => (
            <div key={skeleton} className="h-36 animate-pulse rounded-2xl border border-border bg-card p-5">
              <div className="h-9 w-9 rounded-xl bg-muted" />
              <div className="mt-5 h-7 w-2/5 rounded bg-muted" />
              <div className="mt-2 h-3 w-3/5 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : metrics.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metricIcons[index % metricIcons.length];
            return (
              <AdminSurface key={metric.key} className="group p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Live
                  </span>
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-tight tabular-nums">
                  {new Intl.NumberFormat().format(metric.amount)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
              </AdminSurface>
            );
          })}
        </div>
      ) : (
        <AdminSurface>
          <EmptyState
            title="No summary metrics returned"
            description="The dashboard endpoint did not include numeric summary values. Analytics and operational records are shown below when available."
          />
        </AdminSurface>
      )}

      <section aria-labelledby="admin-attention-heading" className="space-y-4">
        <div>
          <h2 id="admin-attention-heading" className="text-lg font-semibold tracking-tight">Operational attention</h2>
          <p className="mt-1 text-sm text-muted-foreground">Exceptions and unsettled transactions returned by the operations APIs.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <AdminSurface className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <CircleAlert className="h-4 w-4 text-amber-600" />
                <h3 className="font-semibold">Failed deliveries</h3>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {typeof failedMeta?.total === "number" ? failedMeta.total : failedShipments.length}
              </span>
            </div>
            {failedShipmentsQuery.isError ? (
              <div className="p-4"><QueryError message={getErrorMessage(failedShipmentsQuery.error)} onRetry={() => void failedShipmentsQuery.refetch()} /></div>
            ) : failedShipmentsQuery.isLoading ? (
              <div className="p-5"><AdminSkeleton rows={3} /></div>
            ) : failedShipments.length === 0 ? (
              <EmptyState title="No failed deliveries" description="No failed-delivery shipments were returned by the API." />
            ) : (
              <ul className="divide-y divide-border">
                {failedShipments.map((shipment) => (
                  <li key={shipment.id}>
                    <Link href={`/admin/shipments/${shipment.id}`} className="flex min-h-16 items-center justify-between gap-3 px-5 py-3 hover:bg-muted/40">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{shipment.trackingNumber}</span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">{shipment.customer?.name || "Customer"}</span>
                      </span>
                      <StatusBadge status={shipment.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/shipments" className="block border-t border-border px-5 py-3 text-xs font-semibold text-primary hover:bg-muted/40">
              Open shipment management
            </Link>
          </AdminSurface>
          <AdminSurface className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-600" />
                <h3 className="font-semibold">Pending payments</h3>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {typeof pendingPaymentMeta?.total === "number" ? pendingPaymentMeta.total : pendingPayments.length}
              </span>
            </div>
            {pendingPaymentsQuery.isError ? (
              <div className="p-4"><QueryError message={getErrorMessage(pendingPaymentsQuery.error)} onRetry={() => void pendingPaymentsQuery.refetch()} /></div>
            ) : pendingPaymentsQuery.isLoading ? (
              <div className="p-5"><AdminSkeleton rows={3} /></div>
            ) : pendingPayments.length === 0 ? (
              <EmptyState title="No pending payments" description="No pending transactions were returned by the payment API." />
            ) : (
              <ul className="divide-y divide-border">
                {pendingPayments.map((payment) => (
                  <li key={payment.id} className="flex min-h-16 items-center justify-between gap-3 px-5 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{payment.shipment?.trackingNumber || payment.shipmentId}</span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">{payment.currency} {new Intl.NumberFormat().format(payment.amount)}</span>
                    </span>
                    <StatusPill value={payment.status} />
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/payments" className="block border-t border-border px-5 py-3 text-xs font-semibold text-primary hover:bg-muted/40">
              Open payment management
            </Link>
          </AdminSurface>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <AdminSurface className="min-w-0 p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold tracking-tight">Analytics</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Numeric series returned by your analytics service.
              </p>
            </div>
            {analytics && (
              <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                {analytics.sourceKey.replaceAll("_", " ")}
              </span>
            )}
          </div>
          {analyticsQuery.isError ? (
            <QueryError
              message={getErrorMessage(analyticsQuery.error)}
              onRetry={() => void analyticsQuery.refetch()}
            />
          ) : analyticsQuery.isLoading ? (
            <div className="h-72 animate-pulse rounded-xl bg-muted/60" />
          ) : analytics ? (
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.points} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    {analytics.series.map((key, index) => (
                      <linearGradient key={key} id={`admin-area-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 5" />
                  <XAxis dataKey={analytics.categoryKey} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                    labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                  />
                  {analytics.series.map((key, index) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={chartColors[index % chartColors.length]}
                      fill={`url(#admin-area-${index})`}
                      strokeWidth={2}
                      name={key.replaceAll("_", " ")}
                      connectNulls
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No chartable analytics returned"
              description="A chart appears when the analytics response contains categorized numeric series."
            />
          )}
          {analytics && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {analytics.series.map((series, index) => (
                <span key={series} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  {series.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          )}
        </AdminSurface>

        <AdminSurface className="min-w-0">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-semibold tracking-tight">Recent shipments</h2>
              <p className="mt-1 text-xs text-muted-foreground">Latest records from the shipment service</p>
            </div>
            <Link href="/admin/shipments" className="text-xs font-semibold text-primary hover:underline">View all</Link>
          </div>
          {shipmentsQuery.isError ? (
            <div className="p-4">
              <QueryError
                message={getErrorMessage(shipmentsQuery.error)}
                onRetry={() => void shipmentsQuery.refetch()}
              />
            </div>
          ) : shipmentsQuery.isLoading ? (
            <div className="space-y-3 p-5"><AdminSkeleton rows={4} /></div>
          ) : recentShipments.length === 0 ? (
            <EmptyState title="No shipments yet" description="Shipment activity will appear here when the API returns records." />
          ) : (
            <ul className="divide-y divide-border">
              {recentShipments.map((shipment) => (
                <li key={shipment.id}>
                  <Link
                    href={`/admin/shipments/${shipment.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{shipment.trackingNumber}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {shipment.customer?.name || "Customer"} · {formatDate(shipment.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={shipment.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminSurface>
      </div>
    </div>
  );
}
