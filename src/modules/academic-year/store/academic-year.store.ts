import { create } from "zustand";

import type { AcademicYearItem } from "../api/academic-year.types";

interface AcademicYearUIState {
  isFormOpen: boolean;
  editing: AcademicYearItem | null;
  viewing: AcademicYearItem | null;
}

interface AcademicYearUIActions {
  openCreate: () => void;
  openEdit: (year: AcademicYearItem) => void;
  openView: (year: AcademicYearItem) => void;
  closeForm: () => void;
  closeView: () => void;
}

type AcademicYearStore = AcademicYearUIState & AcademicYearUIActions;

export const useAcademicYearStore = create<AcademicYearStore>((set) => ({
  isFormOpen: false,
  editing: null,
  viewing: null,

  openCreate: () => set({ isFormOpen: true, editing: null }),
  openEdit: (year) => set({ isFormOpen: true, editing: year }),
  openView: (year) => set({ viewing: year }),
  closeForm: () => set({ isFormOpen: false, editing: null }),
  closeView: () => set({ viewing: null }),
}));
