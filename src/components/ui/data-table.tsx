"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { TableHeaderSkeleton } from "@/components/skeletons/table-header-skeleton";

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isHeaderLoading?: boolean;
  emptyState?: React.ReactNode;
  maxBodyHeight?: number | string;
  pagination?: DataTablePaginationProps;
  className?: string;
}

const alignClass = (align?: "left" | "right" | "center") =>
  align === "right"
    ? "text-right"
    : align === "center"
      ? "text-center"
      : "text-left";

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isHeaderLoading,
  emptyState,
  maxBodyHeight = 480,
  pagination,
  className,
}: DataTableProps<T>) {
  const gridTemplate = React.useMemo(
    () =>
      columns
        .map((c) => (c.className?.includes("w-") ? "auto" : "minmax(0,1fr)"))
        .join(" "),
    [columns],
  );

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card",
        className,
      )}
    >
      <div className="relative border-b bg-muted/60">
        <div
          className={cn(
            "grid px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-opacity",
            isHeaderLoading && "opacity-0",
          )}
          style={{ gridTemplateColumns: gridTemplate, gap: "0.75rem" }}
          aria-hidden={isHeaderLoading ? true : undefined}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn(alignClass(col.align), col.headerClassName)}
            >
              {col.header}
            </div>
          ))}
        </div>
        {isHeaderLoading ? (
          <TableHeaderSkeleton columns={columns.length} className="absolute inset-0" />
        ) : null}
      </div>

      <div
        className="overflow-y-auto"
        style={{
          maxHeight:
            typeof maxBodyHeight === "number"
              ? `${maxBodyHeight}px`
              : maxBodyHeight,
        }}
      >
        {rows.length ? (
          <div className={cn("divide-y", isLoading && "opacity-70")}>
            {rows.map((row, idx) => (
              <div
                key={rowKey(row)}
                className="grid animate-table-row items-center px-4 py-3 text-sm transition-all hover:bg-muted/40 hover:shadow-[inset_3px_0_0_var(--primary)]"
                style={{ gridTemplateColumns: gridTemplate, gap: "0.75rem" }}
              >
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={cn(
                      "min-w-0",
                      alignClass(col.align),
                      col.className,
                    )}
                  >
                    {col.cell(row, idx)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <div className="grid min-h-44 place-items-center px-6 text-center text-sm text-muted-foreground">
            Loading records…
          </div>
        ) : (
          <div className="grid min-h-44 place-items-center px-6 text-center text-sm text-muted-foreground">
            {emptyState ?? "No results found."}
          </div>
        )}
      </div>

      {pagination ? <DataTablePagination {...pagination} /> : null}
    </div>
  );
}

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  label?: string;
  disabled?: boolean;
}

const DEFAULT_PAGE_SIZES = [5, 10, 25, 50];

export function DataTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  label = "rows",
  disabled,
}: DataTablePaginationProps) {
  const safePages = Math.max(totalPages, 1);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pageNumbers = React.useMemo<(number | "…")[]>(() => {
    if (safePages <= 7) {
      return Array.from({ length: safePages }, (_, i) => i + 1);
    }
    const out: (number | "…")[] = [1];
    if (page > 3) out.push("…");
    const from = Math.max(2, page - 1);
    const to = Math.min(safePages - 1, page + 1);
    for (let i = from; i <= to; i++) out.push(i);
    if (page < safePages - 2) out.push("…");
    out.push(safePages);
    return out;
  }, [page, safePages]);

  return (
    <div className="flex flex-wrap items-center gap-3 border-t bg-card px-4 py-2.5 text-xs text-muted-foreground">
      <label className="flex items-center gap-2">
        <span>Rows per page</span>
        <select
          value={pageSize}
          disabled={disabled}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <span className="tabular-nums">
        {total === 0 ? (
          `No ${label}`
        ) : (
          <>
            Showing{" "}
            <strong className="font-semibold text-foreground">
              {start}–{end}
            </strong>{" "}
            of{" "}
            <strong className="font-semibold text-foreground">{total}</strong>{" "}
            {label}
          </>
        )}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <PageButton
          aria-label="Previous page"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-3.5" />
        </PageButton>
        {pageNumbers.map((entry, idx) =>
          entry === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              className="grid min-w-7 place-items-center text-muted-foreground"
            >
              …
            </span>
          ) : (
            <PageButton
              key={entry}
              active={entry === page}
              disabled={disabled}
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? "page" : undefined}
            >
              {entry}
            </PageButton>
          ),
        )}
        <PageButton
          aria-label="Next page"
          disabled={disabled || page >= safePages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-3.5" />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-xs font-semibold tabular-nums transition-colors",
        "border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
        active &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-background disabled:hover:text-muted-foreground",
        className,
      )}
    />
  );
}
