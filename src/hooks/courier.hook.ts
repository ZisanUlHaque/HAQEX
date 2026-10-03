import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCourierAnalytics } from "@/api/courier.api";
import {
  getCourierProfile,
  getCourierShipments,
  updateCourierAvailability,
} from "@/api/courier.api";
import type {
  CourierShipmentQuery,
  UpdateCourierAvailabilityPayload,
} from "@/types/courier";

export function useCourierAnalytics() {
  return useQuery({
    queryKey: ["courier-analytics"],
    queryFn: getCourierAnalytics,
  });
}

export function useCourierProfile() {
  return useQuery({
    queryKey: ["courier-profile"],
    queryFn: getCourierProfile,
  });
}

export function useCourierShipments(query?: CourierShipmentQuery) {
  return useQuery({
    queryKey: ["courier-shipments", query],
    queryFn: () => getCourierShipments(query),
  });
}

export function useUpdateCourierAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCourierAvailabilityPayload) =>
      updateCourierAvailability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courier-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["courier-analytics"] });
    },
  });
}
