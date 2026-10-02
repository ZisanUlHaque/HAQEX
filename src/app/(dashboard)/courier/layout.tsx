import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { ReactNode } from "react";

export default function CourierLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["COURIER"]}>
      <DashboardShell role="COURIER">{children}</DashboardShell>
    </RoleGuard>
  );
}
