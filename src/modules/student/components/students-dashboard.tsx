"use client";

import {
  CheckCircle2,
  Edit3,
  Eye,
  GraduationCap,
  PhoneCall,
  Plus,
  Search,
  Trash2,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { RowActionsMenu, type RowAction } from "@/components/ui/row-actions-menu";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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

  const isInitialLoading = studentsQuery.isLoading && !students.length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 text-[11px] uppercase text-muted-foreground">
            Directory
          </div>
          <h1 className="text-display truncate text-4xl font-semibold">
            Students
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Admit students, manage profiles, enrollment, and guardian contacts.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            onClick={() => openCreate()}
            className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-emerald hover:bg-primary/90 active:scale-[0.98]"
          >
            <Plus className="size-4" />
            Add Student
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricTile loading={isInitialLoading} label="Total students" value={totalCount} hint="Across matching filters" icon={<GraduationCap className="size-4" />} />
        <MetricTile loading={isInitialLoading} label="Active" value={activeCount} hint="Visible on this page" icon={<CheckCircle2 className="size-4" />} tone="success" live />
        <MetricTile loading={isInitialLoading} label="Guardians" value={guardianCount} hint="Linked on this page" icon={<Users className="size-4" />} tone="info" />
        <MetricTile loading={isInitialLoading} label="Contacts" value={students.filter((item) => item.phone || item.email).length} hint="Reachable students" icon={<PhoneCall className="size-4" />} tone="warn" />
      </section>

      <section className="space-y-4">
        <div className="paper-card section-rise flex flex-wrap items-center gap-3 p-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              placeholder="Search name, admission no., or roll no."
              className="h-11 rounded-xl border-transparent bg-paper-2/60 pl-9 focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>
          <Select
            value={academicYearId}
            onValueChange={(value) => {
              setAcademicYearId(value);
              resetPage();
            }}
            options={academicYearOptions}
            className="h-11 w-[160px] rounded-xl border-transparent bg-paper-2/60"
          />
          <Select
            value={classId}
            onValueChange={(value) => {
              setClassId(value);
              resetPage();
            }}
            options={classOptions}
            className="h-11 w-[160px] rounded-xl border-transparent bg-paper-2/60"
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
            className="h-11 w-[160px] rounded-xl border-transparent bg-paper-2/60"
          />
        </div>

        <div className="paper-card section-rise overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="bg-paper-2/40 text-[11px] uppercase text-muted-foreground">
                  <th className="px-5 py-3.5 text-left font-medium">Student</th>
                  <th className="py-3.5 text-left font-medium">Class</th>
                  <th className="py-3.5 text-left font-medium">Guardian</th>
                  <th className="py-3.5 text-left font-medium">Contact</th>
                  <th className="py-3.5 text-left font-medium">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {isInitialLoading
                  ? Array.from({ length: 5 }).map((_, index) => <RowSkeleton key={index} />)
                  : students.map((student) => (
                      <StudentTableRow
                        key={student.id}
                        student={student}
                        onView={() => openView(student)}
                        onEdit={() => openEdit(student)}
                        onGuardian={() => openGuardian({ student })}
                        onDelete={() => handleDelete(student)}
                        deleteDisabled={deleteMutation.isPending}
                      />
                    ))}
              </tbody>
            </table>
          </div>

          {!isInitialLoading && !students.length ? (
            <div className="grid min-h-44 place-items-center border-t px-6 text-center text-sm text-muted-foreground">
              <div>
                <GraduationCap className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="font-medium text-foreground">No students found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add a student or adjust your filters.
                </p>
              </div>
            </div>
          ) : null}

          <DataTablePagination
            page={page}
            pageSize={limit}
            total={totalCount}
            totalPages={pagination?.totalPages ?? 1}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setLimit(size);
              resetPage();
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            label="students"
            disabled={studentsQuery.isFetching}
          />
        </div>
      </section>

      <StudentFormDialog />
      <StudentViewDialog />
      <GuardianFormDialog />
    </div>
  );
}

function StudentTableRow({
  student,
  onView,
  onEdit,
  onGuardian,
  onDelete,
  deleteDisabled,
}: {
  student: StudentItem;
  onView: () => void;
  onEdit: () => void;
  onGuardian: () => void;
  onDelete: () => void;
  deleteDisabled: boolean;
}) {
  const guardian = primaryGuardian(student);
  const actions: RowAction[] = [
    { key: "view", label: "View profile", icon: <Eye className="size-4" />, onSelect: onView },
    { key: "guardian", label: "Add guardian", icon: <UserRoundCheck className="size-4" />, onSelect: onGuardian },
    { key: "edit", label: "Edit details", icon: <Edit3 className="size-4" />, onSelect: onEdit },
    {
      key: "delete",
      label: "Remove",
      icon: <Trash2 className="size-4" />,
      variant: "destructive",
      separatorBefore: true,
      disabled: deleteDisabled,
      onSelect: onDelete,
    },
  ];

  return (
    <tr className="border-t border-border transition hover:bg-paper-2/40">
      <td className="px-5 py-4">
        <button type="button" onClick={onView} className="flex min-w-0 items-center gap-3 text-left">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
            {initials(student)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{fullName(student)}</span>
            <span className="block truncate font-mono text-xs text-muted-foreground">
              {student.admissionNumber}
            </span>
          </span>
        </button>
      </td>
      <td className="py-4">
        <div className="font-medium">{student.class?.name ?? "Unassigned"}</div>
        <div className="text-xs text-muted-foreground">
          {student.section ? `Section ${student.section.name}` : student.academicYear?.name ?? "No section"}
        </div>
      </td>
      <td className="py-4">
        {guardian ? (
          <>
            <div className="font-medium">
              {guardian.firstName} {guardian.lastName}
            </div>
            <div className="text-xs text-muted-foreground">
              {GUARDIAN_RELATION_LABELS[guardian.relation]} · {guardian.phone}
            </div>
          </>
        ) : (
          <span className="text-muted-foreground">No guardian</span>
        )}
      </td>
      <td className="py-4">
        <div className="text-sm">{student.phone ?? student.email ?? "No contact"}</div>
        <div className="text-xs text-muted-foreground">
          {[student.city, student.state].filter(Boolean).join(", ") || "No address"}
        </div>
      </td>
      <td className="py-4">
        <StatusBadge status={student.status} />
      </td>
      <td className="px-5 py-4 text-right">
        <RowActionsMenu actions={actions} />
      </td>
    </tr>
  );
}

function RowSkeleton() {
  return (
    <tr className="border-t border-border">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="py-4"><Skeleton className="h-3 w-24" /></td>
      <td className="py-4"><Skeleton className="h-3 w-32" /></td>
      <td className="py-4"><Skeleton className="h-3 w-36" /></td>
      <td className="py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
      <td className="px-5 py-4"><Skeleton className="ml-auto size-8 rounded-md" /></td>
    </tr>
  );
}

function MetricTile({
  label,
  value,
  hint,
  icon,
  tone = "default",
  loading,
  live,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "info" | "warn";
  loading: boolean;
  live?: boolean;
}) {
  return (
    <div className="paper-card section-rise p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl",
            tone === "success"
              ? "bg-primary-soft text-primary"
              : tone === "info"
                ? "bg-[oklch(0.92_0.04_230)] text-[oklch(0.45_0.12_230)]"
                : tone === "warn"
                  ? "bg-gold/15 text-gold-foreground"
                  : "bg-primary-soft text-primary",
          )}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        {loading ? (
          <Skeleton className="h-12 w-16" />
        ) : (
          <span className="text-display text-5xl font-semibold leading-none">{value}</span>
        )}
        {live && !loading ? (
          <span className="relative ml-1 inline-flex size-2.5">
            <span className="status-dot-live absolute inset-0 rounded-full bg-primary" />
          </span>
        ) : null}
      </div>
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
          ? "bg-primary-soft text-primary"
          : status === "SUSPENDED"
            ? "bg-gold/15 text-gold-foreground"
            : "bg-slate-100 text-slate-700",
      )}
    >
      <CheckCircle2 className="size-3" />
      {STUDENT_STATUS_LABELS[status]}
    </span>
  );
}
