import type { SubjectListParams } from "./subject.types";

export const subjectKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectKeys.all, "list"] as const,
  list: (params: SubjectListParams) =>
    [...subjectKeys.lists(), params] as const,
  detail: (id: string) => [...subjectKeys.all, "detail", id] as const,
};
