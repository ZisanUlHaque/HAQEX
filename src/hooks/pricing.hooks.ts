import { calculatePricingApi } from "@/api";
import { PricingInput } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const useCalculatePricing = () => {
  return useMutation({
    mutationFn: (payload: PricingInput) => calculatePricingApi(payload),
  });
};
