// Dashboard data: the plant's reporting history, scaled up around the demo's own records.
//
// The demo has a handful of real records (6 events in EVENTS, the CAPAs and work orders of their
// flows and of A1's lists, the 48 documents of use case 2). A dashboard over six events is not a
// dashboard, so this module adds the history a plant of this size would have: about 30 to 45 events a
// month since January 2025, seeded so every reload draws the same plant. The demo's six events sit
// inside that history on their own days and keep their live status from the flows, so running a
// flow, closing an event or approving a document moves the numbers here too.
//
// "Today" is the demo's today (Oct 16, 2026), the day EVENTS calls "Today" and A1 counts due dates from.

import type { EventFlowState, RecordStatus } from "@/contexts/ThreeCasesContext";
import { EVENTS, LOCATIONS, TODAY } from "@/lib/three-cases/data";
import type { MvpDoc, MvpKind } from "@/lib/three-cases/mvp-rules";
import type { SourceItem } from "@/lib/three-cases/sources";
import type { SafetyEventDemo } from "@/lib/three-cases/types";

type EventType = SafetyEventDemo["type"];
type Severity = SafetyEventDemo["severity"];

export interface DashEvent {
  /** The demo event this is, when it is one of the six. */
  eventId?: string;
  date: Date;
  type: EventType;
  severity: Severity;
  /** Undefined: reported without a location. */
  locationId?: string;
  status: RecordStatus;
  recordable: boolean;
}

// ───────────────────────────── periods

export type Period = "quarter" | "lastQuarter" | "year";
export const PERIODS: { value: Period; label: string; previous: string; grain: "day" | "week" | "month" }[] = [
  // This quarter is two weeks old on the demo's today, so it is drawn by day; a whole quarter by week.
  { value: "quarter", label: "This quarter", previous: "last quarter", grain: "day" },
  { value: "lastQuarter", label: "Last quarter", previous: "the quarter before", grain: "week" },
  { value: "year", label: "This year", previous: "last year", grain: "month" },
];
export const periodInfo = (p: Period) => PERIODS.find((x) => x.value === p) ?? PERIODS[0];

export interface Range {
  from: Date;
  to: Date;
}

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
/** Tomorrow at midnight: the end of what has happened so far. */
export const NOW_END = addDays(startOfDay(TODAY), 1);

/** A period as [from, to), cut at today, and the same stretch of the period before it. */
export function periodRange(p: Period): Range & { full: Range; previous: Range } {
  const qStart = new Date(TODAY.getFullYear(), Math.floor(TODAY.getMonth() / 3) * 3, 1);
  const months = p === "year" ? 12 : 3;
  const from = p === "year" ? new Date(TODAY.getFullYear(), 0, 1) : p === "quarter" ? qStart : addMonths(qStart, -3);
  const fullTo = addMonths(from, months);
  const to = fullTo.getTime() > NOW_END.getTime() ? NOW_END : fullTo;
  const prevFrom = addMonths(from, -months);
  // Compare like with like: the first 16 days of this quarter against the first 16 of the last one.
  const elapsed = Math.round((to.getTime() - from.getTime()) / DAY);
  const prevTo = to === fullTo ? from : addDays(prevFrom, elapsed);
  return { from, to, full: { from, to: fullTo }, previous: { from: prevFrom, to: prevTo } };
}

const within = (d: Date, r: Range) => d.getTime() >= r.from.getTime() && d.getTime() < r.to.getTime();

// ───────────────────────────── the history (seeded)

/** mulberry32: a small seeded generator, so the plant is the same on every load. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T extends string>(rnd: () => number, weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((n, [, w]) => n + w, 0);
  let r = rnd() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[entries.length - 1][0];
}

/** Events reported per month, Jan 2025 to Sep 2026. Reporting grew after the QR codes went up in spring. */
const MONTHLY: Record<string, number[]> = {
  2025: [26, 24, 29, 27, 31, 30, 33, 30, 32, 34, 29, 25],
  2026: [31, 28, 34, 33, 38, 36, 39, 37, 42],
};
/** October 2026 so far, day by day (Oct 1 is a Thursday). The demo's events are part of these counts. */
const OCTOBER = [2, 3, 1, 0, 2, 3, 2, 3, 2, 0, 1, 2, 2, 2, 3, 2];

const TYPE_WEIGHT: Record<EventType, number> = { Observation: 34, "Near miss": 24, Hazard: 23, Incident: 19 };
const SEVERITY_BY_TYPE: Record<EventType, Record<Severity, number>> = {
  Observation: { Low: 75, Medium: 22, High: 3, Critical: 0 },
  "Near miss": { Low: 30, Medium: 50, High: 17, Critical: 3 },
  Hazard: { Low: 40, Medium: 45, High: 13, Critical: 2 },
  Incident: { Low: 15, Medium: 50, High: 28, Critical: 7 },
};
const LOCATION_WEIGHT: Record<string, number> = { press: 26, warehouse: 24, dock: 18, pack2: 17, shop: 11, none: 4 };

/** How a report of a given age stands today: new ones are open, old ones closed. */
function statusFor(rnd: () => number, ageDays: number): RecordStatus {
  if (ageDays <= 3) return pick(rnd, { open: 65, in_review: 15, closed: 20 });
  if (ageDays <= 14) return pick(rnd, { open: 15, in_review: 25, closed: 60 });
  if (ageDays <= 45) return pick(rnd, { open: 2, in_review: 6, closed: 92 });
  return pick(rnd, { open: 0, in_review: 0.5, closed: 99.5 });
}

/** The day each demo event was reported, from its "Today, 09:12" / "Oct 2, 14:10" label. */
function demoDay(e: SafetyEventDemo): Date {
  const head = e.reportedAt.split(",")[0].trim();
  if (/^today/i.test(head)) return startOfDay(TODAY);
  if (/^yesterday/i.test(head)) return addDays(startOfDay(TODAY), -1);
  const parsed = new Date(`${head}, ${TODAY.getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? startOfDay(TODAY) : startOfDay(parsed);
}

interface Generated extends Omit<DashEvent, "status"> {
  ageDays: number;
  statusRoll: RecordStatus;
}

/** Picked among a few so that this quarter reads like the demo: most reports at the Press Line, observations first. */
const SEED = 20261020;

/** Exported for checking the numbers only. */
export function generateHistory(seed = SEED): Generated[] {
  const rnd = seeded(seed);
  const today = startOfDay(TODAY);
  const out: Generated[] = [];
  const add = (date: Date) => {
    const type = pick(rnd, TYPE_WEIGHT);
    const severity = pick(rnd, SEVERITY_BY_TYPE[type]);
    const loc = pick(rnd, LOCATION_WEIGHT);
    const ageDays = Math.round((today.getTime() - date.getTime()) / DAY);
    // About one serious incident in six needs more than first aid.
    const recordable = type === "Incident" && (severity === "High" || severity === "Critical") && rnd() < 0.07;
    out.push({ date, type, severity, locationId: loc === "none" ? undefined : loc, recordable, ageDays, statusRoll: statusFor(rnd, ageDays) });
  };
  // Whole months: each report lands on a weekday most of the time.
  for (const [year, counts] of Object.entries(MONTHLY)) {
    counts.forEach((count, m) => {
      const days = new Date(Number(year), m + 1, 0).getDate();
      const weights: Record<string, number> = {};
      for (let d = 1; d <= days; d++) {
        const dow = new Date(Number(year), m, d).getDay();
        weights[String(d)] = dow === 0 ? 0.15 : dow === 6 ? 0.35 : 1;
      }
      for (let i = 0; i < count; i++) add(new Date(Number(year), m, Number(pick(rnd, weights))));
    });
  }
  // October: the demo's events take their own days' places.
  const demoPerDay = new Map<number, number>();
  for (const e of EVENTS) {
    const key = demoDay(e).getTime();
    demoPerDay.set(key, (demoPerDay.get(key) ?? 0) + 1);
  }
  OCTOBER.forEach((count, i) => {
    const date = new Date(TODAY.getFullYear(), 9, i + 1);
    const left = Math.max(0, count - (demoPerDay.get(date.getTime()) ?? 0));
    for (let n = 0; n < left; n++) add(date);
  });
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

const HISTORY = generateHistory();

/** Every event, the demo's six with their live status from the flows. */
export function allEvents(flows: Record<string, EventFlowState>): DashEvent[] {
  const demo: DashEvent[] = EVENTS.map((e) => ({
    eventId: e.id,
    date: demoDay(e),
    type: e.type,
    severity: e.severity,
    locationId: e.locationId,
    status: flows[e.id]?.status ?? "open",
    recordable: e.oshaRecordable,
  }));
  const history: DashEvent[] = HISTORY.map((g) => ({ date: g.date, type: g.type, severity: g.severity, locationId: g.locationId, recordable: g.recordable, status: g.statusRoll }));
  return [...history, ...demo];
}

// ───────────────────────────── counting

export interface Slice {
  key: string;
  label: string;
  value: number;
}

const TYPE_ORDER: EventType[] = ["Observation", "Near miss", "Hazard", "Incident"];
export const SEVERITY_ORDER: Severity[] = ["Low", "Medium", "High", "Critical"];
export const STATUS_LABEL: Record<RecordStatus, string> = { open: "Open", in_review: "In review", closed: "Closed" };
const byValue = (a: Slice, b: Slice) => b.value - a.value || a.label.localeCompare(b.label);

export function eventStats(events: DashEvent[], range: Range) {
  const list = events.filter((e) => within(e.date, range));
  const count = <K extends string>(keys: readonly K[], of: (e: DashEvent) => K | undefined, label: (k: K) => string = (k) => k): Slice[] =>
    keys.map((k) => ({ key: k, label: label(k), value: list.filter((e) => of(e) === k).length }));
  const places = LOCATIONS.filter((l) => l.parentId);
  return {
    total: list.length,
    byType: count(TYPE_ORDER, (e) => e.type).sort(byValue),
    bySeverity: count(SEVERITY_ORDER, (e) => e.severity),
    byStatus: count(["open", "in_review", "closed"] as const, (e) => e.status, (k) => STATUS_LABEL[k]),
    byLocation: count(
      places.map((l) => l.id),
      (e) => e.locationId,
      (k) => places.find((l) => l.id === k)?.name ?? k,
    )
      .filter((s) => s.value > 0)
      .sort(byValue),
    unlocated: list.filter((e) => !e.locationId).length,
  };
}

/** One series over the period: by day, week or month, never past today. */
export function eventTrend(events: DashEvent[], p: Period): { label: string; value: number }[] {
  const r = periodRange(p);
  const grain = periodInfo(p).grain;
  const points: { label: string; value: number }[] = [];
  for (let cursor = r.from; cursor.getTime() < r.to.getTime(); ) {
    let next = grain === "month" ? addMonths(cursor, 1) : addDays(cursor, grain === "week" ? 7 : 1);
    // A stub of a few days at the end joins the last week instead of drawing a false drop.
    if (grain === "week" && r.to.getTime() - next.getTime() < 4 * DAY) next = r.to;
    const partial = next.getTime() > r.to.getTime();
    const slot = { from: cursor, to: partial ? r.to : next };
    const name = cursor.toLocaleDateString("en-US", grain === "month" ? { month: "short" } : { month: "short", day: "numeric" });
    points.push({
      // The month still running is said to be partial, so its lower count does not read as a drop.
      label: partial && grain === "month" ? `${name} so far` : name,
      value: events.filter((e) => within(e.date, slot)).length,
    });
    cursor = next;
  }
  return points;
}

export const isThisYear = (d: Date) => d.getFullYear() === TODAY.getFullYear();

export function daysSinceLastEvent(events: DashEvent[]) {
  const last = events.reduce((t, e) => Math.max(t, e.date.getTime()), 0);
  return last ? Math.max(0, Math.round((startOfDay(TODAY).getTime() - last) / DAY)) : null;
}

// ───────────────────────────── corrective actions and work orders

/**
 * CAPAs raised this year that are not in the demo's lists. The year's CAPAs run CAPA-0001 to
 * CAPA-0042 (the next one the flows raise is CAPA-0043); four of them are in A1's list
 * (CAPA-0031, 0033, 0036, 0039), these are the other 38. None of them is past due: the overdue
 * count comes from the list itself, so the number and the list agree.
 */
export const CAPA_HISTORY = {
  status: { open: 3, in_review: 2, closed: 33 } as Record<RecordStatus, number>,
  priority: { High: 9, Medium: 19, Low: 10 } as Record<"High" | "Medium" | "Low", number>,
};

/** Priority of the CAPAs in A1's list that no event flow sets. */
const LIST_CAPA_PRIORITY: Record<string, "High" | "Medium" | "Low"> = { "CAPA-0039": "High", "CAPA-0036": "Medium", "CAPA-0031": "Medium" };

const sourceStatus = (item: SourceItem): RecordStatus => (item.status.label === "In review" ? "in_review" : item.open ? "open" : "closed");

export function capaStats(capas: SourceItem[], priorityOf: (item: SourceItem) => "High" | "Medium" | "Low" | undefined) {
  const status = { ...CAPA_HISTORY.status };
  const priority = { ...CAPA_HISTORY.priority };
  for (const c of capas) {
    status[sourceStatus(c)] += 1;
    const pr = priorityOf(c) ?? LIST_CAPA_PRIORITY[c.ref] ?? "Medium";
    priority[pr] += 1;
  }
  const overdue = capas.filter((c) => c.open && (c.dueIn ?? 0) < 0);
  return {
    byStatus: (["open", "in_review", "closed"] as const).map((k): Slice => ({ key: k, label: STATUS_LABEL[k], value: status[k] })),
    byPriority: (["High", "Medium", "Low"] as const).map((k): Slice => ({ key: k, label: k, value: priority[k] })),
    overdue,
  };
}

/** Safety work orders this year beyond the demo's (the flows' and F2's), all within their dates. */
export const WO_HISTORY = { Open: 4, "In progress": 3, Complete: 61 } as Record<string, number>;

export function woStats(wos: SourceItem[]) {
  const counts = { ...WO_HISTORY };
  for (const w of wos) counts[w.status.label] = (counts[w.status.label] ?? 0) + 1;
  return {
    byStatus: ["Open", "In progress", "Complete"].map((k): Slice => ({ key: k, label: k, value: counts[k] ?? 0 })),
    late: wos.filter((w) => w.open && (w.dueIn ?? 0) < 0),
  };
}

// ───────────────────────────── documents

export const DOC_ROWS: { key: MvpKind; label: string }[] = [
  { key: "jha", label: "Job hazard analyses" },
  { key: "sop", label: "Standard operating procedures" },
  { key: "loto", label: "Lockout/tagout" },
  { key: "ptw", label: "Permits to work" },
  { key: "audit", label: "Audits & inspections" },
];

/** By kind, as the Documentation tabs count them: approved includes the ones whose review is due. */
export function docStats(docs: MvpDoc[]) {
  return DOC_ROWS.map((row) => {
    const of = docs.filter((d) => d.type === row.key);
    const draft = of.filter((d) => d.state === "draft").length;
    const review = of.filter((d) => d.state === "awaiting").length;
    const approved = of.filter((d) => d.state === "valid" || d.state === "expiring" || d.state === "expired").length;
    return { ...row, draft, review, approved, reviewDue: of.filter((d) => d.state === "expiring" || d.state === "expired").length, total: of.length };
  });
}

// ───────────────────────────── incident costs (staged)

/** Staged, as in the redesign: Safety has no cost aggregation yet. Same total as Thiago's example, on this plant's places. */
export const COSTS = {
  total: 48320,
  vsQuarterPct: 12,
  reports: 23,
  months: [
    { label: "Jan", value: 2100 },
    { label: "Feb", value: 3400 },
    { label: "Mar", value: 1800 },
    { label: "Apr", value: 5200 },
    { label: "May", value: 4100 },
    { label: "Jun", value: 6800 },
    { label: "Jul", value: 5600 },
    { label: "Aug", value: 9400 },
    { label: "Sep", value: 6200 },
    { label: "Oct", value: 3720 },
  ],
  byType: [
    { key: "Incident", label: "Incident", value: 38200 },
    { key: "Hazard", label: "Hazard", value: 5300 },
    { key: "Near miss", label: "Near miss", value: 3820 },
    { key: "Observation", label: "Observation", value: 1000 },
  ],
  byLocation: [
    { key: "press", label: "Press Line", value: 19200 },
    { key: "warehouse", label: "Warehouse", value: 12600 },
    { key: "dock", label: "Loading Dock", value: 9400 },
    { key: "pack2", label: "Packaging Line 2", value: 7120 },
  ],
};
