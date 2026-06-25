"use client";

import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  Plus,
  Search,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { RowActionsMenu, type RowAction } from "@/components/ui/row-actions-menu";
import { cn } from "@/lib/utils";

import {
  useAcademicYears,
  useDeleteAcademicYear,
  useSetCurrentAcademicYear,
} from "../api/use-academic-years";
import type { AcademicYearItem } from "../api/academic-year.types";
import { useAcademicYearStore } from "@/stores/dialog-store";
import { AcademicYearFormDialog } from "./academic-year-form-dialog";
import { AcademicYearViewDialog } from "./academic-year-view-dialog";

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

export function AcademicYearsDashboard() {
  const openCreate = useAcademicYearStore((s) => s.openCreate);
  const openEdit = useAcademicYearStore((s) => s.openEdit);
  const openView = useAcademicYearStore((s) => s.openView);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const yearsQuery = useAcademicYears({
    page,
    limit,
    sortBy: "startDate",
    sortOrder: "desc",
    search: search.trim() || undefined,
  });
  const deleteMutation = useDeleteAcademicYear();
  const setCurrentMutation = useSetCurrentAcademicYear();

  const years = yearsQuery.data?.data.data ?? [];
  const pagination = yearsQuery.data?.data.pagination;
  const totalCount = pagination?.total ?? years.length;
  const currentYear = years.find((y) => y.isCurrent);
  const activeCount = years.filter((y) => y.isActive).length;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const handleDelete = (year: AcademicYearItem) => {
    if (year.isCurrent) {
      window.alert(
        "You cannot deactivate the current academic year. Set another year as current first.",
      );
      return;
    }
    const confirmed = window.confirm(
      `Deactivate ${year.name}? Existing classes and timetables will be preserved.`,
    );
    if (confirmed) deleteMutation.mutate(year.id);
  };

  const columns: DataTableColumn<AcademicYearItem>[] = [
    {
      key: "name",
      header: "Academic year",
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-medium">{row.name}</span>
          {row.isCurrent ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              <Star className="size-3" />
              Current
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Start",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDate(row.startDate)}
        </span>
      ),
    },
    {
      key: "endDate",
      header: "End",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDate(row.endDate)}
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
        ];
        if (!row.isCurrent && row.isActive) {
          actions.push({
            key: "set-current",
            label: "Set as current",
            icon: <Star className="size-4" />,
            disabled: setCurrentMutation.isPending,
            onSelect: () => setCurrentMutation.mutate(row.id),
          });
        }
        actions.push({
          key: "delete",
          label: "Deactivate",
          icon: <Trash2 className="size-4" />,
          variant: "destructive",
          disabled: deleteMutation.isPending,
          separatorBefore: true,
          onSelect: () => handleDelete(row),
        });
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
          label="Total academic years"
          value={totalCount}
          hint="All defined years"
          icon={<CalendarDays className="size-4" />}
        />
        <MetricTile
          label="Current year"
          value={currentYear?.name ?? "—"}
          hint={
            currentYear
              ? `${formatDate(currentYear.startDate)} → ${formatDate(currentYear.endDate)}`
              : "No year marked as current"
          }
          icon={<Star className="size-4" />}
          tone="warning"
        />
        <MetricTile
          label="Active"
          value={activeCount}
          hint="Visible on this page"
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search academic years"
              className="pl-8"
            />
          </div>
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" />
            New academic year
          </Button>
        </div>

        <DataTable
          columns={columns}
          rows={years}
          rowKey={(row) => row.id}
          isLoading={yearsQuery.isLoading}
          maxBodyHeight={520}
          emptyState={
            <div>
              <CalendarDays className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium text-foreground">
                No academic years yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create one to start scoping classes and rosters.
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
            label: "academic years",
            disabled: yearsQuery.isFetching,
          }}
        />
      </section>

      <AcademicYearFormDialog />
      <AcademicYearViewDialog />
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
  value: number | string;
  hint: string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "info" | "warning";
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
                : tone === "warning"
                  ? "bg-amber-100 text-amber-700"
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
