import { useQuery } from "@tanstack/react-query";
import { getCustomerAnalytics } from "@/api";

export function useCustomerAnalytics() {
  return useQuery({
    queryKey: ["customer-analytics"],
    queryFn: getCustomerAnalytics,
    retry: false,
  });
}
