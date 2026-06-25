"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

import type {
  PermissionAction,
  PermissionsByModuleGroup,
} from "../api/permission.types";
import {
  ACTION_META,
  ACTION_ORDER,
  getModuleIcon,
  humanizeLabel,
} from "../constants/permission-ui";

interface SubjectGroup {
  subject: string;
  /** action → permissionId */
  byAction: Partial<Record<PermissionAction, string>>;
}

interface ModuleGroup {
  module: string;
  subjects: SubjectGroup[];
}

function buildGroups(groups: PermissionsByModuleGroup[]): ModuleGroup[] {
  return groups
    .map((group) => {
      const bySubject = new Map<string, SubjectGroup>();
      group.permissions.forEach((perm) => {
        const existing = bySubject.get(perm.subject);
        if (existing) {
          existing.byAction[perm.action] = perm.id;
        } else {
          bySubject.set(perm.subject, {
            subject: perm.subject,
            byAction: { [perm.action]: perm.id },
          });
        }
      });
      return {
        module: group.module,
        subjects: Array.from(bySubject.values()).sort((a, b) =>
          a.subject.localeCompare(b.subject),
        ),
      };
    })
    .sort((a, b) => a.module.localeCompare(b.module));
}

interface PermissionPickerProps {
  groups: PermissionsByModuleGroup[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleMany: (ids: string[], on: boolean) => void;
}

export function PermissionPicker({
  groups,
  selectedIds,
  onToggle,
  onToggleMany,
}: PermissionPickerProps) {
  const moduleGroups = useMemo(() => buildGroups(groups), [groups]);

  if (moduleGroups.length === 0) {
    return (
      <p className="rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
        No permissions are defined yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {moduleGroups.map((group) => {
        const ModuleIcon = getModuleIcon(group.module);
        const moduleIds = group.subjects.flatMap(
          (s) => Object.values(s.byAction).filter(Boolean) as string[],
        );
        const selectedInModule = moduleIds.filter((id) =>
          selectedIds.has(id),
        ).length;
        const allOn =
          moduleIds.length > 0 && selectedInModule === moduleIds.length;

        return (
          <section key={group.module} className="space-y-2">
            <header className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-md bg-brand-100 text-brand-700">
                  <ModuleIcon className="size-4" />
                </span>
                <h3 className="text-sm font-semibold capitalize">
                  {humanizeLabel(group.module)}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {selectedInModule}/{moduleIds.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onToggleMany(moduleIds, !allOn)}
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                {allOn ? "Clear all" : "Select all"}
              </button>
            </header>

            <div className="grid gap-2 sm:grid-cols-2">
              {group.subjects.map((subject) => {
                const SubjectIcon = getModuleIcon(subject.subject);
                return (
                  <div
                    key={subject.subject}
                    className="rounded-lg border bg-card p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <SubjectIcon className="size-4 text-muted-foreground" />
                      <span className="truncate text-sm font-medium capitalize">
                        {humanizeLabel(subject.subject)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ACTION_ORDER.map((action) => {
                        const id = subject.byAction[action];
                        if (!id) return null;
                        const meta = ACTION_META[action];
                        const Icon = meta.icon;
                        const on = selectedIds.has(id);
                        return (
                          <button
                            key={action}
                            type="button"
                            title={meta.description}
                            onClick={() => onToggle(id)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-colors",
                              on
                                ? cn(meta.chip, "border-transparent")
                                : "border-input bg-background text-muted-foreground hover:bg-muted",
                            )}
                          >
                            <Icon className="size-3" />
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
