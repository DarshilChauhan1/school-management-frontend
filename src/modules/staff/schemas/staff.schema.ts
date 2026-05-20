import { z } from "zod";

import { STAFF_EMPLOYMENT_TYPES } from "../api/staff.types";

export const staffSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(80, "Too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(80, "Too long"),
  email: z.string().trim().email("Enter a valid email"),
  roleId: z.string().min(1, "Role is required"),
  designation: z
    .string()
    .trim()
    .max(120, "Too long")
    .optional()
    .or(z.literal("")),
  joiningDate: z.string().trim().optional().or(z.literal("")),
  employmentType: z.enum(STAFF_EMPLOYMENT_TYPES).optional(),
  employeeCode: z
    .string()
    .trim()
    .max(40, "Too long")
    .optional()
    .or(z.literal("")),
  qualification: z
    .string()
    .trim()
    .max(200, "Too long")
    .optional()
    .or(z.literal("")),
  specializations: z
    .string()
    .trim()
    .max(300, "Too long")
    .optional()
    .or(z.literal("")),
  departmentId: z.string().optional().or(z.literal("")),
});

export type StaffFormSchema = z.infer<typeof staffSchema>;

export const staffDefaults: StaffFormSchema = {
  firstName: "",
  lastName: "",
  email: "",
  roleId: "",
  designation: "",
  joiningDate: "",
  employmentType: "FULL_TIME",
  employeeCode: "",
  qualification: "",
  specializations: "",
  departmentId: "",
};

export const parseSpecializations = (value?: string): string[] | undefined => {
  if (!value) return undefined;
  const list = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
};
