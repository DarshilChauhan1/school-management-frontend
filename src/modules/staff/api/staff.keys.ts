import type { StaffListParams } from "./staff.types";

export const staffKeys = {
  all: ["staff"] as const,
  lists: () => [...staffKeys.all, "list"] as const,
  list: (params: StaffListParams) => [...staffKeys.lists(), params] as const,
  detail: (id: string) => [...staffKeys.all, "detail", id] as const,
};
