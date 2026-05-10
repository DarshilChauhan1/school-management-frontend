import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  ConfirmUploadRequest,
  ConfirmUploadResult,
  PresignUploadRequest,
  PresignUploadResult,
  Step1SchoolRequest,
  Step2LegalEntityRequest,
  Step3BoardRequest,
  Step4DocumentsRequest,
  Step5InfrastructureRequest,
  Step6ConfigurationRequest,
  SubmitOnboardingResponse,
  OnboardingOverviewResponse,
} from "./onboarding.types";

export const fetchOnboardingOverview = () =>
  http.get<OnboardingOverviewResponse>("/onboarding/overview");

export const saveStep1School = (body: Step1SchoolRequest) =>
  http.patch<Step1SchoolRequest, ApiResponse<unknown>>("/onboarding/step-1", body);

export const saveStep2LegalEntity = (body: Step2LegalEntityRequest) =>
  http.patch<Step2LegalEntityRequest, ApiResponse<unknown>>("/onboarding/step-2", body);

export const saveStep3Board = (body: Step3BoardRequest) =>
  http.patch<Step3BoardRequest, ApiResponse<unknown>>("/onboarding/step-3", body);

export const saveStep4Documents = (body: Step4DocumentsRequest) =>
  http.patch<Step4DocumentsRequest, ApiResponse<{ saved: number }>>(
    "/onboarding/step-4",
    body,
  );

export const saveStep5Infrastructure = (body: Step5InfrastructureRequest) =>
  http.patch<Step5InfrastructureRequest, ApiResponse<unknown>>(
    "/onboarding/step-5",
    body,
  );

export const saveStep6Configuration = (body: Step6ConfigurationRequest) =>
  http.patch<Step6ConfigurationRequest, ApiResponse<unknown>>(
    "/onboarding/step-6",
    body,
  );

export const submitOnboarding = () =>
  http.post<Record<string, never>, SubmitOnboardingResponse>("/onboarding/submit", {});

export const presignUpload = (body: PresignUploadRequest) =>
  http.post<PresignUploadRequest, ApiResponse<PresignUploadResult>>(
    "/upload/presign",
    body,
  );

export const confirmUpload = (body: ConfirmUploadRequest) =>
  http.post<ConfirmUploadRequest, ApiResponse<ConfirmUploadResult>>(
    "/upload/confirm",
    body,
  );
