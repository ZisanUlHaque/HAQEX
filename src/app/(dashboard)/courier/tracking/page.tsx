"use client";

import { useState, type FormEvent } from "react";
import { Activity, Clock3, MapPin, RefreshCw, Search } from "lucide-react";
import { useTracking } from "@/hooks";
import type { TrackingTimeline } from "@/types";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";
import { getErrorMessage, QueryError, responseRecord } from "@/components/dashboard/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function CourierTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [activeTrackingNumber, setActiveTrackingNumber] = useState("");
  const tracking = useTracking(activeTrackingNumber);
  const result = responseRecord<TrackingTimeline>(tracking.data);
  const events = Array.isArray(result?.timeline)
    ? [...result.timeline].sort((first, second) => {
        const firstTime = new Date(first.createdAt).getTime();
        const secondTime = new Date(second.createdAt).getTime();
        return secondTime - firstTime;
      })
    : [];

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = trackingNumber.trim().toUpperCase();
    if (value) setActiveTrackingNumber(value);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-7 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Shipment activity</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Tracking timeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">Look up the real tracking events recorded for a shipment.</p>
      </header>

      <form onSubmit={submitSearch} className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <label htmlFor="courier-tracking-number" className="sr-only">Tracking number</label>
        <Input
          id="courier-tracking-number"
          value={trackingNumber}
          onChange={(event) => setTrackingNumber(event.target.value)}
          placeholder="Enter tracking number"
          autoComplete="off"
          required
          className="h-12 min-w-0 rounded-xl font-mono"
        />
        <Button type="submit" className="h-12 rounded-xl px-5" disabled={tracking.isFetching}>
          <Search className="mr-2 h-4 w-4" />
          {tracking.isFetching ? "Searching…" : "Track"}
        </Button>
      </form>

      {!activeTrackingNumber && (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <Activity className="mx-auto mb-3 h-7 w-7 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium">Ready to look up a shipment</p>
          <p className="mt-1 text-sm text-muted-foreground">Enter a tracking number to view its latest status and event history.</p>
        </div>
      )}

      {activeTrackingNumber && tracking.isLoading && (
        <div className="space-y-3" role="status" aria-label="Loading tracking events">
          <div className="h-28 animate-pulse rounded-2xl bg-muted/70" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted/70" />
          <span className="sr-only">Loading tracking events</span>
        </div>
      )}

      {activeTrackingNumber && tracking.isError && (
        <QueryError
          message={getErrorMessage(tracking.error)}
          onRetry={() => void tracking.refetch()}
        />
      )}

      {result && !tracking.isError && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking number</p>
                <p className="mt-1 break-all font-mono text-lg font-semibold sm:text-xl">{result.trackingNumber}</p>
              </div>
              <StatusBadge status={result.currentStatus} />
            </div>
            <div className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
              <p><span className="text-muted-foreground">Package: </span><span className="font-medium">{result.packageType.replaceAll("_", " ")}</span></p>
              {result.originHub && (
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                  Origin: <span className="font-medium text-foreground">{result.originHub.name}, {result.originHub.city}</span>
                </p>
              )}
              {result.destinationHub && (
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                  Destination: <span className="font-medium text-foreground">{result.destinationHub.name}, {result.destinationHub.city}</span>
                </p>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold">Event history</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{events.length} recorded {events.length === 1 ? "event" : "events"}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Refresh tracking events"
                onClick={() => void tracking.refetch()}
                disabled={tracking.isFetching}
              >
                <RefreshCw className={tracking.isFetching ? "animate-spin" : ""} />
              </Button>
            </div>
            {events.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No tracking events have been returned for this shipment.</div>
            ) : (
              <ol className="divide-y divide-border">
                {events.map((event, index) => (
                  <li key={event.id} className={`relative flex gap-3 px-5 py-4 ${index === 0 ? "bg-primary/[0.035]" : ""}`}>
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${index === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {index === 0 ? <Activity className="h-4 w-4" aria-hidden="true" /> : <Clock3 className="h-4 w-4" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <StatusBadge status={event.status} />
                        <time className="text-xs text-muted-foreground" dateTime={event.createdAt}>{formatTimestamp(event.createdAt)}</time>
                      </div>
                      <p className="mt-2 break-words text-sm leading-5">{event.description}</p>
                      {event.location && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {event.location}
                        </p>
                      )}
                      {event.creator?.name && (
                        <p className="mt-2 text-xs text-muted-foreground">Recorded by {event.creator.name}</p>
                      )}
                    </div>
                    {index === 0 && <span className="absolute right-5 top-[-1px] rounded-b-md bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">Latest</span>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
