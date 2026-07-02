"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Lock, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isUnverifiedAccountError,
  useLogin,
  useResendVerification,
} from "../api/use-auth";
import { isLoginActive } from "../api/auth.types";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { ChangeTempPasswordForm } from "./change-temp-password-form";

export function LoginForm() {
  const params = useSearchParams();
  const initialEmail = params.get("email") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [tempPassChallenge, setTempPassChallenge] = useState<{
    email: string;
    currentPassword: string;
    accessToken: string;
  } | null>(null);

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
      onSuccess: ({ data }) => {
        if (isLoginActive(data) && data.user.isTempPass) {
          setTempPassChallenge({
            email: values.email,
            currentPassword: values.password,
            accessToken: data.tokens.accessToken,
          });
        }
      },
      onError: (error) => {
        if (isUnverifiedAccountError(error)) {
          setUnverifiedEmail(values.email);
        }
      },
    });
  };

  if (tempPassChallenge) {
    return (
      <ChangeTempPasswordForm
        email={tempPassChallenge.email}
        currentPassword={tempPassChallenge.currentPassword}
        accessToken={tempPassChallenge.accessToken}
        onChanged={() => {
          reset({ email: tempPassChallenge.email, password: "" });
          setTempPassChallenge(null);
        }}
      />
    );
  }

  return (
    <div className="flex animate-in flex-col gap-7 fade-in-0 slide-in-from-bottom-3 duration-500">
      <div>
        <div className="mb-3 text-[11px] uppercase text-muted-foreground">
          Sign in
        </div>
        <h2 className="text-display m-0 text-4xl font-semibold">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
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
          <Button
            type="button"
            variant="outline"
            disabled={isResending}
            onClick={() => resend({ email: unverifiedEmail })}
            className="h-9 self-start rounded-md border-amber-300 bg-white px-3 text-[12.5px] font-semibold text-amber-900 hover:bg-amber-50 dark:border-amber-800 dark:bg-transparent dark:text-amber-100 dark:hover:bg-amber-950/50"
          >
            <Mail className="size-3.5" />
            {isResending ? "Sending…" : "Resend verification email"}
          </Button>
        </div>
      )}

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="stagger-children flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-medium uppercase text-muted-foreground"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                    className="h-12 border-border bg-card pl-10 text-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30"
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
              className="text-xs font-medium uppercase text-muted-foreground"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                    className="h-12 border-border bg-card pl-10 pr-10 text-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30"
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
              <Checkbox
                id="keep"
                defaultChecked
                className="border-primary shadow-sm data-[checked]:border-primary data-[checked]:bg-primary"
              />
              <span>Keep me signed in</span>
            </label>
            <a className="cursor-pointer font-medium text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="mt-2 h-12 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-emerald hover:bg-primary/90"
          >
            {isPending ? "Signing in…" : "Sign in"}
            <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
          </Button>
        </form>
      </FormProvider>

      <p className="text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
