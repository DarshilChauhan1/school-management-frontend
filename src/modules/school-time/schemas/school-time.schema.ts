import { z } from "zod";

import { DAYS } from "../constants/days";

const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const optionalTime = z.string().optional().or(z.literal(""));

const assertWindow = (
  ctx: z.RefinementCtx,
  start: string | undefined,
  end: string | undefined,
  path: string,
  message: string,
) => {
  if (start && end && end <= start) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
  }
};

const dayConfigSchema = z
  .object({
    dayOfWeek: dayOfWeekEnum,
    isWorkingDay: z.boolean(),
    startTime: optionalTime,
    endTime: optionalTime,
    assemblyStartTime: optionalTime,
    assemblyEndTime: optionalTime,
    recessStartTime: optionalTime,
    recessEndTime: optionalTime,
  })
  .superRefine((day, ctx) => {
    if (!day.isWorkingDay) return;
    if (!day.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Required",
      });
    }
    if (!day.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "Required",
      });
    }
    assertWindow(ctx, day.startTime, day.endTime, "endTime", "End must be after start");
    assertWindow(
      ctx,
      day.assemblyStartTime,
      day.assemblyEndTime,
      "assemblyEndTime",
      "End must be after start",
    );
    assertWindow(
      ctx,
      day.recessStartTime,
      day.recessEndTime,
      "recessEndTime",
      "End must be after start",
    );
  });

export const schoolTimeSchema = z.object({
  academicYearId: z.string().min(1, "Select an academic year"),
  days: z.array(dayConfigSchema).min(1).max(7),
});

export type SchoolTimeFormSchema = z.infer<typeof schoolTimeSchema>;

export const schoolTimeDefaults: SchoolTimeFormSchema = {
  academicYearId: "",
  days: DAYS.map((d) => ({
    dayOfWeek: d.value,
    isWorkingDay: d.defaultWorking,
    startTime: d.defaultWorking ? "08:00" : "",
    endTime: d.defaultWorking ? "15:00" : "",
    assemblyStartTime: "",
    assemblyEndTime: "",
    recessStartTime: "",
    recessEndTime: "",
  })),
};
