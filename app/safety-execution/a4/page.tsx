"use client";

import { AssetSearch } from "@/components/three-cases/exec/asset-search";
import { Receipt } from "@/components/three-cases/exec/receipt";
import { Legend, useReadiness } from "@/components/three-cases/exec/status";
import { TaskOption } from "@/components/three-cases/exec/task-option";
import { VariantPage } from "@/components/three-cases/exec/variant-page";
import { asset as getAsset, locationName } from "@/lib/three-cases/data";
import { matchTask, taskStatus, tasksFor } from "@/lib/three-cases/tasks";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

const STEPS = ["Asset", "Job", "Review"] as const;

/**
 * A · Steps, an earlier version of option A. One question per screen: which asset, which job, then the receipt. Big targets,
 * nothing else on the page. The step bar goes back.
 */
export default function StepsPage() {
  const s = useReadiness();
  const [assetId, setAssetId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [miss, setMiss] = useState(false);

  const a = assetId ? getAsset(assetId) : undefined;
  const task = jobId ? taskStatus(jobId, s) : undefined;
  const step = !a ? 0 : !task ? 1 : 2;
  const tasks = a ? tasksFor(a.id, s) : [];

  const goTo = (i: number) => {
    if (i === 0) {
      setAssetId(null);
      setJobId(null);
    } else if (i === 1) setJobId(null);
  };

  return (
    <VariantPage note="A · Steps. One thing at a time, hardest to get wrong.">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-5 pt-[3vh]">
        <ol className="flex items-center gap-2">
          {STEPS.map((label, i) => {
            const done = i < step;
            const value = i === 0 ? a?.name : i === 1 ? task?.job.verb : undefined;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <button
                  disabled={!done}
                  onClick={() => goTo(i)}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm",
                    i === step ? "border-primary/40 bg-badge-accent text-indigo-900" : done ? "border-border bg-card text-foreground hover:border-border" : "border-border bg-surface-subtle text-text-placeholder",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      done ? "bg-emerald-500 text-white" : i === step ? "bg-primary text-white" : "bg-gray-200 text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-3" /> : i + 1}
                  </span>
                  <span className="truncate">
                    {label}
                    {done && value ? <span className="text-muted-foreground"> · {value}</span> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {step === 0 ? (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Which asset?</h2>
            <AssetSearch mode="inline" size="lg" autoFocus onPick={setAssetId} />
          </section>
        ) : null}

        {step === 1 && a ? (
          <section className="min-h-0 overflow-y-auto">
            <h2 className="text-lg font-semibold text-foreground">What on {a.name}?</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              {a.code} · {locationName(a.locationId)} · the AI read its documents and work orders
            </p>
            <Legend className="mb-2" />
            <div role="listbox" className="space-y-1 rounded-xl border border-border bg-card p-1.5">
              {tasks.map((t) => (
                <TaskOption key={t.job.id} task={t} onPick={setJobId} className="py-3" />
              ))}
              <form
                className="flex items-center gap-2 border-t border-border px-2.5 pt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const m = matchTask(typed, a.id, s);
                  setMiss(!m);
                  if (m) setJobId(m.job.id);
                }}
              >
                <Sparkles className="size-4 shrink-0 text-indigo-500" />
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Something else? Describe it and press Enter"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-text-placeholder"
                />
              </form>
              {miss ? <p className="px-2.5 pb-1 text-xs text-muted-foreground">No match in the prototype. Try clean, inspect, repair, change or service.</p> : null}
            </div>
          </section>
        ) : null}

        {step === 2 && task ? <Receipt task={task} onAnother={() => goTo(0)} /> : null}
      </div>
    </VariantPage>
  );
}
