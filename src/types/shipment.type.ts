export type PackageType =
  | "DOCUMENT"
  | "SMALL_PARCEL"
  | "MEDIUM_PARCEL"
  | "LARGE_PARCEL"
  | "FRAGILE"
  | "HAZARDOUS";

export type ShipmentStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PICKUP_SCHEDULED"
  | "COURIER_ASSIGNED"
  | "PICKED_UP"
  | "AT_ORIGIN_HUB"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_FAILED"
  | "RETURN_INITIATED"
  | "RETURN_IN_TRANSIT"
  | "CANCELLED"
  | "RETURNED"
  | "FAILED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";

export type AddressInput = {
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
};

export type ShipmentItemInput = {
  description: string;
  quantity: number;
  weight?: number;
  declaredValue?: number;
};

export type CreateShipmentPayload = {
  packageType?: PackageType;
  weight?: number;
  quantity?: number;
  declaredValue?: number;
  deliveryFee?: number;
  codAmount?: number;
  specialInstructions?: string;
  pickupSchedule?: string; // ISO datetime
  pickupAddress: AddressInput;
  deliveryAddress: AddressInput;
  items: ShipmentItemInput[];
};

export type UpdateShipmentPayload = {
  packageType?: PackageType;
  weight?: number;
  quantity?: number;
  specialInstructions?: string;
  pickupSchedule?: string;
};

export type ShipmentListQuery = {
  page?: number;
  limit?: number;
  status?: ShipmentStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type ShipmentAddress = AddressInput & {
  id: string;
  type: "PICKUP" | "DELIVERY";
};

export type ShipmentItem = ShipmentItemInput & {
  id: string;
};

export type TrackingEvent = {
  id: string;
  status: string;
  description: string;
  createdAt: string;
  createdBy?: string;
};

export type Shipment = {
  id: string;
  trackingNumber: string;
  customerId: string;
  status: ShipmentStatus;
  paymentStatus: PaymentStatus;
  packageType: PackageType;
  weight: number | null;
  quantity: number;
  declaredValue: number | null;
  deliveryFee: number | null;
  codAmount: number | null;
  specialInstructions: string | null;
  pickupSchedule: string | null;
  courierId: string | null;
  createdAt: string;
  updatedAt: string;
  addresses?: ShipmentAddress[];
  items?: ShipmentItem[];
  trackingEvents?: TrackingEvent[];
  customer?: { id: string; name: string; email: string; phone: string | null };
  courier?: { id: string; name: string; phone: string | null } | null;
};

export type PaginatedShipments = {
  data: Shipment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
