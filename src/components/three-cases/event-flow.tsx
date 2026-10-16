"use client";

import { useThreeCases, type EventFlowState, type FlowUpdate, type RecordStatus, type WoStatus } from "@/contexts/ThreeCasesContext";
import { CONTROL_LABEL, asset as getAsset, event as getEvent, locationName, person } from "@/lib/three-cases/data";
import type { FlowStep, SafetyEventDemo } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardCheck,
  Clock,
  FileBarChart,
  Loader2,
  Mic,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export const SEVERITY_STYLE: Record<string, string> = {
  Critical: "bg-rose-600 text-white",
  High: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  Medium: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  Low: "bg-gray-100 text-gray-600",
};

export const SEVERITY_BAR: Record<string, string> = {
  Critical: "bg-rose-600",
  High: "bg-rose-500",
  Medium: "bg-amber-400",
  Low: "bg-gray-300",
};

const STEP_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  reported: AlertTriangle,
  capa: ClipboardCheck,
  wo: Wrench,
  osha: FileBarChart,
  verify: ShieldCheck,
};

export const STATUS_LABEL: Record<RecordStatus, string> = { open: "Open", in_review: "In review", closed: "Closed" };
const STATUS_STYLE: Record<RecordStatus, string> = {
  open: "bg-sky-50 text-sky-700",
  in_review: "bg-amber-50 text-amber-800",
  closed: "bg-gray-100 text-gray-600",
};
export const WO_LABEL: Record<WoStatus, string> = { open: "Open", in_progress: "In progress", complete: "Complete" };
const WO_STYLE: Record<WoStatus, string> = {
  open: "bg-white text-gray-600 ring-1 ring-gray-200",
  in_progress: "bg-amber-50 text-amber-800",
  complete: "bg-emerald-50 text-emerald-700",
};

export function StatusPill({ status, className }: { status: RecordStatus; className?: string }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_STYLE[status], className)}>{STATUS_LABEL[status]}</span>;
}

export function WoPill({ status }: { status: WoStatus }) {
  return <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", WO_STYLE[status])}>{WO_LABEL[status]}</span>;
}

/** Where an event stands, derived from the scripted requirements and what the flow created. */
export function stepStates(ev: SafetyEventDemo, flow?: EventFlowState) {
  const ran = Boolean(flow?.decided);
  const steps: (FlowStep & { state: "done" | "todo" | "skip" })[] = ev.steps.map((s) => {
    if (s.requirement === "done") return { ...s, state: "done" };
    if (s.requirement === "not_needed") return { ...s, state: "skip" };
    if (!ran) return { ...s, state: "todo" };
    if (s.key === "capa") return { ...s, state: flow?.capaRef ? "done" : "skip" };
    if (s.key === "wo") return { ...s, state: flow?.wos.length ? "done" : "skip" };
    if (s.key === "osha") return { ...s, state: flow?.oshaRef ? "done" : "skip" };
    return { ...s, state: "todo" };
  });
  return steps;
}

/** One short label for lists: what happens next on this event. */
export function nextStepLabel(ev: SafetyEventDemo, flow?: EventFlowState) {
  if (!flow?.decided && flow?.status !== "closed") {
    const pending = ev.steps.filter((s) => s.requirement === "required").map((s) => s.label);
    if (pending.length === 0 && ev.options.length === 0) return { label: "AI: close, nothing needed", tone: "ai" as const };
    if (pending.length === 0) return { label: "AI: CAPA recommended", tone: "ai" as const };
    return { label: `Needs ${pending.join(" + ")}`, tone: "todo" as const };
  }
  if (flow.capaStatus === "in_review") return { label: `Review ${flow.capaRef}`, tone: "todo" as const };
  if (flow.capaStatus === "open") {
    const done = flow.wos.filter((w) => w.status === "complete").length;
    return { label: `${flow.capaRef} · ${done}/${flow.wos.length} WOs done`, tone: "wait" as const };
  }
  if (flow.status !== "closed") return { label: "Close the event", tone: "todo" as const };
  return { label: "Closed", tone: "done" as const };
}

export function StepTrack({ ev, flow, size = "md", center = false }: { ev: SafetyEventDemo; flow?: EventFlowState; size?: "sm" | "md"; center?: boolean }) {
  const steps = stepStates(ev, flow);
  return (
    <ol className={cn("flex flex-wrap items-center gap-1", center && "justify-center")}>
      {steps.map((s, i) => {
        const Icon = STEP_ICON[s.key];
        return (
          <li key={s.key} className="flex items-center gap-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full font-medium",
                size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
                s.state === "done" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                s.state === "todo" && s.requirement === "required" && "bg-white text-gray-900 ring-1 ring-gray-300",
                s.state === "todo" && s.requirement !== "required" && "border border-dashed border-gray-300 bg-white text-gray-500",
                s.state === "skip" && "text-gray-300 line-through",
              )}
              title={s.state === "todo" ? s.requirement : s.state}
            >
              {s.state === "done" ? <Check className={size === "sm" ? "size-3" : "size-3.5"} /> : <Icon className={size === "sm" ? "size-3" : "size-3.5"} />}
              {s.label}
              {s.state === "todo" && s.requirement !== "required" && size === "md" ? <span className="text-[10px] font-normal">({s.requirement})</span> : null}
            </span>
            {i < steps.length - 1 ? <span className="h-px w-3 bg-gray-300" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export const recordHref = (ref: string) => `/events/records/${ref}`;

/** Event, CAPA, each work order and the OSHA entry, each with its own status. */
export function RecordChain({ ev, flow, dense = false }: { ev: SafetyEventDemo; flow: EventFlowState; dense?: boolean }) {
  const owner = person(ev.capaDefaults?.ownerId ?? "dan");
  const row = "flex items-center gap-2";
  return (
    <div className={cn("divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white text-xs", dense && "text-[11px]")}>
      <div className={cn(row, "px-3 py-2")}>
        <AlertTriangle className="size-3.5 shrink-0 text-gray-400" />
        <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Event</span>
        <span className="min-w-0 flex-1 truncate font-mono text-gray-700">{ev.ref}</span>
        <StatusPill status={flow.status} />
      </div>
      {flow.capaRef ? (
        <div className="px-3 py-2">
          <div className={row}>
            <ClipboardCheck className="size-3.5 shrink-0 text-gray-400" />
            <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">CAPA</span>
            <span className="min-w-0 flex-1 truncate">
              <Link href={recordHref(flow.capaRef)} className="font-mono font-medium text-indigo-700 hover:underline">
                {flow.capaRef}
              </Link>
              <span className="text-gray-500">
                {" "}
                · {owner.name} · due {ev.capaDefaults?.due}
              </span>
            </span>
            {flow.capaStatus ? <StatusPill status={flow.capaStatus} /> : null}
          </div>
          {flow.wos.length ? (
            <ul className="mt-1.5 space-y-1 border-l border-gray-200 pl-3 ml-[7px]">
              {flow.wos.map((w) => (
                <li key={w.ref} className={row}>
                  <Wrench className="size-3 shrink-0 text-gray-400" />
                  <Link href={recordHref(w.ref)} className="shrink-0 font-mono font-medium text-indigo-700 hover:underline">
                    {w.ref}
                  </Link>
                  <span className="min-w-0 flex-1 truncate text-gray-600" title={w.title}>
                    {w.title} · {person(w.assigneeId).name.split(" ")[0]}
                  </span>
                  <WoPill status={w.status} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {flow.oshaRef ? (
        <div className={cn(row, "px-3 py-2")}>
          <FileBarChart className="size-3.5 shrink-0 text-gray-400" />
          <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">OSHA</span>
          <span className="min-w-0 flex-1 truncate text-gray-700">
            {flow.oshaRef} · {ev.osha?.classification}
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Logged</span>
        </div>
      ) : null}
    </div>
  );
}

const UPDATE_ICON: Record<FlowUpdate["tone"], React.ComponentType<{ className?: string }>> = {
  info: CircleDot,
  progress: Clock,
  done: CheckCircle2,
  review: Bell,
  late: AlertTriangle,
  closed: Check,
};
const UPDATE_TONE: Record<FlowUpdate["tone"], string> = {
  info: "text-gray-400",
  progress: "text-amber-600",
  done: "text-emerald-600",
  review: "text-indigo-600",
  late: "text-rose-600",
  closed: "text-gray-500",
};

/** What the CAPA owner was told, newest first. */
export function UpdatesFeed({ ev, flow, limit }: { ev: SafetyEventDemo; flow: EventFlowState; limit?: number }) {
  const list = [...flow.updates].reverse().slice(0, limit);
  if (!list.length) return null;
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold text-gray-500">Updates sent to {person(ev.capaDefaults?.ownerId ?? "dan").name}</div>
      <ul className="space-y-1">
        {list.map((u, i) => {
          const Icon = UPDATE_ICON[u.tone];
          return (
            <li key={`${u.at}-${i}`} className="flex items-start gap-2 text-xs text-gray-700">
              <Icon className={cn("mt-0.5 size-3.5 shrink-0", UPDATE_TONE[u.tone])} />
              <span className="min-w-0 flex-1">{u.text}</span>
              <span className="shrink-0 text-[11px] text-gray-400">{u.at}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The next thing someone can do on a decided event: review the CAPA, push a work order, close the event. */
export function NextActions({ ev, flow, compact = false }: { ev: SafetyEventDemo; flow: EventFlowState; compact?: boolean }) {
  const { advanceWo, closeCapa, keepCapaOpen, closeEvent } = useThreeCases();
  const [followUp, setFollowUp] = useState(false);
  const [draft, setDraft] = useState("");
  const owner = person(ev.capaDefaults?.ownerId ?? "dan");
  const pending = flow.wos.filter((w) => w.status !== "complete");
  const next = pending[0];

  return (
    <div className="space-y-2">
      {flow.capaStatus === "in_review" ? (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Bell className="size-4 text-indigo-600" /> {flow.capaRef} is back with {owner.name}
          </div>
          <p className="mt-0.5 text-xs text-gray-600">
            {flow.wos.length ? `All ${flow.wos.length} work orders are done.` : "No work orders to wait for."} {ev.verifyEvidence ? `AI checked the evidence: ${ev.verifyEvidence}` : ""}
          </p>
          {followUp ? (
            <form
              className="mt-2 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                keepCapaOpen(ev.id, draft.trim());
                setDraft("");
                setFollowUp(false);
              }}
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What else needs to happen?"
                className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-indigo-300"
              />
              <button className="rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-semibold text-white">Add work order</button>
            </form>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => closeCapa(ev.id)} className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">
                <Check className="size-3.5" /> Close {flow.capaRef}
              </button>
              <button onClick={() => setFollowUp(true)} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800">
                Keep open, add an action
              </button>
            </div>
          )}
        </div>
      ) : null}

      {flow.capaStatus === "open" && next ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <span>
            Waiting on {pending.length} of {flow.wos.length} work orders. {owner.name.split(" ")[0]} gets an update on every change and the CAPA back when all
            are done.
          </span>
          <button
            onClick={() => advanceWo(ev.id)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 font-medium text-gray-800 hover:bg-gray-50"
            title="Demo control"
          >
            <Play className="size-3" /> Simulate: {next.ref} {next.status === "open" ? "started" : "completed"}
          </button>
        </div>
      ) : null}

      {flow.status !== "closed" ? (
        <div className={cn("flex flex-wrap items-center gap-2", compact ? "justify-start" : "justify-between")}>
          {!compact ? (
            <span className="text-xs text-gray-500">
              {flow.capaStatus && flow.capaStatus !== "closed" ? `The event can close now; ${flow.capaRef} stays open on its own.` : "Everything is done. Close the event."}
            </span>
          ) : null}
          <button
            onClick={() => closeEvent(ev.id, flow.capaStatus && flow.capaStatus !== "closed" ? `${flow.capaRef} stays open.` : "All records closed.")}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
          >
            <Check className="size-3.5" /> Close {ev.ref}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function EventFlowPanel({ eventId, showHeader = true }: { eventId: string; showHeader?: boolean }) {
  const ev = getEvent(eventId)!;
  const { flows, runEventFlow, closeEvent, reopenEvent } = useThreeCases();
  const flow = flows[eventId];
  const decided = Boolean(flow?.decided);
  const defaultSel = useMemo(() => (ev.steps.some((s) => s.key === "capa" && s.requirement === "required") ? [ev.options[0]?.id].filter(Boolean) : []), [ev]);
  const [selected, setSelected] = useState<string[]>(defaultSel as string[]);
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [why, setWhy] = useState(false);

  useEffect(() => {
    setSelected(defaultSel as string[]);
    setCustom([]);
    setDraft("");
    setRunning(false);
    setProgress(0);
    setWhy(false);
  }, [eventId, defaultSel]);

  const chosen = ev.options.filter((o) => selected.includes(o.id));
  const wos = chosen.filter((o) => o.workOrder);
  const sideEffects = chosen.filter((o) => o.sideEffect);
  const hasCapa = chosen.length + custom.length > 0;
  const owner = ev.capaDefaults ? person(ev.capaDefaults.ownerId) : undefined;
  const toCreate = [
    hasCapa ? `CAPA with ${chosen.length + custom.length} action${chosen.length + custom.length > 1 ? "s" : ""}${owner ? `, owner ${owner.name}, due ${ev.capaDefaults?.due}` : ""}` : null,
    ...wos.map((o) => `Work order: ${o.workOrder!.title}`),
    ev.osha ? `OSHA 300 entry, case ${ev.osha.caseNumber}` : null,
    ...sideEffects.map((o) => o.sideEffect!),
  ].filter(Boolean) as string[];

  useEffect(() => {
    if (!running) return;
    if (progress >= toCreate.length) {
      runEventFlow(eventId, selected, custom);
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setProgress((p) => p + 1), 450);
    return () => clearTimeout(t);
  }, [running, progress, toCreate.length, runEventFlow, eventId, selected, custom]);

  const a = ev.assetId ? getAsset(ev.assetId) : undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* What happened */}
      {showHeader ? (
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            <span className="font-mono">{ev.ref}</span>
            <span>·</span>
            <span>{ev.type}</span>
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_STYLE[ev.severity])}>{ev.severity}</span>
            {ev.oshaRecordable ? <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">OSHA recordable</span> : null}
            {flow ? <StatusPill status={flow.status} className="ml-auto" /> : null}
          </div>
          <h3 className="mt-1 text-lg font-semibold leading-snug text-gray-900">{ev.title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {locationName(ev.locationId)}
            {a ? ` · ${a.code} ${a.name}` : ""} · {ev.reportedBy} · {ev.reportedAt}
          </p>
        </div>
      ) : null}

      <div className="text-sm">
        <button onClick={() => setWhy((w) => !w)} className="flex w-full items-start gap-2 text-left">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-indigo-600" />
          <span className="flex-1 font-medium text-gray-900">{ev.aiRecommendation}</span>
          <span className="flex shrink-0 items-center gap-0.5 text-xs text-gray-500">
            Why <ChevronDown className={cn("size-3.5 transition", why && "rotate-180")} />
          </span>
        </button>
        {why ? <p className="mt-1 pl-6 text-xs leading-relaxed text-gray-600">{ev.aiSummary}</p> : null}
      </div>

      <StepTrack ev={ev} flow={flow} center />

      {/* Closed without a decision */}
      {flow?.status === "closed" && !flow.capaRef && !flow.oshaRef ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <span className="flex items-center gap-2">
            <Check className="size-4 text-emerald-600" /> Closed. {flow.closedNote}
          </span>
          <button onClick={() => reopenEvent(eventId)} className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800">
            <RotateCcw className="size-3" /> Reopen
          </button>
        </div>
      ) : null}

      {/* After the flow ran: what exists now, each with its own status */}
      {decided && (flow.capaRef || flow.oshaRef) ? (
        <div className="space-y-3">
          <RecordChain ev={ev} flow={flow} />
          <NextActions ev={ev} flow={flow} />
          <UpdatesFeed ev={ev} flow={flow} />
        </div>
      ) : null}

      {/* Decide */}
      {!decided && flow?.status !== "closed" ? (
        ev.options.length === 0 ? (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => closeEvent(eventId, "No action needed, confirmed by the AI triage.")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
            >
              <Check className="size-4" /> Close, nothing needed
            </button>
            <button
              onClick={() => closeEvent(eventId, "Work request sent to maintenance in the CMMS, not linked to a CAPA.")}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800"
            >
              Close and send a CMMS work request
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-0.5 text-xs">
                <span className="font-semibold text-gray-900">Suggested actions</span>
                <span className="text-gray-500">{selected.length + custom.length} selected</span>
              </div>
              {ev.options.map((o) => {
                const on = selected.includes(o.id);
                return (
                  <label
                    key={o.id}
                    title={`${CONTROL_LABEL[o.controlLevel]} · ${o.why}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 transition",
                      on ? "border-indigo-300 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <input
                      id={`opt-${eventId}-${o.id}`}
                      type="checkbox"
                      checked={on}
                      onChange={() => setSelected((s) => (s.includes(o.id) ? s.filter((x) => x !== o.id) : [...s, o.id]))}
                      className="size-4 shrink-0 accent-indigo-600"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-900">{o.title}</span>
                    <span className="shrink-0 text-[11px] text-gray-500">
                      {o.workOrder ? `WO · ${person(o.workOrder.assigneeId).name.split(" ")[0]} · ${o.workOrder.due}` : "No work order"}
                    </span>
                  </label>
                );
              })}
              {custom.map((c, i) => (
                <div key={c} className="flex items-center gap-2.5 rounded-lg border border-indigo-300 bg-indigo-50/50 px-3 py-2 text-sm text-gray-900">
                  <Check className="size-4 text-indigo-600" /> <span className="flex-1 truncate">{c}</span>
                  <button className="text-gray-400" onClick={() => setCustom((x) => x.filter((_, k) => k !== i))} aria-label="Remove">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <form
                className="flex items-center gap-2.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) setCustom((x) => [...x, draft.trim()]);
                  setDraft("");
                }}
              >
                <Plus className="size-4 text-gray-400" />
                <input
                  id={`custom-${eventId}`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write or say another action"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  className="rounded p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="Speak"
                  onClick={() => setDraft("Install a second light curtain on the operator side")}
                >
                  <Mic className="size-4" />
                </button>
              </form>
            </div>

            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <div className="mb-1 text-[11px] font-semibold text-gray-500">Run the flow creates</div>
              {toCreate.length === 0 ? (
                <p className="text-xs text-gray-500">Pick at least one action, or close the event.</p>
              ) : (
                <ul className="space-y-0.5">
                  {toCreate.map((t, i) => (
                    <li key={t} className="flex items-center gap-2 text-xs text-gray-700">
                      {running && i === progress ? (
                        <Loader2 className="size-3.5 animate-spin text-indigo-600" />
                      ) : running && i < progress ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <span className="mx-1 size-1.5 rounded-full bg-gray-400" />
                      )}
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-1 text-[11px] text-gray-400">Nothing is closed. The event goes to In review; the CAPA and each work order follow their own status.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={toCreate.length === 0 || running}
                onClick={() => {
                  setProgress(0);
                  setRunning(true);
                }}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />} Run the flow
              </button>
              <button
                onClick={() => closeEvent(eventId, "Closed without action.")}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700"
              >
                Close without action
              </button>
            </div>
          </>
        )
      ) : null}
    </div>
  );
}
