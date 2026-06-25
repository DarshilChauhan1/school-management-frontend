"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";

import {
  createSchoolTimeConfiguration,
  deleteSchoolTimeConfiguration,
  fetchSchoolTimeConfigurations,
  updateSchoolTimeConfiguration,
} from "./school-time.api";
import { schoolTimeKeys } from "./school-time.keys";
import type {
  CreateSchoolTimeConfigurationPayload,
  UpdateSchoolTimeConfigurationPayload,
} from "./school-time.types";

export function useSchoolTimeConfigurations() {
  return useQuery({
    queryKey: schoolTimeKeys.lists(),
    queryFn: fetchSchoolTimeConfigurations,
  });
}

export function useCreateSchoolTimeConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSchoolTimeConfigurationPayload) =>
      createSchoolTimeConfiguration(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: schoolTimeKeys.all });
      toast.success(message ?? "Time configuration saved");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not save time configuration");
    },
  });
}

export function useUpdateSchoolTimeConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      academicYearId,
      body,
    }: {
      academicYearId: string;
      body: UpdateSchoolTimeConfigurationPayload;
    }) => updateSchoolTimeConfiguration(academicYearId, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: schoolTimeKeys.all });
      toast.success(message ?? "Time configuration updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update time configuration");
    },
  });
}

export function useDeleteSchoolTimeConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (academicYearId: string) =>
      deleteSchoolTimeConfiguration(academicYearId),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: schoolTimeKeys.all });
      toast.success(message ?? "Time configuration deleted");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not delete time configuration");
    },
  });
}
