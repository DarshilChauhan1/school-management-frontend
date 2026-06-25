"use client";

import { Edit3, Phone, ShieldCheck, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { GUARDIAN_RELATION_LABELS, STUDENT_STATUS_LABELS, type GuardianItem } from "../api/student.types";
import { useDeleteGuardian } from "../api/use-students";
import { useStudentStore } from "@/stores/dialog-store";

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

export function StudentViewDialog() {
  const viewing = useStudentStore((s) => s.viewing);
  const closeView = useStudentStore((s) => s.closeView);
  const openGuardian = useStudentStore((s) => s.openSecondary);
  const deleteGuardianMutation = useDeleteGuardian();
  const isOpen = Boolean(viewing);

  const removeGuardian = (guardian: GuardianItem) => {
    if (!viewing) return;
    const confirmed = window.confirm(`Remove ${guardian.firstName} ${guardian.lastName} as guardian?`);
    if (confirmed) deleteGuardianMutation.mutate({ studentId: viewing.id, guardianId: guardian.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeView()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-4xl overflow-y-auto">
        {viewing ? (
          <>
            <DialogHeader>
              <DialogTitle>{`${viewing.firstName} ${viewing.lastName}`}</DialogTitle>
              <DialogDescription>
                {viewing.admissionNumber} · {viewing.class?.name ?? "No class"}
                {viewing.section ? ` ${viewing.section.name}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-4">
              <Detail label="Status" value={STUDENT_STATUS_LABELS[viewing.status]} />
              <Detail label="Admission" value={formatDate(viewing.admissionDate)} />
              <Detail label="Date of birth" value={formatDate(viewing.dateOfBirth)} />
              <Detail label="Academic year" value={viewing.academicYear?.name ?? "—"} />
              <Detail label="Roll no." value={viewing.rollNumber ?? "—"} />
              <Detail label="Gender" value={viewing.gender.toLowerCase()} />
              <Detail label="Phone" value={viewing.phone ?? "—"} />
              <Detail label="Email" value={viewing.email ?? "—"} />
            </div>

            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Guardians</p>
                  <p className="text-xs text-muted-foreground">
                    Primary and emergency contacts attached to this student.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openGuardian({ student: viewing })}>
                  <UserPlus className="size-3.5" />
                  Add
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {viewing.guardians.map((guardian) => (
                  <div key={guardian.id} className="animate-soft-pop rounded-md border bg-background p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {guardian.firstName} {guardian.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {GUARDIAN_RELATION_LABELS[guardian.relation]}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon-sm" variant="ghost" aria-label="Edit guardian" onClick={() => openGuardian({ student: viewing, guardian })}>
                          <Edit3 className="size-4" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" aria-label="Remove guardian" onClick={() => removeGuardian(guardian)} disabled={deleteGuardianMutation.isPending}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {guardian.isPrimaryContact ? <Pill>Primary</Pill> : null}
                      {guardian.isEmergencyContact ? <Pill tone="warn">Emergency</Pill> : null}
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        {guardian.phone}
                      </p>
                      {guardian.occupation ? <p>{guardian.occupation}</p> : null}
                      {guardian.email ? <p>{guardian.email}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm capitalize">{value}</dd>
    </div>
  );
}

function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "warn" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "warn" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700",
      )}
    >
      {tone === "default" ? <ShieldCheck className="size-3" /> : null}
      {children}
    </span>
  );
}
