"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Package, Truck, UserRound } from "lucide-react";
import { useAllUsers, useAssignCourier, useShipment } from "@/hooks";
import type { Shipment, UserData } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  AdminDialog,
  AdminSkeleton,
  AdminSurface,
  EmptyState,
  getErrorMessage,
  PageHeader,
  QueryError,
  responseList,
  responseRecord,
  StatusPill,
} from "@/components/dashboard/admin-ui";

function detailDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" }).format(date);
}

export default function AdminShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const shipmentQuery = useShipment(id);
  const usersQuery = useAllUsers();
  const assignMutation = useAssignCourier();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState("");
  const shipment = responseRecord<Shipment>(shipmentQuery.data);
  const couriers = useMemo(
    () => responseList<UserData>(usersQuery.data).filter((user) => user.role === "COURIER" && user.status === "ACTIVE"),
    [usersQuery.data],
  );

  const submitAssignment = () => {
    if (!selectedCourier) return;
    assignMutation.mutate(
      { shipmentId: id, courierId: selectedCourier },
      {
        onSuccess: () => {
          toast.add({ title: "Courier assignment saved", type: "success" });
          setDialogOpen(false);
          setSelectedCourier("");
        },
        onError: (error) => toast.add({
          title: "Couldn’t assign courier",
          description: getErrorMessage(error),
          type: "error",
        }),
      },
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <Link href="/admin/shipments" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All shipments
      </Link>
      {shipmentQuery.isError ? (
        <QueryError
          message={getErrorMessage(shipmentQuery.error)}
          onRetry={() => void shipmentQuery.refetch()}
        />
      ) : shipmentQuery.isLoading ? (
        <div className="space-y-5"><AdminSkeleton rows={5} /></div>
      ) : !shipment ? (
        <AdminSurface><EmptyState title="Shipment not found" description="The shipment endpoint returned no record for this ID." /></AdminSurface>
      ) : (
        <>
          <PageHeader
            eyebrow="Shipment details"
            title={shipment.trackingNumber || shipment.id}
            description={`Created ${detailDate(shipment.createdAt)}`}
            action={
              <Button
                type="button"
                onClick={() => {
                  setSelectedCourier(shipment.courierId || "");
                  setDialogOpen(true);
                }}
              >
                <Truck /> {shipment.courier ? "Change courier" : "Assign courier"}
              </Button>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminSurface className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipment status</p>
              <div className="mt-3"><StatusPill value={shipment.status} /></div>
            </AdminSurface>
            <AdminSurface className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment status</p>
              <div className="mt-3"><StatusPill value={shipment.paymentStatus} /></div>
            </AdminSurface>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <AdminSurface className="p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4 text-primary" /> Customer</h2>
              <div className="mt-5 space-y-3 text-sm">
                <InfoRow label="Name" value={shipment.customer?.name} />
                <InfoRow label="Email" value={shipment.customer?.email} />
                <InfoRow label="Phone" value={shipment.customer?.phone} />
                <InfoRow label="Customer ID" value={shipment.customerId} />
              </div>
            </AdminSurface>
            <AdminSurface className="p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-semibold"><Truck className="h-4 w-4 text-primary" /> Courier</h2>
              {shipment.courier ? (
                <div className="mt-5 space-y-3 text-sm">
                  <InfoRow label="Name" value={shipment.courier.name} />
                  <InfoRow label="Phone" value={shipment.courier.phone} />
                  <InfoRow label="Courier ID" value={shipment.courierId} />
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                  No courier is assigned to this shipment.
                </p>
              )}
            </AdminSurface>
          </div>

          <AdminSurface className="p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> Addresses</h2>
            {shipment.addresses?.length ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {shipment.addresses.map((address) => (
                  <div key={address.id} className="rounded-xl border border-border p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{address.type}</p>
                    <p className="mt-2 font-semibold">{address.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{address.addressLine}, {address.city}, {address.district}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{address.phone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Address details were not included in this response.</p>
            )}
          </AdminSurface>

          <AdminSurface className="p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-semibold"><Package className="h-4 w-4 text-primary" /> Shipment information</h2>
            <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <InfoRow label="Package type" value={shipment.packageType?.replaceAll("_", " ")} />
              <InfoRow label="Weight" value={shipment.weight == null ? undefined : `${shipment.weight} kg`} />
              <InfoRow label="Quantity" value={shipment.quantity?.toString()} />
              <InfoRow label="Delivery fee" value={shipment.deliveryFee == null ? undefined : `৳${new Intl.NumberFormat().format(shipment.deliveryFee)}`} />
              <InfoRow label="COD amount" value={shipment.codAmount == null ? undefined : `৳${new Intl.NumberFormat().format(shipment.codAmount)}`} />
              <InfoRow label="Pickup schedule" value={detailDate(shipment.pickupSchedule)} />
              <InfoRow label="Declared value" value={shipment.declaredValue == null ? undefined : `৳${new Intl.NumberFormat().format(shipment.declaredValue)}`} />
              <InfoRow label="Updated" value={detailDate(shipment.updatedAt)} />
            </div>
            {shipment.specialInstructions && (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Special instructions</p>
                <p className="mt-2 text-sm">{shipment.specialInstructions}</p>
              </div>
            )}
            {shipment.items?.length ? (
              <div className="mt-5 border-t border-border pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipment items</p>
                <div className="divide-y divide-border">
                  {shipment.items.map((item) => (
                    <div key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                      <span>{item.description}</span>
                      <span className="text-muted-foreground">
                        Qty {item.quantity}{item.weight == null ? "" : ` · ${item.weight} kg`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </AdminSurface>
        </>
      )}

      {dialogOpen && (
        <AdminDialog
          title={shipment?.courier ? "Change assigned courier" : "Assign a courier"}
          description="Only active courier accounts returned by the users endpoint are available."
          onClose={() => setDialogOpen(false)}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={assignMutation.isPending}>Cancel</Button>
              <Button type="button" onClick={submitAssignment} disabled={!selectedCourier || assignMutation.isPending}>
                {assignMutation.isPending ? "Assigning…" : "Confirm assignment"}
              </Button>
            </>
          }
        >
          {usersQuery.isError ? (
            <QueryError message={getErrorMessage(usersQuery.error)} onRetry={() => void usersQuery.refetch()} />
          ) : usersQuery.isLoading ? (
            <AdminSkeleton rows={3} />
          ) : couriers.length === 0 ? (
            <EmptyState title="No available couriers" description="The users API returned no active courier accounts." />
          ) : (
            <label className="block space-y-2 text-sm font-medium">
              Courier
              <select
                value={selectedCourier}
                onChange={(event) => setSelectedCourier(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                required
              >
                <option value="">Select a courier</option>
                {couriers.map((courier) => (
                  <option key={courier.id} value={courier.id}>
                    {courier.name}{courier.phone ? ` · ${courier.phone}` : ` · ${courier.email}`}
                  </option>
                ))}
              </select>
            </label>
          )}
        </AdminDialog>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="break-all text-right font-medium">{value || "—"}</span>
    </div>
  );
}
