import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  MessageSquare,
  Headphones,
  Building2,
  Send,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | HAQEX Courier & Logistics",
  description:
    "Get in touch with HAQEX for shipping inquiries, tracking support, business partnerships, and 24/7 courier assistance.",
};

const contactCards = [
  {
    icon: Phone,
    title: "Call Us Direct",
    description: "24/7 Customer Hotline",
    value: "+880 1712-345678",
    href: "tel:+8801712345678",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Response within 2 hours",
    value: "support@haqex.com",
    href: "mailto:support@haqex.com",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    description: "Main Logistics Hub",
    value: "Gulshan 1, Dhaka 1212",
    href: "https://maps.google.com",
  },
  {
    icon: Clock,
    title: "Operating Hours",
    description: "Pickup & Express Delivery",
    value: "24 Hours / 7 Days",
    href: "#",
  },
];

const departments = [
  {
    icon: MessageSquare,
    title: "General Inquiries",
    email: "hello@haqex.com",
  },
  {
    icon: Headphones,
    title: "Shipment Support",
    email: "support@haqex.com",
  },
  {
    icon: Building2,
    title: "Corporate & B2B Solutions",
    email: "business@haqex.com",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-chart-1 selection:text-emerald-950">
      <section className="relative flex min-h-[72vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/contact-hero.png"
            alt="HAQEX Global Logistics & Courier"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-28 md:px-12">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md">
              Contact HAQEX
            </span>

            <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Fast Certified &amp; <br />
              <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                Worldwide Service
              </span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
              Have questions about your parcel, merchant partnership, or
              enterprise logistics? Our support team is active 24/7 to keep your
              business moving.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="mailto:support@haqex.com"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-chart-1 to-chart-2 px-8 text-sm font-bold uppercase tracking-wider text-emerald-950 shadow-lg shadow-chart-1/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-chart-1/40"
              >
                Send Message
                <Send className="h-4 w-4" />
              </Link>
              <Link
                href="tel:+8801712345678"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                <Phone className="h-4 w-4 text-chart-1" />
                Call +880 1712-345678
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="grid grid-cols-1 overflow-hidden rounded-t-2xl border border-white/15 bg-black/50 backdrop-blur-md sm:grid-cols-3">
              {[
                { label: "Standard Delivery", sub: "3–5 Business Days" },
                { label: "Express Delivery", sub: "24–48 Hours Guarantee" },
                {
                  label: "Same-Day Courier",
                  sub: "Instant Intra-City Dispatch",
                },
              ].map((mode, idx) => (
                <div
                  key={mode.label}
                  className={`flex items-center justify-center gap-3 px-6 py-4 text-center transition-colors ${
                    idx === 1
                      ? "bg-chart-1 font-bold text-emerald-950"
                      : "text-white hover:bg-white/5"
                  } ${
                    idx < 2
                      ? "border-b border-white/10 sm:border-b-0 sm:border-r"
                      : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide">
                      {mode.label}
                    </p>
                    <p
                      className={`text-xs ${
                        idx === 1 ? "text-emerald-950/80" : "text-white/60"
                      }`}
                    >
                      {mode.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-2 max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-chart-1/50 hover:shadow-xl hover:shadow-chart-1/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/15 text-chart-1 transition-colors group-hover:bg-chart-1 group-hover:text-emerald-950">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {card.description}
              </p>
              <p className="mt-3 text-sm font-medium text-chart-1 group-hover:underline">
                {card.value}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-8 lg:col-span-5">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-chart-1">
                <span className="h-px w-8 bg-chart-1" />
                Get In Touch
              </span>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                We&apos;d love to hear <br />
                <span className="text-chart-1">from you</span>
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Whether you need a customized enterprise supply chain, support
                with an active parcel, or want to sign up as an official merchant
                — reach out and our team will get back to you.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Direct Department Contacts
              </h3>
              {departments.map((dept) => (
                <a
                  key={dept.title}
                  href={`mailto:${dept.email}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-chart-1/40 hover:bg-chart-1/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chart-1/15 text-chart-1">
                    <dept.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {dept.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {dept.email}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5 md:p-10">
              <div className="mb-8 space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  Reach us instantly
                </h3>
                <p className="text-sm text-muted-foreground">
                  Prefer email or a quick call? Use the options below — no form
                  needed.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="mailto:support@haqex.com?subject=HAQEX%20Support%20Request"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5 transition-all hover:border-chart-1/50 hover:bg-chart-1/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/15 text-chart-1">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Email Support</p>
                      <p className="text-xs text-muted-foreground">
                        support@haqex.com
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </a>

                <a
                  href="tel:+8801712345678"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5 transition-all hover:border-chart-1/50 hover:bg-chart-1/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/15 text-chart-1">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Call Hotline</p>
                      <p className="text-xs text-muted-foreground">
                        +880 1712-345678 · 24/7
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </a>

                <a
                  href="mailto:business@haqex.com?subject=Business%20Partnership"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5 transition-all hover:border-chart-1/50 hover:bg-chart-1/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/15 text-chart-1">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Business / B2B</p>
                      <p className="text-xs text-muted-foreground">
                        business@haqex.com
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </a>

                <div className="rounded-2xl bg-chart-1/10 border border-chart-1/20 p-5">
                  <p className="text-sm font-semibold text-foreground">
                    Average response time
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email replies within ~2 hours · Phone support available
                    24/7 for active shipments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-chart-1">
                Global Operations
              </span>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Visit Our Main Hub
              </h2>
              <p className="max-w-md leading-relaxed text-muted-foreground">
                Drop by our central logistics office for corporate contracts,
                bulk merchant onboarding, or rider operations.
              </p>

              <div className="flex items-start gap-3 text-sm text-foreground">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-chart-1" />
                <div>
                  <strong className="block font-semibold">
                    HAQEX Logistics HQ
                  </strong>
                  <span>
                    House 12, Road 5, Block B, Gulshan 1
                    <br />
                    Dhaka 1212, Bangladesh
                  </span>
                </div>
              </div>

              <Link
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-chart-1 hover:underline"
              >
                Open Location in Google Maps
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border bg-muted">
              <Image
                src="/map-office.png"
                alt="HAQEX Headquarters Location"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <Link
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-background/95 px-6 py-3 text-sm font-semibold shadow-xl backdrop-blur transition-transform hover:scale-105"
                >
                  View Interactive Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}