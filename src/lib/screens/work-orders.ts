// Safety work orders, the plain list (safety-redesign lab-work-orders.tsx): every work order that came
// from something in Safety, in one shape. Three sources already live in the prototype and are only read
// here: the work orders of the event flows (CAPA-0033 and any flow run in this browser), the ones made in
// F2 (job first, then the asset) and the executions of option F. MORE_WORK_ORDERS adds the rest of a
// plausible plant: same assets, people, CAPAs and documents as the other screens.
//
// Two calendars, as in A1 (sources.ts): F2 writes ISO dates relative to the real today, the event flows
// and option F write labels ("Oct 14", "In 2 days", "Tomorrow, 07:00") for the demo's today, Oct 16. So an
// ISO date counts from now and a label from Oct 16: a work order is late here exactly when it is late in A1,
// on the CAPA page and on the dashboard.

import type { EventFlowState, Execution } from "@/contexts/ThreeCasesContext";
import { EVENTS, TODAY, asset as caseAsset, job as getJob, locationName, person } from "@/lib/three-cases/data";
import { DOCS, MVP_LABEL, checklistsFor, docByRef, getMvpAsset, libraryChecklists, type MvpDoc, type MvpJob, type MvpKind, type MvpWo } from "@/lib/three-cases/mvp-rules";
import { dateIn } from "@/lib/three-cases/real-jobs";

export type WoStatus = "open" | "in_progress" | "on_hold" | "complete";
export type WoPriority = "none" | "low" | "medium" | "high";
/** What dispatched the work order: Safety's linked entity. */
export type WoSourceKind = "event" | "capa" | "document" | "job" | "calendar";
/** Where the record lives in the prototype. */
export type WoOrigin = "event-flow" | "f2" | "execution" | "plant";

export const WO_STATUS_LABEL: Record<WoStatus, string> = { open: "Open", in_progress: "In progress", on_hold: "On hold", complete: "Complete" };
export const WO_PRIORITY_LABEL: Record<WoPriority, string> = { none: "None", low: "Low", medium: "Medium", high: "High" };
export const WO_SOURCE_LABEL: Record<WoSourceKind, string> = { event: "Event", capa: "Corrective action", document: "Document", job: "Job", calendar: "Compliance calendar" };

// ───────────────────────────── the rest of the plant

/** A work order of the sample plant that none of the flows made. Asset ids are MVP_ASSETS first, then the assets of use case 3. */
export interface PlantWo {
  ref: string;
  title: string;
  assetId?: string;
  /** Shown when there is no asset. */
  location?: string;
  assigneeId?: string;
  priority: WoPriority;
  status: WoStatus;
  /** "Oct 14" (a day of 2026) or an ISO date (the open ones, so they stay ahead of today). */
  due: string;
  created: string;
  doneAt?: string;
  source: { kind: WoSourceKind; ref: string; title: string };
  docRefs: string[];
  checklist?: { name: string; items: string[] };
  description?: string;
  /** Why it is on hold. */
  holdReason?: string;
}

const INSPECT = ["Check guards and emergency stops", "Look for leaks, cracks and wear", "Check controls, gauges and lights", "Record each item as pass or fail"];
const LOTO_STEPS = ["Notify the people affected", "Shut down and isolate every energy source", "Apply the lock and tag", "Verify zero energy", "Remove the locks when done"];

/**
 * Exported so other screens (A1) can list them too. Refs avoid the ones already used elsewhere
 * (event flows, option F jobs, Nova), except WO-1044, WO-1045 and WO-1058, which Nova already talks about.
 */
export const MORE_WORK_ORDERS: PlantWo[] = [
  {
    ref: "WO-1041",
    title: "Repair parking brake, Forklift FL-04",
    assetId: "fl4",
    assigneeId: "tom",
    priority: "high",
    status: "on_hold",
    due: "Oct 9",
    created: "Oct 7",
    source: { kind: "document", ref: "AUD-0030", title: "Forklift pre-use inspection: parking brake failed" },
    docRefs: ["AUD-0030", "JHA-0022"],
    checklist: { name: "Repair and return to service", items: ["Tag the forklift out of service", "Replace the brake cable and adjust", "Test the brake on the ramp", "Sign the pre-use check before return"] },
    description: "Parking brake does not hold on the dock ramp. Found on the pre-use inspection.",
    holdReason: "Brake cable on order, expected Oct 28",
  },
  {
    ref: "WO-1044",
    title: "Fit a fixed blade guard, Belt saw 1",
    assetId: "bs1",
    assigneeId: "carlos",
    priority: "high",
    status: "complete",
    due: "Oct 13",
    created: "Oct 8",
    doneAt: "Oct 12",
    source: { kind: "capa", ref: "CAPA-0039", title: "Guard missing on band saw" },
    docRefs: ["SOP-0033"],
    checklist: { name: "Guard installation", items: ["Lock out the saw", "Fit the guard over the unused blade", "Check the guard clears the stock", "Test run and photo"] },
  },
  {
    ref: "WO-1045",
    title: "Adjust upper blade guard height, Belt saw 1",
    assetId: "bs1",
    assigneeId: "tom",
    priority: "medium",
    status: "complete",
    due: "Oct 14",
    created: "Oct 8",
    doneAt: "Oct 14",
    source: { kind: "capa", ref: "CAPA-0039", title: "Guard missing on band saw" },
    docRefs: ["SOP-0033"],
  },
  {
    ref: "WO-1046",
    title: "Replace worn sling, Overhead crane OC-1",
    assetId: "oc1",
    assigneeId: "tom",
    priority: "high",
    status: "complete",
    due: "Oct 17",
    created: "Oct 11",
    doneAt: "Oct 15",
    source: { kind: "capa", ref: "CAPA-0036", title: "Worn sling on overhead crane OC-1" },
    docRefs: ["AUD-0070", "LOTO-0060"],
    checklist: { name: "Sling replacement", items: ["Tag the old sling out of service", "Fit the new sling and check its tag", "Proof load test", "Record on the crane inspection"] },
  },
  {
    ref: "WO-1058",
    title: "Monthly inspection, Dock leveler 2",
    assetId: "dl2",
    priority: "medium",
    status: "open",
    due: "Oct 20",
    created: "Oct 13",
    source: { kind: "calendar", ref: "Monthly dock inspection", title: "Compliance calendar task, every month" },
    docRefs: [],
    checklist: { name: "Weekly walk-around", items: INSPECT },
  },
  {
    ref: "WO-1050",
    title: "Frequent inspection, Overhead crane OC-1",
    assetId: "oc1",
    assigneeId: "carlos",
    priority: "medium",
    status: "open",
    due: dateIn(4),
    created: "Oct 15",
    source: { kind: "document", ref: "AUD-0070", title: "Overhead crane frequent inspection" },
    docRefs: ["AUD-0070", "LOTO-0060"],
    checklist: { name: "Overhead crane frequent inspection", items: ["Check hooks and latches", "Check wire rope and slings", "Test limit switches and brakes", "Record each item as pass or fail"] },
  },
  {
    ref: "WO-1051",
    title: "Monthly inspection, Fire extinguisher FE-12",
    assetId: "fe12",
    assigneeId: "dan",
    priority: "low",
    status: "open",
    due: dateIn(5),
    created: "Oct 15",
    source: { kind: "document", ref: "AUD-0071", title: "Fire extinguisher monthly inspection" },
    docRefs: ["AUD-0071"],
    checklist: { name: "Fire extinguisher monthly inspection", items: ["Gauge in the green", "Pin and seal in place", "No damage to hose or body", "Initial and date the tag"] },
  },
  {
    ref: "WO-1059",
    title: "Thermography round, MCC-2",
    assetId: "mcc2",
    assigneeId: "dan",
    priority: "medium",
    status: "on_hold",
    due: dateIn(9),
    created: "Oct 14",
    source: { kind: "document", ref: "AUD-0066", title: "MCC-2 thermography round" },
    docRefs: ["AUD-0066", "PTW-0019", "LOTO-0031"],
    holdReason: "Waiting for AUD-0066 to be approved",
  },
  {
    ref: "WO-1049",
    title: "Annual internal inspection, Boiler 1",
    assetId: "blr1",
    assigneeId: "carlos",
    priority: "high",
    status: "open",
    due: dateIn(11),
    created: "Oct 12",
    source: { kind: "document", ref: "SOP-0020", title: "Boiler 1: annual inspection" },
    docRefs: ["SOP-0020", "LOTO-0020", "PTW-0012", "JHA-0016"],
    checklist: { name: "Boiler 1: annual inspection", items: ["Lock out burner, feedwater and blowdown", "Approve the confined space permit PTW-0012", "Ventilate and test the air", "Inspect tubes, shell and refractory", "Close up and log the result"] },
  },
  {
    ref: "WO-1035",
    title: "Annual LOTO periodic inspection, Mixing tank T-12",
    assetId: "t12",
    assigneeId: "dan",
    priority: "medium",
    status: "complete",
    due: "Oct 10",
    created: "Oct 1",
    doneAt: "Oct 8",
    source: { kind: "document", ref: "LOTO-0055", title: "LOTO: Mixing tank T-12" },
    docRefs: ["LOTO-0055"],
    checklist: { name: "LOTO: Mixing tank T-12", items: LOTO_STEPS },
  },
  {
    ref: "WO-1030",
    title: "Clear and relabel eyewash station, Packaging",
    location: "Packaging",
    assigneeId: "jo",
    priority: "medium",
    status: "complete",
    due: "Oct 6",
    created: "Oct 3",
    doneAt: "Oct 5",
    source: { kind: "capa", ref: "CAPA-0031", title: "Eyewash station blocked in Packaging" },
    docRefs: [],
  },
];

// ───────────────────────────── one shape for the list

export interface WoDocLink {
  ref: string;
  kind: string;
  title: string;
  /** Approved, In approval, Draft, Review due, Review overdue. */
  state?: { label: string; tone: "neutral" | "accent" | "warning" | "error" | "success" };
}

export interface SafetyWoRow {
  /** Unique across origins (the same job can run twice in option F). */
  id: string;
  ref: string;
  title: string;
  origin: WoOrigin;
  asset?: { name: string; code?: string };
  location: string;
  status: WoStatus;
  priority: WoPriority;
  assigneeId?: string;
  due?: string;
  /** Days from today; below zero is late. Undefined: no date. */
  dueIn?: number;
  doneAt?: string;
  created?: string;
  source: { kind: WoSourceKind; ref: string; title: string; href?: string; via?: string };
  docs: WoDocLink[];
  checklist?: { name: string; items: string[] };
  description?: string;
  holdReason?: string;
  /** The prototype's own page for this record, when it has one. */
  openHref?: string;
  openLabel?: string;
}

const DOC_STATE: Record<string, WoDocLink["state"]> = {
  valid: { label: "Approved", tone: "success" },
  approved: { label: "Approved", tone: "success" },
  awaiting: { label: "In approval", tone: "accent" },
  in_review: { label: "In approval", tone: "accent" },
  draft: { label: "Draft", tone: "neutral" },
  expiring: { label: "Review due", tone: "warning" },
  expired: { label: "Review overdue", tone: "error" },
};

const KIND_SHORT: Record<string, string> = { jha: "JHA", sop: "SOP", loto: "LOTO", ptw: "Permit", audit: "Audit", sds: "SDS" };

const mvpDocLink = (d: Pick<MvpDoc, "ref" | "type" | "title" | "state">): WoDocLink => ({ ref: d.ref, kind: MVP_LABEL[d.type as MvpKind] ?? KIND_SHORT[d.type], title: d.title, state: DOC_STATE[d.state] });

/** An asset of F2 (MVP_ASSETS) or of use case 3 (data.ts), by id. */
export function assetOf(id: string | undefined): { name: string; code?: string; location: string } | undefined {
  if (!id) return undefined;
  const m = getMvpAsset(id);
  if (m) return { name: m.name, code: m.code === "N/A" ? undefined : m.code, location: m.location };
  const a = caseAsset(id);
  return a ? { name: a.name, code: a.code, location: locationName(a.locationId) } : undefined;
}

// ───────────────────────────── dates

const DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const noonToday = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
};
const noonDemoToday = () => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 12);
const isIso = (s: string) => /^\d{4}-\d{2}-\d{2}/.test(s.trim());

/** "2026-10-30", "Oct 20", "Wed Oct 21, 09:00", "Tomorrow, 07:00", "In 2 days", "Today", "Now": the day it means. */
export function parseDay(label: string | undefined): Date | undefined {
  if (!label) return undefined;
  const s = label.trim().replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/, "");
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(`${s.slice(0, 10)}T12:00:00`);
  const from = (n: number) => {
    const d = noonDemoToday();
    d.setDate(d.getDate() + n);
    return d;
  };
  if (/^(today|now)/i.test(s)) return from(0);
  if (/^tomorrow/i.test(s)) return from(1);
  if (/^yesterday/i.test(s)) return from(-1);
  const inDays = s.match(/^in (\d+) days?/i);
  if (inDays) return from(Number(inDays[1]));
  const md = s.match(/^([A-Z][a-z]{2}) (\d{1,2})/);
  const m = md ? MONTHS.indexOf(md[1]) : -1;
  return md && m >= 0 ? new Date(2026, m, Number(md[2]), 12) : undefined;
}

/** Days from today to that day; below zero is late. An ISO date counts from now, a label from the demo's today. */
export const daysUntil = (label: string | undefined) => {
  const d = parseDay(label);
  return d && label ? Math.round((d.getTime() - (isIso(label) ? noonToday() : noonDemoToday()).getTime()) / DAY) : undefined;
};

/** "Oct 20"; a label that is not a day ("Every last Friday, 07:00") stays as written. */
export const dayLabel = (label: string | undefined) => {
  if (!label) return undefined;
  const d = parseDay(label);
  return d ? `${MONTHS[d.getMonth()]} ${d.getDate()}` : label;
};

/** The asset a work order of an event flow is about, by its title. Undefined: the event's own asset or, without one, its location. */
const FLOW_ASSET: Record<string, { id?: string; name?: string } | null> = {
  "Walkway paint and mirror, Dock door 2": null,
  "Install blue spot lights, FL-03 and FL-04": { name: "Forklifts FL-03 and FL-04" },
  "Stock a spill kit at the Press Line": null,
};

function fromFlows(flows: Record<string, EventFlowState>): SafetyWoRow[] {
  return EVENTS.flatMap((ev) => {
    const flow = flows[ev.id];
    if (!flow?.wos.length) return [];
    const priority = (ev.capaDefaults?.priority.toLowerCase() as WoPriority | undefined) ?? "medium";
    return flow.wos.map((w): SafetyWoRow => {
      const override = FLOW_ASSET[w.title];
      const known = override === undefined ? assetOf(ev.assetId) : override?.id ? assetOf(override.id) : undefined;
      const asset = known ?? (override?.name ? { name: override.name } : undefined);
      return {
        id: `flow-${ev.id}-${w.ref}`,
        ref: w.ref,
        title: w.title,
        origin: "event-flow",
        asset,
        location: known?.location ?? locationName(ev.locationId),
        status: w.status,
        priority,
        assigneeId: w.assigneeId,
        due: dayLabel(w.due),
        dueIn: daysUntil(w.due),
        doneAt: dayLabel(w.doneAt),
        created: dayLabel(flow.decidedAt),
        source: flow.capaRef
          ? { kind: "capa", ref: flow.capaRef, title: ev.title, via: ev.ref, href: `/events/${ev.id}` }
          : { kind: "event", ref: ev.ref, title: ev.title, href: `/events/${ev.id}` },
        docs: [],
        openHref: `/events/${ev.id}`,
        openLabel: `Open ${ev.ref}`,
      };
    });
  });
}

const checklistOfF2 = (w: MvpWo): SafetyWoRow["checklist"] => {
  const docs = w.docs.map((x) => docByRef(x.ref)).filter((x): x is MvpDoc => Boolean(x));
  const own = checklistsFor(w.jobId, docs);
  const all = [...own, ...libraryChecklists()];
  // What F2 saved; for its seeds, what F2 would have picked (the asset's audit or SOP).
  const picked = w.checklist ? all.find((o) => o.name === w.checklist) : own.find((o) => !o.id.startsWith("doc-LOTO"));
  return picked ? { name: picked.name, items: picked.items } : undefined;
};

function fromF2(made: MvpWo[], jobs: MvpJob[]): SafetyWoRow[] {
  return made.map((w): SafetyWoRow => {
    const a = assetOf(w.assetId);
    const job = jobs.find((j) => j.id === w.jobId);
    return {
      id: `f2-${w.id}`,
      ref: w.ref,
      title: w.title,
      origin: "f2",
      asset: a,
      location: a?.location ?? "",
      status: w.status === "done" ? "complete" : "open",
      priority: w.priority,
      assigneeId: w.assigneeId,
      due: dayLabel(w.due),
      dueIn: daysUntil(w.due),
      doneAt: dayLabel(w.doneOn),
      created: dayLabel(w.createdOn),
      source: { kind: "job", ref: job ? job.label.split(" / ")[0] : "Custom job", title: "Made from the job and the asset, with the documents the OSHA asks for", href: "/safety-execution/f2" },
      docs: w.docs.map(mvpDocLink),
      checklist: checklistOfF2(w),
      description: w.description || undefined,
    };
  });
}

function fromExecutions(executions: Execution[]): SafetyWoRow[] {
  return executions.flatMap((ex): SafetyWoRow[] => {
    const j = getJob(ex.jobId);
    if (!j) return [];
    const a = caseAsset(j.assetId);
    const docs = (a?.docs ?? []).filter((d) => j.basedOn.includes(d.id));
    const lead = docs.find((d) => d.type !== "sds") ?? docs[0];
    return [
      {
        id: `ex-${ex.id}`,
        ref: ex.woRef,
        title: j.title,
        origin: "execution",
        asset: a ? { name: a.name, code: a.code } : undefined,
        location: a ? locationName(a.locationId) : "",
        status: "open",
        priority: "medium",
        assigneeId: ex.assigneeId,
        due: dayLabel(j.when),
        dueIn: daysUntil(j.when),
        created: dayLabel(ex.createdAt),
        source: { kind: "document", ref: lead?.ref ?? "Job plan", title: j.reason },
        docs: docs.map((d) => ({ ref: d.ref, kind: KIND_SHORT[d.type] ?? d.type, title: d.title, state: DOC_STATE[d.status] })),
        checklist: ex.checklist.length ? { name: "From the job plan", items: ex.checklist } : undefined,
        openHref: `/safety-execution/work-orders/${ex.id}`,
        openLabel: "Open the work order",
      },
    ];
  });
}

function fromPlant(withDocs: boolean): SafetyWoRow[] {
  return MORE_WORK_ORDERS.map((w): SafetyWoRow => {
    const a = assetOf(w.assetId);
    const docs = withDocs ? w.docRefs.map((r) => DOCS.find((x) => x.ref === r)).filter((x): x is MvpDoc => Boolean(x)) : [];
    const sourceDoc = w.source.kind === "document" ? docByRef(w.source.ref) : undefined;
    return {
      id: `plant-${w.ref}`,
      ref: w.ref,
      title: w.title,
      origin: "plant",
      asset: a ? { name: a.name, code: a.code } : undefined,
      location: a?.location ?? w.location ?? "Springfield Plant",
      status: w.status,
      priority: w.priority,
      assigneeId: w.assigneeId,
      due: dayLabel(w.due),
      dueIn: daysUntil(w.due),
      doneAt: dayLabel(w.doneAt),
      created: dayLabel(w.created),
      source: {
        ...w.source,
        href: sourceDoc ? `/documentation?tab=${sourceDoc.type}` : w.source.kind === "calendar" ? "/compliance-calendar" : undefined,
      },
      docs: docs.map(mvpDocLink),
      checklist: w.checklist,
      description: w.description,
      holdReason: w.holdReason,
    };
  });
}

/** Open first, the one due first on top; complete ones after, the latest done first. */
export const byDue = (a: SafetyWoRow, b: SafetyWoRow) => {
  const done = Number(a.status === "complete") - Number(b.status === "complete");
  if (done) return done;
  const days = a.status === "complete" ? (b.dueIn ?? -9999) - (a.dueIn ?? -9999) : (a.dueIn ?? 9999) - (b.dueIn ?? 9999);
  return days || b.ref.localeCompare(a.ref);
};

/**
 * Every Safety work order the prototype knows. `plant: false` is the new account: only what was made in
 * this browser. `withDocs: false` is the account with no Safety documents yet.
 */
export function buildWorkOrders({
  flows,
  made,
  jobs,
  executions,
  plant = true,
  withDocs = true,
}: {
  flows: Record<string, EventFlowState>;
  made: MvpWo[];
  jobs: MvpJob[];
  executions: Execution[];
  plant?: boolean;
  withDocs?: boolean;
}): SafetyWoRow[] {
  const rows = [...(plant ? fromFlows(flows) : []), ...fromF2(made, jobs), ...(plant ? fromExecutions(executions) : []), ...(plant ? fromPlant(withDocs) : [])];
  return rows.sort(byDue);
}

export const isOverdue = (row: SafetyWoRow) => row.status !== "complete" && row.dueIn !== undefined && row.dueIn < 0;
export const isOpen = (row: SafetyWoRow) => row.status !== "complete";
export const assigneeName = (row: SafetyWoRow) => (row.assigneeId ? person(row.assigneeId).name : undefined);
