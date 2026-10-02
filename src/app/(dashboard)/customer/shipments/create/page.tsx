"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Package,
  ClipboardList,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useCreateShipment, useCalculatePricing } from "@/hooks";
import { CreateShipmentZodSchema } from "@/validation";
import { cn } from "@/lib/utils";
import type { PackageType } from "@/types";

const STEPS = [
  { id: 1, title: "Package Details", icon: Package },
  { id: 2, title: "Pickup & Delivery", icon: MapPin },
  { id: 3, title: "Review & Confirm", icon: ClipboardList },
];

const PACKAGE_TYPES: { value: PackageType; label: string }[] = [
  { value: "DOCUMENT", label: "Document" },
  { value: "SMALL_PARCEL", label: "Small Parcel" },
  { value: "MEDIUM_PARCEL", label: "Medium Parcel" },
  { value: "LARGE_PARCEL", label: "Large Parcel" },
  { value: "FRAGILE", label: "Fragile" },
  { value: "HAZARDOUS", label: "Hazardous" },
];

export default function CreateShipmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { mutate: createShipment, isPending } = useCreateShipment();
  const { mutateAsync: calcPrice } = useCalculatePricing();

  const form = useForm({
    defaultValues: {
      packageType: "SMALL_PARCEL" as PackageType,
      weight: 1,
      quantity: 1,
      declaredValue: 500,
      deliveryFee: 60,
      codAmount: 0,
      specialInstructions: "",
      pickupSchedule: "",
      isInterCity: false,
      pickupAddress: {
        name: "Sender Name",
        phone: "01712345678",
        addressLine: "House 12, Road 5, Block B",
        city: "Dhaka",
        district: "Dhaka",
        postalCode: "1212",
      },
      deliveryAddress: {
        name: "Receiver Name",
        phone: "01812345678",
        addressLine: "Station Road, Agrabad",
        city: "Chittagong",
        district: "Chittagong",
        postalCode: "4000",
      },
      items: [
        {
          description: "Documents / Cloths",
          quantity: 1,
          weight: 1,
          declaredValue: 500,
        },
      ],
    },
    validators: {
      onSubmit: CreateShipmentZodSchema,
    },
    onSubmitInvalid: () => {
      toast.add({
        title: "Form Validation Failed",
        description: "Please check all required fields in Step 1 & 2.",
        type: "error",
      });
    },
    onSubmit: async ({ value }) => {
      let finalFee = value.deliveryFee || 60;

      // Calculate price via API
      try {
        const res: any = await calcPrice({
          weight: value.weight || 1,
          packageType: value.packageType,
          isInterCity: value.isInterCity,
        });
        const q = res?.data ?? res;
        if (q?.estimatedDeliveryFee) {
          finalFee = q.estimatedDeliveryFee;
        }
      } catch {
        const base = value.isInterCity ? 120 : 60;
        const extra =
          Math.max(0, (value.weight || 1) - 1) * (value.isInterCity ? 25 : 15);
        finalFee = Math.round(base + extra);
      }

      const payload = {
        packageType: value.packageType,
        weight: Number(value.weight) || 1,
        quantity: Number(value.quantity) || 1,
        declaredValue: Number(value.declaredValue) || undefined,
        deliveryFee: finalFee,
        codAmount: Number(value.codAmount) || undefined,
        specialInstructions: value.specialInstructions || undefined,
        pickupSchedule: value.pickupSchedule
          ? new Date(value.pickupSchedule).toISOString()
          : undefined,
        pickupAddress: value.pickupAddress,
        deliveryAddress: value.deliveryAddress,
        items: value.items.map((it) => ({
          description: it.description || "General Item",
          quantity: Number(it.quantity) || 1,
          weight: Number(it.weight) || 1,
          declaredValue: Number(it.declaredValue) || undefined,
        })),
      };

      createShipment(payload, {
        onSuccess: (res: any) => {
          const shipment = res?.data ?? res;
          toast.add({
            title: "Shipment Created Successfully! 🚚",
            description: `Tracking Number: ${shipment?.trackingNumber || "Assigned"}`,
            type: "success",
          });
          router.push(
            shipment?.id
              ? `/customer/shipments/${shipment.id}`
              : "/customer/shipments",
          );
        },
        onError: (err: any) => {
          toast.add({
            title: "Failed to Create Shipment",
            description:
              err?.data?.message ||
              err?.message ||
              "Server error occurred. Try again.",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:px-8">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/customer/shipments")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Shipments
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Shipment</h1>
          <p className="text-sm text-muted-foreground">
            Multi-step parcel booking
          </p>
        </div>
      </div>

      {/* Step Progress Header */}
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = step === s.id;
          const done = step > s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-all",
                  done && "border-chart-1 bg-chart-1 text-emerald-950",
                  active &&
                    "border-chart-1 bg-chart-1/15 text-chart-1 ring-2 ring-chart-1/20",
                  !active && !done && "border-border text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </button>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  active
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {s.title}
              </span>
              {i < STEPS.length - 1 && (
                <div className="mx-2 hidden h-px flex-1 bg-border sm:block" />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Only trigger actual form submit if we are on the Review Step (Step 3)
          if (step === 3) {
            form.handleSubmit();
          }
        }}
        className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8"
      >
        {/* STEP 1: PACKAGE DETAILS */}
        {step === 1 && (
          <FieldGroup className="gap-5">
            <form.Field name="packageType">
              {(field) => (
                <Field>
                  <FieldLabel>Package Type</FieldLabel>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {PACKAGE_TYPES.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => field.handleChange(p.value)}
                        className={cn(
                          "rounded-xl border px-3 py-3 text-left text-sm transition-all",
                          field.state.value === p.value
                            ? "border-chart-1 bg-chart-1/10 font-semibold text-foreground ring-1 ring-chart-1"
                            : "border-border text-muted-foreground hover:border-chart-1/40",
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="weight">
                {(field) => (
                  <Field>
                    <FieldLabel>Total Weight (kg)</FieldLabel>
                    <Input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(parseFloat(e.target.value) || 1)
                      }
                      onBlur={field.handleBlur}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="quantity">
                {(field) => (
                  <Field>
                    <FieldLabel>Quantity</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="declaredValue">
                {(field) => (
                  <Field>
                    <FieldLabel>Declared Value (৳)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="codAmount">
                {(field) => (
                  <Field>
                    <FieldLabel>COD Amount (৳)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Field name="isInterCity">
              {(field) => (
                <Field>
                  <FieldLabel>Delivery Zone</FieldLabel>
                  <div className="flex gap-3">
                    {[
                      { val: false, label: "Within City (Local)" },
                      { val: true, label: "Inter-City (Nationwide)" },
                    ].map((opt) => (
                      <button
                        key={String(opt.val)}
                        type="button"
                        onClick={() => field.handleChange(opt.val)}
                        className={cn(
                          "flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                          field.state.value === opt.val
                            ? "border-chart-1 bg-chart-1/10 font-bold ring-1 ring-chart-1"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            </form.Field>

            {/* Items List */}
            <form.Field name="items" mode="array">
              {(field) => (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Item Descriptions</FieldLabel>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        field.pushValue({
                          description: "",
                          quantity: 1,
                          weight: 1,
                          declaredValue: 0,
                        })
                      }
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add Item
                    </Button>
                  </div>

                  {field.state.value.map((_, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 rounded-xl border border-border p-3"
                    >
                      <div className="col-span-12 sm:col-span-6">
                        <Input
                          placeholder="Item Description (e.g. Clothes)"
                          value={field.state.value[idx].description}
                          onChange={(e) =>
                            field.replaceValue(idx, {
                              ...field.state.value[idx],
                              description: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-2">
                        <Input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={field.state.value[idx].quantity}
                          onChange={(e) =>
                            field.replaceValue(idx, {
                              ...field.state.value[idx],
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-3">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Declared ৳"
                          value={field.state.value[idx].declaredValue || ""}
                          onChange={(e) =>
                            field.replaceValue(idx, {
                              ...field.state.value[idx],
                              declaredValue: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                        {field.state.value.length > 1 && (
                          <button
                            type="button"
                            onClick={() => field.removeValue(idx)}
                            className="text-muted-foreground hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="specialInstructions">
              {(field) => (
                <Field>
                  <FieldLabel>Special Instructions (Optional)</FieldLabel>
                  <Textarea
                    rows={2}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="E.g., Handle with care, fragile contents..."
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        )}

        {/* STEP 2: ADDRESSES */}
        {step === 2 && (
          <div className="space-y-8">
            {(["pickupAddress", "deliveryAddress"] as const).map((key) => {
              const isPickup = key === "pickupAddress";
              return (
                <div key={key} className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-chart-1">
                    <MapPin className="h-4 w-4" />
                    {isPickup
                      ? "Pickup Address (Sender)"
                      : "Delivery Address (Receiver)"}
                  </h3>

                  <FieldGroup className="gap-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <form.Field name={`${key}.name`}>
                        {(field) => (
                          <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input
                              placeholder="Full Name"
                              value={field.state.value as string}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              required
                            />
                          </Field>
                        )}
                      </form.Field>

                      <form.Field name={`${key}.phone`}>
                        {(field) => (
                          <Field>
                            <FieldLabel>Phone Number</FieldLabel>
                            <Input
                              placeholder="01712345678"
                              value={field.state.value as string}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              required
                            />
                          </Field>
                        )}
                      </form.Field>
                    </div>

                    <form.Field name={`${key}.addressLine`}>
                      {(field) => (
                        <Field>
                          <FieldLabel>Address Line</FieldLabel>
                          <Input
                            placeholder="House / Road / Area Details"
                            value={field.state.value as string}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                          />
                        </Field>
                      )}
                    </form.Field>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <form.Field name={`${key}.city`}>
                        {(field) => (
                          <Field>
                            <FieldLabel>City</FieldLabel>
                            <Input
                              placeholder="Dhaka"
                              value={field.state.value as string}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              required
                            />
                          </Field>
                        )}
                      </form.Field>

                      <form.Field name={`${key}.district`}>
                        {(field) => (
                          <Field>
                            <FieldLabel>District</FieldLabel>
                            <Input
                              placeholder="Dhaka"
                              value={field.state.value as string}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              required
                            />
                          </Field>
                        )}
                      </form.Field>

                      <form.Field name={`${key}.postalCode`}>
                        {(field) => (
                          <Field>
                            <FieldLabel>Postal Code</FieldLabel>
                            <Input
                              placeholder="1212"
                              value={(field.state.value as string) || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                            />
                          </Field>
                        )}
                      </form.Field>
                    </div>
                  </FieldGroup>
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 3 && (
          <form.Subscribe
            selector={(s) => s.values}
            children={(v) => (
              <div className="space-y-4 text-sm">
                <ReviewRow
                  label="Package Type"
                  value={v.packageType.replaceAll("_", " ")}
                />
                <ReviewRow
                  label="Weight & Qty"
                  value={`${v.weight} kg · ${v.quantity} item(s)`}
                />
                <ReviewRow
                  label="Delivery Zone"
                  value={
                    v.isInterCity
                      ? "Inter-City (Nationwide)"
                      : "Within City (Local)"
                  }
                />
                <ReviewRow
                  label="COD Amount"
                  value={v.codAmount ? `৳${v.codAmount}` : "None"}
                />
                <ReviewRow
                  label="Pickup Address"
                  value={`${v.pickupAddress.name} (${v.pickupAddress.phone}) — ${v.pickupAddress.addressLine}, ${v.pickupAddress.city}`}
                />
                <ReviewRow
                  label="Delivery Address"
                  value={`${v.deliveryAddress.name} (${v.deliveryAddress.phone}) — ${v.deliveryAddress.addressLine}, ${v.deliveryAddress.city}`}
                />
                <ReviewRow
                  label="Items Description"
                  value={
                    v.items
                      .map((i) => i.description)
                      .filter(Boolean)
                      .join(", ") || "General Package"
                  }
                />

                <div className="rounded-2xl border border-chart-1/30 bg-chart-1/10 p-4 text-xs text-foreground space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-chart-1">
                    <Check className="h-4 w-4" /> Ready to submit
                  </p>
                  <p className="text-muted-foreground">
                    Upon confirmation, your shipment will be created with status{" "}
                    <strong className="text-foreground">PENDING_PAYMENT</strong>
                    .
                  </p>
                </div>
              </div>
            )}
          />
        )}

        {/* Navigation Action Buttons */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            disabled={step === 1 || isPending}
            onClick={(e) => {
              e.preventDefault();
              setStep((s) => Math.max(1, s - 1));
            }}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setStep((s) => Math.min(3, s + 1));
              }}
              className="bg-chart-1 text-emerald-950 hover:bg-chart-2 font-semibold"
            >
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="bg-chart-1 text-emerald-950 hover:bg-chart-2 font-bold px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  Shipment…
                </>
              ) : (
                <>
                  Create Shipment <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-border/60 pb-2.5">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="text-left sm:text-right font-semibold text-foreground max-w-md">
        {value}
      </span>
    </div>
  );
}
