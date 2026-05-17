import { http } from "@/lib/api-client";
import type {
  ClassSubjectListParams,
  ClassSubjectListResponse,
  ClassSubjectResponse,
  CreateClassSubjectPayload,
  DeleteClassSubjectResponse,
} from "./class-subject.types";

const toQueryString = (params: ClassSubjectListParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchClassSubjects = (params: ClassSubjectListParams = {}) =>
  http.get<ClassSubjectListResponse>(
    `/class-subjects${toQueryString(params)}`,
  );

export const createClassSubject = (body: CreateClassSubjectPayload) =>
  http.post<CreateClassSubjectPayload, ClassSubjectResponse>(
    "/class-subjects",
    body,
  );

export const deleteClassSubject = (id: string) =>
  http.delete<DeleteClassSubjectResponse>(`/class-subjects/${id}`);
