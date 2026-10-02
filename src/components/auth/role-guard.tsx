"use client";

import { useGetMe } from "@/hooks";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import AuthLoading from "./auth-loading";
import AccessDenied from "./access-denied";

type AppRole = "ADMIN" | "CUSTOMER" | "COURIER" | "SUPER_ADMIN";

interface IProps {
  children: ReactNode;
  roles: AppRole[];
}

export default function RoleGuard({ children, roles }: IProps) {
  const router = useRouter();
  const { data, isPending, isError } = useGetMe();

  const user = (data as any)?.data ?? data;
  const isAuthorized = !!user && roles.includes(user.role as AppRole);

  useEffect(() => {
    if (isPending) return;
    if (isError || !user) {
      router.replace("/login");
    }
  }, [isPending, isError, user, router]);

  if (isPending) return <AuthLoading />;
  if (isError || !user) return <AuthLoading label="Redirecting to login…" />;
  if (!isAuthorized) return <AccessDenied />;

  return <>{children}</>;
}