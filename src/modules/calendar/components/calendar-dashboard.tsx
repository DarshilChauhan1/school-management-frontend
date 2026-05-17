"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import {
  useCalendarEvents,
  useDeleteCalendarEvent,
} from "../api/use-calendar";
import type { CalendarEventItem } from "../api/calendar.types";
import {
  CALENDAR_EVENT_TYPES,
  EVENT_TYPE_META,
} from "../constants/event-type";
import { useCalendarStore } from "../store/calendar.store";
import { CalendarEventFormDialog } from "./calendar-event-form-dialog";
import { CalendarEventViewDialog } from "./calendar-event-view-dialog";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const stripTime = (value: string): Date => {
  const parsed = new Date(value);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function CalendarDashboard() {
  const openCreate = useCalendarStore((s) => s.openCreate);
  const openView = useCalendarStore((s) => s.openView);
  const openEdit = useCalendarStore((s) => s.openEdit);

  const today = useMemo(() => stripTime(new Date().toISOString()), []);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthStart = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    [cursor],
  );
  const monthEnd = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0),
    [cursor],
  );

  const eventsQuery = useCalendarEvents({
    limit: 100,
    from: toIsoDate(monthStart),
    to: toIsoDate(monthEnd),
    sortBy: "startDate",
    sortOrder: "asc",
  });
  const deleteMutation = useDeleteCalendarEvent();

  const events = useMemo(
    () => eventsQuery.data?.data.data ?? [],
    [eventsQuery.data],
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    events.forEach((event) => {
      const start = stripTime(event.startDate);
      const end = stripTime(event.endDate);
      for (
        let d = new Date(start);
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        if (d < monthStart || d > monthEnd) continue;
        const key = toIsoDate(d);
        const list = map.get(key) ?? [];
        list.push(event);
        map.set(key, list);
      }
    });
    return map;
  }, [events, monthStart, monthEnd]);

  const cells = useMemo(() => {
    const firstWeekday = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();
    const out: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), d));
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [monthStart, monthEnd]);

  const goPrev = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNext = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const handleDayClick = (day: Date) => openCreate(toIsoDate(day));

  const handleDelete = (event: CalendarEventItem) => {
    const confirmed = window.confirm(`Delete "${event.title}"?`);
    if (confirmed) deleteMutation.mutate(event.id);
  };

  const exams = events.filter((e) => e.eventType === "EXAM").length;
  const holidays = events.filter((e) => e.eventType === "HOLIDAY").length;
  const ptms = events.filter(
    (e) => e.eventType === "PARENT_TEACHER_MEETING",
  ).length;

  const monthLabel = `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        <MetricTile
          label="Events this month"
          value={events.length}
          hint={monthLabel}
          icon={<CalendarDays className="size-4" />}
        />
        <MetricTile
          label="Exams"
          value={exams}
          hint="Scheduled assessments"
          icon={<Star className="size-4" />}
          tone="warning"
        />
        <MetricTile
          label="Holidays"
          value={holidays}
          hint="School closed"
          icon={<CalendarDays className="size-4" />}
          tone="rose"
        />
        <MetricTile
          label="PTMs"
          value={ptms}
          hint="Parent-teacher meetings"
          icon={<CalendarDays className="size-4" />}
          tone="info"
        />
      </section>

      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
          <Button size="icon-sm" variant="outline" onClick={goPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="px-1 text-base font-semibold">{monthLabel}</h2>
          <Button size="icon-sm" variant="outline" onClick={goNext}>
            <ChevronRight className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={goToday}>
            Today
          </Button>
          {eventsQuery.isFetching ? (
            <Spinner className="size-4 text-muted-foreground" />
          ) : null}
          <div className="ml-auto">
            <Button onClick={() => openCreate()}>
              <Plus className="size-4" />
              New event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b bg-muted/40">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(108px,auto)]">
          {cells.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="border-b border-r bg-muted/20 last:border-r-0"
                />
              );
            }
            const key = toIsoDate(day);
            const dayEvents = eventsByDay.get(key) ?? [];
            const isToday = isSameDay(day, today);
            const colBoundary = (idx + 1) % 7 === 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  "group flex flex-col items-stretch border-b text-left transition-colors",
                  !colBoundary && "border-r",
                  isToday
                    ? "bg-brand-50 hover:bg-brand-100/70"
                    : "bg-card hover:bg-muted/40",
                )}
              >
                <div className="flex items-center justify-between px-2 pt-2">
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full text-xs font-semibold tabular-nums",
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 ? (
                    <span className="text-[10px] text-muted-foreground">
                      {dayEvents.length}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1 px-2 pb-2 pt-1">
                  {dayEvents.slice(0, 2).map((event) => {
                    const meta = EVENT_TYPE_META[event.eventType];
                    return (
                      <span
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          openView(event);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            openView(event);
                          }
                        }}
                        className={cn(
                          "truncate rounded px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer",
                          meta.bg,
                          meta.text,
                        )}
                      >
                        {event.title}
                      </span>
                    );
                  })}
                  {dayEvents.length > 2 ? (
                    <span className="px-1.5 text-[10px] text-muted-foreground">
                      +{dayEvents.length - 2} more
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Events in {monthLabel}</h3>
          <span className="text-xs text-muted-foreground">
            {events.length} total
          </span>
        </div>

        {eventsQuery.isLoading ? (
          <div className="grid min-h-32 place-items-center rounded-lg border bg-card">
            <Spinner className="size-6" />
          </div>
        ) : events.length === 0 ? (
          <div className="grid min-h-32 place-items-center rounded-lg border border-dashed bg-card px-4 text-center">
            <div>
              <CalendarDays className="mx-auto mb-2 size-7 text-muted-foreground" />
              <p className="text-sm font-medium">
                Nothing scheduled this month
              </p>
              <p className="text-xs text-muted-foreground">
                Click any day on the grid above to add an event.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <EventListRow
                key={event.id}
                event={event}
                onView={() => openView(event)}
                onEdit={() => openEdit(event)}
                onDelete={() => handleDelete(event)}
                disabledDelete={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </section>

      <Legend />

      <CalendarEventFormDialog />
      <CalendarEventViewDialog />
    </div>
  );
}

function EventListRow({
  event,
  onView,
  onEdit,
  onDelete,
  disabledDelete,
}: {
  event: CalendarEventItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabledDelete: boolean;
}) {
  const meta = EVENT_TYPE_META[event.eventType];
  const start = stripTime(event.startDate);
  const end = stripTime(event.endDate);
  const sameDay = isSameDay(start, end);
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    weekday: "short",
  });
  const dateLabel = sameDay
    ? formatter.format(start)
    : `${formatter.format(start)} → ${formatter.format(end)}`;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
      <div className={cn("h-9 w-1 rounded-full", meta.swatch)} />
      <div
        role="button"
        tabIndex={0}
        onClick={onView}
        onKeyDown={(e) => (e.key === "Enter" ? onView() : null)}
        className="min-w-0 flex-1 cursor-pointer"
      >
        <div className="truncate text-sm font-semibold">{event.title}</div>
        <div className="truncate text-xs text-muted-foreground">
          {dateLabel}
          {event.description ? ` · ${event.description}` : ""}
        </div>
      </div>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
          meta.bg,
          meta.text,
        )}
      >
        {meta.label}
      </span>
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={`Edit ${event.title}`}
        onClick={onEdit}
      >
        <Edit3 className="size-4" />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={`Delete ${event.title}`}
        disabled={disabledDelete}
        onClick={onDelete}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-3 text-xs">
      <span className="font-semibold text-muted-foreground">Categories</span>
      {CALENDAR_EVENT_TYPES.map((type) => {
        const meta = EVENT_TYPE_META[type];
        return (
          <div key={type} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm", meta.swatch)} />
            <span className="text-muted-foreground">{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MetricTile({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "info" | "warning" | "rose";
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "grid size-8 place-items-center rounded-md",
            tone === "success"
              ? "bg-emerald-100 text-emerald-700"
              : tone === "info"
                ? "bg-sky-100 text-sky-700"
                : tone === "warning"
                  ? "bg-amber-100 text-amber-700"
                  : tone === "rose"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-brand-100 text-brand-700",
          )}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold leading-none">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
