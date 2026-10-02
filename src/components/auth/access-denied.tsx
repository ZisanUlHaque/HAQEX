import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15">
          <ShieldAlert className="h-8 w-8 text-rose-600" />
        </div>
        <h1 className="text-xl font-bold">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to view this page. Switch account or go
          back home.
        </p>
        <div className="flex gap-2">
          <Link href="/">
            <Button type="button" variant="outline" className="rounded-full">
              Home
            </Button>
          </Link>
          <Link href="/login">
            <Button
              type="button"
              className="rounded-full bg-chart-1 text-emerald-950 hover:bg-chart-2"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
