"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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

import { useDepartments } from "@/modules/department/api/use-departments";
import { useRoles } from "@/modules/role/api/use-roles";

import { useCreateStaff, useUpdateStaff } from "../api/use-staff";
import {
  EMPLOYMENT_TYPE_LABELS,
  STAFF_EMPLOYMENT_TYPES,
  type CreateStaffPayload,
  type UpdateStaffPayload,
} from "../api/staff.types";
import {
  parseSpecializations,
  staffDefaults,
  staffSchema,
  type StaffFormSchema,
} from "../schemas/staff.schema";
import { useStaffStore } from "../store/staff.store";

const NO_DEPARTMENT = "__none__";

const EMPLOYMENT_OPTIONS = STAFF_EMPLOYMENT_TYPES.map((value) => ({
  label: EMPLOYMENT_TYPE_LABELS[value],
  value,
}));

const toCreatePayload = (values: StaffFormSchema): CreateStaffPayload => ({
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  email: values.email.trim(),
  roleId: values.roleId,
  designation: values.designation?.trim() || undefined,
  joiningDate: values.joiningDate || undefined,
  employmentType: values.employmentType,
  employeeCode: values.employeeCode?.trim() || undefined,
  qualification: values.qualification?.trim() || undefined,
  specializations: parseSpecializations(values.specializations),
  departmentId:
    values.departmentId && values.departmentId !== NO_DEPARTMENT
      ? values.departmentId
      : undefined,
});

const toUpdatePayload = (values: StaffFormSchema): UpdateStaffPayload => ({
  designation: values.designation?.trim() || undefined,
  joiningDate: values.joiningDate || undefined,
  employmentType: values.employmentType,
  employeeCode: values.employeeCode?.trim() || undefined,
  qualification: values.qualification?.trim() || undefined,
  specializations: parseSpecializations(values.specializations),
  departmentId:
    values.departmentId && values.departmentId !== NO_DEPARTMENT
      ? values.departmentId
      : undefined,
});

export function StaffFormDialog() {
  const isFormOpen = useStaffStore((s) => s.isFormOpen);
  const editing = useStaffStore((s) => s.editing);
  const closeForm = useStaffStore((s) => s.closeForm);

  const isEditing = Boolean(editing);

  const rolesQuery = useRoles({ limit: 100, sortBy: "name", sortOrder: "asc" });
  const departmentsQuery = useDepartments({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
    isActive: true,
  });

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const methods = useForm<StaffFormSchema>({
    resolver: zodResolver(staffSchema),
    defaultValues: staffDefaults,
  });

  useEffect(() => {
    if (!isFormOpen) return;

    if (editing) {
      methods.reset({
        firstName: editing.user.firstName,
        lastName: editing.user.lastName,
        email: editing.user.auth?.email ?? "",
        roleId: "",
        designation: editing.designation ?? "",
        joiningDate: editing.joiningDate
          ? editing.joiningDate.slice(0, 10)
          : "",
        employmentType: editing.employmentType,
        employeeCode: editing.employeeCode ?? "",
        qualification: editing.qualification ?? "",
        specializations: editing.specializations.join(", "),
        departmentId: editing.departmentId ?? "",
      });
      return;
    }
    methods.reset(staffDefaults);
  }, [editing, isFormOpen, methods]);

  const roleOptions = useMemo(() => {
    const list = rolesQuery.data?.data.data ?? [];
    return list.map((r) => ({ label: r.name, value: r.id }));
  }, [rolesQuery.data]);

  const departmentOptions = useMemo(() => {
    const list = departmentsQuery.data?.data.data ?? [];
    return [
      { label: "No department", value: NO_DEPARTMENT },
      ...list.map((d) => ({
        label: d.code ? `${d.name} (${d.code})` : d.name,
        value: d.id,
      })),
    ];
  }, [departmentsQuery.data]);

  const onSubmit = (values: StaffFormSchema) => {
    const onSuccess = () => closeForm();
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, body: toUpdatePayload(values) },
        { onSuccess },
      );
      return;
    }
    createMutation.mutate(toCreatePayload(values), { onSuccess });
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit staff member" : "New staff member"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the staff profile. Identity and role are managed separately."
              : "Creates a user account and links it to the selected role."}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            className="space-y-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField<StaffFormSchema>
                name="firstName"
                label="First name"
                placeholder="Priya"
                disabled={isEditing}
              />
              <FormField<StaffFormSchema>
                name="lastName"
                label="Last name"
                placeholder="Sharma"
                disabled={isEditing}
              />
            </div>

            <FormField<StaffFormSchema>
              name="email"
              label="Email"
              type="email"
              placeholder="priya.sharma@school.edu"
              disabled={isEditing}
            />

            {!isEditing ? (
              <SelectField<StaffFormSchema>
                name="roleId"
                label="Role"
                placeholder={
                  rolesQuery.isLoading ? "Loading…" : "Select a role"
                }
                options={roleOptions}
                disabled={rolesQuery.isLoading}
              />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField<StaffFormSchema>
                name="designation"
                label="Designation"
                placeholder="Science Teacher"
              />
              <SelectField<StaffFormSchema>
                name="employmentType"
                label="Employment type"
                options={EMPLOYMENT_OPTIONS}
                placeholder="Select type"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField<StaffFormSchema>
                name="joiningDate"
                label="Joining date"
                type="date"
              />
              <FormField<StaffFormSchema>
                name="employeeCode"
                label="Employee code"
                placeholder="Auto-generated if blank"
              />
            </div>

            <SelectField<StaffFormSchema>
              name="departmentId"
              label="Department"
              placeholder={
                departmentsQuery.isLoading ? "Loading…" : "Select department"
              }
              options={departmentOptions}
              disabled={departmentsQuery.isLoading}
            />

            <FormField<StaffFormSchema>
              name="qualification"
              label="Qualification"
              placeholder="M.Sc Physics"
            />

            <FormField<StaffFormSchema>
              name="specializations"
              label="Specializations"
              placeholder="Physics, Chemistry (comma separated)"
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : null}
                {isEditing ? "Save changes" : "Create staff"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
