import apiClient from "@/lib/apiClient";
import type { InitiatePaymentPayload, PaymentListQuery } from "@/types";

function toQuery(params?: PaymentListQuery) {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function initiatePayment(payload: InitiatePaymentPayload) {
  return apiClient("/payments/initiate", {
    method: "POST",
    body: payload,
  });
}

export function verifyPayment(paymentId: string) {
  return apiClient(`/payments/verify/${paymentId}`);
}

export function getMyPayments(query?: PaymentListQuery) {
  return apiClient(`/payments/my-payments${toQuery(query)}`);
}

export function getAllPayments(query?: PaymentListQuery) {
  return apiClient(`/payments/all-payments${toQuery(query)}`);
}

export function getPaymentById(paymentId: string) {
  return apiClient(`/payments/${paymentId}`);
}
