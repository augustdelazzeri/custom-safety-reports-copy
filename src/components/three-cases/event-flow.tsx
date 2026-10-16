"use client";

import { useThreeCases, type EventFlowState } from "@/contexts/ThreeCasesContext";
import { CONTROL_LABEL, asset as getAsset, event as getEvent, locationName, person } from "@/lib/three-cases/data";
import type { FlowStep, SafetyEventDemo } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Camera,
  Check,
  ClipboardCheck,
  FileBarChart,
  Loader2,
  Mic,
  Play,
  Plus,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AiTag } from "./shell";

export const SEVERITY_STYLE: Record<string, string> = {
  Critical: "bg-rose-600 text-white",
  High: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  Medium: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  Low: "bg-gray-100 text-gray-600",
};

const STEP_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  reported: AlertTriangle,
  capa: ClipboardCheck,
  wo: Wrench,
  osha: FileBarChart,
  verify: ShieldCheck,
};

/** Where an event stands, derived from the scripted requirements and what the flow created. */
export function stepStates(ev: SafetyEventDemo, flow?: EventFlowState) {
  const ran = flow && flow.status !== "open";
  const steps: (FlowStep & { state: "done" | "todo" | "skip" })[] = ev.steps.map((s) => {
    if (s.requirement === "done") return { ...s, state: "done" };
    if (s.requirement === "not_needed") return { ...s, state: "skip" };
    if (!ran) return { ...s, state: "todo" };
    if (s.key === "capa") return { ...s, state: flow?.capaRef ? "done" : "skip" };
    if (s.key === "wo") return { ...s, state: flow?.woRefs.length ? "done" : "skip" };
    if (s.key === "osha") return { ...s, state: flow?.oshaRef ? "done" : "skip" };
    return { ...s, state: "todo" };
  });
  if (ran && flow?.status !== "closed") {
    steps.push({ key: "verify", label: "Verify", requirement: "required", state: flow?.status === "verified" ? "done" : "todo" });
  }
  return steps;
}

export function nextStepLabel(ev: SafetyEventDemo, flow?: EventFlowState) {
  if (flow?.status === "closed") return { label: "Closed", tone: "done" as const };
  if (flow?.status === "verified") return { label: "Verified and closed", tone: "done" as const };
  if (flow?.status === "in_progress") return { label: `Waiting on ${flow.woRefs[0] ?? flow.capaRef}`, tone: "wait" as const };
  const pending = ev.steps.filter((s) => s.requirement === "required").map((s) => s.label);
  if (pending.length === 0 && ev.options.length === 0) return { label: "AI: close, nothing needed", tone: "ai" as const };
  if (pending.length === 0) return { label: "AI: CAPA recommended", tone: "ai" as const };
  return { label: `Needs ${pending.join(" + ")}`, tone: "todo" as const };
}

export function StepTrack({ ev, flow, size = "md" }: { ev: SafetyEventDemo; flow?: EventFlowState; size?: "sm" | "md" }) {
  const steps = stepStates(ev, flow);
  return (
    <ol className="flex flex-wrap items-center gap-1">
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

export function EventFlowPanel({ eventId, showHeader = true }: { eventId: string; showHeader?: boolean }) {
  const ev = getEvent(eventId)!;
  const { flows, runEventFlow, closeEvent, verifyEvent } = useThreeCases();
  const flow = flows[eventId];
  const ran = flow && flow.status !== "open";
  const defaultSel = useMemo(() => (ev.steps.some((s) => s.key === "capa" && s.requirement === "required") ? [ev.options[0]?.id].filter(Boolean) : []), [ev]);
  const [selected, setSelected] = useState<string[]>(defaultSel as string[]);
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    setSelected(defaultSel as string[]);
    setCustom([]);
    setDraft("");
    setRunning(false);
    setProgress(0);
  }, [eventId, defaultSel]);

  const chosen = ev.options.filter((o) => selected.includes(o.id));
  const wos = chosen.filter((o) => o.workOrder);
  const sideEffects = chosen.filter((o) => o.sideEffect);
  const hasCapa = chosen.length + custom.length > 0;
  const toCreate = [
    hasCapa ? `CAPA with ${chosen.length + custom.length} action${chosen.length + custom.length > 1 ? "s" : ""}` : null,
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
    const t = setTimeout(() => setProgress((p) => p + 1), 500);
    return () => clearTimeout(t);
  }, [running, progress, toCreate.length, runEventFlow, eventId, selected, custom]);

  const a = ev.assetId ? getAsset(ev.assetId) : undefined;
  const owner = ev.capaDefaults ? person(ev.capaDefaults.ownerId) : undefined;

  return (
    <div className="flex flex-col gap-3">
      {/* What happened */}
      <div className={cn("space-y-1.5", !showHeader && "hidden")}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-xs text-gray-500">{ev.ref}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">{ev.type}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", SEVERITY_STYLE[ev.severity])}>{ev.severity}</span>
          {ev.oshaRecordable ? <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white">OSHA recordable</span> : null}
        </div>
        <h3 className="text-base font-semibold text-gray-900">{ev.title}</h3>
        <p className="text-xs text-gray-500">
          {locationName(ev.locationId)}
          {a ? ` · ${a.code} ${a.name}` : ""} · {ev.reportedBy} · {ev.reportedAt}
        </p>
      </div>

      <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
        <div className="mb-1 flex items-center gap-2">
          <AiTag label="Triage" />
          <span className="text-xs font-semibold text-indigo-900">{ev.aiRecommendation}</span>
        </div>
        <p className="text-xs leading-relaxed text-gray-700">{ev.aiSummary}</p>
      </div>

      <StepTrack ev={ev} flow={flow} />

      {/* Done states */}
      {flow?.status === "closed" ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <Check className="size-4" /> Closed. {flow.closedNote}
        </div>
      ) : null}

      {ran && flow.status !== "closed" ? (
        <div className="space-y-2 rounded-lg border border-emerald-200 bg-white p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <Check className="size-4" /> Flow ran
          </div>
          <ul className="space-y-1 text-xs text-gray-700">
            {flow.capaRef ? (
              <li className="flex gap-2">
                <ClipboardCheck className="size-3.5 text-gray-400" /> {flow.capaRef} · owner {owner?.name} · due {ev.capaDefaults?.due} ·{" "}
                {flow.selectedOptionIds.length + flow.customActions.length} actions
              </li>
            ) : null}
            {flow.woRefs.map((ref, i) => {
              const o = ev.options.filter((x) => flow.selectedOptionIds.includes(x.id) && x.workOrder)[i];
              return (
                <li key={ref} className="flex gap-2">
                  <Wrench className="size-3.5 text-gray-400" /> {ref} · {o?.workOrder?.title} · {person(o?.workOrder?.assigneeId ?? "dan").name}
                </li>
              );
            })}
            {flow.oshaRef ? (
              <li className="flex gap-2">
                <FileBarChart className="size-3.5 text-gray-400" /> {flow.oshaRef} · {ev.osha?.classification} · draft, signed by Maria Lopez
              </li>
            ) : null}
            {ev.options
              .filter((o) => flow.selectedOptionIds.includes(o.id) && o.sideEffect)
              .map((o) => (
                <li key={o.id} className="flex gap-2">
                  <Check className="size-3.5 text-gray-400" /> {o.sideEffect}
                </li>
              ))}
            {flow.customActions.map((c) => (
              <li key={c} className="flex gap-2">
                <Check className="size-3.5 text-gray-400" /> {c} (added to the CAPA)
              </li>
            ))}
          </ul>
          {flow.status === "verified" ? (
            <div className="flex items-start gap-2 rounded-md bg-emerald-50 px-2.5 py-2 text-xs text-emerald-800">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> AI verified the fix: {ev.verifyEvidence} CAPA and event closed.
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 px-2.5 py-2 text-xs text-gray-600">
              <span>The AI texts {person(ev.options.find((o) => flow.selectedOptionIds.includes(o.id) && o.workOrder)?.workOrder?.assigneeId ?? ev.capaDefaults?.ownerId ?? "dan").name.split(" ")[0]} if it runs late and checks the completion photo.</span>
              <button
                onClick={() => {
                  setVerifying(true);
                  setTimeout(() => {
                    verifyEvent(eventId);
                    setVerifying(false);
                  }, 1000);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 font-medium text-gray-800"
              >
                {verifying ? <Loader2 className="size-3 animate-spin" /> : <Camera className="size-3" />} Simulate: work order done
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Decide */}
      {!ran && flow?.status !== "closed" ? (
        ev.options.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => closeEvent(eventId, "No action needed, confirmed by the AI triage.")} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
              <Check className="size-4" /> Close, nothing needed
            </button>
            <button onClick={() => closeEvent(eventId, "Routine work order sent to replace the fixture.")} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800">
              Send a routine work order and close
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-900">Actions the AI suggests. Pick one or more.</span>
                <span className="text-[11px] text-gray-500">{selected.length + custom.length} selected</span>
              </div>
              {ev.options.map((o) => {
                const on = selected.includes(o.id);
                return (
                  <label
                    key={o.id}
                    className={cn("flex cursor-pointer gap-2.5 rounded-lg border p-2.5 transition", on ? "border-indigo-400 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300")}
                  >
                    <input
                      id={`opt-${eventId}-${o.id}`}
                      type="checkbox"
                      checked={on}
                      onChange={() => setSelected((s) => (s.includes(o.id) ? s.filter((x) => x !== o.id) : [...s, o.id]))}
                      className="mt-0.5 size-4 accent-indigo-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900">{o.title}</span>
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", o.controlLevel === "immediate" ? "bg-rose-50 text-rose-700" : o.controlLevel === "engineering" ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600")}>
                          {CONTROL_LABEL[o.controlLevel]}
                        </span>
                      </span>
                      <span className="block text-xs text-gray-600">{o.why}</span>
                      <span className="mt-0.5 block text-[11px] text-gray-500">
                        {o.workOrder ? `Creates a work order for ${person(o.workOrder.assigneeId).name}, due ${o.workOrder.due.toLowerCase()}` : o.sideEffect}
                      </span>
                    </span>
                  </label>
                );
              })}
              {custom.map((c, i) => (
                <div key={c} className="flex items-center gap-2 rounded-lg border border-indigo-400 bg-indigo-50/50 p-2.5 text-sm text-gray-900">
                  <Check className="size-4 text-indigo-600" /> {c}
                  <button className="ml-auto text-gray-400" onClick={() => setCustom((x) => x.filter((_, k) => k !== i))} aria-label="Remove">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <form
                className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-2.5 py-2"
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
                <button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Speak" onClick={() => setDraft("Install a second light curtain on the operator side")}>
                  <Mic className="size-4" />
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-1.5 text-xs font-semibold text-gray-900">One click creates</div>
              {toCreate.length === 0 ? (
                <p className="text-xs text-gray-500">Pick at least one action, or close the event.</p>
              ) : (
                <ul className="space-y-1">
                  {toCreate.map((t, i) => (
                    <li key={t} className="flex items-center gap-2 text-xs text-gray-700">
                      {running && i === progress ? (
                        <Loader2 className="size-3.5 animate-spin text-indigo-600" />
                      ) : running && i < progress ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-gray-400" />
                      )}
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              {hasCapa && owner ? (
                <p className="mt-2 text-[11px] text-gray-500">
                  CAPA owner {owner.name} (owns {a?.code ?? "the area"}), due {ev.capaDefaults?.due} from the {ev.severity.toLowerCase()} severity policy.
                </p>
              ) : null}
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
              <button onClick={() => closeEvent(eventId, "Closed without action.")} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700">
                Close without action
              </button>
            </div>
          </>
        )
      ) : null}
    </div>
  );
}
