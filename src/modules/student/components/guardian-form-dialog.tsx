"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect } from "react";

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

import { GUARDIAN_RELATION_LABELS, type GuardianPayload } from "../api/student.types";
import { useAddGuardian, useUpdateGuardian } from "../api/use-students";
import { guardianDefaults, guardianSchema, type GuardianFormSchema } from "../schemas/student.schema";
import { useStudentStore } from "@/stores/dialog-store";

const emptyToUndefined = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const toPayload = (values: GuardianFormSchema): GuardianPayload => ({
  relation: values.relation,
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  phone: values.phone.trim(),
  alternatePhone: emptyToUndefined(values.alternatePhone),
  email: emptyToUndefined(values.email),
  occupation: emptyToUndefined(values.occupation),
  addressLine1: emptyToUndefined(values.addressLine1),
  city: emptyToUndefined(values.city),
  state: emptyToUndefined(values.state),
  pincode: emptyToUndefined(values.pincode),
  isPrimaryContact: values.isPrimaryContact,
  isEmergencyContact: values.isEmergencyContact,
});

export function GuardianFormDialog() {
  const target = useStudentStore((s) => s.secondary);
  const closeGuardian = useStudentStore((s) => s.closeSecondary);
  const addMutation = useAddGuardian();
  const updateMutation = useUpdateGuardian();
  const isSaving = addMutation.isPending || updateMutation.isPending;
  const isEditing = Boolean(target?.guardian);

  const methods = useForm<GuardianFormSchema>({
    resolver: zodResolver(guardianSchema),
    defaultValues: guardianDefaults,
  });

  useEffect(() => {
    if (!target) return;
    if (target.guardian) {
      methods.reset({
        id: target.guardian.id,
        relation: target.guardian.relation,
        firstName: target.guardian.firstName,
        lastName: target.guardian.lastName,
        phone: target.guardian.phone,
        alternatePhone: target.guardian.alternatePhone ?? "",
        email: target.guardian.email ?? "",
        occupation: target.guardian.occupation ?? "",
        addressLine1: target.guardian.addressLine1 ?? "",
        city: target.guardian.city ?? "",
        state: target.guardian.state ?? "",
        pincode: target.guardian.pincode ?? "",
        isPrimaryContact: target.guardian.isPrimaryContact,
        isEmergencyContact: target.guardian.isEmergencyContact,
      });
      return;
    }
    methods.reset({ ...guardianDefaults, isPrimaryContact: false, isEmergencyContact: false });
  }, [methods, target]);

  const onSubmit = (values: GuardianFormSchema) => {
    if (!target) return;
    if (target.guardian) {
      updateMutation.mutate(
        {
          studentId: target.student.id,
          guardianId: target.guardian.id,
          body: toPayload(values),
        },
        { onSuccess: closeGuardian },
      );
      return;
    }
    addMutation.mutate(
      { studentId: target.student.id, body: toPayload(values) },
      { onSuccess: closeGuardian },
    );
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && closeGuardian()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit guardian" : "Add guardian"}</DialogTitle>
          <DialogDescription>
            {target ? `${target.student.firstName} ${target.student.lastName}` : "Student guardian contact"}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form className="space-y-4" onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField<GuardianFormSchema>
                name="relation"
                label="Relation"
                options={Object.entries(GUARDIAN_RELATION_LABELS).map(([value, label]) => ({ value, label }))}
              />
              <FormField<GuardianFormSchema> name="phone" label="Phone" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField<GuardianFormSchema> name="firstName" label="First name" />
              <FormField<GuardianFormSchema> name="lastName" label="Last name" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField<GuardianFormSchema> name="email" label="Email" type="email" />
              <FormField<GuardianFormSchema> name="occupation" label="Occupation" />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <FormField<GuardianFormSchema> name="addressLine1" label="Address" />
              <FormField<GuardianFormSchema> name="city" label="City" />
              <FormField<GuardianFormSchema> name="state" label="State" />
              <FormField<GuardianFormSchema> name="pincode" label="Pincode" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckboxField<GuardianFormSchema> name="isPrimaryContact" label="Primary contact" />
              <CheckboxField<GuardianFormSchema> name="isEmergencyContact" label="Emergency contact" />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeGuardian}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : null}
                {isEditing ? "Save guardian" : "Add guardian"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
