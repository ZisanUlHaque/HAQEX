import PricingCalculator from "@/components/modules/pricing/PricingCalculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | HAQEX Courier & Logistics",
  description:
    "Transparent delivery pricing. Calculate exact shipping fees by weight, package type, and destination.",
};

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-chart-1/20 via-background to-background">
      {/* soft cloud glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--chart-1) 18%, transparent), transparent 40%), radial-gradient(circle at 80% 10%, color-mix(in oklab, var(--chart-2) 14%, transparent), transparent 35%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 md:px-12 md:pt-24">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-chart-1/25 bg-chart-1/10 px-3 py-1 text-xs font-semibold text-chart-1">
            <span className="h-1.5 w-1.5 rounded-full bg-chart-1" />
            Best Pricing
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Transparent{" "}
            <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>

          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Start with what you need today and scale as you grow.
            <br className="hidden sm:block" />
            Every rate is built for clarity and control — no hidden fees.
          </p>
        </div>

        <PricingCalculator />
      </div>
    </div>
  );
}