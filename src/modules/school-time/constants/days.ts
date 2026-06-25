import type { DayOfWeek } from "../api/school-time.types";

export interface DayMeta {
  value: DayOfWeek;
  label: string;
  short: string;
  /** Sensible default for whether the day is a working day. */
  defaultWorking: boolean;
}

export const DAYS: DayMeta[] = [
  { value: "MONDAY", label: "Monday", short: "Mon", defaultWorking: true },
  { value: "TUESDAY", label: "Tuesday", short: "Tue", defaultWorking: true },
  {
    value: "WEDNESDAY",
    label: "Wednesday",
    short: "Wed",
    defaultWorking: true,
  },
  { value: "THURSDAY", label: "Thursday", short: "Thu", defaultWorking: true },
  { value: "FRIDAY", label: "Friday", short: "Fri", defaultWorking: true },
  { value: "SATURDAY", label: "Saturday", short: "Sat", defaultWorking: false },
  { value: "SUNDAY", label: "Sunday", short: "Sun", defaultWorking: false },
];

export const dayLabel = (value: DayOfWeek): string =>
  DAYS.find((d) => d.value === value)?.label ?? value;
