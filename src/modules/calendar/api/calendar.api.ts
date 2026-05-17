import { http } from "@/lib/api-client";
import type {
  CalendarEventResponse,
  CalendarListParams,
  CalendarListResponse,
  CreateCalendarEventPayload,
  DeleteCalendarEventResponse,
  UpdateCalendarEventPayload,
} from "./calendar.types";

const toQueryString = (params: CalendarListParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchCalendarEvents = (params: CalendarListParams = {}) =>
  http.get<CalendarListResponse>(`/calendar${toQueryString(params)}`);

export const fetchCalendarEvent = (id: string) =>
  http.get<CalendarEventResponse>(`/calendar/${id}`);

export const createCalendarEvent = (body: CreateCalendarEventPayload) =>
  http.post<CreateCalendarEventPayload, CalendarEventResponse>(
    "/calendar",
    body,
  );

export const updateCalendarEvent = (
  id: string,
  body: UpdateCalendarEventPayload,
) =>
  http.patch<UpdateCalendarEventPayload, CalendarEventResponse>(
    `/calendar/${id}`,
    body,
  );

export const deleteCalendarEvent = (id: string) =>
  http.delete<DeleteCalendarEventResponse>(`/calendar/${id}`);
