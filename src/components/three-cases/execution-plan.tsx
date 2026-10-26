"use client";

import { Button } from "@/components/ui/button";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { asset as getAsset, isLinked } from "@/lib/three-cases/data";
import type { ExecutionJob, PlanItemKind } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  Check,
  Clipboard,
  ClipboardList,
  FileCheck,
  HardHat,
  Info,
  Loader2,
  Lock,
  MessageSquare,
  Paperclip,
  Repeat,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AiTag } from "./shell";

const KIND_ICON: Record<PlanItemKind, React.ComponentType<{ className?: string }>> = {
  ptw: FileCheck,
  wo: Wrench,
  pm: Repeat,
  sop: ClipboardList,
  loto: Lock,
  jha: HardHat,
  audit: Clipboard,
  notify: MessageSquare,
  attach: Paperclip,
  note: Info,
};

const KIND_LABEL: Record<PlanItemKind, string> = {
  ptw: "Permit",
  wo: "Work order",
  pm: "Preventive maintenance",
  sop: "SOP",
  loto: "LOTO",
  jha: "JHA",
  audit: "Inspection",
  notify: "Notify",
  attach: "Attach",
  note: "Note",
};

/** The plan the AI proposes for a job, approved with one click. */
export function ExecutionPlan({
  job,
  onBack,
  dense = false,
  asked,
}: {
  job: ExecutionJob;
  onBack?: () => void;
  dense?: boolean;
  /** What the person typed, when the plan came from the chat. */
  asked?: string;
}) {
  const { createExecution, linkDocs, linkedDocIds } = useThreeCases();
  const [phase, setPhase] = useState<"review" | "running" | "done">("review");
  const [step, setStep] = useState(0);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const actionable = job.plan.filter((p) => p.kind !== "note" && p.kind !== "attach");
  const records = job.plan.filter((p) => p.kind !== "note" && p.kind !== "attach" && p.kind !== "notify");
  const extras = job.plan.filter((p) => !records.includes(p));
  const a = getAsset(job.assetId);
  // Documents the plan relies on that the AI found by title: approving the plan links them.
  const toLink = (a?.docs ?? []).filter((d) => job.basedOn.includes(d.id) && !isLinked(d, linkedDocIds));

  useEffect(() => {
    setPhase("review");
    setStep(0);
    setExecutionId(null);
  }, [job.id]);

  useEffect(() => {
    if (phase !== "running") return;
    if (step >= actionable.length) {
      const ex = createExecution(job.id);
      linkDocs(job.basedOn);
      setExecutionId(ex.id);
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 550);
    return () => clearTimeout(t);
  }, [phase, step, actionable.length, createExecution, linkDocs, job.id, job.basedOn]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-primary/40 bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <AiTag label="Plan drafted by AI" className="shrink-0" />
            {job.recurring ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-badge-warning px-2 py-0.5 text-xs font-medium text-badge-warning-foreground">
                <Repeat className="size-3" /> Recurring
              </span>
            ) : null}
            <h3 className="truncate text-base font-semibold text-foreground">{job.title}</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {asked ? <span className="text-foreground">You asked &ldquo;{asked}&rdquo; · </span> : null}
            {a?.code} · {job.when} · {job.reason}
          </p>
        </div>
        {onBack && phase === "review" ? (
          <button onClick={onBack} className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground">
            Change
          </button>
        ) : null}
      </div>

      <div className={cn("@container flex-1 space-y-2 overflow-y-auto px-4 py-3", dense && "space-y-1.5")}>
        {/* What gets created: one card each, side by side when there is room. */}
        <ol className={cn("grid grid-cols-1 gap-2", records.length > 1 && "@xl:grid-cols-2")}>
          {records.map((item) => {
            const Icon = KIND_ICON[item.kind];
            const idx = actionable.indexOf(item);
            const created = phase === "done" || (phase === "running" && idx > -1 && idx < step);
            const working = phase === "running" && idx === step;
            return (
              <li
                key={item.id}
                className={cn("flex gap-2.5 rounded-lg border px-3 py-2", created ? "border-emerald-200 bg-emerald-50/50" : "border-border")}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                    created ? "bg-emerald-100 text-badge-success-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {created ? <Check className="size-4" /> : working ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-text-placeholder">{KIND_LABEL[item.kind]}</span>
                    {item.isNew ? (
                      <span className={cn("text-xs font-medium", created ? "text-badge-success-foreground" : "text-badge-accent-foreground")}>
                        {(() => {
                          const ref = item.ref ?? (item.kind === "wo" || item.kind === "pm" ? job.woRef : undefined);
                          return created ? `created${ref ? ` · ${ref}` : ""}` : `${ref ? `${ref} ` : ""}will be created`;
                        })()}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm font-medium text-foreground">{item.title.replace(/^Work order WO-\d+:\s*/, "")}</div>
                  <div className="text-xs text-muted-foreground">
                    {[item.detail, ...item.meta].join(" · ")}
                  </div>
                  {item.why ? <div className="mt-1 text-xs text-badge-accent-foreground">Why: {item.why}</div> : null}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Everything else the plan does, one line each. */}
        {extras.length > 0 || job.recurring ? (
          <ul className="space-y-1">
            {extras.map((item) => {
              const Icon = KIND_ICON[item.kind];
              const idx = actionable.indexOf(item);
              const created = phase === "done" || (phase === "running" && idx > -1 && idx < step);
              return (
                <li
                  key={item.id}
                  title={item.why ? `Why: ${item.why}` : undefined}
                  className={cn(
                    "flex items-start gap-2 rounded-md px-2 py-1 text-xs",
                    item.kind === "note" ? "bg-badge-warning text-amber-900" : "text-foreground",
                  )}
                >
                  {created && item.kind === "notify" ? (
                    <Check className="mt-px size-3.5 shrink-0 text-badge-success-foreground" />
                  ) : (
                    <Icon className={cn("mt-px size-3.5 shrink-0", item.kind === "note" ? "text-badge-warning-foreground" : "text-text-placeholder")} />
                  )}
                  <span>
                    <span className="font-medium text-foreground">{item.title}</span>
                    <span className="text-muted-foreground"> · {item.detail}</span>
                  </span>
                </li>
              );
            })}
            {job.recurring ? (
              <li className="flex flex-wrap items-center gap-1.5 px-2 py-1 text-xs text-foreground">
                <CalendarClock className="size-3.5 text-text-placeholder" />
                <span className="font-medium text-foreground">Next</span>
                {job.recurring.next.map((n) => (
                  <span key={n.date} className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground" title={n.note}>
                    {n.date}
                    {n.note ? <span className="ml-0.5 text-amber-700">*</span> : null}
                  </span>
                ))}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        {phase === "done" && executionId ? (
          <>
            <span className="flex items-center gap-1.5 text-sm font-medium text-badge-success-foreground">
              <Check className="size-4" /> Created {[...job.plan.filter((p) => p.ref).map((p) => p.ref), job.woRef].join(", ")}
              <span className="font-normal text-muted-foreground">· now on the asset</span>
            </span>
            <Button asChild size="sm">
              <Link href={`/safety-execution/work-orders/${executionId}`}>
                Open {job.recurring ? job.woRef : job.woRef}
              </Link>
            </Button>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground">
              {actionable.length} items
              {toLink.length ? ` · also links ${toLink.map((d) => d.ref).join(", ")} to ${a?.name}` : ""} · nothing is created until you approve
            </span>
            <Button size="sm" disabled={phase === "running"} onClick={() => setPhase("running")}>
              {phase === "running" ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" /> Creating
                </>
              ) : (
                "Approve and create"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
