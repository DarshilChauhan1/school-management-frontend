"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Layers3,
  Link2,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useInfiniteClasses } from "@/modules/class/api/use-classes";
import type { ClassItem } from "@/modules/class/api/class.types";
import { useSubjects } from "@/modules/subject/api/use-subjects";
import type { SubjectItem } from "@/modules/subject/api/subject.types";

import {
  useClassSubjects,
  useCreateClassSubject,
  useDeleteClassSubject,
} from "../api/use-class-subjects";
import { useClassSubjectStore } from "../store/class-subject.store";

type Step = "subject" | "classes";

export function LinkSubjectClassesDialog() {
  const isOpen = useClassSubjectStore((s) => s.isLinkOpen);
  const prefillSubject = useClassSubjectStore((s) => s.prefillSubject);
  const closeLink = useClassSubjectStore((s) => s.closeLink);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeLink()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-hidden p-0">
        {isOpen ? (
          <LinkDialogBody
            prefillSubject={prefillSubject}
            onClose={closeLink}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function LinkDialogBody({
  prefillSubject,
  onClose,
}: {
  prefillSubject: SubjectItem | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>(
    prefillSubject ? "classes" : "subject",
  );
  const [subjectSearch, setSubjectSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(
    prefillSubject,
  );
  /** Newly checked class IDs that aren't already linked — will POST. */
  const [addedClassIds, setAddedClassIds] = useState<string[]>([]);
  /** Previously-linked class IDs the user has unchecked — will DELETE. */
  const [removedClassIds, setRemovedClassIds] = useState<string[]>([]);

  const subjectsQuery = useSubjects({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
    isActive: true,
    search: subjectSearch.trim() || undefined,
  });
  const classesQuery = useInfiniteClasses(
    {
      limit: 15,
      sortBy: "level",
      sortOrder: "asc",
      search: classSearch.trim() || undefined,
    },
    { enabled: step === "classes" },
  );
  const existingLinksQuery = useClassSubjects(
    { subjectId: selectedSubject?.id, limit: 100 },
    { enabled: Boolean(selectedSubject?.id) },
  );

  const createMutation = useCreateClassSubject();
  const deleteMutation = useDeleteClassSubject();
  const isSaving = createMutation.isPending || deleteMutation.isPending;

  const subjects = useMemo(
    () => subjectsQuery.data?.data.data ?? [],
    [subjectsQuery.data],
  );
  const classes = useMemo(
    () => classesQuery.data?.pages.flatMap((p) => p.data.data) ?? [],
    [classesQuery.data],
  );
  const classesTotal =
    classesQuery.data?.pages.at(-1)?.data.pagination.total ?? 0;
  const existingLinks = useMemo(
    () => existingLinksQuery.data?.data.data ?? [],
    [existingLinksQuery.data],
  );
  const alreadyLinkedIds = useMemo(
    () => new Set(existingLinks.map((link) => link.classId)),
    [existingLinks],
  );
  /** Map classId → linkId for the DELETE phase. */
  const linkIdByClassId = useMemo(() => {
    const map = new Map<string, string>();
    existingLinks.forEach((link) => map.set(link.classId, link.id));
    return map;
  }, [existingLinks]);

  const isChecked = (classId: string) => {
    if (addedClassIds.includes(classId)) return true;
    if (alreadyLinkedIds.has(classId) && !removedClassIds.includes(classId))
      return true;
    return false;
  };

  const effectiveSelectedCount =
    addedClassIds.length +
    Array.from(alreadyLinkedIds).filter(
      (id) => !removedClassIds.includes(id),
    ).length;

  const visibleClassIds = useMemo(
    () => classes.map((c) => c.id),
    [classes],
  );
  const allVisibleChecked =
    visibleClassIds.length > 0 && visibleClassIds.every((id) => isChecked(id));

  const toggleClass = (id: string) => {
    const linked = alreadyLinkedIds.has(id);
    if (linked) {
      setRemovedClassIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
      return;
    }
    setAddedClassIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleChecked) {
      // Clear: uncheck every visible class
      setAddedClassIds((prev) =>
        prev.filter((id) => !visibleClassIds.includes(id)),
      );
      setRemovedClassIds((prev) => {
        const next = new Set(prev);
        visibleClassIds.forEach((id) => {
          if (alreadyLinkedIds.has(id)) next.add(id);
        });
        return Array.from(next);
      });
      return;
    }
    // Select all visible
    setAddedClassIds((prev) => {
      const next = new Set(prev);
      visibleClassIds.forEach((id) => {
        if (!alreadyLinkedIds.has(id)) next.add(id);
      });
      return Array.from(next);
    });
    setRemovedClassIds((prev) =>
      prev.filter((id) => !visibleClassIds.includes(id)),
    );
  };

  const handleNext = () => {
    if (step === "subject" && selectedSubject) setStep("classes");
  };
  const handleBack = () => {
    if (step === "classes" && !prefillSubject) setStep("subject");
  };

  const handleSubmit = async () => {
    if (!selectedSubject) return;
    if (addedClassIds.length === 0 && removedClassIds.length === 0) return;

    try {
      const tasks: Promise<unknown>[] = [];
      if (addedClassIds.length > 0) {
        tasks.push(
          createMutation.mutateAsync({
            subjectId: selectedSubject.id,
            classIds: addedClassIds,
          }),
        );
      }
      removedClassIds.forEach((classId) => {
        const linkId = linkIdByClassId.get(classId);
        if (linkId) tasks.push(deleteMutation.mutateAsync(linkId));
      });
      await Promise.all(tasks);
      onClose();
    } catch {
      /* toast handled by mutation hooks */
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="size-5" />
              Link subject to classes
            </DialogTitle>
            <DialogDescription>
              {step === "subject"
                ? "Step 1 — pick the subject you want to assign."
                : `Step 2 — pick the classes for ${selectedSubject?.name ?? "this subject"}.`}
            </DialogDescription>
          </DialogHeader>

          <Stepper step={step} />
        </div>

        <div className="px-6">
          {step === "subject" ? (
            <SubjectPicker
              subjects={subjects}
              isLoading={subjectsQuery.isLoading}
              search={subjectSearch}
              onSearchChange={setSubjectSearch}
              selectedId={selectedSubject?.id ?? null}
              onSelect={setSelectedSubject}
            />
          ) : (
            <ClassPicker
              classes={classes}
              total={classesTotal}
              isLoading={classesQuery.isLoading}
              search={classSearch}
              onSearchChange={setClassSearch}
              isChecked={isChecked}
              alreadyLinkedIds={alreadyLinkedIds}
              removedClassIds={removedClassIds}
              onToggle={toggleClass}
              onToggleAll={toggleSelectAll}
              allVisibleChecked={allVisibleChecked}
              isLinksLoading={existingLinksQuery.isLoading}
              hasNextPage={Boolean(classesQuery.hasNextPage)}
              isFetchingNextPage={classesQuery.isFetchingNextPage}
              onLoadMore={() => classesQuery.fetchNextPage()}
            />
          )}
        </div>

        <DialogFooter className="border-t bg-muted/30 px-6 py-4">
          <div className="mr-auto text-xs text-muted-foreground">
            {step === "subject"
              ? selectedSubject
                ? `Selected: ${selectedSubject.name}`
                : "Pick a subject to continue"
              : (() => {
                  const parts: string[] = [];
                  if (addedClassIds.length > 0)
                    parts.push(`${addedClassIds.length} to link`);
                  if (removedClassIds.length > 0)
                    parts.push(`${removedClassIds.length} to unlink`);
                  if (parts.length === 0)
                    return `${effectiveSelectedCount} linked · no changes`;
                  return parts.join(" · ");
                })()}
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {step === "classes" && !prefillSubject ? (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : null}
          {step === "subject" ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!selectedSubject}
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSaving ||
                (addedClassIds.length === 0 && removedClassIds.length === 0)
              }
            >
              {isSaving ? (
                <Spinner className="size-4" />
              ) : (
                <Check className="size-4" />
              )}
              {addedClassIds.length === 0 && removedClassIds.length === 0
                ? "Save changes"
                : `Save changes (${addedClassIds.length + removedClassIds.length})`}
            </Button>
          )}
        </DialogFooter>
    </>
  );
}

function Stepper({ step }: { step: Step }) {
  const items = [
    { key: "subject" as const, label: "Pick subject", icon: BookOpen },
    { key: "classes" as const, label: "Pick classes", icon: Layers3 },
  ];
  return (
    <div className="flex items-center gap-2">
      {items.map((item, index) => {
        const Icon = item.icon;
        const active = step === item.key;
        const done = step === "classes" && item.key === "subject";
        return (
          <div key={item.key} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : done
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-input text-muted-foreground",
              )}
            >
              <span className="grid size-5 place-items-center rounded-full bg-background/40">
                {done ? (
                  <Check className="size-3" />
                ) : (
                  <Icon className="size-3" />
                )}
              </span>
              {item.label}
            </div>
            {index < items.length - 1 ? (
              <div className="h-px w-6 bg-border" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function SubjectPicker({
  subjects,
  isLoading,
  search,
  onSearchChange,
  selectedId,
  onSelect,
}: {
  subjects: SubjectItem[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  selectedId: string | null;
  onSelect: (subject: SubjectItem) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search subjects"
          className="pl-8"
        />
      </div>

      <div className="h-72 overflow-y-auto rounded-lg border">
        {isLoading ? (
          <div className="grid h-full place-items-center">
            <Spinner className="size-5" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
            No active subjects match.
          </div>
        ) : (
          <ul className="divide-y">
            {subjects.map((subject) => {
              const active = subject.id === selectedId;
              return (
                <li key={subject.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(subject)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                      active
                        ? "bg-primary/5"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-md bg-brand-50 text-brand-700",
                        active && "bg-primary text-primary-foreground",
                      )}
                    >
                      <BookOpen className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {subject.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {subject.code ?? "No code"}
                        {subject.departmentName
                          ? ` · ${subject.departmentName}`
                          : ""}
                        {subject.isElective ? " · Elective" : ""}
                      </div>
                    </div>
                    {active ? (
                      <Check className="size-4 text-primary" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function ClassPicker({
  classes,
  total,
  isLoading,
  search,
  onSearchChange,
  isChecked,
  alreadyLinkedIds,
  removedClassIds,
  onToggle,
  onToggleAll,
  allVisibleChecked,
  isLinksLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  classes: ClassItem[];
  total: number;
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  isChecked: (classId: string) => boolean;
  alreadyLinkedIds: Set<string>;
  removedClassIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  allVisibleChecked: boolean;
  isLinksLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search classes"
            className="pl-8"
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onToggleAll}
          disabled={classes.length === 0}
        >
          {allVisibleChecked ? "Clear" : "Select all"}
        </Button>
      </div>

      <div className="h-72 overflow-y-auto rounded-lg border">
        {isLoading || isLinksLoading ? (
          <div className="grid h-full place-items-center">
            <Spinner className="size-5" />
          </div>
        ) : classes.length === 0 ? (
          <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
            No classes match.
          </div>
        ) : (
          <ul className="divide-y">
            {classes.map((cls) => {
              const alreadyLinked = alreadyLinkedIds.has(cls.id);
              const willRemove =
                alreadyLinked && removedClassIds.includes(cls.id);
              const checked = isChecked(cls.id);
              return (
                <li key={cls.id}>
                  <button
                    type="button"
                    onClick={() => onToggle(cls.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/60",
                      checked && "bg-primary/5",
                      willRemove && "bg-rose-50",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 place-items-center rounded border",
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      {checked ? <Check className="size-3.5" /> : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {cls.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {cls.level != null ? `Level ${cls.level}` : "No level"}
                        {cls.sections.length
                          ? ` · ${cls.sections.length} section${cls.sections.length === 1 ? "" : "s"}`
                          : ""}
                      </div>
                    </div>
                    {willRemove ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                        Will unlink
                      </span>
                    ) : alreadyLinked ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Linked
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
            {hasNextPage ? (
              <li className="flex items-center justify-center px-3 py-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Spinner className="size-4" />
                  ) : null}
                  Load more
                </Button>
              </li>
            ) : null}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Showing {classes.length}
          {total ? ` of ${total}` : ""} classes
        </span>
        {!hasNextPage && classes.length > 0 ? (
          <span>End of list</span>
        ) : null}
      </div>
    </div>
  );
}
