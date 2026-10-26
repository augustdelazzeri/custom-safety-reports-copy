// A1 · the lists that feed use case 3 (events, CAPAs, safety work orders, documents), each one as a
// short queue: open only by default, the one due first on top. Built from the same data as option A
// (the events and their flows), the documents of use case 2 and the work orders made in F2.

import type { EventFlowState, FlowWo } from "@/contexts/ThreeCasesContext";
import { EVENTS, TODAY, person } from "./data";
import { DOCS, getMvpAsset, type MvpWo } from "./mvp-rules";
import type { SafetyEventDemo } from "./types";

export type SourceKind = "event" | "capa" | "wo" | "doc";
export type Tone = "neutral" | "accent" | "warning" | "error" | "success";

export interface SourceItem {
  id: string;
  kind: SourceKind;
  ref: string;
  title: string;
  /** Still needs someone: not closed, not complete, not an approved document in date. */
  open: boolean;
  status: { label: string; tone: Tone };
  /** Days from today; below zero is late. Undefined: no date. */
  dueIn?: number;
  /** What the date is for: "Decide", "Due", "Approve", "Review". */
  dueWord: string;
  /** Grey words after the badges: type, location, who. */
  meta: string[];
  /** A severity worth a badge (High, Critical). */
  risk?: string;
  /** The event whose flow the right side shows. */
  eventId?: string;
  /** A work order made in F2 or a document: shown on the right on their own. */
  wo?: MvpWo;
  docRef?: string;
}

const DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Oct 23", "In 7 days", "Today", "Now": days from the demo's today (Oct 16, as in the rest of use case 3). */
export function daysFromDemoToday(label: string | undefined): number | undefined {
  if (!label) return undefined;
  const s = label.trim();
  if (/^(today|now)/i.test(s)) return 0;
  if (/^tomorrow/i.test(s)) return 1;
  if (/^yesterday/i.test(s)) return -1;
  const inDays = s.match(/^in (\d+) days?/i);
  if (inDays) return Number(inDays[1]);
  const md = s.match(/^([A-Z][a-z]{2}) (\d{1,2})/);
  if (md) {
    const m = MONTHS.indexOf(md[1]);
    if (m >= 0) return Math.round((new Date(TODAY.getFullYear(), m, Number(md[2])).getTime() - TODAY.getTime()) / DAY);
  }
  return undefined;
}

/** Days from the real today to an ISO date (the work orders made in F2 use real dates). */
const daysFromNow = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / DAY);
};

/** How long Safety would give a new report before someone decides on it, by severity. A prototype rule: events have no due date in Safety today. */
const DECIDE_IN: Record<SafetyEventDemo["severity"], number> = { Critical: 0, High: 1, Medium: 3, Low: 7 };

const RECORD_STATUS: Record<EventFlowState["status"], { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "accent" },
  in_review: { label: "In review", tone: "warning" },
  closed: { label: "Closed", tone: "neutral" },
};
const WO_STATUS: Record<FlowWo["status"], { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "accent" },
  in_progress: { label: "In progress", tone: "accent" },
  complete: { label: "Complete", tone: "neutral" },
};

function events(flows: Record<string, EventFlowState>): SourceItem[] {
  return EVENTS.map((e) => {
    const flow = flows[e.id];
    const status = flow?.status ?? "open";
    const reported = daysFromDemoToday(e.reportedAt) ?? 0;
    const decided = Boolean(flow?.decided);
    const day = e.reportedAt.split(",")[0];
    return {
      id: `event-${e.id}`,
      kind: "event",
      ref: e.ref,
      title: e.title,
      open: status !== "closed",
      status: RECORD_STATUS[status],
      dueIn: decided ? daysFromDemoToday(e.capaDefaults?.due) : reported + DECIDE_IN[e.severity],
      dueWord: decided ? (flow?.capaRef ? `${flow.capaRef} due` : "CAPA due") : "Decide",
      meta: [e.type, `Reported ${day === "Today" || day === "Yesterday" ? day.toLowerCase() : day}`],
      risk: e.severity === "High" || e.severity === "Critical" ? e.severity : undefined,
      eventId: e.id,
    };
  });
}

/** CAPAs that are not part of an event of use case 3, so the list is not only the demo's own. */
const OTHER_CAPAS: { ref: string; title: string; owner: string; due: string; status: EventFlowState["status"] }[] = [
  { ref: "CAPA-0039", title: "Guard missing on band saw", owner: "dan", due: "Oct 14", status: "open" },
  { ref: "CAPA-0036", title: "Worn sling on overhead crane OC-1", owner: "aisha", due: "Oct 19", status: "in_review" },
  { ref: "CAPA-0031", title: "Eyewash station blocked in Packaging", owner: "jo", due: "Oct 6", status: "closed" },
];

function capas(flows: Record<string, EventFlowState>): SourceItem[] {
  const fromFlows = EVENTS.flatMap((e): SourceItem[] => {
    const flow = flows[e.id];
    if (!flow?.capaRef) return [];
    const status = flow.capaStatus ?? "open";
    const owner = e.capaDefaults ? person(e.capaDefaults.ownerId).name : undefined;
    return [
      {
        id: `capa-${flow.capaRef}`,
        kind: "capa",
        ref: flow.capaRef,
        title: e.title,
        open: status !== "closed",
        status: RECORD_STATUS[status],
        dueIn: daysFromDemoToday(e.capaDefaults?.due),
        dueWord: "Due",
        meta: [`From ${e.ref}`, ...(owner ? [owner] : [])],
        risk: e.capaDefaults?.priority === "High" ? "High" : undefined,
        eventId: e.id,
      },
    ];
  });
  const others = OTHER_CAPAS.map(
    (c): SourceItem => ({
      id: `capa-${c.ref}`,
      kind: "capa",
      ref: c.ref,
      title: c.title,
      open: c.status !== "closed",
      status: RECORD_STATUS[c.status],
      dueIn: daysFromDemoToday(c.due),
      dueWord: "Due",
      meta: ["Corrective", person(c.owner).name],
    }),
  );
  return [...fromFlows, ...others];
}

function workOrders(flows: Record<string, EventFlowState>, made: MvpWo[]): SourceItem[] {
  const fromFlows = EVENTS.flatMap((e) =>
    (flows[e.id]?.wos ?? []).map(
      (w): SourceItem => ({
        id: `wo-${w.ref}`,
        kind: "wo",
        ref: w.ref,
        title: w.title,
        open: w.status !== "complete",
        status: WO_STATUS[w.status],
        dueIn: w.status === "complete" ? daysFromDemoToday(w.doneAt) : daysFromDemoToday(w.due),
        dueWord: w.status === "complete" ? "Done" : "Due",
        meta: [person(w.assigneeId).name, `From ${flows[e.id]?.capaRef ?? e.ref}`],
        eventId: e.id,
      }),
    ),
  );
  const fromF2 = made.map(
    (w): SourceItem => ({
      id: `wo-${w.ref}`,
      kind: "wo",
      ref: w.ref,
      title: w.title,
      open: w.status === "open",
      status: w.status === "open" ? WO_STATUS.open : WO_STATUS.complete,
      dueIn: daysFromNow(w.status === "done" ? (w.doneOn ?? w.due) : w.due),
      dueWord: w.status === "done" ? "Done" : "Due",
      meta: [person(w.assigneeId).name, getMvpAsset(w.assetId)?.name ?? "", "Made in F2"].filter(Boolean),
      wo: w,
    }),
  );
  return [...fromFlows, ...fromF2];
}

const DOC_STATUS = {
  valid: { label: "Approved", tone: "success" },
  awaiting: { label: "In approval", tone: "accent" },
  draft: { label: "Draft", tone: "neutral" },
  expiring: { label: "Review due", tone: "warning" },
  expired: { label: "Review overdue", tone: "error" },
  missing: { label: "Missing", tone: "neutral" },
} as const satisfies Record<string, { label: string; tone: Tone }>;

const refSeed = (ref: string) => ref.split("").reduce((n, c) => n + c.charCodeAt(0), 0);

function documents(): SourceItem[] {
  return DOCS.map((d): SourceItem => {
    const asset = d.assetIds.length ? getMvpAsset(d.assetIds[0]) : undefined;
    // An approval is expected within a week of the request.
    const dueIn = d.state === "expired" ? -(d.days ?? 1) : d.state === "expiring" ? (d.days ?? 7) : d.state === "awaiting" ? 7 - (d.days ?? 0) : d.state === "valid" ? 40 + (refSeed(d.ref) % 280) : undefined;
    return {
      id: `doc-${d.ref}`,
      kind: "doc",
      ref: d.ref,
      title: d.title,
      open: d.state !== "valid",
      status: DOC_STATUS[d.state],
      dueIn,
      dueWord: d.state === "awaiting" ? "Approve" : d.state === "valid" ? "Next review" : "Review",
      meta: [asset ? asset.name : "Company program", ...(d.state === "awaiting" ? [`waiting ${d.days ?? 0} days`] : [])],
      docRef: d.ref,
    };
  });
}

/** Soonest first; no date goes last; closed and complete things after everything open. */
export const byDue = (a: SourceItem, b: SourceItem) => Number(b.open) - Number(a.open) || (a.dueIn ?? 9999) - (b.dueIn ?? 9999) || a.ref.localeCompare(b.ref);

export function buildSources(flows: Record<string, EventFlowState>, made: MvpWo[]): Record<SourceKind, SourceItem[]> {
  return {
    event: events(flows).sort(byDue),
    capa: capas(flows).sort(byDue),
    wo: workOrders(flows, made).sort(byDue),
    doc: documents().sort(byDue),
  };
}

/** "Overdue 2 days", "Due today", "Due in 5 days": the date as people say it. */
export function dueLabel(item: SourceItem): string {
  const n = item.dueIn;
  if (n === undefined) return item.kind === "doc" ? "No review date" : "No due date";
  if (item.dueWord === "Done") return n === 0 ? "Done today" : `Done ${Math.abs(n)} day${Math.abs(n) === 1 ? "" : "s"} ago`;
  // A closed record is not late, whatever its date said.
  if (!item.open && n < 0) return "Closed";
  if (n < 0) return `Overdue ${Math.abs(n)} day${n === -1 ? "" : "s"}`;
  if (n === 0) return `${item.dueWord} today`;
  if (n === 1) return `${item.dueWord} tomorrow`;
  return `${item.dueWord} in ${n} days`;
}
