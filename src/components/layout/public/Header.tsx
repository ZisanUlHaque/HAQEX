"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  ChevronDown,
  User,
} from "lucide-react";
import Logo from "@/app/assets/svg/Logo";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogout } from "@/hooks";
import { cn } from "@/lib/utils";

type AppRole = "ADMIN" | "CUSTOMER" | "COURIER";

const publicRoutes = [
  { name: "Home", url: "/" },
  { name: "About", url: "/about-us" },
  { name: "Pricing", url: "/pricing" },
  { name: "Track", url: "/track" },
  { name: "Contact", url: "/contact" },
];

const dashboardRoute: Record<string, string> = {
  ADMIN: "/admin",
  CUSTOMER: "/customer",
  COURIER: "/courier",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data, isLoading } = useGetMe();
  const { mutate: logout, isPending: loggingOut } = useLogout();

  const user = (data as any)?.data ?? data;
  const role = user?.role as AppRole | undefined;
  const dashHref = role ? dashboardRoute[role] || "/customer" : null;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Logged out",
          description: "See you next time",
          type: "success",
        });
        setUserMenuOpen(false);
        router.push("/");
      },
      onError: () => {
        toast.add({
          title: "Logout failed",
          description: "Something went wrong",
          type: "error",
        });
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        {/* Brand - Fixed Nested Link Issue */}
        <div className="flex items-center gap-2 shrink-0">
          <Logo href="/" />
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {publicRoutes.map((route) => {
            const active =
              route.url === "/"
                ? pathname === "/"
                : pathname.startsWith(route.url);
            return (
              <Link
                key={route.url}
                href={route.url}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-chart-1/15 text-chart-1 font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {route.name}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/track"
            className="hidden sm:inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4" />
            Track
          </Link>

          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-muted" />
          ) : !user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-full bg-chart-1 px-4 text-sm font-semibold text-emerald-950 hover:bg-chart-2 transition-colors"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3 text-sm transition hover:border-chart-1/40"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-chart-1/20 text-xs font-bold text-chart-1">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[100px] truncate font-medium sm:inline">
                  {user.name?.split(" ")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close menu"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-chart-1">
                        {role}
                      </p>
                    </div>
                    <div className="p-1.5">
                      {dashHref && (
                        <Link
                          href={dashHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"
                        >
                          <LayoutDashboard className="h-4 w-4 text-chart-1" />
                          Dashboard
                        </Link>
                      )}
                      {role === "CUSTOMER" && (
                        <Link
                          href="/customer/shipments"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"
                        >
                          <Package className="h-4 w-4 text-chart-1" />
                          My Shipments
                        </Link>
                      )}
                      <Link
                        href="/customer/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"
                      >
                        <User className="h-4 w-4 text-chart-1" />
                        Profile
                      </Link>
                      <button
                        type="button"
                        disabled={loggingOut}
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {publicRoutes.map((route) => (
              <Link
                key={route.url}
                href={route.url}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium",
                  pathname === route.url ||
                    (route.url !== "/" && pathname.startsWith(route.url))
                    ? "bg-chart-1/15 text-chart-1"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {route.name}
              </Link>
            ))}
            {dashHref && (
              <Link
                href={dashHref}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-chart-1"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}