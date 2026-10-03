import { PackageCheck } from "lucide-react";
import { CourierShipmentList } from "@/components/dashboard/courier-shipment-list";

export default function CourierDeliveriesPage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Main operations</p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          <PackageCheck className="h-6 w-6 text-primary" aria-hidden="true" />
          My deliveries
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Shipments assigned to your courier account. Open a delivery to review details, update tracking, and see its timeline.
        </p>
      </header>
      <CourierShipmentList />
    </div>
  );
}
