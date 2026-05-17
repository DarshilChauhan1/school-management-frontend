import type { CalendarListParams } from "./calendar.types";

export const calendarKeys = {
  all: ["calendar"] as const,
  lists: () => [...calendarKeys.all, "list"] as const,
  list: (params: CalendarListParams) =>
    [...calendarKeys.lists(), params] as const,
  detail: (id: string) => [...calendarKeys.all, "detail", id] as const,
};
