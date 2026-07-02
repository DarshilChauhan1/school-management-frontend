import { Layers, ShieldCheck } from "lucide-react";

export function BrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-paper xl:p-16 lg:flex">
      <div aria-hidden className="auth-panel-sheen" />
      <div aria-hidden className="auth-cover-grid opacity-70" />

      <div className="relative flex items-center gap-3 animate-rise-in">
        <div className="relative grid size-11 place-items-center rounded-md bg-primary text-primary-foreground shadow-emerald">
          <Layers className="size-5" />
          <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-gold" />
        </div>
        <div>
          <div className="font-display text-lg font-semibold">Campus OS</div>
          <div className="text-xs text-paper/55">
            The operating system for schools
          </div>
        </div>
      </div>

      <div className="relative max-w-xl space-y-9">
        <div
          className="inline-flex items-center gap-2 text-[11px] uppercase text-paper/55"
          style={{ animation: "rise-in 0.8s ease-out both", animationDelay: "0.05s" }}
        >
          <span className="h-px w-8 bg-gold/70" />
          One platform for the whole school
        </div>

        <h1
          className="text-display m-0 text-5xl font-semibold leading-[1.02] xl:text-6xl"
          style={{ animation: "rise-in 0.9s ease-out both", animationDelay: "0.12s" }}
        >
          Less paperwork.
          <br />
          <span className="text-primary">More teaching.</span>
        </h1>

        <p
          className="max-w-md text-lg leading-relaxed text-paper/70"
          style={{ animation: "rise-in 1s ease-out both", animationDelay: "0.2s" }}
        >
          Attendance, timetables, quizzes, fees, and parent communication in one
          calm, friendly place.
        </p>
      </div>

      <div className="relative">
        <div
          className="inline-flex items-center gap-2 overflow-hidden text-xs text-paper/55"
          style={{ animation: "rise-in 1.1s ease-out both", animationDelay: "0.4s" }}
        >
          <ShieldCheck className="size-4 text-primary" />
          <span>Secured with 2FA · ISO 27001 compliant · Data hosted in India</span>
        </div>
        <div
          aria-hidden
          className="absolute -bottom-2 left-0 h-px w-40 bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{ animation: "shimmer-line 4.5s ease-in-out infinite" }}
        />
      </div>
    </aside>
  );
}
