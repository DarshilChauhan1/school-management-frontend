"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";

import {
  createStaffAssignment,
  deleteStaffAssignment,
  fetchStaffAssignments,
} from "./staff-assignment.api";
import { staffAssignmentKeys } from "./staff-assignment.keys";
import type {
  CreateStaffAssignmentPayload,
  StaffAssignmentListParams,
} from "./staff-assignment.types";

export function useStaffAssignments(
  params: StaffAssignmentListParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: staffAssignmentKeys.list(params),
    queryFn: () => fetchStaffAssignments(params),
    enabled: options.enabled ?? true,
  });
}

export function useCreateStaffAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStaffAssignmentPayload) =>
      createStaffAssignment(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: staffAssignmentKeys.all });
      toast.success(message ?? "Assignment created");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not create assignment");
    },
  });
}

export function useDeleteStaffAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaffAssignment(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: staffAssignmentKeys.all });
      toast.success(message ?? "Assignment removed");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not remove assignment");
    },
  });
}
