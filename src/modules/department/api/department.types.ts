import type { ApiResponse } from "@/types/api";

export interface DepartmentHod {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DepartmentSummary {
  id: string;
  schoolId: string;
  parentId: string | null;
  name: string;
  code: string | null;
  description: string | null;
  hodUserId: string | null;
  hod: DepartmentHod | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentNode extends DepartmentSummary {
  children: DepartmentNode[];
}

export interface DepartmentPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DepartmentListData {
  data: DepartmentSummary[];
  pagination: DepartmentPagination;
}

export interface DepartmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  parentId?: string;
  isActive?: boolean;
}

export interface DepartmentFormValues {
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export type DepartmentListResponse = ApiResponse<DepartmentListData>;
export type DepartmentTreeResponse = ApiResponse<DepartmentNode[]>;
export type DepartmentResponse = ApiResponse<DepartmentSummary>;
export type DeleteDepartmentResponse = ApiResponse<{ id: string }>;
