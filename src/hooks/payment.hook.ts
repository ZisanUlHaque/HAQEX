import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  initiatePayment,
  verifyPayment,
  getMyPayments,
  getPaymentById,
} from "@/api";
import type { InitiatePaymentPayload, PaymentListQuery } from "@/types";

export function useInitiatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InitiatePaymentPayload) => initiatePayment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-shipments"] });
      qc.invalidateQueries({ queryKey: ["my-payments"] });
    },
  });
}

export function useVerifyPayment(paymentId: string, enabled = true) {
  return useQuery({
    queryKey: ["payment-verify", paymentId],
    queryFn: () => verifyPayment(paymentId),
    enabled: !!paymentId && enabled,
    retry: false,
  });
}

export function useMyPayments(query?: PaymentListQuery) {
  return useQuery({
    queryKey: ["my-payments", query],
    queryFn: () => getMyPayments(query),
  });
}

export function usePayment(paymentId: string) {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => getPaymentById(paymentId),
    enabled: !!paymentId,
  });
}
