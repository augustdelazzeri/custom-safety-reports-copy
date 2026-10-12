"use client";

// P8 · Supervisor queue variants. The AI pre-processes every item; the person sees exceptions first.

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Keyboard, RotateCcw, Sparkles } from "lucide-react";
import { useAiFirst } from "@/contexts/AiFirstContext";
import type { InboxItem } from "@/lib/ai-first/types";
import { AUTO_HANDLED } from "@/lib/ai-first/sample-data";
import { ConfidenceBadge } from "../AiPrimitives";
import { InboxDecision, KindChip, RISK_ORDER } from "./InboxDecision";
import { cn } from "@/lib/utils";

function useSortedInbox() {
  const { inbox } = useAiFirst();
  return useMemo(
    () => [...inbox].sort((a, b) => Number(!!a.done) - Number(!!b.done) || RISK_ORDER[a.risk] - RISK_ORDER[b.risk] || a.confidence - b.confidence),
    [inbox]
  );
}

export function TimeSaved() {
  const { inbox } = useAiFirst();
  const done = inbox.filter((i) => i.done).length;
  const minutes = AUTO_HANDLED.length * 3 + done * 4 + 85; // 85 min carried from earlier this week (sample)
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" title="Estimate: 3 min per task the AI handled, 4 min per pre-filled decision">
      <Clock className="w-4 h-4" /> AI saved you about <span className="font-semibold">{(minutes / 60).toFixed(1)} h</span> this week
    </div>
  );
}

function AutoHandled() {
  const [undone, setUndone] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-4 py-3 text-left">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium text-gray-900">Handled by AI today ({AUTO_HANDLED.length - undone.length})</span>
        <span className="text-xs text-gray-500">Reversible actions only. Undo anything.</span>
        <ChevronRight className={cn("ml-auto w-4 h-4 text-gray-400 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <ul className="divide-y divide-gray-100 border-t border-gray-100">
          {AUTO_HANDLED.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-4 py-2 text-sm">
              <span className="w-12 text-xs text-gray-400">{a.at}</span>
              <span className={cn("flex-1", undone.includes(a.id) ? "text-gray-400 line-through" : "text-gray-700")}>{a.text}</span>
              {!undone.includes(a.id) ? (
                <button onClick={() => setUndone([...undone, a.id])} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                  <RotateCcw className="w-3 h-3" /> Undo
                </button>
              ) : (
                <span className="text-xs text-gray-400">Undone</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// A · Exceptions first: needs-a-person items on top, low-risk items accepted in a batch.
export function ExceptionsVariant() {
  const items = useSortedInbox();
  const { updateInboxItem } = useAiFirst();
  const open = items.filter((i) => !i.done);
  const decisions = open.filter((i) => i.needsPerson);
  const lowRisk = open.filter((i) => !i.needsPerson);
  const [selectedId, setSelectedId] = useState<string | null>(decisions[0]?.id ?? null);
  const [batch, setBatch] = useState<string[]>(lowRisk.map((i) => i.id));
  const selected = items.find((i) => i.id === selectedId) ?? decisions[0] ?? null;

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
        <span className="text-sm text-gray-500">
          {decisions.length} need your decision · {lowRisk.length} low risk · {items.filter((i) => i.done).length} done
        </span>
        <div className="ml-auto">
          <TimeSaved />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="rounded-xl border border-gray-200 bg-white">
            <p className="border-b border-gray-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Needs your decision</p>
            {decisions.length === 0 && <p className="px-4 py-6 text-sm text-gray-500">Nothing waiting. Nice.</p>}
            <ul>
              {decisions.map((i) => (
                <li key={i.id}>
                  <button
                    onClick={() => setSelectedId(i.id)}
                    className={cn("w-full border-l-4 px-4 py-3 text-left hover:bg-gray-50", selected?.id === i.id ? "border-violet-600 bg-violet-50/40" : "border-transparent", i.risk === "high" && selected?.id !== i.id && "border-rose-400")}
                  >
                    <div className="flex items-center gap-2">
                      <KindChip kind={i.kind} />
                      <ConfidenceBadge value={i.confidence} compact />
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">{i.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{i.reason}</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {lowRisk.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white">
              <p className="border-b border-gray-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Low risk · accept together</p>
              <ul className="divide-y divide-gray-100">
                {lowRisk.map((i) => (
                  <li key={i.id} className="flex items-start gap-3 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={batch.includes(i.id)}
                      onChange={(e) => setBatch(e.target.checked ? [...batch, i.id] : batch.filter((x) => x !== i.id))}
                      className="mt-1 h-4 w-4 accent-violet-600"
                      aria-label={`Include ${i.title}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900">{i.title}</p>
                      <p className="text-xs text-gray-500">{i.suggestion}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-2.5">
                <button
                  disabled={batch.length === 0}
                  onClick={() => {
                    batch.forEach((id) => updateInboxItem(id, { done: "approved" }));
                    setBatch([]);
                  }}
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
                >
                  Accept {batch.length} selected
                </button>
                <span className="text-[11px] text-gray-500">Severity, OSHA and CAPA items never go in a batch.</span>
              </div>
            </section>
          )}

          <AutoHandled />
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          {selected ? (
            <InboxDecision
              key={selected.id}
              item={selected}
              onDone={() => {
                const next = decisions.find((d) => d.id !== selected.id);
                if (next) setSelectedId(next.id);
              }}
            />
          ) : (
            <p className="text-sm text-gray-500">Select an item.</p>
          )}
        </section>
      </div>
    </div>
  );
}

// B · One at a time: a triage deck with keyboard shortcuts.
export function CardsVariant() {
  const items = useSortedInbox();
  const queue = items.filter((i) => !i.done);
  const [index, setIndex] = useState(0);
  const total = items.length;
  const current = queue[Math.min(index, queue.length - 1)];
  const { updateInboxItem } = useAiFirst();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "s" || e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, Math.max(queue.length - 1, 0)));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      if (e.key === "a" && current && !current.needsPerson) updateInboxItem(current.id, { done: "approved" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queue.length, current, updateInboxItem]);

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Triage</h2>
        <span className="text-sm text-gray-500">
          {total - queue.length} of {total} done
        </span>
        <div className="ml-auto">
          <TimeSaved />
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-violet-600 transition-all" style={{ width: `${((total - queue.length) / Math.max(total, 1)) * 100}%` }} />
      </div>
      {current ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <InboxDecision key={current.id} item={current} />
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
            <button onClick={() => setIndex((i) => Math.max(i - 1, 0))} className="hover:text-gray-900">
              ← Previous
            </button>
            <span className="flex items-center gap-1">
              <Keyboard className="w-3.5 h-3.5" /> S or → skip · A accept (low risk only)
            </span>
            <button onClick={() => setIndex((i) => Math.min(i + 1, Math.max(queue.length - 1, 0)))} className="hover:text-gray-900">
              Skip →
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <CheckCircle2 className="mx-auto w-10 h-10 text-emerald-600" />
          <p className="mt-2 font-medium text-gray-900">Inbox zero</p>
        </div>
      )}
      <AutoHandled />
    </div>
  );
}

// C · Today's inbox with one extra column: the AI suggestion and an accept button.
export function TableVariant() {
  const items = useSortedInbox();
  const [expanded, setExpanded] = useState<string | null>(null);
  const { updateInboxItem } = useAiFirst();

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Inbox · Action required</h2>
        <div className="ml-auto">
          <TimeSaved />
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Item</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Location</th>
              <th className="px-4 py-2.5 font-medium">Received</th>
              <th className="px-4 py-2.5 font-medium">
                <span className="inline-flex items-center gap-1 text-violet-700">
                  <Sparkles className="w-3.5 h-3.5" /> AI suggestion
                </span>
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((i: InboxItem) => (
              <React.Fragment key={i.id}>
                <tr className={cn("hover:bg-gray-50", i.done && "opacity-50")}>
                  <td className="px-4 py-3">
                    <button onClick={() => setExpanded(expanded === i.id ? null : i.id)} className="text-left font-medium text-gray-900 hover:underline">
                      {i.title}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <KindChip kind={i.kind} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{i.location}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{i.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800">{i.suggestion}</span>
                      <ConfidenceBadge value={i.confidence} compact />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {i.done ? (
                      <span className="text-xs text-emerald-700">Done</span>
                    ) : i.needsPerson ? (
                      <button onClick={() => setExpanded(i.id)} className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-800">
                        Review
                      </button>
                    ) : (
                      <button onClick={() => updateInboxItem(i.id, { done: "approved" })} className="rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white">
                        Accept
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === i.id && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50 px-4 py-4">
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <InboxDecision item={i} onDone={() => setExpanded(null)} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <AutoHandled />
    </div>
  );
}
