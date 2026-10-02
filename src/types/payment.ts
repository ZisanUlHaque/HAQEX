export type PaymentMethod = "BKASH" | "COD";

export type PaymentTransactionStatus =
  | "INITIATED"
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type InitiatePaymentPayload = {
  shipmentId: string;
  method?: PaymentMethod;
};

export type Payment = {
  id: string;
  shipmentId: string;
  customerId: string;
  transactionId: string | null;
  bkashPaymentId: string | null;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentTransactionStatus;
  paymentGatewayUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  shipment?: {
    id: string;
    trackingNumber: string;
    status: string;
    deliveryFee: number | null;
  };
};

export type PaymentListQuery = {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type PaginatedPayments = {
  data: Payment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};