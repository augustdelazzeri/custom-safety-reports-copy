"use client";

import { AssetSearch } from "@/components/three-cases/exec/asset-search";
import { ApproveButton, Created, ReceiptLines, useApprove } from "@/components/three-cases/exec/receipt";
import { LEVEL, NeedChips, useReadiness } from "@/components/three-cases/exec/status";
import { TaskOption } from "@/components/three-cases/exec/task-option";
import { VariantPage } from "@/components/three-cases/exec/variant-page";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { asset as getAsset, person } from "@/lib/three-cases/data";
import { matchTask, taskStatus, tasksFor } from "@/lib/three-cases/tasks";
import type { Asset, ExecutionJob } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

/** "Clean Forklift 3" → "clean"; "Run the pre-use inspection on Forklift 3" → "run the pre-use inspection". */
function shortTask(j: ExecutionJob, a: Asset) {
  const s = j.title.replace(new RegExp(`\\s*(on|of|at)?\\s*${a.name}`, "i"), "").trim();
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function Blank({ children, filled, onClick, ai }: { children: ReactNode; filled: boolean; onClick?: () => void; ai?: boolean }) {
  const cls = cn(
    "inline-flex items-baseline gap-1 border-b-2 px-0.5 transition",
    filled ? "border-indigo-300 font-medium text-gray-900" : "border-dashed border-gray-300 text-gray-400",
    onClick && "hover:border-indigo-500 hover:text-indigo-800",
    ai && "border-dotted border-gray-300 font-normal text-gray-700",
  );
  if (!onClick) {
    return (
      <span className={cls} title="Filled by the AI from the SOP and the team's calendar. Change it on the work order.">
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
      <ChevronDown className="size-4 self-center text-gray-400" />
    </button>
  );
}

/**
 * A · Sentence, an earlier version of option A. The whole job is one sentence with blanks. Asset and task are the only blanks
 * you fill; when and who come filled by the AI. Under the sentence: what exists, what gets created,
 * and the button.
 */
export default function SentencePage() {
  const s = useReadiness();
  const [assetId, setAssetId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [open, setOpen] = useState<"asset" | "task" | null>("asset");
  const [typed, setTyped] = useState("");
  const [miss, setMiss] = useState(false);
  const [details, setDetails] = useState(false);

  const a = assetId ? getAsset(assetId) : undefined;
  const task = jobId ? taskStatus(jobId, s) : undefined;
  const approval = useApprove(task);
  const tasks = a ? tasksFor(a.id, s) : [];

  const restart = () => {
    setAssetId(null);
    setJobId(null);
    setOpen("asset");
  };

  return (
    <VariantPage note="A · Sentence (earlier version). Two blanks to fill (asset and task); when and who come from the AI. The button says exactly what it creates.">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center pb-[12vh]">
        <p className="text-[28px] font-light leading-[1.7] text-gray-600">
          On{" "}
          <Popover open={open === "asset"} onOpenChange={(o) => setOpen(o ? "asset" : null)}>
            <PopoverAnchor asChild>
              <span>
                <Blank filled={Boolean(a)} onClick={() => setOpen("asset")}>
                  {a ? a.name : "which asset"}
                </Blank>
              </span>
            </PopoverAnchor>
            <PopoverContent align="start" className="w-[440px] p-2">
              <AssetSearch
                mode="inline"
                autoFocus
                onPick={(id) => {
                  setAssetId(id);
                  setJobId(null);
                  setOpen("task");
                }}
              />
            </PopoverContent>
          </Popover>
          :{" "}
          <Popover open={open === "task"} onOpenChange={(o) => setOpen(o ? "task" : null)}>
            <PopoverAnchor asChild>
              <span>
                <Blank filled={Boolean(task)} onClick={a ? () => setOpen("task") : undefined}>
                  {task && a ? shortTask(task.job, a) : "what job"}
                </Blank>
              </span>
            </PopoverAnchor>
            <PopoverContent align="start" className="w-[480px] p-2">
              <div className="flex items-center gap-1 px-2.5 pb-1 pt-1 text-[11px] font-semibold text-indigo-700">
                <Sparkles className="size-3" /> Suggested for {a?.name}
              </div>
              {tasks.map((t) => (
                <TaskOption
                  key={t.job.id}
                  task={t}
                  onPick={(id) => {
                    setJobId(id);
                    setOpen(null);
                  }}
                />
              ))}
              <form
                className="mt-1 border-t border-gray-100 px-1 pt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const m = a ? matchTask(typed, a.id, s) : undefined;
                  setMiss(!m);
                  if (m) {
                    setJobId(m.job.id);
                    setTyped("");
                    setOpen(null);
                  }
                }}
              >
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Or describe it: replace the hose, change the oil…"
                  className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-300"
                />
                {miss ? <p className="px-1 pt-1 text-[11px] text-gray-500">No match in the prototype. Try clean, inspect, repair, change or service.</p> : null}
              </form>
            </PopoverContent>
          </Popover>
          {task ? (
            <>
              ,{" "}
              <Blank filled ai>
                {/^(Today|Tomorrow|Every)/.test(task.job.when) ? task.job.when.charAt(0).toLowerCase() + task.job.when.slice(1) : task.job.when}
              </Blank>
              , by{" "}
              <Blank filled ai>
                {person(task.job.assigneeId).name}
              </Blank>
            </>
          ) : null}
          .
        </p>

        <div className={cn("mt-6 min-h-[120px] transition", task ? "opacity-100" : "opacity-0")}>
          {task ? (
            approval.phase === "done" ? (
              <Created task={task} approval={approval} onAnother={restart} />
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <NeedChips task={task} />
                  <span className={cn("text-xs", LEVEL[task.level].text)}>{task.headline}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ApproveButton task={task} approval={approval} size="default" />
                  <button onClick={() => setDetails((d) => !d)} className="text-xs font-medium text-gray-500 hover:text-gray-800">
                    {details ? "Hide details" : "See details"}
                  </button>
                </div>
                {details ? (
                  <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-3">
                    <ReceiptLines task={task} />
                  </div>
                ) : null}
              </div>
            )
          ) : null}
        </div>
      </div>
    </VariantPage>
  );
}
