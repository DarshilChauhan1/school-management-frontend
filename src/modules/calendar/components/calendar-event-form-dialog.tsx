"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Spinner } from "@/components/ui/spinner";
import { TextareaField } from "@/components/ui/textarea-field";

import { useAcademicYears } from "@/modules/academic-year/api/use-academic-years";

import {
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
} from "../api/use-calendar";
import type {
  CreateCalendarEventPayload,
  UpdateCalendarEventPayload,
} from "../api/calendar.types";
import { EVENT_TYPE_OPTIONS } from "../constants/event-type";
import {
  calendarEventDefaults,
  calendarEventSchema,
  type CalendarEventFormSchema,
} from "../schemas/calendar.schema";
import { useCalendarStore } from "../store/calendar.store";

const NO_ACADEMIC_YEAR = "__none__";

const toDateInputValue = (value: string): string => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const toPayload = (
  values: CalendarEventFormSchema,
): CreateCalendarEventPayload => ({
  title: values.title.trim(),
  description: values.description?.trim() || undefined,
  eventType: values.eventType,
  startDate: values.startDate,
  endDate: values.endDate,
  isFullDay: values.isFullDay,
  isPublic: values.isPublic,
  academicYearId:
    values.academicYearId && values.academicYearId !== NO_ACADEMIC_YEAR
      ? values.academicYearId
      : undefined,
});

export function CalendarEventFormDialog() {
  const isFormOpen = useCalendarStore((s) => s.isFormOpen);
  const editing = useCalendarStore((s) => s.editing);
  const prefillDate = useCalendarStore((s) => s.prefillDate);
  const closeForm = useCalendarStore((s) => s.closeForm);

  const isEditing = Boolean(editing);

  const academicYearsQuery = useAcademicYears({
    limit: 50,
    sortBy: "startDate",
    sortOrder: "desc",
  });

  const createMutation = useCreateCalendarEvent();
  const updateMutation = useUpdateCalendarEvent();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const methods = useForm<CalendarEventFormSchema>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: calendarEventDefaults,
  });

  useEffect(() => {
    if (!isFormOpen) return;

    if (editing) {
      methods.reset({
        title: editing.title,
        description: editing.description ?? "",
        eventType: editing.eventType,
        startDate: toDateInputValue(editing.startDate),
        endDate: toDateInputValue(editing.endDate),
        isFullDay: editing.isFullDay,
        isPublic: editing.isPublic,
        academicYearId: editing.academicYearId ?? "",
      });
      return;
    }

    methods.reset({
      ...calendarEventDefaults,
      startDate: prefillDate ?? "",
      endDate: prefillDate ?? "",
    });
  }, [editing, isFormOpen, methods, prefillDate]);

  const academicYearOptions = useMemo(() => {
    const list = academicYearsQuery.data?.data.data ?? [];
    return [
      { label: "Not scoped to a year", value: NO_ACADEMIC_YEAR },
      ...list.map((y) => ({
        label: `${y.name}${y.isCurrent ? " · Current" : ""}`,
        value: y.id,
      })),
    ];
  }, [academicYearsQuery.data]);

  const onSubmit = (values: CalendarEventFormSchema) => {
    const onSuccess = () => closeForm();
    const payload = toPayload(values);

    if (editing) {
      const body: UpdateCalendarEventPayload = payload;
      updateMutation.mutate({ id: editing.id, body }, { onSuccess });
      return;
    }
    createMutation.mutate(payload, { onSuccess });
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit event" : "New calendar event"}
          </DialogTitle>
          <DialogDescription>
            Holidays, exams, PTMs, sports days — anything that should appear on
            the school calendar.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            className="space-y-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormField<CalendarEventFormSchema>
              name="title"
              label="Title"
              placeholder="Diwali Holiday"
            />

            <SelectField<CalendarEventFormSchema>
              name="eventType"
              label="Event type"
              options={EVENT_TYPE_OPTIONS}
              placeholder="Select type"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField<CalendarEventFormSchema>
                name="startDate"
                label="Start date"
                type="date"
              />
              <FormField<CalendarEventFormSchema>
                name="endDate"
                label="End date"
                type="date"
              />
            </div>

            <SelectField<CalendarEventFormSchema>
              name="academicYearId"
              label="Academic year"
              placeholder={
                academicYearsQuery.isLoading
                  ? "Loading…"
                  : "Optional — pick a year"
              }
              options={academicYearOptions}
              disabled={academicYearsQuery.isLoading}
            />

            <TextareaField<CalendarEventFormSchema>
              name="description"
              label="Description"
              placeholder="Optional notes shown to staff and parents"
              maxLength={1000}
              rows={3}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <CheckboxField<CalendarEventFormSchema>
                name="isFullDay"
                label="Full-day event"
                description="Uncheck for partial-day events."
              />
              <CheckboxField<CalendarEventFormSchema>
                name="isPublic"
                label="Visible to parents"
                description="Public events appear on the parent portal."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : null}
                {isEditing ? "Save changes" : "Create event"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
