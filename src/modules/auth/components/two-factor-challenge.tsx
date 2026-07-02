"use client";

import { ArrowRight, ChevronLeft, ShieldCheck } from "lucide-react";
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
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setMfaChallenge(null);
          router.push("/auth/login");
        }}
        className="h-8 w-fit rounded-md px-1.5 text-[12.5px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" /> Back
      </Button>

      <div className="grid size-14 place-items-center rounded-md bg-primary/10 text-primary">
        <ShieldCheck className="size-6" />
      </div>

      <div>
        <div className="mb-3 text-[11px] uppercase text-muted-foreground">
          Security check
        </div>
        <h2 className="text-display m-0 text-3xl font-semibold">
          Two-factor verification
        </h2>
        <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">
          {useRecovery
            ? "Enter one of the recovery codes you saved when you enabled 2FA."
            : `Enter the 6-digit code from your authenticator app for ${mfa.email}.`}
        </p>
      </div>

      {!useRecovery ? (
        <>
          <div className="grid grid-cols-6 gap-2">
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
                className="h-14 min-w-0 rounded-md border border-border bg-card text-center font-mono text-[22px] font-bold text-foreground shadow-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="font-medium text-primary hover:underline"
            >
              Use a recovery code
            </button>
          </p>
        </>
      ) : (
        <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-3">
          <Input
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
            placeholder="XXXXX-XXXXX"
            autoFocus
            disabled={isPending}
            className="h-12 rounded-md border-border bg-card px-3 font-mono text-[15px] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30"
          />
          {error && (
            <p className="text-[12.5px] text-destructive">
              {error.message ?? "Invalid code, try again"}
            </p>
          )}
          <Button
            type="submit"
            disabled={isPending || !recoveryCode.trim()}
            className="mt-1 h-12 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-emerald hover:bg-primary/90"
          >
            {isPending ? "Verifying…" : "Verify recovery code"}
            <ArrowRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setUseRecovery(false)}
            className="h-9 rounded-md text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
          >
            Use authenticator code instead
          </Button>
        </form>
      )}

      <p className="text-center text-[12.5px] text-muted-foreground">
        Need help?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
