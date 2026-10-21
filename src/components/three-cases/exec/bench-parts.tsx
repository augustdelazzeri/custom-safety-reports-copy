"use client";

import { KIND_LABEL, KIND_SHORT, STATE_WORD, everyText, fmtDate, stateText, type DocState, type NeedState, type RowStatus } from "@/lib/three-cases/real-jobs";
import { cn } from "@/lib/utils";
import { createContext, useContext } from "react";
import { CalendarClock, CalendarX2, Check, ClipboardList, Clock, FilePen, FilePlus, Hourglass, Loader2 } from "lucide-react";

/** Variations of the list: show the document ID as a link, use gray instead of yellow for what needs action, and (status) color each document by its status with no words and a legend. */
export interface Look {
  links: boolean;
  calm: boolean;
  status: boolean;
  hue: "green" | "blue";
}
export const LookContext = createContext<Look>({ links: false, calm: false, status: false, hue: "green" });
export const useLook = () => useContext(LookContext);
/** The class for text, dots and borders that mean "needs action". */
export const warnText = (calm: boolean) => (calm ? "text-gray-600" : "text-amber-900");

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

const CALM_CHIP = "border-gray-300 bg-gray-100 text-gray-700";

/** The five statuses a person sees. The EHS has draft, review and approved, plus a review date that is due soon or overdue; "expiring" and "expired" read the same here (the review is due), so they share one color. */
export type StatusKey = "approved" | "approval" | "draft" | "due" | "missing";
export const STATUS_KEY: Record<DocState, StatusKey> = { valid: "approved", awaiting: "approval", draft: "draft", expiring: "due", expired: "due", missing: "missing" };
export const STATUS_WORD: Record<StatusKey, string> = { approved: "Approved", approval: "In approval", draft: "Draft", due: "Review due", missing: "Missing" };
export const STATUS_HINT: Record<StatusKey, string> = {
  approved: "Approved and in date",
  approval: "Sent for approval, waiting for the approvers",
  draft: "A draft that still has to be finished and sent",
  due: "Approved, but its review date is close or already past (expiring or expired)",
  missing: "The asset has no document of this type",
};
export function statusUi(key: StatusKey, hue: "green" | "blue"): { Icon: typeof Check; chip: string } {
  switch (key) {
    case "approved":
      return { Icon: Check, chip: hue === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-200 bg-blue-50 text-blue-800" };
    case "approval":
      return { Icon: Clock, chip: hue === "green" ? "border-sky-200 bg-sky-50 text-sky-800" : "border-violet-200 bg-violet-50 text-violet-800" };
    case "draft":
      return { Icon: FilePen, chip: "border-gray-300 bg-gray-100 text-gray-700" };
    case "due":
      return { Icon: Hourglass, chip: "border-amber-200 bg-amber-50 text-amber-900" };
    case "missing":
      return { Icon: FilePlus, chip: "border-dashed border-gray-400 bg-white text-gray-600" };
  }
}
/** The colors of "ready": green or blue. */
export const okText = (hue: "green" | "blue") => (hue === "green" ? "text-emerald-700" : "text-blue-700");
export const okDot = (hue: "green" | "blue") => (hue === "green" ? "bg-emerald-500" : "bg-blue-500");

/** One line that says what each color means. Sits in the footer of the list. */
export function StatusLegend() {
  const { hue } = useLook();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="Document status legend">
      {(Object.keys(STATUS_WORD) as StatusKey[]).map((k) => {
        const { Icon, chip } = statusUi(k, hue);
        return (
          <span key={k} title={STATUS_HINT[k]} className="inline-flex items-center gap-1 text-[11px] text-gray-600">
            <span className={cn("inline-flex size-4 items-center justify-center rounded-full border", chip)}>
              <Icon className="size-2.5" />
            </span>
            {STATUS_WORD[k]}
          </span>
        );
      })}
    </div>
  );
}

export function DocPill({ n, creating }: { n: NeedState; creating?: boolean }) {
  const { links, calm, status, hue } = useLook();
  const { Icon, chip: base } = status ? statusUi(STATUS_KEY[n.state], hue) : STATE_UI[n.state];
  const chip = !status && calm && n.state !== "valid" ? (n.state === "missing" ? "border-dashed border-gray-400 bg-white text-gray-700" : CALM_CHIP) : base;
  const optional = n.level === "recommended";
  if (creating) {
    return (
      <span title={`Creating the ${KIND_LABEL[n.type]} draft`} className="inline-flex items-center gap-1 rounded-full border border-dashed border-indigo-300 bg-indigo-50 px-1.5 py-px text-[11px] font-medium text-indigo-800">
        <Loader2 className="size-3 animate-spin" />
        {KIND_SHORT[n.type]}
        <span className="font-normal opacity-80">· creating draft…</span>
      </span>
    );
  }
  return (
    <span
      title={`${KIND_LABEL[n.type]}${optional ? " (optional)" : ""}: ${status ? `${STATUS_WORD[STATUS_KEY[n.state]]}. ` : ""}${stateText(n)}${n.doc ? ` · ${n.doc.ref}` : ""}`}
      className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[11px] font-medium", !status && optional && n.state !== "valid" ? "border-dashed border-gray-300 bg-white text-gray-500" : chip)}
    >
      <Icon className="size-3" />
      {links && n.doc ? (
        <a href="#" onClick={(e) => e.preventDefault()} title={`Opens ${n.doc.ref} inside Safety, to view or edit (not part of this prototype)`} className="underline-offset-2 hover:underline">
          {n.doc.ref}
        </a>
      ) : (
        KIND_SHORT[n.type]
      )}
      {!status && n.state !== "valid" && !optional ? <span className="font-normal opacity-80">· {STATE_WORD[n.state].toLowerCase()}</span> : null}
    </span>
  );
}

/** A document, PM or work order number: a link that would open it inside Safety when links are on. */
function Ref({ id, what }: { id: string; what: string }) {
  const { links } = useLook();
  return links ? (
    <a href="#" onClick={(e) => e.preventDefault()} title={`Opens ${id} inside Safety, to view or edit (not part of this prototype)`} className="font-medium underline-offset-2 hover:underline">
      {id}
    </a>
  ) : (
    <span title={what}>{id}</span>
  );
}

/** The PM and the work orders of a job on an asset, each in its own badge: the PM and its rhythm, then the last work order and the next one. */
export function PmCell({ r }: { r: RowStatus }) {
  const { pm, next } = r;
  const { calm, status, links } = useLook();
  const badge = status ? "border-slate-300 bg-white text-slate-700" : "border-sky-200 bg-sky-50 text-sky-800";
  return (
    <div className="min-w-0 space-y-1">
      {pm ? (
        <span title="A preventive maintenance already creates this work order" className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[11px] font-medium", badge)}>
          <CalendarClock className="size-3" /> {links ? <Ref id={pm.ref} what="PM" /> : "PM"} · {everyText(pm.every).toLowerCase()}
        </span>
      ) : (
        <span title="No preventive maintenance for this job on this asset" className={cn("inline-flex items-center gap-1 rounded-full border border-dashed bg-white px-1.5 py-px text-[11px] font-medium", calm ? "border-gray-400 text-gray-700" : "border-amber-300 text-amber-900")}>
          <CalendarClock className="size-3" /> No PM
        </span>
      )}
      {pm?.last || next ? (
        <span className={cn("flex w-fit items-start gap-1 rounded-lg border px-1.5 py-0.5 text-[11px]", badge)}>
          <ClipboardList className="mt-px size-3 shrink-0" />
          <span className="leading-4">
            {pm?.last ? (
              <span className="block">
                <span className="opacity-70">Last</span> {links && pm.lastRef ? <Ref id={pm.lastRef} what="Work order" /> : "WO"} · {fmtDate(pm.last)}
              </span>
            ) : null}
            {next ? (
              <span className="block">
                <span className="opacity-70">Next</span> {links && next.ref ? <Ref id={next.ref} what="Work order" /> : "WO"} · {fmtDate(next.date)}
              </span>
            ) : null}
          </span>
        </span>
      ) : null}
    </div>
  );
}

/** Ready, or Needs action (with how many): the state of the documents. */
export function ReadyTag({ r }: { r: RowStatus }) {
  const { calm, hue } = useLook();
  return r.ready ? (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-px text-[11px] font-semibold", hue === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-200 bg-blue-50 text-blue-800")}>
      <Check className="size-3" /> Ready
    </span>
  ) : (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-px text-[11px] font-semibold", calm ? "border-gray-300 bg-gray-100 text-gray-700" : "border-amber-200 bg-amber-50 text-amber-900")}>
      <FilePlus className="size-3" /> Needs action{r.action.length > 1 ? ` · ${r.action.length}` : ""}
    </span>
  );
}

/** How many of a job's assets have their documents and how many need action: two numbers and a thin bar, on one line each. */
export function CountBar({ rows }: { rows: RowStatus[] }) {
  const { calm, hue } = useLook();
  if (!rows.length) return null;
  const ready = rows.filter((r) => r.ready).length;
  const wait = rows.length - ready;
  return (
    <>
      <span className="ml-auto flex shrink-0 items-center gap-2 text-[11px] font-medium tabular-nums" title={`${ready} ready, ${wait} ${wait === 1 ? "needs" : "need"} action`}>
        <span className={cn("inline-flex items-center gap-1", okText(hue))}>
          <span className={cn("size-1.5 rounded-full", okDot(hue))} />
          {ready}
        </span>
        <span className={cn("inline-flex items-center gap-1", calm ? "text-gray-600" : "text-amber-800")}>
          <span className={cn("size-1.5 rounded-full", calm ? "bg-gray-400" : "bg-amber-400")} />
          {wait}
        </span>
      </span>
      <span className="mt-0.5 flex h-[3px] basis-full overflow-hidden rounded-full bg-gray-100">
        <span className={okDot(hue)} style={{ width: `${(ready / rows.length) * 100}%` }} />
        <span className={calm ? "bg-gray-300" : "bg-amber-400"} style={{ width: `${(wait / rows.length) * 100}%` }} />
      </span>
    </>
  );
}
