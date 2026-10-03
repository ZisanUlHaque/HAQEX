import { History } from "lucide-react";
import { CourierShipmentList } from "@/components/dashboard/courier-shipment-list";

export default function CourierDeliveryHistoryPage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Operations</p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          <History className="h-6 w-6 text-primary" aria-hidden="true" />
          Delivery history
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Review delivered, failed, cancelled, and returned shipments from your assigned-shipment results. The API currently provides status filters and server pagination.
        </p>
      </header>
      <CourierShipmentList history />
    </div>
  );
}
