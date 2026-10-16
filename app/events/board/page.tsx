"use client";

import { EventFlowPanel, SEVERITY_STYLE, StepTrack } from "@/components/three-cases/event-flow";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { Avatar, PageShell, TapCompare } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { EVENTS, asset as getAsset, locationName, person } from "@/lib/three-cases/data";
import type { SafetyEventDemo } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { Camera, Check, Clock, Sparkles, X } from "lucide-react";
import { useState } from "react";

type Stage = "decide" | "progress" | "verify" | "closed";

const STAGES: { key: Stage; title: string; hint: string; dot: string }[] = [
  { key: "decide", title: "Decide", hint: "AI plan ready, needs your pick", dot: "bg-gray-900" },
  { key: "progress", title: "In progress", hint: "CAPA and work orders open", dot: "bg-amber-500" },
  { key: "verify", title: "Verifying", hint: "AI checks the completion photo", dot: "bg-indigo-500" },
  { key: "closed", title: "Closed this week", hint: "Verified or closed with a reason", dot: "bg-emerald-500" },
];

// Older events that give the board a realistic spread. They are read-only.
const HISTORY: { id: string; stage: Stage; title: string; severity: SafetyEventDemo["severity"]; where: string; note: string; ownerId: string; due?: string }[] = [
  { id: "h1", stage: "progress", title: "Ladder with a cracked rung in the shop", severity: "Medium", where: "Maintenance Shop", note: "CAPA-0041 · WO-1048 replace ladder", ownerId: "dan", due: "Due Oct 18" },
  { id: "h2", stage: "progress", title: "Pallet fell from rack, row A", severity: "High", where: "Warehouse · RK-A", note: "CAPA-0042 · WO-1050 rack beam inspection", ownerId: "jo", due: "Due Oct 19" },
  { id: "h3", stage: "verify", title: "Blocked fire exit at Dock door 4", severity: "High", where: "Loading Dock", note: "WO-1049 done with photo · AI checking", ownerId: "jo" },
  { id: "h4", stage: "closed", title: "Missing guard on band saw", severity: "High", where: "Maintenance Shop · BS-1", note: "Verified: guard installed, photo passed", ownerId: "dan" },
  { id: "h5", stage: "closed", title: "Spill near the charging station", severity: "Low", where: "Warehouse", note: "Closed, cleaned on the spot", ownerId: "jo" },
];

function stageOf(status?: string): Stage {
  if (status === "in_progress") return "progress";
  if (status === "verified" || status === "closed") return "closed";
  return "decide";
}

export default function EventsBoardPage() {
  const { flows } = useThreeCases();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <PageShell title="Events" mainClassName="flex flex-col gap-3 overflow-hidden p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />
        <TapCompare today="open each event to see where it is" todayDetail="no view by stage" here="the whole week at a glance" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-4 gap-3">
        {STAGES.map((st) => {
          const live = EVENTS.filter((e) => stageOf(flows[e.id]?.status) === st.key);
          const past = HISTORY.filter((h) => h.stage === st.key);
          return (
            <div key={st.key} className="flex min-h-0 flex-col rounded-2xl bg-gray-100/70 p-2">
              <div className="flex items-center gap-2 px-2 pb-2 pt-1">
                <span className={cn("size-2 rounded-full", st.dot)} />
                <span className="text-sm font-semibold text-gray-900">{st.title}</span>
                <span className="rounded-full bg-white px-1.5 text-xs font-medium text-gray-600">{live.length + past.length}</span>
              </div>
              <p className="px-2 pb-2 text-[11px] text-gray-500">{st.hint}</p>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {live.map((e) => {
                  const a = e.assetId ? getAsset(e.assetId) : undefined;
                  const flow = flows[e.id];
                  return (
                    <button
                      key={e.id}
                      onClick={() => setOpen(e.id)}
                      className="group relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-3 pl-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span className={cn("absolute inset-y-0 left-0 w-1", e.severity === "High" || e.severity === "Critical" ? "bg-rose-500" : e.severity === "Medium" ? "bg-amber-400" : "bg-gray-300")} />
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_STYLE[e.severity])}>{e.severity}</span>
                        <span className="text-[11px] text-gray-500">{e.type}</span>
                        {e.oshaRecordable ? <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">OSHA</span> : null}
                      </div>
                      <div className="text-sm font-medium leading-snug text-gray-900">{e.title}</div>
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        {locationName(e.locationId)}
                        {a ? ` · ${a.code}` : ""}
                      </div>
                      <div className="mt-2">
                        <StepTrack ev={e} flow={flow} size="sm" />
                      </div>
                      {st.key === "decide" ? (
                        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] text-indigo-800">
                          <Sparkles className="size-3" /> {e.options.length ? `${e.options.length} actions ready · ${e.aiRecommendation.split(".")[0]}` : e.aiRecommendation.split(".")[0]}
                        </div>
                      ) : null}
                      {flow?.capaRef ? (
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-600">
                          <span>
                            {flow.capaRef}
                            {flow.woRefs.length ? ` · ${flow.woRefs.join(", ")}` : ""}
                          </span>
                          {e.capaDefaults ? <Avatar initials={person(e.capaDefaults.ownerId).initials} className="size-5" /> : null}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
                {past.map((h) => (
                  <div key={h.id} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-3 pl-4">
                    <span className={cn("absolute inset-y-0 left-0 w-1", h.severity === "High" ? "bg-rose-300" : h.severity === "Medium" ? "bg-amber-200" : "bg-gray-200")} />
                    <div className="text-sm font-medium leading-snug text-gray-800">{h.title}</div>
                    <div className="mt-0.5 text-[11px] text-gray-500">{h.where}</div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-gray-600">
                      <span className="flex items-center gap-1">
                        {h.stage === "verify" ? <Camera className="size-3 text-indigo-500" /> : h.stage === "closed" ? <Check className="size-3 text-emerald-600" /> : <Clock className="size-3 text-amber-600" />}
                        {h.note}
                      </span>
                      <Avatar initials={person(h.ownerId).initials} className="size-5" />
                    </div>
                    {h.due ? <div className="mt-1 text-[10px] text-gray-400">{h.due}</div> : null}
                  </div>
                ))}
                {live.length + past.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400">Nothing here</div> : null}
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
