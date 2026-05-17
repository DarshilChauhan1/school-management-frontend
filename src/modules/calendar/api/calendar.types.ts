import type { ApiResponse } from "@/types/api";

import type { CalendarEventType } from "../constants/event-type";

export interface CalendarEventItem {
  id: string;
  schoolId: string;
  academicYearId: string | null;
  title: string;
  description: string | null;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  isFullDay: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CalendarListData {
  data: CalendarEventItem[];
  pagination: CalendarPagination;
}

export interface CalendarListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  academicYearId?: string;
  eventType?: CalendarEventType;
  from?: string;
  to?: string;
}

export interface CreateCalendarEventPayload {
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  isFullDay?: boolean;
  isPublic?: boolean;
  academicYearId?: string;
}

export type UpdateCalendarEventPayload = Partial<CreateCalendarEventPayload>;

export type CalendarListResponse = ApiResponse<CalendarListData>;
export type CalendarEventResponse = ApiResponse<CalendarEventItem>;
export type DeleteCalendarEventResponse = ApiResponse<{ id: string }>;
