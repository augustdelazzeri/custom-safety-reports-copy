"use client";

import { Button } from "@/components/ui/button";
import { DOC_ICON } from "@/components/three-cases/doc-grid";
import { AiTag, Avatar, PageShell } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { asset as getAsset, job as getJob, locationName, person } from "@/lib/three-cases/data";
import type { SafetyDoc } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Camera,
  Check,
  Clock,
  Copy,
  FileCheck,
  MessageSquare,
  Plus,
  QrCode,
  Repeat,
  Smartphone,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

export default function ExecutionWorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { executions, hydrated, updateExecution } = useThreeCases();
  const execution = executions.find((e) => e.id === id);
  const [newItem, setNewItem] = useState("");
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!hydrated) {
    return (
      <PageShell title="Work order">
        <div className="text-sm text-gray-500">Loading…</div>
      </PageShell>
    );
  }

  if (!execution) {
    return (
      <PageShell title="Work order">
        <div className="mx-auto mt-16 max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-700">This work order only exists in the browser where it was created.</p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/safety-execution">Go to Safety Execution</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const job = getJob(execution.jobId);
  const a = job ? getAsset(job.assetId) : undefined;
  const assignee = person(execution.assigneeId);
  const docIds = job?.basedOn ?? [];
  const attached: SafetyDoc[] = (a?.docs ?? []).filter((d) => docIds.includes(d.id));
  const permitItem = job?.plan.find((p) => p.kind === "ptw");
  const newDocs = job?.plan.filter((p) => p.isNew && (p.kind === "sop" || p.kind === "loto" || p.kind === "jha" || p.kind === "audit")) ?? [];
  const approvers = ["maria", "dan"];
  const permitApproved = execution.permitStatus === "approved";

  const approve = (pid: string) => {
    const next = { ...approvals, [pid]: true };
    setApprovals(next);
    if (approvers.every((p) => next[p])) updateExecution(execution.id, { permitStatus: "approved" });
  };

  const move = (i: number, dir: -1 | 1) => {
    const list = [...execution.checklist];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    updateExecution(execution.id, { checklist: list });
  };

  return (
    <PageShell title="Safety Work Order" mainClassName="p-4 md:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <Link href="/safety-execution" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="size-4" /> Safety Execution
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-gray-500">{execution.woRef}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  execution.permitStatus === "pending" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700",
                )}
              >
                {execution.permitStatus === "pending" ? "Waiting for permit approval" : execution.recurring ? "Scheduled, recurring" : "Scheduled"}
              </span>
              <AiTag label="Created from the AI plan" />
            </div>
            <h1 className="mt-1 text-xl font-semibold text-gray-900">{job?.title}</h1>
            <p className="text-sm text-gray-500">
              {a?.code} {a?.name} · {a ? locationName(a.locationId) : ""} · {job?.when}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateExecution(execution.id, { sentToPhone: true })}
              disabled={execution.sentToPhone}
            >
              <Smartphone className="mr-1.5 size-4" />
              {execution.sentToPhone ? `Sent to ${assignee.name.split(" ")[0]}'s phone` : `Send to ${assignee.name.split(" ")[0]}'s phone`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${window.location.origin}/safety-execution/mobile?wo=${execution.id}`);
                } catch {
                  // Clipboard can be blocked; the button still confirms for the demo.
                }
                setCopied(true);
              }}
            >
              <Copy className="mr-1.5 size-4" /> {copied ? "Link copied" : "Copy link"}
            </Button>
            <Button asChild size="sm">
              <Link href={`/safety-execution/mobile?wo=${execution.id}`}>
                <Smartphone className="mr-1.5 size-4" /> Open as technician
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">Checklist</h2>
                <span className="text-xs text-gray-500">Built from {attached.find((d) => d.type === "sop" || d.type === "audit")?.ref ?? "the new SOP"} · edit freely</span>
              </div>
              <ol className="divide-y divide-gray-100">
                {execution.checklist.map((item, i) => (
                  <li key={`${item}-${i}`} className="group flex items-center gap-3 px-4 py-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">{i + 1}</span>
                    <span className="flex-1 text-sm text-gray-800">{item}</span>
                    {/photo/i.test(item) ? (
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] text-indigo-700">
                        <Camera className="size-3" /> Photo, checked by AI
                      </span>
                    ) : null}
                    <span className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                      <button className="rounded p-1 text-gray-400 hover:bg-gray-100" onClick={() => move(i, -1)} aria-label="Move up">
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button className="rounded p-1 text-gray-400 hover:bg-gray-100" onClick={() => move(i, 1)} aria-label="Move down">
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        className="rounded p-1 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => updateExecution(execution.id, { checklist: execution.checklist.filter((_, k) => k !== i) })}
                        aria-label="Remove"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ol>
              <form
                className="flex items-center gap-2 border-t border-gray-100 px-4 py-2.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newItem.trim()) return;
                  updateExecution(execution.id, { checklist: [...execution.checklist, newItem.trim()] });
                  setNewItem("");
                }}
              >
                <Plus className="size-4 text-gray-400" />
                <input
                  id="new-checklist-item"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add a step"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </form>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">Documents on this work order</h2>
                <p className="text-xs text-gray-500">The technician opens them from the work order, on the phone or in the CMMS.</p>
              </div>
              <ul className="grid grid-cols-1 gap-2 p-3 md:grid-cols-2">
                {attached.map((d) => {
                  const Icon = DOC_ICON[d.type];
                  return (
                    <li key={d.id} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                      <Icon className="size-4 text-gray-500" />
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[11px] text-gray-500">{d.ref}</div>
                        <div className="truncate text-sm text-gray-800">{d.title}</div>
                      </div>
                      <button className="text-xs font-medium text-indigo-700 hover:underline">Open</button>
                    </li>
                  );
                })}
                {newDocs.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/40 px-3 py-2">
                    <FileCheck className="size-4 text-indigo-600" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium text-indigo-700">New draft, waiting for approval</div>
                      <div className="truncate text-sm text-gray-800">{p.title.replace(/^New (SOP|LOTO|JHA|inspection): /, "")}</div>
                    </div>
                    <button className="text-xs font-medium text-indigo-700 hover:underline">Edit</button>
                  </li>
                ))}
                {permitItem ? (
                  <li className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                    <FileCheck className="size-4 text-gray-500" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-gray-500">
                        {permitItem.ref ? <span className="font-mono">{permitItem.ref} · </span> : null}
                        {permitApproved ? "Permit approved" : "Permit, waiting for approval"}
                      </div>
                      <div className="truncate text-sm text-gray-800">{permitItem.title.replace("Permit to Work: ", "")}</div>
                    </div>
                  </li>
                ) : null}
              </ul>
            </section>
          </div>

          <div className="flex flex-col gap-4">
            {permitItem ? (
              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <h2 className="text-sm font-semibold text-gray-900">Permit approvals</h2>
                <p className="mb-3 text-xs text-gray-500">{permitItem.meta.find((m) => m.startsWith("Valid")) ?? "Valid for each occurrence"}</p>
                <ul className="space-y-2">
                  {approvers.map((pid) => {
                    const p = person(pid);
                    const done = permitApproved || approvals[pid];
                    return (
                      <li key={pid} className="flex items-center gap-2">
                        <Avatar initials={p.initials} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-800">{p.name}</div>
                          <div className="text-[11px] text-gray-500">{p.role}</div>
                        </div>
                        {done ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <Check className="size-3.5" /> Approved
                          </span>
                        ) : (
                          <button onClick={() => approve(pid)} className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" title="Simulates the approver tapping Approve in the notification">
                            Approve as {p.name.split(" ")[0]}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Schedule</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="size-4 text-gray-400" /> {job?.when}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Repeat className="size-4 text-gray-400" />
                  {execution.recurring ? job?.recurring?.rule : "One time"}
                  <button
                    className="ml-auto text-xs font-medium text-indigo-700 hover:underline"
                    onClick={() => updateExecution(execution.id, { recurring: !execution.recurring })}
                  >
                    {execution.recurring ? "Make one time" : "Repeat"}
                  </button>
                </div>
                {execution.recurring && job?.recurring ? (
                  <div className="flex flex-wrap gap-1 pl-6">
                    {job.recurring.next.map((n) => (
                      <span key={n.date} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700" title={n.note}>
                        {n.date}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Assigned to</h2>
              <div className="flex items-center gap-2">
                <Avatar initials={assignee.initials} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-gray-800">{assignee.name}</div>
                  <div className="text-[11px] text-gray-500">{assignee.role}</div>
                </div>
                <button className="text-xs font-medium text-indigo-700 hover:underline">Change</button>
              </div>
              {execution.sentToPhone ? (
                <p className="mt-3 flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1.5 text-xs text-emerald-800">
                  <MessageSquare className="size-3.5" /> Text sent to {assignee.phone}
                  {execution.permitStatus === "pending" ? ", it unlocks when the permit is approved" : ""}
                </p>
              ) : null}
            </section>

            <section className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex size-16 items-center justify-center rounded-lg bg-gray-900 text-white">
                <QrCode className="size-10" />
              </div>
              <p className="text-xs text-gray-600">
                The Safety Access Point QR on {a?.code} opens this work order for whoever is on shift. It is the same QR the plant already uses to
                report events.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
