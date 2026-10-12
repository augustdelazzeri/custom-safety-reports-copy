"use client";

// Trust controls shared by every AI-first flow (TR-2 in the proposal):
// confidence per field, link to the source, edit or clear each field, revert to the AI version,
// a visible "draft" state, staged progress while the AI works, and photos with numbered pins.

import React, { useEffect, useRef, useState } from "react";
import { Check, CornerUpLeft, Info, Loader2, Pencil, Sparkles, X } from "lucide-react";
import type { AiFieldValue, Pin } from "@/lib/ai-first/types";
import { cn } from "@/lib/utils";

export function confidenceTone(c: number) {
  if (c >= 0.8) return { label: "High", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" };
  if (c >= 0.6) return { label: "Medium", cls: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-500" };
  return { label: "Low", cls: "bg-rose-50 text-rose-700 border-rose-200", bar: "bg-rose-500" };
}

export function ConfidenceBadge({ value, compact }: { value: number; compact?: boolean }) {
  const t = confidenceTone(value);
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap", t.cls)}
      title={`AI confidence ${Math.round(value * 100)}%`}
    >
      {compact ? `${Math.round(value * 100)}%` : `${t.label} · ${Math.round(value * 100)}%`}
    </span>
  );
}

export function AiBadge({ children = "AI draft" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
      <Sparkles className="w-3 h-3" /> {children}
    </span>
  );
}

interface AiFieldProps {
  field: AiFieldValue;
  onChange: (next: AiFieldValue) => void;
  dense?: boolean;
}

// One proposed field: edit, clear, or go back to the AI version. Never an "accept all".
export function AiField({ field, onChange, dense }: AiFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field.value);
  const low = field.confidence < 0.65;

  const save = () => {
    onChange({ ...field, value: draft, edited: draft !== field.aiValue, cleared: false });
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-white",
        dense ? "p-2.5" : "p-3",
        field.cleared ? "border-dashed border-gray-300 bg-gray-50" : low ? "border-amber-300" : "border-gray-200"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{field.label}</span>
        {!field.cleared && !field.edited && <ConfidenceBadge value={field.confidence} compact={dense} />}
        {field.edited && !field.cleared && (
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5">Edited by you</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {(field.edited || field.cleared) && (
            <button
              onClick={() => {
                onChange({ ...field, value: field.aiValue, edited: false, cleared: false });
                setDraft(field.aiValue);
              }}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              title="Revert to the AI version"
              aria-label={`Revert ${field.label} to the AI version`}
            >
              <CornerUpLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {!field.cleared && !editing && (
            <button
              onClick={() => {
                setDraft(field.value);
                setEditing(true);
              }}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              aria-label={`Edit ${field.label}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {!field.cleared && (
            <button
              onClick={() => onChange({ ...field, cleared: true })}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              aria-label={`Clear ${field.label}`}
              title="Clear this field"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {field.cleared ? (
        <p className="mt-1 text-sm text-gray-400 italic">Cleared. The supervisor will fill it in.</p>
      ) : editing ? (
        <div className="mt-1.5 space-y-2">
          {field.multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          ) : (
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          )}
          <div className="flex gap-2">
            <button onClick={save} className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white">
              <Check className="w-3 h-3" /> Save
            </button>
            <button onClick={() => setEditing(false)} className="rounded-md px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className={cn("mt-1 text-gray-900", dense ? "text-sm" : "text-[15px]")}>{field.value}</p>
      )}

      {!field.cleared && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-500">
          <Info className="w-3 h-3 shrink-0" /> From: {field.source}
        </p>
      )}
      {low && !field.cleared && !field.edited && (
        <p className="mt-1 text-[11px] font-medium text-amber-700">Not sure. Please check this one.</p>
      )}
    </div>
  );
}

const PIN_STYLE: Record<Pin["kind"], string> = {
  hazard: "bg-rose-600 ring-rose-200",
  review: "bg-amber-500 ring-amber-200",
  positive: "bg-emerald-600 ring-emerald-200",
};

export function PhotoWithPins({
  src,
  pins,
  activePin,
  onPinClick,
  dismissed = [],
  className,
}: {
  src: string;
  pins: Pin[];
  activePin?: number | null;
  onPinClick?: (id: number) => void;
  dismissed?: number[];
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-gray-900", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Captured photo" className="w-full h-auto block" />
      {pins.map((p) => (
        <button
          key={p.id}
          onClick={() => onPinClick?.(p.id)}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ring-4 shadow transition-transform",
            PIN_STYLE[p.kind],
            activePin === p.id && "scale-125",
            dismissed.includes(p.id) && "opacity-30"
          )}
          aria-label={`Finding ${p.id}: ${p.label}`}
        >
          {p.id}
        </button>
      ))}
    </div>
  );
}

export function PinLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-gray-600">
      <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Hazard</span>
      <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Needs review</span>
      <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Positive</span>
    </div>
  );
}

// Staged progress so the wait reads as work, not as a spinner.
// onDone runs from the timer, so callers can move to the next step without an extra effect.
export function useStagedProgress(steps: string[], stepMs = 700, start = true, onDone?: () => void) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (!start) return;
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      if (i >= steps.length) {
        window.clearInterval(timer);
        setDone(true);
        onDoneRef.current?.();
      } else {
        setIndex(i);
      }
    }, stepMs);
    return () => {
      window.clearInterval(timer);
      setIndex(0);
      setDone(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  return { index, done };
}

export function AiWorking({ steps, index, className }: { steps: string[]; index: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((s, i) => (
        <div key={s} className={cn("flex items-center gap-2 text-sm", i > index ? "text-gray-300" : "text-gray-700")}>
          {i < index ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : i === index ? (
            <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
          ) : (
            <span className="w-4 h-4 rounded-full border border-gray-200" />
          )}
          {s}
        </div>
      ))}
    </div>
  );
}

export function AiDisclaimer({ children }: { children?: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] leading-snug text-gray-500">
      <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-violet-500" />
      {children ?? "Drafted by AI from what you sent. Nothing is saved until you submit, and a supervisor reviews every report."}
    </p>
  );
}
