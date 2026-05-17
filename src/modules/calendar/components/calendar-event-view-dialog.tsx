"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { EVENT_TYPE_META } from "../constants/event-type";
import { useCalendarStore } from "../store/calendar.store";

const formatDate = (value: string) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
  });
};

export function CalendarEventViewDialog() {
  const viewing = useCalendarStore((s) => s.viewing);
  const closeView = useCalendarStore((s) => s.closeView);

  const isOpen = Boolean(viewing);
  const meta = viewing ? EVENT_TYPE_META[viewing.eventType] : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeView()}>
      <DialogContent>
        {viewing && meta ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${meta.bg} ${meta.text}`}
                >
                  {meta.label}
                </span>
              </div>
              <DialogTitle>{viewing.title}</DialogTitle>
              <DialogDescription>
                {viewing.description || "No description"}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow
                label="Start"
                value={formatDate(viewing.startDate)}
              />
              <DetailRow label="End" value={formatDate(viewing.endDate)} />
              <DetailRow
                label="Duration"
                value={viewing.isFullDay ? "Full day" : "Partial day"}
              />
              <DetailRow
                label="Visibility"
                value={viewing.isPublic ? "Public" : "Staff only"}
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
