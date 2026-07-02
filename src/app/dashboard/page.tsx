"use client";

import {
  CalendarCheck2,
  ChevronRight,
  Download,
  GraduationCap,
  LineChart,
  MapPin,
  MoreVertical,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";

const attendanceData = [
  { d: "Mon", v: 48 },
  { d: "Tue", v: 62 },
  { d: "Wed", v: 74 },
  { d: "Thu", v: 92.6 },
  { d: "Fri", v: 88 },
];

const admissions = [
  { name: "Aarav Sharma", grade: "Grade 11", date: "20 Jun, 2026", status: "Confirmed", initials: "AS" },
  { name: "Diya Mehta", grade: "Grade 9", date: "19 Jun, 2026", status: "Pending", initials: "DM" },
  { name: "Kabir Singh", grade: "Grade 4", date: "18 Jun, 2026", status: "Confirmed", initials: "KS" },
  { name: "Saanvi Iyer", grade: "Grade 12", date: "17 Jun, 2026", status: "Pending", initials: "SI" },
];

const seminars = [
  { time: "09:00", suffix: "AM", title: "AI in Education", room: "Auditorium A", count: 120 },
  { time: "11:30", suffix: "AM", title: "Cyber Safety Workshop", room: "Lab 1", count: 85 },
  { time: "02:00", suffix: "PM", title: "Teaching Methods", room: "Seminar Hall", count: 60 },
  { time: "04:00", suffix: "PM", title: "Mental Health Awareness", room: "Auditorium B", count: 150 },
];

const sparkData = {
  emerald: [2, 3, 2.4, 4, 3.6, 5, 5.4],
  blue: [3, 4, 3.6, 5, 4.2, 5.6, 5.2],
  violet: [5, 4.2, 5, 4, 4.6, 3.8, 4.2],
  amber: [2, 2.6, 3, 3.4, 3, 4, 4.6],
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="section-rise flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-primary">
              Good morning{user?.firstName ? `, ${user.firstName}` : ", Ravi"}{" "}
              <span aria-hidden>👋</span>
            </div>
            <h1 className="text-display text-4xl font-semibold tracking-tight">
              Welcome back!
            </h1>
            <p className="mt-1.5 text-sm font-light text-muted-foreground">
              Term 2 oversight - here&apos;s what needs your attention today.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-paper-2">
              <Download className="size-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-emerald transition hover:bg-primary/90">
              <LineChart className="size-4" /> Generate report
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            icon={<Users className="size-5" />}
            tone="emerald"
            label="Total Students"
            value="1,248"
            delta="5.4%"
            deltaDir="up"
            note="vs last term"
            spark={sparkData.emerald}
            loading={loading}
          />
          <Kpi
            icon={<CalendarCheck2 className="size-5" />}
            tone="blue"
            label="Daily Attendance"
            value="92.6%"
            delta="3.2%"
            deltaDir="up"
            note="vs last 7 days"
            spark={sparkData.blue}
            loading={loading}
          />
          <Kpi
            icon={<GraduationCap className="size-5" />}
            tone="violet"
            label="Faculty Load"
            value="78%"
            delta="2.1%"
            deltaDir="down"
            note="vs last term"
            spark={sparkData.violet}
            loading={loading}
          />
          <Kpi
            icon={<Receipt className="size-5" />}
            tone="amber"
            label="Pending Fees"
            value="₹ 2.45L"
            delta="8.7%"
            deltaDir="up"
            note="vs last month"
            spark={sparkData.amber}
            loading={loading}
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="paper-tile rounded-2xl p-7 lg:col-span-2">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-display text-lg font-semibold">
                  Weekly attendance density
                </h3>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  Grades 10 - 12 · Last 5 sessions
                </p>
              </div>
              <select className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium outline-none">
                <option>Grade 10 - 12</option>
                <option>All grades</option>
              </select>
            </div>

            {loading ? (
              <div className="flex h-72 items-end gap-6 px-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="flex-1 rounded-t-xl"
                    style={{ height: `${40 + (index * 13) % 50}%` }}
                  />
                ))}
              </div>
            ) : (
              <div className="grid h-72 grid-cols-5 items-end gap-6 px-2">
                {attendanceData.map((item) => (
                  <div key={item.d} className="flex h-full flex-col justify-end gap-3">
                    <div className="relative flex flex-1 items-end rounded-xl bg-paper-2/45">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-b from-primary to-primary/15"
                        style={{ height: `${item.v}%` }}
                      />
                    </div>
                    <div className="text-center text-[11px] text-muted-foreground">
                      {item.d}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="paper-tile rounded-2xl p-6">
            <h3 className="text-display mb-5 text-lg font-semibold">
              Today&apos;s seminars
            </h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {seminars.map((seminar) => (
                  <button
                    key={seminar.title}
                    className="group flex w-full items-center gap-3 rounded-xl bg-paper-2/50 p-3 text-left transition hover:bg-paper-2"
                  >
                    <div className="w-14 shrink-0 rounded-lg border border-border/60 bg-card py-1.5 text-center">
                      <p className="text-display text-sm font-semibold leading-none">
                        {seminar.time}
                      </p>
                      <p className="mt-1 text-[9px] uppercase text-muted-foreground/70">
                        {seminar.suffix}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-medium leading-tight">
                        {seminar.title}
                      </h4>
                      <p className="mt-1 flex items-center gap-2.5 text-xs text-muted-foreground/80">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" /> {seminar.room}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <UsersRound className="size-3" /> {seminar.count}
                        </span>
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="paper-tile rounded-2xl lg:col-span-2">
            <div className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-display text-lg font-semibold">Recent admissions</h3>
                <p className="mt-1 text-xs text-muted-foreground/80">Last 7 days</p>
              </div>
              <Link
                href="/dashboard/students"
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-paper-2"
              >
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead>
                  <tr className="border-y border-border/60 text-[10px] uppercase text-muted-foreground/60">
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium">Grade</th>
                    <th className="px-6 py-3 font-medium">Admission Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="w-10 px-6 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Skeleton className="size-9 rounded-full" />
                              <Skeleton className="h-3.5 w-32" />
                            </div>
                          </td>
                          <td className="px-6 py-4"><Skeleton className="h-3 w-16" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-3 w-24" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                          <td className="px-6 py-4"><Skeleton className="size-4" /></td>
                        </tr>
                      ))
                    : admissions.map((admission) => (
                        <tr key={admission.name} className="transition-colors hover:bg-paper-2/40">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="grid size-9 place-items-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary ring-2 ring-card">
                                {admission.initials}
                              </div>
                              <span className="text-sm font-medium">{admission.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground/80">{admission.grade}</td>
                          <td className="px-6 py-4 text-sm text-foreground/80">{admission.date}</td>
                          <td className="px-6 py-4">
                            <AdmissionStatus status={admission.status} />
                          </td>
                          <td className="px-6 py-4">
                            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-paper-2">
                              <MoreVertical className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl bg-ink p-7 text-paper">
            <h3 className="mb-3 text-[10px] uppercase text-paper/60">
              Campus announcement
            </h3>
            {loading ? (
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : (
              <>
                <h4 className="text-display mb-2 text-xl font-semibold">
                  New library hours
                </h4>
                <p className="mb-4 text-sm font-light leading-relaxed text-paper/80">
                  The library will now be open from{" "}
                  <span className="text-gold">7:00 AM to 8:00 PM</span> on all
                  weekdays.
                </p>
                <a
                  href="#"
                  className="mb-2 w-fit text-[12px] font-medium underline decoration-primary underline-offset-[6px] transition-colors hover:decoration-gold"
                >
                  View details
                </a>
                <Image
                  src="/theme-weaver-assets/announcement-books.jpg"
                  alt=""
                  width={160}
                  height={160}
                  className="pointer-events-none absolute -bottom-4 -right-4 size-40 select-none rounded-2xl object-cover opacity-95"
                />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

type Tone = "emerald" | "blue" | "violet" | "amber";

const toneStyles: Record<Tone, { bg: string; fg: string; stroke: string }> = {
  emerald: { bg: "bg-primary-soft", fg: "text-primary", stroke: "var(--color-primary)" },
  blue: { bg: "bg-[oklch(0.93_0.04_240)]", fg: "text-[oklch(0.45_0.12_240)]", stroke: "oklch(0.55 0.15 240)" },
  violet: { bg: "bg-[oklch(0.93_0.04_300)]", fg: "text-[oklch(0.45_0.14_300)]", stroke: "oklch(0.55 0.16 300)" },
  amber: { bg: "bg-[oklch(0.94_0.05_70)]", fg: "text-[oklch(0.5_0.13_60)]", stroke: "oklch(0.65 0.15 60)" },
};

function Kpi({
  icon,
  tone,
  label,
  value,
  delta,
  deltaDir,
  note,
  spark,
  loading,
}: {
  icon: React.ReactNode;
  tone: Tone;
  label: string;
  value: string;
  delta: string;
  deltaDir: "up" | "down";
  note: string;
  spark: number[];
  loading: boolean;
}) {
  const toneStyle = toneStyles[tone];
  const isUp = deltaDir === "up";

  return (
    <div className="paper-tile section-rise rounded-2xl p-6">
      <div className="mb-5 flex items-start justify-between">
        <div className={`grid size-11 place-items-center rounded-full ${toneStyle.bg} ${toneStyle.fg}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <>
          <Skeleton className="mb-3 h-3 w-24" />
          <Skeleton className="mb-4 h-9 w-32" />
          <Skeleton className="h-3 w-28" />
        </>
      ) : (
        <>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-display mb-4 text-3xl font-semibold leading-none tracking-tight">
            {value}
          </p>
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`inline-flex items-center gap-0.5 font-semibold ${isUp ? "text-primary" : "text-[oklch(0.55_0.18_25)]"}`}>
                {isUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                {delta}
              </span>
              <span className="font-light text-muted-foreground/80">{note}</span>
            </div>
            <Sparkline values={spark} stroke={toneStyle.stroke} />
          </div>
        </>
      )}
    </div>
  );
}

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 80;
      const y = 32 - ((value - min) / Math.max(max - min, 1)) * 28;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="80" height="36" viewBox="0 0 80 36" aria-hidden className="-mb-1">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AdmissionStatus({ status }: { status: string }) {
  const confirmed = status === "Confirmed";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${confirmed ? "bg-primary-soft text-primary" : "bg-gold/15 text-gold-foreground"}`}>
      <span className={`size-1.5 rounded-full ${confirmed ? "bg-primary" : "bg-gold"}`} />
      {status}
    </span>
  );
}
