"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  Send,
  Truck,
  UserRound,
} from "lucide-react";
import { useAddTrackingEvent, useAllUsers, useAssignCourier, useShipment, useTracking } from "@/hooks";
import type { Shipment, ShipmentStatus, TrackingTimeline, UserData } from "@/types";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  AdminDialog,
  AdminSkeleton,
  AdminSurface,
  EmptyState,
  getErrorMessage,
  PageHeader,
  QueryError,
  responseMeta,
  responseList,
  responseRecord,
  TablePager,
} from "@/components/dashboard/admin-ui";

const transitions: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED"],
  CONFIRMED: ["PICKUP_SCHEDULED"],
  PICKUP_SCHEDULED: ["COURIER_ASSIGNED"],
  COURIER_ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["AT_ORIGIN_HUB", "IN_TRANSIT"],
  AT_ORIGIN_HUB: ["IN_TRANSIT"],
  IN_TRANSIT: ["AT_DESTINATION_HUB", "RETURN_IN_TRANSIT"],
  AT_DESTINATION_HUB: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "DELIVERY_FAILED"],
  DELIVERY_FAILED: ["OUT_FOR_DELIVERY", "RETURN_INITIATED"],
  RETURN_INITIATED: ["RETURN_IN_TRANSIT"],
  RETURN_IN_TRANSIT: ["RETURNED"],
  DELIVERED: [],
  RETURNED: [],
  CANCELLED: [],
  FAILED: [],
};
const adminEventStatuses = new Set<ShipmentStatus>([
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "AT_DESTINATION_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELIVERY_FAILED",
  "RETURN_INITIATED",
  "RETURN_IN_TRANSIT",
  "RETURNED",
]);

function detailDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" }).format(date);
}

export default function AdminShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const shipmentQuery = useShipment(id);
  const shipment = responseRecord<Shipment>(shipmentQuery.data);
  const timelineQuery = useTracking(shipment?.trackingNumber ?? "");
  const timeline = responseRecord<TrackingTimeline>(timelineQuery.data);
  const assignMutation = useAssignCourier();
  const eventMutation = useAddTrackingEvent();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState("");
  const [courierPage, setCourierPage] = useState(1);
  const [eventStatus, setEventStatus] = useState<ShipmentStatus | "">("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const courierQuery = useAllUsers({ role: "COURIER", status: "ACTIVE", page: courierPage, limit: 20 }, assignDialogOpen);
  const couriers = useMemo(
    () => responseList<UserData>(courierQuery.data).filter((user) => user.role === "COURIER" && user.status === "ACTIVE"),
    [courierQuery.data],
  );
  const courierMeta = responseMeta(courierQuery.data);
  const courierPages = typeof courierMeta?.totalPages === "number" ? Math.max(courierMeta.totalPages, 1) : 1;
  const courierTotal = typeof courierMeta?.total === "number" ? courierMeta.total : couriers.length;
  const timelineEvents = Array.isArray(timeline?.timeline)
    ? [...timeline.timeline].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];
  const assignable = shipment && ["PICKUP_SCHEDULED", "COURIER_ASSIGNED"].includes(shipment.status);
  const availableStatuses = shipment
    ? (transitions[shipment.status] ?? []).filter((status) => adminEventStatuses.has(status))
    : [];

  const openEventDialog = (status: ShipmentStatus | "") => {
    setEventStatus(status);
    setDescription(status === "PICKUP_SCHEDULED" ? "Pickup scheduled by admin" : "");
    setLocation("");
    setEventDialogOpen(true);
  };

  const submitAssignment = () => {
    if (!selectedCourier || !assignable) return;
    assignMutation.mutate(
      { shipmentId: id, courierId: selectedCourier },
      {
        onSuccess: () => {
          toast.add({ title: shipment?.courier ? "Courier reassigned" : "Courier assigned", type: "success" });
          setAssignDialogOpen(false);
          setSelectedCourier("");
        },
        onError: (error) => toast.add({ title: "Couldn’t assign courier", description: getErrorMessage(error), type: "error" }),
      },
    );
  };

  const submitEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!shipment || !eventStatus || description.trim().length < 3) return;
    eventMutation.mutate(
      {
        shipmentId: shipment.id,
        payload: {
          status: eventStatus,
          description: description.trim(),
          ...(location.trim() ? { location: location.trim() } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.add({ title: eventStatus === "PICKUP_SCHEDULED" ? "Pickup scheduled" : "Tracking event recorded", type: "success" });
          setEventDialogOpen(false);
          setEventStatus("");
          setDescription("");
          setLocation("");
        },
        onError: (error) => toast.add({ title: "Couldn’t record shipment update", description: getErrorMessage(error), type: "error" }),
      },
    );
  };

  if (shipmentQuery.isLoading) {
    return <div className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6"><AdminSkeleton rows={6} /></div>;
  }

  if (shipmentQuery.isError || !shipment) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6 lg:px-9">
        <Link href="/admin/shipments" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All shipments
        </Link>
        {shipmentQuery.isError
          ? <QueryError message={getErrorMessage(shipmentQuery.error)} onRetry={() => void shipmentQuery.refetch()} />
          : <AdminSurface><EmptyState title="Shipment not found" description="The shipment service returned no record for this ID." /></AdminSurface>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <Link href="/admin/shipments" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All shipments
      </Link>
      <PageHeader
        eyebrow="Shipment details"
        title={shipment.trackingNumber || shipment.id}
        description={`Created ${detailDate(shipment.createdAt)} · Shipment ID ${shipment.id}`}
        action={
          <div className="flex flex-wrap gap-2">
            {shipment.status === "CONFIRMED" && (
              <Button type="button" className="h-10 rounded-xl" onClick={() => openEventDialog("PICKUP_SCHEDULED")}>
                Schedule pickup
              </Button>
            )}
            {availableStatuses.length > 0 && (
              <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => openEventDialog("")}>
                <Send className="mr-2 h-4 w-4" /> Record milestone
              </Button>
            )}
            {assignable && (
              <Button
                type="button"
                className="h-10 rounded-xl"
                onClick={() => { setSelectedCourier(""); setCourierPage(1); setAssignDialogOpen(true); }}
              >
                <Truck className="mr-2 h-4 w-4" />
                {shipment.courier ? "Reassign courier" : "Assign courier"}
              </Button>
            )}
          </div>
        }
      />

      <section className="grid gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <InfoRow label="Shipment status" value={<StatusBadge status={shipment.status} />} />
        <InfoRow label="Payment status" value={<StatusBadge status={shipment.paymentStatus} />} />
        <InfoRow label="Package type" value={shipment.packageType.replaceAll("_", " ")} />
        <InfoRow label="Updated" value={detailDate(shipment.updatedAt)} />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminSurface className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4 text-primary" /> Customer</h2>
          <div className="mt-5 space-y-3 text-sm">
            <InfoRow label="Name" value={shipment.customer?.name} />
            <InfoRow label="Email" value={shipment.customer?.email} />
            <InfoRow label="Phone" value={shipment.customer?.phone} />
          </div>
        </AdminSurface>
        <AdminSurface className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-semibold"><Truck className="h-4 w-4 text-primary" /> Assigned courier</h2>
          {shipment.courier ? (
            <div className="mt-5 space-y-3 text-sm">
              <InfoRow label="Name" value={shipment.courier.name} />
              <InfoRow label="Phone" value={shipment.courier.phone} />
              <InfoRow label="Courier ID" value={shipment.courierId} />
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">No courier is assigned to this shipment.</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Courier vehicle, availability, and workload are not included in the shipment or admin-user responses.</p>
        </AdminSurface>
      </div>

      <AdminSurface className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> Pickup and delivery</h2>
        {shipment.addresses?.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {shipment.addresses.map((address) => (
              <section key={address.id} className="rounded-xl border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{address.type}</p>
                <p className="mt-2 font-semibold">{address.name}</p>
                <a href={`tel:${address.phone}`} className="mt-1 inline-flex min-h-8 items-center text-sm text-primary hover:underline">{address.phone}</a>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  {address.addressLine}, {address.city}, {address.district}
                  {address.postalCode ? ` ${address.postalCode}` : ""}
                </p>
              </section>
            ))}
          </div>
        ) : <p className="mt-4 text-sm text-muted-foreground">Address details are not available.</p>}
      </AdminSurface>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminSurface className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-semibold"><Package className="h-4 w-4 text-primary" /> Package and payment</h2>
          <div className="mt-5 space-y-3 text-sm">
            <InfoRow label="Weight" value={shipment.weight == null ? undefined : `${shipment.weight} kg`} />
            <InfoRow label="Quantity" value={shipment.quantity?.toString()} />
            <InfoRow label="Declared value" value={shipment.declaredValue == null ? undefined : `৳${new Intl.NumberFormat().format(shipment.declaredValue)}`} />
            <InfoRow label="Delivery fee" value={shipment.deliveryFee == null ? undefined : `৳${new Intl.NumberFormat().format(shipment.deliveryFee)}`} />
            <InfoRow label="Cash on delivery" value={shipment.codAmount == null ? undefined : `৳${new Intl.NumberFormat().format(shipment.codAmount)}`} />
            <InfoRow label="Pickup schedule" value={detailDate(shipment.pickupSchedule)} />
          </div>
          {shipment.items?.length ? (
            <ul className="mt-5 divide-y divide-border border-t border-border">
              {shipment.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span>{item.description} <span className="text-muted-foreground">× {item.quantity}</span></span>
                  {item.weight !== undefined && <span className="shrink-0 text-muted-foreground">{item.weight} kg</span>}
                </li>
              ))}
            </ul>
          ) : null}
          {shipment.specialInstructions && (
            <p className="mt-4 rounded-xl bg-muted/40 p-3 text-sm leading-5">{shipment.specialInstructions}</p>
          )}
        </AdminSurface>

        <AdminSurface className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> Hub routing</h2>
            <Button type="button" size="icon" variant="outline" aria-label="Refresh tracking timeline" onClick={() => void timelineQuery.refetch()} disabled={timelineQuery.isFetching}>
              <RefreshCw className={timelineQuery.isFetching ? "animate-spin" : ""} />
            </Button>
          </div>
          {shipment.originHub || shipment.destinationHub || shipment.currentHub ? (
            <div className="mt-5 space-y-3">
              {shipment.originHub && <HubRow label="Origin" hub={shipment.originHub} />}
              {shipment.destinationHub && <HubRow label="Destination" hub={shipment.destinationHub} />}
              {shipment.currentHub && <HubRow label="Current" hub={shipment.currentHub} />}
            </div>
          ) : <p className="mt-4 text-sm text-muted-foreground">Hub information is not available for this shipment.</p>}
        </AdminSurface>
      </div>

      <AdminSurface className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold">Tracking timeline</h2>
            <p className="mt-1 text-xs text-muted-foreground">Shipment events in chronological order</p>
          </div>
          <Button type="button" size="icon" variant="outline" aria-label="Refresh timeline" onClick={() => void timelineQuery.refetch()} disabled={timelineQuery.isFetching}>
            <RefreshCw className={timelineQuery.isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
        {timelineQuery.isError ? (
          <div className="p-4"><QueryError message={getErrorMessage(timelineQuery.error)} onRetry={() => void timelineQuery.refetch()} /></div>
        ) : timelineQuery.isLoading ? (
          <div className="p-5"><AdminSkeleton rows={4} /></div>
        ) : timelineEvents.length === 0 ? (
          <EmptyState title="No tracking events" description="No timeline events were returned for this shipment." />
        ) : (
          <ol className="divide-y divide-border">
            {timelineEvents.map((event, index) => (
              <li key={event.id} className={`flex gap-3 px-5 py-4 ${index === timelineEvents.length - 1 ? "bg-primary/4" : ""}`}>
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${index === timelineEvents.length - 1 ? "bg-primary ring-primary/10" : "bg-muted-foreground/50 ring-muted/70"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <StatusBadge status={event.status} />
                    <time className="inline-flex items-center gap-1 text-xs text-muted-foreground" dateTime={event.createdAt}>
                      <Clock3 className="h-3.5 w-3.5" /> {detailDate(event.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 wrap-break-word text-sm leading-5">{event.description}</p>
                  {event.location && <p className="mt-1 text-xs text-muted-foreground">{event.location}</p>}
                  {event.creator?.name && <p className="mt-2 text-xs text-muted-foreground">Recorded by {event.creator.name} · {event.creator.role}</p>}
                  {index === timelineEvents.length - 1 && <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary">Latest update</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </AdminSurface>

      {assignDialogOpen && (
        <AdminDialog
          title={shipment.courier ? "Reassign courier" : "Assign courier"}
          description="Only active courier accounts returned by the admin users API are selectable."
          onClose={() => { if (!assignMutation.isPending) setAssignDialogOpen(false); }}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)} disabled={assignMutation.isPending}>Cancel</Button>
              <Button type="button" onClick={submitAssignment} disabled={!selectedCourier || !assignable || assignMutation.isPending}>
                {assignMutation.isPending ? "Saving…" : shipment.courier ? "Confirm reassignment" : "Confirm assignment"}
              </Button>
            </>
          }
        >
          {!assignable ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">The current shipment status does not allow courier assignment.</p>
          ) : courierQuery.isError ? (
            <QueryError message={getErrorMessage(courierQuery.error)} onRetry={() => void courierQuery.refetch()} />
          ) : courierQuery.isLoading ? (
            <AdminSkeleton rows={3} />
          ) : couriers.length === 0 ? (
            <EmptyState title={courierTotal === 0 ? "No active couriers" : "No couriers on this page"} description={courierTotal === 0 ? "The admin users endpoint returned no active courier accounts." : "Move to another page of active courier accounts."} />
          ) : (
            <>
              <label className="block space-y-2 text-sm font-medium">
                Active courier
                <select value={selectedCourier} onChange={(event) => setSelectedCourier(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm" required>
                  <option value="">Select a courier</option>
                  {couriers.map((courier) => (
                    <option key={courier.id} value={courier.id}>{courier.name} · {courier.phone || courier.email}</option>
                  ))}
                </select>
              </label>
              {courierPages > 1 && (
                <div className="mt-4 rounded-xl border border-border">
                  <TablePager page={courierPage} pages={courierPages} onChange={(nextPage) => { setSelectedCourier(""); setCourierPage(nextPage); }} />
                </div>
              )}
            </>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Vehicle, availability and workload are not part of the current admin courier-list response. The assignment API checks courier and shipment eligibility.
          </p>
        </AdminDialog>
      )}

      {eventDialogOpen && (
        <AdminDialog
          title={eventStatus === "PICKUP_SCHEDULED" ? "Schedule pickup" : "Record shipment milestone"}
          description="Only next statuses allowed by the current backend lifecycle are offered. The server remains authoritative."
          onClose={() => { if (!eventMutation.isPending) setEventDialogOpen(false); }}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setEventDialogOpen(false)} disabled={eventMutation.isPending}>Cancel</Button>
              <Button type="submit" form="admin-tracking-event" disabled={!eventStatus || description.trim().length < 3 || eventMutation.isPending}>
                {eventMutation.isPending ? "Saving…" : eventStatus === "PICKUP_SCHEDULED" ? "Schedule pickup" : "Record event"}
              </Button>
            </>
          }
        >
          <form id="admin-tracking-event" onSubmit={submitEvent} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-event-status" className="text-sm font-medium">Next status</label>
              <select
                id="admin-event-status"
                value={eventStatus}
                onChange={(event) => setEventStatus(event.target.value as ShipmentStatus | "")}
                disabled={eventStatus === "PICKUP_SCHEDULED" || eventMutation.isPending}
                required
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a permitted next status</option>
                {availableStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-event-description" className="text-sm font-medium">Description</label>
              <Textarea id="admin-event-description" value={description} onChange={(event) => setDescription(event.target.value)} minLength={3} maxLength={500} required disabled={eventMutation.isPending} className="min-h-24 rounded-xl" placeholder="Describe the operational update" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-event-location" className="text-sm font-medium">Location <span className="text-muted-foreground">(optional)</span></label>
              <Input id="admin-event-location" value={location} onChange={(event) => setLocation(event.target.value)} maxLength={160} disabled={eventMutation.isPending} className="h-11 rounded-xl" placeholder="Hub or delivery location" />
            </div>
          </form>
        </AdminDialog>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 wrap-break-word text-right font-medium">{value || "—"}</span>
    </div>
  );
}

function HubRow({
  label,
  hub,
}: {
  label: string;
  hub: { name: string; code: string; city: string };
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right">
        <span className="block truncate text-sm font-medium">{hub.name}</span>
        <span className="text-xs text-muted-foreground">{hub.code} · {hub.city}</span>
      </span>
    </div>
  );
}
