import { http } from "@/lib/api-client";
import type {
  AssignRolePermissionsPayload,
  AssignRolePermissionsResponse,
  MyPermissionsResponse,
  PermissionsByModuleResponse,
  RolePermissionsResponse,
} from "./permission.types";

export const fetchMyPermissions = () =>
  http.get<MyPermissionsResponse>("/permissions/me");

export const fetchPermissionsByModule = () =>
  http.get<PermissionsByModuleResponse>("/permissions/by-module");

export const fetchRolePermissions = (roleId: string) =>
  http.get<RolePermissionsResponse>(`/permissions/role/${roleId}`);

export const assignRolePermissions = (body: AssignRolePermissionsPayload) =>
  http.post<AssignRolePermissionsPayload, AssignRolePermissionsResponse>(
    "/permissions/role-assign",
    body,
  );
