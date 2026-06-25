"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAcademicYearStore } from "@/stores/dialog-store";

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

export function AcademicYearViewDialog() {
  const viewing = useAcademicYearStore((s) => s.viewing);
  const closeView = useAcademicYearStore((s) => s.closeView);

  const isOpen = Boolean(viewing);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeView()}>
      <DialogContent>
        {viewing ? (
          <>
            <DialogHeader>
              <DialogTitle>{viewing.name}</DialogTitle>
              <DialogDescription>
                {viewing.isCurrent
                  ? "Currently marked as the active academic year."
                  : "Past or upcoming academic year."}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow
                label="Start date"
                value={formatDate(viewing.startDate)}
              />
              <DetailRow
                label="End date"
                value={formatDate(viewing.endDate)}
              />
              <DetailRow
                label="Status"
                value={viewing.isActive ? "Active" : "Archived"}
              />
              <DetailRow
                label="Current"
                value={viewing.isCurrent ? "Yes" : "No"}
              />
              <DetailRow
                label="Created"
                value={formatDate(viewing.createdAt)}
              />
              <DetailRow
                label="Updated"
                value={formatDate(viewing.updatedAt)}
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
