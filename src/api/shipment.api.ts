import apiClient from "@/lib/apiClient";
import type {
  CreateShipmentPayload,
  UpdateShipmentPayload,
  ShipmentListQuery,
} from "@/types";

function toQuery(params?: ShipmentListQuery) {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function createShipment(payload: CreateShipmentPayload) {
  return apiClient("/shipments", { method: "POST", body: payload });
}

export function getMyShipments(query?: ShipmentListQuery) {
  return apiClient(`/shipments${toQuery(query)}`);
}

export function getAllShipments(query?: ShipmentListQuery) {
  return apiClient(`/shipments/all${toQuery(query)}`);
}

export function getShipmentById(id: string) {
  return apiClient(`/shipments/${id}`);
}

export function updateShipment(id: string, payload: UpdateShipmentPayload) {
  return apiClient(`/shipments/${id}`, { method: "PATCH", body: payload });
}

export function cancelShipment(id: string) {
  return apiClient(`/shipments/${id}`, { method: "DELETE" });
}