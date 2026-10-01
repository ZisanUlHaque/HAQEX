export interface PricingInput {
  weight: number;
  packageType: string;
  isInterCity: boolean;
}

export interface PricingResponse {
  weight: number;
  packageType: string;
  isInterCity: boolean;
  baseRate: number;
  multiplier: number;
  estimatedDeliveryFee: number;
  currency: string;
}