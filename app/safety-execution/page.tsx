"use client";

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
import { ArrowUp, Building2, ChevronRight, Loader2, MapPin, Mic, Package, Sparkles, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

const TONE: Record<string, string> = {
  due: "text-amber-700",
  gap: "text-rose-700",
  event: "text-indigo-700",
};

export default function SafetyExecutionPage() {
  const [locationId, setLocationId] = useState<string>("all");
  const [assetId, setAssetId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [thinking, setThinking] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiTrail, setAiTrail] = useState<string[]>([]);

  const selected = assetId ? getAsset(assetId) : undefined;
  const selectedJob = jobId ? getJob(jobId) : undefined;
  const visibleAssets = useMemo(
    () => ASSETS.filter((a) => locationId === "all" || a.locationId === locationId),
    [locationId],
  );

  const pickAsset = (id: string) => {
    setAssetId(id);
    setJobId(null);
    setAiReply(null);
    setAiTrail([]);
  };

  const submit = (text: string) => {
    if (!text.trim()) return;
    setPrompt(text);
    setThinking(true);
    setAiReply(null);
    const result = interpretPrompt(text);
    const a = result.assetId ? getAsset(result.assetId) : undefined;
    const trail = a
      ? [
          `Found ${a.name} at ${locationName(a.locationId)}`,
          `Read ${a.docs.length} document${a.docs.length === 1 ? "" : "s"} linked to it`,
          result.jobId ? "Drafted the plan" : "Waiting for the job",
        ]
      : [];
    setAiTrail([]);
    trail.forEach((line, i) => setTimeout(() => setAiTrail((t) => [...t, line]), 350 * (i + 1)));
    setTimeout(() => {
      setThinking(false);
      setAiReply(result.reply);
      if (result.assetId) {
        setLocationId(getAsset(result.assetId)?.locationId ?? "all");
        setAssetId(result.assetId);
      }
      setJobId(result.jobId ?? null);
    }, 350 * (trail.length + 1));
  };

  const suggestions = selected ? jobsForAsset(selected.id) : [];
  const onlyPrereqs = selected ? !selected.docs.some((d) => d.enables) : false;

  return (
    <PageShell title="Safety Execution" mainClassName="flex flex-col gap-3 overflow-hidden p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 2" options={CASE_B_OPTIONS} />
        <TapCompare today="~25 clicks, 4 screens" todayDetail="open each document, then the CMMS, then link back" here="3 clicks" />
      </div>

      {/* Ask the AI */}
      <div className="rounded-xl border border-indigo-200 bg-white p-3 shadow-sm">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(prompt);
          }}
        >
          <Sparkles className="size-5 shrink-0 text-indigo-600" />
          <input
            id="execution-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What are we executing for safety today?"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
          />
          <button type="button" className="rounded-md p-2 text-gray-500 hover:bg-gray-100" aria-label="Speak">
            <Mic className="size-4" />
          </button>
          <button
            type="submit"
            className="flex size-8 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
            disabled={!prompt.trim() || thinking}
            aria-label="Send"
          >
            {thinking ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </button>
        </form>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {aiTrail.length > 0 || aiReply ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
              {aiTrail.map((line) => (
                <span key={line} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                  <ChevronRight className="size-3 text-gray-400" />
                  {line}
                </span>
              ))}
              {aiReply ? <span className="font-medium text-indigo-800">{aiReply}</span> : null}
            </div>
          ) : (
            PROMPT_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => submit(ex)}
                className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-indigo-300 hover:text-indigo-700"
              >
                {ex}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Location, asset, workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-[180px_230px_minmax(0,1fr)] gap-3">
        <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Locations</div>
          <div className="flex-1 space-y-0.5 overflow-y-auto p-1.5">
            {[{ id: "all", name: "All locations" }, ...LOCATIONS.filter((l) => l.parentId)].map((l) => {
              const count = l.id === "all" ? ASSETS.length : ASSETS.filter((a) => a.locationId === l.id).length;
              return (
                <button
                  key={l.id}
                  onClick={() => setLocationId(l.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                    locationId === l.id ? "bg-indigo-50 font-medium text-indigo-800" : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {l.id === "all" ? <Building2 className="size-3.5 shrink-0 text-gray-400" /> : <MapPin className="size-3.5 shrink-0 text-gray-400" />}
                    <span className="truncate">{l.name}</span>
                  </span>
                  <span className="text-xs text-gray-400">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Assets</div>
          <div className="flex-1 overflow-y-auto p-1.5">
            {locationId === "all" ? (
              <>
                <div className="flex items-center gap-1 px-2 pb-1 pt-1 text-[11px] font-semibold text-indigo-700">
                  <Sparkles className="size-3" /> Suggested for today
                </div>
                {SUGGESTED_ASSET_IDS.map((id) => {
                  const a = getAsset(id);
                  if (!a) return null;
                  return <AssetRow key={id} id={id} active={assetId === id} onPick={pickAsset} hint={a.aiHint} tone={a.aiHintTone} />;
                })}
                <div className="px-2 pb-1 pt-3 text-[11px] font-semibold text-gray-400">All assets</div>
              </>
            ) : null}
            {visibleAssets
              .filter((a) => locationId !== "all" || !SUGGESTED_ASSET_IDS.includes(a.id))
              .map((a) => (
                <AssetRow key={a.id} id={a.id} active={assetId === a.id} onPick={pickAsset} hint={a.aiHint} tone={a.aiHintTone} />
              ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white text-center">
              <Package className="size-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-700">Pick an asset, or tell the AI what you need to do</p>
              <p className="max-w-sm text-xs text-gray-500">
                The AI reads the asset&apos;s JHA, SOP, LOTO, permit, inspections and SDS, then proposes the work with everything attached.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">{selected.code}</span>
                      <h2 className="truncate text-base font-semibold text-gray-900">{selected.name}</h2>
                    </div>
                    <p className="text-xs text-gray-500">
                      {locationName(selected.locationId)} · {selected.category} · Owner {person(selected.ownerId).name}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-600">
                    {selected.lastWorkOrders.map((wo) => (
                      <span key={wo.ref} className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5">
                        <Wrench className="size-3 text-gray-400" /> {wo.ref} {wo.title} · {wo.date}
                      </span>
                    ))}
                  </div>
                </div>
                <DocGrid asset={selected} highlight={selectedJob?.basedOn ?? []} compact={Boolean(selectedJob)} />
              </div>

              <div className="min-h-0 flex-1">
                {selectedJob ? (
                  <ExecutionPlan job={selectedJob} onBack={() => setJobId(null)} />
                ) : (
                  <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <AiTag label="Read the documents" />
                      <span className="text-sm font-medium text-gray-800">What do you want to do on {selected.name}?</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      {suggestions.map((j) => (
                        <button
                          key={j.id}
                          onClick={() => setJobId(j.id)}
                          className="group flex flex-col items-start gap-1 rounded-lg border border-gray-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40"
                        >
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">{j.verb}</span>
                          <span className="text-sm font-semibold text-gray-900">{j.title}</span>
                          <span className="text-xs text-gray-500">{j.reason}</span>
                          <span className="mt-1 text-xs font-medium text-indigo-700 group-hover:underline">Prepare it</span>
                        </button>
                      ))}
                      {onlyPrereqs ? (
                        <button
                          onClick={() => setJobId("hp07-monthly")}
                          className="flex flex-col items-start gap-1 rounded-lg border border-rose-200 bg-rose-50/40 p-3 text-left hover:border-rose-300"
                        >
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">Missing documents</span>
                          <span className="text-sm font-semibold text-gray-900">Create what is needed to service {selected.name}</span>
                          <span className="text-xs text-gray-500">Only a JHA is on file. The AI drafts the SOP, LOTO and permit first.</span>
                          <span className="mt-1 text-xs font-medium text-rose-700">Draft them and plan the work</span>
                        </button>
                      ) : null}
                      <div className="flex flex-col justify-center rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-500">
                        Something else? Type it above, for example &quot;replace the hose tomorrow&quot;.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function AssetRow({
  id,
  active,
  onPick,
  hint,
  tone,
}: {
  id: string;
  active: boolean;
  onPick: (id: string) => void;
  hint?: string;
  tone?: string;
}) {
  const a = getAsset(id);
  if (!a) return null;
  return (
    <button
      onClick={() => onPick(id)}
      className={cn(
        "mb-0.5 flex w-full flex-col rounded-md px-2 py-1.5 text-left",
        active ? "bg-indigo-50 ring-1 ring-indigo-200" : "hover:bg-gray-50",
      )}
    >
      <span className="flex items-center gap-1.5 text-sm text-gray-900">
        <span className="font-mono text-[10px] text-gray-400">{a.code}</span>
        <span className="truncate font-medium">{a.name}</span>
      </span>
      {hint ? <span className={cn("truncate text-[11px]", tone ? TONE[tone] : "text-gray-500")}>{hint}</span> : null}
    </button>
  );
}
