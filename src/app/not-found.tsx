import Link from "next/link";
import { PackageX, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-chart-1/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-chart-2/10 blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="relative mb-8 select-none">
          <h1 className="text-[140px] sm:text-[180px] md:text-[220px] font-black leading-none bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
            404
          </h1>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-card border border-border rounded-3xl shadow-2xl flex items-center justify-center animate-bounce">
              <PackageX className="w-10 h-10 md:w-14 md:h-14 text-chart-1" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Shipment Lost in Transit?
        </h2>

        <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
          The page or tracking route you are looking for doesn&apos;t exist or has been moved to a new destination.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full h-12 px-8 text-sm bg-gradient-to-r from-chart-1 to-chart-2 text-emerald-950 font-semibold shadow-lg shadow-chart-1/20 hover:opacity-95 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <Link
            href="/services"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full h-12 px-8 text-sm border border-border hover:bg-accent hover:text-accent-foreground font-semibold transition-colors"
          >
            <Search className="mr-2 h-4 w-4" />
            Explore Services
          </Link>
        </div>
      </div>
    </div>
  );
}