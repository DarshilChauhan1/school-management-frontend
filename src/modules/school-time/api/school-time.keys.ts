export const schoolTimeKeys = {
  all: ["school-time-configurations"] as const,
  lists: () => [...schoolTimeKeys.all, "list"] as const,
  detail: (academicYearId: string) =>
    [...schoolTimeKeys.all, "detail", academicYearId] as const,
};
