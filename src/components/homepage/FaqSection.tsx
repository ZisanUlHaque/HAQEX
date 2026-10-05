"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "How can I track my shipment?",
    answer:
      "You can track your shipment in real-time by entering your unique tracking number in the tracking tool on our homepage or inside your customer dashboard.",
  },
  {
    question: "What types of cargo do you handle?",
    answer:
      "We handle a wide range of cargo including standard parcels, documents, fragile electronics, bulk commercial freight, and temperature-controlled items.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we operate an extensive global network covering major air, ocean, and land trade routes across over 150 countries worldwide.",
  },
  {
    question: "How do I get a quote for my shipment?",
    answer:
      "You can use our online Pricing Calculator to get an instant, transparent quote based on your package weight, type, and destination zone.",
  },
  {
    question: "What measures do you take to ensure the safety of my cargo?",
    answer:
      "All packages are scanned at every hub transition, monitored via GPS tracking, and handled according to strict safety protocols. Full insurance coverage is also available.",
  },
  {
    question: "Can I schedule a pickup for my shipment?",
    answer:
      "Absolutely. When booking a shipment from your dashboard, you can choose a convenient pickup date and time slot for doorstep pickup.",
  },
  {
    question: "Do you provide warehousing or storage solutions?",
    answer:
      "Yes, we offer secure warehousing, inventory management, and distribution facilities for businesses of all sizes.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          
          {/* ============================================================ */}
          {/* LEFT COLUMN: Headings & Support Info                         */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Badge/Pill */}
              <span className="mb-6 inline-flex rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-600">
                Client Testimonials
              </span>

              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 leading-[1.1] mb-4">
                Got Questions? <br />
                We Have Answers.
              </h2>

              {/* Subtitle */}
              <p className="text-sm md:text-base text-zinc-500 font-medium leading-relaxed max-w-sm mb-8">
                Find quick answers to the most common questions about our services.
              </p>
            </div>

            {/* Bottom Support Box */}
            <div className="pt-8 border-t border-zinc-200">
              <h3 className="text-base font-bold text-zinc-950 mb-1">
                Can&apos;t find what you&apos;re looking for?
              </h3>
              <p className="text-xs text-zinc-500 mb-3">Contact us here:</p>
              <a
                href="mailto:info@haqex.com"
                className="text-sm font-bold text-chart-1 hover:underline transition-all"
              >
                info@haqex.com
              </a>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Accordion Questions                            */}
          {/* ============================================================ */}
          <div className="lg:col-span-7">
            <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
              {FAQS.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div key={index} className="py-2">
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between py-4 text-left font-bold text-zinc-900 text-base md:text-lg transition-colors hover:text-chart-1"
                    >
                      <span className={cn(isOpen && "text-chart-1")}>
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-300",
                          isOpen && "rotate-180 text-chart-1"
                        )}
                      />
                    </button>

                    {/* Answer Reveal */}
                    {isOpen && (
                      <div className="pb-5 pt-1 text-sm text-zinc-500 leading-relaxed font-normal animate-in fade-in-50 duration-200">
                        {faq.answer}
                      </div>
                    )}
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