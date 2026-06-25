"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { EMPLOYMENT_TYPE_LABELS } from "../api/staff.types";
import { useStaffStore } from "@/stores/dialog-store";

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export function StaffViewDialog() {
  const viewing = useStaffStore((s) => s.viewing);
  const closeView = useStaffStore((s) => s.closeView);

  const isOpen = Boolean(viewing);
  const fullName = viewing
    ? `${viewing.user.firstName} ${viewing.user.lastName}`.trim()
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeView()}>
      <DialogContent className="max-w-2xl">
        {viewing ? (
          <>
            <DialogHeader>
              <DialogTitle>{fullName}</DialogTitle>
              <DialogDescription>
                {viewing.designation}
                {viewing.user.auth?.email
                  ? ` · ${viewing.user.auth.email}`
                  : ""}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow
                label="Employee code"
                value={viewing.employeeCode || "—"}
              />
              <DetailRow
                label="Employment"
                value={EMPLOYMENT_TYPE_LABELS[viewing.employmentType]}
              />
              <DetailRow
                label="Department"
                value={viewing.department?.name ?? "Unassigned"}
              />
              <DetailRow
                label="Status"
                value={viewing.isActive ? "Active" : "Inactive"}
              />
              <DetailRow
                label="Joined"
                value={formatDate(viewing.joiningDate)}
              />
              <DetailRow
                label="Relieved"
                value={formatDate(viewing.relievingDate)}
              />
              <DetailRow
                label="Qualification"
                value={viewing.qualification || "—"}
              />
              <DetailRow label="Phone" value={viewing.user.phone || "—"} />
            </dl>

            {viewing.specializations.length ? (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Specializations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {viewing.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
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
