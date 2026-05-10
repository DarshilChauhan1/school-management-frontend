"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiError } from "@/types/api";
import { useAuthStore } from "../store/auth.store";
import {
  enableTwoFactor,
  fetchMe,
  loginUser,
  logoutUser,
  resendVerification,
  setupTwoFactor,
  signupUser,
  verifyEmail,
  verifyMfaLogin,
} from "./auth.api";
import { authKeys } from "./auth.keys";
import {
  isLoginActive,
  isMfaRequired,
  isOnboardingStage,
  type EnableTwoFactorRequest,
  type LoginRequest,
  type ResendVerificationRequest,
  type SignupRequest,
  type VerifyEmailRequest,
  type VerifyMfaLoginRequest,
} from "./auth.types";

const isUnverifiedAccountError = (err: ApiError) =>
  /account is\s+pending/i.test(err.message ?? "") ||
  /verify your email/i.test(err.message ?? "");

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setMfaChallenge = useAuthStore((s) => s.setMfaChallenge);

  return useMutation<
    Awaited<ReturnType<typeof loginUser>>,
    ApiError,
    LoginRequest
  >({
    mutationFn: (body) => loginUser(body),
    onSuccess: ({ data }, variables) => {
      if (isMfaRequired(data)) {
        setMfaChallenge({ ticket: data.mfaTicket, email: variables.email });
        router.push("/auth/two-factor");
        return;
      }
      if (isOnboardingStage(data)) {
        toast.info("Continue your school onboarding to finish setup.");
        router.push("/auth/login");
        return;
      }
      if (isLoginActive(data)) {
        setAuth(data.user, data.tokens.accessToken);
        toast.success(`Welcome back, ${data.user.firstName}!`);
        router.push(
          data.user.schoolId
            ? data.user.is2FAEnabled
              ? "/dashboard"
              : "/auth/two-factor-setup"
            : "/onboarding",
        );
      }
    },
    onError: (error: ApiError) => {
      if (!isUnverifiedAccountError(error)) {
        toast.error(error.message ?? "Login failed");
      }
    },
  });
}

export function useSignup() {
  const router = useRouter();

  return useMutation<
    Awaited<ReturnType<typeof signupUser>>,
    ApiError,
    SignupRequest
  >({
    mutationFn: (body) => signupUser(body),
    onSuccess: ({ data }, variables) => {
      toast.success(data.message ?? "Account created. Please verify your email.");
      router.push(`/auth/login?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Signup failed");
    },
  });
}

export function useVerifyEmail() {
  return useMutation<
    Awaited<ReturnType<typeof verifyEmail>>,
    ApiError,
    VerifyEmailRequest
  >({
    mutationFn: (body) => verifyEmail(body),
  });
}

export function useResendVerification() {
  return useMutation<
    Awaited<ReturnType<typeof resendVerification>>,
    ApiError,
    ResendVerificationRequest
  >({
    mutationFn: (body) => resendVerification(body),
    onSuccess: ({ data }) => {
      toast.success(data.message ?? "Verification email sent.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Could not resend verification email");
    },
  });
}

export function useVerifyMfaLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setMfaChallenge = useAuthStore((s) => s.setMfaChallenge);

  return useMutation<
    Awaited<ReturnType<typeof verifyMfaLogin>>,
    ApiError,
    VerifyMfaLoginRequest
  >({
    mutationFn: (body) => verifyMfaLogin(body),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.tokens.accessToken);
      setMfaChallenge(null);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      router.push(data.user.schoolId ? "/dashboard" : "/onboarding");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Verification failed");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.push("/auth/login");
      toast.info("You have been logged out");
    },
  });
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: fetchMe,
    enabled: isAuthenticated,
  });
}

export function useTwoFactorSetup() {
  return useMutation<
    Awaited<ReturnType<typeof setupTwoFactor>>,
    ApiError,
    void
  >({
    mutationFn: () => setupTwoFactor(),
    onError: (error) => {
      toast.error(error.message ?? "Could not start 2FA setup");
    },
  });
}

export function useEnableTwoFactor() {
  return useMutation<
    Awaited<ReturnType<typeof enableTwoFactor>>,
    ApiError,
    EnableTwoFactorRequest
  >({
    mutationFn: (body) => enableTwoFactor(body),
  });
}

export { isUnverifiedAccountError };
