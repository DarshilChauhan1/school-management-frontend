import type { ClassSubjectListParams } from "./class-subject.types";

export const classSubjectKeys = {
  all: ["class-subjects"] as const,
  lists: () => [...classSubjectKeys.all, "list"] as const,
  list: (params: ClassSubjectListParams) =>
    [...classSubjectKeys.lists(), params] as const,
};
