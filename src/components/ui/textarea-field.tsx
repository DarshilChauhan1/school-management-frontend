"use client";

import {
  Controller,
  get,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Label } from "./label";
import { Textarea } from "./textarea";

interface TextareaFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  placeholder,
  rows = 3,
  maxLength,
  disabled,
}: TextareaFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

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
          <Textarea
            {...field}
            id={name}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled}
            value={(field.value as string | undefined) ?? ""}
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
