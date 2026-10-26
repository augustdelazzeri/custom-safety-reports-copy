"use client";

import type { TaskStatus } from "@/lib/three-cases/tasks";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Dot, LEVEL, NeedChips } from "./status";

/** A suggested task as a row: readiness dot, verb, title, then what exists and what gets created. */
export function TaskOption({
  task,
  active,
  onPick,
  chips = true,
  className,
}: {
  task: TaskStatus;
  active?: boolean;
  onPick: (jobId: string) => void;
  chips?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onPick(task.job.id)}
      className={cn("group flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left", active ? "bg-badge-accent" : "hover:bg-surface-subtle", className)}
    >
      <Dot level={task.level} className="mt-1.5" />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-placeholder">{task.job.verb}</span>
          <span className="truncate text-sm font-medium text-foreground">{task.job.title}</span>
        </span>
        <span className={cn("block text-xs", LEVEL[task.level].text)}>{task.headline}</span>
        {chips ? <NeedChips task={task} className="mt-1" /> : null}
      </span>
      <ArrowRight className={cn("mt-1 size-4 shrink-0 transition", active ? "text-badge-accent-foreground" : "text-text-placeholder group-hover:text-badge-accent-foreground")} />
    </button>
  );
}
