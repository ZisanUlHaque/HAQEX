"use client";

import { useMemo, useState } from "react";
import { MapPin, Phone, RefreshCw, Warehouse } from "lucide-react";
import type { Hub } from "@/types";
import { useAllHubs } from "@/hooks";
import {
  EmptyState,
  getErrorMessage,
  QueryError,
  responseList,
  SearchField,
  StatusPill,
} from "@/components/dashboard/admin-ui";
import { Button } from "@/components/ui/button";

export default function CourierHubsPage() {
  const hubsQuery = useAllHubs();
  const [search, setSearch] = useState("");
  const hubs = responseList<Hub>(hubsQuery.data);
  const filteredHubs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return hubs;
    return hubs.filter((hub) =>
      [hub.name, hub.code, hub.address, hub.city, hub.district]
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [hubs, search]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Operations</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Hub network</h1>
          <p className="mt-1 text-sm text-muted-foreground">View available hub locations and operating status.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={() => void hubsQuery.refetch()}
          disabled={hubsQuery.isFetching}
        >
          <RefreshCw className={hubsQuery.isFetching ? "animate-spin" : ""} />
          Refresh
        </Button>
      </header>

      {hubsQuery.isError ? (
        <QueryError message={getErrorMessage(hubsQuery.error)} onRetry={() => void hubsQuery.refetch()} />
      ) : hubsQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading hubs">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl bg-muted/70" />
          ))}
          <span className="sr-only">Loading hub information</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchField value={search} onChange={setSearch} placeholder="Search name, code or location" />
            <p className="shrink-0 text-xs text-muted-foreground">
              {filteredHubs.length} {filteredHubs.length === 1 ? "hub" : "hubs"}
            </p>
          </div>
          {filteredHubs.length === 0 ? (
            <div className="rounded-2xl border border-border/80 bg-card">
              <EmptyState
                title={hubs.length === 0 ? "No hubs available" : "No hubs match"}
                description={hubs.length === 0 ? "Hub information has not been returned by the service." : "Try another name, code, or location."}
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredHubs.map((hub) => (
                <article key={hub.id} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Warehouse className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold">{hub.name}</h2>
                      <p className="mt-0.5 text-xs font-medium tracking-wide text-muted-foreground">{hub.code}</p>
                    </div>
                    <StatusPill value={hub.status} />
                  </div>
                  <div className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
                    <p className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        <span className="block font-medium text-foreground">{hub.city}, {hub.district}</span>
                        <span className="mt-0.5 block text-xs leading-5">{hub.address}</span>
                      </span>
                    </p>
                    {hub.phone && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <a href={`tel:${hub.phone}`} className="min-h-8 py-1 hover:text-foreground">{hub.phone}</a>
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
