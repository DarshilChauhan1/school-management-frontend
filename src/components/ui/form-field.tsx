"use client";

import {
  Controller,
  get,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "./input";
import { Label } from "./label";

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  disabled,
  autoComplete,
}: FormFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  console.log(errors)
  const errorMessage = get(errors, name)?.message as string | undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            className={errorMessage ? "border-destructive ring-3 ring-destructive/20" : undefined}
            aria-invalid={Boolean(errorMessage)}
          />
        )}
      />
      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
