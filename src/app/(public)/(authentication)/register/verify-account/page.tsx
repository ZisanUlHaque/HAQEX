import Logo from "@/app/assets/svg/Logo";
import VerifyAccountForm from "@/components/form/verify-form";
import Image from "next/image";
import { Suspense } from "react";

export default function VerifyAccountPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* 1. Left Side: Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense fallback={<p className="text-sm text-muted-foreground text-center">Loading verification form...</p>}>
              <VerifyAccountForm />
            </Suspense>
          </div>
        </div>
      </div>

      {/* 2. Right Side: Hero Image */}
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/login.png"
          alt="HAQEX Account Verification"
          fill
          priority
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}