"use client";

/** How a corrective action's status, priority, origin and due date read, the same on the list and the record. */

import { Muted, RdBadge } from "@/components/redesign/ui";
import { PRIORITY_TONE, STATUS_LABEL, STATUS_TONE, dueIn, isOverdue, type ActionRecord } from "@/lib/screens/actions";
import { cn } from "@/lib/utils";
import { CircleCheck, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

export const ActionStatusBadge = ({ status }: { status: ActionRecord["status"] }) => <RdBadge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</RdBadge>;

export const PriorityBadge = ({ priority }: { priority: ActionRecord["priority"] }) => <RdBadge tone={PRIORITY_TONE[priority]}>{priority}</RdBadge>;

/** Whether an action came from a real event: the thing today's list hides behind a "—" column. */
export const OriginBadge = ({ action }: { action: ActionRecord }) =>
  action.event ? (
    <RdBadge tone="accent" title={`From ${action.event.ref}`}>
      From an event
    </RdBadge>
  ) : (
    <RdBadge>{action.type}</RdBadge>
  );

/** A date the reader has to act on: overdue reads red with how late, a closed action's date turns grey. */
export function DueText({ action, className }: { action: Pick<ActionRecord, "due" | "status">; className?: string }) {
  if (!action.due) return <Muted />;
  if (action.status === "closed") return <span className={cn("text-muted-foreground", className)}>{action.due}</span>;
  if (!isOverdue(action)) return <span className={className}>{action.due}</span>;
  const late = Math.abs(dueIn(action) ?? 0);
  return (
    <span className={cn("font-medium text-badge-error-foreground", className)}>
      {action.due} · {late} day{late === 1 ? "" : "s"} late
    </span>
  );
}

/** The record's next step, or that nothing is waiting: the palest grey, one line, the way forward (LabNextActionDone). */
export function NextStep({ message, tone = "done", action }: { message: ReactNode; tone?: "done" | "warning"; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-[var(--lab-radius)] border border-border bg-surface-subtle p-4">
      {tone === "warning" ? <TriangleAlert className="size-4 shrink-0 text-badge-warning-foreground" aria-hidden /> : <CircleCheck className="size-4 shrink-0 text-badge-accent-foreground" aria-hidden />}
      <p className="min-w-0 flex-1 text-sm text-foreground">{message}</p>
      {action}
    </div>
  );
}
