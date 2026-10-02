"use client";

import Link from "next/link";
import { XCircle, Package, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/15 text-rose-600">
        <XCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Payment Cancelled</h1>
      <p className="mt-2 text-muted-foreground">
        You cancelled the payment or it was not completed. Your shipment is
        still waiting for payment.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/customer/shipments">
          <Button
            type="button"
            className="w-full rounded-full bg-chart-1 text-emerald-950 hover:bg-chart-2 sm:w-auto"
          >
            <Package className="mr-2 h-4 w-4" />
            Back to Shipments
          </Button>
        </Link>
        <Link href="/customer/shipments">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again later
          </Button>
        </Link>
      </div>
    </div>
  );
}
