import { create } from "zustand";

import type { RoleItem } from "../api/role.types";

interface RoleUIState {
  isFormOpen: boolean;
  editing: RoleItem | null;
  viewing: RoleItem | null;
}

interface RoleUIActions {
  openCreate: () => void;
  openEdit: (role: RoleItem) => void;
  openView: (role: RoleItem) => void;
  closeForm: () => void;
  closeView: () => void;
}

type RoleStore = RoleUIState & RoleUIActions;

export const useRoleStore = create<RoleStore>((set) => ({
  isFormOpen: false,
  editing: null,
  viewing: null,

  openCreate: () => set({ isFormOpen: true, editing: null }),
  openEdit: (role) => set({ isFormOpen: true, editing: role }),
  openView: (role) => set({ viewing: role }),
  closeForm: () => set({ isFormOpen: false, editing: null }),
  closeView: () => set({ viewing: null }),
}));
