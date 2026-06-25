import { create } from "zustand";

import type { AcademicYearItem } from "@/modules/academic-year/api/academic-year.types";
import type { CalendarEventItem } from "@/modules/calendar/api/calendar.types";
import type { ClassItem } from "@/modules/class/api/class.types";
import type { DepartmentSummary } from "@/modules/department/api/department.types";
import type { RoleItem } from "@/modules/role/api/role.types";
import type { SchoolTimeConfigurationSet } from "@/modules/school-time/api/school-time.types";
import type { StaffItem } from "@/modules/staff/api/staff.types";
import type { GuardianItem, StudentItem } from "@/modules/student/api/student.types";
import type { SubjectItem } from "@/modules/subject/api/subject.types";

/**
 * Common UI state for the create / edit / view dialog pattern shared by every
 * resource dashboard. Server data is owned by TanStack Query — this only tracks
 * which dialog is open and which row it targets.
 *
 * - `TEntity`    the row type the form/view dialogs operate on
 * - `TPrefill`   optional payload carried into "create" (e.g. a prefilled date)
 * - `TSecondary` optional payload for a module-specific extra dialog
 *                (e.g. staff "assign", student "guardian")
 */
export interface CrudDialogStore<TEntity, TPrefill = void, TSecondary = void> {
  isFormOpen: boolean;
  editing: TEntity | null;
  viewing: TEntity | null;
  prefill: TPrefill | null;
  secondary: TSecondary | null;

  openCreate: (prefill?: TPrefill) => void;
  openEdit: (item: TEntity) => void;
  openView: (item: TEntity) => void;
  openSecondary: (payload: TSecondary) => void;
  closeForm: () => void;
  closeView: () => void;
  closeSecondary: () => void;
}

/**
 * Builds a Zustand store implementing the shared CRUD-dialog contract.
 * Instantiate one per resource below — the implementation never varies.
 */
export function createCrudDialogStore<TEntity, TPrefill = void, TSecondary = void>() {
  return create<CrudDialogStore<TEntity, TPrefill, TSecondary>>((set) => ({
    isFormOpen: false,
    editing: null,
    viewing: null,
    prefill: null,
    secondary: null,

    openCreate: (prefill) =>
      set({ isFormOpen: true, editing: null, prefill: prefill ?? null }),
    openEdit: (item) => set({ isFormOpen: true, editing: item }),
    openView: (item) => set({ viewing: item }),
    openSecondary: (payload) => set({ secondary: payload }),
    closeForm: () => set({ isFormOpen: false, editing: null, prefill: null }),
    closeView: () => set({ viewing: null }),
    closeSecondary: () => set({ secondary: null }),
  }));
}

// Resource dialog stores — one instance per module, all sharing the contract above.
export const useRoleStore = createCrudDialogStore<RoleItem>();
export const useSubjectStore = createCrudDialogStore<SubjectItem>();
export const useDepartmentStore = createCrudDialogStore<DepartmentSummary>();
export const useClassStore = createCrudDialogStore<ClassItem>();
export const useAcademicYearStore = createCrudDialogStore<AcademicYearItem>();
export const useSchoolTimeStore =
  createCrudDialogStore<SchoolTimeConfigurationSet>();

/** Calendar carries a prefilled ISO date into "create" from day-cell clicks. */
export const useCalendarStore = createCrudDialogStore<CalendarEventItem, string>();

/** Class-subject only uses the form dialog (link), prefilled with a subject. */
export const useClassSubjectStore = createCrudDialogStore<SubjectItem, SubjectItem>();

/** Staff adds an "assign" dialog targeting a staff row. */
export const useStaffStore = createCrudDialogStore<StaffItem, void, StaffItem>();

/** Student adds a "guardian" dialog targeting a student (optionally editing one). */
export const useStudentStore = createCrudDialogStore<
  StudentItem,
  void,
  { student: StudentItem; guardian?: GuardianItem }
>();
