import apiClient from "@/lib/apiClient";
import type {
  CourierShipmentQuery,
  UpdateCourierAvailabilityPayload,
} from "@/types/courier";

function toQuery(params?: CourierShipmentQuery) {
  if (!params) return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === "string" && value.length === 0)
    ) {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export function getCourierAnalytics() {
  return apiClient<unknown>("/analytics/courier");
}

export function getCourierProfile() {
  return apiClient<unknown>("/couriers/me");
}

export function getCourierShipments(query?: CourierShipmentQuery) {
  return apiClient<unknown>(`/couriers/shipments${toQuery(query)}`);
}

export function updateCourierAvailability(payload: UpdateCourierAvailabilityPayload) {
  return apiClient("/couriers/availability", {
    method: "PATCH",
    body: payload,
  });
}
