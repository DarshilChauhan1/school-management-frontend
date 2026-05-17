"use client";

import {
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Welcome{user?.firstName ? `, ${user.firstName}` : ""}</h2>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{user?.email}</span>
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Students enrolled" value="1,284" hint="+12 this week" icon={<GraduationCap />} />
        <Kpi label="Attendance today" value="96.4%" hint="+0.8% vs last week" icon={<ClipboardCheck />} tone="success" />
        <Kpi label="Active staff" value="87" hint="3 on leave today" icon={<Users />} tone="info" />
        <Kpi label="Term fees" value="84.2L" hint="12.4L pending" icon={<Wallet />} tone="warning" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Start building modules</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <ModuleLink
              href="/dashboard/departments"
              title="Departments"
              description="Create hierarchy, codes, descriptions, and active status."
              icon={<Building2 className="size-5" />}
            />
            <ModuleLink
              href="/dashboard/subjects"
              title="Subjects"
              description="Connect curriculum subjects to academic departments."
              icon={<BookOpen className="size-5" />}
            />
            <ModuleLink
              href="/dashboard/classes"
              title="Classes"
              description="Set up grades and sections for allocation."
              icon={<GraduationCap className="size-5" />}
            />
            <ModuleLink
              href="/dashboard/calendar"
              title="School calendar"
              description="Plan events, holidays, and academic milestones."
              icon={<CalendarDays className="size-5" />}
            />
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Departments", "Set up department hierarchy before assigning subjects."],
              ["Staff", "Assign HODs once department setup is complete."],
              ["Classes", "Create classes and sections for timetable planning."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactElement;
  tone?: "default" | "success" | "info" | "warning";
}) {
  const toneClass = {
    default: "bg-brand-100 text-brand-700",
    success: "bg-emerald-100 text-emerald-700",
    info: "bg-sky-100 text-sky-700",
    warning: "bg-amber-100 text-amber-700",
  }[tone];

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`grid size-8 place-items-center rounded-md ${toneClass}`}>
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold leading-none">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function ModuleLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border bg-background p-4 text-sm transition-colors hover:border-primary/40 hover:bg-accent"
    >
      <span className="mb-3 grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="block font-medium">{title}</span>
      <span className="mt-1 block text-muted-foreground">{description}</span>
    </Link>
  );
}
