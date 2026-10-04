"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Camera,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useGetMe, useUpdateProfile, useUploadProfileImage } from "@/hooks";

export default function CustomerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "settings" ? "settings" : "profile";
  const { data, isLoading } = useGetMe();
  const user = (data as any)?.data ?? data;
  const { mutate: updateProfile, isPending: updating } = useUpdateProfile();
  const { mutate: uploadImage, isPending: uploading } = useUploadProfileImage();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        type: "error",
      });
      return;
    }

    uploadImage(file, {
      onSuccess: () => {
        toast.add({ title: "Profile picture updated", type: "success" });
      },
      onError: (error: any) => {
        toast.add({
          title: "Upload failed",
          description: error?.data?.message || error?.message || "Failed to upload image",
          type: "error",
        });
      },
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfile(
      { name, phone },
      {
        onSuccess: () => {
          toast.add({
            title: "Profile updated",
            description: "Your information has been saved successfully.",
            type: "success",
          });
        },
        onError: (error: any) => {
          toast.add({
            title: "Update failed",
            description: error?.data?.message || error?.message || "Something went wrong",
            type: "error",
          });
        },
      },
    );
  };

  const profileImage = user?.imageUrl || user?.profileImage || "";

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading profile details…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chart-1">Account</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile & settings</h1>
        </div>

        <div className="inline-flex rounded-full border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => router.push("/customer/profile")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              activeTab === "profile" ? "bg-chart-1 text-emerald-950" : "text-muted-foreground"
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => router.push("/customer/profile?tab=settings")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              activeTab === "settings" ? "bg-chart-1 text-emerald-950" : "text-muted-foreground"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab === "profile" ? (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-col items-center gap-4 border-b border-border pb-6 sm:flex-row sm:gap-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-chart-1 bg-muted shadow-md">
              {profileImage ? (
                <Image src={profileImage} alt={user?.name || "Avatar"} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <UserRound className="h-10 w-10" />
                </div>
              )}

              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white backdrop-blur-[2px]">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-lg font-bold">{user?.name}</h3>
              <p className="text-xs text-muted-foreground">{user?.email}</p>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:border-chart-1/50 hover:bg-chart-1/5">
                <Camera className="h-3.5 w-3.5 text-chart-1" />
                {uploading ? "Uploading..." : "Change picture"}
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} disabled={uploading} />
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel className="flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5 text-chart-1" /> Full name
                </FieldLabel>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" required disabled={updating} />
              </Field>

              <Field>
                <FieldLabel className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-chart-1" /> Phone number
                </FieldLabel>
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="017XXXXXXXX" disabled={updating} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email address (read only)
                </FieldLabel>
                <Input value={user?.email || ""} readOnly disabled className="bg-muted/50" />
              </Field>

              <Field>
                <FieldLabel className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-chart-1" /> Account role
                </FieldLabel>
                <Input value={user?.role || "CUSTOMER"} readOnly disabled className="bg-muted/50 uppercase font-semibold" />
              </Field>
            </div>

            <div className="flex justify-end border-t border-border pt-4">
              <Button type="submit" disabled={updating || uploading} className="rounded-full bg-chart-1 font-bold text-emerald-950 hover:bg-chart-2 px-6">
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-chart-1/15 p-2 text-chart-1">
                <UserRound className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold">Profile</h2>
                <p className="text-xs text-muted-foreground">Personal details</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Name: <span className="font-medium text-foreground">{user?.name || "—"}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Email: <span className="font-medium text-foreground">{user?.email || "—"}</span>
            </p>
            <button
              type="button"
              onClick={() => router.push("/customer/profile")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-chart-1"
            >
              Edit profile <ArrowRight className="h-4 w-4" />
            </button>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/15 p-2 text-violet-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold">Security</h2>
                <p className="text-xs text-muted-foreground">Account protection</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Role: <span className="font-medium uppercase text-foreground">{user?.role || "CUSTOMER"}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Status: <span className="font-medium text-foreground">{user?.status || "ACTIVE"}</span>
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/15 p-2 text-amber-600">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold">Delivery updates</h2>
                <p className="text-xs text-muted-foreground">Notifications</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your shipment and payment updates appear on the dashboard, shipment list and tracking pages.
            </p>
            <button
              type="button"
              onClick={() => router.push("/customer/shipments")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-chart-1"
            >
              View shipments <ArrowRight className="h-4 w-4" />
            </button>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-600">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold">Payment & billing</h2>
                <p className="text-xs text-muted-foreground">Payment activity</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Review records and verify payment status for your recent shipments.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => router.push("/customer/payments")}>
                Open payment history
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
