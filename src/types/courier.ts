import type { Shipment, ShipmentStatus } from "./shipment.type";

export type CourierAvailability = "AVAILABLE" | "BUSY" | "OFFLINE";
export type UpdateCourierAvailabilityPayload = {
  availabilityStatus: CourierAvailability;
  currentLatitude?: number;
  currentLongitude?: number;
};

export type CourierProfile = {
  id: string;
  userId: string;
  vehicleType: "BICYCLE" | "MOTORCYCLE" | "VAN" | "TRUCK";
  vehicleNumber: string | null;
  licenseNumber: string | null;
  availabilityStatus: CourierAvailability;
  currentLatitude: number | null;
  currentLongitude: number | null;
  totalDeliveries: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
};

export type CourierShipment = Omit<Shipment, "customer"> & {
  customer?: {
    id: string;
    name: string;
    phone: string | null;
  };
};

export type CourierShipmentQuery = {
  page?: number;
  limit?: number;
  status?: ShipmentStatus;
};

export type CourierShipmentsResponse = {
  data: CourierShipment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
