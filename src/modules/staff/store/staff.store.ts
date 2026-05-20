import { create } from "zustand";

import type { StaffItem } from "../api/staff.types";

interface StaffUIState {
  isFormOpen: boolean;
  editing: StaffItem | null;
  viewing: StaffItem | null;
}

interface StaffUIActions {
  openCreate: () => void;
  openEdit: (staff: StaffItem) => void;
  openView: (staff: StaffItem) => void;
  closeForm: () => void;
  closeView: () => void;
}

type StaffStore = StaffUIState & StaffUIActions;

export const useStaffStore = create<StaffStore>((set) => ({
  isFormOpen: false,
  editing: null,
  viewing: null,

  openCreate: () => set({ isFormOpen: true, editing: null }),
  openEdit: (staff) => set({ isFormOpen: true, editing: staff }),
  openView: (staff) => set({ viewing: staff }),
  closeForm: () => set({ isFormOpen: false, editing: null }),
  closeView: () => set({ viewing: null }),
}));
