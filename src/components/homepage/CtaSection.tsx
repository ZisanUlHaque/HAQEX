"use client";

import Image from "next/image";
import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="w-full bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        
        {/* Main Banner Card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-8 py-16 sm:px-12 sm:py-20 md:p-20 lg:p-24 text-left shadow-2xl">
          
          {/* Top-down Aerial Cargo Ship / Port Image */}
          <Image
            src="/cta.png" 
            alt="Aerial view of container ship at port"
            fill
            className="object-cover object-center opacity-85"
            sizes="(max-width: 1280px) 100vw, 1200px"
          />

          {/* Left-to-Right Dark Gradient for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

          {/* Text Content Overlay */}
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-4 md:mb-6">
              Ready to Streamline <br />
              Your Supply Chain?
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed mb-8 md:mb-10 max-w-lg">
              Contact us now to discuss your logistics needs and get a
              personalized solution.
            </p>

            <Link href="/contact">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-chart-1 px-8 py-4 text-sm font-bold text-emerald-950 shadow-lg shadow-chart-1/20 transition-all hover:bg-chart-2 active:scale-95"
              >
                Contact Now
              </button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}