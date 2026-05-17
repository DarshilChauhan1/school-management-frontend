import type { RoleListParams } from "./role.types";

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (params: RoleListParams) => [...roleKeys.lists(), params] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};
