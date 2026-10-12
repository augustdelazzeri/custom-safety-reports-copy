"use client";

// P5 · Document in, program out (DOC-1 + DOC-3, with the "what's missing" check from DOC-4).
// One upload becomes a reviewed plan: digital SOP, derived checklist, cadence and assignment,
// failure rule, recurring PM in the CMMS, training with a quiz, and the gaps against the regulation.

import React, { useState } from "react";
import { AlertTriangle, BookOpen, CalendarClock, Check, ChevronDown, ClipboardCheck, FileText, Gavel, Rocket, Wrench } from "lucide-react";
import { REGULATIONS, SOURCE_DOC } from "@/lib/ai-first/sample-data";
import { AiBadge, ConfidenceBadge } from "../AiPrimitives";
import { cn } from "@/lib/utils";

export interface ProgramSection {
  id: string;
  title: string;
  where: string;
  icon: React.ElementType;
  confidence: number;
  sources: string[]; // passage ids
  lines: string[];
  note?: string;
}

export const PROGRAM_SECTIONS: ProgramSection[] = [
  {
    id: "sop",
    title: "Digital SOP: Forklift pre-shift inspection (SOP-FL-02 rev 4)",
    where: "Safety · SOPs",
    icon: FileText,
    confidence: 0.9,
    sources: ["p1", "p2", "p4"],
    lines: ["Scope: all powered industrial trucks in Warehouses A and B", "6 steps, readable on the phone at the truck", "Linked to assets FL-01 to FL-09"],
  },
  {
    id: "checklist",
    title: "Pre-shift checklist (10 items, photo required on 3)",
    where: "Safety · Inspections",
    icon: ClipboardCheck,
    confidence: 0.86,
    sources: ["p3"],
    lines: ["Forks · Mast chains · Hydraulic hoses and drips under the truck (photo) · Tires · Horn · Lights · Seat belt (photo) · Data plate · Brakes · Steering", "Fail on brakes, steering or hoses = truck unsafe"],
    note: "“Drips under the truck” comes from CAPA-403 on the Aisle 4 spill.",
  },
  {
    id: "cadence",
    title: "Cadence and who does it",
    where: "Safety · Schedules",
    icon: CalendarClock,
    confidence: 0.82,
    sources: ["p2", "p1"],
    lines: ["Before each shift, per truck (3 shifts × 9 trucks)", "Assigned to the operator who checks the truck out", "Missed check → reminder at +15 min, supervisor at +30 min"],
  },
  {
    id: "rule",
    title: "Unsafe truck rule",
    where: "Safety · Rules",
    icon: Gavel,
    confidence: 0.78,
    sources: ["p4"],
    lines: ["A failed critical item tags the truck out in the CMMS", "Drafts a maintenance work order with the photo attached"],
  },
  {
    id: "pm",
    title: "Recurring PM in the CMMS",
    where: "UpKeep CMMS",
    icon: Wrench,
    confidence: 0.74,
    sources: ["p5"],
    lines: ["Every 250 operating hours or monthly, whichever comes first", "9 PM schedules (FL-01 to FL-09), meter-based where hour meters exist"],
  },
  {
    id: "training",
    title: "Training and evaluation",
    where: "UpKeep Learn",
    icon: BookOpen,
    confidence: 0.8,
    sources: ["p6"],
    lines: ["8-question quiz generated from the SOP, required before the first checklist", "Operator evaluation every 3 years, on the compliance calendar per person"],
  },
];

export const GAPS = [
  { text: "No step for refueling or battery charging", cite: "29 CFR 1910.178(g)", confidence: 0.81 },
  { text: "Seat belt use while driving is not stated, only checked", cite: "Manufacturer manual + 1910.178(l) training topics", confidence: 0.66 },
  { text: "No rule for pedestrians in the travel lane", cite: "29 CFR 1910.178(n)(4)", confidence: 0.7 },
];

export function useProgram() {
  const [approved, setApproved] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [gapsAccepted, setGapsAccepted] = useState<number[]>([]);
  return {
    approved,
    toggle: (id: string) => setApproved((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id])),
    approveAll: () => setApproved(PROGRAM_SECTIONS.map((s) => s.id)),
    allApproved: approved.length === PROGRAM_SECTIONS.length,
    published,
    publish: () => setPublished(true),
    gapsAccepted,
    toggleGap: (i: number) => setGapsAccepted((g) => (g.includes(i) ? g.filter((x) => x !== i) : [...g, i])),
  };
}

export type ProgramState = ReturnType<typeof useProgram>;

export function RegulationChips() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500">Checked against</span>
      {REGULATIONS.slice(0, 1).map((r) => (
        <span key={r} className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700">
          {r}
        </span>
      ))}
      <button className="text-xs font-medium text-blue-600">+ add framework</button>
    </div>
  );
}

export function SectionCard({
  section,
  state,
  onHoverSource,
  activeSource,
}: {
  section: ProgramSection;
  state: ProgramState;
  onHoverSource?: (ids: string[] | null) => void;
  activeSource?: string[] | null;
}) {
  const [open, setOpen] = useState(true);
  const ok = state.approved.includes(section.id);
  const pages = section.sources.map((id) => SOURCE_DOC.passages.find((p) => p.id === id)?.page).filter(Boolean);
  return (
    <div
      className={cn("rounded-xl border bg-white transition-colors", ok ? "border-emerald-300" : "border-gray-200", activeSource && section.sources.some((s) => activeSource.includes(s)) && "ring-2 ring-violet-300")}
      onMouseEnter={() => onHoverSource?.(section.sources)}
      onMouseLeave={() => onHoverSource?.(null)}
    >
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", ok ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>
          {ok ? <Check className="w-4 h-4" /> : <section.icon className="w-4 h-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{section.title}</p>
          <p className="text-xs text-gray-500">
            {section.where} · from page {Array.from(new Set(pages)).join(", ")}
          </p>
        </div>
        <ConfidenceBadge value={section.confidence} compact />
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-gray-100 px-4 py-3">
          <ul className="space-y-1 text-sm text-gray-700">
            {section.lines.map((l) => (
              <li key={l} className="flex gap-2">
                <span className="text-gray-300">•</span> {l}
              </li>
            ))}
          </ul>
          {section.note && <p className="text-xs text-violet-700">{section.note}</p>}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => state.toggle(section.id)}
              className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold", ok ? "border border-gray-300 text-gray-700" : "bg-gray-900 text-white")}
            >
              {ok ? "Undo approval" : "Approve section"}
            </button>
            <button className="rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100">Edit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function GapsCard({ state }: { state: ProgramState }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-700" />
        <p className="text-sm font-semibold text-amber-900">What the document is missing</p>
        <span className="text-xs text-amber-800">Checked against your frameworks. Add to the SOP or ignore.</span>
      </div>
      <ul className="mt-2 space-y-2">
        {GAPS.map((g, i) => (
          <li key={g.text} className="flex items-start gap-3 rounded-lg bg-white p-2.5 text-sm">
            <input type="checkbox" checked={state.gapsAccepted.includes(i)} onChange={() => state.toggleGap(i)} className="mt-0.5 h-4 w-4 accent-amber-600" aria-label={`Add: ${g.text}`} />
            <div className="min-w-0 flex-1">
              <p className="text-gray-900">{g.text}</p>
              <p className="text-xs text-gray-500">{g.cite}</p>
            </div>
            <ConfidenceBadge value={g.confidence} compact />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublishBar({ state }: { state: ProgramState }) {
  const left = PROGRAM_SECTIONS.length - state.approved.length;
  return (
    <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <p className="text-sm text-gray-600">
          {state.approved.length} of {PROGRAM_SECTIONS.length} sections approved
          {state.gapsAccepted.length > 0 && ` · ${state.gapsAccepted.length} gaps added to the SOP`}
        </p>
        <span className="text-xs text-gray-400">Nothing goes live until you publish. Each section is reviewed on its own.</span>
        <button
          onClick={state.publish}
          disabled={left > 0}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Rocket className="w-4 h-4" /> {left > 0 ? `Approve ${left} more to publish` : "Publish program"}
        </button>
      </div>
    </div>
  );
}

export function Published({ state }: { state: ProgramState }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-lg font-semibold text-emerald-900">Program published</p>
        <p className="text-sm text-emerald-800">From one PDF: the SOP, a checklist on 9 trucks × 3 shifts, a failure rule, 9 PM schedules and the training.</p>
      </div>
      <ul className="space-y-2">
        {PROGRAM_SECTIONS.map((s) => (
          <li key={s.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
            <s.icon className="w-4 h-4 text-gray-500" />
            <span className="flex-1 text-gray-800">{s.title}</span>
            <span className="text-xs text-gray-500">{s.where}</span>
          </li>
        ))}
      </ul>
      {state.gapsAccepted.length > 0 && <p className="text-sm text-gray-600">{state.gapsAccepted.length} missing steps were added to SOP-FL-02 rev 4 as tracked changes.</p>}
      <div className="flex items-center gap-2">
        <AiBadge>Generated with AI, approved section by section by you</AiBadge>
      </div>
    </div>
  );
}
