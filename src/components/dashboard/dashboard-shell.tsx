"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings2,
  Truck,
  UserRound,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import Logo from "@/app/assets/svg/Logo";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogout } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type ShellRole = "CUSTOMER" | "COURIER" | "ADMIN";
type NavLink = { name: string; href: string; icon: ComponentType<{ className?: string }> };
type NavSection = { name: string; links: NavLink[] };

const navByRole: Record<ShellRole, NavSection[]> = {
  CUSTOMER: [
    { name: "Workspace", links: [
      { name: "Overview", href: "/customer", icon: LayoutDashboard },
      { name: "My Shipments", href: "/customer/shipments", icon: Package },
      { name: "New Shipment", href: "/customer/shipments/create", icon: Plus },
      { name: "Payments", href: "/customer/payments", icon: CreditCard },
      { name: "Track Parcel", href: "/track", icon: Search },
      { name: "Profile", href: "/customer/profile", icon: UserRound },
    ] },
  ],
  COURIER: [
    { name: "Workspace", links: [
      { name: "Overview", href: "/courier", icon: LayoutDashboard },
      { name: "My Jobs", href: "/courier/shipments", icon: Truck },
      { name: "Profile", href: "/courier/profile", icon: UserRound },
    ] },
  ],
  ADMIN: [
    { name: "Overview", links: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ] },
    { name: "Operations", links: [
      { name: "Shipments", href: "/admin/shipments", icon: Package },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Hubs", href: "/admin/hubs", icon: Warehouse },
      { name: "Payments", href: "/admin/payments", icon: CreditCard },
    ] },
    { name: "Insights", links: [
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ] },
    { name: "System", links: [
      { name: "Settings", href: "/admin/settings", icon: Settings2 },
    ] },
  ],
};

function getResponseUser(value: unknown) {
  if (typeof value !== "object" || value === null) return undefined;
  const data = "data" in value ? value.data : value;
  if (typeof data !== "object" || data === null) return undefined;
  const nested = "data" in data ? data.data : data;
  return typeof nested === "object" && nested !== null ? nested : undefined;
}

export default function DashboardShell({
  children,
  role = "CUSTOMER",
}: {
  children: ReactNode;
  role?: ShellRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data } = useGetMe();
  const user = getResponseUser(data) as { name?: string; email?: string } | undefined;
  const { mutate: logout, isPending: loggingOut } = useLogout();
  const queryClient = useQueryClient();
  const sections = navByRole[role];
  const currentLabel =
    sections.flatMap((section) => section.links).find((link) =>
      link.href === "/admin" || link.href === "/customer" || link.href === "/courier"
        ? pathname === link.href
        : pathname === link.href || pathname.startsWith(`${link.href}/`),
    )?.name ?? "Workspace";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/admin" || href === "/customer" || href === "/courier"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({ title: "Signed out", type: "success" });
        queryClient.removeQueries();
        router.push("/login");
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Please try again.";
        toast.add({ title: "Sign out failed", description: message, type: "error" });
      },
    });
  };

  const renderNavigation = (onNavigate?: () => void) => (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Main navigation">
      {sections.map((section) => (
        <div key={section.name}>
          <p className={cn(
            "mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75 transition-opacity",
            collapsed && role === "ADMIN" && "sr-only",
          )}>
            {section.name}
          </p>
          <div className="space-y-1">
            {section.links.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed && role === "ADMIN" ? item.name : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-all",
                    collapsed && role === "ADMIN" && "justify-center px-0",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                  )}
                >
                  {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" />}
                  <Icon className={cn("h-[17px] w-[17px] shrink-0", active && "text-primary")} />
                  <span className={cn(collapsed && role === "ADMIN" && "md:sr-only")}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const sidebar = (mobile = false) => (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-[70px] shrink-0 items-center gap-3 border-b border-border/70 px-5">
        <Logo href="/" />
        {mobile && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="ml-auto"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X />
          </Button>
        )}
      </div>
      {renderNavigation(mobile ? () => setMobileOpen(false) : undefined)}
      <div className="shrink-0 border-t border-border/70 p-3">
        <div className={cn(
          "mb-2 flex min-w-0 items-center gap-3 rounded-xl bg-muted/50 p-2.5",
          collapsed && role === "ADMIN" && !mobile && "md:justify-center md:px-1",
        )}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
            {user?.name?.slice(0, 1).toUpperCase() || "A"}
          </span>
          <div className={cn("min-w-0", collapsed && role === "ADMIN" && !mobile && "md:hidden")}>
            <p className="truncate text-xs font-semibold">{user?.name || "Admin account"}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user?.email || role.toLowerCase()}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-9 w-full justify-start gap-3 rounded-xl text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600",
            collapsed && role === "ADMIN" && !mobile && "md:justify-center md:px-0",
          )}
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed && role === "ADMIN" && !mobile ? "Sign out" : undefined}
        >
          <LogOut className="h-4 w-4" />
          <span className={cn(collapsed && role === "ADMIN" && !mobile && "md:hidden")}>
            {loggingOut ? "Signing out…" : "Sign out"}
          </span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/25">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border/70 bg-card transition-[width] duration-200 md:flex",
          role === "ADMIN" && collapsed ? "w-[76px]" : "w-[254px]",
        )}
      >
        {sidebar()}
        {role === "ADMIN" && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-[76px] z-10 h-6 w-6 rounded-full bg-card shadow-sm"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        )}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 h-full w-[min(86vw,300px)] animate-in slide-in-from-left border-r border-border bg-card shadow-2xl duration-200">
            {sidebar(true)}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[62px] items-center gap-3 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{role === "ADMIN" ? "Admin workspace" : "Workspace"}</span>
            <span className="hidden text-muted-foreground sm:inline">/</span>
            <span className="truncate font-semibold">{currentLabel}</span>
          </div>
          <span className="ml-auto hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Operations portal
          </span>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
