import Footer from "@/components/layout/public/Footer";
import Header from "@/components/layout/public/Header";
import { cn } from "@/lib/utils";
import { Geist, Geist_Mono, Noto_Sans, Nunito_Sans } from "next/font/google";
import { ReactNode } from "react";

const nunitoSansHeading = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col font-sans antialiased",
        geistSans.variable,
        geistMono.variable,
        notoSans.variable,
        nunitoSansHeading.variable,
      )}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
