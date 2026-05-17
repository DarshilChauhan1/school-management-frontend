"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";

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
import { useDepartments } from "@/modules/department/api/use-departments";

import { MEDIUM_OPTIONS } from "../constants/medium";
import {
  useCreateClass,
  useCreateSection,
  useDeleteSection,
  useUpdateClass,
  useUpdateSection,
} from "../api/use-classes";
import type {
  CreateClassPayload,
  SectionFormValues,
  SectionItem,
  UpdateClassPayload,
} from "../api/class.types";
import {
  classDefaults,
  classSchema,
  parseOptionalInt,
  type ClassFormSchema,
} from "../schemas/class.schema";
import { useClassStore } from "../store/class.store";

const NO_DEPARTMENT_VALUE = "__none__";

const composeDescription = (values: ClassFormSchema): string | undefined => {
  const base = values.description?.trim() ?? "";
  const custom =
    values.mediumOfInstruction === "OTHER"
      ? values.customMedium?.trim() ?? ""
      : "";
  const prefix = custom ? `Medium: ${custom}` : "";
  const joined = [prefix, base].filter(Boolean).join(" — ");
  return joined || undefined;
};

const toCreatePayload = (values: ClassFormSchema): CreateClassPayload => ({
  name: values.name.trim(),
  level: parseOptionalInt(values.level),
  description: composeDescription(values),
  academicYearId: values.academicYearId,
  departmentId:
    values.departmentId && values.departmentId !== NO_DEPARTMENT_VALUE
      ? values.departmentId
      : undefined,
  mediumOfInstruction: values.mediumOfInstruction,
  sections: (values.sections ?? [])
    .filter((s) => s.name.trim().length > 0)
    .map<SectionFormValues>((s) => ({
      name: s.name.trim(),
      capacity: parseOptionalInt(s.capacity),
      roomNumber: s.roomNumber?.trim() || undefined,
    })),
});

const toUpdatePayload = (values: ClassFormSchema): UpdateClassPayload => ({
  name: values.name.trim(),
  level: parseOptionalInt(values.level),
  description: composeDescription(values),
  departmentId:
    values.departmentId && values.departmentId !== NO_DEPARTMENT_VALUE
      ? values.departmentId
      : undefined,
  mediumOfInstruction: values.mediumOfInstruction,
  isActive: values.isActive,
});

export function ClassFormDialog() {
  const isFormOpen = useClassStore((s) => s.isFormOpen);
  const editingClass = useClassStore((s) => s.editingClass);
  const closeForm = useClassStore((s) => s.closeForm);

  const isEditing = Boolean(editingClass);

  const departmentsQuery = useDepartments({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
    isActive: true,
  });

  const academicYearsQuery = useAcademicYears({
    limit: 50,
    sortBy: "startDate",
    sortOrder: "desc",
  });

  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();
  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    createSectionMutation.isPending ||
    updateSectionMutation.isPending ||
    deleteSectionMutation.isPending;

  const methods = useForm<ClassFormSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: classDefaults,
  });

  const sectionsArray = useFieldArray({
    control: methods.control,
    name: "sections",
  });

  const academicYears = useMemo(
    () => academicYearsQuery.data?.data.data ?? [],
    [academicYearsQuery.data],
  );

  const defaultAcademicYearId = useMemo(
    () =>
      academicYears.find((y) => y.isCurrent)?.id ?? academicYears[0]?.id ?? "",
    [academicYears],
  );

  useEffect(() => {
    if (!isFormOpen) return;

    if (editingClass) {
      methods.reset({
        name: editingClass.name,
        level: editingClass.level != null ? String(editingClass.level) : "",
        description: editingClass.description ?? "",
        academicYearId: editingClass.academicYearId,
        departmentId: editingClass.departmentId ?? "",
        mediumOfInstruction: editingClass.mediumOfInstruction ?? "ENGLISH",
        customMedium: "",
        isActive: editingClass.isActive,
        sections: editingClass.sections.map((section) => ({
          id: section.id,
          name: section.name,
          capacity: section.capacity != null ? String(section.capacity) : "",
          roomNumber: section.roomNumber ?? "",
        })),
      });
      return;
    }

    methods.reset({
      ...classDefaults,
      academicYearId: defaultAcademicYearId,
    });
  }, [editingClass, isFormOpen, methods, defaultAcademicYearId]);

  const departmentOptions = useMemo(() => {
    const list = departmentsQuery.data?.data.data ?? [];
    return [
      { label: "No department", value: NO_DEPARTMENT_VALUE },
      ...list.map((d) => ({
        label: d.code ? `${d.name} (${d.code})` : d.name,
        value: d.id,
      })),
    ];
  }, [departmentsQuery.data]);

  const academicYearOptions = useMemo(
    () =>
      academicYears.map((y) => ({
        label: `${y.name}${y.isCurrent ? " · Current" : ""}`,
        value: y.id,
      })),
    [academicYears],
  );

  const mediumValue = useWatch({
    control: methods.control,
    name: "mediumOfInstruction",
  });

  const syncSections = async (
    classId: string,
    formSections: ClassFormSchema["sections"],
    originalSections: SectionItem[],
  ) => {
    const current = (formSections ?? []).filter(
      (s) => s.name.trim().length > 0,
    );
    const originalIds = new Set(originalSections.map((s) => s.id));
    const keptIds = new Set(
      current.map((s) => s.id).filter((id): id is string => Boolean(id)),
    );

    const removed = originalSections.filter((s) => !keptIds.has(s.id));
    const created = current.filter((s) => !s.id);
    const updated = current.filter((s): s is typeof s & { id: string } => {
      if (!s.id || !originalIds.has(s.id)) return false;
      const original = originalSections.find((o) => o.id === s.id);
      if (!original) return false;
      const formCapacity = parseOptionalInt(s.capacity);
      const formRoom = s.roomNumber?.trim() || null;
      return (
        original.name !== s.name.trim() ||
        (original.capacity ?? null) !== (formCapacity ?? null) ||
        (original.roomNumber ?? null) !== formRoom
      );
    });

    const tasks: Promise<unknown>[] = [];
    removed.forEach((s) => {
      tasks.push(
        deleteSectionMutation.mutateAsync({ classId, sectionId: s.id }),
      );
    });
    created.forEach((s) => {
      const body: SectionFormValues = {
        name: s.name.trim(),
        capacity: parseOptionalInt(s.capacity),
        roomNumber: s.roomNumber?.trim() || undefined,
      };
      tasks.push(createSectionMutation.mutateAsync({ classId, body }));
    });
    updated.forEach((s) => {
      const body: Partial<SectionFormValues> = {
        name: s.name.trim(),
        capacity: parseOptionalInt(s.capacity),
        roomNumber: s.roomNumber?.trim() || undefined,
      };
      tasks.push(
        updateSectionMutation.mutateAsync({
          classId,
          sectionId: s.id,
          body,
        }),
      );
    });

    if (tasks.length) await Promise.all(tasks);
  };

  const onSubmit = async (values: ClassFormSchema) => {
    if (editingClass) {
      try {
        await updateMutation.mutateAsync({
          id: editingClass.id,
          body: toUpdatePayload(values),
        });
        await syncSections(
          editingClass.id,
          values.sections,
          editingClass.sections,
        );
        closeForm();
      } catch {
        /* toast already shown by mutation hooks */
      }
      return;
    }
    createMutation.mutate(toCreatePayload(values), {
      onSuccess: () => closeForm(),
    });
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit class" : "New class"}</DialogTitle>
          <DialogDescription>
            Group students by grade and add sections for timetable and roster
            setup.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            className="space-y-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField<ClassFormSchema>
                name="name"
                label="Name"
                placeholder="Grade 10"
              />
              <FormField<ClassFormSchema>
                name="level"
                label="Level"
                placeholder="10"
                type="number"
              />
            </div>

            <SelectField<ClassFormSchema>
              name="academicYearId"
              label="Academic year"
              placeholder={
                academicYearsQuery.isLoading
                  ? "Loading…"
                  : "Select academic year"
              }
              options={academicYearOptions}
              disabled={isEditing || academicYearsQuery.isLoading}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField<ClassFormSchema>
                name="mediumOfInstruction"
                label="Medium of instruction"
                placeholder="Select medium"
                options={MEDIUM_OPTIONS}
              />
              {mediumValue === "OTHER" ? (
                <FormField<ClassFormSchema>
                  name="customMedium"
                  label="Custom medium"
                  placeholder="e.g. Konkani"
                />
              ) : null}
            </div>

            <SelectField<ClassFormSchema>
              name="departmentId"
              label="Department"
              placeholder={
                departmentsQuery.isLoading ? "Loading…" : "Select department"
              }
              options={departmentOptions}
              disabled={departmentsQuery.isLoading}
            />

            <TextareaField<ClassFormSchema>
              name="description"
              label="Description"
              placeholder="Optional class notes"
              maxLength={400}
              rows={2}
            />

            <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Sections</p>
                  <p className="text-xs text-muted-foreground">
                    {isEditing
                      ? "Existing sections are preloaded — edit, remove, or add new ones."
                      : "Optional — add the sections that belong to this class."}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    sectionsArray.append({
                      id: undefined,
                      name: "",
                      capacity: "",
                      roomNumber: "",
                    })
                  }
                >
                  <Plus className="size-3.5" />
                  Add section
                </Button>
              </div>

              {sectionsArray.fields.length === 0 ? (
                <p className="rounded-md border border-dashed bg-background px-3 py-4 text-center text-xs text-muted-foreground">
                  No sections yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {sectionsArray.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-2 rounded-md border bg-background p-2 sm:grid-cols-[1fr_120px_1fr_auto]"
                    >
                      <FormField<ClassFormSchema>
                        name={`sections.${index}.name` as const}
                        placeholder="A"
                      />
                      <FormField<ClassFormSchema>
                        name={`sections.${index}.capacity` as const}
                        placeholder="Capacity"
                        type="number"
                      />
                      <FormField<ClassFormSchema>
                        name={`sections.${index}.roomNumber` as const}
                        placeholder="Room"
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Remove section"
                        onClick={() => sectionsArray.remove(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isEditing ? (
              <CheckboxField<ClassFormSchema>
                name="isActive"
                label="Active class"
                description="Inactive classes are hidden from timetables and rosters."
              />
            ) : null}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : null}
                {isEditing ? "Save changes" : "Create class"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
