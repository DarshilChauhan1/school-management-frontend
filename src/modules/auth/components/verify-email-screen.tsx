"use client";

import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ApiError } from "@/types/api";
import { useResendVerification, useVerifyEmail } from "../api/use-auth";

const REDIRECT_AFTER_MS = 2400;
const RESEND_COOLDOWN_S = 45;

type Status = "loading" | "success" | "error";

export function VerifyEmailScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const emailFromUrl = params.get("email") ?? "";

  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [errorMsg, setErrorMsg] = useState<string>(
    token ? "" : "Verification link is missing a token.",
  );
  const [cooldown, setCooldown] = useState(0);
  const [resendEmail, setResendEmail] = useState(emailFromUrl);
  const ranRef = useRef(false);

  const { mutate: verify } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } = useResendVerification();

  useEffect(() => {
    if (ranRef.current || !token) return;
    ranRef.current = true;
    verify(
      { token },
      {
        onSuccess: () => setStatus("success"),
        onError: (err: ApiError) => {
          setStatus("error");
          setErrorMsg(err.message ?? "Verification failed");
        },
      },
    );
  }, [token, verify]);

  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => router.push("/auth/login"), REDIRECT_AFTER_MS);
    return () => clearTimeout(t);
  }, [status, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = () => {
    if (!resendEmail) return;
    resend(
      { email: resendEmail },
      { onSuccess: () => setCooldown(RESEND_COOLDOWN_S) },
    );
  };

  return (
    <div className="flex animate-in flex-col gap-6 fade-in-0 slide-in-from-bottom-3 duration-500">
      {status === "loading" && (
        <>
          <div
            className="grid size-20 place-items-center rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
          >
            <Loader2 className="size-9 animate-spin" />
          </div>
          <div>
            <h2 className="m-0 text-[24px] font-bold tracking-[-0.01em]">
              Verifying your email…
            </h2>
            <p className="mt-2 text-[14px] leading-[1.55] text-muted-foreground">
              Hang tight, this only takes a moment.
            </p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="grid size-20 place-items-center rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
            <CheckCircle2 className="size-11" />
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-brand-50)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--color-brand-700)]">
            <span className="size-1.5 rounded-full bg-[var(--color-brand-500)]" />
            Email verified
          </span>

          <div>
            <h2 className="m-0 text-[24px] font-bold tracking-[-0.01em]">
              You&apos;re all set!
            </h2>
            <p className="mt-2 text-[14px] leading-[1.55] text-muted-foreground">
              We&apos;ve confirmed your email. Redirecting you to sign in…
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-md border border-border bg-secondary p-3.5">
            <div className="grid size-9 place-items-center rounded-md bg-card text-[var(--color-brand-700)]">
              <ShieldCheck className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold">What&apos;s next</div>
              <div className="text-[12px] text-muted-foreground">
                On your first sign-in, we&apos;ll guide you through enabling 2FA.
              </div>
            </div>
          </div>

          <Link
            href="/auth/login"
            className="mt-1 inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-[var(--color-brand-600)] px-4 text-[14.5px] font-semibold text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all hover:bg-[var(--color-brand-700)] active:translate-y-px"
          >
            Continue to sign in
            <ChevronRight className="size-4" />
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="grid size-20 place-items-center rounded-md bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-300">
            <XCircle className="size-10" />
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11.5px] font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Verification failed
          </span>

          <div>
            <h2 className="m-0 text-[24px] font-bold tracking-[-0.01em]">
              This link didn&apos;t work
            </h2>
            <p className="mt-2 text-[14px] leading-[1.55] text-muted-foreground">
              {errorMsg}. Verification links expire after a short window for your
              security — request a fresh one below.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 rounded-md border border-border bg-secondary p-3.5 text-[12.5px] text-foreground/80">
            <div className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              Check your spam or promotions folder
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              Make sure noreply emails are allow-listed
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              Only the latest link works — older ones are invalidated
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="resend-email" className="text-[12.5px] font-semibold text-foreground/85">
              Email
            </label>
            <input
              id="resend-email"
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-11 w-full rounded-md border border-input bg-card px-3 text-[14px] outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <button
            type="button"
            disabled={cooldown > 0 || isResending || !resendEmail}
            onClick={handleResend}
            className="mt-1 inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-[var(--color-brand-600)] px-4 text-[14.5px] font-semibold text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all hover:bg-[var(--color-brand-700)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cooldown > 0 ? (
              <>Resend in {cooldown}s</>
            ) : (
              <>
                <Mail className="size-4" />
                {isResending ? "Sending…" : "Resend verification email"}
              </>
            )}
          </button>

          <Link
            href="/auth/login"
            className="text-center text-[13px] font-semibold text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}
