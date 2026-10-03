"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, RefreshCw, Trash2, Warehouse } from "lucide-react";
import { useAllHubs, useCreateHub, useDeleteHub, useUpdateHub } from "@/hooks";
import type { Hub, HubInput } from "@/types";
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
  responseMeta,
  responseList,
  SearchField,
  StatusPill,
  TablePager,
} from "@/components/dashboard/admin-ui";

const PAGE_SIZE = 10;
const emptyHub: HubInput = {
  name: "",
  code: "",
  address: "",
  city: "",
  district: "",
  phone: "",
  status: "ACTIVE",
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default function AdminHubsPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<Hub["status"] | "">("");
  const [page, setPage] = useState(1);
  const hubsQuery = useAllHubs({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    city: city.trim() || undefined,
    status: status || undefined,
  });
  const createMutation = useCreateHub();
  const updateMutation = useUpdateHub();
  const deleteMutation = useDeleteHub();
  const [formHub, setFormHub] = useState<Hub>();
  const [formValues, setFormValues] = useState<HubInput>(emptyHub);
  const [formOpen, setFormOpen] = useState(false);
  const [hubToDelete, setHubToDelete] = useState<Hub>();
  const saving = createMutation.isPending || updateMutation.isPending;
  const hubs = responseList<Hub>(hubsQuery.data);
  const meta = responseMeta(hubsQuery.data);
  const total = typeof meta?.total === "number" ? meta.total : hubs.length;
  const totalPages = typeof meta?.totalPages === "number" ? Math.max(meta.totalPages, 1) : Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRows = hubs;

  const openCreate = () => {
    setFormHub(undefined);
    setFormValues({ ...emptyHub });
    setFormOpen(true);
  };
  const openEdit = (hub: Hub) => {
    setFormHub(hub);
    setFormValues({
      name: hub.name,
      code: hub.code,
      address: hub.address,
      city: hub.city,
      district: hub.district,
      phone: hub.phone || "",
      status: hub.status,
    });
    setFormOpen(true);
  };
  const closeForm = () => {
    if (!saving) setFormOpen(false);
  };

  const submitHub = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formHub) {
      updateMutation.mutate(
        { id: formHub.id, data: formValues },
        {
          onSuccess: () => {
            toast.add({ title: "Hub updated", type: "success" });
            setFormOpen(false);
          },
          onError: (error) => toast.add({ title: "Couldn’t update hub", description: getErrorMessage(error), type: "error" }),
        },
      );
    } else {
      createMutation.mutate(formValues, {
        onSuccess: () => {
          toast.add({ title: "Hub created", type: "success" });
          setFormOpen(false);
        },
        onError: (error) => toast.add({ title: "Couldn’t create hub", description: getErrorMessage(error), type: "error" }),
      });
    }
  };

  const confirmDelete = () => {
    if (!hubToDelete) return;
    deleteMutation.mutate(hubToDelete.id, {
      onSuccess: () => {
        toast.add({ title: "Hub deleted", type: "success" });
        setHubToDelete(undefined);
      },
      onError: (error) => toast.add({ title: "Couldn’t delete hub", description: getErrorMessage(error), type: "error" }),
    });
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        eyebrow="Operations"
        title="Hub network"
        description="Manage the physical hubs in your logistics network."
        action={
          <Button type="button" onClick={openCreate}>
            <Plus /> Add hub
          </Button>
        }
      />
      <AdminSurface className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <SearchField value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search hub name or code" />
          <input value={city} onChange={(event) => { setCity(event.target.value); setPage(1); }} aria-label="Filter hubs by city" placeholder="Filter city" className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter hubs by status" className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <Button type="button" variant="outline" onClick={() => void hubsQuery.refetch()} disabled={hubsQuery.isFetching}>
            <RefreshCw className={hubsQuery.isFetching ? "animate-spin" : ""} /> Refresh
          </Button>
          <span className="whitespace-nowrap px-1 text-xs text-muted-foreground">{total} hubs</span>
        </div>
        {hubsQuery.isError ? (
          <div className="p-4"><QueryError message={getErrorMessage(hubsQuery.error)} onRetry={() => void hubsQuery.refetch()} /></div>
        ) : hubsQuery.isLoading ? (
          <div className="space-y-3 p-5"><AdminSkeleton rows={5} /></div>
        ) : hubs.length === 0 ? (
          <EmptyState title={total === 0 ? "No hubs configured" : "No matching hubs"} description={total === 0 ? "Create a hub to start building your network." : "Try another search or status filter."} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[830px] text-left text-sm">
                <thead className="bg-muted/45 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">Hub</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Created</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageRows.map((hub) => (
                    <tr key={hub.id} className="transition hover:bg-muted/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Warehouse className="h-4 w-4" /></span>
                          <div>
                            <p className="font-semibold">{hub.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{hub.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="flex items-center gap-1.5 font-medium"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{hub.city}, {hub.district}</p>
                        <p className="mt-1 max-w-sm truncate text-xs text-muted-foreground">{hub.address}</p>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{hub.phone || "—"}</td>
                      <td className="px-5 py-4"><StatusPill value={hub.status} /></td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(hub.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${hub.name}`} onClick={() => openEdit(hub)}><Pencil /></Button>
                          <Button type="button" variant="ghost" size="icon" aria-label={`Delete ${hub.name}`} className="text-rose-600 hover:bg-rose-500/10 hover:text-rose-700" onClick={() => setHubToDelete(hub)}><Trash2 /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePager page={page} pages={totalPages} onChange={setPage} />
          </>
        )}
      </AdminSurface>

      {formOpen && (
        <AdminDialog
          title={formHub ? "Edit hub" : "Create a hub"}
          description="Hub details are saved through the existing hub service."
          onClose={closeForm}
          footer={
            <>
              <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>Cancel</Button>
              <Button type="submit" form="admin-hub-form" disabled={saving}>{saving ? "Saving…" : formHub ? "Save changes" : "Create hub"}</Button>
            </>
          }
        >
          <form id="admin-hub-form" onSubmit={submitHub} className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Hub name" required value={formValues.name} onChange={(value) => setFormValues((current) => ({ ...current, name: value }))} />
            <FormInput label="Hub code" required value={formValues.code} onChange={(value) => setFormValues((current) => ({ ...current, code: value }))} />
            <FormInput label="City" required value={formValues.city} onChange={(value) => setFormValues((current) => ({ ...current, city: value }))} />
            <FormInput label="District" required value={formValues.district} onChange={(value) => setFormValues((current) => ({ ...current, district: value }))} />
            <FormInput label="Phone" value={formValues.phone || ""} onChange={(value) => setFormValues((current) => ({ ...current, phone: value }))} />
            <label className="space-y-1.5 text-sm font-medium">
              Status
              <select value={formValues.status} onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value as HubInput["status"] }))} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
              Street address
              <textarea required value={formValues.address} onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))} rows={3} className="w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </label>
          </form>
        </AdminDialog>
      )}

      {hubToDelete && (
        <AdminDialog
          title="Delete this hub?"
          description={`${hubToDelete.name} (${hubToDelete.code}) will be permanently removed.`}
          onClose={() => { if (!deleteMutation.isPending) setHubToDelete(undefined); }}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setHubToDelete(undefined)} disabled={deleteMutation.isPending}>Keep hub</Button>
              <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
                <Trash2 /> {deleteMutation.isPending ? "Deleting…" : "Delete hub"}
              </Button>
            </>
          }
        >
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
            This is a destructive action and cannot be undone from this dashboard.
          </p>
        </AdminDialog>
      )}
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      {label}
      <input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
    </label>
  );
}
