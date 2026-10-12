"use client";

// P5 · Document → program variants.

import React, { useEffect, useState } from "react";
import { FileUp, Library, Search, Sparkles } from "lucide-react";
import { GapsCard, Published, PROGRAM_SECTIONS, PublishBar, RegulationChips, SectionCard, useProgram } from "./ProgramParts";
import { AiWorking, useStagedProgress } from "../AiPrimitives";
import { SOURCE_DOC, TEMPLATE_LIBRARY } from "@/lib/ai-first/sample-data";
import { cn } from "@/lib/utils";

const STEPS = ["Reading 4 pages", "Finding steps, frequencies and responsibilities", "Matching to your 9 forklifts and 2 warehouses", "Checking OSHA 1910.178 for gaps", "Drafting the program"];

function Upload({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h2 className="text-xl font-semibold text-gray-900">Start from what you already have</h2>
      <p className="text-sm text-gray-600">Upload an SOP, a manufacturer manual or a scan of a paper checklist. The AI turns it into a program you review section by section.</p>
      <button onClick={onUpload} className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/50 py-10 text-violet-700 hover:bg-violet-50">
        <FileUp className="w-8 h-8" />
        <span className="font-semibold">Upload a document</span>
        <span className="text-xs text-violet-600/80">Uses the sample: {SOURCE_DOC.name} ({SOURCE_DOC.pages} pages)</span>
      </button>
      <RegulationChips />
    </div>
  );
}

function useAnalysis(start: boolean) {
  return useStagedProgress(STEPS, 600, start);
}

function Analyzing({ index }: { index: number }) {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-xl border border-violet-200 bg-white p-5">
        <p className="mb-3 text-sm font-medium text-gray-900">{SOURCE_DOC.name}</p>
        <AiWorking steps={STEPS} index={index} />
      </div>
    </div>
  );
}

function Review({ state, onHover, active }: { state: ReturnType<typeof useProgram>; onHover?: (ids: string[] | null) => void; active?: string[] | null }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-gray-900">Proposed program</h3>
        <button onClick={state.approveAll} className="ml-auto text-xs text-gray-500 underline" title="Prototype shortcut">
          Approve all (prototype shortcut)
        </button>
      </div>
      {PROGRAM_SECTIONS.map((s) => (
        <SectionCard key={s.id} section={s} state={state} onHoverSource={onHover} activeSource={active} />
      ))}
      <GapsCard state={state} />
    </div>
  );
}

// A · Plan reviewed section by section.
export function SectionsVariant() {
  const state = useProgram();
  const [phase, setPhase] = useState<"upload" | "analyzing" | "review">("upload");
  const progress = useAnalysis(phase === "analyzing");
  useEffect(() => {
    if (phase === "analyzing" && progress.done) setPhase("review");
  }, [phase, progress.done]);

  if (state.published) return <Published state={state} />;
  if (phase === "upload") return <Upload onUpload={() => setPhase("analyzing")} />;
  if (phase === "analyzing") return <Analyzing index={progress.index} />;
  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
        <RegulationChips />
        <Review state={state} />
      </div>
      <PublishBar state={state} />
    </div>
  );
}

// B · The source document on the left, the plan on the right; hovering a section highlights its source.
export function SplitVariant() {
  const state = useProgram();
  const [phase, setPhase] = useState<"upload" | "analyzing" | "review">("upload");
  const [active, setActive] = useState<string[] | null>(null);
  const progress = useAnalysis(phase === "analyzing");
  useEffect(() => {
    if (phase === "analyzing" && progress.done) setPhase("review");
  }, [phase, progress.done]);

  if (state.published) return <Published state={state} />;
  if (phase === "upload") return <Upload onUpload={() => setPhase("analyzing")} />;
  if (phase === "analyzing") return <Analyzing index={progress.index} />;

  const pages = Array.from(new Set(SOURCE_DOC.passages.map((p) => p.page)));
  return (
    <div className="min-h-full">
      <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-2">
        <div className="space-y-3 lg:sticky lg:top-0 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{SOURCE_DOC.name}</p>
          {pages.map((pg) => (
            <div key={pg} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-[11px] text-gray-400">Page {pg}</p>
              {SOURCE_DOC.passages
                .filter((p) => p.page === pg)
                .map((p) => (
                  <p key={p.id} className={cn("mb-2 rounded px-1 text-sm leading-relaxed text-gray-700 transition-colors", active?.includes(p.id) && "bg-violet-100 text-gray-900")}>
                    {p.text}
                  </p>
                ))}
              <div className="space-y-1.5">
                <div className="h-2 w-11/12 rounded bg-gray-100" />
                <div className="h-2 w-9/12 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <RegulationChips />
          <p className="text-xs text-gray-500">Hover a section to see where it came from in the document.</p>
          <Review state={state} onHover={setActive} active={active} />
        </div>
      </div>
      <PublishBar state={state} />
    </div>
  );
}

// C · Start from the library, the AI adapts the template to your sites and assets.
export function LibraryVariant() {
  const state = useProgram();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [phase, setPhase] = useState<"browse" | "analyzing" | "review">("browse");
  const progress = useAnalysis(phase === "analyzing");
  useEffect(() => {
    if (phase === "analyzing" && progress.done) setPhase("review");
  }, [phase, progress.done]);

  if (state.published) return <Published state={state} />;
  if (phase === "analyzing") return <Analyzing index={progress.index} />;
  if (phase === "review")
    return (
      <div className="min-h-full">
        <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
          <p className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
            <Sparkles className="w-4 h-4" /> Adapted “{TEMPLATE_LIBRARY.find((t) => t.id === picked)?.name}” to your 9 forklifts in Warehouses A and B.
          </p>
          <Review state={state} />
        </div>
        <PublishBar state={state} />
      </div>
    );

  const list = TEMPLATE_LIBRARY.filter((t) => (t.name + t.regs.join(" ") + t.industry).toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Library className="w-5 h-5 text-violet-600" />
        <h2 className="text-xl font-semibold text-gray-900">Template library</h2>
        <span className="text-sm text-gray-500">Ready-made programs by industry and regulation. The AI fits them to your sites.</span>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: forklift, NR-12, LOTO…" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <button
            key={t.id}
            disabled={t.id !== "lib-1"}
            onClick={() => {
              setPicked(t.id);
              setPhase("analyzing");
            }}
            className="rounded-xl border border-gray-200 bg-white p-4 text-left enabled:hover:border-violet-300 enabled:hover:shadow-sm disabled:opacity-60"
          >
            {t.id !== "lib-1" && <span className="float-right text-[10px] text-gray-400">Not scripted in the prototype</span>}
            <p className="font-semibold text-gray-900">{t.name}</p>
            <p className="text-xs text-gray-500">
              {t.industry} · used by {t.uses.toLocaleString("en-US")} sites
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {t.regs.map((r) => (
                <span key={r} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                  {r}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">Or upload your own document in variant A or B.</p>
    </div>
  );
}
