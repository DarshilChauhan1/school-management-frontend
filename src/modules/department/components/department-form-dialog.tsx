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

import {
  useCreateDepartment,
  useDepartments,
  useUpdateDepartment,
} from "../api/use-departments";
import type { DepartmentFormValues } from "../api/department.types";
import {
  departmentDefaults,
  departmentSchema,
  type DepartmentFormSchema,
} from "../schemas/department.schema";
import { useDepartmentStore } from "@/stores/dialog-store";

const NO_PARENT_VALUE = "__none__";

const toApiPayload = (values: DepartmentFormSchema): DepartmentFormValues => ({
  name: values.name.trim(),
  code: values.code?.trim() || undefined,
  description: values.description?.trim() || undefined,
  parentId:
    values.parentId && values.parentId !== NO_PARENT_VALUE
      ? values.parentId
      : undefined,
  isActive: values.isActive,
});

export function DepartmentFormDialog() {
  const isFormOpen = useDepartmentStore((state) => state.isFormOpen);
  const editingDepartment = useDepartmentStore(
    (state) => state.editing,
  );
  const closeForm = useDepartmentStore((state) => state.closeForm);

  const parentsQuery = useDepartments({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
    isActive: true,
  });
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();

  const isEditing = Boolean(editingDepartment);
  const isSaving = createDepartment.isPending || updateDepartment.isPending;

  const methods = useForm<DepartmentFormSchema>({
    resolver: zodResolver(departmentSchema),
    defaultValues: departmentDefaults,
  });

  useEffect(() => {
    if (!isFormOpen) return;

    methods.reset(
      editingDepartment
        ? {
            name: editingDepartment.name,
            code: editingDepartment.code ?? "",
            description: editingDepartment.description ?? "",
            parentId: editingDepartment.parentId ?? "",
            isActive: editingDepartment.isActive,
          }
        : departmentDefaults,
    );
  }, [editingDepartment, isFormOpen, methods]);

  const parentOptions = useMemo(() => {
    const list = parentsQuery.data?.data.data ?? [];
    return [
      { label: "No parent", value: NO_PARENT_VALUE },
      ...list
        .filter((department) => department.id !== editingDepartment?.id)
        .map((department) => ({
          label: department.code
            ? `${department.name} (${department.code})`
            : department.name,
          value: department.id,
        })),
    ];
  }, [editingDepartment?.id, parentsQuery.data]);

  const onSubmit = (values: DepartmentFormSchema) => {
    const payload = toApiPayload(values);
    const onSuccess = () => closeForm();

    if (editingDepartment) {
      updateDepartment.mutate(
        { id: editingDepartment.id, body: payload },
        { onSuccess },
      );
      return;
    }

    createDepartment.mutate(payload, { onSuccess });
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit department" : "New department"}
          </DialogTitle>
          <DialogDescription>
            Keep names clear and codes short for timetable and subject setup.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            className="space-y-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormField<DepartmentFormSchema>
              name="name"
              label="Name"
              placeholder="Science"
            />
            <FormField<DepartmentFormSchema>
              name="code"
              label="Code"
              placeholder="SCI"
            />
            <TextareaField<DepartmentFormSchema>
              name="description"
              label="Description"
              placeholder="Curriculum ownership, labs, activities..."
              maxLength={500}
              rows={3}
            />
            <CheckboxField<DepartmentFormSchema>
              name="isActive"
              label="Active department"
              description="Available for academic planning and timetables."
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : null}
                {isEditing ? "Save changes" : "Create department"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
