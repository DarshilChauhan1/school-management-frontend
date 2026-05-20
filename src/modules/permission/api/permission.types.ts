import type { ApiResponse } from "@/types/api";

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage";

export interface PermissionSubject {
  subject: string;
  actions: PermissionAction[];
}

export interface PermissionModule {
  module: string;
  subjects: PermissionSubject[];
}

export interface MyPermissions {
  role: string;
  roleId: string;
  modules: PermissionModule[];
}

export type MyPermissionsResponse = ApiResponse<MyPermissions>;

/** A single permission row as stored in the backend. */
export interface PermissionItem {
  id: string;
  action: PermissionAction;
  subject: string;
  module: string | null;
  description: string | null;
  createdAt: string;
}

export interface PermissionsByModuleGroup {
  module: string;
  permissions: PermissionItem[];
}

export interface AssignRolePermissionsPayload {
  roleId: string;
  permissionIds: string[];
}

export interface RolePermissionAssignResult {
  roleId: string;
  assigned: number;
}

export type PermissionsByModuleResponse = ApiResponse<PermissionsByModuleGroup[]>;
export type RolePermissionsResponse = ApiResponse<MyPermissions>;
export type AssignRolePermissionsResponse = ApiResponse<RolePermissionAssignResult>;
