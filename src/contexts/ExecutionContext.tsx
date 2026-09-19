"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ExecutionDocType = "jha" | "sop" | "loto" | "ptw" | "audit";

export interface ExecutionChecklist {
  id: string;
  name: string;
  description: string;
  origin: "auto" | "manual";
  isPrimary: boolean;
  createdAt: string;
}

export interface ExecutionWorkItem {
  id: string;
  kind: "work_order" | "pm";
  workOrderNumber: string;
  description: string;
  recurring: boolean;
  priority: "P1" | "P2" | "P3";
  dueDate: string;
  status: string;
  createdAt: string;
}

interface DocExecutionState {
  checklists: ExecutionChecklist[];
  workItems: ExecutionWorkItem[];
}

interface ExecutionStore {
  [docKey: string]: DocExecutionState;
}

const STORAGE_KEY = "ehs-prototype-execution-store-v1";

// Audit and PTW/LOTO center on periodic, scheduled risk controls (quarterly inspections,
// recurring lockouts) so a PM is the more likely fit; JHA/SOP typically back a one-off task.
const RECURRING_HINT: Record<ExecutionDocType, boolean> = {
  audit: true,
  ptw: false,
  loto: true,
  jha: false,
  sop: false,
};

function docKey(docType: ExecutionDocType, docId: string) {
  return `${docType}:${docId}`;
}

function loadStore(): ExecutionStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: ExecutionStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // prototype-only persistence; ignore quota/serialization failures
  }
}

let seq = 1;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

interface ExecutionContextValue {
  getChecklists: (docType: ExecutionDocType, docId: string) => ExecutionChecklist[];
  getWorkItems: (docType: ExecutionDocType, docId: string) => ExecutionWorkItem[];
  ensureAutoChecklist: (docType: ExecutionDocType, docId: string, docTitle: string) => void;
  addChecklist: (docType: ExecutionDocType, docId: string, name: string, description: string) => void;
  setPrimaryChecklist: (docType: ExecutionDocType, docId: string, checklistId: string) => void;
  suggestRecurring: (docType: ExecutionDocType) => boolean;
  createWorkItem: (
    docType: ExecutionDocType,
    docId: string,
    docTitle: string,
    input: { description: string; recurring: boolean; priority: "P1" | "P2" | "P3"; dueDate: string }
  ) => void;
}

const ExecutionContext = createContext<ExecutionContextValue | null>(null);

export function ExecutionProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<ExecutionStore>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(loadStore());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveStore(store);
  }, [store, hydrated]);

  const getState = useCallback(
    (docType: ExecutionDocType, docId: string): DocExecutionState =>
      store[docKey(docType, docId)] ?? { checklists: [], workItems: [] },
    [store]
  );

  const getChecklists = useCallback(
    (docType: ExecutionDocType, docId: string) => getState(docType, docId).checklists,
    [getState]
  );

  const getWorkItems = useCallback(
    (docType: ExecutionDocType, docId: string) => getState(docType, docId).workItems,
    [getState]
  );

  const ensureAutoChecklist = useCallback((docType: ExecutionDocType, docId: string, docTitle: string) => {
    setStore((prev) => {
      const key = docKey(docType, docId);
      const existing = prev[key] ?? { checklists: [], workItems: [] };
      if (existing.checklists.length > 0) return prev;

      const autoChecklist: ExecutionChecklist = {
        id: nextId("chk"),
        name: `${docTitle} — Execution Checklist`,
        description: "Generated automatically when this document was created.",
        origin: "auto",
        isPrimary: true,
        createdAt: new Date().toISOString(),
      };

      return {
        ...prev,
        [key]: { ...existing, checklists: [autoChecklist] },
      };
    });
  }, []);

  const addChecklist = useCallback((docType: ExecutionDocType, docId: string, name: string, description: string) => {
    setStore((prev) => {
      const key = docKey(docType, docId);
      const existing = prev[key] ?? { checklists: [], workItems: [] };
      const checklist: ExecutionChecklist = {
        id: nextId("chk"),
        name,
        description,
        origin: "manual",
        isPrimary: existing.checklists.length === 0,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        [key]: { ...existing, checklists: [...existing.checklists, checklist] },
      };
    });
  }, []);

  const setPrimaryChecklist = useCallback((docType: ExecutionDocType, docId: string, checklistId: string) => {
    setStore((prev) => {
      const key = docKey(docType, docId);
      const existing = prev[key] ?? { checklists: [], workItems: [] };
      return {
        ...prev,
        [key]: {
          ...existing,
          checklists: existing.checklists.map((c) => ({ ...c, isPrimary: c.id === checklistId })),
        },
      };
    });
  }, []);

  const suggestRecurring = useCallback((docType: ExecutionDocType) => RECURRING_HINT[docType], []);

  const createWorkItem = useCallback(
    (
      docType: ExecutionDocType,
      docId: string,
      docTitle: string,
      input: { description: string; recurring: boolean; priority: "P1" | "P2" | "P3"; dueDate: string }
    ) => {
      setStore((prev) => {
        const key = docKey(docType, docId);
        const existing = prev[key] ?? { checklists: [], workItems: [] };
        const item: ExecutionWorkItem = {
          id: nextId(input.recurring ? "pm" : "wo"),
          kind: input.recurring ? "pm" : "work_order",
          workOrderNumber: input.recurring
            ? `PM-${(existing.workItems.length + 1).toString().padStart(3, "0")}`
            : `WO-${(existing.workItems.length + 1).toString().padStart(4, "0")}`,
          description: input.description || `Execute ${docTitle}`,
          recurring: input.recurring,
          priority: input.priority,
          dueDate: input.dueDate,
          status: "Open",
          createdAt: new Date().toISOString(),
        };
        return {
          ...prev,
          [key]: { ...existing, workItems: [...existing.workItems, item] },
        };
      });
    },
    []
  );

  return (
    <ExecutionContext.Provider
      value={{
        getChecklists,
        getWorkItems,
        ensureAutoChecklist,
        addChecklist,
        setPrimaryChecklist,
        suggestRecurring,
        createWorkItem,
      }}
    >
      {children}
    </ExecutionContext.Provider>
  );
}

export function useExecution() {
  const ctx = useContext(ExecutionContext);
  if (!ctx) throw new Error("useExecution must be used within an ExecutionProvider");
  return ctx;
}
