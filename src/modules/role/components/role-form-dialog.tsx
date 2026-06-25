"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";

import {
  usePermissionsByModule,
  useAssignRolePermissions,
} from "@/modules/permission/api/use-permissions";
import { PermissionPicker } from "@/modules/permission/components/permission-picker";

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
import { useRoleStore } from "@/stores/dialog-store";

const toCreatePayload = (values: RoleFormSchema): CreateRolePayload => ({
  name: values.name.trim(),
  description: values.description?.trim() || undefined,
});

const toUpdatePayload = (values: RoleFormSchema): UpdateRolePayload => ({
  name: values.name.trim(),
  description: values.description?.trim() || undefined,
  isActive: values.isActive,
});

type Step = 1 | 2;

export function RoleFormDialog() {
  const isFormOpen = useRoleStore((s) => s.isFormOpen);
  const editing = useRoleStore((s) => s.editing);
  const closeFormStore = useRoleStore((s) => s.closeForm);

  const isEditing = Boolean(editing);

  const [step, setStep] = useState<Step>(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const assignMutation = useAssignRolePermissions();
  const byModuleQuery = usePermissionsByModule();

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    assignMutation.isPending;

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

  const closeForm = () => {
    setStep(1);
    setSelectedIds(new Set());
    closeFormStore();
  };

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMany = (ids: string[], on: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const goToPermissions = async () => {
    const valid = await methods.trigger(["name", "description"]);
    if (valid) setStep(2);
  };

  const submitEdit = (values: RoleFormSchema) => {
    if (!editing) return;
    updateMutation.mutate(
      { id: editing.id, body: toUpdatePayload(values) },
      { onSuccess: () => closeForm() },
    );
  };

  const submitCreate = async () => {
    const values = methods.getValues();
    try {
      const created = await createMutation.mutateAsync(toCreatePayload(values));
      const roleId = created.data.id;
      if (selectedIds.size > 0) {
        await assignMutation.mutateAsync({
          roleId,
          permissionIds: Array.from(selectedIds),
        });
      }
      closeForm();
    } catch {
      // mutation hooks surface the error toast; keep the dialog open.
    }
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className={cn(!isEditing && step === 2 && "max-w-2xl")}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit role" : "New role"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this role's details."
              : step === 1
                ? "Step 1 of 2 — name the role and describe what it's for."
                : "Step 2 of 2 — choose what this role is allowed to do."}
          </DialogDescription>
        </DialogHeader>

        {!isEditing ? <StepIndicator step={step} /> : null}

        <FormProvider {...methods}>
          {/* Step 1 / edit: role details */}
          {isEditing || step === 1 ? (
            <form
              className="space-y-4"
              onSubmit={
                isEditing
                  ? methods.handleSubmit(submitEdit)
                  : (e) => {
                      e.preventDefault();
                      goToPermissions();
                    }
              }
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
                  {isEditing ? (
                    isSaving ? (
                      <Spinner className="size-4" />
                    ) : (
                      "Save changes"
                    )
                  ) : (
                    <>
                      Next: permissions
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : null}

          {/* Step 2: assign permissions */}
          {!isEditing && step === 2 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="size-4" />
                  Permissions selected
                </span>
                <span className="font-semibold">{selectedIds.size}</span>
              </div>

              <div className="max-h-[55vh] overflow-y-auto pr-1">
                {byModuleQuery.isLoading ? (
                  <div className="grid min-h-32 place-items-center">
                    <Spinner className="size-5 text-muted-foreground" />
                  </div>
                ) : (
                  <PermissionPicker
                    groups={byModuleQuery.data?.data ?? []}
                    selectedIds={selectedIds}
                    onToggle={toggle}
                    onToggleMany={toggleMany}
                  />
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  disabled={isSaving}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={submitCreate}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Create role
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2].map((s) => (
        <div key={s} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
              step >= s
                ? "bg-brand-600 text-white"
                : "bg-muted text-muted-foreground",
            )}
          >
            {s}
          </span>
          <span
            className={cn(
              "text-xs font-medium",
              step >= s ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {s === 1 ? "Details" : "Permissions"}
          </span>
          {s === 1 ? <span className="h-px flex-1 bg-border" /> : null}
        </div>
      ))}
    </div>
  );
}
