import type { Metadata } from "next";
import HeroSection from "../../../components/homepage/HeroSection";
import WhyUsSection from "@/components/homepage/WhyUsSection";

export const metadata: Metadata = {
  title: "HAQEX | Modern Courier & Logistics Management",
  description:
    "HAQEX brings the world closer with fast, reliable, and transparent logistics. Track shipments in real-time, get instant quotes, and scale your supply chain.",
  openGraph: {
    title: "HAQEX | Global Logistics Partner",
    description: "Fast, certified, and worldwide logistics services.",
    url: "https://haqex.com",
    siteName: "HAQEX",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "HAQEX Logistics",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HAQEX | Modern Courier & Logistics",
    description: "Fast, certified, and worldwide logistics services.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return (
    <>
      <HeroSection />
      <WhyUsSection />
    </>
  );
}