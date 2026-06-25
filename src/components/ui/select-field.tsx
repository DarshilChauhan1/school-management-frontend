"use client";

import {
  Controller,
  get,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Label } from "./label";
import { Select, type SelectOption } from "./select";

interface SelectFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  options: readonly SelectOption[];
  disabled?: boolean;
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  placeholder,
  options,
  disabled,
}: SelectFieldProps<T>) {
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
          <Select
            id={name}
            name={field.name}
            value={(field.value as string | undefined) ?? ""}
            onValueChange={field.onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
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
