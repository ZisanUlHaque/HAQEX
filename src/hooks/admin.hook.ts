import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/admin.api";
import { getAllPayments } from "@/api/payment.api";
import type { HubInput, PaymentListQuery } from "@/types";

export const useAdminAnalytics = () =>
  useQuery({ queryKey: ["admin-analytics"], queryFn: api.getAdminAnalytics });
export const useAdminStats = () =>
  useQuery({ queryKey: ["admin-stats"], queryFn: api.getDashboardStats });

export const useAllUsers = () =>
  useQuery({
    queryKey: ["all-users"],
    queryFn: api.getAllUsers,
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
    },
  });
};

export const useAllHubs = () =>
  useQuery({ queryKey: ["hubs"], queryFn: api.getAllHubs });
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
