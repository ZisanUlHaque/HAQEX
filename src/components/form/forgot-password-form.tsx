"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useForgotPassword } from "@/hooks";
import { ForgotPasswordZodSchema } from "@/validation";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { mutate: sendOtp, isPending } = useForgotPassword();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: ForgotPasswordZodSchema,
    },
    onSubmit: ({ value }) => {
      const email = value.email.trim().toLowerCase();

      sendOtp(
        { email },
        {
          onSuccess: () => {
            toast.add({
              title: "OTP Sent",
              description: "Check your email for the password reset code.",
              type: "success",
            });
            const params = new URLSearchParams({ email });
            router.push(`/reset-password?${params.toString()}`);
          },
          onError: (err: any) => {
            toast.add({
              title: "Request failed",
              description:
                err?.data?.message ||
                err?.message ||
                "Something went wrong. Please try again.",
              type: "error",
            });
          },
        }
      );
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-chart-1/15 text-chart-1">
          <Mail className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground text-balance">
          Enter your account email and we&apos;ll send a 6-digit OTP to reset
          your password.
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
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="name@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete="email"
                    disabled={isPending}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Spinner /> Sending OTP…
              </>
            ) : (
              "Send reset OTP"
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