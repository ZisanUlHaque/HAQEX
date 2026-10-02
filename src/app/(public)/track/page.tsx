"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Package,
  MapPin,
  Loader2,
  SearchX,
  Home,
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTracking, useGetMe } from "@/hooks";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";

function TrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("tn") || searchParams.get("tracking") || "";

  const [input, setInput] = useState(initial);
  const [activeTn, setActiveTn] = useState(initial);

  const { data: meData } = useGetMe();
  const user = (meData as any)?.data ?? meData;

  const { data, isLoading, isError, isFetching, refetch } = useTracking(activeTn);

  // support { data: timelinePayload } or bare payload
  const result = (data as any)?.data?.trackingNumber
    ? (data as any).data
    : (data as any)?.data ?? data;

  const timeline: any[] = Array.isArray(result?.timeline)
    ? result.timeline
    : Array.isArray(result?.trackingEvents)
      ? result.trackingEvents
      : [];

  // newest first for UI
  const eventsNewestFirst = [...timeline].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const tn = input.trim().toUpperCase();
    if (!tn) return;
    setActiveTn(tn);
    router.push(`/track?tn=${encodeURIComponent(tn)}`);
  };

  const dashHref =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? "/admin"
      : user?.role === "COURIER"
        ? "/courier"
        : user?.role === "CUSTOMER"
          ? "/customer"
          : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:px-8">
      {/* Top nav actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <div className="flex flex-wrap gap-2">
          {dashHref && (
            <Link href={dashHref}>
              <Button type="button" variant="outline" size="sm" className="rounded-full gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          )}
          {!user && (
            <Link href="/login">
              <Button
                type="button"
                size="sm"
                className="rounded-full bg-chart-1 text-emerald-950 hover:bg-chart-2 font-semibold"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Track your shipment
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Enter your HAQEX tracking number (e.g. CRX-2026-XXXXXX)
        </p>
      </div>

      <form
        onSubmit={onSearch}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 font-mono"
            placeholder="CRX-2026-…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          disabled={isFetching}
          className="rounded-full bg-chart-1 font-semibold text-emerald-950 hover:bg-chart-2"
        >
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Track
        </Button>
      </form>

      {!activeTn && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          <Package className="mx-auto mb-3 h-10 w-10 opacity-40" />
          Enter a tracking number to see live status
        </div>
      )}

      {activeTn && isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Looking up {activeTn}…
        </div>
      )}

      {activeTn && isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
          <SearchX className="h-12 w-12 text-amber-600/80" />
          <h2 className="text-lg font-bold">Tracking number not found</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            No shipment matches{" "}
            <span className="font-mono font-semibold text-foreground">{activeTn}</span>.
            Check for typos and try again.
          </p>
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => refetch()}>
              Retry
            </Button>
            <Link href="/">
              <Button type="button" className="rounded-full bg-chart-1 text-emerald-950 hover:bg-chart-2">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      )}

      {result && result.trackingNumber && !isError && (
        <div className="space-y-6">
          {/* Summary card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tracking number
                </p>
                <p className="font-mono text-xl font-bold md:text-2xl">
                  {result.trackingNumber}
                </p>
              </div>
              <StatusBadge status={result.currentStatus} />
            </div>

            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Package: </span>
                <span className="font-medium">
                  {String(result.packageType || "").replaceAll("_", " ")}
                </span>
              </p>
              {result.originHub && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-chart-1" />
                  Origin: {result.originHub.name}, {result.originHub.city}
                </p>
              )}
              {result.destinationHub && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-chart-1" />
                  Destination: {result.destinationHub.name},{" "}
                  {result.destinationHub.city}
                </p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Timeline
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            {eventsNewestFirst.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tracking events yet. Current status:{" "}
                <StatusBadge status={result.currentStatus} />
              </p>
            ) : (
              <ol className="relative ml-2 space-y-5 border-l-2 border-border">
                {eventsNewestFirst.map((ev, idx) => (
                  <li key={ev.id || idx} className="relative ml-6 pb-1">
                    <span
                      className={`absolute -left-[1.9rem] mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-background ${
                        idx === 0 ? "bg-chart-1 ring-4 ring-chart-1/20" : "bg-muted-foreground/40"
                      }`}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={ev.status} />
                      {idx === 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-chart-1">
                          Latest event
                        </span>
                      )}
                      {ev.location && (
                        <span className="text-xs text-muted-foreground">
                          · {ev.location}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-foreground">
                      {ev.description || "Status updated"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {ev.createdAt
                        ? new Date(ev.createdAt).toLocaleString()
                        : ""}
                      {ev.creator?.name ? ` · ${ev.creator.name}` : ""}
                      {ev.createdByName ? ` · ${ev.createdByName}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}

            {/* Hint when status ≠ last event */}
            {eventsNewestFirst[0] &&
              result.currentStatus &&
              eventsNewestFirst[0].status !== result.currentStatus && (
                <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                  Note: Current status is{" "}
                  <strong>{String(result.currentStatus).replaceAll("_", " ")}</strong>,
                  but the latest timeline event is still{" "}
                  <strong>
                    {String(eventsNewestFirst[0].status).replaceAll("_", " ")}
                  </strong>
                  . Backend should create a tracking event on every status
                  change.
                </p>
              )}
          </div>

          {/* Bottom CTAs */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button type="button" variant="outline" className="rounded-full gap-1.5">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            {dashHref && (
              <Link href={dashHref}>
                <Button
                  type="button"
                  className="rounded-full bg-chart-1 text-emerald-950 hover:bg-chart-2 font-semibold gap-1.5"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            )}
            {user?.role === "CUSTOMER" && (
              <Link href="/customer/shipments">
                <Button type="button" variant="secondary" className="rounded-full gap-1.5">
                  <Package className="h-4 w-4" />
                  My Shipments
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-muted-foreground">
          Loading tracker…
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}