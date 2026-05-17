import { z } from "zod";

export const subjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Subject name is required")
    .max(120, "Name is too long"),
  code: z
    .string()
    .trim()
    .max(30, "Code is too long")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
  departmentId: z.string().optional().or(z.literal("")),
  classId: z.string().optional().or(z.literal("")),
  isElective: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type SubjectFormSchema = z.infer<typeof subjectSchema>;

export const subjectDefaults: SubjectFormSchema = {
  name: "",
  code: "",
  description: "",
  departmentId: "",
  classId: "",
  isElective: false,
  isActive: true,
};
