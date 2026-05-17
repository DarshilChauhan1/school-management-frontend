import { z } from "zod";

import { CALENDAR_EVENT_TYPES } from "../constants/event-type";

const isoDate = z
  .string()
  .trim()
  .min(1, "Required")
  .refine(
    (value) => !Number.isNaN(new Date(value).getTime()),
    "Enter a valid date",
  );

export const calendarEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title is too long"),
    description: z
      .string()
      .trim()
      .max(1000, "Description is too long")
      .optional()
      .or(z.literal("")),
    eventType: z.enum(CALENDAR_EVENT_TYPES, {
      message: "Pick an event type",
    }),
    startDate: isoDate,
    endDate: isoDate,
    isFullDay: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    academicYearId: z.string().optional().or(z.literal("")),
  })
  .refine(
    (values) => new Date(values.endDate) >= new Date(values.startDate),
    {
      path: ["endDate"],
      message: "End date must be the same as or after start date",
    },
  );

export type CalendarEventFormSchema = z.infer<typeof calendarEventSchema>;

export const calendarEventDefaults: CalendarEventFormSchema = {
  title: "",
  description: "",
  eventType: "HOLIDAY",
  startDate: "",
  endDate: "",
  isFullDay: true,
  isPublic: true,
  academicYearId: "",
};
