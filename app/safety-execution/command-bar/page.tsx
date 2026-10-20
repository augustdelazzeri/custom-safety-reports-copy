"use client";

import { AssetOption, useRecentAssets } from "@/components/three-cases/exec/asset-search";
import { Receipt } from "@/components/three-cases/exec/receipt";
import { Legend, useReadiness } from "@/components/three-cases/exec/status";
import { TaskOption } from "@/components/three-cases/exec/task-option";
import { VariantPage } from "@/components/three-cases/exec/variant-page";
import { asset as getAsset } from "@/lib/three-cases/data";
import { SUGGESTED_ASSETS, assetSummary, matchTask, searchAssets, taskStatus, tasksFor } from "@/lib/three-cases/tasks";
import { Command, CornerDownLeft, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";

/**
 * A · Command bar. One field does everything: type the asset, pick it, type or pick the task,
 * Enter shows the receipt, Enter again creates. Picked values become chips inside the field.
 */
export default function CommandBarPage() {
  const s = useReadiness();
  const { recent, push } = useRecentAssets();
  const [assetId, setAssetId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const a = assetId ? getAsset(assetId) : undefined;
  const task = jobId ? taskStatus(jobId, s) : undefined;

  const assetOptions = query.trim()
    ? searchAssets(query)
    : [...SUGGESTED_ASSETS, ...recent.filter((r) => !SUGGESTED_ASSETS.some((x) => x.id === r.id))];
  const tasks = a ? tasksFor(a.id, s) : [];
  const typedTask = a && query.trim() ? matchTask(query, a.id, s) : undefined;
  const taskOptions = a ? (query.trim() ? (typedTask ? [typedTask] : []) : tasks) : [];

  const focus = () => setTimeout(() => inputRef.current?.focus(), 0);
  const pickAsset = (id: string) => {
    push(id);
    setAssetId(id);
    setJobId(null);
    setQuery("");
    setActive(0);
    focus();
  };
  const pickTask = (id: string) => {
    setJobId(id);
    setQuery("");
    focus();
  };
  const clearAsset = () => {
    setAssetId(null);
    setJobId(null);
    focus();
  };

  const stage = !a ? "asset" : !task ? "task" : "review";
  const count = stage === "asset" ? assetOptions.length : stage === "task" ? taskOptions.length : 0;

  return (
    <VariantPage note="A · Command bar. Keyboard first: type, arrows, Enter. Every pick becomes a chip in the same field.">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col pt-[6vh]">
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <Command className="size-4 text-indigo-600" />
          What are we executing?
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm focus-within:border-indigo-300 focus-within:shadow-md">
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-2.5" onClick={() => inputRef.current?.focus()}>
            {a ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 py-1 pl-2 pr-1 text-sm text-gray-800">
                <span className="font-mono text-[11px] text-gray-500">{a.code}</span> {a.name}
                <button onClick={clearAsset} className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700" aria-label="Remove asset">
                  <X className="size-3" />
                </button>
              </span>
            ) : null}
            {task ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 py-1 pl-2 pr-1 text-sm text-indigo-900">
                {task.job.verb}
                <button
                  onClick={() => {
                    setJobId(null);
                    focus();
                  }}
                  className="rounded p-0.5 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700"
                  aria-label="Remove task"
                >
                  <X className="size-3" />
                </button>
              </span>
            ) : null}
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(i + 1, count - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (stage === "asset" && assetOptions[active]) pickAsset(assetOptions[active].id);
                  else if (stage === "task" && taskOptions[active]) pickTask(taskOptions[active].job.id);
                } else if (e.key === "Backspace" && !query) {
                  if (task) setJobId(null);
                  else if (a) setAssetId(null);
                }
              }}
              placeholder={
                stage === "asset" ? "Asset name or code: fl3, forklift, HP-04" : stage === "task" ? `What on ${a?.name}? Pick or type, like "fix the leak"` : "Enter to create"
              }
              className="min-w-[180px] flex-1 bg-transparent py-1 text-base outline-none placeholder:text-gray-400"
            />
            <kbd className="hidden items-center gap-0.5 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400 sm:inline-flex">
              <CornerDownLeft className="size-3" /> Enter
            </kbd>
          </div>

          {stage === "asset" ? (
            <div role="listbox" className="max-h-[52vh] overflow-y-auto border-t border-gray-100 p-1.5">
              {!query.trim() ? (
                <div className="flex items-center gap-1 px-2.5 pb-1 pt-1 text-[11px] font-semibold text-indigo-700">
                  <Sparkles className="size-3" /> Suggested for today, then recent
                </div>
              ) : null}
              {assetOptions.map((x, i) => (
                <AssetOption key={x.id} summary={assetSummary(x, s)} active={i === active} onPick={pickAsset} showHint={!query.trim()} />
              ))}
              {assetOptions.length === 0 ? <div className="px-3 py-3 text-sm text-gray-500">No asset matches &ldquo;{query}&rdquo;</div> : null}
            </div>
          ) : null}

          {stage === "task" ? (
            <div role="listbox" className="max-h-[52vh] overflow-y-auto border-t border-gray-100 p-1.5">
              {taskOptions.map((t, i) => (
                <TaskOption key={t.job.id} task={t} active={i === active} onPick={pickTask} />
              ))}
              {query.trim() && !typedTask ? (
                <div className="px-3 py-3 text-sm text-gray-500">
                  Nothing on {a?.name} matches yet. In the prototype try clean, inspect, repair, change or service.
                </div>
              ) : null}
              {!query.trim() && tasks.length === 0 ? (
                <div className="px-3 py-3 text-sm text-gray-500">No suggestion for {a?.name} yet. Type what you need.</div>
              ) : null}
            </div>
          ) : null}
        </div>

        {stage === "review" && task ? (
          <div className="mt-3">
            <Receipt task={task} onAnother={clearAsset} enterToApprove />
          </div>
        ) : (
          <Legend className="mt-3 justify-center" />
        )}
      </div>
    </VariantPage>
  );
}
