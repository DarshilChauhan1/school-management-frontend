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
import { cn } from "@/lib/utils";

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
        <Label htmlFor={name} className="text-xs font-medium text-muted-foreground">
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
            className={cn(
              "h-11 rounded-xl border-transparent bg-paper-2/60 px-3.5 text-sm focus-visible:border-primary focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/10",
              errorMessage && "border-destructive ring-3 ring-destructive/20",
            )}
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
