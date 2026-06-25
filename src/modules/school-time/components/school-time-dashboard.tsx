"use client";

import { useMemo } from "react";
import { Clock, Edit3, Eye, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { RowActionsMenu, type RowAction } from "@/components/ui/row-actions-menu";

import { useAcademicYears } from "@/modules/academic-year/api/use-academic-years";

import {
  useDeleteSchoolTimeConfiguration,
  useSchoolTimeConfigurations,
} from "../api/use-school-time";
import type { SchoolTimeConfigurationSet } from "../api/school-time.types";
import { useSchoolTimeStore } from "@/stores/dialog-store";
import { SchoolTimeFormDialog } from "./school-time-form-dialog";
import { SchoolTimeViewDialog } from "./school-time-view-dialog";

export function SchoolTimeDashboard() {
  const openCreate = useSchoolTimeStore((s) => s.openCreate);
  const openEdit = useSchoolTimeStore((s) => s.openEdit);
  const openView = useSchoolTimeStore((s) => s.openView);

  const configsQuery = useSchoolTimeConfigurations();
  const yearsQuery = useAcademicYears({ limit: 100 });
  const deleteMutation = useDeleteSchoolTimeConfiguration();

  const sets = configsQuery.data?.data ?? [];
  const yearNameById = useMemo(() => {
    const map = new Map<string, string>();
    (yearsQuery.data?.data.data ?? []).forEach((y) => map.set(y.id, y.name));
    return map;
  }, [yearsQuery.data]);

  const handleDelete = (set: SchoolTimeConfigurationSet) => {
    const confirmed = window.confirm(
      "Delete the time configuration for this academic year? This cannot be undone.",
    );
    if (confirmed) deleteMutation.mutate(set.academicYearId);
  };

  const columns: DataTableColumn<SchoolTimeConfigurationSet>[] = [
    {
      key: "year",
      header: "Academic year",
      cell: (row) => (
        <span className="font-medium">
          {yearNameById.get(row.academicYearId) ?? "—"}
        </span>
      ),
    },
    {
      key: "workingDays",
      header: "Working days",
      cell: (row) => (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          {row.days.filter((d) => d.isWorkingDay).length} days
        </span>
      ),
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
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Define which days the school is open and the hours for each day, per
          academic year.
        </p>
        <Button onClick={() => openCreate()}>
          <Plus className="size-4" />
          New configuration
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={sets}
        rowKey={(row) => row.academicYearId}
        isLoading={configsQuery.isLoading}
        isHeaderLoading={configsQuery.isFetching}
        maxBodyHeight={520}
        emptyState={
          <div>
            <Clock className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">
              No time configuration yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a time configuration for an academic year to get started.
            </p>
          </div>
        }
      />

      <SchoolTimeFormDialog />
      <SchoolTimeViewDialog />
    </div>
  );
}
