import { create } from "zustand";

import type { SubjectItem } from "@/modules/subject/api/subject.types";

interface ClassSubjectUIState {
  isLinkOpen: boolean;
  /** Optional subject to preselect when the dialog opens */
  prefillSubject: SubjectItem | null;
}

interface ClassSubjectUIActions {
  openLink: (subject?: SubjectItem) => void;
  closeLink: () => void;
}

type ClassSubjectStore = ClassSubjectUIState & ClassSubjectUIActions;

export const useClassSubjectStore = create<ClassSubjectStore>((set) => ({
  isLinkOpen: false,
  prefillSubject: null,

  openLink: (subject) =>
    set({ isLinkOpen: true, prefillSubject: subject ?? null }),
  closeLink: () => set({ isLinkOpen: false, prefillSubject: null }),
}));
