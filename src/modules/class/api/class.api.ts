import { http } from "@/lib/api-client";
import type {
  ClassListParams,
  ClassListResponse,
  ClassResponse,
  CreateClassPayload,
  DeleteClassResponse,
  SectionFormValues,
  SectionResponse,
  UpdateClassPayload,
} from "./class.types";

const toQueryString = (params: ClassListParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchClasses = (params: ClassListParams = {}) =>
  http.get<ClassListResponse>(`/classes${toQueryString(params)}`);

export const fetchClass = (id: string) =>
  http.get<ClassResponse>(`/classes/${id}`);

export const createClass = (body: CreateClassPayload) =>
  http.post<CreateClassPayload, ClassResponse>("/classes", body);

export const updateClass = (id: string, body: UpdateClassPayload) =>
  http.patch<UpdateClassPayload, ClassResponse>(`/classes/${id}`, body);

export const deleteClass = (id: string) =>
  http.delete<DeleteClassResponse>(`/classes/${id}`);

export const createSection = (classId: string, body: SectionFormValues) =>
  http.post<SectionFormValues, SectionResponse>(
    `/classes/${classId}/sections`,
    body,
  );

export const updateSection = (
  classId: string,
  sectionId: string,
  body: Partial<SectionFormValues>,
) =>
  http.patch<Partial<SectionFormValues>, SectionResponse>(
    `/classes/${classId}/sections/${sectionId}`,
    body,
  );

export const deleteSection = (classId: string, sectionId: string) =>
  http.delete<DeleteClassResponse>(
    `/classes/${classId}/sections/${sectionId}`,
  );
