import Logo from "@/app/assets/svg/Logo";
import { RegisterForm } from "@/components/form/register.form";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* 1. Left Side: Media Banner */}
      <div className="relative hidden bg-muted lg:block">
        {/* Option A: Image Background */}
        {/* <Image
          src="/login.png" // Use .png, .jpg, or .webp here
          alt="HAQEX Courier Registration"
          fill
          priority
          className="object-cover dark:brightness-[0.3] dark:grayscale"
        /> */}

        {/* Option B: If you actually want a video background, uncomment below: */}
 
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video> 
      </div>

      {/* 2. Right Side: Registration Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-sm">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}