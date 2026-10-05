"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const SERVICES = [
  {
    title: "Ocean Freight",
    description:
      "Cost-effective and reliable sea transportation for large volumes.",
    image: "/Ocean.png",
    href: "/services",
  },
  {
    title: "Air Freight",
    description:
      "Fast and secure air cargo services for time-sensitive shipments.",
    image: "/air.png",
    href: "/services",
  },
  {
    title: "Warehousing & Distribution",
    description:
      "Secure storage and efficient distribution solutions for your inventory.",
    image: "/wear.png",
    href: "/services",
  },
  {
    title: "Road Transport",
    description:
      "Flexible road freight for both local and regional deliveries.",
    image: "/delivery.png",
    href: "/services",
  },
] as const;

export default function ServicesSection() {
  return (
    <section className="w-full bg-background py-20 text-foreground md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-border bg-muted/60 px-3.5 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
            Services
          </span>

          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.5rem] md:leading-[1.2]">
            Shipping That Works Like You Do.
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            One platform for ocean, air, road, and warehouse — built for clarity
            and control.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5">
          {SERVICES.map((service, index) => (
            <Link
              key={service.title}
              href={service.href}
              className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl bg-zinc-100 outline-none ring-offset-background transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)] focus-visible:ring-2 focus-visible:ring-chart-1 dark:bg-zinc-900"
            >
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Readable gradient — soft, not crushed blacks */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              </div>

              {/* Index */}
              <div className="relative z-10 flex items-start justify-between p-5">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white backdrop-blur-md">
                  0{index + 1}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/0 text-white opacity-0 transition duration-300 group-hover:bg-white/15 group-hover:opacity-100 group-hover:backdrop-blur-md">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
                </span>
              </div>

              {/* Copy */}
              <div className="relative z-10 mt-auto p-5 pt-0 sm:p-6 sm:pt-0">
                <h3 className="text-[1.05rem] font-semibold tracking-tight text-white sm:text-lg">
                  {service.title}
                </h3>
                <p className="mt-2 max-w-[28ch] text-[13px] leading-relaxed text-white/75 sm:text-sm">
                  {service.description}
                </p>

                {/* Subtle bottom accent */}
                <div className="mt-5 h-px w-10 bg-chart-1 transition-all duration-300 group-hover:w-16" />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer link */}
        <div className="mt-10 flex justify-center md:mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-chart-1"
          >
            Explore all services
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}