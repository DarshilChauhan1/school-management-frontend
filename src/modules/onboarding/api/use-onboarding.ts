"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiError } from "@/types/api";
import {
  confirmUpload,
  fetchOnboardingOverview,
  presignUpload,
  saveStep1School,
  saveStep2LegalEntity,
  saveStep3Board,
  saveStep4Documents,
  saveStep5Infrastructure,
  saveStep6Configuration,
  submitOnboarding,
} from "./onboarding.api";
import { onboardingKeys } from "./onboarding.keys";
import type {
  ConfirmUploadRequest,
  PresignUploadRequest,
  Step1SchoolRequest,
  Step2LegalEntityRequest,
  Step3BoardRequest,
  Step4DocumentsRequest,
  Step5InfrastructureRequest,
  Step6ConfigurationRequest,
} from "./onboarding.types";

const invalidateOverview = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: onboardingKeys.overview() });

export function useOnboardingOverview() {
  return useQuery({
    queryKey: onboardingKeys.overview(),
    queryFn: fetchOnboardingOverview,
  });
}

export function useSaveStep1() {
  const queryClient = useQueryClient();
  return useMutation<Awaited<ReturnType<typeof saveStep1School>>, ApiError, Step1SchoolRequest>({
    mutationFn: saveStep1School,
    onSuccess: () => {
      toast.success("School profile saved.");
      void invalidateOverview(queryClient);
    },
    onError: (error) => toast.error(error.message ?? "Could not save school profile"),
  });
}

export function useSaveStep2() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof saveStep2LegalEntity>>,
    ApiError,
    Step2LegalEntityRequest
  >({
    mutationFn: saveStep2LegalEntity,
    onSuccess: () => {
      toast.success("Legal entity saved.");
      void invalidateOverview(queryClient);
    },
    onError: (error) => toast.error(error.message ?? "Could not save legal entity"),
  });
}

export function useSaveStep3() {
  const queryClient = useQueryClient();
  return useMutation<Awaited<ReturnType<typeof saveStep3Board>>, ApiError, Step3BoardRequest>({
    mutationFn: saveStep3Board,
    onSuccess: () => {
      toast.success("Board identity saved.");
      void invalidateOverview(queryClient);
    },
    onError: (error) => toast.error(error.message ?? "Could not save board identity"),
  });
}

export function useSaveStep4() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof saveStep4Documents>>,
    ApiError,
    Step4DocumentsRequest
  >({
    mutationFn: saveStep4Documents,
    onSuccess: ({ data }) => {
      toast.success(`${data.saved} document${data.saved === 1 ? "" : "s"} attached.`);
      void invalidateOverview(queryClient);
    },
    onError: (error) => toast.error(error.message ?? "Could not save documents"),
  });
}

export function useSaveStep5() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof saveStep5Infrastructure>>,
    ApiError,
    Step5InfrastructureRequest
  >({
    mutationFn: saveStep5Infrastructure,
    onSuccess: () => {
      toast.success("Infrastructure saved.");
      void invalidateOverview(queryClient);
    },
    onError: (error) => toast.error(error.message ?? "Could not save infrastructure"),
  });
}

export function useSaveStep6() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof saveStep6Configuration>>,
    ApiError,
    Step6ConfigurationRequest
  >({
    mutationFn: saveStep6Configuration,
    onSuccess: () => {
      toast.success("Configuration saved.");
      void invalidateOverview(queryClient);
    },
    onError: (error) => toast.error(error.message ?? "Could not save configuration"),
  });
}

export function useSubmitOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation<Awaited<ReturnType<typeof submitOnboarding>>, ApiError, void>({
    mutationFn: () => submitOnboarding(),
    onSuccess: ({ data }) => {
      toast.success(data.message ?? "Onboarding submitted.");
      void invalidateOverview(queryClient);
      router.push("/dashboard");
    },
    onError: (error) => toast.error(error.message ?? "Could not submit onboarding"),
  });
}

export function usePresignUpload() {
  return useMutation<
    Awaited<ReturnType<typeof presignUpload>>,
    ApiError,
    PresignUploadRequest
  >({
    mutationFn: presignUpload,
    onError: (error) => toast.error(error.message ?? "Could not prepare upload"),
  });
}

export function useConfirmUpload() {
  return useMutation<
    Awaited<ReturnType<typeof confirmUpload>>,
    ApiError,
    ConfirmUploadRequest
  >({
    mutationFn: confirmUpload,
    onError: (error) => toast.error(error.message ?? "Could not confirm upload"),
  });
}
