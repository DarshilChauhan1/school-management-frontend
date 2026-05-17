"use client";

import { useMemo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useDepartments } from "@/modules/department/api/use-departments";
import { useAcademicYears } from "@/modules/academic-year/api/use-academic-years";

import { mediumLabel } from "../constants/medium";
import { useClassStore } from "../store/class.store";

export function ClassViewDialog() {
  const viewingClass = useClassStore((s) => s.viewingClass);
  const closeView = useClassStore((s) => s.closeView);

  const departmentsQuery = useDepartments({ limit: 100, isActive: true });
  const academicYearsQuery = useAcademicYears({ limit: 50 });

  const departments = useMemo(
    () => departmentsQuery.data?.data.data ?? [],
    [departmentsQuery.data],
  );
  const academicYears = useMemo(
    () => academicYearsQuery.data?.data.data ?? [],
    [academicYearsQuery.data],
  );

  const departmentName = useMemo(() => {
    if (!viewingClass?.departmentId) return null;
    return (
      departments.find((d) => d.id === viewingClass.departmentId)?.name ?? null
    );
  }, [departments, viewingClass]);

  const academicYearName = useMemo(() => {
    if (!viewingClass?.academicYearId) return null;
    return (
      academicYears.find((y) => y.id === viewingClass.academicYearId)?.name ??
      null
    );
  }, [academicYears, viewingClass]);

  const isOpen = Boolean(viewingClass);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeView()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-y-auto">
        {viewingClass ? (
          <>
            <DialogHeader>
              <DialogTitle>{viewingClass.name}</DialogTitle>
              <DialogDescription>
                {viewingClass.description || "No description"}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow label="Level" value={viewingClass.level ?? "—"} />
              <DetailRow
                label="Status"
                value={viewingClass.isActive ? "Active" : "Archived"}
              />
              <DetailRow
                label="Medium"
                value={mediumLabel(viewingClass.mediumOfInstruction)}
              />
              <DetailRow
                label="Department"
                value={departmentName ?? "Unassigned"}
              />
              <DetailRow
                label="Academic year"
                value={academicYearName ?? "—"}
              />
              <DetailRow
                label="Sections"
                value={String(viewingClass.sections.length)}
              />
            </dl>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Sections</p>
              {viewingClass.sections.length === 0 ? (
                <p className="rounded-md border border-dashed bg-muted/40 px-3 py-4 text-center text-xs text-muted-foreground">
                  This class has no sections yet.
                </p>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <div className="grid grid-cols-[1fr_100px_1fr_80px] gap-3 bg-muted/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Name</span>
                    <span className="text-right">Capacity</span>
                    <span>Room</span>
                    <span>Status</span>
                  </div>
                  <div className="divide-y">
                    {viewingClass.sections.map((section) => (
                      <div
                        key={section.id}
                        className="grid grid-cols-[1fr_100px_1fr_80px] items-center gap-3 px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{section.name}</span>
                        <span className="text-right tabular-nums text-muted-foreground">
                          {section.capacity ?? "—"}
                        </span>
                        <span className="text-muted-foreground">
                          {section.roomNumber || "—"}
                        </span>
                        <span
                          className={
                            section.isActive
                              ? "text-emerald-700"
                              : "text-muted-foreground"
                          }
                        >
                          {section.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}
