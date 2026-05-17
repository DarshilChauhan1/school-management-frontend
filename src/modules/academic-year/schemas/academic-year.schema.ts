import { z } from "zod";

const isoDate = z
  .string()
  .trim()
  .min(1, "Required")
  .refine(
    (value) => !Number.isNaN(new Date(value).getTime()),
    "Enter a valid date",
  );

export const academicYearSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(20, "Name is too long"),
    startDate: isoDate,
    endDate: isoDate,
    isCurrent: z.boolean().optional(),
  })
  .refine(
    (values) => new Date(values.endDate) > new Date(values.startDate),
    {
      path: ["endDate"],
      message: "End date must be after start date",
    },
  );

export type AcademicYearFormSchema = z.infer<typeof academicYearSchema>;

export const academicYearDefaults: AcademicYearFormSchema = {
  name: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
};
