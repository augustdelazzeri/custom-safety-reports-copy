"use client";

// State for the "3 use cases" prototype. Persisted in localStorage so the flows connect:
// an execution plan creates a work order you can open, and an event flow creates a CAPA,
// work orders and an OSHA entry that the Inbox and Events pages show.
//
// Event, CAPA and work orders keep separate statuses, as in production: running the flow only
// creates records; the CAPA owner hears about every work order change and gets the CAPA back
// to review once all of them are done; the event can close while the CAPA stays open.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { EVENTS, event as getEvent, job, person } from "@/lib/three-cases/data";

const STORAGE_KEY = "ehs-prototype-three-cases-v2";

export interface Execution {
  id: string;
  jobId: string;
  woRef: string;
  createdAt: string;
  assigneeId: string;
  checklist: string[];
  permitStatus: "pending" | "approved" | "none";
  sentToPhone: boolean;
  recurring: boolean;
}

/** Event and CAPA statuses in production. */
export type RecordStatus = "open" | "in_review" | "closed";
/** Work order statuses in the CMMS (On hold left out). */
export type WoStatus = "open" | "in_progress" | "complete";

export interface FlowWo {
  ref: string;
  title: string;
  assigneeId: string;
  due: string;
  status: WoStatus;
  doneAt?: string;
}

/** What the CAPA owner was told, newest last. */
export interface FlowUpdate {
  at: string;
  text: string;
  tone: "info" | "progress" | "done" | "review" | "late" | "closed";
}

export interface EventFlowState {
  status: RecordStatus;
  /** The decision task (run the flow or close without action) is done. */
  decided: boolean;
  decidedAt?: string;
  selectedOptionIds: string[];
  customActions: string[];
  capaRef?: string;
  capaStatus?: RecordStatus;
  wos: FlowWo[];
  oshaRef?: string;
  closedNote?: string;
  updates: FlowUpdate[];
}

interface State {
  executions: Execution[];
  flows: Record<string, EventFlowState>;
  /** Documents the AI found by title that someone linked to their asset. */
  linkedDocIds: string[];
  /** Nova proposals approved in the Compliance Calendar. */
  novaDone: string[];
  nextWo: number;
  nextCapa: number;
}

const blankFlow = (): EventFlowState => ({ status: "open", decided: false, selectedOptionIds: [], customActions: [], wos: [], updates: [] });

const seed = (): State => ({
  executions: [],
  linkedDocIds: [],
  novaDone: [],
  flows: {
    ...Object.fromEntries(EVENTS.map((e) => [e.id, blankFlow()])),
    "ev-0119": {
      status: "in_review",
      decided: true,
      decidedAt: "Oct 2",
      selectedOptionIds: ["o1", "o2", "o3"],
      customActions: [],
      capaRef: "CAPA-0033",
      capaStatus: "open",
      wos: [
        { ref: "WO-1038", title: "Repair die hoist, Press Line", assigneeId: "carlos", due: "Oct 6", status: "complete", doneAt: "Oct 6" },
        { ref: "WO-1042", title: "Buy and place a die cart, Press Line", assigneeId: "tom", due: "Oct 14", status: "in_progress" },
        { ref: "WO-1043", title: "Add hoist check to AUD-0021", assigneeId: "dan", due: "Oct 23", status: "open" },
      ],
      updates: [
        { at: "Oct 2", text: "CAPA-0033 created with 3 work orders", tone: "info" },
        { at: "Oct 6", text: "WO-1038 completed by Carlos Rivera · load test photo attached", tone: "done" },
        { at: "Oct 12", text: "WO-1042 started by Tom Becker · die cart ordered", tone: "progress" },
        { at: "Oct 16", text: "WO-1042 is 2 days late", tone: "late" },
      ],
    },
  },
  nextWo: 1061,
  nextCapa: 43,
});

interface Ctx extends State {
  hydrated: boolean;
  createExecution: (jobId: string) => Execution;
  updateExecution: (id: string, patch: Partial<Execution>) => void;
  linkDocs: (docIds: string[]) => void;
  markNovaDone: (ids: string[]) => void;
  /** Creates the CAPA, work orders and OSHA entry. Closes nothing. */
  runEventFlow: (eventId: string, optionIds: string[], customActions: string[]) => EventFlowState;
  closeEvent: (eventId: string, note: string) => void;
  reopenEvent: (eventId: string) => void;
  /** Moves one work order to its next status (the first unfinished one when no ref is given). */
  advanceWo: (eventId: string, ref?: string) => void;
  closeCapa: (eventId: string) => void;
  /** The owner keeps the CAPA open and adds a follow-up work order. */
  keepCapaOpen: (eventId: string, action: string) => void;
  reset: () => void;
}

const ThreeCasesContext = createContext<Ctx | null>(null);

const patchFlow = (s: State, eventId: string, patch: Partial<EventFlowState>): State => ({
  ...s,
  flows: { ...s.flows, [eventId]: { ...(s.flows[eventId] ?? blankFlow()), ...patch } },
});

export function ThreeCasesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        setState({ ...seed(), ...parsed, flows: { ...seed().flows, ...parsed.flows } });
      }
    } catch {
      // Private window or blocked storage: start from the seed.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors; the demo still works in memory.
    }
  }, [state, hydrated]);

  const createExecution = useCallback((jobId: string) => {
    const j = job(jobId);
    const execution: Execution = {
      id: `ex-${Date.now()}`,
      jobId,
      woRef: j?.woRef ?? "WO-1099",
      createdAt: new Date().toISOString(),
      assigneeId: j?.assigneeId ?? "carlos",
      checklist: j?.checklist ?? [],
      permitStatus: j?.plan.some((p) => p.kind === "ptw") ? "pending" : "none",
      sentToPhone: false,
      recurring: Boolean(j?.recurring),
    };
    setState((s) => ({ ...s, executions: [execution, ...s.executions] }));
    return execution;
  }, []);

  const updateExecution = useCallback((id: string, patch: Partial<Execution>) => {
    setState((s) => ({ ...s, executions: s.executions.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }, []);

  const linkDocs = useCallback((docIds: string[]) => {
    setState((s) => ({ ...s, linkedDocIds: Array.from(new Set([...s.linkedDocIds, ...docIds])) }));
  }, []);

  const markNovaDone = useCallback((ids: string[]) => {
    setState((s) => ({ ...s, novaDone: Array.from(new Set([...s.novaDone, ...ids])) }));
  }, []);

  const runEventFlow = useCallback((eventId: string, optionIds: string[], customActions: string[]) => {
    const ev = getEvent(eventId);
    let result: EventFlowState = blankFlow();
    setState((s) => {
      const chosen = (ev?.options ?? []).filter((o) => optionIds.includes(o.id) && o.workOrder);
      const wos: FlowWo[] = chosen.map((o, i) => ({
        ref: `WO-${s.nextWo + i}`,
        title: o.workOrder!.title,
        assigneeId: o.workOrder!.assigneeId,
        due: o.workOrder!.due,
        status: "open",
      }));
      const needsCapa = optionIds.length + customActions.length > 0;
      const capaRef = needsCapa ? `CAPA-${String(s.nextCapa).padStart(4, "0")}` : undefined;
      const owner = person(ev?.capaDefaults?.ownerId ?? "dan").name;
      result = {
        status: "in_review",
        decided: true,
        decidedAt: "Today",
        selectedOptionIds: optionIds,
        customActions,
        capaRef,
        // A CAPA with no work orders goes straight back to its owner.
        capaStatus: needsCapa ? (wos.length ? "open" : "in_review") : undefined,
        wos,
        oshaRef: ev?.osha ? `OSHA 300 · Case ${ev.osha.caseNumber}` : undefined,
        updates: capaRef
          ? [
              {
                at: "Now",
                text: wos.length
                  ? `${capaRef} created with ${wos.length} work order${wos.length > 1 ? "s" : ""}. ${owner} gets an update each time one changes.`
                  : `${capaRef} created with no work orders. ${owner} closes it when the actions are done.`,
                tone: "info",
              },
            ]
          : [],
      };
      return {
        ...patchFlow(s, eventId, result),
        nextWo: s.nextWo + wos.length,
        nextCapa: needsCapa ? s.nextCapa + 1 : s.nextCapa,
      };
    });
    return result;
  }, []);

  const closeEvent = useCallback((eventId: string, note: string) => {
    setState((s) => {
      const f = s.flows[eventId] ?? blankFlow();
      return patchFlow(s, eventId, {
        status: "closed",
        decided: true,
        decidedAt: f.decidedAt ?? "Today",
        closedNote: note,
        updates: [...f.updates, { at: "Now", text: `Event closed. ${note}`, tone: "closed" }],
      });
    });
  }, []);

  const reopenEvent = useCallback((eventId: string) => {
    setState((s) => {
      const f = s.flows[eventId] ?? blankFlow();
      return patchFlow(s, eventId, { status: f.decided && f.capaRef ? "in_review" : "open", decided: Boolean(f.capaRef), closedNote: undefined });
    });
  }, []);

  const advanceWo = useCallback((eventId: string, ref?: string) => {
    setState((s) => {
      const f = s.flows[eventId];
      if (!f) return s;
      const target = f.wos.find((w) => (ref ? w.ref === ref : w.status !== "complete"));
      if (!target || target.status === "complete") return s;
      const next: WoStatus = target.status === "open" ? "in_progress" : "complete";
      const who = person(target.assigneeId).name;
      const wos = f.wos.map((w) => (w.ref === target.ref ? { ...w, status: next, doneAt: next === "complete" ? "Today" : undefined } : w));
      const updates: FlowUpdate[] = [
        ...f.updates,
        next === "in_progress"
          ? { at: "Now", text: `${target.ref} started by ${who}`, tone: "progress" }
          : { at: "Now", text: `${target.ref} completed by ${who} · photo attached`, tone: "done" },
      ];
      const allDone = wos.every((w) => w.status === "complete");
      let capaStatus = f.capaStatus;
      if (allDone && f.capaStatus === "open") {
        capaStatus = "in_review";
        const owner = person(getEvent(eventId)?.capaDefaults?.ownerId ?? "dan").name;
        updates.push({ at: "Now", text: `All ${wos.length} work orders are done. ${f.capaRef} is back with ${owner} to review.`, tone: "review" });
      }
      return patchFlow(s, eventId, { wos, updates, capaStatus });
    });
  }, []);

  const closeCapa = useCallback((eventId: string) => {
    setState((s) => {
      const f = s.flows[eventId];
      if (!f) return s;
      return patchFlow(s, eventId, {
        capaStatus: "closed",
        updates: [...f.updates, { at: "Now", text: `${f.capaRef} closed by its owner`, tone: "closed" }],
      });
    });
  }, []);

  const keepCapaOpen = useCallback((eventId: string, action: string) => {
    setState((s) => {
      const f = s.flows[eventId];
      if (!f) return s;
      const ownerId = getEvent(eventId)?.capaDefaults?.ownerId ?? "dan";
      const ref = `WO-${s.nextWo}`;
      return {
        ...patchFlow(s, eventId, {
          capaStatus: "open",
          customActions: [...f.customActions, action],
          wos: [...f.wos, { ref, title: action, assigneeId: ownerId, due: "In 7 days", status: "open" }],
          updates: [...f.updates, { at: "Now", text: `${person(ownerId).name} kept ${f.capaRef} open and added ${ref}: ${action}`, tone: "info" }],
        }),
        nextWo: s.nextWo + 1,
      };
    });
  }, []);

  const reset = useCallback(() => setState(seed()), []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      hydrated,
      createExecution,
      updateExecution,
      linkDocs,
      markNovaDone,
      runEventFlow,
      closeEvent,
      reopenEvent,
      advanceWo,
      closeCapa,
      keepCapaOpen,
      reset,
    }),
    [state, hydrated, createExecution, updateExecution, linkDocs, markNovaDone, runEventFlow, closeEvent, reopenEvent, advanceWo, closeCapa, keepCapaOpen, reset],
  );

  return <ThreeCasesContext.Provider value={value}>{children}</ThreeCasesContext.Provider>;
}

export function useThreeCases() {
  const ctx = useContext(ThreeCasesContext);
  if (!ctx) throw new Error("useThreeCases must be used inside ThreeCasesProvider");
  return ctx;
}
