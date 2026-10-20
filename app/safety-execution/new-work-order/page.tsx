"use client";

import { DOC_ICON } from "@/components/three-cases/doc-grid";
import { Created, useApprove } from "@/components/three-cases/exec/receipt";
import { Dot, useReadiness } from "@/components/three-cases/exec/status";
import { VariantPage } from "@/components/three-cases/exec/variant-page";
import { ASSETS, locationName, person } from "@/lib/three-cases/data";
import { matchTask, searchAssets, tasksFor, type Need, type TaskStatus } from "@/lib/three-cases/tasks";
import type { Asset } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, FileCheck, ImagePlus, Loader2, Lock, Paperclip, Plus, RefreshCw, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { useState, type ReactNode } from "react";

// Labels, sections and order copied from the CMMS web-app (WorkOrdersV2/AddEditWorkOrder, en-US
// locale, Oct 2026). Only the "Safety for this job" block under the asset is new.

const input = "h-10 w-full rounded-md border border-[#DFE3E8] bg-white px-3 text-sm text-[#212B36] outline-none placeholder:text-[#919EAB] focus:border-[#0C6FF9]";

function Label({ children, required, ai }: { children: ReactNode; required?: boolean; ai?: boolean }) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[#212B36]">
      <span>
        {children}
        {required ? <span className="ml-0.5 text-[#E5484D]">*</span> : null}
      </span>
      {ai ? (
        <span title="Filled from the Safety job" className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1 text-[10px] font-medium text-indigo-700">
          <Sparkles className="size-2.5" /> AI
        </span>
      ) : null}
    </div>
  );
}

/** A CMMS dropdown that is not part of the flow: looks the same, does nothing. */
function StaticSelect({ label, value, placeholder = "Select", ai, disabled }: { label: string; value?: string; placeholder?: string; ai?: boolean; disabled?: boolean }) {
  return (
    <div className="w-full">
      <Label ai={ai}>{label}</Label>
      <div className={cn(input, "flex items-center justify-between", disabled && "bg-[#F9FAFB]")}>
        <span className={value ? "text-[#212B36]" : "text-[#919EAB]"}>{value ?? placeholder}</span>
        {disabled ? <Lock className="size-3.5 text-[#919EAB]" /> : <ChevronDown className="size-4 text-[#637381]" />}
      </div>
    </div>
  );
}

function Section({ title, children, last = false }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <section className={cn("mx-[25px] mt-[30px] pb-[30px]", !last && "border-b border-[#F2F2F2]")}>
      <h3 className="mb-5 text-lg font-semibold text-[#212B36]">{title}</h3>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

/** The CMMS asset field: type to search. The location line under each name is the one addition. */
function AssetField({ value, onPick }: { value?: Asset; onPick: (a: Asset | undefined) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const list = q.trim() ? searchAssets(q) : [...ASSETS].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="relative w-full">
      <Label>Asset</Label>
      <div className={cn(input, "flex items-center gap-2", open && "border-[#0C6FF9]")}>
        <Search className="size-4 shrink-0 text-[#919EAB]" />
        <input
          value={open ? q : (value?.name ?? "")}
          onFocus={() => {
            setOpen(true);
            setQ("");
          }}
          // Still focused after a pick: a click or a key opens the list again.
          onClick={() => {
            if (open) return;
            setOpen(true);
            setQ("");
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          placeholder="Search by name or code"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#919EAB]"
        />
        {value && !open ? (
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(undefined)} aria-label="Clear asset">
            <X className="size-4 text-[#637381]" />
          </button>
        ) : (
          <ChevronDown className="size-4 shrink-0 text-[#637381]" />
        )}
      </div>
      {open ? (
        <ul role="listbox" className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-[#DFE3E8] bg-white py-1 shadow-lg">
          {list.map((a) => (
            <li
              key={a.id}
              role="option"
              aria-selected={value?.id === a.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPick(a);
                setOpen(false);
              }}
              className={cn("cursor-pointer px-3 py-2 hover:bg-[#F4FAFE]", value?.id === a.id && "bg-[#E2F2FF]")}
            >
              <div className="text-sm text-[#212B36]">{a.name}</div>
              <div className="text-xs text-[#637381]">
                {a.code} · {locationName(a.locationId)}
              </div>
            </li>
          ))}
          {list.length === 0 ? <li className="px-3 py-2 text-sm text-[#637381]">No assets match “{q}”</li> : null}
        </ul>
      ) : null}
    </div>
  );
}

function needLine(n: Need, assetName: string): { text: string; tone: "ok" | "found" | "stale" | "new" | "skip" } {
  if (n.state === "skip") return { text: `Not needed. ${n.note ?? ""}`, tone: "skip" };
  if (n.state === "missing") return { text: "Not on file. The AI drafts it, you approve it", tone: "new" };
  if (n.state === "update" && n.stale) return { text: `${n.note ?? "Needs review"}. Sent to the owner`, tone: "stale" };
  if (n.state === "update") return { text: `AI found it by title. Links it to ${assetName} and attaches it`, tone: "found" };
  return { text: n.created ? "Drafted by an earlier job. Attaches" : "On file. Attaches", tone: "ok" };
}

const TONE = {
  ok: "text-emerald-700",
  found: "text-sky-700",
  stale: "text-amber-700",
  new: "text-indigo-700",
  skip: "text-[#919EAB]",
};

/** What the work order needs from Safety: one row per document, then the permit. */
function SafetyBlock({ a, tasks, task, source, onTask }: { a: Asset; tasks: TaskStatus[]; task?: TaskStatus; source: "ai" | "title" | "you"; onTask: (id: string) => void }) {
  if (!tasks.length) {
    return (
      <div className="rounded-lg border border-dashed border-[#DFE3E8] px-4 py-3 text-sm text-[#637381]">
        <ShieldCheck className="mr-1.5 inline size-4 text-[#919EAB]" />
        Safety has nothing for {a.name} yet. Write the job in the title and the AI checks which documents it needs.
      </div>
    );
  }
  const holds = task
    ? [
        ...task.needs.filter((n) => n.state === "missing" || (n.state === "update" && n.stale)).map((n) => n.ref ?? n.label),
        ...(task.job.recurring ? [] : task.runs.filter((r) => r.kind === "ptw").map((r) => r.ref ?? "the permit")),
      ]
    : [];
  return (
    <div className="rounded-lg border border-indigo-100 bg-[#FAFAFF]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#212B36]">
          <ShieldCheck className="size-4 text-indigo-600" /> Safety for this job
          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">UpKeep Safety</span>
        </div>
        <span className="text-xs text-[#637381]">{source === "ai" ? "The AI picked the job from the asset. Change it below" : source === "title" ? "Matched to the title" : "Picked by you"}</span>
      </div>
      <div className="space-y-3 px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {tasks.map((t) => (
            <button
              key={t.job.id}
              type="button"
              onClick={() => onTask(t.job.id)}
              title={t.headline}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                task?.job.id === t.job.id ? "border-[#0C6FF9] bg-[#E2F2FF] text-[#0954BD]" : "border-[#DFE3E8] bg-white text-[#212B36] hover:border-[#0C6FF9]",
              )}
            >
              <Dot level={t.level} className="size-1.5" />
              {t.job.title}
            </button>
          ))}
        </div>

        {task ? (
          <>
            <ul className="divide-y divide-[#EEF0F3] rounded-md border border-[#EEF0F3] bg-white">
              {task.needs.map((n) => {
                const Icon = DOC_ICON[n.type];
                const line = needLine(n, a.name);
                return (
                  <li key={n.type} className="grid grid-cols-[16px_92px_minmax(0,1fr)] items-start gap-2 px-3 py-2 text-sm" title={n.why}>
                    <Icon className={cn("mt-0.5 size-4", TONE[line.tone])} />
                    <span className={cn("font-mono text-xs leading-5", n.state === "skip" ? "text-[#919EAB] line-through" : "text-[#454F5B]")}>{n.ref ?? n.label}</span>
                    <span className="min-w-0">
                      <span className={cn("block truncate", n.state === "skip" ? "text-[#919EAB]" : "text-[#212B36]")}>{n.title ?? `${n.label} for ${a.name}`}</span>
                      <span className={cn("flex items-center gap-1 text-xs", TONE[line.tone])}>
                        {line.tone === "ok" ? <Check className="size-3" /> : line.tone === "found" ? <Sparkles className="size-3" /> : line.tone === "stale" ? <RefreshCw className="size-3" /> : line.tone === "new" ? <Plus className="size-3" /> : null}
                        {line.text}
                      </span>
                    </span>
                  </li>
                );
              })}
              {task.runs
                .filter((r) => r.kind === "ptw")
                .map((r) => (
                  <li key={r.kind} className="grid grid-cols-[16px_92px_minmax(0,1fr)] items-start gap-2 px-3 py-2 text-sm" title={r.why}>
                    <FileCheck className="mt-0.5 size-4 text-indigo-700" />
                    <span className="font-mono text-xs leading-5 text-[#454F5B]">{r.ref ?? "PTW"}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[#212B36]">{task.job.recurring ? "Permit template, one permit per work order" : "Permit to Work for this job"}</span>
                      <span className="flex items-center gap-1 text-xs text-indigo-700">
                        <Plus className="size-3" /> Created with the work order. {r.why ?? "Two approvals"}
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
            <p className="flex items-start gap-1.5 text-xs text-[#454F5B]">
              <Dot level={task.level} className="mt-1" />
              {task.level === "scheduled" && task.meta.pm
                ? `${task.meta.pm.ref} already creates this work order ${task.meta.pm.rule.toLowerCase()}. This one is extra.`
                : holds.length
                  ? `The work order is created now and reaches ${person(task.job.assigneeId).name.split(" ")[0]}'s phone once ${holds.join(", ")} ${holds.length === 1 ? "is" : "are"} approved.`
                  : `Every document is on file. ${person(task.job.assigneeId).name.split(" ")[0]} gets the work order with them attached.`}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

/** A faded CMMS work order list behind the modal. */
function ListBehind() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden rounded-xl bg-[#FAFAFA] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl font-semibold text-[#212B36]">Work Orders</div>
        <div className="h-9 w-40 rounded-md bg-[#0C6FF9]" />
      </div>
      <div className="mb-3 flex gap-2">
        {[80, 96, 72, 110].map((w) => (
          <div key={w} className="h-8 rounded-md border border-[#DFE3E8] bg-white" style={{ width: w }} />
        ))}
      </div>
      <div className="rounded-lg border border-[#DFE3E8] bg-white">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-[#F2F2F2] px-4 py-3">
            <div className="h-3 w-16 rounded bg-[#DFE3E8]" />
            <div className="h-3 flex-1 rounded bg-[#F2F2F2]" />
            <div className="h-3 w-24 rounded bg-[#F2F2F2]" />
            <div className="h-5 w-16 rounded-full bg-[#E2F2FF]" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[#161C24]/40" />
    </div>
  );
}

/**
 * E · New work order. Today's CMMS form, field for field. Picking the asset brings a Safety block
 * under it: the job the AI expects, each document it needs with what happens to it, and the
 * permit. The title, dates, assignee and checklist fill in from that job.
 */
export default function NewWorkOrderPage() {
  const s = useReadiness();
  const [a, setA] = useState<Asset | undefined>();
  const [picked, setPicked] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [plainDone, setPlainDone] = useState(false);

  const tasks = a ? tasksFor(a.id, s) : [];
  const matched = a && titleTouched && title.trim() ? matchTask(title, a.id, s) : undefined;
  const task = tasks.find((t) => t.job.id === picked) ?? matched ?? tasks[0];
  const source = tasks.some((t) => t.job.id === picked) ? "you" : matched ? "title" : "ai";
  const approval = useApprove(task);
  const j = task?.job;
  const fromJob = Boolean(j);

  const shownTitle = titleTouched ? title : (j?.title ?? "");
  const missing = !shownTitle.trim();
  const holdsDocs = task ? task.needs.filter((n) => n.state === "missing").map((n) => n.ref ?? n.label) : [];
  const permit = task?.runs.find((r) => r.kind === "ptw");
  const attach = task ? task.needs.filter((n) => n.state === "ok" || (n.state === "update" && !n.stale)).map((n) => n.ref as string) : [];

  const reset = () => {
    setA(undefined);
    setPicked(undefined);
    setTitle("");
    setTitleTouched(false);
    setPlainDone(false);
  };

  const create = () => {
    if (missing) return;
    if (task) approval.approve();
    else setPlainDone(true);
  };

  return (
    <VariantPage note="E · New work order. Today's CMMS form, field for field. Picking the asset brings the job's safety documents under it, and the AI fills the rest from that job.">
      <div className="relative h-full min-h-0">
        <ListBehind />
        <div className="absolute inset-x-4 inset-y-3 mx-auto flex max-w-[1148px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
          <div className="flex h-[74px] shrink-0 items-center justify-between px-6">
            <h2 className="text-xl font-semibold text-[#212B36]">New Work Order</h2>
            <X className="size-6 text-[#454F5B]" />
          </div>
          <div className="flex shrink-0 gap-6 border-b border-[#DFE3E8] px-6 text-sm">
            <span className="border-b-2 border-[#0C6FF9] pb-2.5 font-medium text-[#0C6FF9]">Create</span>
            <span className="flex items-center gap-1 pb-2.5 text-[#637381]">
              Templates <span className="rounded bg-[#E2F2FF] px-1.5 text-[11px] font-medium text-[#0954BD]">New</span>
            </span>
          </div>

          {approval.phase === "done" && task ? (
            <div className="flex flex-1 items-center justify-center p-10">
              <div className="w-full max-w-md rounded-lg border border-[#DFE3E8] p-6">
                <Created task={task} approval={approval} onAnother={reset} />
              </div>
            </div>
          ) : plainDone ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-sm text-[#454F5B]">
              <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                <Check className="size-4" /> Work order created, no Safety documents attached
              </span>
              <button type="button" onClick={reset} className="rounded-md border border-[#DFE3E8] px-3 py-1.5 text-sm">
                New work order
              </button>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-6">
                <Section title="Work Order Details">
                  <div>
                    <Label required ai={fromJob && !titleTouched}>
                      Work Order Title
                    </Label>
                    <input
                      value={shownTitle}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setTitleTouched(true);
                      }}
                      placeholder="What needs to be done?"
                      className={input}
                    />
                  </div>
                  <div>
                    <Label ai={fromJob}>Description</Label>
                    <textarea readOnly value={j ? j.reason : ""} placeholder="Add a description" className={cn(input, "h-20 resize-none py-2")} />
                  </div>
                  <div className="flex gap-5">
                    <StaticSelect label="Category" value={fromJob ? "Safety" : undefined} ai={fromJob} />
                    <StaticSelect label="Priority" value={fromJob ? "Medium" : undefined} placeholder="None" />
                  </div>
                  <div>
                    <Label>Photos</Label>
                    <div className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#DFE3E8] text-xs text-[#637381]">
                      <ImagePlus className="size-5" /> Add photos
                    </div>
                  </div>
                </Section>

                <Section title="Job Specifications">
                  <div className="flex gap-5">
                    <AssetField
                      value={a}
                      onPick={(x) => {
                        setA(x);
                        setPicked(undefined);
                      }}
                    />
                    <StaticSelect label="Location" value={a ? locationName(a.locationId) : undefined} placeholder="Select location" disabled={Boolean(a)} />
                  </div>
                  {a ? <SafetyBlock a={a} tasks={tasks} task={task} source={source} onTask={setPicked} /> : null}
                  <div className="flex gap-5">
                    <StaticSelect label="Start Date" value={j ? "Today" : undefined} placeholder="mm/dd/yyyy" />
                    <StaticSelect label="Due Date" value={j?.when} placeholder="mm/dd/yyyy" ai={fromJob} />
                  </div>
                  <div className="w-1/2 pr-2.5">
                    <StaticSelect label="Duration (as hours)" value={j ? "1.5" : undefined} placeholder="0" />
                  </div>
                </Section>

                <Section title="Assignment & Team">
                  <div className="flex gap-5">
                    <StaticSelect label="Primary Assignee" value={j ? person(j.assigneeId).name : undefined} ai={fromJob} />
                    <StaticSelect label="Team(s)" value={j ? "Maintenance" : undefined} />
                  </div>
                  <StaticSelect label="Additional Assignee(s)" />
                </Section>

                <Section title="Parts">
                  <StaticSelect label="Parts" placeholder="Select parts" />
                </Section>

                <Section title="Tasks & Checklists">
                  {j ? (
                    <div className="rounded-md border border-[#DFE3E8]">
                      <div className="flex items-center justify-between border-b border-[#F2F2F2] px-3 py-2 text-sm font-medium text-[#212B36]">
                        <span className="flex items-center gap-1.5">
                          Checklist from {task?.needs.find((n) => n.type === "sop")?.ref ?? "the job"}
                          <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1 text-[10px] font-medium text-indigo-700">
                            <Sparkles className="size-2.5" /> AI
                          </span>
                        </span>
                        <span className="text-xs font-normal text-[#637381]">{j.checklist.length} steps</span>
                      </div>
                      <ol className="space-y-1 px-3 py-2 text-sm text-[#454F5B]">
                        {j.checklist.map((c, i) => (
                          <li key={c} className="flex gap-2">
                            <span className="mt-0.5 size-4 shrink-0 rounded border border-[#C4CDD5]" />
                            <span>
                              {i + 1}. {c}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <p className="text-sm text-[#919EAB]">No tasks yet</p>
                  )}
                  <div className="flex gap-2">
                    <span className="rounded-md border border-[#DFE3E8] px-3 py-1.5 text-sm text-[#212B36]">Add Task</span>
                    <span className="rounded-md border border-[#DFE3E8] px-3 py-1.5 text-sm text-[#212B36]">Add Checklist</span>
                  </div>
                </Section>

                <Section title="Documents & Reference">
                  <div>
                    <Label ai={attach.length > 0}>Files</Label>
                    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-[#DFE3E8] px-3 py-3 text-sm text-[#637381]">
                      {attach.length ? (
                        attach.map((r) => (
                          <span key={r} className="inline-flex items-center gap-1 rounded bg-[#F4F6F8] px-2 py-1 text-xs text-[#212B36]">
                            <Paperclip className="size-3" /> {r}.pdf
                          </span>
                        ))
                      ) : (
                        <span>Drag and drop or click to upload</span>
                      )}
                      {holdsDocs.length ? <span className="text-xs text-indigo-700">+ {holdsDocs.join(", ")} once approved</span> : null}
                    </div>
                  </div>
                  <StaticSelect label="Purchase Orders" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#212B36]">Signature Required</div>
                      <div className="text-sm text-[#637381]">Require technicians to upload a signature image in order to complete this work order.</div>
                    </div>
                    <span className="h-5 w-9 rounded-full bg-[#DFE3E8] p-0.5">
                      <span className="block size-4 rounded-full bg-white shadow" />
                    </span>
                  </div>
                </Section>

                <Section title="Custom Fields" last>
                  <p className="text-sm text-[#919EAB]">No custom fields</p>
                </Section>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#DFE3E8] px-6 py-4">
                <button type="button" onClick={reset} className="h-10 rounded-md border border-[#DFE3E8] px-4 text-sm font-medium text-[#212B36] hover:bg-[#F9FAFB]">
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  {missing ? (
                    <span className="text-xs text-[#637381]">Pick the asset and the title fills in, or write it</span>
                  ) : task ? (
                    <span className="text-xs text-[#454F5B]">
                      {[permit ? `also creates ${permit.ref ?? "a permit"}` : "", holdsDocs.length ? `AI drafts ${holdsDocs.join(", ")}` : "", attach.length ? `attaches ${attach.length} Safety document${attach.length === 1 ? "" : "s"}` : ""]
                        .filter(Boolean)
                        .join(" · ")
                        .replace(/^./, (c) => c.toUpperCase())}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    disabled={missing || approval.phase === "running"}
                    onClick={create}
                    className="inline-flex h-10 items-center rounded-md bg-[#0C6FF9] px-4 text-sm font-medium text-white hover:bg-[#0954BD] disabled:opacity-50"
                  >
                    {approval.phase === "running" ? (
                      <>
                        <Loader2 className="mr-1.5 size-4 animate-spin" /> Creating
                      </>
                    ) : (
                      "Create Work Order"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </VariantPage>
  );
}
