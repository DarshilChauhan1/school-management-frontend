"use client";

import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Checkbox } from "./checkbox";

interface CheckboxFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField<T extends FieldValues>({
  name,
  label,
  description,
  disabled,
  className,
}: CheckboxFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label
          className={cn(
            "flex cursor-pointer items-start gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <Checkbox
            id={name}
            name={field.name}
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => field.onChange(Boolean(checked))}
            disabled={disabled}
            className="mt-0.5"
          />
          <span className="flex flex-col gap-0.5 leading-tight">
            <span className="font-medium">{label}</span>
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </span>
        </label>
      )}
    />
  );
}
