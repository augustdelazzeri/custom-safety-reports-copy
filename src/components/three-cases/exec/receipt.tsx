"use client";

import { Button } from "@/components/ui/button";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { asset as getAsset, person } from "@/lib/three-cases/data";
import type { Need, TaskStatus } from "@/lib/three-cases/tasks";
import { cn } from "@/lib/utils";
import { Check, FileCheck, Loader2, Repeat, Wrench } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DOC_ICON } from "../doc-grid";
import { useMeter } from "./meter";
import { Dot, LEVEL } from "./status";

/** What the approve button says: everything that will be created, in plain words. */
export function createLabel(task: TaskStatus) {
  if (task.level === "scheduled" && task.meta.pm) return "Create a one-off work order";
  const parts = [
    ...task.needs.filter((n) => n.state === "missing").map((n) => n.label),
    ...task.runs.map((r) => (r.kind === "wo" ? "work order" : r.kind === "pm" ? "PM" : r.label.toLowerCase())),
  ];
  return `Create ${parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0]}`;
}

export interface Approval {
  phase: "review" | "running" | "done";
  exId: string | null;
  /** What was created and linked, frozen at approval: the task's status changes right after. */
  created: { refs: string[]; linked: string[]; holds: string[] } | null;
  approve: () => void;
}

/**
 * Creates the execution (work order, permit, drafts) and links the documents the AI found.
 * Stops the click meter. Resets when the job changes.
 */
export function useApprove(task: TaskStatus | undefined, { enterToApprove = false } = {}): Approval {
  const { createExecution, linkDocs } = useThreeCases();
  const meter = useMeter();
  const [phase, setPhase] = useState<Approval["phase"]>("review");
  const [exId, setExId] = useState<string | null>(null);
  const [created, setCreated] = useState<Approval["created"]>(null);
  const jobId = task?.job.id;
  const [forJob, setForJob] = useState(jobId);

  // Another job picked: start over (state adjusted during render, as React recommends).
  if (forJob !== jobId) {
    setForJob(jobId);
    setPhase("review");
    setExId(null);
    setCreated(null);
  }

  const approve = () => {
    if (!task || phase !== "review") return;
    const j = task.job;
    const drafts = task.needs.filter((n) => n.state === "missing").map((n) => n.ref);
    const permit = task.runs.find((r) => r.kind === "ptw")?.ref;
    const review = task.needs.filter((n) => n.state === "update" && n.stale).map((n) => n.ref);
    const isRef = (r: string | undefined): r is string => Boolean(r);
    setCreated({
      refs: [...drafts, ...task.runs.map((r) => r.ref)].filter(isRef),
      linked: task.needs.filter((n) => n.found && n.ref).map((n) => n.ref as string),
      // The work order is created now but only released once these are approved.
      holds: [...drafts, ...review, j.recurring ? undefined : permit].filter(isRef),
    });
    setPhase("running");
    setTimeout(() => {
      const ex = createExecution(j.id);
      linkDocs(j.basedOn);
      setExId(ex.id);
      setPhase("done");
      meter?.finish();
    }, 900);
  };

  const approveRef = useRef(approve);
  useEffect(() => {
    approveRef.current = approve;
  });
  useEffect(() => {
    if (!enterToApprove || phase !== "review" || !jobId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        approveRef.current();
      }
    };
    // Next tick, so the Enter that opened the receipt does not approve it too.
    const t = setTimeout(() => window.addEventListener("keydown", onKey), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [enterToApprove, phase, jobId]);

  return { phase, exId, created, approve };
}

/** The approve button: says what it creates, spins while creating. */
export function ApproveButton({ task, approval, size = "sm", className }: { task: TaskStatus; approval: Approval; size?: "sm" | "default"; className?: string }) {
  return (
    <Button size={size} className={className} disabled={approval.phase !== "review"} onClick={approval.approve}>
      {approval.phase === "running" ? (
        <>
          <Loader2 className="mr-1.5 size-4 animate-spin" /> Creating
        </>
      ) : (
        createLabel(task)
      )}
    </Button>
  );
}

/** After approval: what was created, who gets it, and the link to the work order. */
export function Created({ task, approval, onAnother, className }: { task: TaskStatus; approval: Approval; onAnother?: () => void; className?: string }) {
  const j = task.job;
  const a = getAsset(j.assetId);
  const who = person(j.assigneeId);
  if (approval.phase !== "done" || !approval.exId) return null;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
        <Check className="size-4" /> Created {approval.created?.refs.join(", ")}
      </div>
      <p className="text-xs text-gray-600">
        {j.recurring
          ? `${j.woRef} is in the CMMS. Each work order carries the documents and that day's permit.`
          : approval.created?.holds.length
            ? `${j.woRef} is on hold: it goes to ${who.name}'s phone once ${approval.created.holds.join(", ")} ${approval.created.holds.length === 1 ? "is" : "are"} approved.`
            : `${who.name} gets ${j.woRef} on the phone now.`}
        {approval.created?.linked.length ? ` ${approval.created.linked.join(", ")} now linked to ${a?.name}.` : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href={`/safety-execution/work-orders/${approval.exId}`}>Open {j.woRef}</Link>
        </Button>
        {onAnother ? (
          <Button size="sm" variant="outline" onClick={onAnother}>
            Another job
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function Row({ icon, refText, title, right, tone = "plain" }: { icon: ReactNode; refText?: string; title: string; right?: ReactNode; tone?: "plain" | "new" | "warn" }) {
  return (
    <li className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-xs", tone === "new" && "bg-indigo-50/70", tone === "warn" && "bg-amber-50")}>
      <span className={cn("shrink-0", tone === "new" ? "text-indigo-600" : tone === "warn" ? "text-amber-600" : "text-gray-400")}>{icon}</span>
      {refText ? <span className="shrink-0 font-mono text-[11px] text-gray-500">{refText}</span> : null}
      <span className="min-w-0 flex-1 truncate text-gray-800">{title}</span>
      {right ? <span className="shrink-0 text-[11px] text-gray-500">{right}</span> : null}
    </li>
  );
}

function needIcon(n: Need) {
  const Icon = DOC_ICON[n.type];
  return <Icon className="size-3.5" />;
}

/** The receipt's body: on file, review first, AI drafts, and what this execution creates. */
export function ReceiptLines({ task }: { task: TaskStatus }) {
  const j = task.job;
  const who = person(j.assigneeId);
  // Found by title is on file too: approving links it. Only stale documents need someone to act.
  const onFile = task.needs.filter((n) => n.state === "ok" || (n.state === "update" && !n.stale));
  const review = task.needs.filter((n) => n.state === "update" && n.stale);
  const drafts = task.needs.filter((n) => n.state === "missing");
  const skipped = task.needs.filter((n) => n.state === "skip");
  return (
    <div className="space-y-3">
      {task.level === "scheduled" && task.meta.pm ? (
        <p className={cn("rounded-md px-2.5 py-2 text-xs", LEVEL.scheduled.soft, LEVEL.scheduled.text)}>
          <Repeat className="mr-1 inline size-3.5" />
          {task.meta.pm.ref} already creates this work order {task.meta.pm.rule.toLowerCase()}. Next: {task.meta.pm.next.toLowerCase()}.
        </p>
      ) : null}

      {onFile.length || skipped.length ? (
        <section>
          <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">On file</h4>
          <ul className="space-y-0.5">
            {onFile.map((n) => (
              <Row
                key={n.type}
                icon={needIcon(n)}
                refText={n.ref}
                title={n.title ?? n.label}
                right={n.found ? <span className="text-sky-700">AI found · links on approve</span> : n.created ? "drafted earlier" : <Check className="size-3.5 text-emerald-600" />}
              />
            ))}
            {skipped.map((n) => (
              <li key={n.type} className="px-2 py-1 text-[11px] text-gray-500" title={n.why}>
                <span className="font-medium text-gray-600">No {n.label} needed.</span> {n.note}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {review.length ? (
        <section>
          <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">Review first</h4>
          <ul className="space-y-0.5">
            {review.map((n) => (
              <Row key={n.type} tone="warn" icon={needIcon(n)} refText={n.ref} title={n.note ?? "Needs review"} right="sent to the owner" />
            ))}
          </ul>
        </section>
      ) : null}

      {drafts.length ? (
        <section>
          <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">AI drafts, you approve later</h4>
          <ul className="space-y-0.5">
            {drafts.map((n) => (
              <Row key={n.type} tone="new" icon={needIcon(n)} refText={n.ref} title={n.title ?? `New ${n.label}`} right="draft" />
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">For this job</h4>
        <ul className="space-y-0.5">
          {task.runs.map((r) =>
            r.kind === "ptw" ? (
              <Row key={r.kind} tone="new" icon={<FileCheck className="size-3.5" />} refText={r.ref} title={r.why ?? "Permit to Work"} right="2 approvals" />
            ) : r.kind === "pm" ? (
              <Row key={r.kind} tone="new" icon={<Repeat className="size-3.5" />} refText={r.ref} title={r.why ?? "Preventive maintenance"} right={who.name} />
            ) : (
              <Row key={r.kind} tone="new" icon={<Wrench className="size-3.5" />} refText={r.ref} title={`${j.when} · ${who.name}`} right={`${j.checklist.length}-step checklist`} />
            ),
          )}
        </ul>
      </section>
    </div>
  );
}

/**
 * The approval step as a short receipt: what is on file, what the AI drafts, what this execution
 * creates, and one button. Nothing is created until it is pressed.
 */
export function Receipt({
  task,
  className,
  bare = false,
  onAnother,
  showHeader = true,
  enterToApprove = false,
}: {
  task: TaskStatus;
  className?: string;
  /** No border or shadow, for when it sits inside another card. */
  bare?: boolean;
  onAnother?: () => void;
  showHeader?: boolean;
  /** Enter anywhere on the page approves, for keyboard-first variations. */
  enterToApprove?: boolean;
}) {
  const approval = useApprove(task, { enterToApprove });
  const j = task.job;
  const a = getAsset(j.assetId);
  const who = person(j.assigneeId);

  return (
    <div className={cn("flex min-h-0 flex-col", !bare && "rounded-xl border border-gray-200 bg-white shadow-sm", className)}>
      {showHeader ? (
        <div className="flex items-start gap-2 border-b border-gray-100 px-4 py-3">
          <Dot level={task.level} className="mt-1.5" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">{j.title}</div>
            <div className="text-xs text-gray-500">
              {a?.code} · {j.when} · {who.name}
            </div>
          </div>
        </div>
      ) : null}

      {approval.phase === "done" ? (
        <Created task={task} approval={approval} onAnother={onAnother} className="px-4 py-4" />
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <ReceiptLines task={task} />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <span className="text-[11px] text-gray-500">
              {task.last ? `Created before as ${task.last.woRef}. ` : ""}Nothing is created until you approve
            </span>
            <ApproveButton task={task} approval={approval} />
          </div>
        </>
      )}
    </div>
  );
}
