import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddTrackingEventPayload } from "@/types";
import { addTrackingEvent, getTrackingTimeline } from "@/api/tracking.api";

export function useTracking(trackingNumber: string) {
  return useQuery({
    queryKey: ["tracking", trackingNumber],
    queryFn: () => getTrackingTimeline(trackingNumber),
    enabled: !!trackingNumber && trackingNumber.length >= 5,
    retry: false,
  });
}

export function useAddTrackingEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      payload,
    }: {
      shipmentId: string;
      payload: AddTrackingEventPayload;
    }) => addTrackingEvent(shipmentId, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["shipment", vars.shipmentId] });
      qc.invalidateQueries({ queryKey: ["tracking"] });
      qc.invalidateQueries({ queryKey: ["my-shipments"] });
    },
  });
}