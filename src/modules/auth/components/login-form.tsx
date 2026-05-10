"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Eye, EyeOff, Lock, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isUnverifiedAccountError,
  useLogin,
  useResendVerification,
} from "../api/use-auth";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";

export function LoginForm() {
  const params = useSearchParams();
  const initialEmail = params.get("email") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: initialEmail, password: "" },
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = methods;

  useEffect(() => {
    if (initialEmail) reset({ email: initialEmail, password: "" });
  }, [initialEmail, reset]);

  const { mutate: login, isPending } = useLogin();
  const { mutate: resend, isPending: isResending } = useResendVerification();

  const onSubmit = (values: LoginFormValues) => {
    setUnverifiedEmail(null);
    login(values, {
      onError: (error) => {
        if (isUnverifiedAccountError(error)) {
          setUnverifiedEmail(values.email);
        }
      },
    });
  };

  return (
    <div className="flex animate-in flex-col gap-7 fade-in-0 slide-in-from-bottom-3 duration-500">
      <div>
        <h2 className="m-0 text-[24px] font-bold tracking-[-0.01em]">
          Welcome back
        </h2>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Sign in to continue to your portal.
        </p>
      </div>

      {unverifiedEmail && (
        <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <MailCheck className="mt-0.5 size-4 shrink-0" />
            <div className="text-[13px] leading-[1.5]">
              <div className="font-semibold">Please verify your email</div>
              <div className="opacity-80">
                We sent a verification link to{" "}
                <span className="font-semibold">{unverifiedEmail}</span>. Confirm
                it before signing in.
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={isResending}
            onClick={() => resend({ email: unverifiedEmail })}
            className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-md border border-amber-300 bg-white px-3 text-[12.5px] font-semibold text-amber-900 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:bg-transparent dark:text-amber-100 dark:hover:bg-amber-950/50"
          >
            <Mail className="size-3.5" />
            {isResending ? "Sending…" : "Resend verification email"}
          </button>
        </div>
      )}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="email"
              className="text-[12.5px] font-semibold text-foreground/85"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="you@northfield.edu"
                    autoComplete="email"
                    className="h-11 pl-10 text-[14px]"
                    aria-invalid={Boolean(errors.email)}
                    onChange={(e) => {
                      field.onChange(e);
                      if (unverifiedEmail) setUnverifiedEmail(null);
                    }}
                  />
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="password"
              className="text-[12.5px] font-semibold text-foreground/85"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 pl-10 pr-10 text-[14px]"
                    aria-invalid={Boolean(errors.password)}
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 text-[13px]">
            <label className="flex cursor-pointer items-center gap-2 text-foreground/80">
              <input
                type="checkbox"
                defaultChecked
                className="size-3.5 accent-[var(--color-brand-600)]"
              />
              Keep me signed in
            </label>
            <a className="cursor-pointer font-semibold text-[var(--color-brand-600)] hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-[var(--color-brand-600)] px-4 text-[14.5px] font-semibold text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all hover:bg-[var(--color-brand-700)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Signing in…" : "Sign in"}
            <ChevronRight className="size-4" />
          </button>
        </form>
      </FormProvider>

      <p className="text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-[var(--color-brand-600)] hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
