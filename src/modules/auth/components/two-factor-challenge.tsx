"use client";

import { ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useVerifyMfaLogin } from "../api/use-auth";
import { useAuthStore } from "../store/auth.store";

const OTP_LENGTH = 6;

export function TwoFactorChallenge() {
  const router = useRouter();
  const mfa = useAuthStore((s) => s.mfa);
  const setMfaChallenge = useAuthStore((s) => s.setMfaChallenge);
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const submittedRef = useRef(false);

  const { mutate: verify, isPending, error } = useVerifyMfaLogin();

  useEffect(() => {
    if (!mfa?.ticket) router.replace("/auth/login");
  }, [mfa, router]);

  const submit = (code: string) => {
    if (!mfa?.ticket || submittedRef.current) return;
    submittedRef.current = true;
    verify(
      { mfaTicket: mfa.ticket, code },
      {
        onError: () => {
          submittedRef.current = false;
          setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
          refs.current[0]?.focus();
        },
      },
    );
  };

  const handleChange = (i: number, raw: string) => {
    if (!/^\d?$/.test(raw)) return;
    const next = [...digits];
    next[i] = raw;
    setDigits(next);
    if (raw && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) submit(next.join(""));
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => text[i] ?? "");
    setDigits(next);
    refs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    if (next.every((d) => d !== "")) submit(next.join(""));
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim()) return;
    submit(recoveryCode.trim().toUpperCase());
  };

  if (!mfa?.ticket) return null;

  return (
    <div className="flex animate-in flex-col gap-6 fade-in-0 slide-in-from-bottom-3 duration-500">
      <button
        type="button"
        onClick={() => {
          setMfaChallenge(null);
          router.push("/auth/login");
        }}
        className="inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-1 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" /> Back
      </button>

      <div className="grid size-14 place-items-center rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
        <ShieldCheck className="size-6" />
      </div>

      <div>
        <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em]">
          Two-factor verification
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted-foreground">
          {useRecovery
            ? "Enter one of the recovery codes you saved when you enabled 2FA."
            : `Enter the 6-digit code from your authenticator app for ${mfa.email}.`}
        </p>
      </div>

      {!useRecovery ? (
        <>
          <div className="flex gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                disabled={isPending}
                autoFocus={i === 0}
                className="h-14 w-12 rounded-md border border-input bg-card text-center font-mono text-[22px] font-bold text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
              />
            ))}
          </div>

          {error && (
            <p className="text-[12.5px] text-destructive">
              {error.message ?? "Invalid code, try again"}
            </p>
          )}

          <p className="text-[12.5px] text-muted-foreground">
            Lost your authenticator?{" "}
            <button
              type="button"
              onClick={() => setUseRecovery(true)}
              className="font-semibold text-[var(--color-brand-600)] hover:underline"
            >
              Use a recovery code
            </button>
          </p>
        </>
      ) : (
        <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-3">
          <input
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
            placeholder="XXXXX-XXXXX"
            autoFocus
            disabled={isPending}
            className="h-12 rounded-md border border-input bg-card px-3 font-mono text-[15px] tracking-[0.08em] outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          />
          {error && (
            <p className="text-[12.5px] text-destructive">
              {error.message ?? "Invalid code, try again"}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending || !recoveryCode.trim()}
            className="mt-1 inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-[var(--color-brand-600)] px-4 text-[14.5px] font-semibold text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all hover:bg-[var(--color-brand-700)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Verifying…" : "Verify recovery code"}
          </button>
          <button
            type="button"
            onClick={() => setUseRecovery(false)}
            className="text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
          >
            Use authenticator code instead
          </button>
        </form>
      )}

      <p className="text-center text-[12.5px] text-muted-foreground">
        Need help?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-[var(--color-brand-600)] hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
