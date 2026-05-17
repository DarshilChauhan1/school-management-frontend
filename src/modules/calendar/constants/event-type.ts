export const CALENDAR_EVENT_TYPES = [
  "HOLIDAY",
  "EXAM",
  "SPORTS_DAY",
  "PARENT_TEACHER_MEETING",
  "RESULT_DAY",
  "CULTURAL_EVENT",
  "SCHOOL_TRIP",
  "WORKING_SATURDAY",
  "OTHER",
] as const;

export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];

interface EventTypeMeta {
  label: string;
  /** Tailwind background class used in the calendar grid */
  bg: string;
  /** Tailwind text class used in the calendar grid */
  text: string;
  /** Tailwind dot/swatch class for the legend */
  swatch: string;
}

export const EVENT_TYPE_META: Record<CalendarEventType, EventTypeMeta> = {
  HOLIDAY: {
    label: "Holiday",
    bg: "bg-rose-100",
    text: "text-rose-700",
    swatch: "bg-rose-500",
  },
  EXAM: {
    label: "Exam",
    bg: "bg-amber-100",
    text: "text-amber-700",
    swatch: "bg-amber-500",
  },
  SPORTS_DAY: {
    label: "Sports day",
    bg: "bg-sky-100",
    text: "text-sky-700",
    swatch: "bg-sky-500",
  },
  PARENT_TEACHER_MEETING: {
    label: "PTM",
    bg: "bg-violet-100",
    text: "text-violet-700",
    swatch: "bg-violet-500",
  },
  RESULT_DAY: {
    label: "Results",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    swatch: "bg-emerald-500",
  },
  CULTURAL_EVENT: {
    label: "Cultural",
    bg: "bg-pink-100",
    text: "text-pink-700",
    swatch: "bg-pink-500",
  },
  SCHOOL_TRIP: {
    label: "Trip",
    bg: "bg-teal-100",
    text: "text-teal-700",
    swatch: "bg-teal-500",
  },
  WORKING_SATURDAY: {
    label: "Working Sat",
    bg: "bg-slate-100",
    text: "text-slate-700",
    swatch: "bg-slate-500",
  },
  OTHER: {
    label: "Other",
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    swatch: "bg-zinc-500",
  },
};

export const EVENT_TYPE_OPTIONS = CALENDAR_EVENT_TYPES.map((value) => ({
  label: EVENT_TYPE_META[value].label,
  value,
}));
