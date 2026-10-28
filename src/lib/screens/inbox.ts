"use client";

/**
 * Use case 3, options A1 and A2: the things that have work orders (events, CAPAs, documents) and what
 * it takes to close those work orders. Nothing here edits the shared data: the artifacts are read from
 * the event flows, the corrective actions, the plant's work orders and the ones made in F2, and what a
 * person does on a work order (status, tasks, photos, time, cost, comments) is kept in this module's own
 * store, in this browser.
 */

import type { EventFlowState } from "@/contexts/ThreeCasesContext";
import { allActions, type ActionRecord } from "@/lib/screens/actions";
import { MORE_WORK_ORDERS, assetOf, dayLabel, daysUntil, type WoPriority, type WoStatus } from "@/lib/screens/work-orders";
import { EVENTS, TODAY, locationName, person } from "@/lib/three-cases/data";
import { DOCS, MVP_SHORT, getMvpAsset, type MvpWo } from "@/lib/three-cases/mvp-rules";
import { daysFromDemoToday } from "@/lib/three-cases/sources";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ArtKind = "event" | "capa" | "doc";
export type ArtStatus = "open" | "in_review" | "done";
type Tone = "neutral" | "accent" | "warning" | "error" | "success";

export const KIND_LABEL: Record<ArtKind, string> = { event: "Event", capa: "CAPA", doc: "Document" };
export const KIND_PLURAL: Record<ArtKind, string> = { event: "Events", capa: "CAPAs", doc: "Documents" };
export const STATUS_LABEL: Record<ArtStatus, string> = { open: "Open", in_review: "In review", done: "Done" };
export const STATUS_TONE: Record<ArtStatus, Tone> = { open: "accent", in_review: "warning", done: "neutral" };

/** Statuses are set per customer in the CMMS; these are its defaults. */
export const WO_FLOW: WoStatus[] = ["open", "in_progress", "on_hold", "complete"];

export interface Suggestion {
  title: string;
  assigneeId: string;
  /** Days from the demo's today. */
  dueIn: number;
  why?: string;
}

export interface WoView {
  /** Unique across artifacts (the same ref can sit under an event and its CAPA). */
  key: string;
  ref: string;
  title: string;
  assigneeId?: string;
  priority: WoPriority;
  /** What the shared data says. */
  baseStatus: WoStatus;
  /** What the person sees: the shared status unless they moved it here. */
  status: WoStatus;
  due?: string;
  dueIn?: number;
  doneAt?: string;
  asset?: string;
  location: string;
  checklistName?: string;
  checklist: string[];
  description?: string;
  holdReason?: string;
  origin: "flow" | "plant" | "f2" | "created";
  /** Flow work orders move the event flow too. */
  eventId?: string;
  flowRef?: string;
}

export interface Artifact {
  id: string;
  kind: ArtKind;
  ref: string;
  title: string;
  /** Incident, Near miss, CAPA, JHA, SOP... */
  typeLabel: string;
  severity?: { label: string; tone: Tone };
  status: ArtStatus;
  locationName: string;
  due?: string;
  dueIn?: number;
  ownerId?: string;
  assigneeIds: string[];
  wos: WoView[];
  eventId?: string;
  facts: [string, string][];
  summary?: string;
  suggestions: Suggestion[];
  /** CAPA that a flow made: closing it goes through the flow. */
  flowCapa?: boolean;
}

// ───────────────────────────── the store

export interface TimeEntry {
  id: string;
  minutes: number;
  note: string;
  by: string;
}
export interface CostEntry {
  id: string;
  label: string;
  amount: number;
}
export interface ActivityEntry {
  id: string;
  at: number;
  by: string;
  kind: "comment" | "log";
  text: string;
}
export interface WoOverlay {
  status?: WoStatus;
  tasks?: number[];
  photos?: string[];
  files?: string[];
  time?: TimeEntry[];
  costs?: CostEntry[];
  activity?: ActivityEntry[];
  /** Timer running since (ms). */
  timerSince?: number;
}
export interface CreatedWo {
  key: string;
  ref: string;
  artifactId: string;
  title: string;
  assigneeId: string;
  dueIn: number;
  priority: WoPriority;
}
interface StoreData {
  wo: Record<string, WoOverlay>;
  closed: string[];
  created: CreatedWo[];
  nextWo: number;
}

const KEY = "ehs-prototype-inbox-wo-v1";
const blank = (): StoreData => ({ wo: {}, closed: [], created: [], nextWo: 1201 });
const uid = () => Math.random().toString(36).slice(2, 9);
/** Who is using the prototype. */
export const ME = "maria";

export function useInboxStore() {
  const [data, setData] = useState<StoreData>(blank);
  const [hydrated, setHydrated] = useState(false);
  const latest = useRef(data);
  useEffect(() => {
    latest.current = data;
  }, [data]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read the saved work once after mount
      if (raw) setData({ ...blank(), ...JSON.parse(raw) });
    } catch {
      // Blocked storage: start empty, the screen still works in memory.
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors.
    }
  }, [data, hydrated]);

  const patch = useCallback((key: string, fn: (o: WoOverlay) => WoOverlay) => setData((d) => ({ ...d, wo: { ...d.wo, [key]: fn(d.wo[key] ?? {}) } })), []);
  const log = (o: WoOverlay, text: string, by = ME): ActivityEntry[] => [...(o.activity ?? []), { id: uid(), at: Date.now(), by, kind: "log", text }];

  const api = useMemo(
    () => ({
      setStatus: (key: string, status: WoStatus, text?: string) => patch(key, (o) => ({ ...o, status, activity: log(o, text ?? `Status changed to ${statusWord(status)}`) })),
      toggleTask: (key: string, i: number) => patch(key, (o) => ({ ...o, tasks: o.tasks?.includes(i) ? o.tasks.filter((x) => x !== i) : [...(o.tasks ?? []), i] })),
      addPhoto: (key: string, name: string) => patch(key, (o) => ({ ...o, photos: [...(o.photos ?? []), name], activity: log(o, `Added photo ${name}`) })),
      addFile: (key: string, name: string) => patch(key, (o) => ({ ...o, files: [...(o.files ?? []), name], activity: log(o, `Added file ${name}`) })),
      addTime: (key: string, minutes: number, note: string) =>
        patch(key, (o) => ({ ...o, time: [...(o.time ?? []), { id: uid(), minutes, note, by: ME }], activity: log(o, `Logged ${fmtMinutes(minutes)}${note ? `: ${note}` : ""}`) })),
      addCost: (key: string, label: string, amount: number) => patch(key, (o) => ({ ...o, costs: [...(o.costs ?? []), { id: uid(), label, amount }], activity: log(o, `Added cost ${label}, $${amount.toFixed(2)}`) })),
      startTimer: (key: string) => patch(key, (o) => (o.timerSince ? o : { ...o, timerSince: Date.now(), activity: log(o, "Started the timer") })),
      stopTimer: (key: string) =>
        patch(key, (o) => {
          if (!o.timerSince) return o;
          const minutes = Math.max(1, Math.round((Date.now() - o.timerSince) / 60_000));
          return { ...o, timerSince: undefined, time: [...(o.time ?? []), { id: uid(), minutes, note: "Timer", by: ME }], activity: log(o, `Stopped the timer, ${fmtMinutes(minutes)} logged`) };
        }),
      comment: (key: string, text: string) => patch(key, (o) => ({ ...o, activity: [...(o.activity ?? []), { id: uid(), at: Date.now(), by: ME, kind: "comment", text }] })),
      closeArtifact: (id: string) => setData((d) => ({ ...d, closed: d.closed.includes(id) ? d.closed : [...d.closed, id] })),
      createWo: (artifactId: string, input: { title: string; assigneeId: string; dueIn: number; priority?: WoPriority }): string => {
        const number = latest.current.nextWo;
        const ref = `WO-${number}`;
        const key = `${artifactId}|${ref}`;
        latest.current = { ...latest.current, nextWo: number + 1 };
        setData((d) => {
          const wo: CreatedWo = { key, ref, artifactId, title: input.title, assigneeId: input.assigneeId, dueIn: input.dueIn, priority: input.priority ?? "medium" };
          const overlay: WoOverlay = { activity: [{ id: uid(), at: Date.now(), by: ME, kind: "log", text: `Created ${ref} and assigned it to ${person(input.assigneeId).name}` }] };
          return { ...d, created: [...d.created, wo], nextWo: Math.max(d.nextWo, number + 1), wo: { ...d.wo, [key]: overlay } };
        });
        return key;
      },
    }),
    [patch],
  );

  return { data, hydrated, ...api };
}
export type InboxStore = ReturnType<typeof useInboxStore>;

export const statusWord = (s: WoStatus) => ({ open: "Open", in_progress: "In progress", on_hold: "On hold", complete: "Complete" })[s];
export const fmtMinutes = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`);

// ───────────────────────────── dates

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function labelIn(days: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Overdue 2 days", "Due today", "Due Oct 23": the date as people say it. */
export function dueText(due: string | undefined, dueIn: number | undefined, open = true): string {
  if (dueIn === undefined) return "No due date";
  if (open && dueIn < 0) return `Overdue ${-dueIn} day${dueIn === -1 ? "" : "s"}`;
  if (dueIn === 0) return "Due today";
  return `Due ${due ?? labelIn(dueIn)}`;
}

// ───────────────────────────── building the artifacts

const GENERIC_TASKS = ["Do the work", "Check the area is safe to use again", "Take a photo of the result"];
const SEVERITY_TONE: Record<string, Tone> = { Low: "neutral", Medium: "neutral", High: "warning", Critical: "error" };
const DOC_STATE_TONE: Record<string, { label: string; tone: Tone }> = {
  valid: { label: "Approved", tone: "neutral" },
  awaiting: { label: "In approval", tone: "accent" },
  draft: { label: "Draft", tone: "neutral" },
  expiring: { label: "Review due", tone: "warning" },
  expired: { label: "Review overdue", tone: "error" },
};

function view(base: Omit<WoView, "key" | "status" | "checklist"> & { checklist?: string[]; artifactId: string }, store: StoreData): WoView {
  const { artifactId, ...rest } = base;
  const key = `${artifactId}|${rest.ref}`;
  const o = store.wo[key];
  const status: WoStatus = rest.baseStatus === "complete" ? "complete" : (o?.status ?? rest.baseStatus);
  return { ...rest, key, status, checklist: rest.checklist?.length ? rest.checklist : GENERIC_TASKS };
}

const maxPriority = (p: "High" | "Medium" | "Low" | undefined): WoPriority => (p === "High" ? "high" : p === "Low" ? "low" : "medium");

function eventArtifacts(flows: Record<string, EventFlowState>, store: StoreData): Artifact[] {
  return EVENTS.map((e) => {
    const flow = flows[e.id];
    const id = `event-${e.id}`;
    const asset = assetOf(e.assetId);
    const wos = [
      ...(flow?.wos ?? []).map((w) =>
        view(
          {
            artifactId: id,
            ref: w.ref,
            title: w.title,
            assigneeId: w.assigneeId,
            priority: maxPriority(e.capaDefaults?.priority),
            baseStatus: w.status,
            due: w.due,
            dueIn: daysFromDemoToday(w.due),
            doneAt: w.doneAt,
            asset: asset?.name,
            location: locationName(e.locationId),
            origin: "flow",
            eventId: e.id,
          },
          store,
        ),
      ),
      ...createdFor(id, store, asset?.name, locationName(e.locationId)),
    ];
    const closed = flow?.status === "closed" || store.closed.includes(id);
    const status: ArtStatus = closed ? "done" : flow?.status === "in_review" ? "in_review" : "open";
    const suggestions: Suggestion[] = e.options
      .filter((o) => o.workOrder)
      .map((o) => ({ title: o.workOrder!.title, assigneeId: o.workOrder!.assigneeId, dueIn: daysFromDemoToday(o.workOrder!.due) ?? 7, why: o.why }));
    return {
      id,
      kind: "event",
      ref: e.ref,
      title: e.title,
      typeLabel: e.type,
      severity: { label: e.severity, tone: SEVERITY_TONE[e.severity] },
      status,
      locationName: locationName(e.locationId),
      due: undefined,
      dueIn: undefined,
      ownerId: e.capaDefaults?.ownerId,
      assigneeIds: [...new Set(wos.map((w) => w.assigneeId).filter((x): x is string => Boolean(x)))],
      wos,
      eventId: e.id,
      facts: [
        ["Reported", e.reportedAt],
        ["Location", locationName(e.locationId)],
        ...(asset ? ([["Asset", asset.name]] as [string, string][]) : []),
        ["Reported by", e.reportedBy],
      ],
      summary: e.aiSummary,
      suggestions,
    };
  });
}

function createdFor(artifactId: string, store: StoreData, asset: string | undefined, location: string): WoView[] {
  return store.created
    .filter((c) => c.artifactId === artifactId)
    .map((c) => {
      const o = store.wo[c.key];
      return {
        key: c.key,
        ref: c.ref,
        title: c.title,
        assigneeId: c.assigneeId,
        priority: c.priority,
        baseStatus: "open",
        status: o?.status ?? "open",
        due: labelIn(c.dueIn),
        dueIn: c.dueIn,
        asset,
        location,
        checklist: GENERIC_TASKS,
        origin: "created",
      };
    });
}

function capaArtifacts(flows: Record<string, EventFlowState>, store: StoreData): Artifact[] {
  return allActions(flows).map((a: ActionRecord) => {
    const id = `capa-${a.ref}`;
    const flowDriven = Boolean(a.fromFlow);
    const asset = assetOf(a.assetId)?.name ?? a.assetLabel;
    const place = locationName(a.locationId);
    const plant = MORE_WORK_ORDERS.filter((w) => w.source.kind === "capa" && w.source.ref === a.ref);
    const plantRefs = new Set(plant.map((w) => w.ref));
    const own = a.workOrders
      .filter((w) => !plantRefs.has(w.ref))
      .map((w) =>
        view(
          {
            artifactId: id,
            ref: w.ref,
            title: w.title,
            assigneeId: w.assigneeId,
            priority: maxPriority(a.priority),
            baseStatus: w.status,
            due: w.due,
            dueIn: daysFromDemoToday(w.due),
            doneAt: w.doneAt,
            asset,
            location: place,
            origin: flowDriven ? "flow" : "plant",
            eventId: a.fromFlow?.eventId,
          },
          store,
        ),
      );
    const fromPlant = plant.map((w) => {
      const wa = assetOf(w.assetId);
      return view(
        {
          artifactId: id,
          ref: w.ref,
          title: w.title,
          assigneeId: w.assigneeId,
          priority: w.priority,
          baseStatus: w.status,
          due: dayLabel(w.due),
          dueIn: daysUntil(w.due),
          doneAt: dayLabel(w.doneAt),
          asset: wa?.name,
          location: wa?.location ?? w.location ?? place,
          checklistName: w.checklist?.name,
          checklist: w.checklist?.items,
          description: w.description,
          holdReason: w.holdReason,
          origin: "plant",
        },
        store,
      );
    });
    const wos = [...own, ...fromPlant, ...createdFor(id, store, asset, place)];
    const closed = a.status === "closed" || store.closed.includes(id);
    const status: ArtStatus = closed ? "done" : a.status === "in_review" ? "in_review" : "open";
    const suggestions: Suggestion[] = a.plan.map((p) => ({ title: p, assigneeId: a.ownerId ?? "dan", dueIn: daysFromDemoToday(a.due) ?? 7 }));
    return {
      id,
      kind: "capa",
      ref: a.ref,
      title: a.title,
      typeLabel: "CAPA",
      severity: { label: a.priority, tone: a.priority === "High" ? "warning" : "neutral" },
      status,
      locationName: place,
      due: a.due,
      dueIn: daysFromDemoToday(a.due),
      ownerId: a.ownerId,
      assigneeIds: [...new Set(wos.map((w) => w.assigneeId).filter((x): x is string => Boolean(x)))],
      wos,
      eventId: a.fromFlow?.eventId,
      flowCapa: flowDriven,
      facts: [
        ["Owner", a.ownerId ? person(a.ownerId).name : "Nobody"],
        ["Type", a.type],
        ["Location", place],
        ...(asset ? ([["Asset", asset]] as [string, string][]) : []),
        ...(a.event ? ([["From", `${a.event.ref}, ${a.event.title}`]] as [string, string][]) : []),
      ],
      summary: a.rootCause,
      suggestions,
    };
  });
}

function docArtifacts(made: MvpWo[], store: StoreData): Artifact[] {
  const out: Artifact[] = [];
  for (const d of DOCS) {
    const id = `doc-${d.ref}`;
    const asset = d.assetIds.length ? getMvpAsset(d.assetIds[0]) : undefined;
    const place = asset?.location ?? "Springfield Plant";
    const plant = MORE_WORK_ORDERS.filter((w) => w.source.kind === "document" && w.source.ref === d.ref);
    const f2 = made.filter((w) => w.docs[0]?.ref === d.ref);
    const wos: WoView[] = [
      ...plant.map((w) => {
        const wa = assetOf(w.assetId);
        return view(
          {
            artifactId: id,
            ref: w.ref,
            title: w.title,
            assigneeId: w.assigneeId,
            priority: w.priority,
            baseStatus: w.status,
            due: dayLabel(w.due),
            dueIn: daysUntil(w.due),
            doneAt: dayLabel(w.doneAt),
            asset: wa?.name,
            location: wa?.location ?? place,
            checklistName: w.checklist?.name,
            checklist: w.checklist?.items,
            description: w.description,
            holdReason: w.holdReason,
            origin: "plant",
          },
          store,
        );
      }),
      ...f2.map((w) =>
        view(
          {
            artifactId: id,
            ref: w.ref,
            title: w.title,
            assigneeId: w.assigneeId,
            priority: w.priority,
            baseStatus: w.status === "done" ? "complete" : "open",
            due: dayLabel(w.due),
            dueIn: daysUntil(w.due),
            doneAt: dayLabel(w.doneOn),
            asset: getMvpAsset(w.assetId)?.name,
            location: getMvpAsset(w.assetId)?.location ?? place,
            description: w.description || undefined,
            origin: "f2",
          },
          store,
        ),
      ),
      ...createdFor(id, store, asset?.name, place),
    ];
    const needsWork = d.state !== "valid";
    // A document is a source of work only when it has work orders, or when it asks for one (a review, an approval).
    if (!wos.length && !needsWork) continue;
    const anyOpen = wos.some((w) => w.status !== "complete");
    const status: ArtStatus = wos.length ? (anyOpen ? "open" : "done") : "open";
    const st = DOC_STATE_TONE[d.state];
    const nextDue = wos.filter((w) => w.status !== "complete" && w.dueIn !== undefined).sort((a, b) => (a.dueIn ?? 0) - (b.dueIn ?? 0))[0];
    const review = d.state === "awaiting" ? `Approve ${d.ref}` : d.state === "draft" ? `Finish and send ${d.ref} for approval` : `Review ${d.title}`;
    out.push({
      id,
      kind: "doc",
      ref: d.ref,
      title: d.title,
      typeLabel: MVP_SHORT[d.type],
      severity: d.state === "valid" ? undefined : st,
      status,
      locationName: place,
      due: nextDue?.due,
      dueIn: nextDue?.dueIn,
      assigneeIds: [...new Set(wos.map((w) => w.assigneeId).filter((x): x is string => Boolean(x)))],
      wos,
      docRef: d.ref,
      facts: [
        ["Document", `${MVP_SHORT[d.type]} · ${st.label}`],
        ["Asset", asset ? asset.name : "Company program"],
        ["Location", place],
      ],
      summary: "Work orders from a document come back with every review cycle. Closing the last one needs no decision: the next one follows.",
      suggestions: [{ title: review, assigneeId: d.approvers[0] ?? "maria", dueIn: 7 }],
    } as Artifact);
  }
  return out;
}

export function buildArtifacts(flows: Record<string, EventFlowState>, made: MvpWo[], store: StoreData): Artifact[] {
  const all = [...eventArtifacts(flows, store), ...capaArtifacts(flows, store), ...docArtifacts(made, store)];
  // Open first, then overdue and the one due first; no date goes last.
  return all.sort((a, b) => Number(a.status === "done") - Number(b.status === "done") || (a.dueIn ?? 999) - (b.dueIn ?? 999) || a.ref.localeCompare(b.ref));
}

// ───────────────────────────── filters

export interface Filters {
  q: string;
  kind: ArtKind | "all";
  /** "active" is open and in review; the default. */
  status: "active" | "done" | "all";
  location: string;
  assignee: string;
  overdue: boolean;
  wos: "with" | "without" | "all";
}
export const defaultFilters = (wos: Filters["wos"]): Filters => ({ q: "", kind: "all", status: "active", location: "all", assignee: "all", overdue: false, wos });

export const isOverdue = (a: Artifact) => a.status !== "done" && a.wos.some((w) => w.status !== "complete" && (w.dueIn ?? 0) < 0);

export function applyFilters(list: Artifact[], f: Filters): Artifact[] {
  const words = f.q.trim().toLowerCase();
  return list.filter(
    (a) =>
      (f.kind === "all" || a.kind === f.kind) &&
      (f.status === "all" || (f.status === "done" ? a.status === "done" : a.status !== "done")) &&
      (f.location === "all" || a.locationName === f.location) &&
      (f.assignee === "all" || a.assigneeIds.includes(f.assignee)) &&
      (!f.overdue || isOverdue(a)) &&
      (f.wos === "all" || (f.wos === "with" ? a.wos.length > 0 : a.wos.length === 0)) &&
      (!words || `${a.ref} ${a.title} ${a.typeLabel} ${a.locationName} ${a.wos.map((w) => `${w.ref} ${w.title}`).join(" ")}`.toLowerCase().includes(words)),
  );
}

export const openWos = (a: Artifact) => a.wos.filter((w) => w.status !== "complete");
