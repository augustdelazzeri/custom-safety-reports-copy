"use client";

/**
 * The list of the redesign (safety-redesign src/lab/ui/lab-table.tsx), cut to what the prototype
 * needs: the ask field, Filters with its count, then Sort, Columns and Export; a table with the
 * tinted 44px header and 52px rows; the empty state on the page when nothing is left.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Check, Columns3, FileDown, Funnel, X } from "lucide-react";
import type { ReactNode, SVGProps } from "react";
import { menuCaption, menuItem } from "./ui";

/** Search with AI: a magnifier whose rim opens for a sparkle (lab-ai-search-icon.tsx). */
export function AiSearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16.8 10.8A6.5 6.5 0 1 1 9.4 6.1" />
      <path d="m15.4 17.4 4.6 4.6" />
      <path d="M15 3.5c.3 1.6 1 2.3 2.5 2.5-1.5.2-2.2 .9-2.5 2.5-.3-1.6-1-2.3-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5Z" />
      <path d="M20.5 1.5v3M19 3h3" />
    </svg>
  );
}

/** The ask field: one question, read as filters. Here it filters the rows by their words. */
export function RdAsk({ value, onChange, placeholder = "Search or Filter anything with AI" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex min-w-[240px] flex-1 flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 sm:max-w-115">
        <AiSearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-badge-accent-foreground" aria-hidden />
        <Input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-8 pr-8 pl-7.5" />
        {value ? (
          <Button type="button" variant="ghost" size="icon-xs" className="absolute top-1/2 right-1 -translate-y-1/2" aria-label="Clear" onClick={() => onChange("")}>
            <X />
          </Button>
        ) : null}
      </div>
      <Button type="button" variant="secondary" size="sm" className="rounded-lg px-3 text-sm">
        Ask
      </Button>
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

const toolbarButton = "gap-2 rounded-lg px-3 text-sm [&_svg:not([class*='size-'])]:size-4";

/** Filters keeps its label and the count; then a divider and the three quieter controls. */
export function RdToolbar({
  filterLabel = "Status",
  filters,
  selected,
  onToggle,
  sorts,
  sort,
  onSort,
}: {
  filterLabel?: string;
  filters: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  sorts: FilterOption[];
  sort: string;
  onSort: (value: string) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className={toolbarButton}>
            <Funnel aria-hidden />
            Filters
            {selected.length ? <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums">{selected.length}</Badge> : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[300px] p-2">
          <p className={cn(menuCaption, "pt-1 pb-2")}>{filterLabel}</p>
          {filters.map((f) => (
            <label key={f.value} className={menuItem}>
              <input type="checkbox" checked={selected.includes(f.value)} onChange={() => onToggle(f.value)} className="size-4 accent-[var(--indigo-9)]" />
              <span className="flex-1">{f.label}</span>
              {f.count !== undefined ? <span className="text-xs text-muted-foreground tabular-nums">{f.count}</span> : null}
            </label>
          ))}
        </PopoverContent>
      </Popover>
      <Separator orientation="vertical" className="data-[orientation=vertical]:h-7" />
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className={toolbarButton}>
              <ArrowUpDown aria-hidden />
              Sort
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-60 p-2">
            <p className={cn(menuCaption, "pt-1 pb-2")}>Sort by</p>
            {sorts.map((s) => (
              <button key={s.value} type="button" onClick={() => onSort(s.value)} className={cn(menuItem, sort === s.value && "font-semibold")}>
                <span className="flex size-4 items-center justify-center">{sort === s.value ? <Check className="size-4 text-primary" /> : null}</span>
                {s.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Button type="button" variant="outline" size="sm" className={toolbarButton} title="Choose the columns (not part of this prototype)">
          <Columns3 aria-hidden />
          Columns
        </Button>
        <Button type="button" variant="outline" size="sm" className={toolbarButton} disabled title="Export (not part of this prototype)">
          <FileDown aria-hidden />
          Export
        </Button>
      </div>
    </div>
  );
}

export interface RdColumn<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => ReactNode;
}

/** The table: separate borders, the 44px tinted header, 52px rows that darken on hover. */
export function RdTable<T>({ rows, columns, rowKey, onRow }: { rows: T[]; columns: RdColumn<T>[]; rowKey: (row: T) => string; onRow?: (row: T) => void }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="bg-surface-subtle">
            {columns.map((c) => (
              <th key={c.key} scope="col" style={c.width ? { width: c.width } : undefined} className="h-11 border-b border-border px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} onClick={onRow ? () => onRow(row) : undefined} className={cn("group transition-colors", onRow && "cursor-pointer hover:bg-muted/50")}>
              {columns.map((c) => (
                <td key={c.key} className="h-13 overflow-hidden border-b border-border px-4 align-middle text-foreground group-last:border-b-0">
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
