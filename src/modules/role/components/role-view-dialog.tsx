"use client";

import { CheckCircle2, ShieldCheck, ShieldOff, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useRolePermissions } from "@/modules/permission/api/use-permissions";
import type { PermissionAction } from "@/modules/permission/api/permission.types";
import {
  ACTION_META,
  ACTION_ORDER,
  getModuleIcon,
  humanizeLabel,
} from "@/modules/permission/constants/permission-ui";

import { useRoleStore } from "@/stores/dialog-store";

const formatDate = (value: string) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const sortActions = (actions: PermissionAction[]) =>
  [...actions].sort(
    (a, b) => ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b),
  );

export function RoleViewDialog() {
  const viewing = useRoleStore((s) => s.viewing);
  const closeView = useRoleStore((s) => s.closeView);

  const isOpen = Boolean(viewing);
  const permsQuery = useRolePermissions(viewing?.id);
  const modules = permsQuery.data?.data.modules ?? [];
  const totalGranted = modules.reduce(
    (sum, m) =>
      sum + m.subjects.reduce((s, sub) => s + sub.actions.length, 0),
    0,
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeView()}>
      <DialogContent className="max-w-2xl">
        {viewing ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-md bg-brand-100 text-brand-700">
                  <ShieldCheck className="size-4" />
                </span>
                {humanizeLabel(viewing.name)}
              </DialogTitle>
              <DialogDescription>
                {viewing.description || "No description provided."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Pill
                tone={viewing.isActive ? "success" : "danger"}
                icon={
                  viewing.isActive ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <XCircle className="size-3" />
                  )
                }
              >
                {viewing.isActive ? "Active" : "Inactive"}
              </Pill>
              <Pill tone={viewing.isSystem ? "violet" : "sky"}>
                {viewing.isSystem ? "System role" : "School role"}
              </Pill>
              <Pill tone="muted">Created {formatDate(viewing.createdAt)}</Pill>
            </div>

            <div className="border-t pt-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">What this role can do</h3>
                <span className="text-xs text-muted-foreground">
                  {totalGranted} permission{totalGranted === 1 ? "" : "s"}
                </span>
              </div>

              <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
                {permsQuery.isLoading ? (
                  <div className="grid min-h-32 place-items-center">
                    <Spinner className="size-5 text-muted-foreground" />
                  </div>
                ) : modules.length === 0 ? (
                  <div className="grid min-h-32 place-items-center rounded-lg border border-dashed bg-muted/30 px-6 text-center">
                    <div>
                      <ShieldOff className="mx-auto mb-2 size-7 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        No permissions yet
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        This role can&apos;t do anything until permissions are
                        assigned.
                      </p>
                    </div>
                  </div>
                ) : (
                  modules.map((mod) => {
                    const ModuleIcon = getModuleIcon(mod.module);
                    return (
                      <section key={mod.module} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="grid size-7 place-items-center rounded-md bg-brand-100 text-brand-700">
                            <ModuleIcon className="size-4" />
                          </span>
                          <h4 className="text-sm font-semibold capitalize">
                            {humanizeLabel(mod.module)}
                          </h4>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {mod.subjects.map((sub) => (
                            <div
                              key={sub.subject}
                              className="rounded-lg border bg-card p-3"
                            >
                              <div className="mb-2 text-sm font-medium capitalize">
                                {humanizeLabel(sub.subject)}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {sortActions(sub.actions).map((action) => {
                                  const meta = ACTION_META[action];
                                  if (!meta) return null;
                                  const Icon = meta.icon;
                                  return (
                                    <span
                                      key={action}
                                      title={meta.description}
                                      className={cn(
                                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                                        meta.chip,
                                      )}
                                    >
                                      <Icon className="size-3" />
                                      {meta.label}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Pill({
  children,
  tone,
  icon,
}: {
  children: React.ReactNode;
  tone: "success" | "danger" | "violet" | "sky" | "muted";
  icon?: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-rose-100 text-rose-700",
    violet: "bg-violet-100 text-violet-700",
    sky: "bg-sky-100 text-sky-700",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}
