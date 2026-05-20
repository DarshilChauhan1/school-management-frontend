"use client";

import { Spinner } from "@/components/ui/spinner";

import type { PermissionAction } from "../api/permission.types";
import { useAbilityMeta, useAppAbility } from "../ability/ability-context";
import { Forbidden } from "./forbidden";

interface PermissionGuardProps {
  /** Subject to check against, e.g. "classes", "roles". */
  subject: string;
  /** Required action — defaults to "read" for page-level view access. */
  action?: PermissionAction;
  children: React.ReactNode;
}

export function PermissionGuard({
  subject,
  action = "read",
  children,
}: PermissionGuardProps) {
  const ability = useAppAbility();
  const { isLoading, isError } = useAbilityMeta();

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Forbidden
        message="Could not load your permissions"
        hint="Please refresh the page or sign in again."
      />
    );
  }

  if (!ability.can(action, subject)) {
    return <Forbidden />;
  }

  return <>{children}</>;
}
