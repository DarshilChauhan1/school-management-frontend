"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Phone, Save, ShieldCheck, UserRound, X } from "lucide-react";
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
import { SelectField } from "@/components/ui/select-field";
import { Spinner } from "@/components/ui/spinner";
import { useStudentStore } from "@/stores/dialog-store";

import { GUARDIAN_RELATION_LABELS, type GuardianPayload } from "../api/student.types";
import { useAddGuardian, useUpdateGuardian } from "../api/use-students";
import { guardianDefaults, guardianSchema, type GuardianFormSchema } from "../schemas/student.schema";

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
      <DialogContent className="modal-pop max-h-[calc(100vh-2rem)] max-w-3xl gap-0 overflow-hidden rounded-[1.25rem] border-border bg-card p-0 shadow-elevate">
        <div className="border-b border-border bg-card px-7 pb-5 pt-7">
          <DialogHeader className="gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Guardian contact
            </span>
            <DialogTitle className="text-2xl font-semibold text-foreground">
              {isEditing ? "Edit guardian" : "Add guardian"}
            </DialogTitle>
            <DialogDescription>
              {target
                ? `${target.student.firstName} ${target.student.lastName}`
                : "Student guardian contact"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <FormProvider {...methods}>
          <form className="contents" onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="max-h-[60vh] overflow-y-auto bg-background px-7 py-6">
              <div className="section-rise space-y-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Relationship and contact
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Keep guardian phone, address, and emergency routing current.
                    </p>
                  </div>
                </div>

                <div className="paper-card space-y-4 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Phone className="size-4 text-primary" />
                    Primary contact
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField<GuardianFormSchema>
                      name="relation"
                      label="Relation"
                      options={Object.entries(GUARDIAN_RELATION_LABELS).map(([value, label]) => ({ value, label }))}
                    />
                    <FormField<GuardianFormSchema> name="phone" label="Phone" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField<GuardianFormSchema> name="firstName" label="First name" />
                    <FormField<GuardianFormSchema> name="lastName" label="Last name" />
                    <FormField<GuardianFormSchema> name="alternatePhone" label="Alternate phone" />
                  </div>
                </div>

                <div className="paper-card space-y-4 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <UserRound className="size-4 text-primary" />
                    Profile
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField<GuardianFormSchema> name="email" label="Email" type="email" />
                    <FormField<GuardianFormSchema> name="occupation" label="Occupation" />
                  </div>
                </div>

                <div className="paper-card space-y-4 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="size-4 text-primary" />
                    Address
                  </div>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <FormField<GuardianFormSchema> name="addressLine1" label="Address" />
                    <FormField<GuardianFormSchema> name="city" label="City" />
                    <FormField<GuardianFormSchema> name="state" label="State" />
                    <FormField<GuardianFormSchema> name="pincode" label="Pincode" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <CheckboxField<GuardianFormSchema>
                    name="isPrimaryContact"
                    label="Primary contact"
                    className="paper-card rounded-xl bg-card px-4 py-3"
                  />
                  <CheckboxField<GuardianFormSchema>
                    name="isEmergencyContact"
                    label="Emergency contact"
                    className="paper-card rounded-xl bg-card px-4 py-3"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="items-center justify-between border-t border-border bg-card px-7 py-4 sm:justify-between">
              <Button type="button" variant="ghost" className="rounded-full" onClick={closeGuardian}>
                <X className="size-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="rounded-full shadow-emerald">
                {isSaving ? <Spinner className="size-4" /> : <Save className="size-4" />}
                {isEditing ? "Save guardian" : "Add guardian"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
