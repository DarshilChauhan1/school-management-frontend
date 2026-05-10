import { ShieldCheck } from "lucide-react";

const STATS = [
  { value: "1,284", label: "Students enrolled" },
  { value: "96.4%", label: "Avg. attendance" },
  { value: "87", label: "Teachers & staff" },
  { value: "12", label: "Departments" },
];

const BRAND_BG = `
  radial-gradient(circle at 20% 20%, rgba(16,185,129,0.22), transparent 55%),
  radial-gradient(circle at 80% 80%, rgba(20,184,166,0.22), transparent 55%),
  linear-gradient(135deg, #064e3b, #0d9488)
`;

export function BrandPanel() {
  return (
    <div
      className="relative hidden flex-1 flex-col justify-between overflow-hidden p-12 text-white xl:p-16 lg:flex"
      style={{ background: BRAND_BG }}
    >
      <div className="flex items-center gap-3">
        <div
          className="grid size-11 place-items-center rounded-md text-[17px] font-extrabold text-white shadow-[0_4px_10px_rgba(16,185,129,0.25)]"
          style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
        >
          NA
        </div>
        <div>
          <div className="text-[17px] font-bold">Northfield Academy</div>
          <div className="text-xs opacity-70">Bengaluru · Est. 1998</div>
        </div>
      </div>

      <div className="max-w-[480px]">
        <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] opacity-75">
          One platform for the whole school
        </div>
        <h1 className="m-0 text-[42px] font-bold leading-[1.08] tracking-[-0.02em]">
          Less paperwork.
          <br />
          More{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #6ee7b7, #99f6e4)" }}
          >
            teaching.
          </span>
        </h1>
        <p className="mt-5 max-w-[420px] text-[15px] leading-[1.6] opacity-80">
          Attendance, timetables, quizzes, fees, and parent communication — all in
          one calm, friendly place.
        </p>

        <div className="mt-9 grid grid-cols-2 gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-md border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl"
            >
              <div className="text-[24px] font-bold tracking-[-0.01em]">{s.value}</div>
              <div className="mt-0.5 text-[12.5px] opacity-75">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 text-xs opacity-75">
        <ShieldCheck className="size-3.5" />
        <span>Secured with 2FA · ISO 27001 compliant · Data hosted in India</span>
      </div>
    </div>
  );
}
