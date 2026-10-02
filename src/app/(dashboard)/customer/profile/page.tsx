"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Loader2, Save, User as UserIcon, Phone, Mail, ShieldCheck } from "lucide-react";
import { useGetMe, useUpdateProfile, useUploadProfileImage } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

export default function CustomerProfilePage() {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
        toast.add({
          title: "Profile Picture Updated",
          type: "success",
        });
      },
      onError: (err: any) => {
        toast.add({
          title: "Upload Failed",
          description: err?.data?.message || err?.message || "Failed to upload image",
          type: "error",
        });
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      { name, phone },
      {
        onSuccess: () => {
          toast.add({
            title: "Profile Updated",
            description: "Your information has been saved successfully.",
            type: "success",
          });
        },
        onError: (err: any) => {
          toast.add({
            title: "Update Failed",
            description: err?.data?.message || err?.message || "Something went wrong",
            type: "error",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading profile details…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal details and account settings
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8 space-y-8">
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 border-b border-border pb-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-chart-1 bg-muted shadow-md">
            {user?.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user?.name || "Avatar"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UserIcon className="h-10 w-10" />
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white backdrop-blur-[2px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-bold text-lg">{user?.name}</h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:border-chart-1/50 hover:bg-chart-1/5">
              <Camera className="h-3.5 w-3.5 text-chart-1" />
              {uploading ? "Uploading..." : "Change Picture"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Profile Update Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel className="flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-chart-1" /> Full Name
              </FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={updating}
              />
            </Field>

            <Field>
              <FieldLabel className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-chart-1" /> Phone Number
              </FieldLabel>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                disabled={updating}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Address (Read-only)
              </FieldLabel>
              <Input value={user?.email || ""} readOnly disabled className="bg-muted/50" />
            </Field>

            <Field>
              <FieldLabel className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-chart-1" /> Account Role
              </FieldLabel>
              <Input value={user?.role || "CUSTOMER"} readOnly disabled className="bg-muted/50 uppercase font-semibold" />
            </Field>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={updating || uploading}
              className="rounded-full bg-chart-1 font-bold text-emerald-950 hover:bg-chart-2 px-6"
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}