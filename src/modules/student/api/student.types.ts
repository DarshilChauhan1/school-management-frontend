import type { ApiResponse } from "@/types/api";

export const STUDENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "TRANSFERRED",
  "GRADUATED",
  "DROPPED_OUT",
  "SUSPENDED",
] as const;

export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export const BLOOD_GROUPS = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "UNKNOWN"
] as const;
export const SOCIAL_CATEGORIES = ["GENERAL", "OBC", "SC", "ST", "EWS", "OTHER"] as const;
export const GUARDIAN_RELATIONS = [
  "FATHER",
  "MOTHER",
  "GRANDFATHER",
  "GRANDMOTHER",
  "UNCLE",
  "AUNT",
  "BROTHER",
  "SISTER",
  "LEGAL_GUARDIAN",
  "OTHER",
] as const;

export type StudentStatus = (typeof STUDENT_STATUSES)[number];
export type Gender = (typeof GENDERS)[number];
export type BloodGroup = (typeof BLOOD_GROUPS)[number];
export type SocialCategory = (typeof SOCIAL_CATEGORIES)[number];
export type GuardianRelation = (typeof GUARDIAN_RELATIONS)[number];

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  TRANSFERRED: "Transferred",
  GRADUATED: "Graduated",
  DROPPED_OUT: "Dropped out",
  SUSPENDED: "Suspended",
};

export const GUARDIAN_RELATION_LABELS: Record<GuardianRelation, string> = {
  FATHER: "Father",
  MOTHER: "Mother",
  GRANDFATHER: "Grandfather",
  GRANDMOTHER: "Grandmother",
  UNCLE: "Uncle",
  AUNT: "Aunt",
  BROTHER: "Brother",
  SISTER: "Sister",
  LEGAL_GUARDIAN: "Legal guardian",
  OTHER: "Other",
};

export interface GuardianItem {
  id: string;
  studentId: string;
  relation: GuardianRelation;
  firstName: string;
  lastName: string;
  phone: string;
  alternatePhone: string | null;
  email: string | null;
  occupation: string | null;
  qualification: string | null;
  annualIncome: number | null;
  workAddress: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isPrimaryContact: boolean;
  isEmergencyContact: boolean;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentItem {
  id: string;
  schoolId: string;
  academicYearId: string | null;
  classId: string | null;
  sectionId: string | null;
  admissionNumber: string;
  rollNumber: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  bloodGroup: BloodGroup | null;
  nationality: string;
  religion: string | null;
  category: SocialCategory | null;
  motherTongue: string | null;
  aadhaarNumber: string | null;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  medicalConditions: string | null;
  previousSchoolName: string | null;
  admissionDate: string;
  status: StudentStatus;
  isActive: boolean;
  class: { id: string; name: string } | null;
  section: { id: string; name: string } | null;
  academicYear: { id: string; name: string } | null;
  guardians: GuardianItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StudentListData {
  data: StudentItem[];
  pagination: StudentPagination;
}

export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  classId?: string;
  sectionId?: string;
  academicYearId?: string;
  status?: StudentStatus;
}

export interface GuardianPayload {
  relation: GuardianRelation;
  firstName: string;
  lastName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  occupation?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isPrimaryContact?: boolean;
  isEmergencyContact?: boolean;
}

export interface CreateStudentPayload {
  academicYearId?: string;
  classId?: string;
  sectionId?: string;
  admissionNumber: string;
  rollNumber?: string;
  admissionDate: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  bloodGroup?: BloodGroup;
  nationality?: string;
  religion?: string;
  category?: SocialCategory;
  motherTongue?: string;
  aadhaarNumber?: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  medicalConditions?: string;
  previousSchoolName?: string;
  status?: StudentStatus;
  guardians: GuardianPayload[];
}

export type UpdateStudentPayload = Partial<Omit<CreateStudentPayload, "guardians">> & {
  isActive?: boolean;
};
export type UpdateGuardianPayload = Partial<GuardianPayload>;

export type StudentListResponse = ApiResponse<StudentListData>;
export type StudentResponse = ApiResponse<StudentItem>;
export type GuardianResponse = ApiResponse<GuardianItem>;
export type DeleteStudentResponse = ApiResponse<{ id: string }>;
export type DeleteGuardianResponse = ApiResponse<{ id: string }>;
