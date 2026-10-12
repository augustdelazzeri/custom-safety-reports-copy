"use client";

// P7 building blocks: checklist item with the AI answer and the inspector's confirmation,
// the failed-item action sheet (WO or CAPA), findings outside the checklist, and the summary.

import React from "react";
import { AlertTriangle, Camera, Check, CheckCircle2, ClipboardCheck, EyeOff, HardHat, ThumbsUp, Wrench, X } from "lucide-react";
import { BAY_PINS, INSPECTION_ITEMS, INSPECTION_TEMPLATE, OUT_OF_CHECKLIST, type InspectionAnswer } from "@/lib/ai-first/sample-data";
import type { InspectionState, ItemState } from "./useInspection";
import { ConfidenceBadge } from "../AiPrimitives";
import { cn } from "@/lib/utils";

export function InspectionHeader() {
  return (
    <div className="border-b border-gray-100 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="w-5 h-5 text-blue-600" />
        <p className="text-sm font-semibold text-gray-900">{INSPECTION_TEMPLATE.name}</p>
      </div>
      <p className="text-xs text-gray-500">
        {INSPECTION_TEMPLATE.location} · {INSPECTION_TEMPLATE.regulation}
      </p>
    </div>
  );
}

const LABEL: Record<InspectionAnswer, string> = { pass: "Pass", fail: "Fail", na: "N/A", unseen: "Can't see" };

export function ItemCard({ s, state, showFrame }: { s: ItemState; state: InspectionState; showFrame?: boolean }) {
  const { item } = s;
  const action = state.actions[item.id];
  const ai = item.ai;
  return (
    <div className={cn("rounded-xl border bg-white p-3", s.answer || !s.revealed || ai === "unseen" ? "border-gray-200" : ai === "fail" ? "border-rose-200" : "border-amber-200")}>
      <p className="text-sm font-medium text-gray-900">{item.text}</p>
      {s.revealed && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          {ai === "unseen" ? (
            <span className="inline-flex items-center gap-1 text-gray-500">
              <EyeOff className="w-3.5 h-3.5" /> AI: not in the photos. Answer it yourself.
            </span>
          ) : (
            <>
              <span className={cn("font-semibold", ai === "pass" ? "text-emerald-700" : "text-rose-700")}>AI: {LABEL[ai]}</span>
              <ConfidenceBadge value={item.confidence} compact />
              <span className="text-gray-500">
                {item.evidence}
                {item.pinId ? ` · pin ${item.pinId}` : ""}
                {showFrame && item.frame ? ` · at ${item.frame}` : ""}
              </span>
            </>
          )}
        </div>
      )}
      <div className="mt-2 flex items-center gap-1.5">
        {(["pass", "fail", "na"] as const).map((a) => (
          <button
            key={a}
            onClick={() => state.confirm(item.id, a)}
            className={cn(
              "relative rounded-lg border px-3 py-1.5 text-xs font-semibold",
              s.answer === a
                ? a === "pass"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : a === "fail"
                  ? "border-rose-600 bg-rose-600 text-white"
                  : "border-gray-700 bg-gray-700 text-white"
                : "border-gray-200 text-gray-700 hover:bg-gray-50",
              !s.answer && s.revealed && ai === a && "ring-2 ring-violet-300"
            )}
          >
            {LABEL[a]}
          </button>
        ))}
        {s.answer && !s.changed && ai !== "unseen" && <span className="ml-1 inline-flex items-center gap-1 text-[11px] text-emerald-700"><Check className="w-3 h-3" /> Confirmed</span>}
        {s.changed && <span className="ml-1 text-[11px] text-blue-700">Changed by you</span>}
      </div>
      {action && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-medium text-orange-800">
          {action.kind === "wo" ? <Wrench className="w-3 h-3" /> : <HardHat className="w-3 h-3" />} {action.id} created
        </p>
      )}
      {s.answer === "fail" && !action && (
        <button onClick={() => state.setSheetFor(item.id)} className="mt-2 text-xs font-medium text-rose-700 underline">
          Create an action for this
        </button>
      )}
    </div>
  );
}

export function FailSheet({ state }: { state: InspectionState }) {
  const id = state.sheetFor;
  if (!id) return null;
  const item = INSPECTION_ITEMS.find((i) => i.id === id)!;
  const repeat = (item.failHistory ?? 0) >= 3;
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/30">
      <div className="w-full space-y-3 rounded-t-2xl bg-white p-4 shadow-2xl">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <p className="text-sm font-semibold text-gray-900">Failed: {item.text}</p>
          <button onClick={() => state.setSheetFor(null)} className="ml-auto rounded p-1 text-gray-500" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        {repeat && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
            This item failed {item.failHistory} times in the last 60 days. Another work order may not fix it. Consider a CAPA to find the cause.
          </p>
        )}
        <div className="rounded-lg border border-gray-200 p-3 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">AI-drafted work order</p>
          <p className="mt-1 font-medium text-gray-900">Fix: {item.text.toLowerCase()}</p>
          <p className="text-xs text-gray-500">
            {INSPECTION_TEMPLATE.location} · Priority {id === "q7" ? "high" : "medium"} · Photo and pin attached
          </p>
        </div>
        <div className="flex gap-2">
          {repeat ? (
            <>
              <button onClick={() => state.createCapa(id)} className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white">
                Create CAPA
              </button>
              <button onClick={() => state.createWorkOrder(id)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-800">
                Just the work order
              </button>
            </>
          ) : (
            <>
              <button onClick={() => state.createWorkOrder(id)} className="flex-1 rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white">
                Create work order
              </button>
              <button onClick={() => state.setSheetFor(null)} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700">
                Later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExtraFindings() {
  const positives = BAY_PINS.filter((p) => p.kind === "positive");
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Not in the checklist</p>
      {OUT_OF_CHECKLIST.map((f) => (
        <div key={f.pinId} className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">{f.pinId}</span>
          <span className="flex-1 text-amber-900">{f.text}</span>
          <ConfidenceBadge value={f.confidence} compact />
        </div>
      ))}
      <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Done right</p>
      {positives.map((p) => (
        <div key={p.id} className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <ThumbsUp className="w-4 h-4" /> {p.label}
        </div>
      ))}
    </div>
  );
}

export function SubmitBar({ state }: { state: InspectionState }) {
  const left = state.total - state.confirmed;
  return (
    <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-white px-4 py-3">
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${(state.confirmed / state.total) * 100}%` }} />
      </div>
      <button
        onClick={state.submit}
        disabled={left > 0}
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:bg-gray-300"
      >
        {left > 0 ? `Confirm ${left} more item${left > 1 ? "s" : ""} to submit` : "Submit inspection"}
      </button>
    </div>
  );
}

export function InspectionSummary({ state }: { state: InspectionState }) {
  const changed = state.items.filter((s) => s.changed).length;
  const actions = Object.values(state.actions);
  return (
    <div className="space-y-5 p-5">
      <div className="text-center">
        <CheckCircle2 className="mx-auto w-12 h-12 text-emerald-600" />
        <h2 className="mt-2 text-lg font-semibold text-gray-900">Inspection submitted</h2>
        <p className="text-sm text-gray-500">{INSPECTION_TEMPLATE.name}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-gray-200 p-3">
          <p className="text-2xl font-semibold tabular-nums text-gray-900">{state.score}%</p>
          <p className="text-[11px] text-gray-500">Score (confirmed items)</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-3">
          <p className="text-2xl font-semibold tabular-nums text-rose-600">{state.fails}</p>
          <p className="text-[11px] text-gray-500">Failed items</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-3">
          <p className="text-2xl font-semibold tabular-nums text-orange-600">{actions.length}</p>
          <p className="text-[11px] text-gray-500">Actions created</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        The AI pre-answered {state.items.filter((s) => s.item.ai !== "unseen").length} of {state.total} items. You changed {changed}. Your corrections are logged and used to improve the next suggestions.
      </p>
      {actions.length > 0 && (
        <ul className="space-y-1 text-sm">
          {actions.map((a) => (
            <li key={a.id + a.kind} className="flex items-center gap-2 text-gray-700">
              {a.kind === "wo" ? <Wrench className="w-4 h-4 text-orange-600" /> : <HardHat className="w-4 h-4 text-violet-600" />} {a.id}
            </li>
          ))}
        </ul>
      )}
      <a href="/ai-first/inbox" className="block text-center text-sm font-medium text-violet-700 underline">
        Repeat failures go to the supervisor queue (P8)
      </a>
    </div>
  );
}

export function CaptureTips({ video }: { video?: boolean }) {
  const tips = video
    ? ["Walk slowly, about one step per second", "Pause 2–3 s on extinguishers, exits and edges", "Say what you see; the AI listens too"]
    : ["Start with one wide shot of the bay", "Then close-ups of anything doubtful", "Keep the light behind you"];
  return (
    <ul className="space-y-1.5">
      {tips.map((t) => (
        <li key={t} className="flex items-center gap-2 text-xs text-gray-600">
          <Camera className="w-3.5 h-3.5 text-blue-600" /> {t}
        </li>
      ))}
    </ul>
  );
}
