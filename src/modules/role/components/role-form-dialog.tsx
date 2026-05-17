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
import { TextareaField } from "@/components/ui/textarea-field";

import { useCreateRole, useUpdateRole } from "../api/use-roles";
import type {
  CreateRolePayload,
  UpdateRolePayload,
} from "../api/role.types";
import {
  roleDefaults,
  roleSchema,
  type RoleFormSchema,
} from "../schemas/role.schema";
import { useRoleStore } from "../store/role.store";

const toCreatePayload = (values: RoleFormSchema): CreateRolePayload => ({
  name: values.name.trim(),
  description: values.description?.trim() || undefined,
});

const toUpdatePayload = (values: RoleFormSchema): UpdateRolePayload => ({
  name: values.name.trim(),
  description: values.description?.trim() || undefined,
  isActive: values.isActive,
});

export function RoleFormDialog() {
  const isFormOpen = useRoleStore((s) => s.isFormOpen);
  const editing = useRoleStore((s) => s.editing);
  const closeForm = useRoleStore((s) => s.closeForm);

  const isEditing = Boolean(editing);

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const methods = useForm<RoleFormSchema>({
    resolver: zodResolver(roleSchema),
    defaultValues: roleDefaults,
  });

  useEffect(() => {
    if (!isFormOpen) return;

    if (editing) {
      methods.reset({
        name: editing.name,
        description: editing.description ?? "",
        isActive: editing.isActive,
      });
      return;
    }
    methods.reset(roleDefaults);
  }, [editing, isFormOpen, methods]);

  const onSubmit = (values: RoleFormSchema) => {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit role" : "New role"}</DialogTitle>
          <DialogDescription>
            Roles scope what staff members can do inside this school. Names are
            auto-uppercased on the server (e.g. CLASS_TEACHER).
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            className="space-y-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormField<RoleFormSchema>
              name="name"
              label="Name"
              placeholder="CLASS_TEACHER"
            />
            <TextareaField<RoleFormSchema>
              name="description"
              label="Description"
              placeholder="Optional — what this role is responsible for"
              maxLength={400}
              rows={3}
            />
            {isEditing ? (
              <CheckboxField<RoleFormSchema>
                name="isActive"
                label="Active role"
                description="Inactive roles cannot be assigned to staff."
              />
            ) : null}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : null}
                {isEditing ? "Save changes" : "Create role"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
