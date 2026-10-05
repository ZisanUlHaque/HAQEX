"use client";

import Image from "next/image";
import { Truck } from "lucide-react";

export default function WeServeSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-16 md:py-24">
      {/* Soft top wash like the reference */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-chart-1/10 via-chart-1/5 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <span className="mb-5 inline-flex rounded-full border border-border bg-card px-3.5 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
            We Serve
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
            Delivering the Last Mile Right
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            We specialize in fast, reliable last mile delivery, ensuring your
            products reach your customers&apos; doorsteps with precision and care.
          </p>
        </div>

        {/* Map stage */}
        <div className="relative mx-auto h-[300px] w-full max-w-5xl sm:h-[360px] md:h-[420px] lg:h-[460px]">
          {/* World map (faded) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-full w-full max-w-4xl opacity-[0.18] dark:opacity-[0.28]">
              <Image
                src="/world-map.png"
                alt=""
                fill
                className="object-contain object-center"
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            </div>
          </div>

          {/* Big dashed arc */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1000 460"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M80 300 C 250 40, 750 40, 920 300"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="7 8"
              className="text-chart-1/50"
            />
            {/* Network routes */}
            <path
              d="M280 250 C 360 180, 480 200, 560 240"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeDasharray="5 6"
              className="text-chart-1/45"
            />
            <path
              d="M320 280 C 420 220, 520 210, 640 250"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeDasharray="5 6"
              className="text-chart-1/40"
            />
            <path
              d="M360 300 C 450 260, 580 230, 720 220"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeDasharray="5 6"
              className="text-chart-1/35"
            />
            <path
              d="M400 320 C 500 280, 620 270, 760 290"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeDasharray="5 6"
              className="text-chart-1/35"
            />
            <path
              d="M300 220 C 400 160, 550 150, 700 200"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeDasharray="5 6"
              className="text-chart-1/30"
            />

            {/* Hub dots */}
            {[
              [300, 240],
              [360, 200],
              [420, 260],
              [480, 210],
              [540, 250],
              [600, 190],
              [660, 230],
              [720, 210],
              [500, 300],
              [580, 310],
              [640, 280],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="10"
                  className="fill-chart-1/15"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="4.5"
                  className="fill-chart-1"
                />
              </g>
            ))}
          </svg>

          {/* Top hub pin */}
          <div className="absolute left-1/2 top-[6%] z-20 flex -translate-x-1/2 flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-chart-1 text-emerald-950 shadow-lg shadow-chart-1/30 ring-4 ring-chart-1/15">
              <Truck className="h-5 w-5" strokeWidth={2.5} />
            </div>
          </div>

          {/* Trucks cluster (center-left) — image or CSS fallback */}
          <div className="absolute left-[18%] top-[38%] z-20 w-[42%] max-w-[320px] sm:left-[22%] sm:top-[36%] md:left-[24%]">
            <div className="relative aspect-[16/9] w-full">
              {/* Prefer a transparent PNG of trucks if you have one */}
              <Image
                src="/we.png"
                alt="Delivery fleet"
                fill
                className="object-contain object-left drop-shadow-xl"
                sizes="320px"
                onError={(e) => {
                  // hide broken image — FleetFallback shows via CSS sibling if needed
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>

          {/* Small truck right */}
          <div className="absolute right-[16%] top-[34%] z-20 hidden w-16 sm:block md:right-[18%] md:w-20">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/we2.png"
                alt=""
                fill
                className="object-contain drop-shadow-lg"
                sizes="80px"
              />
            </div>
          </div>

          {/* Anywhere pills */}
          <div className="absolute bottom-[18%] left-[4%] z-20 sm:left-[6%] md:bottom-[22%] md:left-[8%]">
            <span className="inline-flex rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-950">
              Anywhere
            </span>
          </div>
          <div className="absolute bottom-[18%] right-[4%] z-20 sm:right-[6%] md:bottom-[22%] md:right-[8%]">
            <span className="inline-flex rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-950">
              Anywhere
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}