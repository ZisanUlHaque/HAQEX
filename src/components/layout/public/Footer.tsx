"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter ,FaLinkedin} from "react-icons/fa6";

const linkGroups = [
  {
    title: "Quick Links",
    links: [
      { label: "Services", href: "#" },
      { label: "How It Works", href: "#" },
      { label: "Pickup Points", href: "#" },
      { label: "Business", href: "#" },
      { label: "Track", href: "#" },
    ],
  },
  {
    title: "Our Services",
    links: [
      { label: "Half-Day Express", href: "#" },
      { label: "24h Delivery", href: "#" },
      { label: "48h Delivery", href: "#" },
      { label: "72h Delivery", href: "#" },
      { label: "3-7 Day Economy", href: "#" },
      { label: "Track Shipment", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "API Documentation", href: "#" },
      { label: "Integration Guides", href: "#" },
      { label: "Developer Portal", href: "#" },
      { label: "Logistics Blog", href: "#" },
      { label: "Case Studies", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Terms & Conditions", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Support Email", href: "#" },
      { label: "Phone Number", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaLinkedin, href: "#", label: "LinkedIn" },
];

const ColumnTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h4
    className={`relative inline-block pb-3 font-semibold text-white ${className}`}
  >
    {children}
    <span className="absolute bottom-0 left-0 h-0.5 w-12 rounded-full bg-gradient-to-r from-chart-1 to-transparent" />
  </h4>
);

const primaryButton =
  "group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-chart-1 to-chart-2 " +
  "font-bold uppercase tracking-wider text-emerald-950 shadow-lg shadow-chart-1/10 " +
  "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-chart-1/30 active:translate-y-0 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

type Status = "idle" | "loading" | "success";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    try {
      // TODO: replace with your real newsletter API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3500);
    } catch {
      setStatus("idle");
    }
  };

  return (
    <footer className="relative w-full overflow-hidden bg-[color-mix(in_oklab,var(--chart-5)_50%,black)] text-white">
      {/* ------------------------------ Atmosphere ------------------------------ */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* top hairline glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-chart-1/60 to-transparent" />
        {/* ambient orbs */}
        <div className="absolute -top-48 -right-40 h-[28rem] w-[28rem] rounded-full bg-chart-2/20 blur-3xl" />
        <div className="absolute -bottom-56 -left-40 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" />
        {/* dot texture, faded out toward the edges */}
        <div
          className="absolute inset-0 opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
        {/* watermark */}
        <span className="absolute -bottom-[1vw] left-1/2 -translate-x-1/2 whitespace-nowrap text-[14vw] font-black italic leading-none tracking-tighter text-white/[0.03]">
          HAQEX
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-12 pb-14 pt-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand + newsletter */}
          <div className="flex flex-col space-y-7 lg:col-span-4 lg:pr-8">
            <Link
              href="/"
              aria-label="HAQEX home"
              className="inline-block w-fit pb-1 transition-transform duration-300 hover:scale-[1.03]"
            >
              <Image
                src="/logo1.png"
                alt="HAQEX Logo"
                width={140}
                height={45}
                className="h-auto w-auto object-contain"
                priority
              />
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              Modern urban logistics with pickup points &amp; door-to-door
              delivery. Fast, flexible, transparent.
            </p>

            <div className="space-y-5">
              <ColumnTitle className="text-xl">
                Sign up to our Newsletter
              </ColumnTitle>

              <form
                onSubmit={handleSubscribe}
                className="flex max-w-sm flex-col gap-3"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-chart-1/80" />
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="h-12 w-full rounded-full border border-white/15 bg-white/5 pl-12 pr-6 text-sm text-white backdrop-blur-sm transition-all placeholder:text-white/40 hover:border-white/30 focus:border-chart-1/70 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-chart-1/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`${primaryButton} h-12 w-full text-sm disabled:opacity-80`}
                >
                  {status === "idle" && (
                    <>
                      Subscribe Now
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                  {status === "loading" && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subscribing…
                    </>
                  )}
                  {status === "success" && (
                    <>
                      <Check className="h-4 w-4 animate-in zoom-in duration-300" />
                      You&apos;re in!
                    </>
                  )}
                </button>

                <p
                  aria-live="polite"
                  className="min-h-4 pl-2 text-xs text-chart-1"
                >
                  {status === "success" &&
                    "Thanks for subscribing. Check your inbox."}
                </p>
              </form>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 md:col-span-2 lg:col-span-8">
            {linkGroups.map((group) => (
              <div key={group.title} className="space-y-5">
                <ColumnTitle className="text-lg">{group.title}</ColumnTitle>
                <ul className="space-y-3.5 text-sm">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center text-white/60 transition-colors duration-300 hover:text-chart-1"
                      >
                        <span className="mr-0 h-px w-0 bg-chart-1 transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 py-7 md:flex-row">
          <p className="order-3 text-xs text-white/50 md:order-1">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white/80">HAQEX</span>. All
            rights reserved.
          </p>

          <div className="order-1 flex items-center gap-2 md:order-2">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-300 hover:-translate-y-1 hover:border-chart-1 hover:bg-chart-1 hover:text-emerald-950 hover:shadow-lg hover:shadow-chart-1/30"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>

          <div className="order-2 flex items-center gap-3 text-xs text-white/50 md:order-3">
            <Link href="#" className="transition-colors hover:text-chart-1">
              Terms &amp; Conditions
            </Link>
            <span className="h-1 w-1 rounded-full bg-chart-1/70" />
            <Link href="#" className="transition-colors hover:text-chart-1">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
