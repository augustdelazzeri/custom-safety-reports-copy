"use client";

import { useCreatedRecords } from "@/components/three-cases/asset-records";
import { DocGrid } from "@/components/three-cases/doc-grid";
import { ExecutionPlan } from "@/components/three-cases/execution-plan";
import { CASE_B_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { AiTag, PageShell, TapCompare } from "@/components/three-cases/shell";
import {
  ASSETS,
  LOCATIONS,
  PROMPT_EXAMPLES,
  SUGGESTED_ASSET_IDS,
  asset as getAsset,
  interpretPrompt,
  job as getJob,
  jobsForAsset,
  locationName,
  person,
} from "@/lib/three-cases/data";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUp, ChevronRight, Loader2, MapPin, Mic, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { useState } from "react";

const TONE: Record<string, string> = {
  due: "text-amber-700",
  gap: "text-badge-error-foreground",
  event: "text-badge-accent-foreground",
};

const DOT: Record<string, string> = {
  due: "bg-amber-500",
  gap: "bg-destructive",
  event: "bg-indigo-500",
};

export default function SafetyExecutionPage() {
  const [assetId, setAssetId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiTrail, setAiTrail] = useState<string[]>([]);
  const [navHidden, setNavHidden] = useState(false);

  const selected = assetId ? getAsset(assetId) : undefined;
  const created = useCreatedRecords(selected?.id);
  const selectedJob = jobId ? getJob(jobId) : undefined;

  const pickAsset = (id: string) => {
    setAssetId(id);
    setJobId(null);
    setAiReply(null);
    setAiTrail([]);
    setAsked(null);
  };

  const submit = (text: string) => {
    if (!text.trim()) return;
    const t = text.toLowerCase();
    setPrompt("");
    setThinking(true);
    setAiReply(null);
    // With an asset open, "clean it" or "inspect" means this asset's job.
    const local = selected ? jobsForAsset(selected.id).find((j) => t.includes(j.verb.toLowerCase())) : undefined;
    const result = local
      ? { jobId: local.id, assetId: local.assetId, reply: local.reason }
      : interpretPrompt(text);
    const a = result.assetId ? getAsset(result.assetId) : undefined;
    const trail = a
      ? [
          `Found ${a.name} at ${locationName(a.locationId)}`,
          a.docs.some((d) => d.match)
            ? `Read ${a.docs.length} documents: ${a.docs.filter((d) => !d.match).length} linked, ${a.docs.filter((d) => d.match).length} found by title`
            : `Read ${a.docs.length} document${a.docs.length === 1 ? "" : "s"} linked to it`,
          result.jobId ? "Drafted the plan" : "Waiting for the job",
        ]
      : [];
    setAiTrail([]);
    trail.forEach((line, i) => setTimeout(() => setAiTrail((tr) => [...tr, line]), 350 * (i + 1)));
    setTimeout(() => {
      setThinking(false);
      if (!result.assetId && selected) {
        setAiReply(
          `No document on ${selected.name} covers that yet. I can open a plain work order with JHA attached, or draft an SOP for it first.`,
        );
        return;
      }
      setAiReply(result.reply);
      if (result.assetId) setAssetId(result.assetId);
      if (result.jobId) setAsked(text);
      setJobId(result.jobId ?? null);
    }, 350 * (trail.length + 1));
  };

  const suggestions = selected ? jobsForAsset(selected.id) : [];
  const onlyPrereqs = selected ? !selected.docs.some((d) => d.enables) : false;
  const askProps = { prompt, setPrompt, thinking, trail: aiTrail, reply: aiReply, onSubmit: submit };

  return (
    <PageShell title="Safety Execution" mainClassName="flex flex-col gap-3 overflow-hidden p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 2" options={CASE_B_OPTIONS} />
        <TapCompare today="37 to 123 clicks" todayDetail="measured on staging: 37 for the forklift, 123 for the press; open each document, then the CMMS, then attach" here="3 clicks" />
      </div>

      <div className={cn("grid min-h-0 flex-1 gap-3", navHidden ? "grid-cols-[40px_minmax(0,1fr)]" : "grid-cols-[230px_minmax(0,1fr)]")}>
        {navHidden ? (
          <button
            onClick={() => setNavHidden(false)}
            className="flex min-h-0 flex-col items-center gap-3 rounded-xl border border-border bg-card py-2 text-muted-foreground hover:text-foreground"
            aria-label="Show assets"
            title="Show assets"
          >
            <PanelLeftOpen className="size-4" />
            <span className="text-xs font-medium text-muted-foreground [writing-mode:vertical-rl]">
              {selected ? `${selected.code} · ${selected.name}` : "Assets"}
            </span>
          </button>
        ) : (
          <AssetTree selectedId={assetId} onPick={pickAsset} onHide={() => setNavHidden(true)} />
        )}

        <div className="flex min-h-0 flex-col gap-3">
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-border bg-card p-6">
              <div className="w-full max-w-xl">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="size-5 text-badge-accent-foreground" />
                  <h2 className="text-base font-semibold text-foreground">What are we executing for safety today?</h2>
                </div>
                <AskBox {...askProps} placeholder="Clean Forklift 3 tomorrow morning" examples={PROMPT_EXAMPLES} autoFocus />
                <p className="mt-4 text-xs text-muted-foreground">
                  Or pick an asset on the left. The AI reads its JHA, SOP, LOTO, permit, inspections and SDS, then proposes the work with everything
                  attached.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="shrink-0 rounded-xl border border-border bg-card p-3">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-muted-foreground">{selected.code}</span>
                  <h2 className="text-base font-semibold text-foreground">{selected.name}</h2>
                  <span className="text-xs text-muted-foreground">
                    {locationName(selected.locationId)} · {selected.category} · Owner {person(selected.ownerId).name}
                  </span>
                </div>
                <DocGrid
                  asset={selected}
                  highlight={selectedJob?.basedOn ?? []}
                  created={created.docs}
                  variant={selectedJob ? "refs" : "full"}
                  workOrders
                />
              </div>

              {selectedJob ? (
                <div className="min-h-0 flex-1">
                  <ExecutionPlan job={selectedJob} asked={asked ?? undefined} onBack={() => setJobId(null)} />
                </div>
              ) : (
                <div className="shrink-0 rounded-xl border border-border bg-card p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <AiTag label="Read the documents" />
                    <span className="text-sm font-medium text-foreground">What do you want to do on {selected.name}?</span>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2">
                    {suggestions.map((j) => (
                      <button
                        key={j.id}
                        onClick={() => {
                          setAsked(null);
                          setJobId(j.id);
                        }}
                        className="group flex flex-col items-start gap-0.5 rounded-lg border border-border px-3 py-2 text-left transition hover:border-primary/40 hover:bg-indigo-50/40"
                      >
                        <span className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-badge-accent-foreground">
                          {j.verb}
                          <ArrowRight className="size-3.5 text-text-placeholder transition group-hover:translate-x-0.5 group-hover:text-badge-accent-foreground" />
                        </span>
                        <span className="text-sm font-semibold text-foreground">{j.title}</span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">{j.reason}</span>
                      </button>
                    ))}
                    {onlyPrereqs ? (
                      <button
                        onClick={() => setJobId("hp07-monthly")}
                        className="group flex flex-col items-start gap-0.5 rounded-lg border border-rose-200 bg-rose-50/40 px-3 py-2 text-left hover:border-rose-300"
                      >
                        <span className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-badge-error-foreground">
                          Missing documents
                          <ArrowRight className="size-3.5 text-rose-300 group-hover:text-badge-error-foreground" />
                        </span>
                        <span className="text-sm font-semibold text-foreground">Create what is needed to service {selected.name}</span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">Only a JHA is on file. The AI drafts the SOP, LOTO and permit first.</span>
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-2.5">
                    <AskBox {...askProps} placeholder={`Something else on ${selected.name}? For example "replace the hose tomorrow"`} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

/** The chat input: lives where the decision is made, not on top of the page. */
function AskBox({
  prompt,
  setPrompt,
  thinking,
  trail,
  reply,
  onSubmit,
  placeholder,
  examples,
  autoFocus,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
  thinking: boolean;
  trail: string[];
  reply: string | null;
  onSubmit: (text: string) => void;
  placeholder: string;
  examples?: string[];
  autoFocus?: boolean;
}) {
  const working = thinking || trail.length > 0 || reply;
  return (
    <div>
      <form
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-sm focus-within:border-primary/40"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(prompt);
        }}
      >
        <Sparkles className="size-4 shrink-0 text-indigo-500" />
        <input
          id="execution-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-text-placeholder"
        />
        <button type="button" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Speak">
          <Mic className="size-4" />
        </button>
        <button
          type="submit"
          className="flex size-7 items-center justify-center rounded-md bg-primary text-white hover:bg-primary/80 disabled:opacity-40"
          disabled={!prompt.trim() || thinking}
          aria-label="Send"
        >
          {thinking ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
        </button>
      </form>
      {working ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {trail.map((line) => (
            <span key={line} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
              <ChevronRight className="size-3 text-text-placeholder" />
              {line}
            </span>
          ))}
          {reply ? <span className="font-medium text-indigo-800">{reply}</span> : null}
        </div>
      ) : examples ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onSubmit(ex)}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-badge-accent-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Locations and assets in one tree, like the CMMS, with the AI's picks for today on top. */
function AssetTree({ selectedId, onPick, onHide }: { selectedId: string | null; onPick: (id: string) => void; onHide: () => void }) {
  const selected = selectedId ? getAsset(selectedId) : undefined;
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-placeholder">
        Assets
        <button onClick={onHide} className="rounded p-0.5 text-text-placeholder hover:bg-muted hover:text-foreground" aria-label="Hide assets" title="Hide assets">
          <PanelLeftClose className="size-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5">
        <div className="flex items-center gap-1 px-2 pb-1 pt-1 text-xs font-semibold text-badge-accent-foreground">
          <Sparkles className="size-3" /> Suggested for today
        </div>
        {SUGGESTED_ASSET_IDS.map((id) => {
          const a = getAsset(id);
          if (!a) return null;
          return (
            <button
              key={id}
              onClick={() => onPick(id)}
              className={cn(
                "mb-0.5 flex w-full flex-col rounded-md px-2 py-1.5 text-left",
                selectedId === id ? "bg-badge-accent ring-1 ring-indigo-200" : "hover:bg-surface-subtle",
              )}
            >
              <span className="flex items-center gap-1.5 text-sm text-foreground">
                <span className="font-mono text-xs text-text-placeholder">{a.code}</span>
                <span className="truncate font-medium">{a.name}</span>
              </span>
              {a.aiHint ? <span className={cn("truncate text-xs", a.aiHintTone ? TONE[a.aiHintTone] : "text-muted-foreground")}>{a.aiHint}</span> : null}
            </button>
          );
        })}

        <div className="px-2 pb-1 pt-3 text-xs font-semibold text-text-placeholder">{LOCATIONS.find((l) => !l.parentId)?.name}</div>
        {LOCATIONS.filter((l) => l.parentId).map((l) => {
          const assets = ASSETS.filter((a) => a.locationId === l.id);
          const isOpen = open[l.id] ?? selected?.locationId === l.id;
          return (
            <div key={l.id}>
              <button
                onClick={() => setOpen((o) => ({ ...o, [l.id]: !isOpen }))}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-surface-subtle"
              >
                <ChevronRight className={cn("size-3.5 shrink-0 text-text-placeholder transition", isOpen && "rotate-90")} />
                <MapPin className="size-3.5 shrink-0 text-text-placeholder" />
                <span className="truncate">{l.name}</span>
                <span className="ml-auto text-xs text-text-placeholder">{assets.length}</span>
              </button>
              {isOpen
                ? assets.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => onPick(a.id)}
                      title={a.aiHint}
                      className={cn(
                        "mb-0.5 flex w-full items-center gap-1.5 rounded-md py-1 pl-8 pr-2 text-left text-sm",
                        selectedId === a.id ? "bg-badge-accent font-medium text-indigo-900" : "text-foreground hover:bg-surface-subtle",
                      )}
                    >
                      <span className="font-mono text-xs text-text-placeholder">{a.code}</span>
                      <span className="truncate">{a.name}</span>
                      {a.aiHintTone ? <span className={cn("ml-auto size-1.5 shrink-0 rounded-full", DOT[a.aiHintTone])} /> : null}
                    </button>
                  ))
                : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
