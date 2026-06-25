"use client";

import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  GraduationCap,
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

import { useAcademicYears } from "@/modules/academic-year/api/use-academic-years";
import { useDepartments } from "@/modules/department/api/use-departments";

import { useClasses, useDeleteClass } from "../api/use-classes";
import type { ClassItem } from "../api/class.types";
import { mediumLabel } from "../constants/medium";
import { useClassStore } from "@/stores/dialog-store";
import { ClassFormDialog } from "./class-form-dialog";
import { ClassViewDialog } from "./class-view-dialog";

const ALL_DEPARTMENTS = "all";
const DEFAULT_LIMIT = 10;

type ViewMode = "cards" | "table";
type StatusFilter = "active" | "inactive" | "all";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Archived" },
  { value: "all", label: "All" },
];

type DepartmentLite = { id: string; name: string; code?: string | null };

const sectionStudents = () => 0; // enrollment counts are not exposed on the class list yet

export function ClassesDashboard() {
  const openCreate = useClassStore((s) => s.openCreate);
  const openEdit = useClassStore((s) => s.openEdit);
  const openView = useClassStore((s) => s.openView);

  const [view, setView] = useState<ViewMode>("cards");
  const [status, setStatus] = useState<StatusFilter>("active");
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

  const academicYearsQuery = useAcademicYears({
    limit: 50,
    sortBy: "startDate",
    sortOrder: "desc",
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
  const handleStatusChange = (value: StatusFilter) => {
    setStatus(value);
    setPage(1);
  };
  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const allClasses = classesQuery.data?.data.data ?? [];
  const pagination = classesQuery.data?.data.pagination;
  const total = pagination?.total ?? allClasses.length;
  const totalPages = pagination?.totalPages ?? 1;

  const classes = useMemo(
    () =>
      allClasses.filter((c) => {
        if (status === "active") return c.isActive;
        if (status === "inactive") return !c.isActive;
        return true;
      }),
    [allClasses, status],
  );

  const departments = useMemo(
    () => departmentsQuery.data?.data.data ?? [],
    [departmentsQuery.data],
  );
  const departmentMap = useMemo(
    () => new Map<string, DepartmentLite>(departments.map((d) => [d.id, d])),
    [departments],
  );

  const academicYear = useMemo(() => {
    const years = academicYearsQuery.data?.data.data ?? [];
    return years.find((y) => y.isCurrent) ?? years[0];
  }, [academicYearsQuery.data]);

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

  const totalSections = allClasses.reduce(
    (sum, c) => sum + c.sections.length,
    0,
  );
  const activeCount = allClasses.filter((c) => c.isActive).length;

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
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Total classes"
          value={total}
          hint={`${activeCount} active · ${total - activeCount} archived`}
          icon={<Layers3 className="size-4" />}
        />
        <MetricTile
          label="Sections"
          value={totalSections}
          hint="Across loaded classes"
          icon={<BookOpen className="size-4" />}
          tone="info"
        />
        <MetricTile
          label="Active"
          value={activeCount}
          hint="Currently running"
          icon={<GraduationCap className="size-4" />}
          tone="success"
        />
        <MetricTile
          label="Academic year"
          value={academicYear?.name ?? "—"}
          hint={academicYear?.isCurrent ? "Current" : "Most recent"}
          icon={<CalendarDays className="size-4" />}
          tone="amber"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 lg:flex-row lg:flex-wrap lg:items-center">
          <h2 className="text-sm font-semibold">All classes</h2>

          <Segmented
            value={view}
            onChange={(v) => setView(v as ViewMode)}
            options={[
              { value: "cards", label: "Cards" },
              { value: "table", label: "Table" },
            ]}
          />

          <Segmented
            value={status}
            onChange={(v) => handleStatusChange(v as StatusFilter)}
            options={STATUS_FILTERS}
          />

          <div className="lg:w-56">
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

          <div className="flex min-w-0 flex-1 items-center gap-2 lg:justify-end">
            <div className="relative min-w-0 flex-1 lg:max-w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search classes"
                className="pl-8"
              />
            </div>
            <Button onClick={() => openCreate()}>
              <Plus className="size-4" />
              New class
            </Button>
          </div>
        </div>

        {view === "cards" ? (
          classesQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl border bg-muted/40"
                />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="rounded-lg border bg-card p-10 text-center">
              <Layers3 className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium text-foreground">No classes found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Adjust filters or create a class to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {classes.map((cls) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  department={
                    cls.departmentId
                      ? departmentMap.get(cls.departmentId)
                      : undefined
                  }
                  onEdit={() => openEdit(cls)}
                  onView={() => openView(cls)}
                />
              ))}
            </div>
          )
        ) : (
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
        )}
      </section>

      <ClassFormDialog />
      <ClassViewDialog />
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex gap-1 rounded-lg bg-muted p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ClassCard({
  cls,
  department,
  onEdit,
  onView,
}: {
  cls: ClassItem;
  department?: DepartmentLite;
  onEdit: () => void;
  onView: () => void;
}) {
  const capacity = cls.sections.reduce((sum, s) => sum + (s.capacity ?? 0), 0);
  const students = cls.sections.reduce((sum) => sum + sectionStudents(), 0);
  const pct = capacity ? Math.min(100, (students / capacity) * 100) : 0;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card",
        !cls.isActive && "opacity-70",
      )}
    >
      <div className="border-b p-4 pb-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase text-muted-foreground">
                Lvl {cls.level ?? "—"}
              </span>
              <StatusBadge isActive={cls.isActive} compact />
            </div>
            <button
              type="button"
              onClick={onView}
              className="mt-1 block truncate text-left text-base font-bold tracking-tight hover:underline"
            >
              {cls.name}
            </button>
            {cls.description ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {cls.description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Edit class"
            onClick={onEdit}
          >
            <Edit3 className="size-3.5" />
          </Button>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {department ? (
            <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
              {department.name}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
            {cls.mediumOfInstruction
              ? mediumLabel(cls.mediumOfInstruction)
              : "—"}
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 pt-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Sections · {cls.sections.length}
        </p>
        {cls.sections.length === 0 ? (
          <div className="rounded-md border border-dashed px-3 py-3 text-center text-xs text-muted-foreground">
            No sections yet
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {cls.sections.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-md bg-muted/60 px-2 py-1.5"
              >
                <span className="grid size-6 place-items-center rounded bg-brand-100 text-[11px] font-bold text-brand-700">
                  {s.name}
                </span>
                <span className="flex-1 truncate text-xs text-muted-foreground">
                  {s.roomNumber ? `Room ${s.roomNumber}` : "Unassigned room"}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {s.capacity ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t bg-muted/40 p-4 py-3">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">Total capacity</span>
          <span className="font-mono text-xs font-bold">{capacity || "—"}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full",
              pct >= 95 ? "bg-rose-500" : "bg-brand-500",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
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
  tone?: "default" | "success" | "info" | "amber";
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
                : tone === "amber"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-brand-100 text-brand-700",
          )}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 truncate text-3xl font-semibold leading-none">
        {value}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function StatusBadge({
  isActive,
  compact = false,
}: {
  isActive: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        compact && "px-1.5 py-0.5 text-[10px]",
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700",
      )}
    >
      {isActive ? (
        <CheckCircle2 className={compact ? "size-2.5" : "size-3"} />
      ) : (
        <XCircle className={compact ? "size-2.5" : "size-3"} />
      )}
      {isActive ? "Active" : "Archived"}
    </span>
  );
}
