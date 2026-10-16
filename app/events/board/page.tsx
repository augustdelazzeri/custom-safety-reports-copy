"use client";

import { EventFlowPanel, SEVERITY_BAR, StatusPill, WoPill } from "@/components/three-cases/event-flow";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell, TapCompare } from "@/components/three-cases/shell";
import { useThreeCases, type RecordStatus } from "@/contexts/ThreeCasesContext";
import { EVENTS, asset as getAsset, locationName, person } from "@/lib/three-cases/data";
import type { SafetyEventDemo } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { Bell, Check, GripVertical, Loader2, PanelRight, Play, SquareCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

type Mode = "panel" | "card";
const MODE_KEY = "ehs-prototype-board-mode";

const COLUMNS: { key: RecordStatus; title: string; hint: string; dot: string }[] = [
  { key: "open", title: "Open", hint: "Needs a decision", dot: "bg-sky-500" },
  { key: "in_review", title: "In review", hint: "Records created; CAPA and work orders follow their own status", dot: "bg-amber-500" },
  { key: "closed", title: "Closed this week", hint: "The CAPA can still be open", dot: "bg-gray-400" },
];

// Older events that give the board a realistic spread. They are read-only.
const HISTORY: { id: string; status: RecordStatus; title: string; severity: SafetyEventDemo["severity"]; meta: string; note: string }[] = [
  { id: "h1", status: "in_review", title: "Pallet fell from rack, row A", severity: "High", meta: "Incident · Warehouse · RK-A", note: "CAPA-0042 Open · 0/1 WOs" },
  { id: "h2", status: "closed", title: "Blocked fire exit at Dock door 4", severity: "High", meta: "Hazard · Loading Dock", note: "Cleared on the spot, no CAPA" },
  { id: "h3", status: "closed", title: "Spill near the charging station", severity: "Low", meta: "Observation · Warehouse", note: "Cleaned on the spot, no CAPA" },
];

const defaultSel = (e: SafetyEventDemo) => (e.steps.some((s) => s.key === "capa" && s.requirement === "required") && e.options[0] ? [e.options[0].id] : []);

export default function EventsBoardPage() {
  const { flows, runEventFlow, closeEvent, reopenEvent } = useThreeCases();
  const [mode, setMode] = useState<Mode>("card");
  const [open, setOpen] = useState<string | null>(null);
  const [sel, setSel] = useState<Record<string, string[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [over, setOver] = useState<RecordStatus | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODE_KEY);
      if (saved === "panel" || saved === "card") setMode(saved);
    } catch {
      // Blocked storage: keep the default.
    }
  }, []);

  const pickMode = (m: Mode) => {
    setMode(m);
    try {
      window.localStorage.setItem(MODE_KEY, m);
    } catch {
      // Ignore: the switch still works for this visit.
    }
  };

  const say = (text: string) => {
    setToast(text);
    setTimeout(() => setToast((t) => (t === text ? null : t)), 4000);
  };

  const selected = (e: SafetyEventDemo) => sel[e.id] ?? defaultSel(e);

  const run = (e: SafetyEventDemo) => {
    const ids = selected(e);
    if (!ids.length) {
      say(`Pick at least one action on ${e.ref}, or close it.`);
      return;
    }
    setRunning(e.id);
    setTimeout(() => {
      runEventFlow(e.id, ids, []);
      setRunning(null);
      say(`${e.ref} moved to In review. CAPA and work orders created; nothing closed.`);
    }, 700);
  };

  /** Dropping a card on a column is the same as the matching button. */
  const move = (id: string, to: RecordStatus) => {
    const e = EVENTS.find((x) => x.id === id);
    const f = flows[id];
    if (!e || !f || f.status === to) return;
    if (to === "in_review") {
      if (f.status === "closed") {
        reopenEvent(id);
        say(`${e.ref} reopened.`);
        return;
      }
      if (!e.options.length) {
        say(`${e.ref} has nothing to create. Close it instead.`);
        return;
      }
      run(e);
      return;
    }
    if (to === "closed") {
      closeEvent(id, f.decided ? (f.capaStatus && f.capaStatus !== "closed" ? `${f.capaRef} stays open.` : "All records closed.") : "Closed without action.");
      say(f.capaStatus && f.capaStatus !== "closed" ? `${e.ref} closed. ${f.capaRef} stays open on its own.` : `${e.ref} closed.`);
      return;
    }
    if (to === "open") {
      if (f.capaRef) {
        say(`${e.ref} already has ${f.capaRef}. It can go back to In review, not Open.`);
        return;
      }
      reopenEvent(id);
      say(`${e.ref} reopened.`);
    }
  };

  return (
    <PageShell title="Events" mainClassName="flex flex-col gap-3 overflow-hidden p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />
        <TapCompare today="open each event to see where it is" todayDetail="no view by status" here="decide from the board" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Decide in</span>
          <div className="flex rounded-md border border-gray-200 bg-white p-0.5">
            {(
              [
                ["card", "On the card", SquareCheck],
                ["panel", "Side panel", PanelRight],
              ] as const
            ).map(([m, label, Icon]) => (
              <button
                key={m}
                onClick={() => pickMode(m)}
                className={cn("flex items-center gap-1 rounded px-2.5 py-1 font-medium", mode === m ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100")}
              >
                <Icon className="size-3.5" /> {label}
              </button>
            ))}
          </div>
          <span className="hidden md:inline">· Drag a card to change its status</span>
        </div>
        {toast ? (
          <span className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
            <Check className="size-3.5" /> {toast}
          </span>
        ) : null}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
        {COLUMNS.map((col) => {
          const live = EVENTS.filter((e) => flows[e.id]?.status === col.key);
          const past = HISTORY.filter((h) => h.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(ev) => {
                ev.preventDefault();
                setOver(col.key);
              }}
              onDragLeave={() => setOver((o) => (o === col.key ? null : o))}
              onDrop={(ev) => {
                ev.preventDefault();
                const id = ev.dataTransfer.getData("text/plain") || dragId;
                setOver(null);
                setDragId(null);
                if (id) move(id, col.key);
              }}
              className={cn(
                "flex min-h-0 flex-col rounded-2xl bg-gray-100/70 p-2 transition",
                over === col.key && dragId && "bg-indigo-50 ring-2 ring-indigo-300",
              )}
            >
              <div className="flex items-center gap-2 px-2 pt-1">
                <span className={cn("size-2 rounded-full", col.dot)} />
                <span className="text-sm font-semibold text-gray-900">{col.title}</span>
                <span className="rounded-full bg-white px-1.5 text-xs font-medium text-gray-600">{live.length + past.length}</span>
              </div>
              <p className="px-2 pb-2 text-[11px] text-gray-500">{col.hint}</p>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {live.map((e) => (
                  <BoardCard
                    key={e.id}
                    e={e}
                    mode={mode}
                    selected={selected(e)}
                    onToggle={(optId) =>
                      setSel((s) => {
                        const cur = s[e.id] ?? defaultSel(e);
                        return { ...s, [e.id]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
                      })
                    }
                    expanded={expanded === e.id}
                    onExpand={() => setExpanded((x) => (x === e.id ? null : e.id))}
                    running={running === e.id}
                    onRun={() => run(e)}
                    onClose={() => move(e.id, "closed")}
                    onOpen={() => setOpen(e.id)}
                    onDragStart={(ev) => {
                      ev.dataTransfer.setData("text/plain", e.id);
                      setDragId(e.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOver(null);
                    }}
                    dragging={dragId === e.id}
                  />
                ))}
                {past.map((h) => (
                  <div key={h.id} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-3 pl-4">
                    <span className={cn("absolute inset-y-0 left-0 w-1 opacity-60", SEVERITY_BAR[h.severity])} />
                    <div className="text-sm font-medium leading-snug text-gray-700">{h.title}</div>
                    <div className="mt-0.5 truncate text-[11px] text-gray-500">{h.meta}</div>
                    <div className="mt-1.5 text-[11px] text-gray-500">{h.note}</div>
                  </div>
                ))}
                {live.length + past.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400">Drop a card here</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={() => setOpen(null)}>
          <div className="h-full w-[560px] max-w-full overflow-y-auto bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex justify-end">
              <button onClick={() => setOpen(null)} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <EventFlowPanel eventId={open} />
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

/**
 * Kept small on purpose: what it is, where, and, on the card, the decision. The description is
 * one click away for when the title is not enough.
 */
function BoardCard({
  e,
  mode,
  selected,
  onToggle,
  expanded,
  onExpand,
  running,
  onRun,
  onClose,
  onOpen,
  onDragStart,
  onDragEnd,
  dragging,
}: {
  e: SafetyEventDemo;
  mode: Mode;
  selected: string[];
  onToggle: (optId: string) => void;
  expanded: boolean;
  onExpand: () => void;
  running: boolean;
  onRun: () => void;
  onClose: () => void;
  onOpen: () => void;
  onDragStart: (ev: React.DragEvent) => void;
  onDragEnd: () => void;
  dragging: boolean;
}) {
  const { flows } = useThreeCases();
  const f = flows[e.id];
  const a = e.assetId ? getAsset(e.assetId) : undefined;
  const onCard = mode === "card";
  const done = f.wos.filter((w) => w.status === "complete").length;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onCard ? undefined : onOpen}
      data-card={e.id}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 pl-4 shadow-sm transition",
        !onCard && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
        dragging && "opacity-40",
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", SEVERITY_BAR[e.severity])} />
      <GripVertical className="absolute right-1.5 top-2.5 size-3.5 text-gray-300 opacity-0 transition group-hover:opacity-100" />

      <button onClick={onCard ? onExpand : undefined} className="block w-full pr-3 text-left">
        <div className="text-sm font-medium leading-snug text-gray-900">{e.title}</div>
        <div className="mt-0.5 truncate text-[11px] text-gray-500">
          {e.type} · {a ? a.code : locationName(e.locationId)} · {e.reportedAt}
          {e.oshaRecordable ? <span className="ml-1 font-semibold text-rose-600">· OSHA</span> : null}
        </div>
      </button>
      {expanded ? <p className="mt-1.5 rounded-md bg-gray-50 px-2 py-1.5 text-xs leading-relaxed text-gray-700">{e.description}</p> : null}

      {/* Decide on the card */}
      {onCard && f.status === "open" ? (
        <div className="mt-2 space-y-1">
          {e.options.map((o) => (
            <label key={o.id} title={o.why} className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
              <input type="checkbox" checked={selected.includes(o.id)} onChange={() => onToggle(o.id)} className="size-3.5 shrink-0 accent-indigo-600" />
              <span className="truncate">{o.title}</span>
            </label>
          ))}
          <div className="flex items-center gap-1.5 pt-1">
            {e.options.length ? (
              <button
                onClick={onRun}
                disabled={running || selected.length === 0}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
              >
                {running ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3" />} Run
              </button>
            ) : null}
            <button onClick={onClose} className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
              {e.options.length ? "Close" : "Close, nothing needed"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Records, each with its own status */}
      {f.capaRef ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600">
          <span className="font-mono">{f.capaRef}</span>
          {f.capaStatus ? <StatusPill status={f.capaStatus} className="px-1.5 text-[10px]" /> : null}
          {f.wos.length ? (
            <span className="inline-flex items-center gap-1">
              · {done}/{f.wos.length} WOs
              {f.wos.length === 1 ? <WoPill status={f.wos[0].status} /> : null}
            </span>
          ) : null}
          {f.capaStatus === "in_review" ? (
            <span className="inline-flex items-center gap-0.5 font-medium text-indigo-700">
              <Bell className="size-3" /> back with {person(e.capaDefaults?.ownerId ?? "dan").name.split(" ")[0]}
            </span>
          ) : null}
        </div>
      ) : f.status === "closed" ? (
        <div className="mt-1.5 text-[11px] text-gray-500">{f.closedNote}</div>
      ) : null}

      {onCard && f.status === "in_review" ? (
        <div className="mt-2 flex gap-1.5">
          <button onClick={onClose} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
            <Check className="size-3" /> Close event
          </button>
          <button onClick={onOpen} className="rounded-md px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50">
            Details
          </button>
        </div>
      ) : null}
    </div>
  );
}
