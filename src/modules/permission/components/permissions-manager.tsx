"use client";

import { Save, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import { useRoles } from "@/modules/role/api/use-roles";

import {
  usePermissionsByModule,
  useRolePermissions,
  useAssignRolePermissions,
} from "../api/use-permissions";
import type { PermissionAction } from "../api/permission.types";

const ACTIONS: PermissionAction[] = [
  "create",
  "read",
  "update",
  "delete",
  "manage",
];

interface SubjectRow {
  subject: string;
  module: string;
  /** action → permissionId (only present when that permission exists) */
  byAction: Partial<Record<PermissionAction, string>>;
}

export function PermissionsManager() {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const rolesQuery = useRoles({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });
  const byModuleQuery = usePermissionsByModule();
  const rolePermsQuery = useRolePermissions(selectedRoleId || undefined);
  const assignMutation = useAssignRolePermissions();

  const roleOptions = useMemo(() => {
    const list = rolesQuery.data?.data.data ?? [];
    return list.map((r) => ({ label: r.name, value: r.id }));
  }, [rolesQuery.data]);

  // Flatten by-module groups into subject rows.
  const rows = useMemo<SubjectRow[]>(() => {
    const groups = byModuleQuery.data?.data ?? [];
    const bySubject = new Map<string, SubjectRow>();
    groups.forEach((group) => {
      group.permissions.forEach((perm) => {
        const existing = bySubject.get(perm.subject);
        if (existing) {
          existing.byAction[perm.action] = perm.id;
        } else {
          bySubject.set(perm.subject, {
            subject: perm.subject,
            module: perm.module ?? group.module,
            byAction: { [perm.action]: perm.id },
          });
        }
      });
    });
    return Array.from(bySubject.values()).sort((a, b) =>
      a.subject.localeCompare(b.subject),
    );
  }, [byModuleQuery.data]);

  // Lookup: "subject:action" → permissionId
  const idBySubjectAction = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((row) => {
      (Object.entries(row.byAction) as [PermissionAction, string][]).forEach(
        ([action, id]) => map.set(`${row.subject}:${action}`, id),
      );
    });
    return map;
  }, [rows]);

  // Permission IDs initially granted to the selected role.
  const initialGrantedIds = useMemo(() => {
    const granted = new Set<string>();
    const modules = rolePermsQuery.data?.data.modules ?? [];
    modules.forEach((mod) => {
      mod.subjects.forEach((sub) => {
        sub.actions.forEach((action) => {
          const id = idBySubjectAction.get(`${sub.subject}:${action}`);
          if (id) granted.add(id);
        });
      });
    });
    return granted;
  }, [rolePermsQuery.data, idBySubjectAction]);

  const isChecked = (permissionId: string) => {
    if (permissionId in overrides) return overrides[permissionId];
    return initialGrantedIds.has(permissionId);
  };

  const toggle = (permissionId: string) => {
    const next = !isChecked(permissionId);
    setOverrides((prev) => {
      const initial = initialGrantedIds.has(permissionId);
      const updated = { ...prev };
      if (next === initial) {
        delete updated[permissionId]; // back to original state
      } else {
        updated[permissionId] = next;
      }
      return updated;
    });
  };

  const toggleRow = (row: SubjectRow) => {
    const ids = Object.values(row.byAction).filter(Boolean) as string[];
    const allOn = ids.every((id) => isChecked(id));
    setOverrides((prev) => {
      const updated = { ...prev };
      ids.forEach((id) => {
        const initial = initialGrantedIds.has(id);
        const target = !allOn;
        if (target === initial) delete updated[id];
        else updated[id] = target;
      });
      return updated;
    });
  };

  const handleRoleChange = (value: string) => {
    setSelectedRoleId(value);
    setOverrides({});
    setPage(1);
  };

  const dirtyCount = Object.keys(overrides).length;

  const handleSave = () => {
    if (!selectedRoleId) return;
    // Final set: every permission id that is currently checked.
    const allIds = Array.from(idBySubjectAction.values());
    const permissionIds = allIds.filter((id) => isChecked(id));
    assignMutation.mutate(
      { roleId: selectedRoleId, permissionIds },
      { onSuccess: () => setOverrides({}) },
    );
  };

  const pageRows = useMemo(
    () => rows.slice((page - 1) * limit, (page - 1) * limit + limit),
    [rows, page, limit],
  );

  const columns: DataTableColumn<SubjectRow>[] = [
    {
      key: "subject",
      header: "Module / Subject",
      cell: (row) => {
        const ids = Object.values(row.byAction).filter(Boolean) as string[];
        const allOn = ids.length > 0 && ids.every((id) => isChecked(id));
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Toggle all ${row.subject}`}
              className="size-4 rounded border-input accent-[var(--brand-600,#059669)]"
              checked={allOn}
              disabled={!selectedRoleId || ids.length === 0}
              onChange={() => toggleRow(row)}
            />
            <div className="min-w-0">
              <div className="truncate font-medium capitalize">
                {row.subject}
              </div>
              <div className="truncate text-xs capitalize text-muted-foreground">
                {row.module}
              </div>
            </div>
          </div>
        );
      },
    },
    ...ACTIONS.map<DataTableColumn<SubjectRow>>((action) => ({
      key: action,
      header: action,
      align: "center",
      headerClassName: "capitalize",
      cell: (row) => {
        const id = row.byAction[action];
        if (!id) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return (
          <input
            type="checkbox"
            aria-label={`${action} ${row.subject}`}
            className="size-4 rounded border-input accent-[var(--brand-600,#059669)] disabled:opacity-50"
            checked={isChecked(id)}
            disabled={!selectedRoleId}
            onChange={() => toggle(id)}
          />
        );
      },
    })),
  ];

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Role</label>
          <div className="w-72 max-w-full">
            <Select
              value={selectedRoleId}
              onValueChange={handleRoleChange}
              options={roleOptions}
              placeholder={
                rolesQuery.isLoading ? "Loading roles…" : "Select a role"
              }
              disabled={rolesQuery.isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Pick a role to view and edit its permission set.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {rolePermsQuery.isFetching && selectedRoleId ? (
            <Spinner className="size-4 text-muted-foreground" />
          ) : null}
          {dirtyCount > 0 ? (
            <span className="text-xs text-amber-600">
              {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"}
            </span>
          ) : null}
          <Button
            onClick={handleSave}
            disabled={
              !selectedRoleId || dirtyCount === 0 || assignMutation.isPending
            }
          >
            {assignMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            Save permissions
          </Button>
        </div>
      </section>

      {!selectedRoleId ? (
        <div className="grid min-h-44 place-items-center rounded-lg border border-dashed bg-card px-6 text-center">
          <div>
            <ShieldCheck className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium">Select a role to begin</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Permissions are listed per module with create / read / update /
              delete / manage toggles.
            </p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(row) => row.subject}
          isLoading={byModuleQuery.isLoading || rolePermsQuery.isLoading}
          maxBodyHeight={520}
          emptyState="No permissions defined yet."
          pagination={{
            page,
            pageSize: limit,
            total: rows.length,
            totalPages: Math.max(1, Math.ceil(rows.length / limit)),
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setLimit(size);
              setPage(1);
            },
            pageSizeOptions: [10, 25, 50],
            label: "modules",
          }}
        />
      )}
    </div>
  );
}
