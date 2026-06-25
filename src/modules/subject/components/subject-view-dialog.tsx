"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useSubjectStore } from "@/stores/dialog-store";

export function SubjectViewDialog() {
  const viewing = useSubjectStore((s) => s.viewing);
  const closeView = useSubjectStore((s) => s.closeView);

  const isOpen = Boolean(viewing);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeView()}>
      <DialogContent>
        {viewing ? (
          <>
            <DialogHeader>
              <DialogTitle>{viewing.name}</DialogTitle>
              <DialogDescription>
                {viewing.description || "No description"}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow label="Code" value={viewing.code || "—"} />
              <DetailRow
                label="Type"
                value={viewing.isElective ? "Elective" : "Core"}
              />
              <DetailRow
                label="Department"
                value={viewing.departmentName ?? "Unassigned"}
              />
              <DetailRow
                label="Status"
                value={viewing.isActive ? "Active" : "Archived"}
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
