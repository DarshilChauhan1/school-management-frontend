"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function StudentDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8" aria-label="Loading student dashboard">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-10 w-52 rounded-xl" />
          <Skeleton className="h-4 w-80 max-w-full rounded-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="paper-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
              <Skeleton className="size-10 rounded-xl" />
            </div>
            <Skeleton className="mt-5 h-3 w-36 rounded-full" />
          </div>
        ))}
      </div>

      <div className="paper-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl md:w-36" />
          <Skeleton className="h-11 w-full rounded-xl md:w-36" />
          <Skeleton className="h-11 w-full rounded-xl md:w-36" />
        </div>
      </div>

      <div className="paper-card overflow-hidden p-0">
        <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/30 px-6 py-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-20 rounded-full" />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 px-6 py-4">
              <Skeleton className="h-10 w-44 rounded-xl" />
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="ml-auto size-8 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
