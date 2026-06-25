"use client";

import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Eye,
  Plus,
  Search,
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

import {
  useDeleteDepartment,
  useDepartments,
} from "../api/use-departments";
import type { DepartmentSummary } from "../api/department.types";
import { useDepartmentStore } from "@/stores/dialog-store";
import { DepartmentFormDialog } from "./department-form-dialog";
import { DepartmentViewDialog } from "./department-view-dialog";

type StatusFilter = "all" | "active" | "inactive";

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const hodName = (department: DepartmentSummary) =>
  department.hod
    ? `${department.hod.firstName} ${department.hod.lastName}`.trim()
    : "Not assigned";

export function DepartmentsDashboard() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const openCreate = useDepartmentStore((state) => state.openCreate);
  const openEdit = useDepartmentStore((state) => state.openEdit);
  const openView = useDepartmentStore((state) => state.openView);

  const departmentsQuery = useDepartments({
    page,
    limit,
    sortBy: "name",
    sortOrder: "asc",
    search: search.trim() || undefined,
    isActive: status === "all" ? undefined : status === "active",
  });
  const deleteDepartment = useDeleteDepartment();

  const departments = departmentsQuery.data?.data.data ?? [];
  const pagination = departmentsQuery.data?.data.pagination;

  const totalCount = pagination?.total ?? departments.length;
  const activeCount = departments.filter((d) => d.isActive).length;
  const withHodCount = departments.filter((d) => d.hodUserId).length;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleStatusChange = (value: StatusFilter) => {
    setStatus(value);
    setPage(1);
  };
  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const handleDelete = (department: DepartmentSummary) => {
    const confirmed = window.confirm(
      `Delete ${department.name}? Child departments must be reassigned first.`,
    );
    if (confirmed) deleteDepartment.mutate(department.id);
  };

  const columns: DataTableColumn<DepartmentSummary>[] = [
    {
      key: "department",
      header: "Department",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {row.description || "No description added"}
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "Code",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.code || "—"}
        </span>
      ),
    },
    {
      key: "hod",
      header: "HOD",
      cell: (row) => (
        <span className="truncate text-muted-foreground">{hodName(row)}</span>
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
            label: "Delete",
            icon: <Trash2 className="size-4" />,
            variant: "destructive",
            disabled: deleteDepartment.isPending,
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
          label="Total departments"
          value={totalCount}
          hint="Across the school"
          icon={<Building2 className="size-4" />}
        />
        <MetricTile
          label="Active"
          value={activeCount}
          hint="Visible on this page"
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
        <MetricTile
          label="HOD assigned"
          value={withHodCount}
          hint="Leadership coverage"
          icon={<ChevronRight className="size-4" />}
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
                placeholder="Search by name or code"
                className="pl-8"
              />
            </div>
            <div className="md:w-48">
              <Select
                value={status}
                onValueChange={(value) =>
                  handleStatusChange(value as StatusFilter)
                }
                options={STATUS_FILTERS}
                placeholder="Filter by status"
              />
            </div>
          </div>
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" />
            New department
          </Button>
        </div>

        <DataTable
          columns={columns}
          rows={departments}
          rowKey={(row) => row.id}
          isLoading={departmentsQuery.isLoading}
          maxBodyHeight={520}
          emptyState={
            <div>
              <Building2 className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium text-foreground">
                No departments found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first department or adjust the current filters.
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
            label: "departments",
            disabled: departmentsQuery.isFetching,
          }}
        />
      </section>

      <DepartmentFormDialog />
      <DepartmentViewDialog />
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
