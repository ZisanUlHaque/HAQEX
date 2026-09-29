
import Footer from "@/components/layout/public/Footer";
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


export default function layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        notoSans.variable,
        nunitoSansHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

