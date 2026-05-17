import type { AcademicYearListParams } from "./academic-year.types";

export const academicYearKeys = {
  all: ["academic-years"] as const,
  lists: () => [...academicYearKeys.all, "list"] as const,
  list: (params: AcademicYearListParams) =>
    [...academicYearKeys.lists(), params] as const,
};
