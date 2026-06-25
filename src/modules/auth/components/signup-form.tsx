"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignup } from "../api/use-auth";
import { signupSchema, type SignupFormValues } from "../schemas/auth.schema";

const STRENGTH_HINTS = [
  "8+ characters with uppercase, number, and symbol",
  "Weak — add an uppercase letter",
  "Fair — add a number",
  "Good — add a symbol for stronger",
  "Strong password",
];

const STRENGTH_COLORS = ["#f43f5e", "#f59e0b", "#f59e0b", "#10b981"];

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);

  const methods = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      agree: true,
    },
  });

  const { mutate: signup, isPending } = useSignup();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = methods;

  const password = useWatch({ control, name: "password" }) || "";
  const agree = useWatch({ control, name: "agree" });
  const strength = scorePassword(password);

  const onSubmit = (values: SignupFormValues) => {
    const { agree: _agree, ...payload } = values;
    void _agree;
    signup(payload);
  };

  return (
    <div className="flex animate-in flex-col gap-6 fade-in-0 slide-in-from-bottom-3 duration-500">
      <div>
        <h2 className="m-0 text-[24px] font-bold tracking-[-0.01em]">
          Create your account
        </h2>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Join Northfield Academy in under a minute.
        </p>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="stagger-children flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName" className="text-[12.5px] font-semibold text-foreground/85">
                First name
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="firstName"
                      placeholder="Sanjay"
                      autoComplete="given-name"
                      className="h-11 pl-10 text-[14px]"
                      aria-invalid={Boolean(errors.firstName)}
                    />
                  )}
                />
              </div>
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName" className="text-[12.5px] font-semibold text-foreground/85">
                Last name
              </Label>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="lastName"
                    placeholder="Kapoor"
                    autoComplete="family-name"
                    className="h-11 text-[14px]"
                    aria-invalid={Boolean(errors.lastName)}
                  />
                )}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-[12.5px] font-semibold text-foreground/85">
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
                    placeholder="you@email.com"
                    autoComplete="email"
                    className="h-11 pl-10 text-[14px]"
                    aria-invalid={Boolean(errors.email)}
                  />
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-[12.5px] font-semibold text-foreground/85">
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
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
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

            <div className="mt-1.5 flex gap-1">
              {[0, 1, 2, 3].map((i) => {
                const filled = i < strength;
                return (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      background: filled
                        ? STRENGTH_COLORS[strength - 1]
                        : "var(--color-secondary)",
                    }}
                  />
                );
              })}
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              {strength === 4 ? (
                <span className="font-semibold text-[var(--color-brand-700)]">
                  {STRENGTH_HINTS[4]}
                </span>
              ) : (
                STRENGTH_HINTS[strength]
              )}
            </p>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Controller
            control={control}
            name="agree"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.5] text-foreground/80">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-0.5 size-3.5 accent-[var(--color-brand-600)]"
                />
                <span>
                  I agree to the{" "}
                  <a className="font-semibold text-[var(--color-brand-600)]">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a className="font-semibold text-[var(--color-brand-600)]">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            )}
          />
          {errors.agree && (
            <p className="text-xs text-destructive">{errors.agree.message}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !agree}
            className="mt-2 inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-[var(--color-brand-600)] px-4 text-[14.5px] font-semibold text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all hover:bg-[var(--color-brand-700)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creating account…" : "Create account"}
            <ChevronRight className="size-4" />
          </button>
        </form>
      </FormProvider>

      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-[var(--color-brand-600)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
