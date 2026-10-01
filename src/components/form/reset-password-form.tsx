"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useResetPassword, useForgotPassword } from "@/hooks";
import { ResetPasswordZodSchema } from "@/validation";

const RESEND_COOLDOWN = 120;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const { mutate: resetPass, isPending } = useResetPassword();
  const { mutate: resendOtp, isPending: resending } = useForgotPassword();

  useEffect(() => {
    if (!emailFromUrl) {
      router.replace("/forgot-password");
    }
  }, [emailFromUrl, router]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const form = useForm({
    defaultValues: {
      email: emailFromUrl,
      otp: "",
      newPassword: "",
    },
    validators: {
      onSubmit: ResetPasswordZodSchema,
    },
    onSubmit: ({ value }) => {
      resetPass(
        {
          email: value.email.trim().toLowerCase(),
          otp: value.otp,
          newPassword: value.newPassword,
        },
        {
          onSuccess: () => {
            toast.add({
              title: "Password updated",
              description: "You can now log in with your new password.",
              type: "success",
            });
            router.push("/login");
          },
          onError: (err: any) => {
            toast.add({
              title: "Reset failed",
              description:
                err?.data?.message ||
                err?.message ||
                "Invalid OTP or something went wrong.",
              type: "error",
            });
          },
        }
      );
    },
  });

  const handleResend = () => {
    if (!emailFromUrl || resendTimer > 0) return;
    resendOtp(
      { email: emailFromUrl },
      {
        onSuccess: () => {
          setResendTimer(RESEND_COOLDOWN);
          toast.add({
            title: "OTP resent",
            description: "A new code was sent to your email.",
            type: "success",
          });
        },
        onError: (err: any) => {
          toast.add({
            title: "Resend failed",
            description: err?.data?.message || err?.message || "Try again later",
            type: "error",
          });
        },
      }
    );
  };

  if (!emailFromUrl) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-chart-1/15 text-chart-1">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground text-balance">
          Enter the 6-digit OTP sent to{" "}
          <span className="font-medium text-foreground">{emailFromUrl}</span>
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => (
              <input type="hidden" value={field.state.value} readOnly />
            )}
          </form.Field>

          {/* OTP */}
          <form.Field name="otp">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="items-center">
                  <FieldLabel htmlFor="otp">OTP Code</FieldLabel>
                  <InputOTP
                    maxLength={6}
                    id="otp"
                    name={field.name}
                    value={field.state.value}
                    onChange={(v) => field.handleChange(v)}
                    onBlur={field.handleBlur}
                    pattern={REGEXP_ONLY_DIGITS}
                    disabled={isPending}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  <FieldDescription>
                    {resendTimer > 0 ? (
                      <>Resend in {formatTime(resendTimer)}</>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="font-medium text-chart-1 hover:underline"
                      >
                        {resending ? "Sending…" : "Resend OTP"}
                      </button>
                    )}
                  </FieldDescription>
                </Field>
              );
            }}
          </form.Field>

          {/* New password */}
          <form.Field name="newPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="pr-10"
                      autoComplete="new-password"
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Spinner /> Updating…
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </FieldGroup>
      </form>

      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </div>
  );
}