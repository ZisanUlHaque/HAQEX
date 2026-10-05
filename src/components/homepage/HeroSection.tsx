"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Ship, MapPin } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-background text-foreground">
      {/* Soft ambient + dots */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-chart-1/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      {/* Giant watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[42%] z-0 flex -translate-y-1/2 justify-center overflow-hidden lg:left-[18%] lg:justify-start"
      >
        <span className="select-none text-[22vw] font-black uppercase leading-none tracking-tighter text-foreground/[0.045] dark:text-foreground/[0.07] sm:text-[18vw] lg:text-[14rem]">
          HAQ
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-6 md:pb-20 md:pt-8 lg:px-10 lg:pb-24 lg:pt-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          <div className="flex flex-col justify-center lg:col-span-5">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground shadow-sm backdrop-blur-md sm:text-[11px]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-1 opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-chart-1" />
              </span>
              Global logistics · Real-time tracking
            </div>

            <h1 className="mb-5 text-balance text-[2.6rem] font-black leading-[0.98] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.65rem] xl:text-[4.1rem]">
              Seamless
              <br />
              Logistics
              <br />
              <span className="bg-gradient-to-r from-chart-1 via-emerald-400 to-chart-2 bg-clip-text text-transparent">
                Solutions
              </span>
              <br />
              for Your
              <br />
              Business
            </h1>

            <p className="mb-8 max-w-[26rem] text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Managing logistics doesn&apos;t have to be complex. We streamline
              your supply chain with efficient, cost-effective, and reliable
              delivery — from first mile to last.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/services">
                <button
                  type="button"
                  className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-chart-1 pl-6 pr-1.5 text-sm font-bold text-emerald-950 shadow-lg shadow-chart-1/25 transition hover:bg-chart-2 hover:shadow-chart-1/35 active:scale-[0.98]"
                >
                  View Services
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950 text-chart-1 transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </button>
              </Link>

              <Link href="/track">
                <button
                  type="button"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card/80 px-5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md transition hover:border-chart-1/40 hover:bg-card"
                >
                  <MapPin className="h-4 w-4 text-chart-1" />
                  Track parcel
                </button>
              </Link>
            </div>

          </div>

          <div className="relative mx-auto h-[480px] w-full max-w-xl sm:h-[540px] lg:col-span-7 lg:mx-0 lg:h-[600px] lg:max-w-none">
            <div className="absolute right-0 top-[8%] z-10 h-[78%] w-[72%] overflow-hidden rounded-[1.75rem] border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] sm:w-[68%] lg:right-0 lg:top-6 lg:h-[520px] lg:w-[400px] xl:w-[430px]">
              <Image
                src="/cargo.png"
                alt="Stacked shipping containers"
                fill
                priority
                className="object-cover object-center transition duration-700 ease-out hover:scale-[1.04]"
                sizes="(max-width: 1024px) 70vw, 430px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                    Live fleet
                  </p>
                  <p className="text-sm font-bold tracking-tight">
                    Port → Hub network
                  </p>
                </div>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur-md ring-1 ring-white/20">
                  24/7
                </span>
              </div>
            </div>

            {/* Floating inventory card */}
            <div className="absolute left-0 top-0 z-30 w-[min(100%,248px)] rounded-2xl border border-border/50 bg-card/95 p-3.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:left-2 sm:top-4 sm:w-[260px] lg:left-4 lg:top-10 lg:w-[280px]">
              <div className="mb-2.5 flex items-start justify-between gap-2">
                <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
                  Maintaining optimal inventory is key to meeting demand
                  efficiently.
                </p>
                <Ship className="mt-0.5 h-4 w-4 shrink-0 text-chart-1" />
              </div>
              <div className="relative h-[120px] w-full overflow-hidden rounded-xl bg-muted sm:h-[128px]">
                <Image
                  src="/hero.png"
                  alt="Container ship at port"
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-semibold text-foreground">In transit</span>
                <span className="rounded-full bg-chart-1/15 px-2.5 py-0.5 text-[10px] font-bold text-chart-1 ring-1 ring-chart-1/20">
                  On schedule
                </span>
              </div>
            </div>

            {/* Green scribble arrow */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-[30%] top-[25%] z-40 hidden lg:block"
            >
              <svg
                width="140"
                height="150"
                viewBox="0 0 140 150"
                fill="none"
                className="text-chart-1 drop-shadow-sm"
              >
                <path
                  d="M95 8 C 115 28, 125 48, 108 62 C 88 78, 70 55, 82 42 C 98 25, 120 55, 105 85 C 88 120, 55 125, 28 138"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M22 128 L 28 140 L 42 132"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>

            {/* Vertical oval slice */}
            <div className="absolute bottom-2 left-[20%] z-20 h-[210px] w-[108px] overflow-hidden rounded-full border-[3px] border-white shadow-[0_18px_40px_-12px_rgba(0,0,0,0.4)] sm:bottom-4 sm:left-[18%] sm:h-[250px] sm:w-[120px] lg:bottom-8 lg:left-[24%] lg:h-[290px] lg:w-37.5 dark:border-border">
              <Image
                src="/rider.png"
                alt="Port cranes and containers"
                fill
                className="object-cover object-center"
                sizes="136px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}