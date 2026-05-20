"use client";

import {
  CheckCircle2,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { RowActionsMenu, type RowAction } from "@/components/ui/row-actions-menu";
import { cn } from "@/lib/utils";

import { useDeleteStaff, useStaff } from "../api/use-staff";
import { EMPLOYMENT_TYPE_LABELS, type StaffItem } from "../api/staff.types";
import { useStaffStore } from "../store/staff.store";
import { StaffFormDialog } from "./staff-form-dialog";
import { StaffViewDialog } from "./staff-view-dialog";

const fullName = (staff: StaffItem) =>
  `${staff.user.firstName} ${staff.user.lastName}`.trim();

const initials = (staff: StaffItem) =>
  `${staff.user.firstName?.[0] ?? ""}${staff.user.lastName?.[0] ?? ""}`.toUpperCase();

export function StaffDashboard() {
  const openCreate = useStaffStore((s) => s.openCreate);
  const openEdit = useStaffStore((s) => s.openEdit);
  const openView = useStaffStore((s) => s.openView);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const staffQuery = useStaff({
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: search.trim() || undefined,
  });
  const deleteMutation = useDeleteStaff();

  const staff = staffQuery.data?.data.data ?? [];
  const pagination = staffQuery.data?.data.pagination;
  const totalCount = pagination?.total ?? staff.length;
  const activeCount = staff.filter((s) => s.isActive).length;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const handleDelete = (member: StaffItem) => {
    const confirmed = window.confirm(
      `Deactivate ${fullName(member)}? Their account stays but they're marked inactive.`,
    );
    if (confirmed) deleteMutation.mutate(member.id);
  };

  const columns: DataTableColumn<StaffItem>[] = [
    {
      key: "name",
      header: "Staff",
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {initials(row)}
          </span>
          <div className="min-w-0">
            <div className="truncate font-medium">{fullName(row)}</div>
            <div className="truncate text-xs text-muted-foreground">
              {row.user.auth?.email ?? "No email"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "designation",
      header: "Designation",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate text-sm">{row.designation}</div>
          {row.employeeCode ? (
            <div className="truncate font-mono text-xs text-muted-foreground">
              {row.employeeCode}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (row) =>
        row.department ? (
          <span className="inline-flex w-fit items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
            {row.department.name}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "employment",
      header: "Employment",
      cell: (row) => (
        <span className="inline-flex w-fit items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
          {EMPLOYMENT_TYPE_LABELS[row.employmentType]}
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
            onSelect: () => openEdit(row),
          },
          {
            key: "delete",
            label: "Deactivate",
            icon: <Trash2 className="size-4" />,
            variant: "destructive",
            disabled: deleteMutation.isPending,
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
          label="Total staff"
          value={totalCount}
          hint="Across the school"
          icon={<Users className="size-4" />}
        />
        <MetricTile
          label="Active"
          value={activeCount}
          hint="Visible on this page"
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
        <MetricTile
          label="On this page"
          value={staff.length}
          hint="Current page size"
          icon={<Users className="size-4" />}
          tone="info"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search staff"
              className="pl-8"
            />
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New staff
          </Button>
        </div>

        <DataTable
          columns={columns}
          rows={staff}
          rowKey={(row) => row.id}
          isLoading={staffQuery.isLoading}
          maxBodyHeight={520}
          emptyState={
            <div>
              <Users className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium text-foreground">No staff found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your first staff member to get started.
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
            label: "staff",
            disabled: staffQuery.isFetching,
          }}
        />
      </section>

      <StaffFormDialog />
      <StaffViewDialog />
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
