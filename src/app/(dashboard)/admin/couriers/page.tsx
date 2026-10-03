import { Suspense } from "react";
import { AdminUsers } from "@/components/dashboard/admin-users";

export default function AdminCouriersPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-9"><div className="h-72 animate-pulse rounded-2xl border border-border bg-card" /></div>}>
      <AdminUsers courierOnly />
    </Suspense>
  );
}
