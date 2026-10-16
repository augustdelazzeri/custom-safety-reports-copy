"use client";

// State for the "3 use cases" prototype. Persisted in localStorage so the flows connect:
// an execution plan creates a work order you can open, and an event flow creates a CAPA,
// work orders and an OSHA entry that the Inbox and Events pages show.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { EVENTS, job } from "@/lib/three-cases/data";

const STORAGE_KEY = "ehs-prototype-three-cases-v1";

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

export interface EventFlowState {
  status: "open" | "in_progress" | "verified" | "closed";
  selectedOptionIds: string[];
  customActions: string[];
  capaRef?: string;
  woRefs: string[];
  oshaRef?: string;
  closedNote?: string;
}

interface State {
  executions: Execution[];
  flows: Record<string, EventFlowState>;
  /** Documents the AI found by title that someone linked to their asset. */
  linkedDocIds: string[];
  nextWo: number;
  nextCapa: number;
}

const seed = (): State => ({
  executions: [],
  linkedDocIds: [],
  flows: Object.fromEntries(EVENTS.map((e) => [e.id, { status: "open", selectedOptionIds: [], customActions: [], woRefs: [] }])),
  nextWo: 1061,
  nextCapa: 43,
});

interface Ctx extends State {
  hydrated: boolean;
  createExecution: (jobId: string) => Execution;
  updateExecution: (id: string, patch: Partial<Execution>) => void;
  linkDocs: (docIds: string[]) => void;
  runEventFlow: (eventId: string, optionIds: string[], customActions: string[]) => EventFlowState;
  closeEvent: (eventId: string, note: string) => void;
  verifyEvent: (eventId: string) => void;
  reset: () => void;
}

const ThreeCasesContext = createContext<Ctx | null>(null);

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

  const runEventFlow = useCallback(
    (eventId: string, optionIds: string[], customActions: string[]) => {
      const ev = EVENTS.find((e) => e.id === eventId);
      let result: EventFlowState = { status: "in_progress", selectedOptionIds: optionIds, customActions, woRefs: [] };
      setState((s) => {
        const woCount = ev ? ev.options.filter((o) => optionIds.includes(o.id) && o.workOrder).length : 0;
        const woRefs = Array.from({ length: woCount }, (_, i) => `WO-${s.nextWo + i}`);
        const needsCapa = optionIds.length + customActions.length > 0;
        result = {
          status: "in_progress",
          selectedOptionIds: optionIds,
          customActions,
          capaRef: needsCapa ? `CAPA-${String(s.nextCapa).padStart(4, "0")}` : undefined,
          woRefs,
          oshaRef: ev?.osha ? `OSHA 300 · Case ${ev.osha.caseNumber}` : undefined,
        };
        return {
          ...s,
          flows: { ...s.flows, [eventId]: result },
          nextWo: s.nextWo + woCount,
          nextCapa: needsCapa ? s.nextCapa + 1 : s.nextCapa,
        };
      });
      return result;
    },
    [],
  );

  const closeEvent = useCallback((eventId: string, note: string) => {
    setState((s) => ({
      ...s,
      flows: { ...s.flows, [eventId]: { ...s.flows[eventId], status: "closed", closedNote: note } },
    }));
  }, []);

  const verifyEvent = useCallback((eventId: string) => {
    setState((s) => ({ ...s, flows: { ...s.flows, [eventId]: { ...s.flows[eventId], status: "verified" } } }));
  }, []);

  const reset = useCallback(() => setState(seed()), []);

  const value = useMemo<Ctx>(
    () => ({ ...state, hydrated, createExecution, updateExecution, linkDocs, runEventFlow, closeEvent, verifyEvent, reset }),
    [state, hydrated, createExecution, updateExecution, linkDocs, runEventFlow, closeEvent, verifyEvent, reset],
  );

  return <ThreeCasesContext.Provider value={value}>{children}</ThreeCasesContext.Provider>;
}

export function useThreeCases() {
  const ctx = useContext(ThreeCasesContext);
  if (!ctx) throw new Error("useThreeCases must be used inside ThreeCasesProvider");
  return ctx;
}
