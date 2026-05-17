"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";

import {
  createClassSubject,
  deleteClassSubject,
  fetchClassSubjects,
} from "./class-subject.api";
import { classSubjectKeys } from "./class-subject.keys";
import type {
  ClassSubjectListParams,
  CreateClassSubjectPayload,
} from "./class-subject.types";
import { subjectKeys } from "@/modules/subject/api/subject.keys";
import { classKeys } from "@/modules/class/api/class.keys";

export function useClassSubjects(
  params: ClassSubjectListParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: classSubjectKeys.list(params),
    queryFn: () => fetchClassSubjects(params),
    enabled: options.enabled ?? true,
  });
}

export function useCreateClassSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateClassSubjectPayload) => createClassSubject(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: classSubjectKeys.all });
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success(message ?? "Subject linked to classes");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not link subject to classes");
    },
  });
}

export function useDeleteClassSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClassSubject(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: classSubjectKeys.all });
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success(message ?? "Link removed");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not remove link");
    },
  });
}
