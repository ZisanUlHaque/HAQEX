"use client";

import { useState, type FormEvent } from "react";
import { Clock3, Search } from "lucide-react";
import { useTracking } from "@/hooks";
import type { TrackingTimeline } from "@/types";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminSkeleton,
  AdminSurface,
  EmptyState,
  getErrorMessage,
  PageHeader,
  QueryError,
  responseRecord,
} from "@/components/dashboard/admin-ui";

function formatTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminTrackingPage() {
  const [value, setValue] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const timelineQuery = useTracking(trackingNumber);
  const timeline = responseRecord<TrackingTimeline>(timelineQuery.data);
  const events = Array.isArray(timeline?.timeline)
    ? [...timeline.timeline].sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
    : [];

  const lookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tracking = value.trim();
    if (tracking.length >= 5) setTrackingNumber(tracking);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        eyebrow="Operations"
        title="Shipment tracking"
        description="Look up the backend tracking timeline by its shipment tracking number."
      />
      <AdminSurface className="p-4 sm:p-5">
        <form onSubmit={lookup} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="admin-tracking-number" className="sr-only">Tracking number</label>
          <Input
            id="admin-tracking-number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter a tracking number"
            autoComplete="off"
            required
            minLength={5}
            className="h-12 rounded-xl"
          />
          <Button type="submit" className="h-12 rounded-xl" disabled={value.trim().length < 5 || timelineQuery.isFetching}>
            <Search className="mr-2 h-4 w-4" />
            {timelineQuery.isFetching ? "Looking up…" : "Track shipment"}
          </Button>
        </form>
      </AdminSurface>

      {trackingNumber && (
        <AdminSurface className="overflow-hidden">
          {timelineQuery.isError ? (
            <div className="p-4 sm:p-5">
              <QueryError message={getErrorMessage(timelineQuery.error)} onRetry={() => void timelineQuery.refetch()} />
            </div>
          ) : timelineQuery.isLoading ? (
            <div className="p-5"><AdminSkeleton rows={5} /></div>
          ) : !timeline ? (
            <EmptyState title="Tracking details unavailable" description="The tracking API returned no timeline for this tracking number." />
          ) : (
            <>
              <div className="border-b border-border px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking number</p>
                <h2 className="mt-1 break-all text-lg font-semibold">{timeline.trackingNumber}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={timeline.currentStatus} />
                  <span className="text-xs text-muted-foreground">{timeline.packageType.replaceAll("_", " ")}</span>
                </div>
                {(timeline.originHub || timeline.destinationHub) && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {timeline.originHub?.name || "Origin unavailable"}
                    {" → "}
                    {timeline.destinationHub?.name || "Destination unavailable"}
                  </p>
                )}
              </div>
              {events.length === 0 ? (
                <EmptyState title="No tracking events" description="The API returned the shipment without any timeline events." />
              ) : (
                <ol className="divide-y divide-border">
                  {events.map((event, index) => (
                    <li key={event.id} className={`flex gap-3 px-5 py-4 sm:px-6 ${index === events.length - 1 ? "bg-primary/[0.04]" : ""}`}>
                      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${index === events.length - 1 ? "bg-primary ring-primary/10" : "bg-muted-foreground/50 ring-muted/70"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <StatusBadge status={event.status} />
                          <time dateTime={event.createdAt} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" /> {formatTimestamp(event.createdAt)}
                          </time>
                        </div>
                        <p className="mt-2 break-words text-sm leading-5">{event.description}</p>
                        {event.location && <p className="mt-1 text-xs text-muted-foreground">{event.location}</p>}
                        {event.creator && (
                          <p className="mt-2 text-xs text-muted-foreground">Recorded by {event.creator.name} · {event.creator.role}</p>
                        )}
                        {index === events.length - 1 && <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary">Latest update</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </AdminSurface>
      )}
    </div>
  );
}
