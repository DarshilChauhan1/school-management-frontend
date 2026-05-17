import { create } from "zustand";

import type { DepartmentSummary } from "../api/department.types";

interface DepartmentUIState {
  isFormOpen: boolean;
  editingDepartment: DepartmentSummary | null;
  viewingDepartment: DepartmentSummary | null;
}

interface DepartmentUIActions {
  openCreate: () => void;
  openEdit: (department: DepartmentSummary) => void;
  openView: (department: DepartmentSummary) => void;
  closeForm: () => void;
  closeView: () => void;
}

type DepartmentStore = DepartmentUIState & DepartmentUIActions;

export const useDepartmentStore = create<DepartmentStore>((set) => ({
  isFormOpen: false,
  editingDepartment: null,
  viewingDepartment: null,

  openCreate: () => set({ isFormOpen: true, editingDepartment: null }),
  openEdit: (department) =>
    set({ isFormOpen: true, editingDepartment: department }),
  openView: (department) => set({ viewingDepartment: department }),
  closeForm: () => set({ isFormOpen: false, editingDepartment: null }),
  closeView: () => set({ viewingDepartment: null }),
}));
