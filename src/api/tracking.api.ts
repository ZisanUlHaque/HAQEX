import apiClient from "@/lib/apiClient";
import type { AddTrackingEventPayload } from "@/types";

export function getTrackingTimeline(trackingNumber: string) {
  return apiClient(`/tracking/${encodeURIComponent(trackingNumber)}`);
}

/** Courier / Admin */
export function addTrackingEvent(
  shipmentId: string,
  payload: AddTrackingEventPayload,
) {
  return apiClient(`/tracking/${shipmentId}/events`, {
    method: "POST",
    body: payload,
  });
}
