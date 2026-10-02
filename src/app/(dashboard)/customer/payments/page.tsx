"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CreditCard, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useMyPayments } from "@/hooks";
import { Button } from "@/components/ui/button";
import type { Payment, PaymentListQuery } from "@/types";
import { StatusBadge } from "@/components/modules/shipments/StatusBadge";

function PaymentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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

  const setPage = (page: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(page));
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="text-sm text-muted-foreground">
          bKash & COD transactions for your shipments
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-10 text-center text-sm text-rose-600">
            Failed to load payments
          </p>
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
                  <th className="px-4 py-3">Txn</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold">
                      ৳{p.amount} {p.currency}
                    </td>
                    <td className="px-4 py-3">{p.method}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {p.transactionId || p.bkashPaymentId || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.shipmentId && (
                        <Link href={`/customer/shipments/${p.shipmentId}`}>
                          <Button type="button" size="sm" variant="ghost">
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Shipment
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Page {meta.page} / {meta.totalPages}
            </span>
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
      </div>
    </div>
  );
}

export default function MyPaymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading…</div>}>
      <PaymentsContent />
    </Suspense>
  );
}