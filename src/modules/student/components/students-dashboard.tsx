"use client";

import {
  CheckCircle2,
  Edit3,
  Eye,
  GraduationCap,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { StudentDashboardSkeleton } from "@/components/skeletons/student-dashboard-skeleton";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { RowActionsMenu, type RowAction } from "@/components/ui/row-actions-menu";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAcademicYears } from "@/modules/academic-year/api/use-academic-years";
import { useClasses } from "@/modules/class/api/use-classes";

import {
  GUARDIAN_RELATION_LABELS,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUSES,
  type StudentItem,
  type StudentStatus,
} from "../api/student.types";
import { useDeleteStudent, useStudents } from "../api/use-students";
import { useStudentStore } from "@/stores/dialog-store";
import { GuardianFormDialog } from "./guardian-form-dialog";
import { StudentFormDialog } from "./student-form-dialog";
import { StudentViewDialog } from "./student-view-dialog";

const ALL_VALUE = "__all__";

const fullName = (student: StudentItem) =>
  [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");

const initials = (student: StudentItem) =>
  `${student.firstName?.[0] ?? ""}${student.lastName?.[0] ?? ""}`.toUpperCase();

const primaryGuardian = (student: StudentItem) =>
  student.guardians.find((guardian) => guardian.isPrimaryContact) ?? student.guardians[0];

export function StudentsDashboard() {
  const openCreate = useStudentStore((s) => s.openCreate);
  const openEdit = useStudentStore((s) => s.openEdit);
  const openView = useStudentStore((s) => s.openView);
  const openGuardian = useStudentStore((s) => s.openSecondary);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<StudentStatus | typeof ALL_VALUE>(ALL_VALUE);
  const [classId, setClassId] = useState(ALL_VALUE);
  const [academicYearId, setAcademicYearId] = useState(ALL_VALUE);

  const studentsQuery = useStudents({
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: search.trim() || undefined,
    status: status !== ALL_VALUE ? status : undefined,
    classId: classId !== ALL_VALUE ? classId : undefined,
    academicYearId: academicYearId !== ALL_VALUE ? academicYearId : undefined,
  });
  const classesQuery = useClasses({ limit: 100, sortBy: "level", sortOrder: "asc" });
  const academicYearsQuery = useAcademicYears({ limit: 50, sortBy: "startDate", sortOrder: "desc" });
  const deleteMutation = useDeleteStudent();

  const students = studentsQuery.data?.data.data ?? [];
  const pagination = studentsQuery.data?.data.pagination;
  const totalCount = pagination?.total ?? students.length;
  const activeCount = students.filter((student) => student.status === "ACTIVE").length;
  const guardianCount = students.reduce((total, student) => total + student.guardians.length, 0);

  const resetPage = () => setPage(1);
  const handleDelete = useCallback((student: StudentItem) => {
    const confirmed = window.confirm(`Remove ${fullName(student)} from active student records?`);
    if (confirmed) deleteMutation.mutate(student.id);
  }, [deleteMutation]);

  const classOptions = [
    { label: "All classes", value: ALL_VALUE },
    ...(classesQuery.data?.data.data ?? []).map((item) => ({ label: item.name, value: item.id })),
  ];
  const academicYearOptions = [
    { label: "All years", value: ALL_VALUE },
    ...(academicYearsQuery.data?.data.data ?? []).map((item) => ({
      label: `${item.name}${item.isCurrent ? " · Current" : ""}`,
      value: item.id,
    })),
  ];

  const columns = useMemo<DataTableColumn<StudentItem>[]>(
    () => [
      {
        key: "student",
        header: "Student",
        cell: (row) => (
          <button
            type="button"
            onClick={() => openView(row)}
            className="group flex min-w-0 items-center gap-3 text-left"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 transition-transform group-hover:scale-105">
              {initials(row)}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium group-hover:text-primary">{fullName(row)}</span>
              <span className="block truncate font-mono text-xs text-muted-foreground">
                {row.admissionNumber}
              </span>
            </span>
          </button>
        ),
      },
      {
        key: "class",
        header: "Class",
        cell: (row) => (
          <div className="min-w-0">
            <div className="truncate text-sm">{row.class?.name ?? "Unassigned"}</div>
            <div className="truncate text-xs text-muted-foreground">
              {row.section ? `Section ${row.section.name}` : row.academicYear?.name ?? "No section"}
            </div>
          </div>
        ),
      },
      {
        key: "guardian",
        header: "Guardian",
        cell: (row) => {
          const guardian = primaryGuardian(row);
          return guardian ? (
            <div className="min-w-0">
              <div className="truncate text-sm">
                {guardian.firstName} {guardian.lastName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {GUARDIAN_RELATION_LABELS[guardian.relation]} · {guardian.phone}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">No guardian</span>
          );
        },
      },
      {
        key: "contact",
        header: "Contact",
        cell: (row) => (
          <div className="min-w-0 text-xs text-muted-foreground">
            <p className="truncate">{row.phone ?? row.email ?? "No contact"}</p>
            <p className="truncate">{[row.city, row.state].filter(Boolean).join(", ") || "No address"}</p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        header: "",
        align: "right",
        cell: (row) => {
          const actions: RowAction[] = [
            { key: "view", label: "View", icon: <Eye className="size-4" />, onSelect: () => openView(row) },
            { key: "guardian", label: "Add guardian", icon: <UserRoundCheck className="size-4" />, onSelect: () => openGuardian({ student: row }) },
            { key: "edit", label: "Edit", icon: <Edit3 className="size-4" />, onSelect: () => openEdit(row) },
            {
              key: "delete",
              label: "Remove",
              icon: <Trash2 className="size-4" />,
              variant: "destructive",
              separatorBefore: true,
              disabled: deleteMutation.isPending,
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
    ],
    [deleteMutation.isPending, handleDelete, openEdit, openGuardian, openView],
  );

  if (studentsQuery.isLoading && !students.length) {
    return <StudentDashboardSkeleton />;
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        <MetricTile label="Total students" value={totalCount} hint="Across matching filters" icon={<GraduationCap className="size-4" />} />
        <MetricTile label="Active" value={activeCount} hint="Visible on this page" icon={<CheckCircle2 className="size-4" />} tone="success" />
        <MetricTile label="Guardians" value={guardianCount} hint="Linked on this page" icon={<Users className="size-4" />} tone="info" />
        <MetricTile label="Contacts" value={students.filter((item) => item.phone || item.email).length} hint="Reachable students" icon={<Phone className="size-4" />} tone="warn" />
      </section>

      <section className="space-y-4">
        <div className="rounded-lg border bg-card p-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_160px_auto]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPage();
                }}
                placeholder="Search name, admission no., or roll no."
                className="pl-8"
              />
            </div>
            <Select
              value={academicYearId}
              onValueChange={(value) => {
                setAcademicYearId(value);
                resetPage();
              }}
              options={academicYearOptions}
            />
            <Select
              value={classId}
              onValueChange={(value) => {
                setClassId(value);
                resetPage();
              }}
              options={classOptions}
            />
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as StudentStatus | typeof ALL_VALUE);
                resetPage();
              }}
              options={[
                { label: "All statuses", value: ALL_VALUE },
                ...STUDENT_STATUSES.map((value) => ({ label: STUDENT_STATUS_LABELS[value], value })),
              ]}
            />
            <Button onClick={() => openCreate()}>
              <Plus className="size-4" />
              New student
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={students}
          rowKey={(row) => row.id}
          isLoading={studentsQuery.isFetching}
          isHeaderLoading={studentsQuery.isFetching}
          maxBodyHeight={560}
          emptyState={
            <div>
              <GraduationCap className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium text-foreground">No students found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a student or adjust your filters.
              </p>
            </div>
          }
          pagination={{
            page,
            pageSize: limit,
            total: totalCount,
            totalPages: pagination?.totalPages ?? 1,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setLimit(size);
              resetPage();
            },
            pageSizeOptions: [5, 10, 25, 50],
            label: "students",
            disabled: studentsQuery.isFetching,
          }}
        />
      </section>

      <StudentFormDialog />
      <StudentViewDialog />
      <GuardianFormDialog />
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
  tone?: "default" | "success" | "info" | "warn";
}) {
  return (
    <div className="animate-field-rise rounded-lg border bg-card p-4 transition-transform hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "grid size-8 place-items-center rounded-md",
            tone === "success"
              ? "bg-emerald-100 text-emerald-700"
              : tone === "info"
                ? "bg-sky-100 text-sky-700"
                : tone === "warn"
                  ? "bg-amber-100 text-amber-800"
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

function StatusBadge({ status }: { status: StudentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
        status === "ACTIVE"
          ? "bg-emerald-100 text-emerald-700"
          : status === "SUSPENDED"
            ? "bg-amber-100 text-amber-800"
            : "bg-slate-100 text-slate-700",
      )}
    >
      <CheckCircle2 className="size-3" />
      {STUDENT_STATUS_LABELS[status]}
    </span>
  );
}
