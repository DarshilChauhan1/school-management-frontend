import { http } from "@/lib/api-client";
import type {
  CreateSchoolTimeConfigurationPayload,
  DeleteSchoolTimeConfigurationResponse,
  SchoolTimeConfigurationsListResponse,
  SchoolTimeConfigurationResponse,
  UpdateSchoolTimeConfigurationPayload,
} from "./school-time.types";

const BASE = "/school-time-configurations";

export const fetchSchoolTimeConfigurations = () =>
  http.get<SchoolTimeConfigurationsListResponse>(BASE);

export const fetchSchoolTimeConfigurationForYear = (academicYearId: string) =>
  http.get<SchoolTimeConfigurationResponse>(`${BASE}/${academicYearId}`);

export const createSchoolTimeConfiguration = (
  body: CreateSchoolTimeConfigurationPayload,
) =>
  http.post<
    CreateSchoolTimeConfigurationPayload,
    SchoolTimeConfigurationResponse
  >(`${BASE}/create`, body);

export const updateSchoolTimeConfiguration = (
  academicYearId: string,
  body: UpdateSchoolTimeConfigurationPayload,
) =>
  http.patch<
    UpdateSchoolTimeConfigurationPayload,
    SchoolTimeConfigurationResponse
  >(`${BASE}/${academicYearId}`, body);

export const deleteSchoolTimeConfiguration = (academicYearId: string) =>
  http.delete<DeleteSchoolTimeConfigurationResponse>(
    `${BASE}/${academicYearId}`,
  );
