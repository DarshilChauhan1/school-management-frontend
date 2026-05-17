"use client";

import {
  CheckCircle2,
  Edit3,
  Eye,
  Layers3,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { RowActionsMenu, type RowAction } from "@/components/ui/row-actions-menu";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useDepartments } from "@/modules/department/api/use-departments";

import { useClasses, useDeleteClass } from "../api/use-classes";
import type { ClassItem } from "../api/class.types";
import { mediumLabel } from "../constants/medium";
import { useClassStore } from "../store/class.store";
import { ClassFormDialog } from "./class-form-dialog";
import { ClassViewDialog } from "./class-view-dialog";

const ALL_DEPARTMENTS = "all";
const DEFAULT_LIMIT = 10;

export function ClassesDashboard() {
  const openCreate = useClassStore((s) => s.openCreate);
  const openEdit = useClassStore((s) => s.openEdit);
  const openView = useClassStore((s) => s.openView);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState(ALL_DEPARTMENTS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const departmentsQuery = useDepartments({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
    isActive: true,
  });

  const classesQuery = useClasses({
    page,
    limit,
    sortBy: "level",
    sortOrder: "asc",
    search: search.trim() || undefined,
    departmentId:
      departmentId !== ALL_DEPARTMENTS ? departmentId : undefined,
  });
  const deleteClass = useDeleteClass();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleDepartmentChange = (value: string) => {
    setDepartmentId(value);
    setPage(1);
  };
  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const classes = classesQuery.data?.data.data ?? [];
  const pagination = classesQuery.data?.data.pagination;
  const total = pagination?.total ?? classes.length;
  const totalPages = pagination?.totalPages ?? 1;

  const departments = useMemo(
    () => departmentsQuery.data?.data.data ?? [],
    [departmentsQuery.data],
  );
  const departmentMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d])),
    [departments],
  );

  const departmentOptions = useMemo(
    () => [
      { label: "All departments", value: ALL_DEPARTMENTS },
      ...departments.map((d) => ({
        label: d.code ? `${d.name} (${d.code})` : d.name,
        value: d.id,
      })),
    ],
    [departments],
  );

  const handleDelete = (cls: ClassItem) => {
    const confirmed = window.confirm(
      `Archive ${cls.name}? Sections will remain attached but the class is hidden from rosters.`,
    );
    if (confirmed) deleteClass.mutate(cls.id);
  };

  const columns: DataTableColumn<ClassItem>[] = [
    {
      key: "class",
      header: "Class",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.name}</div>
          {row.description ? (
            <div className="truncate text-xs text-muted-foreground">
              {row.description}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.level ?? "—"}
        </span>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (row) => {
        const dept = row.departmentId
          ? departmentMap.get(row.departmentId)
          : undefined;
        return dept ? (
          <span className="inline-flex w-fit items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
            {dept.name}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: "medium",
      header: "Medium",
      cell: (row) => (
        <span className="inline-flex w-fit items-center rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
          {row.mediumOfInstruction
            ? mediumLabel(row.mediumOfInstruction)
            : "—"}
        </span>
      ),
    },
    {
      key: "sections",
      header: "Sections",
      cell: (row) =>
        row.sections.length === 0 ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {row.sections.map((s) => (
              <span
                key={s.id}
                className="inline-flex w-fit items-center rounded-md bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-700"
              >
                {s.name}
              </span>
            ))}
          </div>
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
            label: "Archive",
            icon: <Trash2 className="size-4" />,
            variant: "destructive",
            disabled: deleteClass.isPending,
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
          label="Total classes"
          value={total}
          hint="Across all departments"
          icon={<Layers3 className="size-4" />}
        />
        <MetricTile
          label="Active"
          value={classes.filter((c) => c.isActive).length}
          hint="Visible on this page"
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
        <MetricTile
          label="Sections"
          value={classes.reduce((sum, c) => sum + c.sections.length, 0)}
          hint="Visible on this page"
          icon={<Layers3 className="size-4" />}
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
                placeholder="Search classes"
                className="pl-8"
              />
            </div>
            <div className="md:w-64">
              <Select
                value={departmentId}
                onValueChange={handleDepartmentChange}
                options={departmentOptions}
                placeholder={
                  departmentsQuery.isLoading
                    ? "Loading departments…"
                    : "Filter by department"
                }
              />
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New class
          </Button>
        </div>

        <DataTable
          columns={columns}
          rows={classes}
          rowKey={(row) => row.id}
          isLoading={classesQuery.isLoading}
          maxBodyHeight={520}
          emptyState={
            <div>
              <Layers3 className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium text-foreground">No classes found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Adjust filters or create a class to get started.
              </p>
            </div>
          }
          pagination={{
            page,
            pageSize: limit,
            total,
            totalPages,
            onPageChange: setPage,
            onPageSizeChange: handleLimitChange,
            pageSizeOptions: [5, 10, 25, 50],
            label: "classes",
            disabled: classesQuery.isFetching,
          }}
        />
      </section>

      <ClassFormDialog />
      <ClassViewDialog />
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
      {isActive ? "Active" : "Archived"}
    </span>
  );
}
