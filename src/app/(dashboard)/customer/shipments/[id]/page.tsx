"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  Ban,
  Loader2,
} from "lucide-react";
import { useShipment, useCancelShipment } from "@/hooks";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";

const CANCELLABLE = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PICKUP_SCHEDULED",
  "COURIER_ASSIGNED",
];

export default function ShipmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useShipment(id);
  const { mutate: cancel, isPending: cancelling } = useCancelShipment();

  const shipment = (data as any)?.data ?? data;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading shipment…
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <div className="p-10 text-center text-sm text-rose-600">
        Shipment not found or access denied.
      </div>
    );
  }

  const pickup = shipment.addresses?.find((a: any) => a.type === "PICKUP");
  const delivery = shipment.addresses?.find((a: any) => a.type === "DELIVERY");
  const canCancel = CANCELLABLE.includes(shipment.status);

  const handleCancel = () => {
    if (!confirm("Cancel this shipment?")) return;
    cancel(shipment.id, {
      onSuccess: () => {
        toast.add({
          title: "Shipment cancelled",
          type: "success",
        });
        router.refresh();
      },
      onError: (err: any) => {
        toast.add({
          title: "Cancel failed",
          description: err?.data?.message || err?.message,
          type: "error",
        });
      },
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/customer/shipments"
            className="mb-2 -ml-2 inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> All shipments
          </Link>
          <h1 className="font-mono text-xl font-bold tracking-tight md:text-2xl">
            {shipment.trackingNumber}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={shipment.status} />
            <StatusBadge status={shipment.paymentStatus} />
          </div>
        </div>
        {canCancel && (
          <Button
            variant="outline"
            className="border-rose-300 text-rose-700 hover:bg-rose-50"
            disabled={cancelling}
            onClick={handleCancel}
          >
            {cancelling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            Cancel shipment
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={Package}
          title="Package"
          lines={[
            shipment.packageType?.replaceAll("_", " "),
            shipment.weight ? `${shipment.weight} kg` : null,
            `Qty ${shipment.quantity}`,
            shipment.deliveryFee != null ? `Fee ৳${shipment.deliveryFee}` : null,
            shipment.codAmount ? `COD ৳${shipment.codAmount}` : null,
          ]}
        />
        <InfoCard
          icon={MapPin}
          title="Pickup"
          lines={
            pickup
              ? [
                  pickup.name,
                  pickup.phone,
                  pickup.addressLine,
                  `${pickup.city}, ${pickup.district}`,
                ]
              : ["—"]
          }
        />
        <InfoCard
          icon={Truck}
          title="Delivery"
          lines={
            delivery
              ? [
                  delivery.name,
                  delivery.phone,
                  delivery.addressLine,
                  `${delivery.city}, ${delivery.district}`,
                ]
              : ["—"]
          }
        />
      </div>

      {shipment.items?.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Items
          </h2>
          <ul className="divide-y divide-border text-sm">
            {shipment.items.map((it: any) => (
              <li key={it.id} className="flex justify-between gap-4 py-2">
                <span>{it.description}</span>
                <span className="text-muted-foreground">
                  ×{it.quantity}
                  {it.weight ? ` · ${it.weight}kg` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {shipment.trackingEvents?.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Tracking timeline
          </h2>
          <ol className="relative space-y-4 border-l border-border ml-2">
            {shipment.trackingEvents.map((ev: any) => (
              <li key={ev.id} className="ml-6">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-chart-1" />
                <p className="text-sm font-semibold">
                  {ev.status?.replaceAll("_", " ")}
                </p>
                <p className="text-xs text-muted-foreground">{ev.description}</p>
                <p className="text-[11px] text-muted-foreground/80">
                  {new Date(ev.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {shipment.paymentStatus === "UNPAID" &&
        shipment.status === "PENDING_PAYMENT" && (
          <div className="rounded-2xl border border-chart-1/30 bg-chart-1/10 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold">Payment required</p>
              <p className="text-sm text-muted-foreground">
                Complete payment to confirm this shipment.
              </p>
            </div>
            <Button className="rounded-full bg-chart-1 text-emerald-950 hover:bg-chart-2">
              {/* Wire to Payments module next */}
              Pay ৳{shipment.deliveryFee ?? 0}
            </Button>
          </div>
        )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: (string | null | undefined)[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-chart-1">
        <Icon className="h-4 w-4" />
        <h2 className="text-xs font-bold uppercase tracking-wider">{title}</h2>
      </div>
      <div className="space-y-0.5 text-sm">
        {lines.filter(Boolean).map((l, i) => (
          <p key={i} className={i === 0 ? "font-medium" : "text-muted-foreground"}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}