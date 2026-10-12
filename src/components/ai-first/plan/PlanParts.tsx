"use client";

// Building blocks for P3: event summary, root cause with sources, CAPA cards with typed sub-tasks.

import React, { useState } from "react";
import { AlertTriangle, BookOpen, CalendarDays, FileText, Info, Pencil, Wrench } from "lucide-react";
import type { ControlLevel, PlanCapa, PlanTask, Report } from "@/lib/ai-first/types";
import { PEOPLE, ROOT_CAUSE } from "@/lib/ai-first/sample-data";
import { labelForType } from "@/contexts/AiFirstContext";
import type { PlanState } from "./usePlan";
import { AiBadge, PhotoWithPins } from "../AiPrimitives";
import { cn } from "@/lib/utils";

export const TASK_META: Record<PlanTask["kind"], { label: string; icon: React.ElementType; tone: string; where: string }> = {
  work_order: { label: "Work order", icon: Wrench, tone: "text-orange-700 bg-orange-50 border-orange-200", where: "UpKeep CMMS" },
  training: { label: "Training", icon: BookOpen, tone: "text-sky-700 bg-sky-50 border-sky-200", where: "UpKeep Learn" },
  document: { label: "Document", icon: FileText, tone: "text-indigo-700 bg-indigo-50 border-indigo-200", where: "Safety · SOP" },
  calendar: { label: "Calendar", icon: CalendarDays, tone: "text-teal-700 bg-teal-50 border-teal-200", where: "Compliance calendar" },
};

const LADDER: ControlLevel[] = ["elimination", "substitution", "engineering", "administrative", "ppe"];

export function ControlChip({ level }: { level: ControlLevel }) {
  const strong = level === "elimination" || level === "substitution" || level === "engineering";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize",
        strong ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
      )}
      title="Hierarchy of controls"
    >
      <span className="flex gap-0.5">
        {LADDER.map((l) => (
          <i key={l} className={cn("h-2 w-1.5 rounded-sm", LADDER.indexOf(l) <= LADDER.indexOf(level) ? (strong ? "bg-emerald-500" : "bg-amber-500") : "bg-gray-200")} />
        ))}
      </span>
      {level === "ppe" ? "PPE" : level}
    </span>
  );
}

export function EventSummary({ report, compact }: { report: Report; compact?: boolean }) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white", compact ? "p-3" : "p-4")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-700">{report.id}</span>
        <span className="text-xs text-gray-500">
          {labelForType(report.type)} · Severity {report.severity} · {report.location}
        </span>
      </div>
      <p className="mt-1 font-semibold text-gray-900">{report.title}</p>
      {!compact && (
        <div className="mt-3 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
          <PhotoWithPins src={report.photo} pins={report.pins} />
          <p className="text-sm text-gray-700">{report.description}</p>
        </div>
      )}
    </div>
  );
}

export function RootCauseCard({ state }: { state: PlanState }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.rootCause);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-900">Likely root cause</h3>
        {state.rootCauseEdited ? (
          <span className="text-[11px] font-semibold text-blue-700">Edited by you</span>
        ) : (
          <AiBadge>AI draft · review it</AiBadge>
        )}
        {!editing && (
          <button onClick={() => { setDraft(state.rootCause); setEditing(true); }} className="ml-auto inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} className="w-full rounded-md border border-gray-300 p-2 text-sm" />
          <div className="flex gap-2">
            <button onClick={() => { state.setRootCause(draft); setEditing(false); }} className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="rounded-md px-3 py-1 text-xs text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-800">{state.rootCause}</p>
      )}
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Based on</p>
        <ul className="space-y-1">
          {ROOT_CAUSE.sources.map((s) => (
            <li key={s.label} className="flex items-start gap-2 text-xs text-gray-600">
              <Info className="mt-0.5 w-3 h-3 shrink-0 text-violet-500" />
              <span>
                <span className="font-medium text-gray-700">{s.kind}:</span>{" "}
                {s.kind === "This event" ? `${state.report.id} · photo pins 1–3 and the reporter's answers` : s.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const OWNERS = [PEOPLE.maintenance, PEOPLE.supervisor, PEOPLE.ehs];

export function TaskRow({ task, onChange, compact, editable = true }: { task: PlanTask; onChange: (p: Partial<PlanTask>) => void; compact?: boolean; editable?: boolean }) {
  const m = TASK_META[task.kind];
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-3", task.selected ? "border-gray-200 bg-white" : "border-dashed border-gray-200 bg-gray-50 opacity-70")}>
      <input
        type="checkbox"
        checked={task.selected}
        onChange={(e) => onChange({ selected: e.target.checked })}
        className="mt-1 h-4 w-4 accent-violet-600"
        aria-label={`Include ${task.title}`}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", m.tone)}>
            <m.icon className="w-3 h-3" /> {m.label}
          </span>
          <span className="text-[11px] text-gray-400">{m.where}</span>
        </div>
        <p className="text-sm font-medium text-gray-900">{task.title}</p>
        {!compact && <p className="text-xs text-gray-500">{task.detail}</p>}
        {!compact && <p className="text-[11px] text-violet-600">Why: {task.source}</p>}
      </div>
      {editable ? (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <select value={task.owner} onChange={(e) => onChange({ owner: e.target.value })} className="max-w-[170px] rounded-md border border-gray-200 bg-white px-1.5 py-1 text-xs text-gray-700">
            {OWNERS.map((o) => (
              <option key={o} value={o}>
                {o.split(" (")[0]}
              </option>
            ))}
          </select>
          <input value={task.due} onChange={(e) => onChange({ due: e.target.value })} className="w-20 rounded-md border border-gray-200 px-1.5 py-1 text-right text-xs text-gray-700" aria-label="Due date" />
        </div>
      ) : (
        <div className="shrink-0 text-right text-xs text-gray-500">
          <p>{task.owner.split(" (")[0]}</p>
          <p>Due {task.due}</p>
        </div>
      )}
    </div>
  );
}

export function CapaPlanCard({ capa, state, compact }: { capa: PlanCapa; state: PlanState; compact?: boolean }) {
  const onlyTraining = capa.tasks.filter((t) => t.selected).every((t) => t.kind === "training");
  return (
    <div className={cn("rounded-xl border bg-white", capa.selected ? "border-gray-200" : "border-dashed border-gray-300 opacity-60", compact ? "p-3" : "p-4")}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={capa.selected}
          onChange={(e) => state.updateCapa(capa.id, { selected: e.target.checked })}
          className="mt-1 h-4 w-4 accent-violet-600"
          aria-label={`Include CAPA ${capa.title}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">CAPA</span>
            <ControlChip level={capa.controlLevel} />
          </div>
          <p className="mt-0.5 font-semibold text-gray-900">{capa.title}</p>
          {!compact && <p className="text-xs text-gray-500">{capa.rationale}</p>}
        </div>
      </div>
      {capa.selected && (
        <div className="mt-3 space-y-2 md:pl-7">
          {capa.tasks.map((t) => (
            <TaskRow key={t.id} task={t} compact={compact} onChange={(p) => state.updateTask(capa.id, t.id, p)} />
          ))}
          {onlyTraining && capa.tasks.some((t) => t.selected) && (
            <p className="flex items-center gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" /> Training alone is the weakest control. Keep a fix to the source too.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function CreateBar({ state, onCreate }: { state: PlanState; onCreate: () => void }) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
        {state.onlyWeakControls && (
          <p className="flex items-center gap-1.5 text-xs text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5" /> This plan has only training and paperwork. Fixing the source works better.
          </p>
        )}
        <p className="text-sm text-gray-600">
          {state.counts.capas} CAPAs · {state.counts.tasks} tasks · {state.counts.workOrders} work orders
        </p>
        <button
          onClick={onCreate}
          disabled={state.counts.tasks === 0}
          className="ml-auto rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
        >
          Create plan ({state.counts.tasks} items)
        </button>
      </div>
    </div>
  );
}
