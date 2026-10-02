import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createShipment,
  getMyShipments,
  getAllShipments,
  getShipmentById,
  updateShipment,
  cancelShipment,
} from "@/api";
import type {
  CreateShipmentPayload,
  UpdateShipmentPayload,
  ShipmentListQuery,
} from "@/types";

export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShipmentPayload) => createShipment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-shipments"] });
    },
  });
}

export function useMyShipments(query?: ShipmentListQuery) {
  return useQuery({
    queryKey: ["my-shipments", query],
    queryFn: () => getMyShipments(query),
  });
}

export function useAllShipments(query?: ShipmentListQuery) {
  return useQuery({
    queryKey: ["all-shipments", query],
    queryFn: () => getAllShipments(query),
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: ["shipment", id],
    queryFn: () => getShipmentById(id),
    enabled: !!id,
  });
}

export function useUpdateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateShipmentPayload;
    }) => updateShipment(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["my-shipments"] });
      qc.invalidateQueries({ queryKey: ["shipment", vars.id] });
    },
  });
}

export function useCancelShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelShipment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-shipments"] });
    },
  });
}
