import { create } from "zustand";

import type { CalendarEventItem } from "../api/calendar.types";

interface CalendarUIState {
  isFormOpen: boolean;
  editing: CalendarEventItem | null;
  viewing: CalendarEventItem | null;
  /** Optional date to prefill in the form when opened from a day cell */
  prefillDate: string | null;
}

interface CalendarUIActions {
  openCreate: (prefillDate?: string) => void;
  openEdit: (event: CalendarEventItem) => void;
  openView: (event: CalendarEventItem) => void;
  closeForm: () => void;
  closeView: () => void;
}

type CalendarStore = CalendarUIState & CalendarUIActions;

export const useCalendarStore = create<CalendarStore>((set) => ({
  isFormOpen: false,
  editing: null,
  viewing: null,
  prefillDate: null,

  openCreate: (prefillDate) =>
    set({ isFormOpen: true, editing: null, prefillDate: prefillDate ?? null }),
  openEdit: (event) =>
    set({ isFormOpen: true, editing: event, prefillDate: null }),
  openView: (event) => set({ viewing: event }),
  closeForm: () =>
    set({ isFormOpen: false, editing: null, prefillDate: null }),
  closeView: () => set({ viewing: null }),
}));
