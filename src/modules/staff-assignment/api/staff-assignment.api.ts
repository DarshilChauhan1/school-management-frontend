import { http } from "@/lib/api-client";
import type {
  CreateStaffAssignmentPayload,
  DeleteStaffAssignmentResponse,
  StaffAssignmentListParams,
  StaffAssignmentListResponse,
  StaffAssignmentResponse,
  UpdateStaffAssignmentPayload,
} from "./staff-assignment.types";

const toQueryString = (params: StaffAssignmentListParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchStaffAssignments = (params: StaffAssignmentListParams = {}) =>
  http.get<StaffAssignmentListResponse>(
    `/staff-assignments${toQueryString(params)}`,
  );

export const createStaffAssignment = (body: CreateStaffAssignmentPayload) =>
  http.post<CreateStaffAssignmentPayload, StaffAssignmentResponse>(
    "/staff-assignments",
    body,
  );

export const updateStaffAssignment = (
  id: string,
  body: UpdateStaffAssignmentPayload,
) =>
  http.patch<UpdateStaffAssignmentPayload, StaffAssignmentResponse>(
    `/staff-assignments/${id}`,
    body,
  );

export const deleteStaffAssignment = (id: string) =>
  http.delete<DeleteStaffAssignmentResponse>(`/staff-assignments/${id}`);
