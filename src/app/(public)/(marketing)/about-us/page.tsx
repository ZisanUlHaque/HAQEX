
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  ArrowUpRight,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-chart-1 selection:text-emerald-950 pb-20">
      <section className="mx-auto max-w-7xl px-6 pt-12 md:px-12 lg:pt-20">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">About Us</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          <div className="lg:col-span-7 space-y-8 z-10">
            <h1 className="text-5xl font-medium tracking-tight sm:text-6xl md:text-7xl lg:text-[5rem] leading-[1.05]">
              Your Trusted <br />
              Partner in Smart <br />
              Logistics
            </h1>

            <div className="flex items-center -space-x-4">
              {["/avatar-1.jpg", "/avatar-2.png", "/avatar-3.png"].map(
                (src, i) => (
                  <div
                    key={i}
                    className="h-12 w-12 rounded-full border-2 border-background overflow-hidden relative bg-muted"
                  >
                    <Image
                      src={src}
                      alt={`Team member ${i + 1}`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ),
              )}
              <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-foreground text-background">
                <span className="text-sm font-bold">+</span>
              </div>
            </div>
          </div>

          {/* Right: Text & Image */}
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end space-y-8">
            <p className="max-w-md text-base md:text-lg leading-relaxed text-muted-foreground lg:text-right">
              We empower businesses with seamless delivery solutions, streamline
              supply chains, and ensure every package reaches its destination
              safely and on time.
            </p>

            <div className="relative w-full max-w-sm">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-muted">
                <Image
                  src="/about-hero.png"
                  alt="HAQEX Logistics Fleet"
                  fill
                  sizes="(max-width: 1024px) 100vw, 384px"
                  className="object-cover"
                  priority
                />
              </div>

              <Link
                href="#contact"
                className="absolute -bottom-6 -left-6 md:-left-12 flex items-center gap-3 rounded-full bg-chart-1 px-6 py-4 text-sm font-semibold text-emerald-950 shadow-xl shadow-chart-1/20 transition-transform hover:scale-105"
              >
                Partner With Us
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 text-chart-1">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pt-32 pb-16 md:px-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 border-t border-border pt-12">
          <h3 className="text-xl font-medium text-foreground whitespace-nowrap">
            Trusted by Top Brands
          </h3>
          <div className="flex w-full flex-wrap items-center justify-center md:justify-between gap-8 opacity-50 grayscale transition-all hover:grayscale-0">
            {[
              "E-ComMax",
              "GlobalRetail",
              "FreshMart",
              "TrendStyle",
              "TechHub",
            ].map((partner) => (
              <span
                key={partner}
                className="text-2xl font-bold tracking-tighter"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="relative mx-auto max-w-7xl px-6 py-20 md:px-12 bg-muted/30 rounded-[3rem] mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 text-chart-1 font-medium">
              <span className="w-8 h-px bg-chart-1"></span>
              Why Choose HAQEX
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1]">
              Driven by <br /> Speed. Powered <br /> by Reliability.
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              With years of hands-on experience in urban courier services, fleet
              management, and last-mile solutions, we help businesses adapt to
              customer demands and scale their delivery operations seamlessly.
            </p>

            <button type="button" className="rounded-full bg-chart-1/20 border border-chart-1/30 px-8 py-4 text-sm font-semibold text-foreground transition-all hover:bg-chart-1 hover:text-emerald-950">
              Discover Our Fleet
            </button>
          </div>

          <div className="relative w-full max-w-lg mx-auto lg:ml-auto">
            <div className="absolute inset-0 bg-chart-1/20 rounded-[3rem] rotate-6 scale-105 -z-10" />

            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3rem]">
              <Image
                src="/courier-hero.png"
                alt="HAQEX Courier Delivery"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="absolute -top-6 right-12 flex items-center gap-2 rounded-2xl bg-background/90 backdrop-blur-md border border-border p-4 shadow-xl shadow-black/5 animate-in slide-in-from-bottom-4 duration-1000">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-1/20 text-chart-1">
                <Clock className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm">99% On-Time</span>
            </div>

            <div className="absolute top-1/3 -left-8 md:-left-16 rounded-2xl bg-background/90 backdrop-blur-md border border-border p-5 shadow-xl shadow-black/5 animate-in slide-in-from-bottom-8 duration-1000 delay-150">
              <div className="flex items-center gap-1 mb-3 text-chart-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {["/avatar-1.jpg", "/avatar-2.png", "/avatar-3.png"].map(
                    (src, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-background overflow-hidden relative"
                      >
                        <Image
                          src={src}
                          alt={`Team member ${i + 1}`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ),
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold">
                    4.9{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Reviews)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 right-4 flex flex-col gap-2 items-end z-20">
              {[
                { text: "Real-Time Tracking", icon: MapPin },
                { text: "Last-Mile Delivery", icon: CheckCircle2 },
                { text: "Fleet Management", icon: CheckCircle2 },
              ].map((tag, idx) => (
                <div
                  key={tag.text}
                  className="flex items-center gap-2 rounded-full bg-background border border-border px-4 py-2 shadow-lg animate-in slide-in-from-right-4 duration-700"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <tag.icon className="h-4 w-4 text-chart-1" />
                  <span className="text-xs font-medium">{tag.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:divide-x md:divide-border text-center md:text-left">
          <div className="md:pr-12">
            <h3 className="text-6xl md:text-7xl font-light tracking-tighter mb-4 text-foreground">
              99%
            </h3>
            <p className="text-muted-foreground font-medium">
              Client Satisfaction
            </p>
          </div>

          <div className="md:px-12">
            <h3 className="text-6xl md:text-7xl font-light tracking-tighter mb-4 text-foreground">
              150<span className="text-chart-1 font-medium">+</span>
            </h3>
            <p className="text-muted-foreground font-medium">
              Cities Covered Nationwide
            </p>
          </div>

          <div className="md:pl-12">
            <h3 className="text-6xl md:text-7xl font-light tracking-tighter mb-4 text-foreground">
              2M<span className="text-chart-1 font-medium">+</span>
            </h3>
            <p className="text-muted-foreground font-medium">
              Successful Deliveries Monthly
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
