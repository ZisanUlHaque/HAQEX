import apiClient from "@/lib/apiClient";
import type { HubInput } from "@/types";

export function getAdminAnalytics() {
  return apiClient("/analytics/admin");
}
export function getDashboardStats() {
  return apiClient("/admin/dashboard");
}

// --- Users ---
export function getAllUsers() {
  return apiClient<unknown>("/admin/users");
}
export function updateUserStatus(id: string, status: "ACTIVE" | "SUSPENDED") {
  return apiClient(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

// --- Shipments ---
export function assignCourier(shipmentId: string, courierId: string) {
  return apiClient(`/admin/shipments/${shipmentId}/assign-courier`, {
    method: "POST",
    body: { courierId },
  });
}

// --- Hubs ---
export function getAllHubs() {
  return apiClient<unknown>("/hubs");
}
export function createHub(data: HubInput) {
  return apiClient("/hubs", { method: "POST", body: data });
}
export function updateHub(id: string, data: Partial<HubInput>) {
  return apiClient(`/hubs/${id}`, { method: "PATCH", body: data });
}
export function deleteHub(id: string) {
  return apiClient(`/hubs/${id}`, { method: "DELETE" });
}