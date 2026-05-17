"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/types/api";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  fetchDepartmentTree,
  updateDepartment,
} from "./department.api";
import { departmentKeys } from "./department.keys";
import type { DepartmentFormValues, DepartmentListParams } from "./department.types";

export function useDepartments(params: DepartmentListParams = {}) {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => fetchDepartments(params),
  });
}

export function useDepartmentTree() {
  return useQuery({
    queryKey: departmentKeys.tree(),
    queryFn: fetchDepartmentTree,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DepartmentFormValues) => createDepartment(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      toast.success(message ?? "Department created");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not create department");
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: DepartmentFormValues }) =>
      updateDepartment(id, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      toast.success(message ?? "Department updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update department");
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      toast.success(message ?? "Department deleted");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not delete department");
    },
  });
}
