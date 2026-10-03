"use client";

import { useMemo, useState } from "react";
import { Ban, Check, RefreshCw, Shield, UserRound } from "lucide-react";
import { useAllUsers, useUpdateUserStatus } from "@/hooks";
import type { UserData } from "@/types";
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
  SearchField,
  StatusPill,
  TablePager,
} from "@/components/dashboard/admin-ui";

const PAGE_SIZE = 10;
const roles = ["CUSTOMER", "COURIER", "ADMIN", "SUPER_ADMIN"];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default function AdminUsersPage() {
  const usersQuery = useAllUsers();
  const statusMutation = useUpdateUserStatus();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [targetUser, setTargetUser] = useState<UserData>();
  const users = responseList<UserData>(usersQuery.data);
  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !needle ||
        user.name?.toLowerCase().includes(needle) ||
        user.email?.toLowerCase().includes(needle) ||
        user.phone?.toLowerCase().includes(needle);
      return matchesSearch && (!role || user.role === role) && (!status || user.status === status);
    });
  }, [role, search, status, users]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pageRows = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        eyebrow="Operations"
        title="User management"
        description="Review customer, courier and administrator accounts. Status changes are confirmed before applying."
        action={
          <Button type="button" variant="outline" onClick={() => void usersQuery.refetch()} disabled={usersQuery.isFetching}>
            <RefreshCw className={usersQuery.isFetching ? "animate-spin" : ""} /> Refresh
          </Button>
        }
      />
      <AdminSurface className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row">
          <SearchField value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search name, email or phone" />
          <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} aria-label="Filter users by role" className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">All roles</option>
            {roles.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
          </select>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter users by status" className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <span className="self-center whitespace-nowrap px-1 text-xs text-muted-foreground">{filteredUsers.length} accounts</span>
        </div>
        {usersQuery.isError ? (
          <div className="p-4"><QueryError message={getErrorMessage(usersQuery.error)} onRetry={() => void usersQuery.refetch()} /></div>
        ) : usersQuery.isLoading ? (
          <div className="space-y-3 p-5"><AdminSkeleton rows={6} /></div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState title={users.length === 0 ? "No users returned" : "No matching users"} description={users.length === 0 ? "User accounts will appear here when returned by the API." : "Try a different search or filter combination."} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-muted/45 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Joined</th>
                    <th className="px-5 py-3.5 text-right">Account action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageRows.map((user) => {
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
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">
                            {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? <Shield className="h-3 w-3" /> : null}
                            {user.role?.replaceAll("_", " ") || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4"><StatusPill value={user.status} /></td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setTargetUser(user)}
                            disabled={protectedAccount || statusMutation.isPending}
                            aria-label={`${user.status === "ACTIVE" ? "Suspend" : "Activate"} ${user.name}`}
                            className={user.status === "ACTIVE" ? "text-rose-600 hover:bg-rose-500/10" : "text-emerald-700 hover:bg-emerald-500/10"}
                          >
                            {user.status === "ACTIVE" ? <Ban /> : <Check />}
                            {user.status === "ACTIVE" ? "Suspend" : "Activate"}
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
          title={`${targetUser.status === "ACTIVE" ? "Suspend" : "Activate"} account?`}
          description={`This changes the account status for ${targetUser.name || targetUser.email}.`}
          onClose={() => { if (!statusMutation.isPending) setTargetUser(undefined); }}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setTargetUser(undefined)} disabled={statusMutation.isPending}>Cancel</Button>
              <Button
                type="button"
                variant={targetUser.status === "ACTIVE" ? "destructive" : "default"}
                onClick={updateStatus}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? "Updating…" : targetUser.status === "ACTIVE" ? "Suspend account" : "Activate account"}
              </Button>
            </>
          }
        >
          <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
            {targetUser.status === "ACTIVE"
              ? "The user may lose access to the platform while suspended. This action can be reversed by activating the account."
              : "The user will regain access to the platform when the account is activated."}
          </p>
        </AdminDialog>
      )}
    </div>
  );
}
