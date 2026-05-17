import type { ApiResponse } from "@/types/api";

export interface SubjectItem {
  id: string;
  schoolId: string;
  departmentId: string | null;
  departmentName: string | null;
  name: string;
  code: string | null;
  description: string | null;
  isElective: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  classes : { id : string, name : string }[];
}

export interface SubjectPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SubjectListData {
  data: SubjectItem[];
  pagination: SubjectPagination;
}

export interface SubjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  departmentId?: string;
  classId?: string;
  isElective?: boolean;
  isActive?: boolean;
}

export interface CreateSubjectPayload {
  name: string;
  code?: string;
  description?: string;
  departmentId?: string;
  isElective?: boolean;
}

export interface UpdateSubjectPayload extends Partial<CreateSubjectPayload> {
  isActive?: boolean;
}

export type SubjectListResponse = ApiResponse<SubjectListData>;
export type SubjectResponse = ApiResponse<SubjectItem>;
export type DeleteSubjectResponse = ApiResponse<{ id: string }>;
