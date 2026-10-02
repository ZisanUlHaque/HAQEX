"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  Package,
  CreditCard,
  User,
  Search,
  LogOut,
  Menu,
  X,
  Plus,
  Truck,
} from "lucide-react";
import Logo from "@/app/assets/svg/Logo";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogout } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type ShellRole = "CUSTOMER" | "COURIER" | "ADMIN";

const navByRole: Record<
  ShellRole,
  Array<{ name: string; href: string; icon: typeof Package }>
> = {
  CUSTOMER: [
    { name: "Overview", href: "/customer", icon: LayoutDashboard },
    { name: "My Shipments", href: "/customer/shipments", icon: Package },
    { name: "New Shipment", href: "/customer/shipments/create", icon: Plus },
    { name: "Payments", href: "/customer/payments", icon: CreditCard },
    { name: "Track Parcel", href: "/track", icon: Search },
    { name: "Profile", href: "/customer/profile", icon: User },
  ],
  COURIER: [
    { name: "Overview", href: "/courier", icon: LayoutDashboard },
    { name: "My Jobs", href: "/courier/shipments", icon: Truck },
    { name: "Profile", href: "/courier/profile", icon: User },
  ],
  ADMIN: [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "All Shipments", href: "/admin/shipments", icon: Package },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
  ],
};

export default function DashboardShell({
  children,
  role = "CUSTOMER",
}: {
  children: ReactNode;
  role?: ShellRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data } = useGetMe();
  const user = (data as any)?.data ?? data;
  const { mutate: logout } = useLogout();
  const qc = useQueryClient();

  const links = navByRole[role] || navByRole.CUSTOMER;

  const isLinkActive = (href: string) => {
    const candidates = links.filter(
      (link) =>
        pathname === link.href ||
        (link.href !== "/" && pathname.startsWith(link.href + "/"))
    );

    return candidates.length === 0
      ? pathname === href
      : candidates.sort((a, b) => b.href.length - a.href.length)[0]?.href === href;
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({ title: "Logged out", type: "success" });
        qc.removeQueries({ queryKey: ["user"] });
        router.push("/login");
      },
    });
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {links.map((item) => {
        const Icon = item.icon;
        const active = isLinkActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-chart-1 text-emerald-950 shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <Logo href="/" />
        </div>

        <NavLinks />

        <div className="border-t border-border p-3">
          <div className="mb-2 rounded-xl bg-muted/60 px-3 py-2">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/20"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Top Header */}
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <Logo href="" />
            <Link href="/" className="font-bold tracking-tight">
              HAQEX
            </Link>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open && (
          <div className="border-b border-border bg-card md:hidden">
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="border-t border-border p-3">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start gap-2 text-rose-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}