import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/admin.api";
import { getAllPayments } from "@/api/payment.api";
import type {
  AdminHubQuery,
  AdminUserQuery,
  HubInput,
  PaymentListQuery,
} from "@/types";

export const useAdminAnalytics = () =>
  useQuery({ queryKey: ["admin-analytics"], queryFn: api.getAdminAnalytics });
export const useAdminStats = () =>
  useQuery({ queryKey: ["admin-stats"], queryFn: api.getDashboardStats });

export const useAllUsers = (query?: AdminUserQuery, enabled = true) =>
  useQuery({
    queryKey: ["all-users", query],
    queryFn: () => api.getAllUsers(query),
    enabled,
  });
export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "ACTIVE" | "SUSPENDED";
    }) => api.updateUserStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
  });
};

export const useAssignCourier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      courierId,
    }: {
      shipmentId: string;
      courierId: string;
    }) => api.assignCourier(shipmentId, courierId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["all-shipments"] });
      qc.invalidateQueries({ queryKey: ["shipment", vars.shipmentId] });
      qc.invalidateQueries({ queryKey: ["tracking"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-analytics"] });
      qc.invalidateQueries({ queryKey: ["all-users"] });
    },
  });
};

export const useAllHubs = (query?: AdminHubQuery) =>
  useQuery({ queryKey: ["hubs", query], queryFn: () => api.getAllHubs(query) });
export const useCreateHub = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: HubInput) => api.createHub(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hubs"] }),
  });
};
export const useUpdateHub = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HubInput> }) =>
      api.updateHub(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hubs"] }),
  });
};
export const useDeleteHub = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteHub,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hubs"] }),
  });
};

export const useAllPayments = (query?: PaymentListQuery) =>
  useQuery({
    queryKey: ["all-payments", query],
    queryFn: () => getAllPayments(query),
  });
