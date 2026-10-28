"use client";

import { useThreeCases } from "@/contexts/ThreeCasesContext";
import type { Need, ReadinessState, TaskLevel, TaskStatus } from "@/lib/three-cases/tasks";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Plus, RefreshCw, Sparkles } from "lucide-react";
import { useMemo } from "react";

export function useReadiness(): ReadinessState {
  const { executions, linkedDocIds } = useThreeCases();
  return useMemo(() => ({ executions, linkedDocIds }), [executions, linkedDocIds]);
}

export const LEVEL: Record<TaskLevel, { dot: string; text: string; soft: string; label: string; border: string }> = {
  ready: { dot: "bg-emerald-500", text: "text-emerald-700", soft: "bg-emerald-50", border: "border-emerald-200", label: "Ready" },
  update: { dot: "bg-amber-500", text: "text-amber-700", soft: "bg-amber-50", border: "border-amber-200", label: "Needs review" },
  missing: { dot: "bg-rose-500", text: "text-rose-700", soft: "bg-rose-50", border: "border-rose-200", label: "Missing documents" },
  scheduled: { dot: "bg-sky-500", text: "text-sky-700", soft: "bg-sky-50", border: "border-sky-200", label: "Scheduled" },
};

export function Dot({ level, className, title }: { level?: TaskLevel; className?: string; title?: string }) {
  return (
    <span
      title={title ?? (level ? LEVEL[level].label : "Nothing suggested yet")}
      className={cn("inline-block size-2 shrink-0 rounded-full", level ? LEVEL[level].dot : "bg-border", className)}
    />
  );
}

export function Legend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", className)}>
      {(["ready", "update", "missing", "scheduled"] as TaskLevel[]).map((l) => (
        <span key={l} className="inline-flex items-center gap-1">
          <Dot level={l} /> {l === "ready" ? "Docs on file" : l === "update" ? "Review or link needed" : l === "missing" ? "AI drafts what is missing" : "A PM runs it"}
        </span>
      ))}
    </div>
  );
}

function needTitle(n: Need) {
  return [
    n.ref ? `${n.ref}${n.title ? ` · ${n.title}` : ""}` : `${n.label}: not on file`,
    n.note,
    n.found ? "Likely match: the AI found it by title, not linked to the asset yet. Approving links it." : "",
    `Why: ${n.why}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** One chip per prerequisite, then what each execution creates. */
export function NeedChips({ task, className, hideRuns = false }: { task: TaskStatus; className?: string; hideRuns?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {task.needs.map((n) => (
        <span
          key={n.type}
          title={needTitle(n)}
          className={cn(
            "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
            n.state === "ok" && "bg-muted text-muted-foreground",
            n.state === "update" && !n.stale && "border border-dashed border-sky-300 bg-sky-50 text-sky-800",
            n.state === "update" && n.stale && "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
            n.state === "missing" && "border border-dashed border-rose-300 bg-rose-50/60 text-rose-700",
            n.state === "skip" && "bg-surface-subtle text-text-placeholder line-through",
          )}
        >
          {n.state === "ok" ? <Check className="size-3 text-emerald-600" /> : null}
          {n.state === "update" && !n.stale ? <Sparkles className="size-3 text-sky-600" /> : null}
          {n.state === "update" && n.stale ? <RefreshCw className="size-3" /> : null}
          {n.state === "missing" ? <Plus className="size-3" /> : null}
          {n.label}
        </span>
      ))}
      {hideRuns ? null : (
        <>
          <ArrowRight className="mx-0.5 size-3 text-text-placeholder" />
          {task.runs.map((r) => (
            <span key={r.kind} title={r.why} className="rounded bg-badge-accent px-1.5 py-0.5 text-xs font-medium text-badge-accent-foreground">
              {r.label}
            </span>
          ))}
        </>
      )}
    </div>
  );
}
