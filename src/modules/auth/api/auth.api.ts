import { http } from "@/lib/api-client";
import type {
  EnableTwoFactorRequest,
  EnableTwoFactorResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RefreshTokenResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  SignupRequest,
  SignupResponse,
  TwoFactorSetupResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  VerifyMfaLoginRequest,
  VerifyMfaLoginResponse,
} from "./auth.types";

export const loginUser = (body: LoginRequest) =>
  http.post<LoginRequest, LoginResponse>("/auth/login", body, { skipAuth: true });

export const signupUser = (body: SignupRequest) =>
  http.post<SignupRequest, SignupResponse>("/auth/signup", body, { skipAuth: true });

export const verifyEmail = (body: VerifyEmailRequest) =>
  http.post<VerifyEmailRequest, VerifyEmailResponse>("/auth/verify-email", body, {
    skipAuth: true,
  });

export const resendVerification = (body: ResendVerificationRequest) =>
  http.post<ResendVerificationRequest, ResendVerificationResponse>(
    "/auth/resend-verification",
    body,
    { skipAuth: true },
  );

export const verifyMfaLogin = (body: VerifyMfaLoginRequest) =>
  http.post<VerifyMfaLoginRequest, VerifyMfaLoginResponse>(
    "/auth/2fa/verify-login",
    body,
    { skipAuth: true },
  );

export const setupTwoFactor = () =>
  http.post<Record<string, never>, TwoFactorSetupResponse>("/auth/2fa/setup", {});

export const enableTwoFactor = (body: EnableTwoFactorRequest) =>
  http.post<EnableTwoFactorRequest, EnableTwoFactorResponse>(
    "/auth/2fa/enable",
    body,
  );

export const refreshToken = () =>
  http.post<Record<string, never>, RefreshTokenResponse>("/auth/refresh", {}, { skipAuth: true });

export const logoutUser = () =>
  http.post<Record<string, never>, LogoutResponse>("/auth/logout", {});

export const fetchMe = () => http.get<MeResponse>("/auth/me");
