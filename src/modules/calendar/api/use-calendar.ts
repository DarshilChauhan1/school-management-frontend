"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";

import {
  createCalendarEvent,
  deleteCalendarEvent,
  fetchCalendarEvents,
  updateCalendarEvent,
} from "./calendar.api";
import { calendarKeys } from "./calendar.keys";
import type {
  CalendarListParams,
  CreateCalendarEventPayload,
  UpdateCalendarEventPayload,
} from "./calendar.types";

export function useCalendarEvents(params: CalendarListParams = {}) {
  return useQuery({
    queryKey: calendarKeys.list(params),
    queryFn: () => fetchCalendarEvents(params),
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCalendarEventPayload) =>
      createCalendarEvent(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success(message ?? "Event created");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not create event");
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateCalendarEventPayload;
    }) => updateCalendarEvent(id, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success(message ?? "Event updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update event");
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCalendarEvent(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success(message ?? "Event deleted");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not delete event");
    },
  });
}
