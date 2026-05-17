import type { ApiResponse } from "@/types/api";

import type { MediumOfInstruction } from "../constants/medium";

export interface SectionItem {
  id: string;
  schoolId: string;
  classId: string;
  name: string;
  capacity: number | null;
  roomNumber: string | null;
  isActive: boolean;
}

export interface ClassItem {
  id: string;
  schoolId: string;
  academicYearId: string;
  departmentId: string | null;
  mediumOfInstruction: MediumOfInstruction;
  name: string;
  level: number | null;
  description: string | null;
  isActive: boolean;
  sections: SectionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ClassListData {
  data: ClassItem[];
  pagination: ClassPagination;
}

export interface ClassListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  departmentId?: string;
  academicYearId?: string;
}

export interface SectionFormValues {
  name: string;
  capacity?: number;
  roomNumber?: string;
}

export interface CreateClassPayload {
  name: string;
  level?: number;
  description?: string;
  academicYearId: string;
  departmentId?: string;
  mediumOfInstruction: MediumOfInstruction;
  sections?: SectionFormValues[];
}

export interface UpdateClassPayload {
  name?: string;
  level?: number;
  description?: string;
  departmentId?: string;
  mediumOfInstruction?: MediumOfInstruction;
  isActive?: boolean;
}

export type ClassListResponse = ApiResponse<ClassListData>;
export type ClassResponse = ApiResponse<ClassItem>;
export type SectionResponse = ApiResponse<SectionItem>;
export type DeleteClassResponse = ApiResponse<{ id: string }>;
