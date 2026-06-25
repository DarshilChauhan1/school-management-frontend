"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/types/api";

import {
  addGuardian,
  createStudent,
  deleteGuardian,
  deleteStudent,
  fetchStudents,
  updateGuardian,
  updateStudent,
} from "./student.api";
import { studentKeys } from "./student.keys";
import type {
  CreateStudentPayload,
  GuardianPayload,
  StudentListParams,
  UpdateGuardianPayload,
  UpdateStudentPayload,
} from "./student.types";

export function useStudents(params: StudentListParams = {}) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => fetchStudents(params),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStudentPayload) => createStudent(body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success(message ?? "Student created");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not create student");
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStudentPayload }) =>
      updateStudent(id, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success(message ?? "Student updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update student");
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success(message ?? "Student removed");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not remove student");
    },
  });
}

export function useAddGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, body }: { studentId: string; body: GuardianPayload }) =>
      addGuardian(studentId, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success(message ?? "Guardian added");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not add guardian");
    },
  });
}

export function useUpdateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      guardianId,
      body,
    }: {
      studentId: string;
      guardianId: string;
      body: UpdateGuardianPayload;
    }) => updateGuardian(studentId, guardianId, body),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success(message ?? "Guardian updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not update guardian");
    },
  });
}

export function useDeleteGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, guardianId }: { studentId: string; guardianId: string }) =>
      deleteGuardian(studentId, guardianId),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toast.success(message ?? "Guardian removed");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not remove guardian");
    },
  });
}
