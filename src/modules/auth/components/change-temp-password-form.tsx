"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useChangeTempPassword } from "../api/use-auth";
import {
  changeTempPasswordSchema,
  type ChangeTempPasswordFormValues,
} from "../schemas/auth.schema";

interface ChangeTempPasswordFormProps {
  email: string;
  currentPassword: string;
  accessToken: string;
  onChanged: () => void;
}

export function ChangeTempPasswordForm({
  email,
  currentPassword,
  accessToken,
  onChanged,
}: ChangeTempPasswordFormProps) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const methods = useForm<ChangeTempPasswordFormValues>({
    resolver: zodResolver(changeTempPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = methods;

  const { mutate: changePassword, isPending } = useChangeTempPassword();

  const onSubmit = (values: ChangeTempPasswordFormValues) => {
    changePassword(
      {
        body: { currentPassword, newPassword: values.newPassword },
        accessToken,
      },
      { onSuccess: () => onChanged() },
    );
  };

  return (
    <div className="flex animate-in flex-col gap-7 fade-in-0 slide-in-from-bottom-3 duration-500">
      <div>
        <h2 className="m-0 text-[24px] font-bold tracking-[-0.01em]">
          Set a new password
        </h2>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          You signed in with a temporary password. Choose a new password for{" "}
          <span className="font-semibold">{email}</span> to continue.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="newPassword"
              className="text-[12.5px] font-semibold text-foreground/85"
            >
              New password
            </Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Controller
                control={control}
                name="newPassword"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="h-11 pl-10 pr-10 text-[14px]"
                    aria-invalid={Boolean(errors.newPassword)}
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-[12.5px] font-semibold text-foreground/85"
            >
              Confirm new password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className="h-11 pl-10 pr-10 text-[14px]"
                    aria-invalid={Boolean(errors.confirmPassword)}
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-[var(--color-brand-600)] px-4 text-[14.5px] font-semibold text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all hover:bg-[var(--color-brand-700)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Updating…" : "Update password"}
            <ChevronRight className="size-4" />
          </button>
        </form>
      </FormProvider>
    </div>
  );
}
