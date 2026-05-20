import { http } from "@/lib/api-client";
import type {
  CreateStaffPayload,
  DeleteStaffResponse,
  StaffListParams,
  StaffListResponse,
  StaffResponse,
  UpdateStaffPayload,
} from "./staff.types";

const toQueryString = (params: StaffListParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchStaff = (params: StaffListParams = {}) =>
  http.get<StaffListResponse>(`/staff${toQueryString(params)}`);

export const fetchStaffMember = (id: string) =>
  http.get<StaffResponse>(`/staff/${id}`);

export const createStaff = (body: CreateStaffPayload) =>
  http.post<CreateStaffPayload, StaffResponse>("/staff", body);

export const updateStaff = (id: string, body: UpdateStaffPayload) =>
  http.patch<UpdateStaffPayload, StaffResponse>(`/staff/${id}`, body);

export const deleteStaff = (id: string) =>
  http.delete<DeleteStaffResponse>(`/staff/${id}`);
