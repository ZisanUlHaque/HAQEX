"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import { useVerifyAccount } from "@/hooks";

const RESEND_COOLDOWN = 120; // 2 minutes

export default function VerifyAccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const { mutate: verifyAccount, isPending: isVerifying } = useVerifyAccount();

  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOTP = () => {
    if (otp.length !== 6) {
      setIsInvalid(true);
      return;
    }

    verifyAccount(
      { email, otp },
      {
        onSuccess: (res: any) => {
          if (res && res.success === false) {
            toast.add({
              title: "Verification Failed",
              description: res.message || "Invalid OTP code",
              type: "error",
            });
            setIsInvalid(true);
            return;
          }

          toast.add({
            title: "Verification Successful",
            description: "Your account is verified! Please log in to continue.",
            type: "success",
          });
          router.push("/login");
        },
        onError: (err: any) => {
          toast.add({
            title: "Verification Error",
            description: err.message || "Something went wrong. Please try again",
            type: "error",
          });
          setIsInvalid(true);
        },
      }
    );
  };

  const handleResend = () => {
    setResendTimer(RESEND_COOLDOWN);
    setOtp("");
    setIsInvalid(false);
    toast.add({
      title: "OTP Resent",
      description: "A new verification code has been sent to your email.",
      type: "info",
    });
  };

  if (!email) {
    return null;
  }

  return (
    <Card className="w-full border-border bg-card shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="otp-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOTP();
          }}
          className="space-y-4"
        >
          <Field data-invalid={isInvalid} className="flex flex-col items-center gap-3">
            <FieldLabel htmlFor="otp" className="sr-only">
              OTP Code
            </FieldLabel>

            <InputOTP
              maxLength={6}
              onChange={(value) => {
                setOtp(value);
                if (isInvalid) setIsInvalid(false);
              }}
              value={otp}
              autoComplete="off"
              name="otp"
              id="otp"
              pattern={REGEXP_ONLY_DIGITS}
              disabled={isVerifying}
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

            {isInvalid && (
              <FieldError
                errors={[{ message: "Invalid or incomplete 6-digit OTP code" }]}
              />
            )}

            <FieldDescription className="text-xs text-muted-foreground">
              {resendTimer > 0 ? (
                <span>
                  Resend code in{" "}
                  <strong className="font-medium text-foreground">
                    {formatTime(resendTimer)}
                  </strong>
                </span>
              ) : (
                <span>Didn&apos;t receive a code? Click resend below.</span>
              )}
            </FieldDescription>
          </Field>
        </form>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={resendTimer > 0 || isVerifying}
          onClick={handleResend}
          className="flex-1"
        >
          Resend
        </Button>
        <Button
          type="submit"
          form="otp-form"
          disabled={otp.length !== 6 || isVerifying}
          className="flex-1"
        >
          {isVerifying ? (
            <>
              <Spinner className="mr-2" /> Verifying…
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}