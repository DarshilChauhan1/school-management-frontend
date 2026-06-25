import type { StaffAssignmentListParams } from "./staff-assignment.types";

export const staffAssignmentKeys = {
  all: ["staff-assignments"] as const,
  lists: () => [...staffAssignmentKeys.all, "list"] as const,
  list: (params: StaffAssignmentListParams) =>
    [...staffAssignmentKeys.lists(), params] as const,
};
