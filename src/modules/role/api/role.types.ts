import type { ApiResponse } from "@/types/api";

export interface RoleItem {
  id: string;
  schoolId: string | null;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RoleListData {
  data: RoleItem[];
  pagination: RolePagination;
}

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export type RoleListResponse = ApiResponse<RoleListData>;
export type RoleResponse = ApiResponse<RoleItem>;
export type DeleteRoleResponse = ApiResponse<{ id: string }>;
