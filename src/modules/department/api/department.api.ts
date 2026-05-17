import { http } from "@/lib/api-client";
import type {
  DeleteDepartmentResponse,
  DepartmentFormValues,
  DepartmentListParams,
  DepartmentListResponse,
  DepartmentResponse,
  DepartmentTreeResponse,
} from "./department.types";

const toQueryString = (params: DepartmentListParams) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchDepartments = (params: DepartmentListParams = {}) =>
  http.get<DepartmentListResponse>(`/departments${toQueryString(params)}`);

export const fetchDepartmentTree = () =>
  http.get<DepartmentTreeResponse>("/departments/tree");

export const createDepartment = (body: DepartmentFormValues) =>
  http.post<DepartmentFormValues, DepartmentResponse>("/departments", body);

export const updateDepartment = (id: string, body: DepartmentFormValues) =>
  http.patch<DepartmentFormValues, DepartmentResponse>(`/departments/${id}`, body);

export const deleteDepartment = (id: string) =>
  http.delete<DeleteDepartmentResponse>(`/departments/${id}`);
