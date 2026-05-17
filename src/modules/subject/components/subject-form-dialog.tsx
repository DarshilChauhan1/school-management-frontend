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

import { useDepartments } from "@/modules/department/api/use-departments";

import {
  useCreateSubject,
  useUpdateSubject,
} from "../api/use-subjects";
import type {
  CreateSubjectPayload,
  UpdateSubjectPayload,
} from "../api/subject.types";
import {
  subjectDefaults,
  subjectSchema,
  type SubjectFormSchema,
} from "../schemas/subject.schema";
import { useSubjectStore } from "../store/subject.store";

const NO_VALUE = "__none__";

const toPayload = (values: SubjectFormSchema): CreateSubjectPayload => ({
  name: values.name.trim(),
  code: values.code?.trim() || undefined,
  description: values.description?.trim() || undefined,
  departmentId:
    values.departmentId && values.departmentId !== NO_VALUE
      ? values.departmentId
      : undefined,
  isElective: values.isElective,
});

export function SubjectFormDialog() {
  const isFormOpen = useSubjectStore((s) => s.isFormOpen);
  const editing = useSubjectStore((s) => s.editing);
  const closeForm = useSubjectStore((s) => s.closeForm);

  const isEditing = Boolean(editing);

  const departmentsQuery = useDepartments({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
    isActive: true,
  });

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const methods = useForm<SubjectFormSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: subjectDefaults,
  });

  useEffect(() => {
    if (!isFormOpen) return;

    if (editing) {
      methods.reset({
        name: editing.name,
        code: editing.code ?? "",
        description: editing.description ?? "",
        departmentId: editing.departmentId ?? "",
        classId: "",
        isElective: editing.isElective,
        isActive: editing.isActive,
      });
      return;
    }

    methods.reset(subjectDefaults);
  }, [editing, isFormOpen, methods]);

  const departmentOptions = useMemo(() => {
    const list = departmentsQuery.data?.data.data ?? [];
    return [
      { label: "No department", value: NO_VALUE },
      ...list.map((d) => ({
        label: d.code ? `${d.name} (${d.code})` : d.name,
        value: d.id,
      })),
    ];
  }, [departmentsQuery.data]);


  const onSubmit = (values: SubjectFormSchema) => {
    const onSuccess = () => closeForm();
    if (editing) {
      const body: UpdateSubjectPayload = {
        ...toPayload(values),
        isActive: values.isActive,
      };
      updateMutation.mutate({ id: editing.id, body }, { onSuccess });
      return;
    }
    createMutation.mutate(toPayload(values), { onSuccess });
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit subject" : "New subject"}
          </DialogTitle>
          <DialogDescription>
            Subjects optionally belong to a department and/or a specific class.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            className="space-y-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <FormField<SubjectFormSchema>
                name="name"
                label="Name"
                placeholder="Mathematics"
              />
              <FormField<SubjectFormSchema>
                name="code"
                label="Code"
                placeholder="MATH101"
              />
            </div>

            <SelectField<SubjectFormSchema>
              name="departmentId"
              label="Department"
              placeholder={
                departmentsQuery.isLoading ? "Loading…" : "Select department"
              }
              options={departmentOptions}
              disabled={departmentsQuery.isLoading}
            />

            <TextareaField<SubjectFormSchema>
              name="description"
              label="Description"
              placeholder="Optional notes — curriculum focus, lab requirements, etc."
              maxLength={500}
              rows={3}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <CheckboxField<SubjectFormSchema>
                name="isElective"
                label="Elective subject"
                description="Students can opt in instead of being auto-enrolled."
              />
              {isEditing ? (
                <CheckboxField<SubjectFormSchema>
                  name="isActive"
                  label="Active subject"
                  description="Inactive subjects are hidden from timetables."
                />
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : null}
                {isEditing ? "Save changes" : "Create subject"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
