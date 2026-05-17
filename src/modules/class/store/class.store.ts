import { create } from "zustand";

import type { ClassItem } from "../api/class.types";

interface ClassUIState {
  isFormOpen: boolean;
  editingClass: ClassItem | null;
  viewingClass: ClassItem | null;
}

interface ClassUIActions {
  openCreate: () => void;
  openEdit: (cls: ClassItem) => void;
  openView: (cls: ClassItem) => void;
  closeForm: () => void;
  closeView: () => void;
}

type ClassStore = ClassUIState & ClassUIActions;

export const useClassStore = create<ClassStore>((set) => ({
  isFormOpen: false,
  editingClass: null,
  viewingClass: null,

  openCreate: () => set({ isFormOpen: true, editingClass: null }),
  openEdit: (cls) => set({ isFormOpen: true, editingClass: cls }),
  openView: (cls) => set({ viewingClass: cls }),
  closeForm: () => set({ isFormOpen: false, editingClass: null }),
  closeView: () => set({ viewingClass: null }),
}));
