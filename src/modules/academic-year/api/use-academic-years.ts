"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";

import {
  createAcademicYear,
  deleteAcademicYear,
  fetchAcademicYears,
  setCurrentAcademicYear,
  updateAcademicYear,
} from "./academic-year.api";
import { academicYearKeys } from "./academic-year.keys";
import type {
  AcademicYearListParams,
  CreateAcademicYearPayload,
  UpdateAcademicYearPayload,
} from "./academic-year.types";

export function useAcademicYears(params: AcademicYearListParams = {}) {
  return useQuery({
    queryKey: academicYearKeys.list(params),
    queryFn: () => fetchAcademicYears(params),
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAcademicYearPayload) => createAcademicYear(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.all });
      toast.success(message ?? "Academic year created");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not create academic year");
    },
  });
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateAcademicYearPayload;
    }) => updateAcademicYear(id, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.all });
      toast.success(message ?? "Academic year updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update academic year");
    },
  });
}

export function useSetCurrentAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setCurrentAcademicYear(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.all });
      toast.success(message ?? "Marked as current academic year");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not mark as current");
    },
  });
}

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAcademicYear(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.all });
      toast.success(message ?? "Academic year deactivated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not deactivate academic year");
    },
  });
}
