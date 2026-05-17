import { z } from "zod";

import { MEDIUM_OF_INSTRUCTION } from "../constants/medium";

const optionalIntInRange = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value) return true;
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= min && parsed <= max;
      },
      { message: `${label} must be between ${min} and ${max}` },
    );

export const sectionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Section name is required")
    .max(40, "Section name is too long"),
  capacity: optionalIntInRange(1, 200, "Capacity"),
  roomNumber: z
    .string()
    .trim()
    .max(40, "Room number is too long")
    .optional()
    .or(z.literal("")),
});

export type SectionFormSchema = z.infer<typeof sectionSchema>;

export const classSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Class name is required")
      .max(80, "Class name is too long"),
    level: optionalIntInRange(1, 20, "Level"),
    description: z
      .string()
      .trim()
      .max(400, "Description is too long")
      .optional()
      .or(z.literal("")),
    academicYearId: z.string().min(1, "Academic year is required"),
    departmentId: z.string().optional().or(z.literal("")),
    mediumOfInstruction: z.enum(MEDIUM_OF_INSTRUCTION, {
      message: "Select a medium of instruction",
    }),
    customMedium: z
      .string()
      .trim()
      .max(40, "Custom medium is too long")
      .optional()
      .or(z.literal("")),
    isActive: z.boolean().optional(),
    sections: z.array(sectionSchema).optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.mediumOfInstruction === "OTHER" &&
      !values.customMedium?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customMedium"],
        message: "Enter the medium name",
      });
    }
  });

export type ClassFormSchema = z.infer<typeof classSchema>;

export const classDefaults: ClassFormSchema = {
  name: "",
  level: "",
  description: "",
  academicYearId: "",
  departmentId: "",
  mediumOfInstruction: "ENGLISH",
  customMedium: "",
  isActive: true,
  sections: [],
};

export const parseOptionalInt = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
