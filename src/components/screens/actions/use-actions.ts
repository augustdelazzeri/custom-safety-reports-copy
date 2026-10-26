"use client";

/**
 * The corrective actions as the screens show them: the event flows' CAPAs and the sample ones
 * (src/lib/screens/actions.ts), plus what was changed here (closed, reopened, a new owner).
 *
 * A CAPA made by an event flow closes through `useThreeCases()`, so A1 and the event page see it
 * closed too. The sample CAPAs, and owners, keep their changes in this browser.
 */

import { useThreeCases } from "@/contexts/ThreeCasesContext";
import type { FlowUpdate } from "@/contexts/ThreeCasesContext";
import { person } from "@/lib/three-cases/data";
import { useDataMode } from "@/lib/three-cases/demo-data";
import { allActions, type ActionRecord, type ActionStatus } from "@/lib/screens/actions";
import { useCallback, useMemo, useSyncExternalStore } from "react";

interface Override {
  status?: ActionStatus;
  closedAt?: string;
  /** null: the owner was removed. */
  ownerId?: string | null;
  /** Work orders closed together with the action. */
  woDone?: string[];
  notes?: FlowUpdate[];
}
type Overrides = Record<string, Override>;

const KEY = "ehs-prototype-actions-v1";
const EVENT = "ehs-prototype-actions";
const EMPTY: Overrides = {};
let cache: Overrides | null = null;

function read(): Overrides {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Overrides) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Overrides) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Blocked storage: the change still holds for this visit.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

const patch = (ref: string, next: (o: Override) => Override) => {
  const all = read();
  write({ ...all, [ref]: next(all[ref] ?? {}) });
};

function apply(a: ActionRecord, o: Override | undefined): ActionRecord {
  if (!o) return a;
  const woDone = new Set(o.woDone ?? []);
  return {
    ...a,
    // A flow CAPA's status lives in the flow; only the sample ones take it from here.
    status: a.fromFlow ? a.status : (o.status ?? a.status),
    closedAt: a.fromFlow ? a.closedAt : o.status === "closed" ? (o.closedAt ?? a.closedAt) : o.status ? undefined : a.closedAt,
    ownerId: o.ownerId === undefined ? a.ownerId : (o.ownerId ?? undefined),
    workOrders: a.workOrders.map((w) => (woDone.has(w.ref) && w.status !== "complete" ? { ...w, status: "complete", doneAt: "Today" } : w)),
    history: [...a.history, ...(o.notes ?? [])],
  };
}

export function useActions() {
  const { flows, hydrated, advanceWo, closeCapa } = useThreeCases();
  const overrides = useSyncExternalStore(subscribe, read, () => EMPTY);
  const [mode] = useDataMode();

  const all = useMemo(() => allActions(flows).map((a) => apply(a, overrides[a.ref])), [flows, overrides]);

  /** Closes the action; its open work orders close with it. */
  const close = useCallback(
    (a: ActionRecord) => {
      const open = a.workOrders.filter((w) => w.status !== "complete");
      if (a.fromFlow) {
        const { eventId } = a.fromFlow;
        // One step at a time, as the flow moves them: open, in progress, complete.
        open.forEach((w) => {
          if (w.status === "open") advanceWo(eventId, w.ref);
          advanceWo(eventId, w.ref);
        });
        closeCapa(eventId);
        return;
      }
      const text = open.length ? `${a.ref} closed with ${open.length} open work order${open.length > 1 ? "s" : ""}, closed too` : `${a.ref} closed by its owner`;
      patch(a.ref, (o) => ({ ...o, status: "closed", closedAt: "Today", woDone: [...(o.woDone ?? []), ...open.map((w) => w.ref)], notes: [...(o.notes ?? []), { at: "Now", text, tone: "closed" }] }));
    },
    [advanceWo, closeCapa],
  );

  const reopen = useCallback((a: ActionRecord) => {
    if (a.fromFlow) return;
    patch(a.ref, (o) => ({ ...o, status: "open", closedAt: undefined, notes: [...(o.notes ?? []), { at: "Now", text: `${a.ref} reopened`, tone: "info" }] }));
  }, []);

  const setOwner = useCallback((a: ActionRecord, ownerId: string | null) => {
    const text = ownerId ? `Owner set to ${person(ownerId).name}` : "Owner removed";
    patch(a.ref, (o) => ({ ...o, ownerId, notes: [...(o.notes ?? []), { at: "Now", text, tone: "info" }] }));
  }, []);

  return { all, mode, hydrated, close, reopen, setOwner };
}
