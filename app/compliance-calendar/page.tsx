"use client";

import { ExecutionPlan } from "@/components/three-cases/execution-plan";
import { CASE_B_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { AiTag, PageShell, TapCompare } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { asset as getAsset, job as getJob } from "@/lib/three-cases/data";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, Download, FileWarning, Loader2, Plus, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

type Chip =
  | { kind: "task"; day: string; title: string; done?: boolean }
  | { kind: "ai"; day: string; jobId: string; title: string; status: "ready" | "needs_docs"; why: string };

// October 2026 starts on a Thursday. Today is Fri Oct 16.
const TODAY = "2026-10-16";

const CHIPS: Chip[] = [
  { kind: "task", day: "2026-10-02", title: "Fire extinguisher check", done: true },
  { kind: "task", day: "2026-10-07", title: "Eyewash weekly test", done: true },
  { kind: "task", day: "2026-10-09", title: "Forklift recertification · Jo Park", done: true },
  { kind: "task", day: "2026-10-14", title: "Eyewash weekly test", done: true },
  { kind: "task", day: "2026-10-21", title: "Eyewash weekly test" },
  { kind: "task", day: "2026-10-28", title: "Eyewash weekly test" },
  { kind: "task", day: "2026-11-01", title: "Fire extinguisher check" },
  { kind: "ai", day: "2026-10-16", jobId: "fl03-inspect", title: "Pre-use inspection · FL-03", status: "ready", why: "AUD-0009 is daily and today's is not done" },
  { kind: "ai", day: "2026-10-19", jobId: "cv12-tracking", title: "Belt tracking · CV-12", status: "ready", why: "Belt drifted twice since WO-1029 on Sep 24" },
  { kind: "ai", day: "2026-10-20", jobId: "fl03-clean", title: "Clean Forklift 3", status: "ready", why: "SOP-0031 says monthly; last cleaned Sep 18" },
  { kind: "ai", day: "2026-10-21", jobId: "hp04-clean", title: "Clean Press 4", status: "ready", why: "SOP-0045 says every 2 weeks; last done Oct 7" },
  { kind: "ai", day: "2026-10-21", jobId: "ac2-inspect", title: "Pressure vessel · AC-2", status: "ready", why: "AUD-0030 is yearly, due Oct 21" },
  { kind: "ai", day: "2026-10-22", jobId: "fl03-battery", title: "Battery service · FL-03", status: "ready", why: "SOP-0032 is weekly" },
  { kind: "ai", day: "2026-10-30", jobId: "hp07-monthly", title: "Monthly cleaning · Press 7", status: "needs_docs", why: "Press 7 has no SOP or LOTO; drafts are ready for approval" },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthDays() {
  // Sep 28 (Mon) to Nov 1 (Sun): 5 weeks.
  const start = new Date(Date.UTC(2026, 8, 28));
  return Array.from({ length: 35 }, (_, i) => {
    const d = new Date(start.getTime() + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    return { iso, day: d.getUTCDate(), inMonth: d.getUTCMonth() === 9 };
  });
}

export default function ComplianceCalendarPage() {
  const { executions, createExecution } = useThreeCases();
  const [open, setOpen] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const days = useMemo(monthDays, []);
  const scheduledJobs = new Set(executions.map((e) => e.jobId));
  const aiChips = CHIPS.filter((c): c is Extract<Chip, { kind: "ai" }> => c.kind === "ai");
  const ready = aiChips.filter((c) => c.status === "ready" && !scheduledJobs.has(c.jobId));
  const needsDocs = aiChips.filter((c) => c.status === "needs_docs" && !scheduledJobs.has(c.jobId));
  const done = aiChips.filter((c) => scheduledJobs.has(c.jobId));
  const openJob = open ? getJob(open) : undefined;

  const approveAll = () => {
    setApproving(true);
    setTimeout(() => {
      ready.forEach((c) => createExecution(c.jobId));
      setApproving(false);
    }, 1200);
  };

  return (
    <PageShell title="Compliance Calendar" mainClassName="flex flex-col gap-3 overflow-hidden p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 2" options={CASE_B_OPTIONS} />
        <TapCompare today="build each task by hand" todayDetail="then a WO in the CMMS for each" here="approve the week" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] gap-3">
        {/* Calendar, same structure as the Compliance Calendar in production */}
        <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-gray-200 p-1.5 text-gray-500" aria-label="Previous month">
                <ChevronLeft className="size-4" />
              </button>
              <p className="min-w-32 text-center text-lg font-semibold text-gray-900">October 2026</p>
              <button className="rounded-md border border-gray-200 p-1.5 text-gray-500" aria-label="Next month">
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-gray-200 p-0.5 text-xs">
                {["Month", "Week", "List"].map((v) => (
                  <span key={v} className={cn("rounded px-2.5 py-1", v === "Month" ? "bg-gray-900 text-white" : "text-gray-600")}>
                    {v}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-1 size-4" /> Export
              </Button>
              <Button size="sm">
                <Plus className="mr-1 size-4" /> New task
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-1.5">
                {d}
              </div>
            ))}
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-5">
            {days.map((d, i) => {
              const chips = CHIPS.filter((c) => c.day === d.iso);
              const isToday = d.iso === TODAY;
              return (
                <div
                  key={d.iso}
                  className={cn(
                    "min-w-0 overflow-hidden border-b border-r border-gray-100 p-1",
                    i % 7 === 6 && "border-r-0",
                    i >= 28 && "border-b-0",
                    !d.inMonth && "bg-gray-50/70 text-gray-400",
                    isToday && "bg-indigo-50/40",
                  )}
                >
                  <div className="mb-1">
                    {isToday ? (
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">{d.day}</span>
                    ) : (
                      <span className="inline-block size-6 text-sm font-medium">{d.day}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {chips.map((c) =>
                      c.kind === "task" ? (
                        <div key={c.title + c.day} className={cn("truncate rounded px-1.5 py-0.5 text-[11px]", c.done ? "bg-gray-100 text-gray-400 line-through" : "bg-gray-100 text-gray-700")}>
                          {c.title}
                        </div>
                      ) : (
                        <button
                          key={c.jobId}
                          onClick={() => setOpen(c.jobId)}
                          className={cn(
                            "flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium",
                            scheduledJobs.has(c.jobId)
                              ? "bg-indigo-600 text-white"
                              : c.status === "needs_docs"
                                ? "border border-dashed border-amber-400 bg-amber-50 text-amber-900"
                                : "border border-dashed border-indigo-300 bg-indigo-50 text-indigo-800",
                          )}
                          title={c.why}
                        >
                          {scheduledJobs.has(c.jobId) ? <Check className="size-3 shrink-0" /> : <Sparkles className="size-3 shrink-0" />}
                          <span className="truncate">{c.title}</span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What the AI prepared */}
        <div className="flex min-h-0 flex-col rounded-xl border border-indigo-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <AiTag label="Prepared by AI" />
            <h2 className="mt-1 text-base font-semibold text-gray-900">The next two weeks are ready</h2>
            <p className="text-xs text-gray-500">Drafted from your SOPs, inspections and schedules. Each one carries its permit, LOTO and documents.</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {ready.length > 0 ? (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ready to schedule · {ready.length}</div>
                {ready.map((c) => (
                  <AgendaRow key={c.jobId} chip={c} onOpen={() => setOpen(c.jobId)} />
                ))}
              </div>
            ) : null}
            {needsDocs.length > 0 ? (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Needs a document first · {needsDocs.length}</div>
                {needsDocs.map((c) => (
                  <AgendaRow key={c.jobId} chip={c} onOpen={() => setOpen(c.jobId)} />
                ))}
              </div>
            ) : null}
            {done.length > 0 ? (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Scheduled · {done.length}</div>
                {done.map((c) => (
                  <div key={c.jobId} className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-2 text-xs text-emerald-800">
                    <Check className="size-3.5" /> {c.title}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="border-t border-gray-100 p-3">
            <Button className="w-full" disabled={ready.length === 0 || approving} onClick={approveAll}>
              {approving ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Check className="mr-1.5 size-4" />}
              {ready.length === 0 ? "Everything ready is scheduled" : `Approve ${ready.length} ready jobs`}
            </Button>
            <p className="mt-1.5 text-center text-[11px] text-gray-500">Permits still go to their two approvers. Nothing reaches a technician before that.</p>
          </div>
        </div>
      </div>

      {openJob ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={() => setOpen(null)}>
          <div className="flex h-full w-[620px] max-w-full flex-col gap-2 bg-gray-50 p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{getAsset(openJob.assetId)?.name}</span>
              <button onClick={() => setOpen(null)} className="rounded p-1 text-gray-500 hover:bg-gray-200" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <ExecutionPlan job={openJob} />
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

function AgendaRow({ chip, onOpen }: { chip: Extract<Chip, { kind: "ai" }>; onOpen: () => void }) {
  const j = getJob(chip.jobId);
  const date = new Date(`${chip.day}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  const hasPermit = j?.plan.some((p) => p.kind === "ptw");
  return (
    <button onClick={onOpen} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-left hover:border-indigo-300 hover:bg-indigo-50/30">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-gray-900">{chip.title}</span>
        <span className="shrink-0 text-[11px] text-gray-500">{date}</span>
      </div>
      <div className="mt-0.5 text-[11px] text-gray-600">{chip.why}</div>
      <div className="mt-1 flex flex-wrap gap-1">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700">Work order</span>
        {hasPermit ? <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700">Permit · 2 approvers</span> : null}
        {chip.status === "needs_docs" ? (
          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-900">
            <FileWarning className="size-3" /> SOP and LOTO drafts
          </span>
        ) : null}
      </div>
    </button>
  );
}
