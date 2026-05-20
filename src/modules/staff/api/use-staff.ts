"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";

import {
  createStaff,
  deleteStaff,
  fetchStaff,
  updateStaff,
} from "./staff.api";
import { staffKeys } from "./staff.keys";
import type {
  CreateStaffPayload,
  StaffListParams,
  UpdateStaffPayload,
} from "./staff.types";

export function useStaff(params: StaffListParams = {}) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => fetchStaff(params),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStaffPayload) => createStaff(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      toast.success(message ?? "Staff member created");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not create staff member");
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStaffPayload }) =>
      updateStaff(id, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      toast.success(message ?? "Staff member updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update staff member");
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      toast.success(message ?? "Staff member deactivated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not deactivate staff member");
    },
  });
}
