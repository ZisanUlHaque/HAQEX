"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Info, Play, Apple } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeroSection() {
  const [tab, setTab] = useState<"track" | "ship">("track");
  const [tn, setTn] = useState("");

  const onTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tn.trim()) return;
    window.location.href = `/track?tn=${encodeURIComponent(tn.trim())}`;
  };

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-zinc-50 pt-20 pb-8 md:min-h-[850px] md:pt-24 md:pb-12 lg:min-h-[900px]">

      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.png" // Make sure this matches your image path
          alt="Port crane lifting shipping container"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradients to ensure text readability over the image */}
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-10">
        
        {/* TOP: Headline left  |  copy + CTA right */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-6">
          {/* LEFT HEADLINE */}
          <div className="lg:col-span-8">
            <h1 className="text-[2.35rem] font-black uppercase leading-[1.02] tracking-tight text-zinc-950 sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              BRINGING{" "}
              {/* Note: Ensure 'text-chart-1' in your tailwind config matches the orange in the design */}
              <span className="text-chart-1">THE WORLD</span>
              <br />
              CLOSER,
              <br />
              ONE DELIVERY AT A
              <br />
              TIME
            </h1>
          </div>

          {/* RIGHT COPY + BUTTON */}
          <div className="flex flex-col gap-5 lg:col-span-4 lg:pt-2 lg:pl-4">
            <p className="max-w-md text-[15px] font-medium leading-relaxed text-zinc-800 md:text-zinc-700">
              We provide reliable shipping whenever you need it. With us, you
              get precision, speed, and confidence at every step.
            </p>
            <div>
              <Link href="/contact">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-chart-1 px-7 text-sm font-bold text-white shadow-md shadow-chart-1/20 transition hover:opacity-90 active:scale-[0.98]"
                >
                  Request a Quote
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-16 sm:w-[min(100%,400px)] md:pt-24 lg:pt-32">
          <div className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-2xl shadow-black/10 sm:p-7">
            {/* Tabs with underline */}
            <div className="mb-6 flex items-center gap-6 border-b border-zinc-100">
              <button
                type="button"
                onClick={() => setTab("track")}
                className={cn(
                  "relative pb-3 text-sm font-bold transition-colors",
                  tab === "track" ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                Track Shipment
                {tab === "track" && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-chart-1" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab("ship")}
                className={cn(
                  "relative pb-3 text-sm font-bold transition-colors",
                  tab === "ship" ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                Ship Order
                {tab === "ship" && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-chart-1" />
                )}
              </button>
            </div>

            {tab === "track" ? (
              <form onSubmit={onTrack} className="space-y-4">
                {/* Input */}
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-chart-1" />
                  <input
                    type="text"
                    value={tn}
                    onChange={(e) => setTn(e.target.value)}
                    placeholder="Track Order"
                    className="h-14 w-full rounded-full border border-transparent bg-zinc-50 pl-12 pr-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-chart-1/40 focus:bg-white focus:ring-2 focus:ring-chart-1/15"
                    required
                  />
                </div>

                {/* Track CTA */}
                <button
                  type="submit"
                  className="flex h-14 w-full items-center justify-center rounded-full bg-chart-1 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99]"
                >
                  Track
                </button>

                {/* Help row */}
                <div className="flex items-center justify-between px-1 pt-1 text-[11px] font-semibold text-zinc-600 sm:text-xs">
                  <button type="button" className="hover:text-chart-1 transition-colors">
                    Multiple Tracking Numbers
                  </button>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-900"
                  >
                    <Info className="h-4 w-4" />
                    Need Help
                  </Link>
                </div>

                {/* Store badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a
                    href="#"
                    className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-950 px-2 py-3 text-white transition hover:bg-zinc-800"
                  >
                    <Play className="h-4 w-4 shrink-0 fill-current" />
                    <span className="text-left leading-none">
                      <span className="block text-[9px] uppercase tracking-wide text-zinc-400">
                        Get it on
                      </span>
                      <span className="block text-[12px] font-bold">Google Play</span>
                    </span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-950 px-2 py-3 text-white transition hover:bg-zinc-800"
                  >
                    <Apple className="h-[18px] w-[18px] shrink-0 fill-current" />
                    <span className="text-left leading-none">
                      <span className="block text-[9px] text-zinc-400">
                        Download on the
                      </span>
                      <span className="block text-[12px] font-bold">App Store</span>
                    </span>
                  </a>
                </div>
              </form>
            ) : (
              <div className="space-y-4 py-2 text-center">
                <p className="text-sm font-medium text-zinc-600">
                  Create a shipment or get an instant delivery quote.
                </p>
                <Link href="/pricing" className="block">
                  <button
                    type="button"
                    className="flex h-14 w-full items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white transition hover:bg-zinc-800"
                  >
                    Calculate Shipping Fee
                  </button>
                </Link>
                <Link href="/login" className="block">
                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                  >
                    Login to Ship
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}