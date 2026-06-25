import type { ApiResponse } from "@/types/api";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface SchoolTimeConfigurationDay {
  id: string;
  schoolId: string;
  academicYearId: string;
  dayOfWeek: DayOfWeek;
  isWorkingDay: boolean;
  startTime: string | null;
  endTime: string | null;
  assemblyStartTime: string | null;
  assemblyEndTime: string | null;
  recessStartTime: string | null;
  recessEndTime: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The full per-day time configuration for a single academic year. */
export interface SchoolTimeConfigurationSet {
  schoolId: string;
  academicYearId: string;
  days: SchoolTimeConfigurationDay[];
}

export interface TimeConfigurationDayPayload {
  dayOfWeek: DayOfWeek;
  isWorkingDay: boolean;
  startTime?: string;
  endTime?: string;
  assemblyStartTime?: string;
  assemblyEndTime?: string;
  recessStartTime?: string;
  recessEndTime?: string;
}

export interface CreateSchoolTimeConfigurationPayload {
  academicYearId: string;
  days: TimeConfigurationDayPayload[];
}

export interface UpdateSchoolTimeConfigurationPayload {
  days: TimeConfigurationDayPayload[];
}

export type SchoolTimeConfigurationsListResponse = ApiResponse<
  SchoolTimeConfigurationSet[]
>;
export type SchoolTimeConfigurationResponse =
  ApiResponse<SchoolTimeConfigurationSet>;
export type DeleteSchoolTimeConfigurationResponse = ApiResponse<{
  academicYearId: string;
}>;
