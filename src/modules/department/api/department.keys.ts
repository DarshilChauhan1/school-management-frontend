import type { DepartmentListParams } from "./department.types";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  list: (params: DepartmentListParams) =>
    [...departmentKeys.lists(), params] as const,
  tree: () => [...departmentKeys.all, "tree"] as const,
  detail: (id: string) => [...departmentKeys.all, "detail", id] as const,
};
