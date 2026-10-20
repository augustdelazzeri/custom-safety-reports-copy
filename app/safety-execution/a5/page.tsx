"use client";

import { AssetSearch } from "@/components/three-cases/exec/asset-search";
import { ApproveButton, ReceiptLines, useApprove } from "@/components/three-cases/exec/receipt";
import { Dot, LEVEL, Legend, NeedChips, useReadiness } from "@/components/three-cases/exec/status";
import { VariantPage } from "@/components/three-cases/exec/variant-page";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { asset as getAsset, locationName, person } from "@/lib/three-cases/data";
import { matchTask, tasksFor, type TaskStatus } from "@/lib/three-cases/tasks";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronRight, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function TaskRow({ task, highlight }: { task: TaskStatus; highlight?: boolean }) {
  const approval = useApprove(task);
  const [open, setOpen] = useState(false);
  const done = approval.phase === "done";
  return (
    <li className={cn("border-b border-gray-100 last:border-0", highlight && "bg-indigo-50/40", done && "bg-emerald-50/40")}>
      <div className="grid grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Dot level={done ? "ready" : task.level} />
        <button onClick={() => setOpen((o) => !o)} className="flex min-w-0 items-start gap-1.5 text-left">
          <ChevronRight className={cn("mt-0.5 size-4 shrink-0 text-gray-300 transition", open && "rotate-90")} />
          <span className="min-w-0">
            <span className="flex items-baseline gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{task.job.verb}</span>
              <span className="truncate text-sm font-medium text-gray-900">{task.job.title}</span>
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <NeedChips task={task} />
              <span className="text-[11px] text-gray-500">
                {task.job.when} · {person(task.job.assigneeId).name}
              </span>
            </span>
          </span>
        </button>
        {done && approval.exId ? (
          <span className="flex items-center gap-2 text-xs text-emerald-700">
            <Check className="size-4" /> {approval.created?.refs.join(", ")}
            <Button asChild size="sm" variant="outline">
              <Link href={`/safety-execution/work-orders/${approval.exId}`}>Open {task.job.woRef}</Link>
            </Button>
          </span>
        ) : (
          <ApproveButton task={task} approval={approval} className={cn(task.level !== "ready" && task.level !== "scheduled" && "bg-gray-900 hover:bg-gray-800")} />
        )}
      </div>
      {open && !done ? (
        <div className="px-12 pb-3">
          <p className={cn("mb-2 text-xs", LEVEL[task.level].text)}>{task.headline}</p>
          <ReceiptLines task={task} />
        </div>
      ) : null}
    </li>
  );
}

/**
 * A · One list, an earlier version of option A. The asset is a switcher in the header, like a workspace. The page is one list of
 * jobs; each row says what it needs and creates, and its button is the approval. Two clicks:
 * the asset, then the row's button.
 */
export default function OneListPage() {
  const s = useReadiness();
  const [assetId, setAssetId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(true);
  const [typed, setTyped] = useState("");
  const [hit, setHit] = useState<string | null>(null);
  const [miss, setMiss] = useState(false);
  const a = assetId ? getAsset(assetId) : undefined;
  const tasks = a ? tasksFor(a.id, s) : [];

  return (
    <VariantPage note="A · One list (earlier version). The asset is a switcher at the top; each job row carries its own create button. No separate review screen.">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left shadow-sm hover:border-indigo-300">
                <MapPin className="size-4 text-gray-400" />
                {a ? (
                  <span className="text-sm">
                    <span className="text-gray-500">{locationName(a.locationId)} › </span>
                    <span className="font-mono text-xs text-gray-400">{a.code} </span>
                    <span className="font-semibold text-gray-900">{a.name}</span>
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Pick an asset</span>
                )}
                <ChevronDown className="size-4 text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[440px] p-2">
              <AssetSearch
                mode="inline"
                autoFocus
                onPick={(id) => {
                  setAssetId(id);
                  setHit(null);
                  setPickerOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {a ? <span className="text-xs text-gray-500">Owner {person(a.ownerId).name}</span> : null}
          <Legend className="ml-auto" />
        </div>

        {a ? (
          <ul className="overflow-y-auto rounded-xl border border-gray-200 bg-white">
            {tasks.map((t) => (
              <TaskRow key={t.job.id} task={t} highlight={hit === t.job.id} />
            ))}
            <li className="px-4 py-2.5">
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const m = matchTask(typed, a.id, s);
                  setMiss(!m);
                  setHit(m?.job.id ?? null);
                  if (m) setTyped("");
                }}
              >
                <Sparkles className="size-4 shrink-0 text-indigo-500" />
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={`Something else on ${a.name}? Describe it and press Enter`}
                  className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400"
                />
              </form>
              {miss ? <p className="pl-6 pt-1 text-[11px] text-gray-500">No match in the prototype. Try clean, inspect, repair, change or service.</p> : null}
              {hit ? <p className="pl-6 pt-1 text-[11px] text-indigo-700">That is the highlighted row above.</p> : null}
            </li>
          </ul>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Pick an asset to see its jobs</div>
        )}
      </div>
    </VariantPage>
  );
}
