"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { isoToTimeInput, timeInputToIso } from "@/lib/time-of-day";

import { useAcademicYears } from "@/modules/academic-year/api/use-academic-years";

import {
  useCreateSchoolTimeConfiguration,
  useUpdateSchoolTimeConfiguration,
} from "../api/use-school-time";
import type {
  CreateSchoolTimeConfigurationPayload,
  TimeConfigurationDayPayload,
} from "../api/school-time.types";
import { dayLabel } from "../constants/days";
import {
  schoolTimeDefaults,
  schoolTimeSchema,
  type SchoolTimeFormSchema,
} from "../schemas/school-time.schema";
import { useSchoolTimeStore } from "@/stores/dialog-store";

const toIso = (value: string | undefined) =>
  value ? timeInputToIso(value) : undefined;

const toPayload = (
  values: SchoolTimeFormSchema,
): CreateSchoolTimeConfigurationPayload => ({
  academicYearId: values.academicYearId,
  days: values.days.map<TimeConfigurationDayPayload>((d) => ({
    dayOfWeek: d.dayOfWeek,
    isWorkingDay: d.isWorkingDay,
    startTime: d.isWorkingDay ? toIso(d.startTime) : undefined,
    endTime: d.isWorkingDay ? toIso(d.endTime) : undefined,
    assemblyStartTime: d.isWorkingDay ? toIso(d.assemblyStartTime) : undefined,
    assemblyEndTime: d.isWorkingDay ? toIso(d.assemblyEndTime) : undefined,
    recessStartTime: d.isWorkingDay ? toIso(d.recessStartTime) : undefined,
    recessEndTime: d.isWorkingDay ? toIso(d.recessEndTime) : undefined,
  })),
});

export function SchoolTimeFormDialog() {
  const isFormOpen = useSchoolTimeStore((s) => s.isFormOpen);
  const editing = useSchoolTimeStore((s) => s.editing);
  const closeForm = useSchoolTimeStore((s) => s.closeForm);

  const isEditing = Boolean(editing);

  const createMutation = useCreateSchoolTimeConfiguration();
  const updateMutation = useUpdateSchoolTimeConfiguration();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const yearsQuery = useAcademicYears({
    limit: 100,
    sortBy: "startDate",
    sortOrder: "desc",
  });
  const yearOptions = useMemo(
    () =>
      (yearsQuery.data?.data.data ?? []).map((y) => ({
        label: y.isCurrent ? `${y.name} (current)` : y.name,
        value: y.id,
      })),
    [yearsQuery.data],
  );

  const methods = useForm<SchoolTimeFormSchema>({
    resolver: zodResolver(schoolTimeSchema),
    defaultValues: schoolTimeDefaults,
  });
  const { fields } = useFieldArray({
    control: methods.control,
    name: "days",
  });

  useEffect(() => {
    if (!isFormOpen) return;
    if (editing) {
      methods.reset({
        academicYearId: editing.academicYearId,
        days: schoolTimeDefaults.days.map((def) => {
          const match = editing.days.find(
            (w) => w.dayOfWeek === def.dayOfWeek,
          );
          if (!match) return def;
          return {
            dayOfWeek: def.dayOfWeek,
            isWorkingDay: match.isWorkingDay,
            startTime: isoToTimeInput(match.startTime),
            endTime: isoToTimeInput(match.endTime),
            assemblyStartTime: isoToTimeInput(match.assemblyStartTime),
            assemblyEndTime: isoToTimeInput(match.assemblyEndTime),
            recessStartTime: isoToTimeInput(match.recessStartTime),
            recessEndTime: isoToTimeInput(match.recessEndTime),
          };
        }),
      });
      return;
    }
    methods.reset(schoolTimeDefaults);
  }, [editing, isFormOpen, methods]);

  const onSubmit = (values: SchoolTimeFormSchema) => {
    const onSuccess = () => closeForm();
    const payload = toPayload(values);
    if (editing) {
      updateMutation.mutate(
        {
          academicYearId: editing.academicYearId,
          body: { days: payload.days },
        },
        { onSuccess },
      );
      return;
    }
    createMutation.mutate(payload, { onSuccess });
  };

  const days = methods.watch("days");

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit time configuration" : "New time configuration"}
          </DialogTitle>
          <DialogDescription>
            Set which days the school is open, the working hours, and the
            assembly and recess windows for each day.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            className="space-y-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              <SelectField<SchoolTimeFormSchema>
                name="academicYearId"
                label="Academic year"
                placeholder={
                  yearsQuery.isLoading
                    ? "Loading…"
                    : "Select an academic year"
                }
                options={yearOptions}
                disabled={isEditing || yearsQuery.isLoading}
              />

              <div className="space-y-2">
                <p className="text-sm font-medium">Per-day schedule</p>
                <div className="space-y-2">
                  {fields.map((field, index) => {
                    const isWorking = days?.[index]?.isWorkingDay;
                    return (
                      <div
                        key={field.id}
                        className={cn(
                          "space-y-3 rounded-lg border p-3",
                          isWorking ? "bg-card" : "bg-muted/40",
                        )}
                      >
                        <Controller
                          control={methods.control}
                          name={`days.${index}.isWorkingDay`}
                          render={({ field: cb }) => (
                            <label className="flex items-center gap-2 text-sm font-semibold">
                              <Checkbox
                                checked={cb.value}
                                onCheckedChange={(checked) =>
                                  cb.onChange(Boolean(checked))
                                }
                              />
                              {dayLabel(field.dayOfWeek)}
                            </label>
                          )}
                        />

                        {isWorking ? (
                          <div className="grid gap-3 sm:grid-cols-3">
                            <TimeRange
                              label="School hours"
                              control={methods.control}
                              startName={`days.${index}.startTime`}
                              endName={`days.${index}.endTime`}
                            />
                            <TimeRange
                              label="Assembly"
                              control={methods.control}
                              startName={`days.${index}.assemblyStartTime`}
                              endName={`days.${index}.assemblyEndTime`}
                            />
                            <TimeRange
                              label="Recess"
                              control={methods.control}
                              startName={`days.${index}.recessStartTime`}
                              endName={`days.${index}.recessEndTime`}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Closed — no hours configured.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : null}
                {isEditing ? "Save changes" : "Create configuration"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function TimeRange({
  label,
  control,
  startName,
  endName,
}: {
  label: string;
  control: ReturnType<typeof useForm<SchoolTimeFormSchema>>["control"];
  startName:
    | `days.${number}.startTime`
    | `days.${number}.assemblyStartTime`
    | `days.${number}.recessStartTime`;
  endName:
    | `days.${number}.endTime`
    | `days.${number}.assemblyEndTime`
    | `days.${number}.recessEndTime`;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5">
        <Controller
          control={control}
          name={startName}
          render={({ field: f }) => (
            <Input
              type="time"
              value={f.value ?? ""}
              onChange={f.onChange}
              onBlur={f.onBlur}
            />
          )}
        />
        <span className="text-muted-foreground">–</span>
        <Controller
          control={control}
          name={endName}
          render={({ field: f }) => (
            <Input
              type="time"
              value={f.value ?? ""}
              onChange={f.onChange}
              onBlur={f.onBlur}
            />
          )}
        />
      </div>
    </div>
  );
}
