import type { StudentListParams } from "./student.types";

export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (params: StudentListParams) => [...studentKeys.lists(), params] as const,
  detail: (id: string) => [...studentKeys.all, "detail", id] as const,
};
