"use client";

import {
  BookOpen,
  CheckCircle2,
  Edit3,
  Eye,
  Layers3,
  Link2,
  Plus,
  Search,
  Sparkles,
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
import { LinkSubjectClassesDialog } from "@/modules/class-subject/components/link-subject-classes-dialog";
import { useClassSubjectStore } from "@/modules/class-subject/store/class-subject.store";

import { useDeleteSubject, useSubjects } from "../api/use-subjects";
import type { SubjectItem } from "../api/subject.types";
import { useSubjectStore } from "../store/subject.store";
import { SubjectFormDialog } from "./subject-form-dialog";
import { SubjectViewDialog } from "./subject-view-dialog";

const ALL_VALUE = "all";

type TypeFilter = "all" | "core" | "elective";

const TYPE_OPTIONS = [
  { label: "All subjects", value: "all" },
  { label: "Core", value: "core" },
  { label: "Elective", value: "elective" },
];

export function SubjectsDashboard() {
  const openCreate = useSubjectStore((s) => s.openCreate);
  const openEdit = useSubjectStore((s) => s.openEdit);
  const openView = useSubjectStore((s) => s.openView);
  const openLink = useClassSubjectStore((s) => s.openLink);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState(ALL_VALUE);
  const [classId, setClassId] = useState(ALL_VALUE);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const departmentsQuery = useDepartments({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
    isActive: true,
  });

  const subjectsQuery = useSubjects({
    page,
    limit,
    sortBy: "name",
    sortOrder: "asc",
    search: search.trim() || undefined,
    departmentId: departmentId !== ALL_VALUE ? departmentId : undefined,
    classId: classId !== ALL_VALUE ? classId : undefined,
    isElective:
      typeFilter === "all" ? undefined : typeFilter === "elective",
  });
  const deleteMutation = useDeleteSubject();

  const subjects = subjectsQuery.data?.data.data ?? [];
  const pagination = subjectsQuery.data?.data.pagination;
  const totalCount = pagination?.total ?? subjects.length;
  const activeCount = subjects.filter((s) => s.isActive).length;
  const electiveCount = subjects.filter((s) => s.isElective).length;

  const departments = useMemo(
    () => departmentsQuery.data?.data.data ?? [],
    [departmentsQuery.data],
  );

  const departmentOptions = useMemo(
    () => [
      { label: "All departments", value: ALL_VALUE },
      ...departments.map((d) => ({
        label: d.code ? `${d.name} (${d.code})` : d.name,
        value: d.id,
      })),
    ],
    [departments],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleDeptChange = (value: string) => {
    setDepartmentId(value);
    setPage(1);
  };
  const handleClassChange = (value: string) => {
    setClassId(value);
    setPage(1);
  };
  const handleTypeChange = (value: string) => {
    setTypeFilter(value as TypeFilter);
    setPage(1);
  };
  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const handleDelete = (subject: SubjectItem) => {
    const confirmed = window.confirm(
      `Archive ${subject.name}? It will be hidden from timetables but historical data is preserved.`,
    );
    if (confirmed) deleteMutation.mutate(subject.id);
  };

  const columns: DataTableColumn<SubjectItem>[] = [
    {
      key: "subject",
      header: "Subject",
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
      key: "code",
      header: "Code",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.code || "—"}
        </span>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (row) =>
        row.departmentName ? (
          <span className="inline-flex w-fit items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
            {row.departmentName}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "type",
      header: "Type",
      cell: (row) => (
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            row.isElective
              ? "bg-amber-100 text-amber-700"
              : "bg-sky-100 text-sky-700",
          )}
        >
          {row.isElective ? "Elective" : "Core"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge isActive={row.isActive} />,
    },
    {
      key : 'classes',
      header : 'Linked classes',
      cell : (row) => (
        <div className="flex flex-col gap-1">
          {row.classes.length > 0 ? row.classes.map(c => (
            <span key={c.id} className="inline-flex w-fit items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {c.name}
            </span>
          )) : <span className="text-muted-foreground">No linked classes</span>}
        </div>
      )
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
            key: "link",
            label: "Link to classes",
            icon: <Link2 className="size-4" />,
            onSelect: () => openLink(row),
          },
          {
            key: "delete",
            label: "Archive",
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
          label="Total subjects"
          value={totalCount}
          hint="Across all departments"
          icon={<BookOpen className="size-4" />}
        />
        <MetricTile
          label="Active"
          value={activeCount}
          hint="Visible on this page"
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
        <MetricTile
          label="Electives"
          value={electiveCount}
          hint="Visible on this page"
          icon={<Sparkles className="size-4" />}
          tone="warning"
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
                placeholder="Search subjects"
                className="pl-8"
              />
            </div>
            <div className="md:w-48">
              <Select
                value={departmentId}
                onValueChange={handleDeptChange}
                options={departmentOptions}
                placeholder="Filter by department"
              />
            </div>
            <div className="md:w-40">
              <Select
                value={typeFilter}
                onValueChange={handleTypeChange}
                options={TYPE_OPTIONS}
                placeholder="Type"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => openLink()}>
              <Link2 className="size-4" />
              Link subjects &amp; classes
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              New subject
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={subjects}
          rowKey={(row) => row.id}
          isLoading={subjectsQuery.isLoading}
          maxBodyHeight={520}
          emptyState={
            <div>
              <Layers3 className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium text-foreground">No subjects found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Adjust filters or create a subject to get started.
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
            label: "subjects",
            disabled: subjectsQuery.isFetching,
          }}
        />
      </section>

      <SubjectFormDialog />
      <SubjectViewDialog />
      <LinkSubjectClassesDialog />
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
