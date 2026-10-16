"use client";

import { Button } from "@/components/ui/button";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { asset as getAsset } from "@/lib/three-cases/data";
import type { ExecutionJob, PlanItemKind } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  Check,
  ClipboardList,
  FileCheck,
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
  notify: "Notify",
  attach: "Attach",
  note: "Note",
};

/** The plan the AI proposes for a job, approved with one click. */
export function ExecutionPlan({ job, onBack, dense = false }: { job: ExecutionJob; onBack?: () => void; dense?: boolean }) {
  const { createExecution } = useThreeCases();
  const [phase, setPhase] = useState<"review" | "running" | "done">("review");
  const [step, setStep] = useState(0);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const actionable = job.plan.filter((p) => p.kind !== "note" && p.kind !== "attach");
  const a = getAsset(job.assetId);

  useEffect(() => {
    setPhase("review");
    setStep(0);
    setExecutionId(null);
  }, [job.id]);

  useEffect(() => {
    if (phase !== "running") return;
    if (step >= actionable.length) {
      const ex = createExecution(job.id);
      setExecutionId(ex.id);
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 550);
    return () => clearTimeout(t);
  }, [phase, step, actionable.length, createExecution, job.id]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-indigo-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <AiTag label="Plan drafted by AI" />
            {job.recurring ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                <Repeat className="size-3" /> Recurring
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 truncate text-base font-semibold text-gray-900">{job.title}</h3>
          <p className="text-xs text-gray-500">
            {a?.code} · {job.when} · {job.reason}
          </p>
        </div>
        {onBack && phase === "review" ? (
          <button onClick={onBack} className="shrink-0 text-xs font-medium text-gray-500 hover:text-gray-800">
            Change
          </button>
        ) : null}
      </div>

      <ol className={cn("flex-1 space-y-2 overflow-y-auto px-4 py-3", dense && "space-y-1.5")}>
        {job.plan.map((item) => {
          const Icon = KIND_ICON[item.kind];
          const idx = actionable.indexOf(item);
          const created = phase === "done" || (phase === "running" && idx > -1 && idx < step);
          const working = phase === "running" && idx === step;
          return (
            <li
              key={item.id}
              className={cn(
                "flex gap-3 rounded-lg border px-3 py-2",
                item.kind === "note" ? "border-amber-200 bg-amber-50/60" : "border-gray-200",
                created && "border-emerald-200 bg-emerald-50/50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                  created ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600",
                )}
              >
                {created ? <Check className="size-4" /> : working ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{KIND_LABEL[item.kind]}</span>
                  {item.isNew ? <span className="text-[10px] font-medium text-indigo-600">will be created</span> : null}
                </div>
                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-600">{item.detail}</div>
                {item.meta.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.meta.map((m) => (
                      <span key={m} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">
                        {m}
                      </span>
                    ))}
                  </div>
                ) : null}
                {item.why ? <div className="mt-1 text-[11px] italic text-indigo-700">Why: {item.why}</div> : null}
              </div>
            </li>
          );
        })}
        {job.recurring ? (
          <li className="rounded-lg border border-gray-200 px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <CalendarClock className="size-4 text-gray-500" /> Next occurrences
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {job.recurring.next.map((n) => (
                <span key={n.date} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-800" title={n.note}>
                  {n.date}
                  {n.note ? <span className="ml-1 text-amber-700">*</span> : null}
                </span>
              ))}
            </div>
          </li>
        ) : null}
      </ol>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
        {phase === "done" && executionId ? (
          <>
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <Check className="size-4" /> Created. {job.plan.some((p) => p.kind === "ptw") ? "Permit sent for approval." : ""}
            </span>
            <Button asChild size="sm">
              <Link href={`/safety-execution/work-orders/${executionId}`}>
                Open {job.recurring ? job.woRef : job.woRef}
              </Link>
            </Button>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-500">
              {actionable.length} items · nothing is created until you approve
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
