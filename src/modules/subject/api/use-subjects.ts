"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";

import {
  createSubject,
  deleteSubject,
  fetchSubjects,
  updateSubject,
} from "./subject.api";
import { subjectKeys } from "./subject.keys";
import type {
  CreateSubjectPayload,
  SubjectListParams,
  UpdateSubjectPayload,
} from "./subject.types";

export function useSubjects(params: SubjectListParams = {}) {
  return useQuery({
    queryKey: subjectKeys.list(params),
    queryFn: () => fetchSubjects(params),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSubjectPayload) => createSubject(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success(message ?? "Subject created");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not create subject");
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSubjectPayload }) =>
      updateSubject(id, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success(message ?? "Subject updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update subject");
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success(message ?? "Subject archived");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not archive subject");
    },
  });
}
