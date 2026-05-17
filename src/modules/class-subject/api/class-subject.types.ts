import type { ApiResponse } from "@/types/api";

export interface ClassSubjectItem {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  class: { id: string; name: string };
  subject: { id: string; name: string; code: string | null };
  createdAt: string;
}

export interface ClassSubjectPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ClassSubjectListData {
  data: ClassSubjectItem[];
  pagination: ClassSubjectPagination;
}

export interface ClassSubjectListParams {
  page?: number;
  limit?: number;
  classId?: string;
  subjectId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateClassSubjectPayload {
  subjectId: string;
  classIds: string[];
}

export type ClassSubjectListResponse = ApiResponse<ClassSubjectListData>;
export type ClassSubjectResponse = ApiResponse<ClassSubjectItem>;
export type DeleteClassSubjectResponse = ApiResponse<{ id: string }>;
