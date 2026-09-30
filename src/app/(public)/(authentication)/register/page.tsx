import Logo from "@/app/assets/svg/Logo";
import LoginForm from "@/components/form/login-form";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* 1. Hero Image Column (Left Side on Desktop) */}
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/register.png" // Fallback to /login.png if register.png doesn't exist yet
          alt="HAQEX Courier Registration"
          fill
          priority
          className="object-cover dark:brightness-[0.3] dark:grayscale"
        />
        {/* Overlay Text/Branding */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-12 flex flex-col justify-end text-white">
          <blockquote className="space-y-2 max-w-md">
            <p className="text-lg font-medium leading-relaxed">
              &ldquo;HAQEX transformed how we handle last-mile deliveries. Fast, reliable, and completely transparent.&rdquo;
            </p>
            <footer className="text-sm text-white/70">
              — Logistics Team, HAQEX
            </footer>
          </blockquote>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join HAQEX to manage shipments, track orders, and scale your logistics.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}