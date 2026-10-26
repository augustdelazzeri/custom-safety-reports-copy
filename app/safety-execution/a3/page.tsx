"use client";

import { useCreatedRecords } from "@/components/three-cases/asset-records";
import { DocGrid } from "@/components/three-cases/doc-grid";
import { AssetSearch, TaskDots } from "@/components/three-cases/exec/asset-search";
import { Receipt } from "@/components/three-cases/exec/receipt";
import { LEVEL, Legend, NeedChips, useReadiness } from "@/components/three-cases/exec/status";
import { VariantPage } from "@/components/three-cases/exec/variant-page";
import { asset as getAsset, locationName, person } from "@/lib/three-cases/data";
import { SUGGESTED_ASSETS, assetSummary, matchTask, taskStatus, tasksFor } from "@/lib/three-cases/tasks";
import { cn } from "@/lib/utils";
import { ArrowUp, ChevronDown, Sparkles, X } from "lucide-react";
import { useState } from "react";

/**
 * A · Task cards, an earlier version of option A. Pick the asset, see its jobs as cards. Each card carries its own readiness:
 * the dot, what is on file and what the job creates. The full document grid is one click away,
 * not on the page. The receipt opens on the right.
 */
export default function TaskCardsPage() {
  const s = useReadiness();
  const [assetId, setAssetId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [typed, setTyped] = useState("");
  const [miss, setMiss] = useState(false);

  const a = assetId ? getAsset(assetId) : undefined;
  const created = useCreatedRecords(a?.id);
  const tasks = a ? tasksFor(a.id, s) : [];
  const task = jobId ? taskStatus(jobId, s) : undefined;

  const pick = (id: string) => {
    setAssetId(id);
    setJobId(null);
    setShowDocs(false);
  };

  return (
    <VariantPage note="A · Task cards (earlier version). The readiness lives on each job, not on a document grid. Green: only the permit and work order are created.">
      <div className={cn("grid h-full min-h-0 gap-3", task ? "grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1")}>
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <div className="flex flex-wrap items-center gap-3">
            <AssetSearch onPick={pick} className="w-[380px]" placeholder={a ? "Another asset" : "Search an asset by name, code or location"} />
            {a ? (
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-mono text-xs text-text-placeholder">{a.code}</span>
                <h2 className="truncate text-base font-semibold text-foreground">{a.name}</h2>
                <span className="truncate text-xs text-muted-foreground">
                  {locationName(a.locationId)} · Owner {person(a.ownerId).name}
                </span>
                <button onClick={() => setShowDocs((v) => !v)} className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  {a.docs.length + created.docs.length} documents <ChevronDown className={cn("size-3.5 transition", showDocs && "rotate-180")} />
                </button>
              </div>
            ) : null}
            <Legend className="ml-auto" />
          </div>

          {a && showDocs ? (
            <div className="rounded-xl border border-border bg-card p-3">
              <DocGrid asset={a} created={created.docs} variant="refs" highlight={task?.job.basedOn ?? []} />
            </div>
          ) : null}

          {!a ? (
            <div>
              <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-badge-accent-foreground">
                <Sparkles className="size-3.5" /> Suggested for today
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2">
                {SUGGESTED_ASSETS.map((x) => {
                  const sum = assetSummary(x, s);
                  return (
                    <button
                      key={x.id}
                      onClick={() => pick(x.id)}
                      className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-sm"
                    >
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xs text-text-placeholder">{x.code}</span>
                        <span className="text-sm font-semibold text-foreground">{x.name}</span>
                      </span>
                      <span className="text-xs text-badge-accent-foreground">{x.aiHint}</span>
                      <TaskDots summary={sum} />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2">
              {tasks.map((t) => (
                <button
                  key={t.job.id}
                  onClick={() => setJobId(t.job.id)}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-xl border-l-4 border-y border-r bg-card p-3 text-left transition hover:shadow-sm",
                    t.level === "ready" && "border-l-emerald-500",
                    t.level === "update" && "border-l-amber-500",
                    t.level === "missing" && "border-l-rose-500",
                    t.level === "scheduled" && "border-l-sky-500",
                    jobId === t.job.id ? "border-y-indigo-300 border-r-indigo-300 ring-1 ring-indigo-200" : "border-y-gray-200 border-r-gray-200",
                  )}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-placeholder">{t.job.verb}</span>
                  <span className="text-sm font-semibold leading-snug text-foreground">{t.job.title}</span>
                  <span className={cn("text-xs", LEVEL[t.level].text)}>{t.headline}</span>
                  <NeedChips task={t} className="mt-auto pt-1" />
                </button>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const m = matchTask(typed, a.id, s);
                  setMiss(!m);
                  if (m) {
                    setJobId(m.job.id);
                    setTyped("");
                  }
                }}
                className="flex flex-col justify-between gap-2 rounded-xl border border-dashed border-border bg-card p-3"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-text-placeholder">Something else</span>
                <div className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 focus-within:border-primary/40">
                  <Sparkles className="size-3.5 shrink-0 text-indigo-500" />
                  <input
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder={`What on ${a.name}?`}
                    className="min-w-0 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-text-placeholder"
                  />
                  <button type="submit" disabled={!typed.trim()} className="rounded bg-primary p-1 text-white disabled:opacity-40" aria-label="Send">
                    <ArrowUp className="size-3.5" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {miss ? "No match in the prototype. Try clean, inspect, repair, change or service." : "The AI reads the documents and says what is missing."}
                </span>
              </form>
            </div>
          )}
        </div>

        {task ? (
          <div className="relative flex min-h-0 flex-col">
            <button
              onClick={() => setJobId(null)}
              className="absolute right-2 top-2 z-10 rounded p-1 text-text-placeholder hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <Receipt task={task} className="h-full" onAnother={() => setJobId(null)} />
          </div>
        ) : null}
      </div>
    </VariantPage>
  );
}
