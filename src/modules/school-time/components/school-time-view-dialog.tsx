"use client";

import { CalendarDays, Clock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatTimeOfDay } from "@/lib/time-of-day";

import { useAcademicYears } from "@/modules/academic-year/api/use-academic-years";

import { DAYS } from "../constants/days";
import { useSchoolTimeStore } from "@/stores/dialog-store";

export function SchoolTimeViewDialog() {
  const viewing = useSchoolTimeStore((s) => s.viewing);
  const closeView = useSchoolTimeStore((s) => s.closeView);
  const yearsQuery = useAcademicYears({ limit: 100 });

  const isOpen = Boolean(viewing);
  const yearName =
    yearsQuery.data?.data.data.find((y) => y.id === viewing?.academicYearId)
      ?.name ?? "Academic year";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeView()}>
      <DialogContent className="max-w-xl">
        {viewing ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-md bg-brand-100 text-brand-700">
                  <Clock className="size-4" />
                </span>
                {yearName}
              </DialogTitle>
              <DialogDescription>
                Working days and the hours for each day.
              </DialogDescription>
            </DialogHeader>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="size-4 text-muted-foreground" />
                Daily schedule
              </div>
              <div className="space-y-1.5">
                {DAYS.map((day) => {
                  const wd = viewing.days.find(
                    (w) => w.dayOfWeek === day.value,
                  );
                  const isWorking = wd?.isWorkingDay ?? false;
                  return (
                    <div
                      key={day.value}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm",
                        isWorking
                          ? "bg-card"
                          : "bg-muted/40 text-muted-foreground",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{day.label}</span>
                        {isWorking ? (
                          <span className="font-mono text-xs">
                            {formatTimeOfDay(wd?.startTime)} –{" "}
                            {formatTimeOfDay(wd?.endTime)}
                          </span>
                        ) : (
                          <span className="text-xs">Closed</span>
                        )}
                      </div>
                      {isWorking &&
                      (wd?.assemblyStartTime || wd?.recessStartTime) ? (
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                          {wd?.assemblyStartTime ? (
                            <span>
                              Assembly {formatTimeOfDay(wd.assemblyStartTime)} –{" "}
                              {formatTimeOfDay(wd.assemblyEndTime)}
                            </span>
                          ) : null}
                          {wd?.recessStartTime ? (
                            <span>
                              Recess {formatTimeOfDay(wd.recessStartTime)} –{" "}
                              {formatTimeOfDay(wd.recessEndTime)}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
