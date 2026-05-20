import type { ApiResponse } from "@/types/api";

export const STAFF_EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "GUEST",
] as const;

export type StaffEmploymentType = (typeof STAFF_EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<StaffEmploymentType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Contract",
  GUEST: "Guest",
};

export interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  auth: { email: string } | null;
}

export interface StaffItem {
  id: string;
  schoolId: string;
  userId: string;
  departmentId: string | null;
  employeeCode: string | null;
  designation: string;
  qualification: string | null;
  specializations: string[];
  employmentType: StaffEmploymentType;
  joiningDate: string;
  relievingDate: string | null;
  isActive: boolean;
  user: StaffUser;
  department: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StaffListData {
  data: StaffItem[];
  pagination: StaffPagination;
}

export interface StaffListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  designation?: string;
  joiningDate?: string;
  employmentType?: StaffEmploymentType;
  employeeCode?: string;
  qualification?: string;
  specializations?: string[];
  departmentId?: string;
}

export interface UpdateStaffPayload {
  designation?: string;
  joiningDate?: string;
  employmentType?: StaffEmploymentType;
  employeeCode?: string;
  qualification?: string;
  specializations?: string[];
  departmentId?: string;
  relievingDate?: string;
  isActive?: boolean;
}

export type StaffListResponse = ApiResponse<StaffListData>;
export type StaffResponse = ApiResponse<StaffItem>;
export type DeleteStaffResponse = ApiResponse<{ id: string }>;
