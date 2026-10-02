"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, Package, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyPayment } from "@/hooks";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId =
    searchParams.get("paymentId") ||
    searchParams.get("paymentID") ||
    searchParams.get("payment_id") ||
    "";

  const { data, isLoading, isError } = useVerifyPayment(paymentId, !!paymentId);
  const payment = (data as any)?.data ?? data;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Payment Successful</h1>
      <p className="mt-2 text-muted-foreground">
        Your shipment payment was received. We&apos;ll process pickup shortly.
      </p>

      {isLoading && paymentId && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Verifying payment…
        </p>
      )}

      {!isLoading && payment && (
        <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5 text-left text-sm space-y-2">
          <Row
            label="Amount"
            value={`৳${payment.amount} ${payment.currency || "BDT"}`}
          />
          <Row label="Method" value={payment.method} />
          <Row label="Status" value={payment.status} />
          {payment.transactionId && (
            <Row label="Txn ID" value={payment.transactionId} />
          )}
        </div>
      )}

      {isError && paymentId && (
        <p className="mt-4 text-sm text-amber-700">
          Payment recorded. Verification pending — check My Payments shortly.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/customer/shipments">
          <Button
            type="button"
            className="w-full rounded-full bg-chart-1 text-emerald-950 hover:bg-chart-2 sm:w-auto"
          >
            <Package className="mr-2 h-4 w-4" />
            My Shipments
          </Button>
        </Link>
        <Link href="/customer/payments">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full sm:w-auto"
          >
            Payment History
          </Button>
        </Link>
        <Link href="/">
          <Button
            type="button"
            variant="ghost"
            className="w-full rounded-full sm:w-auto"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center text-sm">Loading…</div>}
    >
      <SuccessContent />
    </Suspense>
  );
}
