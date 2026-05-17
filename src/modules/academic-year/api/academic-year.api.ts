import { http } from "@/lib/api-client";
import type {
  AcademicYearListParams,
  AcademicYearListResponse,
  AcademicYearResponse,
  CreateAcademicYearPayload,
  DeleteAcademicYearResponse,
  UpdateAcademicYearPayload,
} from "./academic-year.types";

const toQueryString = (params: AcademicYearListParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchAcademicYears = (params: AcademicYearListParams = {}) =>
  http.get<AcademicYearListResponse>(
    `/academic-years${toQueryString(params)}`,
  );

export const fetchAcademicYear = (id: string) =>
  http.get<AcademicYearResponse>(`/academic-years/${id}`);

export const createAcademicYear = (body: CreateAcademicYearPayload) =>
  http.post<CreateAcademicYearPayload, AcademicYearResponse>(
    "/academic-years",
    body,
  );

export const updateAcademicYear = (
  id: string,
  body: UpdateAcademicYearPayload,
) =>
  http.patch<UpdateAcademicYearPayload, AcademicYearResponse>(
    `/academic-years/${id}`,
    body,
  );

export const setCurrentAcademicYear = (id: string) =>
  http.patch<Record<string, never>, AcademicYearResponse>(
    `/academic-years/${id}/set-current`,
    {},
  );

export const deleteAcademicYear = (id: string) =>
  http.delete<DeleteAcademicYearResponse>(`/academic-years/${id}`);
