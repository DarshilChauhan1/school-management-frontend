"use client";

import { cn } from "@/lib/utils";

export function StudentDashboardSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading student dashboard">
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="h-3 w-24 rounded-full bg-muted-foreground/15 skeleton-shimmer" />
              <span className="size-8 rounded-md bg-muted-foreground/15 skeleton-shimmer" />
            </div>
            <span className="mt-4 block h-8 w-16 rounded-md bg-muted-foreground/15 skeleton-shimmer" />
            <span className="mt-3 block h-3 w-28 rounded-full bg-muted-foreground/15 skeleton-shimmer" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <span className="h-8 flex-1 rounded-md bg-muted-foreground/15 skeleton-shimmer" />
          <span className="h-8 w-32 rounded-md bg-muted-foreground/15 skeleton-shimmer" />
          <span className="h-8 w-28 rounded-md bg-muted-foreground/15 skeleton-shimmer" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="grid grid-cols-6 gap-3 border-b bg-muted/60 px-4 py-2.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-3 rounded-full bg-muted-foreground/15 skeleton-shimmer",
                index % 2 ? "w-16" : "w-24",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
