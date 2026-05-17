"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useRoleStore } from "../store/role.store";

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

export function RoleViewDialog() {
  const viewing = useRoleStore((s) => s.viewing);
  const closeView = useRoleStore((s) => s.closeView);

  const isOpen = Boolean(viewing);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeView()}>
      <DialogContent>
        {viewing ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-mono">{viewing.name}</DialogTitle>
              <DialogDescription>
                {viewing.description || "No description"}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow
                label="Status"
                value={viewing.isActive ? "Active" : "Inactive"}
              />
              <DetailRow
                label="Scope"
                value={viewing.isSystem ? "System role" : "School role"}
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
