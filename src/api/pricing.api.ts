import apiClient from "@/lib/apiClient";
import { PricingInput } from "@/types";

export const calculatePricingApi = async (payload: PricingInput) => {
  return await apiClient("/pricing/calculate", {
    method: "POST",
    body: payload,
  });
};