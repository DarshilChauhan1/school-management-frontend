import type { ClassListParams } from "./class.types";

export const classKeys = {
  all: ["classes"] as const,
  lists: () => [...classKeys.all, "list"] as const,
  list: (params: ClassListParams) =>
    [...classKeys.lists(), params] as const,
  detail: (id: string) => [...classKeys.all, "detail", id] as const,
};
