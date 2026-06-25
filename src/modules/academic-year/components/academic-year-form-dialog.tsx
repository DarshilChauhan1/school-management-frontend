"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { Spinner } from "@/components/ui/spinner";

import {
  useCreateAcademicYear,
  useUpdateAcademicYear,
} from "../api/use-academic-years";
import type {
  CreateAcademicYearPayload,
  UpdateAcademicYearPayload,
} from "../api/academic-year.types";
import {
  academicYearDefaults,
  academicYearSchema,
  type AcademicYearFormSchema,
} from "../schemas/academic-year.schema";
import { useAcademicYearStore } from "@/stores/dialog-store";

const toDateInputValue = (value: string): string => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const toPayload = (
  values: AcademicYearFormSchema,
): CreateAcademicYearPayload => ({
  name: values.name.trim(),
  startDate: values.startDate,
  endDate: values.endDate,
  isCurrent: values.isCurrent,
});

export function AcademicYearFormDialog() {
  const isFormOpen = useAcademicYearStore((s) => s.isFormOpen);
  const editing = useAcademicYearStore((s) => s.editing);
  const closeForm = useAcademicYearStore((s) => s.closeForm);

  const isEditing = Boolean(editing);

  const createMutation = useCreateAcademicYear();
  const updateMutation = useUpdateAcademicYear();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const methods = useForm<AcademicYearFormSchema>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: academicYearDefaults,
  });

  useEffect(() => {
    if (!isFormOpen) return;

    if (editing) {
      methods.reset({
        name: editing.name,
        startDate: toDateInputValue(editing.startDate),
        endDate: toDateInputValue(editing.endDate),
        isCurrent: editing.isCurrent,
      });
      return;
    }

    methods.reset(academicYearDefaults);
  }, [editing, isFormOpen, methods]);

  const onSubmit = (values: AcademicYearFormSchema) => {
    const onSuccess = () => closeForm();
    const payload = toPayload(values);

    if (editing) {
      const body: UpdateAcademicYearPayload = payload;
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
            {isEditing ? "Edit academic year" : "New academic year"}
          </DialogTitle>
          <DialogDescription>
            Academic years scope classes, timetables, and student rosters.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            className="space-y-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormField<AcademicYearFormSchema>
              name="name"
              label="Name"
              placeholder="2025-26"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField<AcademicYearFormSchema>
                name="startDate"
                label="Start date"
                type="date"
              />
              <FormField<AcademicYearFormSchema>
                name="endDate"
                label="End date"
                type="date"
              />
            </div>

            <CheckboxField<AcademicYearFormSchema>
              name="isCurrent"
              label="Set as current academic year"
              description="Replaces the existing current year. Optional."
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : null}
                {isEditing ? "Save changes" : "Create academic year"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
