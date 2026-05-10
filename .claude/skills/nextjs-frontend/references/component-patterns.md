# Component Patterns & Zustand Reference

## Component Architecture Principles

1. **Page components are thin** — no business logic, only composition
2. **Feature components own their data-fetching hooks** — colocated with the module
3. **UI components are pure/dumb** — accept props, emit callbacks, no side effects
4. **One concern per file** — if a component grows beyond ~150 lines, split it
5. **`"use client"` only where needed** — prefer Server Components for static/data-fetched content

---

## Component Categories

```
components/ui/          ← Dumb atoms (Button, Input, Modal, Spinner…)
components/layout/      ← Structural chrome (Header, Sidebar, PageWrapper…)
modules/<m>/components/ ← Feature-specific smart components
```

---

## Reusable UI Primitives

### `components/ui/button.tsx`

```tsx
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "destructive" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", isLoading, className, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
);
Button.displayName = "Button";
```

### `components/ui/input.tsx`

```tsx
import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
          "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
```

### `components/ui/form-field.tsx` (RHF-aware wrapper)

```tsx
"use client";

import { useFormContext, Controller, type FieldPath, type FieldValues } from "react-hook-form";
import { Input } from "./input";

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  disabled,
}: FormFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          {...field}
          id={name}
          label={label}
          placeholder={placeholder}
          type={type}
          error={error}
          disabled={disabled}
        />
      )}
    />
  );
}
```

### `components/ui/spinner.tsx`

```tsx
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <svg
      className={cn("animate-spin text-current", sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
```

---

## Zustand Store Patterns

### Basic Auth Store (`modules/auth/store/auth.store.ts`)

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,

      // Actions
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

### UI State Store (`modules/users/store/users.store.ts`)

```ts
import { create } from "zustand";

interface UsersUIState {
  selectedUserId: string | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  searchQuery: string;
}

interface UsersUIActions {
  selectUser: (id: string | null) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (id: string) => void;
  closeEditModal: () => void;
  setSearchQuery: (q: string) => void;
}

type UsersStore = UsersUIState & UsersUIActions;

export const useUsersStore = create<UsersStore>()((set) => ({
  // State
  selectedUserId: null,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  searchQuery: "",

  // Actions
  selectUser: (id) => set({ selectedUserId: id }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openEditModal: (id) => set({ selectedUserId: id, isEditModalOpen: true }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedUserId: null }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
```

---

## Thin Page Component Pattern

```tsx
// src/app/(dashboard)/users/page.tsx  — Server Component
import { Suspense } from "react";
import { UserListSection } from "@/modules/users/components/user-list-section";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Spinner } from "@/components/ui/spinner";

export default function UsersPage() {
  return (
    <PageWrapper title="Users" description="Manage your team members">
      <Suspense fallback={<Spinner size="lg" />}>
        <UserListSection />
      </Suspense>
    </PageWrapper>
  );
}
```

```tsx
// src/modules/users/components/user-list-section.tsx — Client Component
"use client";

import { useUsers } from "../api/use-users";
import { useUsersStore } from "../store/users.store";
import { UserCard } from "./user-card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function UserListSection() {
  const { searchQuery, openCreateModal } = useUsersStore();
  const { data, isLoading, isError } = useUsers({ search: searchQuery });

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-red-500">Failed to load users.</p>;

  const users = data?.data.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{users.length} users</p>
        <Button onClick={openCreateModal}>Add User</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
```

---

## `lib/utils.ts`

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
```
