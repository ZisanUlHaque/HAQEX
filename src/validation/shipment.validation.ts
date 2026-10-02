import z from "zod";

const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Valid phone required"),
  addressLine: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  postalCode: z.string().optional(),
});

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.number().int().positive(),
  weight: z.number().positive().optional(),
  declaredValue: z.number().nonnegative().optional(),
});

export const CreateShipmentZodSchema = z.object({
  packageType: z
    .enum([
      "DOCUMENT",
      "SMALL_PARCEL",
      "MEDIUM_PARCEL",
      "LARGE_PARCEL",
      "FRAGILE",
      "HAZARDOUS",
    ])
    .default("SMALL_PARCEL"),
  weight: z.number().positive("Weight must be > 0"),
  quantity: z.number().int().positive().default(1),
  declaredValue: z.number().nonnegative().optional(),
  deliveryFee: z.number().nonnegative().optional(),
  codAmount: z.number().nonnegative().optional(),
  specialInstructions: z.string().max(500).optional(),
  pickupSchedule: z.string().optional(),
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  items: z.array(itemSchema).min(1, "At least one item required"),
});

export const UpdateShipmentZodSchema = z.object({
  packageType: z
    .enum([
      "DOCUMENT",
      "SMALL_PARCEL",
      "MEDIUM_PARCEL",
      "LARGE_PARCEL",
      "FRAGILE",
      "HAZARDOUS",
    ])
    .optional(),
  weight: z.number().positive().optional(),
  quantity: z.number().int().positive().optional(),
  specialInstructions: z.string().max(500).optional(),
  pickupSchedule: z.string().optional(),
});