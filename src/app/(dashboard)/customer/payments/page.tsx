"use client";

import Link from "next/link";
import { Suspense, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";
import { useMyPayments } from "@/hooks";
import type { Payment, PaymentListQuery } from "@/types";

function PaymentDetailsPanel({ payment }: { payment?: Payment }) {
  if (!payment) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Payment receipt</p>
          <h2 className="mt-1 text-xl font-bold">
            {payment.transactionId || payment.bkashPaymentId || payment.id}
          </h2>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Amount</p>
          <p className="mt-2 text-2xl font-bold">৳{payment.amount}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Method</p>
          <p className="mt-2 text-lg font-semibold">{payment.method}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-3 border-b border-border pb-2">
          <span className="text-muted-foreground">Payment ID</span>
          <span className="font-mono text-xs">{payment.id}</span>
        </div>
        <div className="flex justify-between gap-3 border-b border-border pb-2">
          <span className="text-muted-foreground">Shipment</span>
          <span className="font-medium">{payment.shipmentId || "—"}</span>
        </div>
        <div className="flex justify-between gap-3 border-b border-border pb-2">
          <span className="text-muted-foreground">Transaction</span>
          <span className="font-mono text-xs">{payment.transactionId || payment.bkashPaymentId || "—"}</span>
        </div>
        <div className="flex justify-between gap-3 border-b border-border pb-2">
          <span className="text-muted-foreground">Status</span>
          <span>{payment.status}</span>
        </div>
        <div className="flex justify-between gap-3 border-b border-border pb-2">
          <span className="text-muted-foreground">Created</span>
          <span>{new Date(payment.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-3 border-b border-border pb-2">
          <span className="text-muted-foreground">Paid at</span>
          <span>{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : "—"}</span>
        </div>
      </div>
    </div>
  );
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedPaymentId = searchParams.get("payment") || "";

  const query: PaymentListQuery = useMemo(
    () => ({
      page: Number(searchParams.get("page") || 1),
      limit: 10,
      status: searchParams.get("status") || undefined,
    }),
    [searchParams]
  );

  const { data, isLoading, isError } = useMyPayments(query);
  const payload = (data as any)?.data?.data
    ? (data as any).data
    : (data as any)?.data
      ? data
      : data;
  const payments: Payment[] = payload?.data ?? [];
  const meta = payload?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
  const selectedPayment = payments.find((payment) => payment.id === selectedPaymentId);

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment history</h1>
          <p className="text-sm text-muted-foreground">bKash and COD transactions for your shipments.</p>
        </div>
        <Link href="/customer/shipments">
          <Button type="button" variant="outline" className="rounded-full">
            View shipments
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : isError ? (
            <p className="p-10 text-center text-sm text-rose-600">Failed to load payment history.</p>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-16 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/40" />
              <p className="font-medium">No payments yet</p>
              <Link href="/customer/shipments">
                <Button type="button" variant="outline" className="mt-2 rounded-full">
                  View shipments
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold">৳{payment.amount}</td>
                      <td className="px-4 py-3">{payment.method}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {payment.transactionId || payment.bkashPaymentId || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/customer/payments?payment=${payment.id}`)}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Details
                          </Button>
                          {payment.shipmentId && (
                            <Link href={`/customer/shipments/${payment.shipmentId}`}>
                              <Button type="button" size="sm" variant="ghost">
                                <FileText className="mr-1 h-3.5 w-3.5" />
                                Shipment
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <span className="text-muted-foreground">Page {meta.page} / {meta.totalPages}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={meta.page <= 1}
                  onClick={() => setPage(meta.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage(meta.page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          {selectedPayment ? (
            <PaymentDetailsPanel payment={selectedPayment} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              <Receipt className="mx-auto mb-3 h-8 w-8 opacity-40" />
              Select a payment to review the receipt and transaction details.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function MyPaymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading payments…</div>}>
      <PaymentsContent />
    </Suspense>
  );
}