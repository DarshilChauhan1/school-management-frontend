"use client";

import {
  CheckCircle2,
  Edit3,
  Eye,
  Plus,
  Search,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { RowActionsMenu, type RowAction } from "@/components/ui/row-actions-menu";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useDeleteRole, useRoles } from "../api/use-roles";
import type { RoleItem } from "../api/role.types";
import { useRoleStore } from "@/stores/dialog-store";
import { RoleFormDialog } from "./role-form-dialog";
import { RoleViewDialog } from "./role-view-dialog";

type StatusFilter = "all" | "active" | "inactive";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export function RolesDashboard() {
  const openCreate = useRoleStore((s) => s.openCreate);
  const openEdit = useRoleStore((s) => s.openEdit);
  const openView = useRoleStore((s) => s.openView);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const rolesQuery = useRoles({
    page,
    limit,
    sortBy: "name",
    sortOrder: "asc",
    search: search.trim() || undefined,
    isActive: status === "all" ? undefined : status === "active",
  });
  const deleteMutation = useDeleteRole();

  const roles = rolesQuery.data?.data.data ?? [];
  const pagination = rolesQuery.data?.data.pagination;
  const totalCount = pagination?.total ?? roles.length;
  const activeCount = roles.filter((r) => r.isActive).length;
  const systemCount = roles.filter((r) => r.isSystem).length;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleStatusChange = (value: string) => {
    setStatus(value as StatusFilter);
    setPage(1);
  };
  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const handleDelete = (role: RoleItem) => {
    if (role.isSystem) {
      window.alert("System roles cannot be deactivated.");
      return;
    }
    const confirmed = window.confirm(
      `Deactivate ${role.name}? Staff currently holding this role will keep it until reassigned.`,
    );
    if (confirmed) deleteMutation.mutate(role.id);
  };

  const columns: DataTableColumn<RoleItem>[] = [
    {
      key: "role",
      header: "Role",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-mono text-sm font-semibold">
            {row.name}
          </div>
          {row.description ? (
            <div className="truncate text-xs text-muted-foreground">
              {row.description}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "scope",
      header: "Scope",
      cell: (row) => (
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium",
            row.isSystem
              ? "bg-violet-100 text-violet-700"
              : "bg-sky-100 text-sky-700",
          )}
        >
          {row.isSystem ? "System" : "School"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge isActive={row.isActive} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) => {
        const actions: RowAction[] = [
          {
            key: "view",
            label: "View",
            icon: <Eye className="size-4" />,
            onSelect: () => openView(row),
          },
          {
            key: "edit",
            label: "Edit",
            icon: <Edit3 className="size-4" />,
            disabled: row.isSystem,
            onSelect: () => openEdit(row),
          },
          {
            key: "delete",
            label: "Deactivate",
            icon: <Trash2 className="size-4" />,
            variant: "destructive",
            disabled: deleteMutation.isPending || row.isSystem,
            separatorBefore: true,
            onSelect: () => handleDelete(row),
          },
        ];
        return (
          <div className="flex justify-end">
            <RowActionsMenu actions={actions} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        <MetricTile
          label="Total roles"
          value={totalCount}
          hint="Including school + system"
          icon={<Shield className="size-4" />}
        />
        <MetricTile
          label="Active"
          value={activeCount}
          hint="Visible on this page"
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
        <MetricTile
          label="System roles"
          value={systemCount}
          hint="Built-in, read-only"
          icon={<Shield className="size-4" />}
          tone="info"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search roles"
                className="pl-8"
              />
            </div>
            <div className="md:w-48">
              <Select
                value={status}
                onValueChange={handleStatusChange}
                options={STATUS_OPTIONS}
                placeholder="Filter by status"
              />
            </div>
          </div>
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" />
            New role
          </Button>
        </div>

        <DataTable
          columns={columns}
          rows={roles}
          rowKey={(row) => row.id}
          isLoading={rolesQuery.isLoading}
          maxBodyHeight={520}
          emptyState={
            <div>
              <Shield className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium text-foreground">No roles found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first role to start assigning permissions to staff.
              </p>
            </div>
          }
          pagination={{
            page,
            pageSize: limit,
            total: totalCount,
            totalPages: pagination?.totalPages ?? 1,
            onPageChange: setPage,
            onPageSizeChange: handleLimitChange,
            pageSizeOptions: [5, 10, 25, 50],
            label: "roles",
            disabled: rolesQuery.isFetching,
          }}
        />
      </section>

      <RoleFormDialog />
      <RoleViewDialog />
    </div>
  );
}

function MetricTile({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "info";
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "grid size-8 place-items-center rounded-md",
            tone === "success"
              ? "bg-emerald-100 text-emerald-700"
              : tone === "info"
                ? "bg-sky-100 text-sky-700"
                : "bg-brand-100 text-brand-700",
          )}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold leading-none">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700",
      )}
    >
      {isActive ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <XCircle className="size-3" />
      )}
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
