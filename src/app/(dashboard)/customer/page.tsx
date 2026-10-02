"use client";

import Link from "next/link";
import {
  Package,
  Plus,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search, // <-- ADDED MISSING IMPORT
} from "lucide-react";
import { useGetMe, useMyShipments, useMyPayments } from "@/hooks";
import { Button } from "@/components/ui/button";
import type { Shipment } from "@/types";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";

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

  const shipPayload = (shipData as any)?.data?.data
    ? (shipData as any).data
    : (shipData as any)?.data
      ? shipData
      : shipData;
  const shipments: Shipment[] = shipPayload?.data ?? [];
  const shipMeta = shipPayload?.meta;

  const payPayload = (payData as any)?.data?.data
    ? (payData as any).data
    : (payData as any)?.data
      ? payData
      : payData;
  const payments = payPayload?.data ?? [];

  const total = shipMeta?.total ?? shipments.length;
  const pendingPay = shipments.filter(
    (s) => s.paymentStatus === "UNPAID" || s.status === "PENDING_PAYMENT"
  ).length;
  const inTransit = shipments.filter((s) =>
    ["IN_TRANSIT", "OUT_FOR_DELIVERY", "PICKED_UP", "COURIER_ASSIGNED"].includes(
      s.status
    )
  ).length;
  const delivered = shipments.filter((s) => s.status === "DELIVERED").length;

  const stats = [
    {
      label: "Total Shipments",
      value: total,
      icon: Package,
      color: "text-chart-1 bg-chart-1/15",
    },
    {
      label: "Awaiting Payment",
      value: pendingPay,
      icon: AlertCircle,
      color: "text-amber-600 bg-amber-500/15",
    },
    {
      label: "In Transit",
      value: inTransit,
      icon: Truck,
      color: "text-sky-600 bg-sky-500/15",
    },
    {
      label: "Delivered",
      value: delivered,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-500/15",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-chart-1">Customer Dashboard</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage parcels, payments and live tracking in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/customer/shipments/create">
            <Button
              type="button"
              className="rounded-full bg-chart-1 font-semibold text-emerald-950 hover:bg-chart-2"
            >
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Shipments */}
        <section className="rounded-2xl border border-border bg-card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Recent Shipments</h2>
            <Link
              href="/customer/shipments"
              className="text-xs font-semibold text-chart-1 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {shipsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-muted/40 m-3 rounded-xl" />
              ))
            ) : shipments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
                <Package className="h-8 w-8 opacity-40" />
                No shipments yet
                <Link href="/customer/shipments/create">
                  <Button type="button" size="sm" className="mt-2 rounded-full">
                    Create first shipment
                  </Button>
                </Link>
              </div>
            ) : (
              shipments.map((s) => (
                <Link
                  key={s.id}
                  href={`/customer/shipments/${s.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold">
                      {s.trackingNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.packageType?.replaceAll("_", " ")}
                      {s.weight ? ` · ${s.weight} kg` : ""}
                      {" · "}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={s.status} />
                    <StatusBadge status={s.paymentStatus} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Quick Actions & Payments */}
        <section className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 font-semibold">Quick Actions</h2>
            <div className="grid gap-2">
              {[
                {
                  href: "/customer/shipments/create",
                  label: "Book a Delivery",
                  icon: Plus,
                },
                {
                  href: "/customer/shipments",
                  label: "All Shipments",
                  icon: Package,
                },
                {
                  href: "/customer/payments",
                  label: "Payment History",
                  icon: CreditCard,
                },
                { href: "/track", label: "Track a Parcel", icon: Search },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm transition hover:border-chart-1/40 hover:bg-chart-1/5"
                  >
                    <Icon className="h-4 w-4 text-chart-1" />
                    {a.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Latest Payments</h2>
              <Link
                href="/customer/payments"
                className="text-xs font-semibold text-chart-1 hover:underline"
              >
                All
              </Link>
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet</p>
            ) : (
              <ul className="space-y-2.5">
                {payments.slice(0, 4).map((p: any) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold">৳{p.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}