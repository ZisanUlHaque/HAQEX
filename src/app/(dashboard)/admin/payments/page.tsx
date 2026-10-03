"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { useAllPayments, usePayment, useVerifyPayment } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { Payment } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AdminDialog,
  AdminSkeleton,
  AdminSurface,
  EmptyState,
  getErrorMessage,
  isRecord,
  PageHeader,
  QueryError,
  responseMeta,
  responseList,
  responseRecord,
  StatusPill,
  TablePager,
  unwrapData,
} from "@/components/dashboard/admin-ui";

const PAGE_SIZE = 10;
const paymentStatuses = ["INITIATED", "PENDING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED"];

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function PaymentDetails({ paymentId }: { paymentId: string }) {
  const query = usePayment(paymentId);
  const queryClient = useQueryClient();
  const [verificationRequested, setVerificationRequested] = useState(false);
  const verificationQuery = useVerifyPayment(paymentId, verificationRequested);
  const payment = responseRecord<Payment>(query.data);
  useEffect(() => {
    if (!verificationQuery.isSuccess || verificationQuery.dataUpdatedAt === 0) return;
    void queryClient.invalidateQueries({ queryKey: ["payment", paymentId] });
    void queryClient.invalidateQueries({ queryKey: ["all-payments"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
  }, [paymentId, queryClient, verificationQuery.dataUpdatedAt, verificationQuery.isSuccess]);
  if (query.isError) {
    return <QueryError message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  }
  if (query.isLoading) return <AdminSkeleton rows={5} />;
  if (!payment) {
    return <EmptyState title="Payment details unavailable" description="The payment endpoint returned no record for this ID." />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-muted/45 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment amount</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {payment.currency} {new Intl.NumberFormat().format(payment.amount)}
            </p>
          </div>
          <StatusPill value={payment.status} />
        </div>
      </section>
      <DetailSection title="Transaction">
        <DetailRow label="Payment ID" value={payment.id} />
        <DetailRow label="Transaction reference" value={payment.transactionId} />
        <DetailRow label="Gateway payment ID" value={payment.bkashPaymentId} />
        <DetailRow label="Method" value={payment.method} />
        <DetailRow label="Created" value={formatDate(payment.createdAt)} />
        <DetailRow label="Paid at" value={formatDate(payment.paidAt)} />
        <DetailRow label="Last updated" value={formatDate(payment.updatedAt)} />
      </DetailSection>
      <DetailSection title="Associated records">
        <DetailRow label="Shipment ID" value={payment.shipmentId} />
        <DetailRow label="Tracking number" value={payment.shipment?.trackingNumber} />
        <DetailRow label="Shipment status" value={payment.shipment?.status} />
        <DetailRow label="Delivery fee" value={payment.shipment?.deliveryFee == null ? undefined : `${payment.currency} ${new Intl.NumberFormat().format(payment.shipment.deliveryFee)}`} />
        <DetailRow label="Customer ID" value={payment.customerId} />
      </DetailSection>
      <section className="border-t border-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Gateway verification</h3>
            <p className="mt-1 text-xs text-muted-foreground">Request the latest verification response for this payment.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={verificationQuery.isFetching}
            onClick={() => {
              if (verificationRequested) void verificationQuery.refetch();
              else setVerificationRequested(true);
            }}
          >
            <RefreshCw className={verificationQuery.isFetching ? "animate-spin" : ""} />
            {verificationQuery.isFetching ? "Checking…" : verificationRequested ? "Check again" : "Verify status"}
          </Button>
        </div>
        {verificationRequested && verificationQuery.isError && (
          <div className="mt-4"><QueryError message={getErrorMessage(verificationQuery.error)} onRetry={() => void verificationQuery.refetch()} /></div>
        )}
        {verificationRequested && verificationQuery.isSuccess && (
          <VerificationResult value={verificationQuery.data} />
        )}
      </section>
      {payment.paymentGatewayUrl && (
        <a href={payment.paymentGatewayUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-primary hover:underline">
          Open payment gateway URL <ArrowUpRight className="ml-1 h-4 w-4" />
        </a>
      )}
    </div>
  );
}

function VerificationResult({ value }: { value: unknown }) {
  const result = unwrapData(value);
  const entries = isRecord(result)
    ? Object.entries(result)
    : Array.isArray(result)
      ? result.map((item, index) => [String(index + 1), item] as const)
      : [["Result", result] as const];
  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Latest API response</p>
      <div className="space-y-2">
        {entries.map(([key, item]) => (
          <DetailRow key={key} label={key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replaceAll("_", " ")} value={formatResponseValue(item)} />
        ))}
      </div>
    </div>
  );
}

function formatResponseValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === undefined || value === null) return "—";
  return JSON.stringify(value);
}

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const paymentsQuery = useAllPayments({
    page,
    limit: PAGE_SIZE,
    status: status || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedPayment, setSelectedPayment] = useState("");
  const payments = responseList<Payment>(paymentsQuery.data);
  const meta = responseMeta(paymentsQuery.data);
  const total = typeof meta?.total === "number" ? meta.total : payments.length;
  const totalPages = typeof meta?.totalPages === "number" ? Math.max(meta.totalPages, 1) : Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRows = payments;

  return (
    <div className="mx-auto max-w-360 space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        eyebrow="Operations"
        title="Payments"
        description="Review payment state, settlement references, amounts and linked shipment records."
        action={
          <Button type="button" variant="outline" onClick={() => void paymentsQuery.refetch()} disabled={paymentsQuery.isFetching}>
            <RefreshCw className={paymentsQuery.isFetching ? "animate-spin" : ""} /> Refresh
          </Button>
        }
      />
      <AdminSurface className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter payments by status" className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">All statuses</option>
            {paymentStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <span className="text-xs text-muted-foreground">{total} payments · newest first</span>
          <p className="basis-full text-xs text-muted-foreground">The current payments API supports status filtering and pagination; search, method, and date filters are not provided.</p>
        </div>
        {paymentsQuery.isError ? (
          <div className="p-4"><QueryError message={getErrorMessage(paymentsQuery.error)} onRetry={() => void paymentsQuery.refetch()} /></div>
        ) : paymentsQuery.isLoading ? (
          <div className="space-y-3 p-5"><AdminSkeleton rows={6} /></div>
        ) : payments.length === 0 ? (
          <EmptyState title={total === 0 ? "No payments returned" : "No matching payments"} description={total === 0 ? "Payment records will appear here when returned by the API." : "Try another payment status."} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-217.5 text-left text-sm">
                <thead className="bg-muted/45 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5">Shipment</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Created</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageRows.map((payment) => (
                    <tr key={payment.id} className="cursor-pointer transition hover:bg-muted/30" onClick={() => setSelectedPayment(payment.id)}>
                      <td className="px-5 py-4">
                        <button type="button" className="text-left font-semibold text-primary hover:underline" onClick={() => setSelectedPayment(payment.id)}>
                          {payment.id}
                        </button>
                        <p className="mt-1 max-w-40 truncate text-xs text-muted-foreground">{payment.transactionId || payment.bkashPaymentId || "No transaction reference"}</p>
                      </td>
                      <td className="px-5 py-4 font-medium">{payment.shipment?.trackingNumber || payment.shipmentId}</td>
                      <td className="px-5 py-4 text-muted-foreground">{payment.customerId}</td>
                      <td className="px-5 py-4 text-muted-foreground">{payment.method}</td>
                      <td className="px-5 py-4 font-semibold tabular-nums">{payment.currency} {new Intl.NumberFormat().format(payment.amount)}</td>
                      <td className="px-5 py-4"><StatusPill value={payment.status} /></td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(payment.createdAt)}</td>
                      <td className="px-5 py-4 text-right"><ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePager page={page} pages={totalPages} onChange={setPage} />
          </>
        )}
      </AdminSurface>

      {selectedPayment && (
        <AdminDialog
          title="Payment details"
          description="Payment information provided by the payment service."
          onClose={() => setSelectedPayment("")}
        >
          <PaymentDetails paymentId={selectedPayment} />
        </AdminDialog>
      )}
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-border/70 pb-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all text-right font-medium">{value || "—"}</span>
    </div>
  );
}
