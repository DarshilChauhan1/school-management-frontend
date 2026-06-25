"use client";

import { cn } from "@/lib/utils";

export function TableHeaderSkeleton({
  columns,
  className,
}: {
  columns: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-3 px-4 py-2.5",
        className,
      )}
      style={{
        gridTemplateColumns: Array.from({ length: columns })
          .map(() => "minmax(0,1fr)")
          .join(" "),
      }}
      aria-label="Loading table header"
    >
      {Array.from({ length: columns }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-3 rounded-full bg-muted-foreground/15 skeleton-shimmer",
            index % 3 === 0 ? "w-16" : index % 3 === 1 ? "w-24" : "w-12",
          )}
        />
      ))}
    </div>
  );
}
