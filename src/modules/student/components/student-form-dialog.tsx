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
import { useClasses } from "@/modules/class/api/use-classes";

import {
  BLOOD_GROUPS,
  GUARDIAN_RELATION_LABELS,
  SOCIAL_CATEGORIES,
  STUDENT_STATUS_LABELS,
  type CreateStudentPayload,
  type GuardianPayload,
  type SocialCategory,
  type UpdateStudentPayload,
} from "../api/student.types";
import { useCreateStudent, useUpdateStudent } from "../api/use-students";
import {
  guardianDefaults,
  studentDefaults,
  studentSchema,
  type GuardianFormSchema,
  type StudentFormSchema,
} from "../schemas/student.schema";
import { useStudentStore } from "@/stores/dialog-store";

const emptyToUndefined = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const toDateInput = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

const bloodGroupLabel = (value: string) =>
  value === "UNKNOWN" ? "Unknown" : value.replace("_POS", "+").replace("_NEG", "-");

const guardianPayload = (guardian: GuardianFormSchema): GuardianPayload => ({
  relation: guardian.relation,
  firstName: guardian.firstName.trim(),
  lastName: guardian.lastName.trim(),
  phone: guardian.phone.trim(),
  alternatePhone: emptyToUndefined(guardian.alternatePhone),
  email: emptyToUndefined(guardian.email),
  occupation: emptyToUndefined(guardian.occupation),
  addressLine1: emptyToUndefined(guardian.addressLine1),
  city: emptyToUndefined(guardian.city),
  state: emptyToUndefined(guardian.state),
  pincode: emptyToUndefined(guardian.pincode),
  isPrimaryContact: guardian.isPrimaryContact,
  isEmergencyContact: guardian.isEmergencyContact,
});

const createPayload = (values: StudentFormSchema): CreateStudentPayload => ({
  academicYearId: emptyToUndefined(values.academicYearId),
  classId: emptyToUndefined(values.classId),
  sectionId: emptyToUndefined(values.sectionId),
  admissionNumber: values.admissionNumber.trim(),
  rollNumber: emptyToUndefined(values.rollNumber),
  admissionDate: values.admissionDate,
  firstName: values.firstName.trim(),
  middleName: emptyToUndefined(values.middleName),
  lastName: values.lastName.trim(),
  gender: values.gender,
  dateOfBirth: values.dateOfBirth,
  bloodGroup: values.bloodGroup,
  nationality: values.nationality.trim(),
  religion: emptyToUndefined(values.religion),
  category: values.category ? (values.category as SocialCategory) : undefined,
  motherTongue: emptyToUndefined(values.motherTongue),
  aadhaarNumber: emptyToUndefined(values.aadhaarNumber),
  phone: emptyToUndefined(values.phone),
  email: emptyToUndefined(values.email),
  addressLine1: emptyToUndefined(values.addressLine1),
  addressLine2: emptyToUndefined(values.addressLine2),
  city: emptyToUndefined(values.city),
  district: emptyToUndefined(values.district),
  state: emptyToUndefined(values.state),
  pincode: emptyToUndefined(values.pincode),
  country: values.country.trim(),
  emergencyContactName: emptyToUndefined(values.emergencyContactName),
  emergencyContactPhone: emptyToUndefined(values.emergencyContactPhone),
  emergencyContactRelation: emptyToUndefined(values.emergencyContactRelation),
  medicalConditions: emptyToUndefined(values.medicalConditions),
  previousSchoolName: emptyToUndefined(values.previousSchoolName),
  status: values.status,
  guardians: values.guardians.map(guardianPayload),
});

const updatePayload = (values: StudentFormSchema): UpdateStudentPayload => {
  const payload = createPayload(values);
  const base: UpdateStudentPayload = {
    academicYearId: payload.academicYearId,
    classId: payload.classId,
    sectionId: payload.sectionId,
    admissionNumber: payload.admissionNumber,
    rollNumber: payload.rollNumber,
    admissionDate: payload.admissionDate,
    firstName: payload.firstName,
    middleName: payload.middleName,
    lastName: payload.lastName,
    gender: payload.gender,
    dateOfBirth: payload.dateOfBirth,
    bloodGroup: payload.bloodGroup,
    nationality: payload.nationality,
    religion: payload.religion,
    category: payload.category,
    motherTongue: payload.motherTongue,
    aadhaarNumber: payload.aadhaarNumber,
    phone: payload.phone,
    email: payload.email,
    addressLine1: payload.addressLine1,
    addressLine2: payload.addressLine2,
    city: payload.city,
    district: payload.district,
    state: payload.state,
    pincode: payload.pincode,
    country: payload.country,
    emergencyContactName: payload.emergencyContactName,
    emergencyContactPhone: payload.emergencyContactPhone,
    emergencyContactRelation: payload.emergencyContactRelation,
    medicalConditions: payload.medicalConditions,
    previousSchoolName: payload.previousSchoolName,
    status: payload.status,
  };
  return { ...base, isActive: values.isActive };
};

export function StudentFormDialog() {
  const isFormOpen = useStudentStore((s) => s.isFormOpen);
  const editing = useStudentStore((s) => s.editing);
  const closeForm = useStudentStore((s) => s.closeForm);
  const isEditing = Boolean(editing);

  const academicYearsQuery = useAcademicYears({
    limit: 50,
    sortBy: "startDate",
    sortOrder: "desc",
  });
  const classesQuery = useClasses({ limit: 100, sortBy: "level", sortOrder: "asc" });
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const isSaving = createMutation.isPending || updateMutation.isPending;

    const methods = useForm<StudentFormSchema>({
      resolver: zodResolver(studentSchema),
      defaultValues: studentDefaults,
    });

  const guardiansArray = useFieldArray({
    control: methods.control,
    name: "guardians",
  });

  const selectedClassId = useWatch({ control: methods.control, name: "classId" });

  const academicYears = useMemo(
    () => academicYearsQuery.data?.data.data ?? [],
    [academicYearsQuery.data],
  );
  const classes = useMemo(
    () => classesQuery.data?.data.data ?? [],
    [classesQuery.data],
  );
  const selectedClass = classes.find((item) => item.id === selectedClassId);

  const defaultAcademicYearId =
    academicYears.find((item) => item.isCurrent)?.id ?? academicYears[0]?.id ?? "";

  useEffect(() => {
    if (!isFormOpen) return;
    if (editing) {
      methods.reset({
        academicYearId: editing.academicYearId ?? "",
        classId: editing.classId ?? "",
        sectionId: editing.sectionId ?? "",
        admissionNumber: editing.admissionNumber,
        rollNumber: editing.rollNumber ?? "",
        admissionDate: toDateInput(editing.admissionDate),
        firstName: editing.firstName,
        middleName: editing.middleName ?? "",
        lastName: editing.lastName,
        gender: editing.gender,
        dateOfBirth: toDateInput(editing.dateOfBirth),
        bloodGroup: editing.bloodGroup ?? "UNKNOWN",
        nationality: editing.nationality,
        religion: editing.religion ?? "",
        category: editing.category ?? "",
        motherTongue: editing.motherTongue ?? "",
        aadhaarNumber: editing.aadhaarNumber ?? "",
        phone: editing.phone ?? "",
        email: editing.email ?? "",
        addressLine1: editing.addressLine1 ?? "",
        addressLine2: editing.addressLine2 ?? "",
        city: editing.city ?? "",
        district: editing.district ?? "",
        state: editing.state ?? "",
        pincode: editing.pincode ?? "",
        country: editing.country,
        emergencyContactName: editing.emergencyContactName ?? "",
        emergencyContactPhone: editing.emergencyContactPhone ?? "",
        emergencyContactRelation: editing.emergencyContactRelation ?? "",
        medicalConditions: editing.medicalConditions ?? "",
        previousSchoolName: editing.previousSchoolName ?? "",
        status: editing.status,
        isActive: editing.isActive,
        guardians: editing.guardians.length
          ? editing.guardians.map((guardian) => ({
              id: guardian.id,
              relation: guardian.relation,
              firstName: guardian.firstName,
              lastName: guardian.lastName,
              phone: guardian.phone,
              alternatePhone: guardian.alternatePhone ?? "",
              email: guardian.email ?? "",
              occupation: guardian.occupation ?? "",
              addressLine1: guardian.addressLine1 ?? "",
              city: guardian.city ?? "",
              state: guardian.state ?? "",
              pincode: guardian.pincode ?? "",
              isPrimaryContact: guardian.isPrimaryContact,
              isEmergencyContact: guardian.isEmergencyContact,
            }))
          : [guardianDefaults],
      });
      return;
    }
    methods.reset({ ...studentDefaults, academicYearId: defaultAcademicYearId });
  }, [defaultAcademicYearId, editing, isFormOpen, methods]);

  useEffect(() => {
    if (!selectedClass?.sections.some((section) => section.id === methods.getValues("sectionId"))) {
      methods.setValue("sectionId", "");
    }
  }, [methods, selectedClass]);

  const academicYearOptions = academicYears.map((item) => ({
    label: `${item.name}${item.isCurrent ? " · Current" : ""}`,
    value: item.id,
  }));
  const classOptions = classes.map((item) => ({ label: item.name, value: item.id }));
  const sectionOptions = (selectedClass?.sections ?? []).map((section) => ({
    label: section.name,
    value: section.id,
  }));

  const onSubmit = (values: StudentFormSchema) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, body: updatePayload(values) },
        { onSuccess: closeForm },
      );
      return;
    }
    createMutation.mutate(createPayload(values), { onSuccess: closeForm });
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit student" : "New student"}</DialogTitle>
          <DialogDescription>
            Capture admission, enrollment, contact, and guardian details in one place.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form className="space-y-5" onSubmit={methods.handleSubmit(onSubmit)}>
            <section className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <p className="text-sm font-semibold">Admission</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField<StudentFormSchema> name="admissionNumber" label="Admission no." />
                <FormField<StudentFormSchema> name="rollNumber" label="Roll no." />
                <FormField<StudentFormSchema> name="admissionDate" label="Admission date" type="date" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <SelectField<StudentFormSchema>
                  name="academicYearId"
                  label="Academic year"
                  options={academicYearOptions}
                  placeholder={academicYearsQuery.isLoading ? "Loading…" : "Select year"}
                  disabled={academicYearsQuery.isLoading}
                />
                <SelectField<StudentFormSchema>
                  name="classId"
                  label="Class"
                  options={classOptions}
                  placeholder={classesQuery.isLoading ? "Loading…" : "Select class"}
                  disabled={classesQuery.isLoading}
                />
                <SelectField<StudentFormSchema>
                  name="sectionId"
                  label="Section"
                  options={sectionOptions}
                  placeholder={selectedClass ? "Select section" : "Select class first"}
                  disabled={!selectedClass}
                />
              </div>
            </section>

            <section className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <p className="text-sm font-semibold">Student profile</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField<StudentFormSchema> name="firstName" label="First name" />
                <FormField<StudentFormSchema> name="middleName" label="Middle name" />
                <FormField<StudentFormSchema> name="lastName" label="Last name" />
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <SelectField<StudentFormSchema>
                  name="gender"
                  label="Gender"
                  options={[
                    { label: "Male", value: "MALE" },
                    { label: "Female", value: "FEMALE" },
                    { label: "Other", value: "OTHER" },
                  ]}
                />
                <FormField<StudentFormSchema> name="dateOfBirth" label="Date of birth" type="date" />
                <SelectField<StudentFormSchema>
                  name="bloodGroup"
                  label="Blood group"
                  options={BLOOD_GROUPS.map((value) => ({
                    label: bloodGroupLabel(value),
                    value,
                  }))}
                />
                <SelectField<StudentFormSchema>
                  name="status"
                  label="Status"
                  options={Object.entries(STUDENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <FormField<StudentFormSchema> name="religion" label="Religion" />
                <SelectField<StudentFormSchema>
                  name="category"
                  label="Category"
                  placeholder="Select category"
                  options={[
                    { label: "Not specified", value: "" },
                    ...SOCIAL_CATEGORIES.map((value) => ({ label: value, value })),
                  ]}
                />
                <FormField<StudentFormSchema> name="motherTongue" label="Mother tongue" />
                <FormField<StudentFormSchema> name="aadhaarNumber" label="Aadhaar no." />
              </div>
            </section>

            <section className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <p className="text-sm font-semibold">Contact</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField<StudentFormSchema> name="phone" label="Phone" />
                <FormField<StudentFormSchema> name="email" label="Email" type="email" />
                <FormField<StudentFormSchema> name="nationality" label="Nationality" />
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <FormField<StudentFormSchema> name="addressLine1" label="Address line 1" />
                <FormField<StudentFormSchema> name="addressLine2" label="Address line 2" />
                <FormField<StudentFormSchema> name="city" label="City" />
                <FormField<StudentFormSchema> name="district" label="District" />
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <FormField<StudentFormSchema> name="state" label="State" />
                <FormField<StudentFormSchema> name="pincode" label="Pincode" />
                <FormField<StudentFormSchema> name="country" label="Country" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField<StudentFormSchema> name="emergencyContactName" label="Emergency name" />
                <FormField<StudentFormSchema> name="emergencyContactPhone" label="Emergency phone" />
                <FormField<StudentFormSchema> name="emergencyContactRelation" label="Relation" />
              </div>
              <TextareaField<StudentFormSchema> name="medicalConditions" label="Medical notes" rows={2} />
            </section>

            {!isEditing ? (
              <section className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Guardians</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => guardiansArray.append({ ...guardianDefaults, isPrimaryContact: false })}
                  >
                    <Plus className="size-3.5" />
                    Add guardian
                  </Button>
                </div>
                <div className="space-y-3">
                  {guardiansArray.fields.map((field, index) => (
                    <div key={field.id} className="animate-soft-pop rounded-md border bg-background p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Guardian {index + 1}
                        </span>
                        {guardiansArray.fields.length > 1 ? (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Remove guardian"
                            onClick={() => guardiansArray.remove(index)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        ) : null}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-4">
                        <SelectField<StudentFormSchema>
                          name={`guardians.${index}.relation` as const}
                          label="Relation"
                          options={Object.entries(GUARDIAN_RELATION_LABELS).map(([value, label]) => ({ value, label }))}
                        />
                        <FormField<StudentFormSchema> name={`guardians.${index}.firstName` as const} label="First name" />
                        <FormField<StudentFormSchema> name={`guardians.${index}.lastName` as const} label="Last name" />
                        <FormField<StudentFormSchema> name={`guardians.${index}.phone` as const} label="Phone" />
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <FormField<StudentFormSchema> name={`guardians.${index}.email` as const} label="Email" type="email" />
                        <FormField<StudentFormSchema> name={`guardians.${index}.occupation` as const} label="Occupation" />
                        <FormField<StudentFormSchema> name={`guardians.${index}.alternatePhone` as const} label="Alternate phone" />
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-4">
                        <FormField<StudentFormSchema> name={`guardians.${index}.addressLine1` as const} label="Address" />
                        <FormField<StudentFormSchema> name={`guardians.${index}.city` as const} label="City" />
                        <FormField<StudentFormSchema> name={`guardians.${index}.state` as const} label="State" />
                        <FormField<StudentFormSchema> name={`guardians.${index}.pincode` as const} label="Pincode" />
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <CheckboxField<StudentFormSchema> name={`guardians.${index}.isPrimaryContact` as const} label="Primary contact" />
                        <CheckboxField<StudentFormSchema> name={`guardians.${index}.isEmergencyContact` as const} label="Emergency contact" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <CheckboxField<StudentFormSchema>
                name="isActive"
                label="Active student"
                description="Inactive students stay in records but are hidden from current rosters."
              />
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : null}
                {isEditing ? "Save changes" : "Create student"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
