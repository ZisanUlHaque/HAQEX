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
  CreditCard,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { useShipment, useCancelShipment, useInitiatePayment } from "@/hooks";
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
  const { mutate: initiatePay, isPending: paying } = useInitiatePayment();

  const shipment = (data as any)?.data ?? data;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading shipment details…
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
  const isPaid = shipment.paymentStatus === "PAID";

  // Handle bKash & COD Payment
  const handlePay = (method: "BKASH" | "COD") => {
    initiatePay(
      { shipmentId: shipment.id, method },
      {
        onSuccess: (res: any) => {
          const responseData = res?.data ?? res;

          // Extract all possible bKash gateway redirect URLs
          const redirectUrl =
            responseData?.paymentGatewayUrl ||
            responseData?.bkashURL ||
            responseData?.url ||
            responseData?.paymentUrl;

          if (method === "BKASH" && redirectUrl) {
            toast.add({
              title: "Redirecting to bKash Gateway…",
              description: "Please complete your payment.",
              type: "success",
            });
            // Redirect user to bKash portal
            window.location.href = redirectUrl;
            return;
          }

          if (method === "COD") {
            toast.add({
              title: "Cash on Delivery Selected",
              description: "Pay ৳" + (shipment.deliveryFee || 0) + " when parcel is delivered.",
              type: "success",
            });
            router.refresh();
            return;
          }

          toast.add({
            title: "Payment Initiated",
            description: "Please check payment instructions.",
            type: "info",
          });
        },
        onError: (err: any) => {
          toast.add({
            title: "Payment Initiation Failed",
            description:
              err?.data?.message || err?.message || "Could not connect to bKash gateway.",
            type: "error",
          });
        },
      }
    );
  };

  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel this shipment?")) return;
    cancel(shipment.id, {
      onSuccess: () => {
        toast.add({
          title: "Shipment Cancelled",
          type: "success",
        });
        router.refresh();
      },
      onError: (err: any) => {
        toast.add({
          title: "Cancel Failed",
          description: err?.data?.message || err?.message,
          type: "error",
        });
      },
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-8">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/customer/shipments">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ArrowLeft className="mr-1 h-4 w-4" /> All Shipments
            </Button>
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
            type="button"
            variant="outline"
            className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            disabled={cancelling}
            onClick={handleCancel}
          >
            {cancelling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            Cancel Shipment
          </Button>
        )}
      </div>

      {/* Payment Action Banner */}
      {!isPaid && shipment.status !== "CANCELLED" ? (
        <div className="rounded-2xl border border-chart-1/30 bg-chart-1/10 p-5 space-y-4">
          <div>
            <p className="font-bold text-foreground text-lg">Payment Action Required</p>
            <p className="text-sm text-muted-foreground">
              Total Delivery Charge:{" "}
              <strong className="text-foreground text-base">
                ৳{shipment.deliveryFee ?? 60}
              </strong>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              disabled={paying}
              onClick={() => handlePay("BKASH")}
              className="rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 shadow-md"
            >
              {paying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Pay ৳{shipment.deliveryFee ?? 60} with bKash
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={paying}
              onClick={() => handlePay("COD")}
              className="rounded-full font-semibold border-border"
            >
              <Banknote className="mr-2 h-4 w-4 text-emerald-600" />
              Cash on Delivery (COD)
            </Button>
          </div>
        </div>
      ) : isPaid ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-bold">Payment Verified & Completed</p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
              Total ৳{shipment.deliveryFee ?? 0} paid successfully. Your parcel is ready for dispatch.
            </p>
          </div>
        </div>
      ) : null}

      {/* Info Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={Package}
          title="Package Info"
          lines={[
            shipment.packageType?.replaceAll("_", " "),
            shipment.weight ? `${shipment.weight} kg` : null,
            `Quantity: ${shipment.quantity}`,
            shipment.deliveryFee != null ? `Delivery Fee: ৳${shipment.deliveryFee}` : null,
            shipment.codAmount ? `COD Amount: ৳${shipment.codAmount}` : null,
          ]}
        />
        <InfoCard
          icon={MapPin}
          title="Pickup (Sender)"
          lines={
            pickup
              ? [
                  pickup.name,
                  pickup.phone,
                  pickup.addressLine,
                  `${pickup.city}, ${pickup.district}`,
                ]
              : ["No Address Available"]
          }
        />
        <InfoCard
          icon={Truck}
          title="Delivery (Receiver)"
          lines={
            delivery
              ? [
                  delivery.name,
                  delivery.phone,
                  delivery.addressLine,
                  `${delivery.city}, ${delivery.district}`,
                ]
              : ["No Address Available"]
          }
        />
      </div>

      {/* Items Section */}
      {shipment.items?.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Items Included
          </h2>
          <ul className="divide-y divide-border text-sm">
            {shipment.items.map((it: any) => (
              <li key={it.id} className="flex justify-between gap-4 py-2">
                <span className="font-medium">{it.description}</span>
                <span className="text-muted-foreground">
                  Qty: {it.quantity} {it.weight ? `· ${it.weight} kg` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tracking Timeline */}
      {shipment.trackingEvents?.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Tracking History
          </h2>
          <ol className="relative ml-2 space-y-4 border-l border-border">
            {shipment.trackingEvents.map((ev: any) => (
              <li key={ev.id} className="ml-6">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-chart-1" />
                <p className="text-sm font-semibold">
                  {ev.status?.replaceAll("_", " ")}
                </p>
                <p className="text-xs text-muted-foreground">{ev.description}</p>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                  {new Date(ev.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        </section>
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
      <div className="space-y-1 text-sm">
        {lines.filter(Boolean).map((l, i) => (
          <p key={i} className={i === 0 ? "font-semibold text-foreground" : "text-muted-foreground text-xs"}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}