import apiClient from "@/lib/apiClient";
import type { AdminHubQuery, AdminUserQuery, HubInput } from "@/types";

function toQuery(params?: object) {
  if (!params) return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export function getAdminAnalytics() {
  return apiClient("/analytics/admin");
}
export function getDashboardStats() {
  return apiClient("/admin/dashboard");
}

// --- Users ---
export function getAllUsers(query?: AdminUserQuery) {
  return apiClient<unknown>(`/admin/users${toQuery(query)}`);
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
export function getAllHubs(query?: AdminHubQuery) {
  return apiClient<unknown>(`/hubs${toQuery(query)}`);
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