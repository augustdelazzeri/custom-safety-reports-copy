"use client";

/**
 * How a work order's status, priority, owner, date and source look (safety-redesign lab-format.tsx and
 * lab-tones.ts): colour only where someone has to act. Open and in progress are accent, on hold is amber
 * (the work stopped), complete is grey; priority is grey except High; an overdue date reads red.
 */

import { Muted, RdBadge, type BadgeTone } from "@/components/redesign/ui";
import { WO_PRIORITY_LABEL, WO_SOURCE_LABEL, WO_STATUS_LABEL, assigneeName, isOverdue, type SafetyWoRow, type WoPriority, type WoStatus } from "@/lib/screens/work-orders";
import { cn } from "@/lib/utils";
import { Link2, TriangleAlert } from "lucide-react";

const STATUS_TONE: Record<WoStatus, BadgeTone> = { open: "accent", in_progress: "accent", on_hold: "warning", complete: "neutral" };
const PRIORITY_TONE: Record<WoPriority, BadgeTone> = { none: "neutral", low: "neutral", medium: "neutral", high: "warning" };

export function StatusBadge({ status }: { status: WoStatus }) {
  return <RdBadge tone={STATUS_TONE[status]}>{WO_STATUS_LABEL[status]}</RdBadge>;
}

export function PriorityBadge({ priority }: { priority: WoPriority }) {
  if (priority === "none") return <Muted />;
  return <RdBadge tone={PRIORITY_TONE[priority]}>{WO_PRIORITY_LABEL[priority]}</RdBadge>;
}

/** The asset and where it is; the code is in the sheet. A work order on a place says so. */
export function AssetCell({ row }: { row: SafetyWoRow }) {
  return (
    <div className="min-w-0">
      {row.asset ? (
        <p className="truncate text-foreground" title={row.asset.code ? `${row.asset.name} · ${row.asset.code}` : row.asset.name}>
          {row.asset.name}
        </p>
      ) : (
        <p className="truncate text-muted-foreground">No asset</p>
      )}
      <p className="truncate text-xs font-medium tracking-[0.02em] text-text-subtle">{row.location}</p>
    </div>
  );
}

/** An unassigned work order is not a neutral blank: it is work nobody is doing. */
export function AssigneeCell({ row }: { row: SafetyWoRow }) {
  const name = assigneeName(row);
  if (name) return <span className="block truncate">{name}</span>;
  if (row.status === "complete") return <Muted />;
  return (
    <RdBadge tone="warning">
      <TriangleAlert aria-hidden />
      Nobody assigned
    </RdBadge>
  );
}

/** A date to act on: overdue reads red, a finished one turns grey. */
export function DueCell({ row }: { row: SafetyWoRow }) {
  if (!row.due) return <Muted />;
  const late = isOverdue(row);
  const days = late && row.dueIn !== undefined ? Math.abs(row.dueIn) : 0;
  return (
    <span
      className={cn("block truncate", late && "font-medium text-badge-error-foreground", row.status === "complete" && "text-muted-foreground")}
      title={late ? `Overdue ${days} day${days === 1 ? "" : "s"}` : row.status === "complete" && row.doneAt ? `Completed ${row.doneAt}` : undefined}
    >
      {row.due}
    </span>
  );
}

export function SourceBadge({ row }: { row: SafetyWoRow }) {
  return (
    <RdBadge tone="accent" className="max-w-full" title={`${WO_SOURCE_LABEL[row.source.kind]}: ${row.source.title}`}>
      <Link2 aria-hidden />
      <span className="truncate">{row.source.kind === "job" ? `Job · ${row.source.ref}` : row.source.kind === "calendar" ? "Calendar" : row.source.ref}</span>
    </RdBadge>
  );
}
