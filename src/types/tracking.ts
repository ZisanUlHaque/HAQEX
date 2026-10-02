import { PackageType, ShipmentStatus } from "./shipment.type";

export type AddTrackingEventPayload = {
  status: ShipmentStatus;
  description: string;
  location?: string;
};

export type TrackingTimeline = {
  trackingNumber: string;
  currentStatus: ShipmentStatus;
  packageType: PackageType;
  originHub?: { name: string; code: string; city: string } | null;
  destinationHub?: { name: string; code: string; city: string } | null;
  timeline: Array<{
    id: string;
    status: string;
    description: string;
    location?: string | null;
    createdAt: string;
    creator?: { name: string; role: string } | null;
  }>;
};