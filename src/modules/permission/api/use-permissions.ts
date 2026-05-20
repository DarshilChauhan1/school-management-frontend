"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";
import { useAuthStore } from "@/modules/auth/store/auth.store";

import {
  assignRolePermissions,
  fetchMyPermissions,
  fetchPermissionsByModule,
  fetchRolePermissions,
} from "./permission.api";
import { permissionKeys } from "./permission.keys";
import type { AssignRolePermissionsPayload } from "./permission.types";

export function useMyPermissions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: permissionKeys.me(),
    queryFn: fetchMyPermissions,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermissionsByModule() {
  return useQuery({
    queryKey: permissionKeys.byModule(),
    queryFn: fetchPermissionsByModule,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRolePermissions(roleId: string | undefined) {
  return useQuery({
    queryKey: permissionKeys.role(roleId ?? ""),
    queryFn: () => fetchRolePermissions(roleId as string),
    enabled: Boolean(roleId),
  });
}

export function useAssignRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignRolePermissionsPayload) =>
      assignRolePermissions(body),
    onSuccess: ({ message }, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.role(variables.roleId),
      });
      queryClient.invalidateQueries({ queryKey: permissionKeys.me() });
      toast.success(message ?? "Role permissions updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update role permissions");
    },
  });
}
