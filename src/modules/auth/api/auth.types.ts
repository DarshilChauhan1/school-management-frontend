import type { ApiResponse } from "@/types/api";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  schoolId?: string | null;
  is2FAEnabled?: boolean;
  isTempPass?: boolean;
  role?: string;
  permissions?: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginActiveResult {
  tokens: AuthTokens;
  user: AuthUser;
}

export interface LoginMfaRequiredResult {
  stage: "mfa_required";
  mfaTicket: string;
}

export interface LoginOnboardingResult {
  stage: "onboarding";
  onboardingToken: string;
  onboardingId: string;
  currentStep: number;
  status: "DRAFT" | "SUBMITTED" | "REJECTED" | "APPROVED";
}

export type LoginResultData =
  | LoginActiveResult
  | LoginMfaRequiredResult
  | LoginOnboardingResult;

export type LoginResponse = ApiResponse<LoginResultData>;

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}
export type SignupResponse = ApiResponse<{
  userId: string;
  onboardingId: string;
  message: string;
}>;

export interface VerifyEmailRequest {
  token: string;
}
export type VerifyEmailResponse = ApiResponse<{
  message: string;
  onboardingToken?: string;
  onboardingId: string;
  currentStep: number;
}>;

export interface ResendVerificationRequest {
  email: string;
}
export type ResendVerificationResponse = ApiResponse<{ message: string }>;

export interface VerifyMfaLoginRequest {
  mfaTicket: string;
  code: string;
}
export type VerifyMfaLoginResponse = ApiResponse<LoginActiveResult>;

export type TwoFactorSetupResponse = ApiResponse<{
  otpauthUrl: string;
  qrCodeDataUrl: string;
  secret: string;
}>;

export interface EnableTwoFactorRequest {
  code: string;
}
export type EnableTwoFactorResponse = ApiResponse<{
  enabled: true;
  recoveryCodes: string[];
  downloadContent: string;
  message: string;
}>;

export interface ChangeTempPasswordRequest {
  currentPassword: string;
  newPassword: string;
}
export type ChangeTempPasswordResponse = ApiResponse<{ message: string }>;

export type RefreshTokenResponse = ApiResponse<AuthTokens>;
export type LogoutResponse = ApiResponse<null>;
export type MeResponse = ApiResponse<AuthUser>;

export const isMfaRequired = (
  d: LoginResultData,
): d is LoginMfaRequiredResult =>
  (d as LoginMfaRequiredResult).stage === "mfa_required";

export const isOnboardingStage = (
  d: LoginResultData,
): d is LoginOnboardingResult =>
  (d as LoginOnboardingResult).stage === "onboarding";

export const isLoginActive = (d: LoginResultData): d is LoginActiveResult =>
  !("stage" in d) || (d as { stage?: string }).stage === undefined;
