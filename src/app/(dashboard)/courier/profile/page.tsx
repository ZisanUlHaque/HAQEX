"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, CarFront, MapPin, Mail, Phone, Save, ShieldCheck, Star, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCourierProfile,
  useGetMe,
  useUpdateCourierAvailability,
  useUpdateProfile,
  useUploadProfileImage,
} from "@/hooks";
import type { CourierAvailability, CourierProfile as CourierProfileData } from "@/types/courier";
import {
  getErrorMessage,
  QueryError,
  responseRecord,
} from "@/components/dashboard/admin-ui";
import { toast } from "@/components/ui/toast";

type CourierUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  status?: string;
  role?: string;
  imageUrl?: string | null;
  profileImage?: string | null;
};

function displayEnum(value?: string | null) {
  return value ? value.replaceAll("_", " ") : "Not provided";
}

export default function CourierProfilePage() {
  const userQuery = useGetMe();
  const user = responseRecord<CourierUser>(userQuery.data);
  const courierQuery = useCourierProfile();
  const courier = responseRecord<CourierProfileData>(courierQuery.data);
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadProfileImage();
  const updateAvailability = useUpdateCourierAvailability();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.name, user?.phone]);

  const updatePicture = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.add({ title: "Unsupported file", description: "Choose an image file.", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ title: "Image is too large", description: "Choose an image smaller than 5 MB.", type: "error" });
      return;
    }
    uploadImage.mutate(file, {
      onSuccess: () => toast.add({ title: "Profile image updated", type: "success" }),
      onError: (error) => toast.add({ title: "Couldn’t update image", description: getErrorMessage(error), type: "error" }),
    });
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfile.mutate(
      { name: name.trim(), phone: phone.trim() },
      {
        onSuccess: () => toast.add({ title: "Profile updated", description: "Your personal details have been saved.", type: "success" }),
        onError: (error) => toast.add({ title: "Couldn’t update profile", description: getErrorMessage(error), type: "error" }),
      },
    );
  };

  const shareCurrentLocation = () => {
    if (!courier) return;
    if (!navigator.geolocation) {
      toast.add({ title: "Location unavailable", description: "This browser does not provide device geolocation.", type: "error" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (
          !Number.isFinite(coords.latitude) ||
          !Number.isFinite(coords.longitude) ||
          coords.latitude < -90 ||
          coords.latitude > 90 ||
          coords.longitude < -180 ||
          coords.longitude > 180
        ) {
          setLocating(false);
          toast.add({ title: "Invalid location", description: "The device returned coordinates outside the accepted range.", type: "error" });
          return;
        }
        updateAvailability.mutate(
          {
            availabilityStatus: courier.availabilityStatus,
            currentLatitude: coords.latitude,
            currentLongitude: coords.longitude,
          },
          {
            onSuccess: () => {
              setLocating(false);
              toast.add({ title: "Location shared", description: "Your current location was saved to your courier profile.", type: "success" });
            },
            onError: (error) => {
              setLocating(false);
              toast.add({ title: "Couldn’t share location", description: getErrorMessage(error), type: "error" });
            },
          },
        );
      },
      (error) => {
        setLocating(false);
        const description = error.code === error.PERMISSION_DENIED
          ? "Location permission was not granted. Your coordinates were not shared."
          : error.code === error.POSITION_UNAVAILABLE
            ? "The device could not determine your location."
            : "The request to determine location timed out.";
        toast.add({ title: "Location not shared", description, type: "error" });
      },
      { enableHighAccuracy: false, maximumAge: 0, timeout: 15000 },
    );
  };

  if (userQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6 sm:py-8" role="status" aria-label="Loading courier profile">
        <div className="h-32 animate-pulse rounded-2xl bg-muted/70" />
        <div className="h-80 animate-pulse rounded-2xl bg-muted/70" />
        <span className="sr-only">Loading courier profile</span>
      </div>
    );
  }

  if (userQuery.isError || !user) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Courier profile</h1>
        </header>
        <QueryError
          message={userQuery.isError ? getErrorMessage(userQuery.error) : "The account service returned no profile."}
          onRetry={() => void userQuery.refetch()}
        />
      </div>
    );
  }

  const imageUrl = user.imageUrl ?? user.profileImage ?? undefined;
  const busy = updateProfile.isPending || uploadImage.isPending || updateAvailability.isPending || locating;

  return (
    <div className="mx-auto max-w-3xl space-y-7 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Courier profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal details and review courier information.</p>
      </header>

      <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-col items-center gap-4 border-b border-border pb-6 text-center sm:flex-row sm:text-left">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground ring-1 ring-border">
            {imageUrl ? (
              <Image src={imageUrl} alt="" fill unoptimized sizes="80px" className="object-cover" />
            ) : (
              <UserRound className="h-8 w-8" aria-hidden="true" />
            )}
            {uploadImage.isPending && (
              <span className="absolute inset-0 flex items-center justify-center bg-background/75 text-xs font-semibold">Uploading</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold">{user.name || "Courier"}</h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{user.email || "Email not provided"}</p>
            <label className="mt-3 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted">
              <Camera className="h-4 w-4 text-primary" aria-hidden="true" />
              Change image
              <input type="file" accept="image/*" className="sr-only" onChange={updatePicture} disabled={busy} />
            </label>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {displayEnum(user.status)}
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-5 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="courier-profile-name" className="flex items-center gap-2 text-sm font-medium">
                <UserRound className="h-4 w-4 text-primary" aria-hidden="true" /> Name
              </label>
              <Input id="courier-profile-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} disabled={busy} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="courier-profile-phone" className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" /> Phone
              </label>
              <Input id="courier-profile-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} disabled={busy} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="courier-profile-email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Email
              </label>
              <Input id="courier-profile-email" value={user.email ?? ""} readOnly disabled className="h-11 rounded-xl bg-muted/40" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="courier-profile-role" className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Account type
              </label>
              <Input id="courier-profile-role" value={displayEnum(user.role)} readOnly disabled className="h-11 rounded-xl bg-muted/40" />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button type="submit" disabled={busy || !name.trim()} className="h-11 w-full rounded-xl px-5 sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {updateProfile.isPending ? "Saving…" : "Save personal details"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CarFront className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold">Courier information</h2>
            <p className="text-xs text-muted-foreground">Read-only values from your account response</p>
          </div>
        </div>
        {courierQuery.isError ? (
          <div className="mt-5">
            <QueryError
              message={getErrorMessage(courierQuery.error)}
              onRetry={() => void courierQuery.refetch()}
            />
          </div>
        ) : courierQuery.isLoading ? (
          <div className="mt-5 h-36 animate-pulse rounded-xl bg-muted/70" role="status" aria-label="Loading courier details" />
        ) : courier ? (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/40 p-3.5">
                <p className="text-xs text-muted-foreground">Vehicle</p>
                <p className="mt-1 font-semibold">{displayEnum(courier.vehicleType)}</p>
              </div>
              {courier.vehicleNumber && (
                <div className="rounded-xl bg-muted/40 p-3.5">
                  <p className="text-xs text-muted-foreground">Vehicle number</p>
                  <p className="mt-1 break-all font-semibold">{courier.vehicleNumber}</p>
                </div>
              )}
              {courier.licenseNumber && (
                <div className="rounded-xl bg-muted/40 p-3.5">
                  <p className="text-xs text-muted-foreground">License number</p>
                  <p className="mt-1 break-all font-semibold">{courier.licenseNumber}</p>
                </div>
              )}
              <div className="rounded-xl bg-muted/40 p-3.5">
                <label htmlFor="courier-availability" className="text-xs text-muted-foreground">Availability</label>
                <select
                  id="courier-availability"
                  value={courier.availabilityStatus}
                  disabled={busy}
                  onChange={(event) => {
                    updateAvailability.mutate(
                      { availabilityStatus: event.target.value as CourierAvailability },
                      {
                        onSuccess: () => toast.add({ title: "Availability updated", type: "success" }),
                        onError: (error) => toast.add({ title: "Couldn’t update availability", description: getErrorMessage(error), type: "error" }),
                      },
                    );
                  }}
                  className="mt-1 block h-9 w-full rounded-lg border border-input bg-background px-2 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>
              {typeof courier.totalDeliveries === "number" && (
                <div className="rounded-xl bg-muted/40 p-3.5">
                  <p className="text-xs text-muted-foreground">Total deliveries</p>
                  <p className="mt-1 font-semibold tabular-nums">{courier.totalDeliveries}</p>
                </div>
              )}
              {typeof courier.rating === "number" && (
                <div className="rounded-xl bg-muted/40 p-3.5">
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="mt-1 flex items-center gap-1.5 font-semibold tabular-nums">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                    {courier.rating}
                  </p>
                </div>
              )}
              <div className="col-span-2 rounded-xl border border-border p-3.5 sm:col-span-3">
                <p className="text-xs text-muted-foreground">Availability guidance</p>
                <p className="mt-1 text-sm font-medium">
                  {courier.availabilityStatus === "AVAILABLE"
                    ? "Ready for deliveries"
                    : courier.availabilityStatus === "BUSY"
                      ? "Currently handling deliveries"
                      : "Not accepting new work"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Availability is saved only when confirmed by the courier service.</p>
              </div>
              {courier.currentLatitude !== null && courier.currentLatitude !== undefined &&
                courier.currentLongitude !== null && courier.currentLongitude !== undefined && (
                  <div className="col-span-2 rounded-xl bg-muted/40 p-3.5 sm:col-span-3">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Last reported coordinates
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium">
                      {courier.currentLatitude}, {courier.currentLongitude}
                    </p>
                  </div>
                )}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <Button type="button" variant="outline" className="min-h-11 w-full rounded-xl sm:w-auto" onClick={shareCurrentLocation} disabled={busy}>
                <MapPin className="mr-2 h-4 w-4" />
                {locating ? "Waiting for location permission…" : "Share current location"}
              </Button>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Location is requested only after you select this button. Your browser will ask for permission; coordinates are not sent if you deny it.
              </p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Availability updates are saved to your courier profile. Coordinates are shown only when provided by the service; this page does not track live GPS.
            </p>
          </>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
            Courier-specific profile details were not included in the current account response.
          </p>
        )}
      </section>
    </div>
  );
}
