"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import AnalyticsChart from "@/components/dashboard/analytics-chart";
import { getAnalyticsSeries, getNumericMetrics } from "@/components/dashboard/admin-ui";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";
import { useCustomerAnalytics, useGetMe, useMyPayments, useMyShipments } from "@/hooks";
import type { Payment, Shipment } from "@/types";

const normalizeMetricKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

function pickMetric(metrics: Array<{ key: string; amount: number }>, keys: string[]) {
  return metrics.find((metric) =>
    keys.some((key) => normalizeMetricKey(metric.key).includes(normalizeMetricKey(key))),
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CustomerOverviewPage() {
  const { data: meData } = useGetMe();
  const user = (meData as any)?.data ?? meData;

  const { data: shipData, isLoading: shipsLoading } = useMyShipments({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: payData } = useMyPayments({ page: 1, limit: 5 });
  const analyticsQuery = useCustomerAnalytics();

  const shipments: Shipment[] = ((shipData as any)?.data?.data ? (shipData as any).data : shipData)?.data ?? [];
  const payments: Payment[] = ((payData as any)?.data?.data ? (payData as any).data : payData)?.data ?? [];
  const analyticsMetrics = getNumericMetrics(analyticsQuery.data);
  const analyticsData = getAnalyticsSeries(analyticsQuery.data);

  const totalShipments = pickMetric(analyticsMetrics, ["totalShipments", "shipmentsTotal", "shipmentTotal"])?.amount ?? shipments.length;
  const activeShipments =
    pickMetric(analyticsMetrics, ["activeShipments", "openShipments", "inProgressShipments"])?.amount ??
    shipments.filter((shipment) => !["DELIVERED", "CANCELLED", "RETURNED"].includes(shipment.status)).length;
  const deliveredShipments =
    pickMetric(analyticsMetrics, ["deliveredShipments", "completedShipments"])?.amount ??
    shipments.filter((shipment) => shipment.status === "DELIVERED").length;
  const pendingShipments =
    pickMetric(analyticsMetrics, ["pendingShipments"])?.amount ??
    shipments.filter((shipment) => shipment.status === "PENDING_PAYMENT" || shipment.status === "CONFIRMED").length;
  const cancelledShipments =
    pickMetric(analyticsMetrics, ["cancelledShipments"])?.amount ??
    shipments.filter((shipment) => shipment.status === "CANCELLED").length;
  const totalSpent =
    pickMetric(analyticsMetrics, ["totalSpent", "totalPaymentsValue", "grossSpend"])?.amount ??
    payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const completedPayments =
    pickMetric(analyticsMetrics, ["completedPayments", "successfulPayments"])?.amount ??
    payments.filter((payment) => payment.status === "COMPLETED" || payment.status === "PAID").length;
  const pendingPayments =
    pickMetric(analyticsMetrics, ["pendingPayments", "initiatedPayments"])?.amount ??
    payments.filter((payment) => ["INITIATED", "PENDING"].includes(payment.status)).length;

  const stats = [
    { label: "Total Shipments", value: totalShipments, icon: Package, color: "text-chart-1 bg-chart-1/15" },
    { label: "Active Shipments", value: activeShipments, icon: Truck, color: "text-sky-600 bg-sky-500/15" },
    { label: "Delivered", value: deliveredShipments, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/15" },
    { label: "Pending", value: pendingShipments, icon: AlertCircle, color: "text-amber-600 bg-amber-500/15" },
    { label: "Cancelled", value: cancelledShipments, icon: AlertCircle, color: "text-rose-600 bg-rose-500/15" },
    { label: "Total Spent", value: formatCurrency(totalSpent), icon: Wallet, color: "text-violet-600 bg-violet-500/15" },
    { label: "Pending Payments", value: pendingPayments, icon: CreditCard, color: "text-amber-600 bg-amber-500/15" },
    { label: "Completed Payments", value: completedPayments, icon: ShieldCheck, color: "text-emerald-600 bg-emerald-500/15" },
  ];

  const recentActivity = [
    ...shipments.slice(0, 4).map((shipment) => ({
      title: `Shipment ${shipment.trackingNumber}`,
      description: `${shipment.status.replaceAll("_", " ")}`,
      meta: new Date(shipment.updatedAt || shipment.createdAt).toLocaleDateString(),
      href: `/customer/shipments/${shipment.id}`,
      tone: "shipment" as const,
    })),
    ...payments.slice(0, 3).map((payment) => ({
      title: `Payment ${payment.transactionId || payment.id}`,
      description: `${payment.method} · ${payment.status}`,
      meta: new Date(payment.createdAt).toLocaleDateString(),
      href: `/customer/payments?payment=${payment.id}`,
      tone: "payment" as const,
    })),
  ]
    .slice()
    .sort((left, right) => Date.parse(right.meta) - Date.parse(left.meta))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-chart-1">Customer Dashboard</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👜
          </h1>
          <p className="text-sm text-muted-foreground">
            Your shipments, payments and live delivery activity in one premium view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/customer/shipments/create">
            <Button type="button" className="rounded-full bg-chart-1 font-semibold text-emerald-950 hover:bg-chart-2">
              <Plus className="mr-2 h-4 w-4" />
              New Shipment
            </Button>
          </Link>
          <Link href="/track">
            <Button type="button" variant="outline" className="rounded-full">
              Track Parcel
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-chart-1/30">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {analyticsData && (
        <div className="rounded-2xl border border-border bg-card p-2 shadow-sm">
          <AnalyticsChart data={analyticsData} title="Customer activity" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Recent shipments</h2>
            <Link href="/customer/shipments" className="text-xs font-semibold text-chart-1 hover:underline">
              View all
            </Link>
          </div>

          <div className="divide-y divide-border">
            {shipsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="m-3 h-16 animate-pulse rounded-xl bg-muted/40" />
              ))
            ) : shipments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
                <Package className="h-8 w-8 opacity-40" />
                <span>No shipments yet</span>
                <Link href="/customer/shipments/create">
                  <Button type="button" size="sm" className="mt-2 rounded-full">
                    Create first shipment
                  </Button>
                </Link>
              </div>
            ) : (
              shipments.map((shipment) => (
                <Link key={shipment.id} href={`/customer/shipments/${shipment.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-muted/40">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold">{shipment.trackingNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {shipment.packageType?.replaceAll("_", " ")}
                      {shipment.weight ? ` · ${shipment.weight} kg` : ""}
                      {" · "}
                      {new Date(shipment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={shipment.status} />
                    <StatusBadge status={shipment.paymentStatus} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Quick actions</h2>
            <div className="grid gap-2">
              {[
                { href: "/customer/shipments/create", label: "Book a delivery", icon: Plus },
                { href: "/customer/shipments", label: "All shipments", icon: Package },
                { href: "/customer/payments", label: "Payment history", icon: CreditCard },
                { href: "/track", label: "Track a parcel", icon: Search },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm transition hover:border-chart-1/40 hover:bg-chart-1/5">
                    <Icon className="h-4 w-4 text-chart-1" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Recent activity</h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Live</span>
            </div>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity returned by the API yet.</p>
              ) : (
                recentActivity.map((item) => (
                  <Link key={`${item.title}-${item.meta}`} href={item.href} className="flex items-start gap-3 rounded-xl border border-border px-3 py-2.5 transition hover:bg-muted/40">
                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone === "payment" ? "bg-violet-500" : "bg-chart-1"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground">{item.meta}</div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Delivery status snapshot</h2>
            <p className="text-sm text-muted-foreground">Quick view of your current shipment health.</p>
          </div>
          <Link href="/customer/shipments" className="inline-flex items-center gap-2 text-sm font-semibold text-chart-1">
            Open shipments <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">On route</p>
            <p className="mt-3 text-2xl font-bold">{activeShipments}</p>
            <p className="mt-1 text-sm text-muted-foreground">Shipments actively moving.</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Delivered</p>
            <p className="mt-3 text-2xl font-bold">{deliveredShipments}</p>
            <p className="mt-1 text-sm text-muted-foreground">Completed deliveries.</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Payment status</p>
            <p className="mt-3 text-2xl font-bold">{pendingPayments}</p>
            <p className="mt-1 text-sm text-muted-foreground">Pending payment confirmations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}