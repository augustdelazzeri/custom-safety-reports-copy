"use client";

import { ApproveButton, Created, ReceiptLines, useApprove } from "@/components/three-cases/exec/receipt";
import { Dot, useReadiness } from "@/components/three-cases/exec/status";
import { VariantPage } from "@/components/three-cases/exec/variant-page";
import { asset as getAsset, interpretPrompt, locationName, person } from "@/lib/three-cases/data";
import { SUGGESTED_ASSETS, assetSummary, matchTask, searchAssets, taskStatus, tasksFor, type ReadinessState, type TaskStatus } from "@/lib/three-cases/tasks";
import { cn } from "@/lib/utils";
import { ArrowUp, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Msg {
  id: number;
  from: "ai" | "me";
  text: string;
  /** Quick replies under an AI message. */
  options?: { kind: "asset" | "task"; id: string }[];
}

/** What the AI says once a job is picked: what it read and what it adds. */
function explain(t: TaskStatus) {
  const onFile = t.needs.filter((n) => n.state === "ok").map((n) => n.ref);
  const found = t.needs.filter((n) => n.state === "update" && !n.stale).map((n) => n.ref);
  const drafts = t.needs.filter((n) => n.state === "missing").map((n) => n.label);
  const review = t.needs
    .filter((n) => n.state === "update" && n.stale)
    .map((n) => `${n.ref} (${n.note ? n.note.charAt(0).toLowerCase() + n.note.slice(1) : "needs review"})`);
  const parts = [
    onFile.length ? `${onFile.join(", ")} ${onFile.length === 1 ? "is" : "are"} on file.` : "",
    found.length ? `I found ${found.join(", ")} by title; approving links ${found.length === 1 ? "it" : "them"} to the asset.` : "",
    review.length ? `${review.join(", ")} needs a review, I sent it to the owner.` : "",
    drafts.length ? `There is no ${drafts.join(" or ")} for this, so I drafted ${drafts.length === 1 ? "it" : "them"}.` : "",
    t.meta.permit ? `${t.meta.permit}, so I added one.` : "",
    t.meta.pm ? `${t.meta.pm.ref} already runs this ${t.meta.pm.rule.toLowerCase()}; this would be a one-off.` : "",
    "The receipt on the right is everything that will be created.",
  ];
  return parts.filter(Boolean).join(" ");
}

function pickFromText(text: string, assetId: string | null, s: ReadinessState): { assetId?: string; jobId?: string } {
  if (assetId) return { jobId: matchTask(text, assetId, s)?.job.id };
  // Only an asset's name or code: pick it. A whole sentence: let the AI read the job too.
  const hit = searchAssets(text)[0];
  if (hit) return { assetId: hit.id };
  const r = interpretPrompt(text);
  return r.assetId ? { assetId: r.assetId, jobId: r.jobId && taskStatus(r.jobId, s) ? r.jobId : undefined } : {};
}

/**
 * A · Chat + receipt, an earlier version of option A. The conversation is on the left, with quick replies so nothing has to be
 * typed. The right side is the receipt: it fills in as the conversation goes, and the button is
 * there.
 */
export default function ChatReceiptPage() {
  const s = useReadiness();
  const [assetId, setAssetId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: 0,
      from: "ai",
      text: "Which asset? These need something today, or type a name, a code or the whole job.",
      options: SUGGESTED_ASSETS.map((a) => ({ kind: "asset", id: a.id })),
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const a = assetId ? getAsset(assetId) : undefined;
  const task = jobId ? taskStatus(jobId, s) : undefined;
  const approval = useApprove(task);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const say = (m: Omit<Msg, "id">[]) => setMsgs((prev) => [...prev, ...m.map((x, i) => ({ ...x, id: prev.length + i }))]);

  const chooseAsset = (id: string, echo?: string) => {
    const x = getAsset(id);
    if (!x) return;
    setAssetId(id);
    setJobId(null);
    const ts = tasksFor(id, s);
    say([
      { from: "me", text: echo ?? x.name },
      ts.length
        ? { from: "ai", text: `${x.name} (${locationName(x.locationId)}). I can prepare these:`, options: ts.map((t) => ({ kind: "task", id: t.job.id })) }
        : { from: "ai", text: `I have no suggestion for ${x.name} yet. What do you need done?` },
    ]);
  };

  const chooseTask = (id: string, echo?: string) => {
    const t = taskStatus(id, s);
    if (!t) return;
    setJobId(id);
    say([
      { from: "me", text: echo ?? t.job.title },
      { from: "ai", text: explain(t) },
    ]);
  };

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    setText("");
    const r = pickFromText(value, assetId, s);
    if (r.assetId && r.jobId) {
      setAssetId(r.assetId);
      const t = taskStatus(r.jobId, s);
      setJobId(r.jobId);
      if (t) say([{ from: "me", text: value }, { from: "ai", text: `${getAsset(r.assetId)?.name}: ${t.job.title.toLowerCase()}. ${explain(t)}` }]);
    } else if (r.assetId) chooseAsset(r.assetId, value);
    else if (r.jobId) chooseTask(r.jobId, value);
    else say([{ from: "me", text: value }, { from: "ai", text: "I did not get that. In the prototype try an asset (forklift, press, compressor) or a job (clean, inspect, repair)." }]);
  };

  return (
    <VariantPage note="A · Chat + receipt (earlier version). Quick replies make it clickable; typing the whole job works too. The right side is what will exist.">
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_400px] gap-3">
        <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m) => (
              <div key={m.id} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%]", m.from === "me" ? "" : "flex gap-2")}>
                  {m.from === "ai" ? (
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                      <Sparkles className="size-3.5" />
                    </span>
                  ) : null}
                  <div>
                    <div className={cn("rounded-2xl px-3 py-2 text-sm", m.from === "me" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800")}>{m.text}</div>
                    {m.options ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.options.map((o) => {
                          if (o.kind === "asset") {
                            const x = getAsset(o.id);
                            if (!x) return null;
                            const sum = assetSummary(x, s);
                            return (
                              <button
                                key={o.id}
                                onClick={() => chooseAsset(o.id)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-800 hover:border-indigo-300"
                                title={x.aiHint}
                              >
                                <span className="flex gap-0.5">
                                  {sum.tasks.map((t) => (
                                    <Dot key={t.job.id} level={t.level} className="size-1.5" />
                                  ))}
                                </span>
                                {x.name}
                              </button>
                            );
                          }
                          const t = taskStatus(o.id, s);
                          if (!t) return null;
                          return (
                            <button
                              key={o.id}
                              onClick={() => chooseTask(o.id)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-800 hover:border-indigo-300"
                              title={t.headline}
                            >
                              <Dot level={t.level} className="size-1.5" />
                              {t.job.title}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            className="m-3 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 focus-within:border-indigo-300"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={a ? `Something on ${a.name}…` : "Clean Forklift 3 tomorrow morning"}
              className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400"
            />
            <button type="submit" disabled={!text.trim()} className="flex size-7 items-center justify-center rounded-md bg-indigo-600 text-white disabled:opacity-40" aria-label="Send">
              <ArrowUp className="size-4" />
            </button>
          </form>
        </div>

        <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">What will exist</div>
            <dl className="mt-2 grid grid-cols-[56px_minmax(0,1fr)] gap-y-1 text-sm">
              <dt className="text-gray-400">Asset</dt>
              <dd className={cn("truncate", a ? "text-gray-900" : "text-gray-300")}>{a ? `${a.code} · ${a.name}` : "—"}</dd>
              <dt className="text-gray-400">Job</dt>
              <dd className={cn("truncate", task ? "text-gray-900" : "text-gray-300")}>{task ? task.job.title : "—"}</dd>
              <dt className="text-gray-400">When</dt>
              <dd className={cn("truncate", task ? "text-gray-900" : "text-gray-300")}>{task ? `${task.job.when} · ${person(task.job.assigneeId).name}` : "—"}</dd>
            </dl>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {task ? (
              approval.phase === "done" ? (
                <Created task={task} approval={approval} />
              ) : (
                <ReceiptLines task={task} />
              )
            ) : (
              <p className="text-xs text-gray-400">Documents and work order appear here as you answer.</p>
            )}
          </div>
          {task && approval.phase !== "done" ? (
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-3">
              <span className="text-[11px] text-gray-500">Nothing is created until you approve</span>
              <ApproveButton task={task} approval={approval} />
            </div>
          ) : null}
        </div>
      </div>
    </VariantPage>
  );
}
