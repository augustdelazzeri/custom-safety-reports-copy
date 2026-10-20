"use client";

import { cn } from "@/lib/utils";
import { Check, MousePointerClick, RotateCcw } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

interface Meter {
  clicks: number;
  typed: boolean;
  /** Clicks it took, frozen when the work order was created. */
  finished: number | null;
  finish: () => void;
  reset: () => void;
}

const MeterContext = createContext<Meter | null>(null);

/** Elements whose click counts as a step: anything the person has to aim at. */
const COUNTED = "button, a, input, select, textarea, label, [role=option], [role=menuitem], [data-count]";

/**
 * Counts the clicks inside the page until the work order is created, so the variations can be
 * compared by effort. Typing is flagged, not counted. Clicks inside `[data-no-count]` are ignored
 * (the option switcher, the meter itself). Events from portals (popovers) bubble through React,
 * so they count too.
 */
export function FlowMeter({ children, className }: { children: ReactNode; className?: string }) {
  const [clicks, setClicks] = useState(0);
  const [typed, setTyped] = useState(false);
  const [finished, setFinished] = useState<number | null>(null);
  const clicksRef = useRef(0);

  const finish = useCallback(() => setFinished((f) => f ?? clicksRef.current), []);
  const reset = useCallback(() => {
    clicksRef.current = 0;
    setClicks(0);
    setTyped(false);
    setFinished(null);
  }, []);

  const value = useMemo(() => ({ clicks, typed, finished, finish, reset }), [clicks, typed, finished, finish, reset]);

  return (
    <MeterContext.Provider value={value}>
      <div
        className={className}
        onClickCapture={(e) => {
          const el = (e.target as HTMLElement).closest(COUNTED);
          if (!el || el.closest("[data-no-count]") || finished !== null) return;
          clicksRef.current += 1;
          setClicks(clicksRef.current);
        }}
        onKeyDownCapture={(e) => {
          if (finished === null && e.key.length === 1 && !e.metaKey && !e.ctrlKey) setTyped(true);
        }}
      >
        {children}
      </div>
    </MeterContext.Provider>
  );
}

export function useMeter() {
  return useContext(MeterContext);
}

/** Live click count; turns green with the final number once the work order exists. */
export function MeterBadge() {
  const m = useMeter();
  if (!m) return null;
  const done = m.finished !== null;
  return (
    <div data-no-count className="flex items-center gap-2 text-xs">
      <span
        className="rounded-lg border border-dashed border-gray-300 bg-white px-2.5 py-1.5 text-gray-600"
        title="Measured on staging on Oct 20, 2026, with the minimum the forms accept. Forklift cleaning (permit and work order): 37 clicks. Press hose (SOP, LOTO, permit and work order): 123 clicks."
      >
        <span className="font-semibold text-gray-900">Safety today:</span> 37 clicks (forklift) · 123 (press)
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium",
          done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-indigo-200 bg-indigo-50 text-indigo-800",
        )}
        title="Clicks on buttons, links, fields and options since the page opened. Typing is flagged, not counted."
      >
        {done ? <Check className="size-3.5" /> : <MousePointerClick className="size-3.5" />}
        {done ? `Work order in ${m.finished} click${m.finished === 1 ? "" : "s"}` : `${m.clicks} click${m.clicks === 1 ? "" : "s"}`}
        {m.typed ? <span className="font-normal opacity-70">+ typing</span> : null}
      </span>
      <button onClick={m.reset} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Reset the count" title="Reset the count">
        <RotateCcw className="size-3.5" />
      </button>
    </div>
  );
}
