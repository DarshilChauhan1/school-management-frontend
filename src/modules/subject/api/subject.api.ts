import { http } from "@/lib/api-client";
import type {
  CreateSubjectPayload,
  DeleteSubjectResponse,
  SubjectListParams,
  SubjectListResponse,
  SubjectResponse,
  UpdateSubjectPayload,
} from "./subject.types";

const toQueryString = (params: SubjectListParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchSubjects = (params: SubjectListParams = {}) =>
  http.get<SubjectListResponse>(`/subjects${toQueryString(params)}`);

export const fetchSubject = (id: string) =>
  http.get<SubjectResponse>(`/subjects/${id}`);

export const createSubject = (body: CreateSubjectPayload) =>
  http.post<CreateSubjectPayload, SubjectResponse>("/subjects", body);

export const updateSubject = (id: string, body: UpdateSubjectPayload) =>
  http.patch<UpdateSubjectPayload, SubjectResponse>(`/subjects/${id}`, body);

export const deleteSubject = (id: string) =>
  http.delete<DeleteSubjectResponse>(`/subjects/${id}`);
