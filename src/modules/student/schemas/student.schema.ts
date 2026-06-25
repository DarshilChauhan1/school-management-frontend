import { z } from "zod";

import {
  BLOOD_GROUPS,
  GENDERS,
  GUARDIAN_RELATIONS,
  SOCIAL_CATEGORIES,
  STUDENT_STATUSES,
} from "../api/student.types";

const optionalText = z.string();
const optionalEmail = z.string().trim().email("Enter a valid email").or(z.literal(""));
const exactLengthOrBlank = (length: number, message: string) =>
  z.string().refine((value) => {
    const trimmed = value.trim();
    return trimmed.length === 0 || trimmed.length === length;
  }, message);

export const guardianSchema = z.object({
  id: z.string().optional(),
  relation: z.enum(GUARDIAN_RELATIONS),
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  phone: z.string().trim().min(5, "Phone is required").max(20),
  alternatePhone: optionalText,
  email: optionalEmail,
  occupation: optionalText,
  addressLine1: optionalText,
  city: optionalText,
  state: optionalText,
  pincode: exactLengthOrBlank(6, "Pincode must be 6 digits"),
  isPrimaryContact: z.boolean().optional(),
  isEmergencyContact: z.boolean().optional(),
});

export const studentSchema = z.object({
  academicYearId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  admissionNumber: z.string().trim().min(1, "Admission number is required").max(40),
  rollNumber: optionalText,
  admissionDate: z.string().min(1, "Admission date is required"),
  firstName: z.string().trim().min(1, "First name is required").max(80),
  middleName: optionalText,
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  gender: z.enum(GENDERS),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  nationality: z.string().trim().min(1, "Nationality is required").max(60),
  religion: optionalText,
  category: z.enum(SOCIAL_CATEGORIES).or(z.literal("")),
  motherTongue: optionalText,
  aadhaarNumber: exactLengthOrBlank(12, "Aadhaar number must be 12 digits"),
  photoUrl: optionalText,
  phone: optionalText,
  email: optionalEmail,
  addressLine1: optionalText,
  addressLine2: optionalText,
  city: optionalText,
  district: optionalText,
  state: optionalText,
  pincode: exactLengthOrBlank(6, "Pincode must be 6 digits"),
  country: z.string().trim().min(1, "Country is required").max(60),
  emergencyContactName: optionalText,
  emergencyContactPhone: optionalText,
  emergencyContactRelation: optionalText,
  medicalConditions: optionalText,
  previousSchoolName: optionalText,
  status: z.enum(STUDENT_STATUSES),
  isActive: z.boolean().optional(),
  guardians: z.array(guardianSchema).min(1, "Add at least one guardian"),
});

export type StudentFormSchema = z.infer<typeof studentSchema>;
export type GuardianFormSchema = z.infer<typeof guardianSchema>;

const today = new Date().toISOString().slice(0, 10);

export const guardianDefaults: GuardianFormSchema = {
  relation: "FATHER",
  firstName: "",
  lastName: "",
  phone: "",
  alternatePhone: "",
  email: "",
  occupation: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  isPrimaryContact: true,
  isEmergencyContact: true,
};

export const studentDefaults: StudentFormSchema = {
  academicYearId: "",
  classId: "",
  sectionId: "",
  admissionNumber: "",
  rollNumber: "",
  admissionDate: today,
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "MALE",
  dateOfBirth: "",
  bloodGroup: "UNKNOWN",
  nationality: "Indian",
  religion: "",
  category: "",
  motherTongue: "",
  aadhaarNumber: "",
  photoUrl: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  country: "India",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  medicalConditions: "",
  previousSchoolName: "",
  status: "ACTIVE",
  isActive: true,
  guardians: [guardianDefaults],
};
