# Form Patterns Reference

## The Form Stack

```
Zod schema         → defines shape + validation rules
React Hook Form    → manages form state + errors
@hookform/resolvers → bridges RHF ↔ Zod
Sonner             → toast feedback on submit success/error
```

Every form follows this exact pattern:

1. **Define schema** in `modules/<m>/schemas/<m>.schema.ts`
2. **Derive TypeScript type** from schema with `z.infer<>`
3. **Build form** with `useForm<SchemaType>({ resolver: zodResolver(schema) })`
4. **Wrap with `<FormProvider>`** when using `<FormField>` sub-components
5. **Call mutation** in `onSubmit` — Sonner toasts live in the mutation hook

---

## Zod Schema Conventions

```ts
// modules/users/schemas/users.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["admin", "user", "viewer"], {
    errorMap: () => ({ message: "Select a valid role" }),
  }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ password: true });

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// Login
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Password confirmation pattern
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
```

---

## Login Form (complete example)

```tsx
// modules/auth/components/login-form.tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { useLogin } from "../api/use-auth";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: login, isPending } = useLogin();

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormField<LoginFormValues>
          name="email"
          label="Email"
          placeholder="you@example.com"
          type="email"
        />
        <FormField<LoginFormValues>
          name="password"
          label="Password"
          placeholder="••••••••"
          type="password"
        />
        <Button type="submit" className="w-full" isLoading={isPending}>
          Sign In
        </Button>
      </form>
    </FormProvider>
  );
}
```

---

## Create User Form (with Select and complex fields)

```tsx
// modules/users/components/create-user-form.tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserFormValues } from "../schemas/users.schema";
import { useCreateUser } from "../api/use-users";
import { useUsersStore } from "../store/users.store";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
  { label: "Viewer", value: "viewer" },
] as const;

export function CreateUserForm() {
  const closeModal = useUsersStore((s) => s.closeCreateModal);

  const methods = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "user" },
  });

  const { mutate: createUser, isPending } = useCreateUser();

  const onSubmit = (values: CreateUserFormValues) => {
    createUser(values, {
      onSuccess: () => {
        methods.reset();
        closeModal();
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormField<CreateUserFormValues>
          name="name"
          label="Full Name"
          placeholder="Jane Doe"
        />
        <FormField<CreateUserFormValues>
          name="email"
          label="Email"
          placeholder="jane@example.com"
          type="email"
        />
        <FormField<CreateUserFormValues>
          name="password"
          label="Password"
          type="password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
        />

        {/* Select example using Controller directly */}
        <SelectField<CreateUserFormValues>
          name="role"
          label="Role"
          options={ROLE_OPTIONS}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            Create User
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
```

---

## SelectField Component

```tsx
// components/ui/select-field.tsx
"use client";

import {
  useFormContext,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/utils";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  options: readonly SelectOption[];
  disabled?: boolean;
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  disabled,
}: SelectFieldProps<T>) {
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
        <div className="flex flex-col gap-1">
          {label && (
            <label className="text-sm font-medium text-gray-700">{label}</label>
          )}
          <select
            {...field}
            disabled={disabled}
            className={cn(
              "w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500"
            )}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    />
  );
}
```

---

## Sonner Toast Patterns

Sonner is initialized once in the root `Providers` component:

```tsx
// src/providers/index.tsx
import { Toaster } from "sonner";
<Toaster position="top-right" richColors closeButton />
```

Then called from mutation hooks only — **never from component `onSubmit`**:

```ts
// In use-<module>.ts mutation hooks:
onSuccess: () => toast.success("Saved!"),
onError: (err: ApiError) => toast.error(err.message),

// Other variants:
toast.info("Copied to clipboard");
toast.warning("You have unsaved changes");
toast.loading("Uploading..."); // returns an id
toast.dismiss(id);             // dismiss programmatically

// Promise shorthand:
toast.promise(uploadFn(), {
  loading: "Uploading file...",
  success: "File uploaded!",
  error: "Upload failed",
});
```

---

## Form Error Handling (field-level vs global)

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

// Field errors are automatic via FormField / Zod
// Global / server errors go in a separate state:

function MyForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const methods = useForm<MyFormValues>({ resolver: zodResolver(mySchema) });

  const { mutate } = useMyMutation();

  const onSubmit = (values: MyFormValues) => {
    setServerError(null);
    mutate(values, {
      onError: (err: ApiError) => {
        // Map server field errors to RHF
        if (err.errors) {
          Object.entries(err.errors).forEach(([field, messages]) => {
            methods.setError(field as keyof MyFormValues, {
              message: messages[0],
            });
          });
        } else {
          setServerError(err.message);
        }
      },
    });
  };

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}
      {/* fields... */}
    </form>
  );
}
```

---

## Validation Summary

| Concern | Where it lives |
|---|---|
| Shape + rules | Zod schema in `schemas/` |
| Field error display | `FormField` / `SelectField` components |
| Submit state | `isPending` from `useMutation` |
| Success feedback | `toast.success()` in mutation `onSuccess` |
| Error feedback | `toast.error()` in mutation `onError` |
| Server field errors | `methods.setError()` in mutation `onError` |
| Global server error | Local `useState<string \| null>` in form |
