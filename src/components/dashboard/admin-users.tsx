"use client";

import { useMemo, useState } from "react";
import { Ban, Check, RefreshCw, Shield, UserRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAllUsers, useUpdateUserStatus } from "@/hooks";
import type { AdminUserQuery, UserData } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  AdminDialog,
  AdminSkeleton,
  AdminSurface,
  EmptyState,
  getErrorMessage,
  PageHeader,
  QueryError,
  responseList,
  responseMeta,
  SearchField,
  StatusPill,
  TablePager,
} from "@/components/dashboard/admin-ui";

const PAGE_SIZE = 20;
const roleTabs = [
  { label: "All users", value: "" },
  { label: "Customers", value: "CUSTOMER" },
  { label: "Couriers", value: "COURIER" },
  { label: "Admins", value: "ADMIN" },
] as const;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function AdminUsers({ courierOnly = false }: { courierOnly?: boolean }) {
  const searchParams = useSearchParams();
  const roleParam = courierOnly ? "COURIER" : searchParams.get("role") || "";
  const role = roleTabs.some((tab) => tab.value === roleParam) ? roleParam : "";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | UserData["status"]>("");
  const [page, setPage] = useState(1);
  const [targetUser, setTargetUser] = useState<UserData>();
  const params = useMemo<AdminUserQuery>(() => ({
    page,
    limit: PAGE_SIZE,
    ...(role ? { role: role as UserData["role"] } : {}),
    ...(status ? { status } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  }), [page, role, search, status]);
  const usersQuery = useAllUsers(params);
  const statusMutation = useUpdateUserStatus();
  const users = responseList<UserData>(usersQuery.data);
  const meta = responseMeta(usersQuery.data);
  const total = typeof meta?.total === "number" ? meta.total : users.length;
  const totalPages = typeof meta?.totalPages === "number" ? Math.max(meta.totalPages, 1) : 1;
  const title = courierOnly ? "Courier accounts" : "User management";
  const filteredRole = role === "COURIER" ? "courier accounts" : "accounts";

  const updateStatus = () => {
    if (!targetUser) return;
    const nextStatus = targetUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    statusMutation.mutate(
      { id: targetUser.id, status: nextStatus },
      {
        onSuccess: () => {
          toast.add({ title: `User ${nextStatus.toLowerCase()}`, type: "success" });
          setTargetUser(undefined);
        },
        onError: (error) => toast.add({
          title: "Couldn’t update user",
          description: getErrorMessage(error),
          type: "error",
        }),
      },
    );
  };

  return (
    <div className="mx-auto max-w-360 space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        eyebrow="Operations"
        title={title}
        description={courierOnly
          ? "Review courier accounts and account status. Courier profile and workload fields are not included in the admin users response."
          : "Search customer, courier and administrator accounts. Significant status changes require confirmation."}
        action={
          <Button type="button" variant="outline" onClick={() => void usersQuery.refetch()} disabled={usersQuery.isFetching}>
            <RefreshCw className={usersQuery.isFetching ? "animate-spin" : ""} /> Refresh
          </Button>
        }
      />

      {!courierOnly && (
        <nav aria-label="Filter users by role" className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
          {roleTabs.map((tab) => (
            <Link
              key={tab.value || "all"}
              href={tab.value ? `/admin/users?role=${tab.value}` : "/admin/users"}
              aria-current={role === tab.value ? "page" : undefined}
              className={`min-h-10 shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                role === tab.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      )}

      <AdminSurface className="overflow-hidden">
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[minmax(0,1fr)_190px_auto]">
          <SearchField value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search name or email" />
          <label className="sr-only" htmlFor="admin-user-status">Filter users by status</label>
          <select
            id="admin-user-status"
            value={status}
            onChange={(event) => { setStatus(event.target.value as "" | UserData["status"]); setPage(1); }}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <p className="self-center whitespace-nowrap px-1 text-xs text-muted-foreground">
            {total.toLocaleString()} {filteredRole}
          </p>
        </div>
        {usersQuery.isError ? (
          <div className="p-4"><QueryError message={getErrorMessage(usersQuery.error)} onRetry={() => void usersQuery.refetch()} /></div>
        ) : usersQuery.isLoading ? (
          <div className="space-y-3 p-5"><AdminSkeleton rows={6} /></div>
        ) : users.length === 0 ? (
          <EmptyState title="No accounts found" description="No users matched this API query. Try clearing the search or status filter." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-197.5 text-left text-sm">
                <thead className="bg-muted/45 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">Account</th>
                    <th className="px-5 py-3.5">Phone</th>
                    {!courierOnly && <th className="px-5 py-3.5">Role</th>}
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Joined</th>
                    <th className="px-5 py-3.5 text-right">Account action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => {
                    const protectedAccount = user.role === "SUPER_ADMIN";
                    return (
                      <tr key={user.id} className="transition hover:bg-muted/30">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                              {user.name?.slice(0, 1).toUpperCase() || <UserRound className="h-4 w-4" />}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-semibold">{user.name || "—"}</span>
                              <span className="mt-1 block truncate text-xs text-muted-foreground">{user.email || "—"}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{user.phone || "—"}</td>
                        {!courierOnly && (
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">
                              {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? <Shield className="h-3 w-3" /> : null}
                              {user.role?.replaceAll("_", " ") || "—"}
                            </span>
                          </td>
                        )}
                        <td className="px-5 py-4"><StatusPill value={user.status} /></td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setTargetUser(user)}
                            disabled={protectedAccount || statusMutation.isPending}
                            aria-label={`${user.status === "ACTIVE" ? "Suspend" : "Reactivate"} ${user.name}`}
                            className={user.status === "ACTIVE" ? "text-rose-600 hover:bg-rose-500/10" : "text-emerald-700 hover:bg-emerald-500/10"}
                          >
                            {user.status === "ACTIVE" ? <Ban /> : <Check />}
                            {user.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TablePager page={page} pages={totalPages} onChange={setPage} />
          </>
        )}
      </AdminSurface>

      {targetUser && (
        <AdminDialog
          title={targetUser.status === "ACTIVE" ? "Suspend this user?" : "Reactivate this user?"}
          description={`${targetUser.name} (${targetUser.email}) will be ${
            targetUser.status === "ACTIVE" ? "prevented from using their account" : "able to use their account again"
          } after the server confirms the change.`}
          onClose={() => { if (!statusMutation.isPending) setTargetUser(undefined); }}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setTargetUser(undefined)} disabled={statusMutation.isPending}>Cancel</Button>
              <Button type="button" variant={targetUser.status === "ACTIVE" ? "destructive" : "default"} onClick={updateStatus} disabled={statusMutation.isPending}>
                {statusMutation.isPending ? "Saving…" : targetUser.status === "ACTIVE" ? "Confirm suspension" : "Confirm reactivation"}
              </Button>
            </>
          }
        >
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <p className="font-medium">{targetUser.name}</p>
            <p className="mt-1 text-muted-foreground">{targetUser.role.replaceAll("_", " ")} · {targetUser.status}</p>
          </div>
        </AdminDialog>
      )}
    </div>
  );
}
