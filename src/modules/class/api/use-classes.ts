"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";

import {
  createClass,
  createSection,
  deleteClass,
  deleteSection,
  fetchClass,
  fetchClasses,
  updateClass,
  updateSection,
} from "./class.api";
import { classKeys } from "./class.keys";
import type {
  ClassListParams,
  CreateClassPayload,
  SectionFormValues,
  UpdateClassPayload,
} from "./class.types";

export function useClasses(params: ClassListParams = {}) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => fetchClasses(params),
  });
}

export function useInfiniteClasses(
  params: Omit<ClassListParams, "page"> = {},
  options: { enabled?: boolean } = {},
) {
  const limit = params.limit ?? 15;
  return useInfiniteQuery({
    queryKey: [...classKeys.lists(), "infinite", { ...params, limit }] as const,
    queryFn: ({ pageParam }) =>
      fetchClasses({ ...params, limit, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.data.pagination.hasNext ? last.data.pagination.page + 1 : undefined,
    enabled: options.enabled ?? true,
  });
}

export function useClass(id: string | undefined) {
  return useQuery({
    queryKey: classKeys.detail(id ?? ""),
    queryFn: () => fetchClass(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateClassPayload) => createClass(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success(message ?? "Class created");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not create class");
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateClassPayload }) =>
      updateClass(id, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success(message ?? "Class updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update class");
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success(message ?? "Class archived");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not archive class");
    },
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classId,
      body,
    }: {
      classId: string;
      body: SectionFormValues;
    }) => createSection(classId, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success(message ?? "Section added");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not add section");
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classId,
      sectionId,
      body,
    }: {
      classId: string;
      sectionId: string;
      body: Partial<SectionFormValues>;
    }) => updateSection(classId, sectionId, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success(message ?? "Section updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update section");
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classId,
      sectionId,
    }: {
      classId: string;
      sectionId: string;
    }) => deleteSection(classId, sectionId),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      toast.success(message ?? "Section removed");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not remove section");
    },
  });
}
