import { http } from "@/lib/api-client";

import type {
  CreateStudentPayload,
  DeleteGuardianResponse,
  DeleteStudentResponse,
  GuardianPayload,
  GuardianResponse,
  StudentListParams,
  StudentListResponse,
  StudentResponse,
  UpdateGuardianPayload,
  UpdateStudentPayload,
} from "./student.types";

const toQueryString = (params: StudentListParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchStudents = (params: StudentListParams = {}) =>
  http.get<StudentListResponse>(`/students${toQueryString(params)}`);

export const fetchStudent = (id: string) =>
  http.get<StudentResponse>(`/students/${id}`);

export const createStudent = (body: CreateStudentPayload) =>
  http.post<CreateStudentPayload, StudentResponse>("/students", body);

export const updateStudent = (id: string, body: UpdateStudentPayload) =>
  http.patch<UpdateStudentPayload, StudentResponse>(`/students/${id}`, body);

export const deleteStudent = (id: string) =>
  http.delete<DeleteStudentResponse>(`/students/${id}`);

export const addGuardian = (studentId: string, body: GuardianPayload) =>
  http.post<GuardianPayload, GuardianResponse>(`/students/${studentId}/guardians`, body);

export const updateGuardian = (
  studentId: string,
  guardianId: string,
  body: UpdateGuardianPayload,
) =>
  http.patch<UpdateGuardianPayload, GuardianResponse>(
    `/students/${studentId}/guardians/${guardianId}`,
    body,
  );

export const deleteGuardian = (studentId: string, guardianId: string) =>
  http.delete<DeleteGuardianResponse>(`/students/${studentId}/guardians/${guardianId}`);
