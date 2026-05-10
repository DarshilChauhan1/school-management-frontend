"use client";

import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useEnableTwoFactor, useTwoFactorSetup } from "../api/use-auth";
import { useAuthStore } from "../store/auth.store";

type Step = "offer" | "qr" | "codes";
const OTP_LENGTH = 6;

function Stepper({ active }: { active: 1 | 2 | 3 }) {
  const labels = ["Choose", "Scan & verify", "Backup codes"] as const;
  return (
    <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
      {labels.map((label, i) => {
        const idx = (i + 1) as 1 | 2 | 3;
        const done = idx < active;
        const on = idx === active;
        return (
          <div key={label} className="flex flex-1 items-center gap-1.5">
            <span className="flex items-center gap-1.5">
              <span
                className={`grid size-[18px] place-items-center rounded-full text-[10px] font-bold ${
                  done || on
                    ? "bg-[var(--color-brand-500)] text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-2.5" /> : idx}
              </span>
              <span
                className={
                  on ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                }
              >
                {label}
              </span>
            </span>
            {i < 2 && <span className="h-px flex-1 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

export function TwoFactorSetup() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [step, setStep] = useState<Step>("offer");
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [copied, setCopied] = useState(false);
  const [codesSaved, setCodesSaved] = useState(false);
  const enableSubmittedRef = useRef(false);

  const setup = useTwoFactorSetup();
  const enable = useEnableTwoFactor();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/auth/login");
  }, [isAuthenticated, router]);

  const startSetup = () => {
    setup.mutate(undefined, { onSuccess: () => setStep("qr") });
  };

  const submitCode = (code: string) => {
    if (enableSubmittedRef.current) return;
    enableSubmittedRef.current = true;
    enable.mutate(
      { code },
      {
        onSuccess: () => setStep("codes"),
        onError: () => {
          enableSubmittedRef.current = false;
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
    if (next.every((d) => d !== "")) submitCode(next.join(""));
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => text[i] ?? "");
    setDigits(next);
    refs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    if (next.every((d) => d !== "")) submitCode(next.join(""));
  };

  const copySecret = async () => {
    const secret = setup.data?.data.secret;
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadCodes = () => {
    const content = enable.data?.data.downloadContent;
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "northfield-2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    setCodesSaved(true);
  };

  const copyAllCodes = async () => {
    const codes = enable.data?.data.recoveryCodes;
    if (!codes) return;
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCodesSaved(true);
    } catch {
      /* clipboard unavailable */
    }
  };

  const finish = () => {
    router.push("/dashboard");
  };

  const skip = () => {
    router.push("/dashboard");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex animate-in flex-col gap-6 fade-in-0 slide-in-from-bottom-3 duration-500">
      {step === "offer" && (
        <>
          <Stepper active={1} />
          <div className="grid size-14 place-items-center rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em]">
              Add an extra layer of security
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted-foreground">
              {user?.firstName ? `Hi ${user.firstName}, ` : ""}protect your account
              with two-factor authentication. Even if someone learns your password,
              they won&apos;t get in without your phone.
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {[
              "Block 99.9% of automated account-takeover attempts",
              "Get 10 backup codes — never get locked out",
              "Takes about 60 seconds to set up",
            ].map((t) => (
              <li
                key={t}
                className="flex items-center gap-2.5 text-[13px] text-foreground/85"
              >
                <span className="grid size-[22px] place-items-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                  <Check className="size-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={startSetup}
              disabled={setup.isPending}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-[var(--color-brand-600)] px-4 text-[14.5px] font-semibold text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all hover:bg-[var(--color-brand-700)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="size-4" />
              {setup.isPending ? "Preparing…" : "Enable 2FA — recommended"}
            </button>
            <button
              type="button"
              onClick={skip}
              className="inline-flex h-11 items-center justify-center rounded-md text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Skip for now
            </button>
          </div>

          <p className="text-center text-[11.5px] text-muted-foreground">
            You can always enable 2FA later from Account Settings.
          </p>
        </>
      )}

      {step === "qr" && setup.data && (
        <>
          <Stepper active={2} />
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setStep("offer")}
              className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <h2 className="m-0 text-[20px] font-bold tracking-[-0.01em]">
              Scan with your authenticator
            </h2>
          </div>
          <p className="-mt-3 pl-9 text-[13px] text-muted-foreground">
            Open Google Authenticator, Authy, or 1Password and scan this QR.
          </p>

          <div className="flex gap-3.5 rounded-md border border-border bg-secondary p-3.5">
            <div className="grid size-[108px] shrink-0 place-items-center rounded-md bg-white p-2">
              <Image
                src={setup.data.data.qrCodeDataUrl}
                alt="2FA QR code"
                width={92}
                height={92}
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                Can&apos;t scan? Enter manually
              </div>
              <div className="mt-1.5 break-all font-mono text-[12.5px] font-semibold leading-[1.4] text-foreground">
                {setup.data.data.secret.match(/.{1,4}/g)?.join(" ")}
              </div>
              <button
                type="button"
                onClick={copySecret}
                className="mt-2.5 inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {copied ? (
                  <>
                    <Check className="size-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" /> Copy secret
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-foreground/85">
              Enter the 6-digit code from your app
            </label>
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
                  disabled={enable.isPending}
                  autoFocus={i === 0}
                  className="h-13 w-11 rounded-md border border-input bg-card text-center font-mono text-[20px] font-bold outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
                />
              ))}
            </div>
            {enable.error && (
              <p className="text-[12px] text-destructive">
                {enable.error.message ?? "Invalid code, try again"}
              </p>
            )}
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              The code refreshes every 30 seconds.
            </p>
          </div>
        </>
      )}

      {step === "codes" && enable.data && (
        <>
          <Stepper active={3} />
          <div className="flex items-start gap-2.5">
            <div className="grid size-9 place-items-center rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h2 className="m-0 text-[20px] font-bold tracking-[-0.01em]">
                2FA enabled — save your backup codes
              </h2>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Each code works once if you lose your authenticator.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-amber-100 p-3 text-[12px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <span className="leading-none">⚠</span>
            <span>
              <b>This is the only time you&apos;ll see these codes.</b> Download or
              copy them now — we cannot show them again.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-md border border-dashed border-border bg-card p-3.5 font-mono text-[12.5px] font-semibold">
            {enable.data.data.recoveryCodes.map((c, i) => (
              <div
                key={c}
                className="flex items-center gap-1.5 text-foreground/80"
              >
                <span className="min-w-4 text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {c}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadCodes}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card text-[12px] font-semibold transition-colors hover:bg-secondary"
            >
              <Download className="size-3.5" /> Download .txt
            </button>
            <button
              type="button"
              onClick={copyAllCodes}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card text-[12px] font-semibold transition-colors hover:bg-secondary"
            >
              <Copy className="size-3.5" /> Copy all
            </button>
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-[12.5px] text-foreground/80">
            <input
              type="checkbox"
              checked={codesSaved}
              onChange={(e) => setCodesSaved(e.target.checked)}
              className="mt-0.5 size-3.5 accent-[var(--color-brand-600)]"
            />
            <span>I&apos;ve saved my backup codes somewhere safe.</span>
          </label>

          <button
            type="button"
            onClick={finish}
            disabled={!codesSaved}
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md bg-[var(--color-brand-600)] px-4 text-[14.5px] font-semibold text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all hover:bg-[var(--color-brand-700)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to portal
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
