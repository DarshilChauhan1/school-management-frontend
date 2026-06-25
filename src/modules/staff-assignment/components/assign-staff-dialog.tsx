"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Layers3, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/select-field";
import { Spinner } from "@/components/ui/spinner";

import { useClasses } from "@/modules/class/api/use-classes";
import { useRoles } from "@/modules/role/api/use-roles";
import { useSubjects } from "@/modules/subject/api/use-subjects";
import { useStaffStore } from "@/stores/dialog-store";

import {
  useCreateStaffAssignment,
  useDeleteStaffAssignment,
  useStaffAssignments,
} from "../api/use-staff-assignments";

const assignSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  roleId: z.string().min(1, "Teaching role is required"),
});

type AssignFormSchema = z.infer<typeof assignSchema>;

const DEFAULTS: AssignFormSchema = { classId: "", subjectId: "", roleId: "" };

export function AssignStaffDialog() {
  const assigning = useStaffStore((s) => s.secondary);
  const closeAssign = useStaffStore((s) => s.closeSecondary);

  const isOpen = Boolean(assigning);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAssign()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-xl overflow-y-auto">
        {assigning ? (
          <AssignBody
            staffId={assigning.id}
            staffName={`${assigning.user.firstName} ${assigning.user.lastName}`.trim()}
            onClose={closeAssign}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AssignBody({
  staffId,
  staffName,
  onClose,
}: {
  staffId: string;
  staffName: string;
  onClose: () => void;
}) {
  const classesQuery = useClasses({
    limit: 100,
    sortBy: "level",
    sortOrder: "asc",
  });
  const subjectsQuery = useSubjects({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
    isActive: true,
  });
  const rolesQuery = useRoles({ limit: 100, sortBy: "name", sortOrder: "asc" });
  const assignmentsQuery = useStaffAssignments({ staffId, limit: 100 });

  const createMutation = useCreateStaffAssignment();
  const deleteMutation = useDeleteStaffAssignment();

  const methods = useForm<AssignFormSchema>({
    resolver: zodResolver(assignSchema),
    defaultValues: DEFAULTS,
  });

  const classOptions = useMemo(
    () =>
      (classesQuery.data?.data.data ?? []).map((c) => ({
        label: c.name,
        value: c.id,
      })),
    [classesQuery.data],
  );
  const subjectOptions = useMemo(
    () =>
      (subjectsQuery.data?.data.data ?? []).map((s) => ({
        label: s.code ? `${s.name} (${s.code})` : s.name,
        value: s.id,
      })),
    [subjectsQuery.data],
  );
  const roleOptions = useMemo(
    () =>
      (rolesQuery.data?.data.data ?? []).map((r) => ({
        label: r.name,
        value: r.id,
      })),
    [rolesQuery.data],
  );

  const assignments = assignmentsQuery.data?.data.data ?? [];

  const onSubmit = (values: AssignFormSchema) => {
    createMutation.mutate(
      { staffId, ...values },
      { onSuccess: () => methods.reset(DEFAULTS) },
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Assign teaching duties</DialogTitle>
        <DialogDescription>
          Link <span className="font-medium">{staffName}</span> to a class,
          subject, and teaching role.
        </DialogDescription>
      </DialogHeader>

      <FormProvider {...methods}>
        <form
          className="space-y-4"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <SelectField<AssignFormSchema>
            name="classId"
            label="Class"
            placeholder={classesQuery.isLoading ? "Loading…" : "Select class"}
            options={classOptions}
            disabled={classesQuery.isLoading}
          />
          <SelectField<AssignFormSchema>
            name="subjectId"
            label="Subject"
            placeholder={
              subjectsQuery.isLoading ? "Loading…" : "Select subject"
            }
            options={subjectOptions}
            disabled={subjectsQuery.isLoading}
          />
          <SelectField<AssignFormSchema>
            name="roleId"
            label="Teaching role"
            placeholder={rolesQuery.isLoading ? "Loading…" : "Select role"}
            options={roleOptions}
            disabled={rolesQuery.isLoading}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            Add assignment
          </Button>
        </form>
      </FormProvider>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Current assignments</p>
          <span className="text-xs text-muted-foreground">
            {assignments.length} total
          </span>
        </div>

        {assignmentsQuery.isLoading ? (
          <div className="grid min-h-24 place-items-center rounded-lg border">
            <Spinner className="size-5" />
          </div>
        ) : assignments.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
            <Layers3 className="mx-auto mb-2 size-6" />
            No assignments yet.
          </p>
        ) : (
          <div className="divide-y rounded-lg border">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 px-3 py-2.5 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {a.class.name} · {a.subject.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {a.role.name}
                    {a.subject.code ? ` · ${a.subject.code}` : ""}
                  </div>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Remove assignment"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(a.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          Done
        </Button>
      </div>
    </>
  );
}
