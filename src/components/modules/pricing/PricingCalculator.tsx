"use client";

import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Check,
  Package,
  MapPin,
  Scale,
  Sparkles,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useCalculatePricing } from "@/hooks/pricing.hooks";

const PACKAGE_TYPES = [
  {
    value: "DOCUMENT",
    label: "Document",
    hint: "Papers, envelopes",
    mult: 0.8,
  },
  {
    value: "SMALL_PARCEL",
    label: "Small Parcel",
    hint: "Up to ~2 kg",
    mult: 1.0,
  },
  {
    value: "MEDIUM_PARCEL",
    label: "Medium Parcel",
    hint: "Box / bag",
    mult: 1.2,
  },
  {
    value: "LARGE_PARCEL",
    label: "Large Parcel",
    hint: "Bulky items",
    mult: 1.5,
  },
  { value: "FRAGILE", label: "Fragile", hint: "Glass, electronics", mult: 1.8 },
  {
    value: "HAZARDOUS",
    label: "Hazardous",
    hint: "Special handling",
    mult: 2.2,
  },
] as const;

type PackageType = (typeof PACKAGE_TYPES)[number]["value"];

const CalculateSchema = z.object({
  weight: z.number().positive("Weight must be greater than 0"),
  packageType: z.enum([
    "DOCUMENT",
    "SMALL_PARCEL",
    "MEDIUM_PARCEL",
    "LARGE_PARCEL",
    "FRAGILE",
    "HAZARDOUS",
  ]),
  isInterCity: z.boolean(),
});

type Quote = {
  weight: number;
  packageType: string;
  isInterCity: boolean;
  baseRate: number;
  multiplier: number;
  estimatedDeliveryFee: number;
  currency: string;
};

function calculateLocalPrice(
  weight: number,
  packageType: string,
  isInterCity: boolean,
): Quote {
  const baseRate = isInterCity ? 120 : 60;
  const perKgRate = isInterCity ? 25 : 15;

  const pkg = PACKAGE_TYPES.find((p) => p.value === packageType);
  const multiplier = pkg ? pkg.mult : 1.0;

  const extraWeight = Math.max(0, weight - 1);
  const totalFee = Math.round(
    (baseRate + extraWeight * perKgRate) * multiplier,
  );

  return {
    weight,
    packageType,
    isInterCity,
    baseRate,
    multiplier,
    estimatedDeliveryFee: totalFee,
    currency: "BDT",
  };
}

const sidePlans = [
  {
    name: "Within City",
    priceLabel: "From ৳60",
    period: "base",
    features: [
      "Same-city pickup & drop",
      "Base rate ৳60 + ৳15/kg",
      "Documents & parcels",
      "Real-time tracking",
      "Cash / online payment",
      "Standard support",
    ],
    cta: "Ship Locally",
  },
  {
    name: "Inter-City",
    priceLabel: "From ৳120",
    period: "base",
    features: [
      "Any city across BD",
      "Base rate ৳120 + ৳25/kg",
      "Fragile & hazardous options",
      "Hub-to-hub network",
      "Priority handling",
      "Dedicated support line",
    ],
    cta: "Ship Nationwide",
  },
];

export default function PricingCalculator() {
  const [isInterCity, setIsInterCity] = useState(false);
  const [weight, setWeight] = useState(2);
  const [packageType, setPackageType] = useState<PackageType>("MEDIUM_PARCEL");

  const { mutate: calculatePricing, isPending: loading } =
    useCalculatePricing();

  const liveQuote = useMemo(
    () => calculateLocalPrice(weight, packageType, isInterCity),
    [weight, packageType, isInterCity],
  );

  const [quote, setQuote] = useState<Quote>(liveQuote);

  const form = useForm({
    defaultValues: {
      weight: 2,
      packageType: "MEDIUM_PARCEL" as PackageType,
      isInterCity: false,
    },
    validators: {
      onSubmit: CalculateSchema,
    },
    onSubmit: async ({ value }) => {
      calculatePricing(value, {
        onSuccess: (res: any) => {
          const data: Quote = res?.data ?? res;
          if (data && typeof data.estimatedDeliveryFee === "number") {
            setQuote(data);
            toast.add({
              title: "Quote Calculated",
              description: `Estimated fee: ৳${data.estimatedDeliveryFee}`,
              type: "success",
            });
          }
        },
        onError: (err: any) => {
          const computed = calculateLocalPrice(
            value.weight,
            value.packageType,
            value.isInterCity,
          );
          setQuote(computed);
          toast.add({
            title: "Quote Calculated",
            description: `Estimated fee: ৳${computed.estimatedDeliveryFee}`,
            type: "success",
          });
        },
      });
    },
  });

  return (
    <div className="space-y-10">
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setIsInterCity(false);
              form.setFieldValue("isInterCity", false);
              setQuote(calculateLocalPrice(weight, packageType, false));
            }}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition-all",
              !isInterCity
                ? "bg-chart-1 text-emerald-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Within City
          </button>
          <button
            type="button"
            onClick={() => {
              setIsInterCity(true);
              form.setFieldValue("isInterCity", true);
              setQuote(calculateLocalPrice(weight, packageType, true));
            }}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition-all",
              isInterCity
                ? "bg-chart-1 text-emerald-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Inter-City
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-5">
        <PlanCard plan={sidePlans[0]} dimmed={isInterCity} />

        <div className="relative z-10 lg:-mt-4 lg:mb-[-1rem]">
          <div className="h-full rounded-[1.75rem] bg-gradient-to-b from-chart-1 to-chart-2 p-[1px] shadow-2xl shadow-chart-1/30">
            <div className="flex h-full flex-col rounded-[1.7rem] bg-gradient-to-b from-chart-1 to-chart-2/95 p-6 text-emerald-950 md:p-8">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold opacity-90">Calculator</p>
                  <p className="text-xs opacity-70">Live delivery quote</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur">
                  <Sparkles className="h-3 w-3" />
                  Live Quote
                </span>
              </div>

              <div className="mt-4 mb-6">
                <p className="text-xs font-medium opacity-80">Estimated fee</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold tracking-tight md:text-6xl">
                    ৳
                    {quote
                      ? quote.estimatedDeliveryFee
                      : liveQuote.estimatedDeliveryFee}
                  </span>
                  <span className="mb-2 text-sm font-medium opacity-70">
                    / delivery
                  </span>
                </div>
                <p className="mt-1 text-xs opacity-75">
                  {isInterCity
                    ? "Inter-city · base ৳120 + ৳25/kg × package multiplier"
                    : "Within city · base ৳60 + ৳15/kg × package multiplier"}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="flex flex-1 flex-col"
              >
                <FieldGroup className="gap-4">
                  <form.Field name="weight">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel className="text-emerald-950/80">
                            <span className="inline-flex items-center gap-1.5">
                              <Scale className="h-3.5 w-3.5" />
                              Weight (kg)
                            </span>
                          </FieldLabel>
                          <Input
                            type="number"
                            min={0.1}
                            step={0.1}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 1;
                              field.handleChange(val);
                              setWeight(val);
                              setQuote(
                                calculateLocalPrice(
                                  val,
                                  packageType,
                                  isInterCity,
                                ),
                              );
                            }}
                            className="h-11 border-white/30 bg-white/90 font-semibold text-foreground placeholder:text-muted-foreground focus-visible:ring-white/40"
                            placeholder="e.g. 2"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name="packageType">
                    {(field) => (
                      <Field>
                        <FieldLabel className="text-emerald-950/80">
                          <span className="inline-flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" />
                            Package type
                          </span>
                        </FieldLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {PACKAGE_TYPES.map((type) => {
                            const selected = field.state.value === type.value;
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                  field.handleChange(type.value);
                                  setPackageType(type.value);
                                  setQuote(
                                    calculateLocalPrice(
                                      weight,
                                      type.value,
                                      isInterCity,
                                    ),
                                  );
                                }}
                                className={cn(
                                  "rounded-xl border px-3 py-2 text-left transition-all",
                                  selected
                                    ? "border-white bg-white font-bold text-emerald-950 shadow-sm"
                                    : "border-white/25 bg-white/10 text-emerald-950/90 hover:bg-white/20",
                                )}
                              >
                                <p className="text-xs leading-tight">
                                  {type.label}
                                </p>
                                <p className="text-[10px] opacity-70">
                                  {type.hint}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </Field>
                    )}
                  </form.Field>

                  <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <MapPin className="h-3.5 w-3.5" />
                      {isInterCity
                        ? "Inter-City delivery"
                        : "Within City delivery"}
                    </span>
                  </div>
                </FieldGroup>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-6 h-12 w-full rounded-full bg-white font-bold text-emerald-950 shadow-lg hover:bg-white/95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating…
                    </>
                  ) : (
                    <>
                      Get Exact Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {quote && (
                  <div className="mt-5 space-y-1.5 rounded-xl bg-white/15 p-3.5 text-xs backdrop-blur-sm">
                    <p className="font-semibold text-emerald-950">
                      Price Breakdown
                    </p>
                    <div className="flex justify-between opacity-90">
                      <span>Base rate:</span>
                      <span>৳{quote.baseRate}</span>
                    </div>
                    <div className="flex justify-between opacity-90">
                      <span>Multiplier ({quote.packageType}):</span>
                      <span>×{quote.multiplier}</span>
                    </div>
                    <div className="flex justify-between opacity-90">
                      <span>Weight ({quote.weight} kg):</span>
                      <span>
                        +
                        {Math.max(0, quote.weight - 1) *
                          (quote.isInterCity ? 25 : 15)}{" "}
                        ৳
                      </span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <PlanCard plan={sidePlans[1]} dimmed={!isInterCity} />
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-foreground">
          Package type multipliers
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Applied on top of base + per-kg rate
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {PACKAGE_TYPES.map((type) => (
            <span
              key={type.value}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs"
            >
              <span className="text-muted-foreground">{type.label}</span>
              <span className="font-semibold text-chart-1">×{type.mult}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  dimmed,
}: {
  plan: (typeof sidePlans)[number];
  dimmed?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-[1.75rem] border border-border bg-card p-6 shadow-lg shadow-black/5 transition-all md:p-8",
        dimmed && "opacity-60 lg:opacity-80",
      )}
    >
      <div className="mb-6">
        <p className="text-sm font-semibold text-muted-foreground">
          {plan.name}
        </p>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-4xl font-bold tracking-tight text-foreground">
            {plan.priceLabel}
          </span>
          <span className="mb-1 text-sm text-muted-foreground">
            /{plan.period}
          </span>
        </div>
      </div>

      <a
        href="#calculator"
        className="mb-8 flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-chart-1 to-chart-2 text-sm font-semibold text-emerald-950 shadow hover:opacity-95 transition-all"
      >
        {plan.cta}
      </a>

      <p className="mb-3 text-sm font-semibold text-foreground">
        What&apos;s included:
      </p>
      <ul className="space-y-2.5">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-sm text-muted-foreground"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-chart-1/15 text-chart-1">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
