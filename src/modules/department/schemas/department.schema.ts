import { z } from "zod";

export const departmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  code: z
    .string()
    .trim()
    .max(24, "Code is too long")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type DepartmentFormSchema = z.infer<typeof departmentSchema>;

export const departmentDefaults: DepartmentFormSchema = {
  name: "",
  code: "",
  description: "",
  parentId: "",
  isActive: true,
};
