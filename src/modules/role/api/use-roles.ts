"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";

import {
  createRole,
  deleteRole,
  fetchRoles,
  updateRole,
} from "./role.api";
import { roleKeys } from "./role.keys";
import type {
  CreateRolePayload,
  RoleListParams,
  UpdateRolePayload,
} from "./role.types";

export function useRoles(params: RoleListParams = {}) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => fetchRoles(params),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRolePayload) => createRole(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(message ?? "Role created");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not create role");
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRolePayload }) =>
      updateRole(id, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(message ?? "Role updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update role");
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      toast.success(message ?? "Role deactivated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not deactivate role");
    },
  });
}
