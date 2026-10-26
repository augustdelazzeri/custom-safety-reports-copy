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
export const warnText = (calm: boolean) => (calm ? "text-muted-foreground" : "text-badge-warning-foreground");

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * The shape every document chip shares: Safety's soft badge (a 20px pill, tinted fill, same-hue
 * text, no outline). A missing document is the one outlined chip, dashed, because there is nothing
 * there yet.
 */
export const CHIP = "inline-flex h-5 items-center gap-1 rounded-full border px-2 text-xs font-medium whitespace-nowrap [&>svg]:size-3";

const SOFT = {
  neutral: "border-transparent bg-badge-neutral text-badge-neutral-foreground",
  accent: "border-transparent bg-badge-accent text-badge-accent-foreground",
  warning: "border-transparent bg-badge-warning text-badge-warning-foreground",
  success: "border-transparent bg-badge-success text-badge-success-foreground",
  missing: "border-dashed border-text-placeholder bg-transparent text-muted-foreground",
  missingWarn: "border-dashed border-[var(--amber-8)] bg-transparent text-badge-warning-foreground",
};

/** Every state that needs action stays amber (red calls too much attention); the icon and the word tell them apart. */
export const STATE_UI: Record<DocState, { Icon: typeof Check; chip: string }> = {
  valid: { Icon: Check, chip: SOFT.success },
  awaiting: { Icon: Clock, chip: SOFT.warning },
  draft: { Icon: FilePen, chip: SOFT.warning },
  expiring: { Icon: Hourglass, chip: SOFT.warning },
  expired: { Icon: CalendarX2, chip: SOFT.warning },
  missing: { Icon: FilePlus, chip: SOFT.missingWarn },
};

const CALM_CHIP = SOFT.neutral;

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
/** Safety's soft tones by status: approved green, in approval indigo (under way), draft grey, review due amber, missing dashed. */
export function statusUi(key: StatusKey, hue: "green" | "blue"): { Icon: typeof Check; chip: string } {
  switch (key) {
    case "approved":
      return { Icon: Check, chip: hue === "green" ? SOFT.success : SOFT.accent };
    case "approval":
      return { Icon: Clock, chip: hue === "green" ? SOFT.accent : SOFT.warning };
    case "draft":
      return { Icon: FilePen, chip: SOFT.neutral };
    case "due":
      return { Icon: Hourglass, chip: SOFT.warning };
    case "missing":
      return { Icon: FilePlus, chip: SOFT.missing };
  }
}
/** The colors of "ready": green or blue. */
export const okText = (hue: "green" | "blue") => (hue === "green" ? "text-badge-success-foreground" : "text-badge-accent-foreground");
export const okDot = (hue: "green" | "blue") => (hue === "green" ? "bg-[var(--green-9)]" : "bg-primary");

/** A small round mark in a status's colors, for legends and menus. */
export function StatusDot({ k, hue = "green", className }: { k: StatusKey; hue?: "green" | "blue"; className?: string }) {
  const { Icon, chip } = statusUi(k, hue);
  return (
    <span className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded-full border", chip, className)}>
      <Icon className="size-2.5" />
    </span>
  );
}

/** One line that says what each color means. Sits in the footer of the list. */
export function StatusLegend() {
  const { hue } = useLook();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="Document status legend">
      {(Object.keys(STATUS_WORD) as StatusKey[]).map((k) => (
        <span key={k} title={STATUS_HINT[k]} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <StatusDot k={k} hue={hue} />
          {STATUS_WORD[k]}
        </span>
      ))}
    </div>
  );
}

export function DocPill({ n, creating }: { n: NeedState; creating?: boolean }) {
  const { links, calm, status, hue } = useLook();
  const { Icon, chip: base } = status ? statusUi(STATUS_KEY[n.state], hue) : STATE_UI[n.state];
  const chip = !status && calm && n.state !== "valid" ? (n.state === "missing" ? SOFT.missing : CALM_CHIP) : base;
  const optional = n.level === "recommended";
  if (creating) {
    return (
      <span title={`Creating the ${KIND_LABEL[n.type]} draft`} className={cn(CHIP, "border-dashed border-primary bg-badge-accent text-badge-accent-foreground")}>
        <Loader2 className="animate-spin" />
        {KIND_SHORT[n.type]}
        <span className="font-normal opacity-80">· creating draft…</span>
      </span>
    );
  }
  return (
    <span
      title={`${KIND_LABEL[n.type]}${optional ? " (optional)" : ""}: ${status ? `${STATUS_WORD[STATUS_KEY[n.state]]}. ` : ""}${stateText(n)}${n.doc ? ` · ${n.doc.ref}` : ""}`}
      className={cn(CHIP, !status && optional && n.state !== "valid" ? SOFT.missing : chip)}
    >
      <Icon />
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
    <a href="#" onClick={(e) => e.preventDefault()} title={`Opens ${id} inside Safety, to view or edit (not part of this prototype)`} className="font-medium text-foreground underline-offset-2 hover:underline">
      {id}
    </a>
  ) : (
    <span title={what}>{id}</span>
  );
}

/** The PM and the work orders of a job on an asset: the PM and its rhythm as a badge, then the last work order and the next one as two quiet lines. */
export function PmCell({ r }: { r: RowStatus }) {
  const { pm, next } = r;
  const { calm, links } = useLook();
  return (
    <div className="min-w-0 space-y-1">
      {pm ? (
        <span title="A preventive maintenance already creates this work order" className={cn(CHIP, SOFT.neutral)}>
          <CalendarClock /> {links ? <Ref id={pm.ref} what="PM" /> : "PM"} · {everyText(pm.every).toLowerCase()}
        </span>
      ) : (
        <span title="No preventive maintenance for this job on this asset" className={cn(CHIP, calm ? SOFT.missing : SOFT.missingWarn)}>
          <CalendarClock /> No PM
        </span>
      )}
      {pm?.last || next ? (
        <span className="flex w-fit items-start gap-1.5 text-xs text-muted-foreground">
          <ClipboardList className="mt-0.5 size-3 shrink-0" />
          <span className="leading-4">
            {pm?.last ? (
              <span className="block whitespace-nowrap">
                Last {links && pm.lastRef ? <Ref id={pm.lastRef} what="Work order" /> : "WO"} · {fmtDate(pm.last)}
              </span>
            ) : null}
            {next ? (
              <span className="block whitespace-nowrap">
                Next {links && next.ref ? <Ref id={next.ref} what="Work order" /> : "WO"} · {fmtDate(next.date)}
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
    <span className={cn(CHIP, hue === "green" ? SOFT.success : SOFT.accent)}>
      <Check /> Ready
    </span>
  ) : (
    <span className={cn(CHIP, calm ? SOFT.neutral : SOFT.warning)}>
      <FilePlus /> Needs action{r.action.length > 1 ? ` · ${r.action.length}` : ""}
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
      <span className="ml-auto flex shrink-0 items-center gap-2 text-xs font-medium tabular-nums" title={`${ready} ready, ${wait} ${wait === 1 ? "needs" : "need"} action`}>
        <span className={cn("inline-flex items-center gap-1", okText(hue))}>
          <span className={cn("size-1.5 rounded-full", okDot(hue))} />
          {ready}
        </span>
        <span className={cn("inline-flex items-center gap-1", calm ? "text-muted-foreground" : "text-badge-warning-foreground")}>
          <span className={cn("size-1.5 rounded-full", calm ? "bg-text-placeholder" : "bg-[var(--amber-9)]")} />
          {wait}
        </span>
      </span>
      <span className="mt-1 flex h-[3px] basis-full overflow-hidden rounded-full bg-muted">
        <span className={okDot(hue)} style={{ width: `${(ready / rows.length) * 100}%` }} />
        <span className={calm ? "bg-text-placeholder" : "bg-[var(--amber-9)]"} style={{ width: `${(wait / rows.length) * 100}%` }} />
      </span>
    </>
  );
}
