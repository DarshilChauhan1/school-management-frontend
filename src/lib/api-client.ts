import { useAuthStore } from "@/modules/auth/store/auth.store";
import type { ApiError } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

async function apiClient<TResponse>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<TResponse> {
  const { method = "GET", body, headers = {}, skipAuth = false } = config;

  const token = skipAuth ? null : useAuthStore.getState().token;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      statusCode: response.status,
    }));
    throw errorData;
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export const http = {
  get: <TRes>(endpoint: string, config?: Omit<RequestConfig, "method" | "body">) =>
    apiClient<TRes>(endpoint, { ...config, method: "GET" }),

  post: <TReq, TRes>(endpoint: string, body: TReq, config?: Omit<RequestConfig, "method" | "body">) =>
    apiClient<TRes>(endpoint, { ...config, method: "POST", body }),

  put: <TReq, TRes>(endpoint: string, body: TReq, config?: Omit<RequestConfig, "method" | "body">) =>
    apiClient<TRes>(endpoint, { ...config, method: "PUT", body }),

  patch: <TReq, TRes>(endpoint: string, body: TReq, config?: Omit<RequestConfig, "method" | "body">) =>
    apiClient<TRes>(endpoint, { ...config, method: "PATCH", body }),

  delete: <TRes>(endpoint: string, config?: Omit<RequestConfig, "method" | "body">) =>
    apiClient<TRes>(endpoint, { ...config, method: "DELETE" }),
};
