"use client";

// State shared by the AI-first prototypes so the flows connect:
// a report from P1/P10/P7 shows up in the supervisor queue (P8), which opens the action plan (P3).
// Persisted in localStorage; "Reset prototype data" restores the seed.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Capa, InboxItem, Report, WorkOrder } from "@/lib/ai-first/types";
import { SEED_INBOX, SEED_REPORT, SEED_WORK_ORDERS } from "@/lib/ai-first/sample-data";

const STORAGE_KEY = "ehs-prototype-ai-first-state-v1";

interface AiFirstState {
  reports: Report[];
  inbox: InboxItem[];
  capas: Capa[];
  workOrders: WorkOrder[];
  nextId: number;
}

const seedState = (): AiFirstState => ({
  reports: [SEED_REPORT],
  inbox: SEED_INBOX,
  capas: [],
  workOrders: SEED_WORK_ORDERS,
  nextId: 1043,
});

interface AiFirstContextValue extends AiFirstState {
  addReport: (report: Omit<Report, "id" | "createdAt">) => Report;
  updateReport: (id: string, patch: Partial<Report>) => void;
  updateInboxItem: (id: string, patch: Partial<InboxItem>) => void;
  addCapa: (capa: Omit<Capa, "id">) => Capa;
  updateCapa: (id: string, patch: Partial<Capa>) => void;
  addWorkOrders: (wos: Omit<WorkOrder, "id" | "createdAt">[]) => WorkOrder[];
  updateWorkOrder: (id: string, patch: Partial<WorkOrder>) => void;
  reset: () => void;
}

const AiFirstContext = createContext<AiFirstContextValue | null>(null);

export function AiFirstProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AiFirstState>(seedState);
  const [loaded, setLoaded] = useState(false);
  // Counters live in refs so several records created in one click get distinct ids.
  const counters = useRef({ report: state.nextId, capa: state.capas.length, wo: state.workOrders.length });
  useEffect(() => {
    counters.current = { report: state.nextId, capa: state.capas.length, wo: state.workOrders.length };
  }, [state.nextId, state.capas.length, state.workOrders.length]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as AiFirstState);
    } catch {
      // ignore broken storage, keep the seed
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, loaded]);

  const addReport = useCallback((input: Omit<Report, "id" | "createdAt">) => {
    const created: Report = { ...input, id: `R-${counters.current.report}`, createdAt: new Date().toISOString() };
    counters.current.report += 1;
    setState((s) => {
      const inboxItem: InboxItem = {
        id: `i-${created.id}`,
        kind: input.oshaPossible ? "osha_check" : "event_review",
        title: input.title,
        location: input.location,
        createdAt: "Just now",
        reason: input.oshaPossible
          ? "Reporter said someone needed treatment beyond first aid. Recordability is a person's call."
          : `Severity is always a person's call. AI suggests ${input.severity} (${Math.round(input.severityConfidence * 100)}%).`,
        suggestion: `${labelForType(input.type)} · Severity: ${capitalize(input.severity)}`,
        confidence: input.severityConfidence,
        risk: input.oshaPossible ? "high" : "medium",
        needsPerson: true,
        reportId: created.id,
      };
      return { ...s, reports: [created, ...s.reports], inbox: [inboxItem, ...s.inbox], nextId: Math.max(s.nextId, counters.current.report) };
    });
    return created;
  }, []);

  const updateReport = useCallback((id: string, patch: Partial<Report>) => {
    setState((s) => ({ ...s, reports: s.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  }, []);

  const updateInboxItem = useCallback((id: string, patch: Partial<InboxItem>) => {
    setState((s) => ({ ...s, inbox: s.inbox.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  }, []);

  const addCapa = useCallback((input: Omit<Capa, "id">) => {
    counters.current.capa += 1;
    const capa: Capa = { ...input, id: `CAPA-${400 + counters.current.capa}` };
    setState((s) => ({ ...s, capas: [...s.capas, capa] }));
    return capa;
  }, []);

  const updateCapa = useCallback((id: string, patch: Partial<Capa>) => {
    setState((s) => ({ ...s, capas: s.capas.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }, []);

  const addWorkOrders = useCallback((inputs: Omit<WorkOrder, "id" | "createdAt">[]) => {
    const base = 5701 + counters.current.wo;
    counters.current.wo += inputs.length;
    const created = inputs.map((w, i) => ({ ...w, id: `WO-${base + i}`, createdAt: new Date().toISOString() }));
    setState((s) => ({ ...s, workOrders: [...s.workOrders, ...created] }));
    return created;
  }, []);

  const updateWorkOrder = useCallback((id: string, patch: Partial<WorkOrder>) => {
    setState((s) => ({ ...s, workOrders: s.workOrders.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));
  }, []);

  const reset = useCallback(() => setState(seedState()), []);

  const value = useMemo(
    () => ({ ...state, addReport, updateReport, updateInboxItem, addCapa, updateCapa, addWorkOrders, updateWorkOrder, reset }),
    [state, addReport, updateReport, updateInboxItem, addCapa, updateCapa, addWorkOrders, updateWorkOrder, reset]
  );

  return <AiFirstContext.Provider value={value}>{children}</AiFirstContext.Provider>;
}

export function useAiFirst() {
  const ctx = useContext(AiFirstContext);
  if (!ctx) throw new Error("useAiFirst must be used inside AiFirstProvider");
  return ctx;
}

export function labelForType(type: Report["type"]) {
  return { near_miss: "Near miss", incident: "Incident", hazard: "Hazard observation", maintenance: "Maintenance request" }[type];
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
