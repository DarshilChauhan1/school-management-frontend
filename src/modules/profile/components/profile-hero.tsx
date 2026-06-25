"use client";

import {
  Building2,
  Check,
  Clock,
  Mail,
  Pencil,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useMe } from "@/modules/auth/api/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { useAbilityMeta } from "@/modules/permission/ability/ability-context";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function ProfileHero() {
  const meQuery = useMe();
  const storeUser = useAuthStore((s) => s.user);
  const { role } = useAbilityMeta();

  const user = meQuery.data?.data ?? storeUser;

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [hydrated, setHydrated] = useState(false);

  // Seed the editable form once the user data is available (no effect needed).
  if (user && !hydrated) {
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: "",
    });
    setHydrated(true);
  }

  if (meQuery.isLoading && !storeUser) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  const acceptFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a PNG or JPG image");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be 2 MB or smaller");
      return;
    }
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleSave = () => {
    // Profile update API is not wired on the backend yet.
    toast.info("Profile changes will be saved once the API is connected.");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {/* HERO */}
      <div className="animate-soft-pop overflow-hidden rounded-xl border bg-card">
        <div
          className="relative h-28"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(16,185,129,0.55), transparent 55%)," +
              "radial-gradient(circle at 80% 60%, rgba(20,184,166,0.55), transparent 55%)," +
              "linear-gradient(135deg, #064e3b, #0d9488)",
          }}
        />

        <div className="relative px-6 pb-6">
          {/* avatar */}
          <div className="relative -mt-12 mb-3 size-24">
            <div className="grid size-24 place-items-center overflow-hidden rounded-full border-4 border-card bg-gradient-to-br from-brand-500 to-teal-600 text-3xl font-semibold text-white shadow-md">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt={fullName}
                  className="size-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-[3px] border-card bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105"
              aria-label="Change photo"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>

          {/* name + actions */}
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight">
                  {fullName || "Your profile"}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  ● Active
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {role ?? "Member"}
                {user.email ? ` · ${user.email}` : ""}
              </p>
            </div>
          </div>

          {/* meta pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {user.email ? <MetaPill icon={<Mail className="size-3" />} value={user.email} /> : null}
            <MetaPill icon={<Clock className="size-3" />} value="Member" />
            {user.schoolId ? (
              <MetaPill icon={<Building2 className="size-3" />} value="School linked" />
            ) : null}
            <MetaPill
              icon={<Shield className="size-3" />}
              value={user.is2FAEnabled ? "2FA enabled" : "2FA off"}
              tone={user.is2FAEnabled ? "green" : "amber"}
            />
          </div>
        </div>
      </div>

      {/* upload + form */}
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        {/* photo upload */}
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-3 text-sm font-semibold">Profile photo</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => acceptFile(e.target.files?.[0])}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              fileInputRef.current?.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "cursor-pointer rounded-xl border-[1.5px] border-dashed px-4 py-5 text-center transition-all",
              dragging
                ? "border-brand-500 bg-brand-50"
                : "border-input bg-muted/40 hover:bg-muted/70",
            )}
          >
            <div className="mx-auto mb-2 grid size-12 place-items-center rounded-xl bg-card text-brand-600 shadow-sm">
              <Upload className="size-5" />
            </div>
            <p className="text-[12.5px] font-semibold">Drop image to upload</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              PNG or JPG · square · ≤ 2 MB
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2.5"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose file
            </Button>
          </div>

          <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
            Shown next to your name in attendance lists, messages, and the
            parent portal. Falls back to your initials if cleared.
          </p>
          {avatarPreview ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-1 px-0 text-destructive hover:text-destructive"
              onClick={() => {
                URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(null);
              }}
            >
              <Trash2 className="size-3.5" />
              Remove photo
            </Button>
          ) : null}
        </div>

        {/* edit form */}
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-semibold">Edit your details</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Update how your name and contact appear across the portal.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                placeholder="+91 98450 21847"
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email ?? ""}
                disabled
                className="bg-muted/60 text-muted-foreground"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t pt-4">
            <p className="text-[11.5px] text-muted-foreground">
              Managed by your auth account. Contact admin to change email.
            </p>
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setForm({
                    firstName: user.firstName ?? "",
                    lastName: user.lastName ?? "",
                    phone: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                <Check className="size-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaPill({
  icon,
  value,
  tone = "base",
}: {
  icon: React.ReactNode;
  value: string;
  tone?: "base" | "green" | "amber";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "green"
          ? "bg-emerald-100 text-emerald-700"
          : tone === "amber"
            ? "bg-amber-100 text-amber-700"
            : "bg-muted text-muted-foreground",
      )}
    >
      {icon}
      {value}
    </span>
  );
}
