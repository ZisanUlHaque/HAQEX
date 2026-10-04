import apiClient from "@/lib/apiClient";

export function getCustomerAnalytics() {
  return apiClient("/analytics/customer");
}
