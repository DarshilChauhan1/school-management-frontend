"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useDepartmentStore } from "../store/department.store";

const formatDate = (value: string) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export function DepartmentViewDialog() {
  const viewingDepartment = useDepartmentStore((s) => s.viewingDepartment);
  const closeView = useDepartmentStore((s) => s.closeView);

  const isOpen = Boolean(viewingDepartment);
  const hodLabel = viewingDepartment?.hod
    ? `${viewingDepartment.hod.firstName} ${viewingDepartment.hod.lastName}`.trim()
    : "Not assigned";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeView()}>
      <DialogContent>
        {viewingDepartment ? (
          <>
            <DialogHeader>
              <DialogTitle>{viewingDepartment.name}</DialogTitle>
              <DialogDescription>
                {viewingDepartment.description || "No description"}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow
                label="Code"
                value={viewingDepartment.code || "—"}
              />
              <DetailRow
                label="Status"
                value={viewingDepartment.isActive ? "Active" : "Inactive"}
              />
              <DetailRow label="HOD" value={hodLabel} />
              <DetailRow
                label="Created"
                value={formatDate(viewingDepartment.createdAt)}
              />
              <DetailRow
                label="Updated"
                value={formatDate(viewingDepartment.updatedAt)}
              />
            </dl>
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
