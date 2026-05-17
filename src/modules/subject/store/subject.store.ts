import { create } from "zustand";

import type { SubjectItem } from "../api/subject.types";

interface SubjectUIState {
  isFormOpen: boolean;
  editing: SubjectItem | null;
  viewing: SubjectItem | null;
}

interface SubjectUIActions {
  openCreate: () => void;
  openEdit: (subject: SubjectItem) => void;
  openView: (subject: SubjectItem) => void;
  closeForm: () => void;
  closeView: () => void;
}

type SubjectStore = SubjectUIState & SubjectUIActions;

export const useSubjectStore = create<SubjectStore>((set) => ({
  isFormOpen: false,
  editing: null,
  viewing: null,

  openCreate: () => set({ isFormOpen: true, editing: null }),
  openEdit: (subject) => set({ isFormOpen: true, editing: subject }),
  openView: (subject) => set({ viewing: subject }),
  closeForm: () => set({ isFormOpen: false, editing: null }),
  closeView: () => set({ viewing: null }),
}));
