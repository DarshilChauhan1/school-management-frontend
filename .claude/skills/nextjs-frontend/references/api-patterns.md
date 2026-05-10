# API Patterns Reference

## The Three-File Rule

Every module's `api/` folder has exactly three files:

```
modules/<module>/api/
├── <module>.types.ts   — Request & Response interfaces (no logic)
├── <module>.api.ts     — Pure async functions that call the API
└── use-<module>.ts     — TanStack Query hooks (useQuery / useMutation)
```

---

## Base API Client (`src/lib/api-client.ts`)

```ts
import { ApiError } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

async function apiClient<TResponse>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<TResponse> {
  const { method = "GET", body, headers = {} } = config;

  // Attach auth token from storage (or pass via headers)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      statusCode: response.status,
    }));
    throw errorData;
  }

  return response.json() as Promise<TResponse>;
}

export const http = {
  get: <TRes>(endpoint: string, headers?: Record<string, string>) =>
    apiClient<TRes>(endpoint, { method: "GET", headers }),

  post: <TReq, TRes>(endpoint: string, body: TReq) =>
    apiClient<TRes>(endpoint, { method: "POST", body }),

  put: <TReq, TRes>(endpoint: string, body: TReq) =>
    apiClient<TRes>(endpoint, { method: "PUT", body }),

  patch: <TReq, TRes>(endpoint: string, body: TReq) =>
    apiClient<TRes>(endpoint, { method: "PATCH", body }),

  delete: <TRes>(endpoint: string) =>
    apiClient<TRes>(endpoint, { method: "DELETE" }),
};
```

---

## Query Client (`src/lib/query-client.ts`)

```ts
import { QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always a new instance
    return new QueryClient({
      defaultOptions: { queries: { staleTime: 60 * 1000 } },
    });
  }
  // Client: singleton
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return queryClient;
}
```

---

## Query Keys Convention

```ts
// src/modules/<module>/api/<module>.keys.ts
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UsersListRequest) =>
    [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

---

## Example: Users Module

### `modules/users/api/users.types.ts`

```ts
import { ApiResponse, PaginatedResponse } from "@/types/api";

// ─── Domain Entity ─────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
  createdAt: string;
  updatedAt: string;
}

// ─── List ──────────────────────────────────────────────────────────────────
export interface UsersListRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: User["role"];
}

export type UsersListResponse = ApiResponse<PaginatedResponse<User>>;

// ─── Get by ID ─────────────────────────────────────────────────────────────
export interface GetUserRequest {
  id: string;
}

export type GetUserResponse = ApiResponse<User>;

// ─── Create ────────────────────────────────────────────────────────────────
export interface CreateUserRequest {
  name: string;
  email: string;
  role: User["role"];
  password: string;
}

export type CreateUserResponse = ApiResponse<User>;

// ─── Update ────────────────────────────────────────────────────────────────
export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  role?: User["role"];
}

export type UpdateUserResponse = ApiResponse<User>;

// ─── Delete ────────────────────────────────────────────────────────────────
export interface DeleteUserRequest {
  id: string;
}

export type DeleteUserResponse = ApiResponse<{ id: string }>;
```

### `modules/users/api/users.api.ts`

```ts
import { http } from "@/lib/api-client";
import type {
  UsersListRequest,
  UsersListResponse,
  GetUserRequest,
  GetUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserRequest,
  DeleteUserResponse,
} from "./users.types";

export async function fetchUsers(
  params: UsersListRequest
): Promise<UsersListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  return http.get<UsersListResponse>(`/users?${query}`);
}

export async function fetchUser(
  params: GetUserRequest
): Promise<GetUserResponse> {
  return http.get<GetUserResponse>(`/users/${params.id}`);
}

export async function createUser(
  body: CreateUserRequest
): Promise<CreateUserResponse> {
  return http.post<CreateUserRequest, CreateUserResponse>("/users", body);
}

export async function updateUser(
  body: UpdateUserRequest
): Promise<UpdateUserResponse> {
  const { id, ...rest } = body;
  return http.patch<Omit<UpdateUserRequest, "id">, UpdateUserResponse>(
    `/users/${id}`,
    rest
  );
}

export async function deleteUser(
  params: DeleteUserRequest
): Promise<DeleteUserResponse> {
  return http.delete<DeleteUserResponse>(`/users/${params.id}`);
}
```

### `modules/users/api/use-users.ts`

```ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/types/api";
import {
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
} from "./users.api";
import { userKeys } from "./users.keys";
import type {
  UsersListRequest,
  GetUserRequest,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
} from "./users.types";

// ─── Queries ───────────────────────────────────────────────────────────────

export function useUsers(params: UsersListRequest = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUsers(params),
  });
}

export function useUser(params: GetUserRequest) {
  return useQuery({
    queryKey: userKeys.detail(params.id),
    queryFn: () => fetchUser(params),
    enabled: Boolean(params.id),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserRequest) => createUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to create user");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserRequest) => updateUser(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update user");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: DeleteUserRequest) => deleteUser(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User deleted");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to delete user");
    },
  });
}
```

---

## Auth Module Example (login/register)

### `modules/auth/api/auth.types.ts`

```ts
import { ApiResponse } from "@/types/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
}
export type LoginResponse = ApiResponse<{ user: User; tokens: AuthTokens }>;

// Register
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export type RegisterResponse = ApiResponse<{ user: User; tokens: AuthTokens }>;

// Refresh
export interface RefreshTokenRequest {
  refreshToken: string;
}
export type RefreshTokenResponse = ApiResponse<AuthTokens>;

// Logout
export type LogoutResponse = ApiResponse<null>;
```

### `modules/auth/api/auth.api.ts`

```ts
import { http } from "@/lib/api-client";
import type {
  LoginRequest, LoginResponse,
  RegisterRequest, RegisterResponse,
  RefreshTokenRequest, RefreshTokenResponse,
  LogoutResponse,
} from "./auth.types";

export const loginUser = (body: LoginRequest) =>
  http.post<LoginRequest, LoginResponse>("/auth/login", body);

export const registerUser = (body: RegisterRequest) =>
  http.post<RegisterRequest, RegisterResponse>("/auth/register", body);

export const refreshToken = (body: RefreshTokenRequest) =>
  http.post<RefreshTokenRequest, RefreshTokenResponse>("/auth/refresh", body);

export const logoutUser = () =>
  http.post<Record<string, never>, LogoutResponse>("/auth/logout", {});
```

### `modules/auth/api/use-auth.ts`

```ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/types/api";
import { loginUser, registerUser, logoutUser } from "./auth.api";
import { useAuthStore } from "../store/auth.store";
import type { LoginRequest, RegisterRequest } from "./auth.types";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (body: LoginRequest) => loginUser(body),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.tokens.accessToken);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Login failed");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (body: RegisterRequest) => registerUser(body),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.tokens.accessToken);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Registration failed");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      clearAuth();
      router.push("/login");
      toast.info("You have been logged out");
    },
  });
}
```
