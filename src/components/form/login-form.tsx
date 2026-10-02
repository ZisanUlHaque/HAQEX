"use client";

import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../ui/field";
import { useState } from "react";
import {
  Eye,
  EyeClosed,
  Shield,
  User,
  Bike,
  Sparkles,
} from "lucide-react";
import { useLogin } from "@/hooks";
import { useRouter } from "next/navigation";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import { LoginZodSchema } from "@/validation";
import GoogleLoginComponent from "../modules/google-login/GoogleLogin";
import { cn } from "@/lib/utils";


const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@example.com",
    password: "Admin@12345",
    icon: Shield,
    redirect: "/admin",
    accent: "from-violet-500/15 to-violet-500/5 border-violet-500/30 hover:border-violet-500/60",
    iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    role: "Customer",
    email: "customer@example.com",
    password: "Customer@12345",
    icon: User,
    redirect: "/customer",
    accent: "from-chart-1/15 to-chart-1/5 border-chart-1/30 hover:border-chart-1/60",
    iconBg: "bg-chart-1/15 text-chart-1",
  },
  {
    role: "Courier",
    email: "courier@example.com",
    password: "Courier@12345",
    icon: Bike,
    redirect: "/courier",
    accent: "from-amber-500/15 to-amber-500/5 border-amber-500/30 hover:border-amber-500/60",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
] as const;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const router = useRouter();

  const { mutate: login, isPending: loginPending } = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginZodSchema,
    },
    onSubmit: ({ value }) => {
      login(
        { email: value.email, password: value.password },
        {
          onSuccess: () => {
            toast.add({
              title: "Login Success",
              description: "Welcome back",
              type: "success",
            });
            router.push("/");
          },
          onError: (err) => {
            toast.add({
              title: "Authorization failure",
              description:
                err.message || "Something went wrong. Please try again",
              type: "error",
            });
          },
        }
      );
    },
  });

  const handleDemoLogin = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setDemoLoading(account.role);

    login(
      { email: account.email, password: account.password },
      {
        onSuccess: () => {
          toast.add({
            title: `${account.role} Demo Login`,
            description: `Signed in as ${account.role}`,
            type: "success",
          });
          router.push(account.redirect);
        },
        onError: (err) => {
          toast.add({
            title: "Demo login failed",
            description:
              err.message ||
              "Demo account may not exist yet. Check backend seed data.",
            type: "error",
          });
          setDemoLoading(null);
        },
        onSettled: () => {
          setDemoLoading(null);
        },
      }
    );
  };

  const isBusy = loginPending || !!demoLoading;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back 👋</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Login to your HAQEX account
        </p>
      </div>

      {/* Manual login form */}
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
                    name={field.name}
                    type="email"
                    placeholder="name@example.com"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    value={field.state.value}
                    autoComplete="email"
                    aria-invalid={isInvalid}
                    disabled={isBusy}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      autoComplete="current-password"
                      aria-invalid={isInvalid}
                      disabled={isBusy}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeClosed className="size-4" />
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

          <Button disabled={isBusy} type="submit" className="w-full">
            {loginPending && !demoLoading ? (
              <>
                <Spinner /> Signing in…
              </>
            ) : (
              "Login"
            )}
          </Button>
        </FieldGroup>
      </form>

      <FieldSeparator>Or continue with</FieldSeparator>

      <GoogleLoginComponent />

      <FieldSeparator>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-chart-1" />
          Quick Demo Login
        </span>
      </FieldSeparator>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = account.icon;
          const loading = demoLoading === account.role;

          return (
            <button
              key={account.role}
              type="button"
              disabled={isBusy}
              onClick={() => handleDemoLogin(account)}
              className={cn(
                "group relative flex flex-col items-start gap-3 rounded-xl border bg-gradient-to-br p-4 text-left transition-all",
                "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
                "disabled:pointer-events-none disabled:opacity-60",
                account.accent
              )}
            >
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  account.iconBg
                )}
              >
                {loading ? (
                  <Spinner className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-sm font-semibold leading-none">
                  {account.role}
                </p>
              </div>

              <span className="mt-auto text-[11px] font-medium text-foreground/70 group-hover:text-foreground">
                {loading ? "Signing in…" : "Demo Login →"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Register link */}
      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          Register
        </Link>
      </div>
    </div>
  );
}