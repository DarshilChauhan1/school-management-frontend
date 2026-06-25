import type { ApiResponse } from "@/types/api";

export interface StaffAssignmentItem {
  id: string;
  schoolId: string;
  staffId: string;
  classId: string;
  subjectId: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  staff: {
    id: string;
    employeeCode: string | null;
    designation: string;
    user: { id: string; firstName: string; lastName: string };
  };
  class: { id: string; name: string };
  subject: { id: string; name: string; code: string | null };
  role: { id: string; name: string };
}

export interface StaffAssignmentPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StaffAssignmentListData {
  data: StaffAssignmentItem[];
  pagination: StaffAssignmentPagination;
}

export interface StaffAssignmentListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  staffId?: string;
  classId?: string;
  subjectId?: string;
}

export interface CreateStaffAssignmentPayload {
  staffId: string;
  classId: string;
  subjectId: string;
  roleId: string;
}

export interface UpdateStaffAssignmentPayload {
  roleId?: string;
  isActive?: boolean;
}

export type StaffAssignmentListResponse = ApiResponse<StaffAssignmentListData>;
export type StaffAssignmentResponse = ApiResponse<StaffAssignmentItem>;
export type DeleteStaffAssignmentResponse = ApiResponse<{ id: string }>;
