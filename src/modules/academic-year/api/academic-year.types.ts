import type { ApiResponse } from "@/types/api";

export interface AcademicYearItem {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYearPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AcademicYearListData {
  data: AcademicYearItem[];
  pagination: AcademicYearPagination;
}

export interface AcademicYearListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface CreateAcademicYearPayload {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export type UpdateAcademicYearPayload = Partial<CreateAcademicYearPayload>;

export type AcademicYearListResponse = ApiResponse<AcademicYearListData>;
export type AcademicYearResponse = ApiResponse<AcademicYearItem>;
export type DeleteAcademicYearResponse = ApiResponse<{ id: string }>;
