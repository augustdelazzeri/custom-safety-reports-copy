"use client";

import { KIND_LABEL, PERMIT_LABEL, STATE_WORD, everyText, fmtDate, stateText, type DocState, type NeedState, type Permit, type RowStatus } from "@/lib/three-cases/real-jobs";
import { cn } from "@/lib/utils";
import { CalendarClock, CalendarX2, Check, Clock, FilePen, FilePlus, Hourglass, ShieldCheck } from "lucide-react";

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Every state that needs action stays yellow (red calls too much attention); the icon and the word tell them apart. */
export const STATE_UI: Record<DocState, { Icon: typeof Check; chip: string }> = {
  valid: { Icon: Check, chip: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  awaiting: { Icon: Clock, chip: "border-amber-200 bg-amber-50 text-amber-900" },
  draft: { Icon: FilePen, chip: "border-amber-200 bg-amber-50 text-amber-900" },
  expiring: { Icon: Hourglass, chip: "border-amber-200 bg-amber-50 text-amber-900" },
  expired: { Icon: CalendarX2, chip: "border-amber-300 bg-amber-100 text-amber-900" },
  missing: { Icon: FilePlus, chip: "border-dashed border-amber-300 bg-white text-amber-900" },
};

export function DocPill({ n }: { n: NeedState }) {
  const { Icon, chip } = STATE_UI[n.state];
  const optional = n.level === "recommended";
  return (
    <span
      title={`${KIND_LABEL[n.type]}${optional ? " (optional)" : ""}: ${stateText(n)}${n.doc ? ` · ${n.doc.ref}` : ""}`}
      className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[11px] font-medium", optional && n.state !== "valid" ? "border-dashed border-gray-300 bg-white text-gray-500" : chip)}
    >
      <Icon className="size-3" />
      {KIND_LABEL[n.type]}
      {n.state !== "valid" && !optional ? <span className="font-normal opacity-80">· {STATE_WORD[n.state].toLowerCase()}</span> : null}
    </span>
  );
}

export function PermitPill({ type }: { type: Permit }) {
  return (
    <span title="The permit is issued when the work starts. It never holds the work order." className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-1.5 py-px text-[11px] font-medium text-sky-800">
      <ShieldCheck className="size-3" /> {PERMIT_LABEL[type]} at start
    </span>
  );
}

/** The PM and work orders of a job on an asset, apart from the documents: whether a PM exists, when the last work order was done and when the next one comes. */
export function PmCell({ r }: { r: RowStatus }) {
  const { pm, next } = r;
  return (
    <div className="min-w-0 space-y-0.5">
      {pm ? (
        <span title="A preventive maintenance already creates this work order" className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-1.5 py-px text-[11px] font-medium text-sky-800">
          <CalendarClock className="size-3" /> PM · {everyText(pm.every).toLowerCase()}
        </span>
      ) : (
        <span title="No preventive maintenance for this job on this asset" className="inline-flex items-center gap-1 rounded-full border border-dashed border-amber-300 bg-white px-1.5 py-px text-[11px] font-medium text-amber-900">
          <CalendarClock className="size-3" /> No PM
        </span>
      )}
      {pm?.last || next ? (
        <div className="text-[11px] text-gray-500">
          {pm?.last ? `Last ${fmtDate(pm.last)}` : ""}
          {pm?.last && next ? " · " : ""}
          {next ? `Next ${fmtDate(next.date)}${next.ref ? ` (${next.ref})` : ""}` : ""}
        </div>
      ) : null}
    </div>
  );
}

/** Ready, or Needs action (with how many): the state of the documents. */
export function ReadyTag({ r }: { r: RowStatus }) {
  return r.ready ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[11px] font-semibold text-emerald-800">
      <Check className="size-3" /> Ready
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-px text-[11px] font-semibold text-amber-900">
      <FilePlus className="size-3" /> Needs action{r.action.length > 1 ? ` · ${r.action.length}` : ""}
    </span>
  );
}

/** How many of a job's assets have their documents and how many need action: two numbers and a thin bar, on one line each. */
export function CountBar({ rows }: { rows: RowStatus[] }) {
  if (!rows.length) return null;
  const ready = rows.filter((r) => r.ready).length;
  const wait = rows.length - ready;
  return (
    <>
      <span className="ml-auto flex shrink-0 items-center gap-2 text-[11px] font-medium tabular-nums" title={`${ready} ready, ${wait} ${wait === 1 ? "needs" : "need"} action`}>
        <span className="inline-flex items-center gap-1 text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {ready}
        </span>
        <span className="inline-flex items-center gap-1 text-amber-800">
          <span className="size-1.5 rounded-full bg-amber-400" />
          {wait}
        </span>
      </span>
      <span className="mt-0.5 flex h-[3px] basis-full overflow-hidden rounded-full bg-gray-100">
        <span className="bg-emerald-500" style={{ width: `${(ready / rows.length) * 100}%` }} />
        <span className="bg-amber-400" style={{ width: `${(wait / rows.length) * 100}%` }} />
      </span>
    </>
  );
}
