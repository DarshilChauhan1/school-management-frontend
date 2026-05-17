import { z } from "zod";

export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  description: z
    .string()
    .trim()
    .max(400, "Description is too long")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type RoleFormSchema = z.infer<typeof roleSchema>;

export const roleDefaults: RoleFormSchema = {
  name: "",
  description: "",
  isActive: true,
};
