import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  Globe2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Services | HAQEX Courier & Logistics",
  description:
    "Explore our comprehensive logistics solutions including Ocean Freight, Air Freight, Warehousing, and Road Transport.",
};

const DETAILED_SERVICES = [
  {
    id: "ocean",
    title: "Ocean Freight",
    description:
      "Cost-effective and highly reliable sea transportation for large volumes of cargo. We manage everything from port to port, including customs clearance.",
    features: [
      "Full Container Load (FCL)",
      "Less than Container Load (LCL)",
      "Port-to-port & Door-to-door",
      "Customs brokerage & compliance",
    ],
    image: "/Ocean.png",
  },
  {
    id: "air",
    title: "Air Freight",
    description:
      "When time is of the essence, our air freight services ensure your time-sensitive shipments reach their destination globally with maximum speed and security.",
    features: [
      "Next-flight-out express delivery",
      "Consolidated air cargo",
      "Charter services for heavy load",
      "24/7 real-time tracking",
    ],
    image: "/air.png",
  },
  {
    id: "warehouse",
    title: "Warehousing & Distribution",
    description:
      "Secure storage, inventory management, and efficient distribution solutions. We act as an extension of your business, fulfilling orders accurately.",
    features: [
      "Climate-controlled storage",
      "Pick, pack, and ship fulfillment",
      "Real-time inventory API sync",
      "Cross-docking operations",
    ],
    image: "/wear.png",
  },
  {
    id: "road",
    title: "Road Transport",
    description:
      "Flexible and robust road freight networks for local, regional, and cross-border deliveries. From first-mile pickup to last-mile delivery.",
    features: [
      "Full Truckload (FTL)",
      "Less than Truckload (LTL)",
      "Last-mile courier dispatch",
      "Live GPS fleet tracking",
    ],
    image: "/delivery.png",
  },
];

const SPECIALTIES = [
  {
    icon: Globe2,
    title: "B2B Bulk Shipping",
    description: "Tailored enterprise contracts with dedicated account managers and volume discounts.",
  },
  {
    icon: Zap,
    title: "E-Commerce Integration",
    description: "Seamless API connections with Shopify, WooCommerce, and custom storefronts.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Hazardous",
    description: "Certified handling of fragile, high-value, and specialized hazardous materials.",
  },
];

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-chart-1 selection:text-emerald-950">
      {/* ================================================================= */}
      {/* 1. PAGE HERO */}
      {/* ================================================================= */}
      <section className="relative w-full overflow-hidden bg-muted/30 pt-24 pb-16 md:pt-32 md:pb-24 border-b border-border">
        {/* Soft background glow */}
        <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-chart-1/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-5 text-center sm:px-6 lg:px-10">
          <span className="inline-flex items-center rounded-full border border-chart-1/30 bg-chart-1/10 px-3 py-1 text-xs font-semibold text-chart-1 shadow-sm">
            End-to-End Solutions
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-[4rem] leading-[1.1]">
            Logistics engineered <br className="hidden sm:block" />
            for <span className="text-chart-1">modern scale.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg leading-relaxed">
            From cross-border ocean freight to last-mile courier delivery, HAQEX
            provides the infrastructure, technology, and fleet to keep your business moving.
          </p>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. CORE SERVICES (Alternating Layout) */}
      {/* ================================================================= */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-10 md:py-28 space-y-24 md:space-y-32">
        {DETAILED_SERVICES.map((service, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={service.id}
              id={service.id}
              className={`flex flex-col gap-10 lg:items-center lg:gap-16 ${
                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              {/* Image Side */}
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-muted shadow-xl border border-border">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={index === 0}
                  />
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-1/15 text-chart-1">
                    <Package className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Service 0{index + 1}
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                  {service.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {service.description}
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {service.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-chart-1" />
                      <span className="text-sm font-medium text-foreground">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/pricing">
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-semibold transition-all hover:border-chart-1/50 hover:bg-chart-1/5 hover:text-chart-1 shadow-sm"
                  >
                    Calculate Rate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      {/* ================================================================= */}
      {/* 3. SPECIALTIES GRID */}
      {/* ================================================================= */}
      <section className="bg-muted/30 border-y border-border py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <div className="mb-14 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Specialized Solutions
            </h2>
            <p className="text-muted-foreground">
              Beyond standard logistics, we offer tailored services designed to meet specific industry requirements and operational scales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {SPECIALTIES.map((spec, i) => (
              <div
                key={i}
                className="rounded-3xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/15 text-chart-1">
                  <spec.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{spec.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {spec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. BOTTOM CTA */}
      {/* ================================================================= */}
      <section className="py-20 md:py-32 bg-background">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 px-8 py-16 text-center md:py-20 shadow-2xl">
            {/* Background texture */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            
            <div className="relative z-10 mx-auto max-w-xl">
              <h2 className="mb-5 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                Ready to ship with HAQEX?
              </h2>
              <p className="mb-8 text-zinc-400 text-sm md:text-base leading-relaxed">
                Create an account to book your first delivery instantly, or contact our sales team for enterprise volume pricing.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <button
                    type="button"
                    className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-chart-1 px-8 text-sm font-bold text-emerald-950 shadow-lg shadow-chart-1/20 transition-transform hover:scale-105 active:scale-95"
                  >
                    Create Free Account
                  </button>
                </Link>
                <Link href="/contact">
                  <button
                    type="button"
                    className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-zinc-700 bg-transparent px-8 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
                  >
                    Contact Sales
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}