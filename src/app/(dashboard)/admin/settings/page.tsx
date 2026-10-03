"use client";

import { useEffect, useState } from "react";
import { Camera, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { useGetMe, useUpdateProfile, useUploadProfileImage } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  AdminSkeleton,
  AdminSurface,
  getErrorMessage,
  PageHeader,
  QueryError,
  responseRecord,
} from "@/components/dashboard/admin-ui";
import type { User } from "@/types";

type AdminProfile = Pick<User, "id" | "name" | "email" | "role" | "imageUrl" | "createdAt"> & {
  phone?: string;
};

export default function AdminSettingsPage() {
  const profileQuery = useGetMe();
  const profile = responseRecord<AdminProfile>(profileQuery.data);
  const updateProfile = useUpdateProfile();
  const uploadProfileImage = useUploadProfileImage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setName(profile?.name || "");
    setPhone(profile?.phone || "");
  }, [profile?.id, profile?.name, profile?.phone]);

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfile.mutate(
      { name, phone },
      {
        onSuccess: () => toast.add({ title: "Profile updated", type: "success" }),
        onError: (error) => toast.add({
          title: "Couldn’t save profile",
          description: getErrorMessage(error),
          type: "error",
        }),
      },
    );
  };

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.add({ title: "Choose an image file", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ title: "Image is too large", description: "Choose a file smaller than 5 MB.", type: "error" });
      return;
    }
    uploadProfileImage.mutate(file, {
      onSuccess: () => toast.add({ title: "Profile image updated", type: "success" }),
      onError: (error) => toast.add({
        title: "Couldn’t upload image",
        description: getErrorMessage(error),
        type: "error",
      }),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-7 px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Manage your admin account details using the existing profile capabilities."
      />
      {profileQuery.isError ? (
        <QueryError message={getErrorMessage(profileQuery.error)} onRetry={() => void profileQuery.refetch()} />
      ) : profileQuery.isLoading ? (
        <AdminSkeleton rows={5} />
      ) : profile ? (
        <>
          <AdminSurface className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted text-primary">
                {profile.imageUrl ? (
                  <img src={profile.imageUrl} alt={`${profile.name} profile`} className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-8 w-8" />
                )}
                {uploadProfileImage.isPending && <span className="absolute inset-0 animate-pulse bg-background/60" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">{profile.name}</h2>
                <p className="mt-1 truncate text-sm text-muted-foreground">{profile.email}</p>
                <label className="mt-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-semibold transition hover:bg-muted">
                  <Camera className="h-3.5 w-3.5" />
                  {uploadProfileImage.isPending ? "Uploading…" : "Change profile image"}
                  <input type="file" accept="image/*" className="sr-only" onChange={onImageChange} disabled={uploadProfileImage.isPending} />
                </label>
              </div>
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:self-center">
                <ShieldCheck className="h-3.5 w-3.5" /> {profile.role.replaceAll("_", " ")}
              </span>
            </div>

            <form onSubmit={saveProfile} className="space-y-5 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Full name
                  <Input value={name} onChange={(event) => setName(event.target.value)} required disabled={updateProfile.isPending} />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Phone number
                  <Input value={phone} onChange={(event) => setPhone(event.target.value)} disabled={updateProfile.isPending} />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Email address
                  <span className="relative block">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={profile.email} readOnly disabled className="pl-9" />
                  </span>
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Account role
                  <Input value={profile.role.replaceAll("_", " ")} readOnly disabled className="capitalize" />
                </label>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">Admin access is controlled by your existing authentication account.</p>
                <Button type="submit" disabled={updateProfile.isPending || uploadProfileImage.isPending}>
                  <Save /> {updateProfile.isPending ? "Saving…" : "Save profile"}
                </Button>
              </div>
            </form>
          </AdminSurface>
          <AdminSurface className="flex items-start gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><ShieldCheck className="h-5 w-5" /></span>
            <div>
              <h2 className="font-semibold">Account security</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Authentication and access policies are managed by the existing HAQEX sign-in system; no separate settings API is available.
              </p>
            </div>
          </AdminSurface>
        </>
      ) : (
        <AdminSurface className="p-6 text-sm text-muted-foreground">The account endpoint returned no profile.</AdminSurface>
      )}
    </div>
  );
}
