"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { useAllPayments, usePayment, useVerifyPayment } from "@/hooks";
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
  responseList,
  responseRecord,
  SearchField,
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
  const [verificationRequested, setVerificationRequested] = useState(false);
  const verificationQuery = useVerifyPayment(paymentId, verificationRequested);
  const payment = responseRecord<Payment>(query.data);
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
  const paymentsQuery = useAllPayments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState("");
  const payments = responseList<Payment>(paymentsQuery.data);
  const filteredPayments = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesSearch =
        !needle ||
        payment.id?.toLowerCase().includes(needle) ||
        payment.transactionId?.toLowerCase().includes(needle) ||
        payment.bkashPaymentId?.toLowerCase().includes(needle) ||
        payment.shipment?.trackingNumber?.toLowerCase().includes(needle) ||
        payment.customerId?.toLowerCase().includes(needle);
      const created = Date.parse(payment.createdAt);
      const matchesFrom = !fromDate || (Number.isFinite(created) && created >= Date.parse(`${fromDate}T00:00:00`));
      const matchesTo = !toDate || (Number.isFinite(created) && created <= Date.parse(`${toDate}T23:59:59.999`));
      return matchesSearch && (!status || payment.status === status) && matchesFrom && matchesTo;
    });
  }, [fromDate, payments, search, status, toDate]);
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const pageRows = filteredPayments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
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
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 xl:grid-cols-[minmax(210px,1fr)_170px_160px_160px_auto]">
          <SearchField value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search payment, shipment or reference" />
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter payments by status" className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">All statuses</option>
            {paymentStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-input bg-background px-3 text-xs text-muted-foreground">
            From <input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} aria-label="Payments created from" className="min-w-0 bg-transparent text-foreground outline-none" />
          </label>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-input bg-background px-3 text-xs text-muted-foreground">
            To <input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1); }} aria-label="Payments created until" className="min-w-0 bg-transparent text-foreground outline-none" />
          </label>
          <span className="self-center whitespace-nowrap px-1 text-xs text-muted-foreground">{filteredPayments.length} payments</span>
        </div>
        {paymentsQuery.isError ? (
          <div className="p-4"><QueryError message={getErrorMessage(paymentsQuery.error)} onRetry={() => void paymentsQuery.refetch()} /></div>
        ) : paymentsQuery.isLoading ? (
          <div className="space-y-3 p-5"><AdminSkeleton rows={6} /></div>
        ) : filteredPayments.length === 0 ? (
          <EmptyState title={payments.length === 0 ? "No payments returned" : "No matching payments"} description={payments.length === 0 ? "Payment records will appear here when returned by the API." : "Try changing the search, date range or status filters."} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[870px] text-left text-sm">
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
