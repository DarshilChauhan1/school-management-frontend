import {
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  Eye,
  GraduationCap,
  Key,
  Layers,
  Pencil,
  Plus,
  Settings,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { PermissionAction } from "../api/permission.types";

export interface ActionMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Classes for the small icon chip when the action is granted. */
  chip: string;
}

/** Non-technical labels + icons for each permission action. */
export const ACTION_META: Record<PermissionAction, ActionMeta> = {
  read: {
    label: "View",
    description: "Can see records",
    icon: Eye,
    chip: "bg-sky-100 text-sky-700",
  },
  create: {
    label: "Add",
    description: "Can create new records",
    icon: Plus,
    chip: "bg-emerald-100 text-emerald-700",
  },
  update: {
    label: "Edit",
    description: "Can change existing records",
    icon: Pencil,
    chip: "bg-amber-100 text-amber-700",
  },
  delete: {
    label: "Delete",
    description: "Can remove records",
    icon: Trash2,
    chip: "bg-rose-100 text-rose-700",
  },
  manage: {
    label: "Full access",
    description: "Can do everything",
    icon: ShieldCheck,
    chip: "bg-violet-100 text-violet-700",
  },
};

export const ACTION_ORDER: PermissionAction[] = [
  "read",
  "create",
  "update",
  "delete",
  "manage",
];

const MODULE_ICONS: Record<string, LucideIcon> = {
  staff: Users,
  user: Users,
  users: Users,
  student: GraduationCap,
  students: GraduationCap,
  class: BookOpen,
  classes: BookOpen,
  subject: BookOpen,
  subjects: BookOpen,
  department: Building2,
  departments: Building2,
  school: Building2,
  calendar: CalendarDays,
  "academic-year": CalendarDays,
  attendance: ClipboardList,
  role: Shield,
  roles: Shield,
  permission: Key,
  permissions: Key,
  setting: Settings,
  settings: Settings,
};

/** Best-effort icon for a module/subject name, with a sensible fallback. */
export function getModuleIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Layers;
  const key = name.toLowerCase().trim();
  return MODULE_ICONS[key] ?? Layers;
}

/** Turn "academic_year" / "academic-year" into "Academic Year". */
export function humanizeLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
