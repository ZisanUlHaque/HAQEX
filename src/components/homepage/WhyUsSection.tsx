"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FEATURES = [
  {
    title: "Global Reach",
    description:
      "Leveraging an extensive network that spans major trade routes across the globe, we ensure seamless connectivity and efficient delivery wherever your business takes you.",
  },
  {
    title: "Advanced Technology",
    description:
      "Utilizing cutting-edge technology that connects key trade routes worldwide, we guarantee smooth connectivity and prompt delivery no matter where your business leads.",
  },
  {
    title: "Experienced Team",
    description:
      "Dedicated professionals committed to delivering excellence and customer satisfaction.",
  },
  {
    title: "Reliability & Security",
    description: "Extensive network covering key trade routes worldwide.",
  },
] as const;

export default function WhyUsSection() {
  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Pill */}
        <span className="mb-5 inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-semibold text-zinc-600">
          Why Us
        </span>

        {/* Title row */}
        <div className="mb-10 grid grid-cols-1 items-end gap-6 lg:mb-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
              We Specialize in Providing
              <br />
              <span className="font-semibold text-zinc-400">
                Reliable and Efficient Solutions
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pb-1">
            <p className="max-w-md text-sm leading-relaxed text-zinc-500 md:text-[15px] lg:ml-auto lg:text-right">
              With a focus on consistency, speed, and service quality, we ensure
              every shipment is handled with precision from start to finish.
            </p>
          </div>
        </div>

        {/* Image + feature grid */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left photo */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] bg-zinc-100 shadow-lg shadow-black/5 sm:aspect-[5/4] lg:h-full lg:min-h-[420px] lg:aspect-auto">
              <Image
                src="/why-us.png"
                alt="HAQEX logistics truck and crane at port"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority={false}
              />
            </div>
          </div>

          {/* Right 2×2 features */}
          <div className="lg:col-span-7">
            <div className="grid h-full grid-cols-1 sm:grid-cols-2">
              {FEATURES.map((item, index) => {
                const isLeftCol = index % 2 === 0;
                const isTopRow = index < 2;

                return (
                  <div
                    key={item.title}
                    className={[
                      "flex flex-col py-6 sm:py-7",
                      isLeftCol ? "sm:pr-8 lg:pr-10" : "sm:pl-8 lg:pl-10",
                      isTopRow
                        ? "sm:border-b sm:border-zinc-200 sm:pb-8 lg:pb-10"
                        : "sm:pt-8 lg:pt-10",
                      !isLeftCol ? "sm:border-l sm:border-zinc-200" : "",
                      index > 0 && isLeftCol
                        ? "border-t border-zinc-200 sm:border-t-0"
                        : "",
                      index === 1
                        ? "border-t border-zinc-200 sm:border-t-0"
                        : "",
                      index === 2
                        ? "border-t border-zinc-200 sm:border-t-0"
                        : "",
                      index === 3
                        ? "border-t border-zinc-200 sm:border-t-0"
                        : "",
                    ].join(" ")}
                  >
                    <h3 className="mb-2.5 text-base font-bold text-zinc-950 md:text-lg">
                      {item.title}
                    </h3>
                    <p className="mb-5 flex-1 text-sm leading-relaxed text-zinc-500">
                      {item.description}
                    </p>
                    <Link
                      href="/about-us"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-chart-1 transition-colors hover:text-chart-2"
                    >
                      Learn More
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
