"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  Send,
  Truck,
} from "lucide-react";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";
import {
  AdminDialog,
  getErrorMessage,
  QueryError,
  responseRecord,
} from "@/components/dashboard/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useAddTrackingEvent, useShipment, useTracking } from "@/hooks";
import type { Shipment, ShipmentAddress, ShipmentStatus, TrackingTimeline } from "@/types";

const courierTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING_PAYMENT: [],
  CONFIRMED: [],
  PICKUP_SCHEDULED: [],
  COURIER_ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["AT_ORIGIN_HUB", "IN_TRANSIT"],
  AT_ORIGIN_HUB: ["IN_TRANSIT"],
  IN_TRANSIT: ["AT_DESTINATION_HUB", "RETURN_IN_TRANSIT"],
  AT_DESTINATION_HUB: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "DELIVERY_FAILED"],
  DELIVERED: [],
  DELIVERY_FAILED: ["OUT_FOR_DELIVERY", "RETURN_INITIATED"],
  RETURN_INITIATED: ["RETURN_IN_TRANSIT"],
  RETURN_IN_TRANSIT: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
  FAILED: [],
};

function statusLabel(value: ShipmentStatus) {
  const labels: Partial<Record<ShipmentStatus, string>> = {
    PICKED_UP: "Mark as picked up",
    AT_ORIGIN_HUB: "Arrived at origin hub",
    IN_TRANSIT: "In transit",
    AT_DESTINATION_HUB: "Arrived at destination hub",
    OUT_FOR_DELIVERY: "Attempt delivery again",
    DELIVERED: "Mark as delivered",
    DELIVERY_FAILED: "Delivery failed",
    RETURN_INITIATED: "Initiate return",
    RETURN_IN_TRANSIT: "Return in transit",
    RETURNED: "Mark return complete",
  };
  return labels[value] ?? value.replaceAll("_", " ");
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function AddressCard({ title, address }: { title: string; address?: ShipmentAddress }) {
  if (!address) return null;

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <p className="mt-3 font-medium">{address.name}</p>
      <a href={`tel:${address.phone}`} className="mt-1 inline-flex min-h-8 items-center text-sm text-primary hover:underline">{address.phone}</a>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">
        {address.addressLine}, {address.city}, {address.district}
        {address.postalCode ? ` ${address.postalCode}` : ""}
      </p>
    </section>
  );
}

function formatEventTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function CourierShipmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const shipmentQuery = useShipment(id);
  const shipment = responseRecord<Shipment>(shipmentQuery.data);
  const trackingQuery = useTracking(shipment?.trackingNumber ?? "");
  const tracking = responseRecord<TrackingTimeline>(trackingQuery.data);
  const addEvent = useAddTrackingEvent();
  const [status, setStatus] = useState<ShipmentStatus | "">("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const addresses = shipment?.addresses ?? [];
  const pickup = addresses.find((address) => address.type === "PICKUP");
  const delivery = addresses.find((address) => address.type === "DELIVERY");
  const events = Array.isArray(tracking?.timeline)
    ? [...tracking.timeline].sort((first, second) => (
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
      ))
    : [];
  const availableStatuses = shipment ? courierTransitions[shipment.status] : [];

  const submitEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!shipment || !status || !availableStatuses.includes(status) || description.trim().length < 3) return;
    setConfirmUpdate(true);
  };

  const confirmEvent = () => {
    if (!shipment || !status || !availableStatuses.includes(status) || description.trim().length < 3) return;
    addEvent.mutate(
      {
        shipmentId: shipment.id,
        payload: {
          status,
          description: description.trim(),
          ...(location.trim() ? { location: location.trim() } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.add({ title: "Tracking event added", description: "The shipment timeline is being refreshed.", type: "success" });
          setStatus("");
          setDescription("");
          setLocation("");
          setConfirmUpdate(false);
        },
        onError: (error) => {
          const message = getErrorMessage(error);
          const conflict = /status changed|invalid status transition/i.test(message);
          toast.add({
            title: conflict ? "Shipment changed elsewhere" : "Couldn’t add tracking event",
            description: conflict ? `${message} The latest shipment and tracking data is being refreshed.` : message,
            type: "error",
          });
        },
      },
    );
  };

  if (shipmentQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 sm:py-8" role="status" aria-label="Loading shipment">
        <div className="h-28 animate-pulse rounded-2xl bg-muted/70" />
        <div className="grid gap-4 sm:grid-cols-2"><div className="h-40 animate-pulse rounded-2xl bg-muted/70" /><div className="h-40 animate-pulse rounded-2xl bg-muted/70" /></div>
        <span className="sr-only">Loading shipment details</span>
      </div>
    );
  }

  if (shipmentQuery.isError || !shipment) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <Link href="/courier/shipments" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Delivery lookup
        </Link>
        <QueryError
          message={shipmentQuery.isError ? getErrorMessage(shipmentQuery.error) : "The shipment service returned no shipment details."}
          onRetry={() => void shipmentQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/courier/shipments" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Delivery lookup
      </Link>

      <section className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Shipment details</p>
              <h1 className="mt-2 break-all font-mono text-xl font-semibold tracking-tight sm:text-2xl">{shipment.trackingNumber}</h1>
              <p className="mt-1 break-all text-xs text-muted-foreground">Shipment ID · {shipment.id}</p>
            </div>
            <StatusBadge status={shipment.status} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium">
              <Package className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {shipment.packageType.replaceAll("_", " ")}
            </span>
            {shipment.paymentStatus && <StatusBadge status={shipment.paymentStatus} />}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              Created {formatDate(shipment.createdAt)}
            </span>
            <span className="text-xs text-muted-foreground">Updated {formatDate(shipment.updatedAt)}</span>
            {shipment.pickupSchedule && <span className="text-xs text-muted-foreground">Pickup {formatDate(shipment.pickupSchedule)}</span>}
          </div>
        </div>
        <div className="grid gap-3 border-t border-border p-5 sm:grid-cols-3 sm:p-6">
          {shipment.weight !== null && shipment.weight !== undefined && (
            <div><p className="text-xs text-muted-foreground">Weight</p><p className="mt-1 font-semibold">{shipment.weight} kg</p></div>
          )}
          {shipment.quantity !== undefined && (
            <div><p className="text-xs text-muted-foreground">Package quantity</p><p className="mt-1 font-semibold">{shipment.quantity}</p></div>
          )}
          {shipment.items?.length ? (
            <div className="sm:col-span-3">
              <p className="text-xs text-muted-foreground">Items</p>
              <ul className="mt-2 divide-y divide-border">
                {shipment.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 py-2 text-sm">
                    <span>{item.description} × {item.quantity}</span>
                    {item.weight !== undefined && <span className="shrink-0 text-muted-foreground">{item.weight} kg</span>}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {shipment.specialInstructions && (
            <div className="sm:col-span-3">
              <p className="text-xs text-muted-foreground">Special instructions</p>
              <p className="mt-1 text-sm leading-5">{shipment.specialInstructions}</p>
            </div>
          )}
          {shipment.courier && (
            <div><p className="text-xs text-muted-foreground">Courier</p><p className="mt-1 font-semibold">{shipment.courier.name}</p>{shipment.courier.phone && <a href={`tel:${shipment.courier.phone}`} className="text-sm text-primary">{shipment.courier.phone}</a>}</div>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <AddressCard title="Pickup address" address={pickup} />
        <AddressCard title="Delivery address" address={delivery} />
      </div>

      {(tracking?.originHub || tracking?.destinationHub) && (
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="font-semibold">Hub information</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[["Origin", tracking.originHub], ["Destination", tracking.destinationHub]].map(([label, hub]) => (
              hub && typeof hub === "object" ? (
                <div key={String(label)} className="rounded-xl bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">{String(label)} hub</p>
                  <p className="mt-1 font-medium">{hub.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{hub.code} · {hub.city}</p>
                </div>
              ) : null
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="font-semibold">Tracking progress</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest event appears first</p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Refresh shipment timeline"
              onClick={() => void trackingQuery.refetch()}
              disabled={!shipment.trackingNumber || trackingQuery.isFetching}
            >
              <RefreshCw className={trackingQuery.isFetching ? "animate-spin" : ""} />
            </Button>
          </div>
          {trackingQuery.isError ? (
            <div className="p-4">
              <QueryError message={getErrorMessage(trackingQuery.error)} onRetry={() => void trackingQuery.refetch()} />
            </div>
          ) : trackingQuery.isLoading ? (
            <div className="space-y-3 p-5" role="status" aria-label="Loading timeline">
              <div className="h-16 animate-pulse rounded-xl bg-muted/70" />
              <div className="h-16 animate-pulse rounded-xl bg-muted/70" />
              <span className="sr-only">Loading tracking timeline</span>
            </div>
          ) : events.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">No tracking events are available for this shipment.</div>
          ) : (
            <ol className="divide-y divide-border">
              {events.map((event, index) => (
                <li key={event.id} className={`flex gap-3 px-5 py-4 ${index === 0 ? "bg-primary/[0.035]" : ""}`}>
                  <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${index === 0 ? "bg-primary ring-primary/10" : "bg-muted-foreground/50 ring-muted/70"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <StatusBadge status={event.status} />
                      <time className="text-xs text-muted-foreground" dateTime={event.createdAt}>{formatEventTime(event.createdAt)}</time>
                    </div>
                    <p className="mt-2 break-words text-sm leading-5">{event.description}</p>
                    {event.location && <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{event.location}</p>}
                    {index === 0 && <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary">Current event</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="h-fit rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Send className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold">Update delivery progress</h2>
              <p className="text-xs text-muted-foreground">Only valid courier transitions are available</p>
            </div>
          </div>
          {availableStatuses.length === 0 ? (
            <p className="mt-5 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              No courier progress actions are available for the current shipment status.
            </p>
          ) : <form onSubmit={submitEvent} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="tracking-event-status" className="text-sm font-medium">Shipment status</label>
              <select
                id="tracking-event-status"
                required
                value={status}
                onChange={(event) => setStatus(event.target.value as ShipmentStatus | "")}
                disabled={addEvent.isPending}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Select next action</option>
                {availableStatuses.map((shipmentStatus) => (
                  <option key={shipmentStatus} value={shipmentStatus}>{statusLabel(shipmentStatus)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tracking-event-description" className="text-sm font-medium">
                {status === "DELIVERY_FAILED" || status === "RETURN_INITIATED" ? "Reason / description" : "Description"}
              </label>
              <Textarea
                id="tracking-event-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={status === "DELIVERY_FAILED" ? "Explain why delivery could not be completed" : status === "RETURN_INITIATED" ? "Explain why the shipment is being returned" : "Add a clear delivery update"}
                required
                minLength={3}
                maxLength={500}
                disabled={addEvent.isPending}
                className="min-h-24 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tracking-event-location" className="text-sm font-medium">Location <span className="font-normal text-muted-foreground">(optional)</span></label>
              <Input
                id="tracking-event-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Current stop or hub"
                maxLength={160}
                disabled={addEvent.isPending}
                className="h-11 rounded-xl"
              />
            </div>
            <Button type="submit" disabled={addEvent.isPending || !status || description.trim().length < 3} className="h-11 w-full rounded-xl">
              <Send className="mr-2 h-4 w-4" />
              Review update
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              The tracking service validates courier access and shipment assignment when this event is submitted.
            </p>
          </form>}
        </section>
      </div>
      {confirmUpdate && status && (
        <AdminDialog
          title={status === "DELIVERED" ? "Confirm delivery completion" : status === "DELIVERY_FAILED" ? "Confirm failed delivery" : status === "RETURN_INITIATED" ? "Confirm return" : "Confirm shipment update"}
          description={status === "DELIVERED" ? "Are you sure you want to mark this shipment as delivered?" : "This will update the shipment status and add a tracking event."}
          onClose={() => { if (!addEvent.isPending) setConfirmUpdate(false); }}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setConfirmUpdate(false)} disabled={addEvent.isPending}>Go back</Button>
              <Button type="button" onClick={confirmEvent} disabled={addEvent.isPending}>
                {addEvent.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                {addEvent.isPending ? "Updating…" : statusLabel(status)}
              </Button>
            </>
          }
        >
          <div className="space-y-3 rounded-xl bg-muted/40 p-4 text-sm">
            <p className="flex justify-between gap-3"><span className="text-muted-foreground">Current</span><StatusBadge status={shipment.status} /></p>
            <p className="flex justify-between gap-3"><span className="text-muted-foreground">Next</span><StatusBadge status={status} /></p>
            <p className="border-t border-border pt-3 leading-5">{description.trim()}</p>
            {location.trim() && <p className="text-xs text-muted-foreground">{location.trim()}</p>}
          </div>
        </AdminDialog>
      )}
    </div>
  );
}
