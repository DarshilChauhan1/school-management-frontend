import { http } from "@/lib/api-client";
import type {
  CreateRolePayload,
  DeleteRoleResponse,
  RoleListParams,
  RoleListResponse,
  RoleResponse,
  UpdateRolePayload,
} from "./role.types";

const toQueryString = (params: RoleListParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchRoles = (params: RoleListParams = {}) =>
  http.get<RoleListResponse>(`/role/school/all${toQueryString(params)}`);

export const fetchRole = (id: string) =>
  http.get<RoleResponse>(`/role/school/${id}`);

export const createRole = (body: CreateRolePayload) =>
  http.post<CreateRolePayload, RoleResponse>("/role/school", body);

export const updateRole = (id: string, body: UpdateRolePayload) =>
  http.patch<UpdateRolePayload, RoleResponse>(`/role/school/${id}`, body);

export const deleteRole = (id: string) =>
  http.delete<DeleteRoleResponse>(`/role/school/${id}`);
