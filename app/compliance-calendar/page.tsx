"use client";

import { ComplianceTabBar } from "@/components/screens/compliance/tab-bar";
import { ExecutionPlan } from "@/components/three-cases/execution-plan";
import { KIND_ICON, NovaPanel } from "@/components/three-cases/nova-panel";
import { CASE_B_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell, TapCompare } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { asset as getAsset, job as getJob } from "@/lib/three-cases/data";
import { INITIAL_IDS, KIND_META, PROPOSALS, type Proposal } from "@/lib/three-cases/nova";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, Download, Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

// October 2026 starts on a Thursday. Today is Fri Oct 16.
const TODAY = "2026-10-16";

/** Compliance tasks people already keep in the calendar by hand. */
const TASKS: { day: string; title: string; done?: boolean }[] = [
  { day: "2026-10-02", title: "Fire extinguisher check", done: true },
  { day: "2026-10-07", title: "Eyewash weekly test", done: true },
  { day: "2026-10-09", title: "Forklift recertification · Jo Park", done: true },
  { day: "2026-10-14", title: "Eyewash weekly test", done: true },
  { day: "2026-10-21", title: "Eyewash weekly test" },
  { day: "2026-10-28", title: "Eyewash weekly test" },
  { day: "2026-11-01", title: "Fire extinguisher check" },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_CHIPS = 3;

const DASHED: Record<string, string> = {
  indigo: "border-primary/40 bg-badge-accent text-indigo-800",
  amber: "border-amber-300 bg-badge-warning text-amber-900",
  sky: "border-sky-300 bg-badge-accent text-sky-900",
  teal: "border-teal-300 bg-teal-50 text-teal-900",
  emerald: "border-emerald-300 bg-badge-success text-emerald-900",
  violet: "border-violet-300 bg-violet-50 text-violet-900",
};
const SOLID: Record<string, string> = {
  indigo: "bg-primary text-white",
  amber: "bg-amber-500 text-white",
  sky: "bg-sky-600 text-white",
  teal: "bg-teal-600 text-white",
  emerald: "bg-emerald-600 text-white",
  violet: "bg-violet-600 text-white",
};

function monthDays() {
  // Sep 28 (Mon) to Nov 1 (Sun): 5 weeks.
  const start = new Date(Date.UTC(2026, 8, 28));
  return Array.from({ length: 35 }, (_, i) => {
    const d = new Date(start.getTime() + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    return { iso, day: d.getUTCDate(), inMonth: d.getUTCMonth() === 9 };
  });
}

type Entry = { key: string; kind: "task"; title: string; done?: boolean } | { key: string; kind: "nova"; p: Proposal; repeat: boolean };

export default function ComplianceCalendarPage() {
  const { executions, createExecution, linkDocs, novaDone, markNovaDone } = useThreeCases();
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const [listed, setListed] = useState<string[]>(INITIAL_IDS);
  const [moved, setMoved] = useState<Record<string, string>>({});
  const [focusId, setFocusId] = useState<string | null>(null);
  const [novaOpen, setNovaOpen] = useState(true);
  const [maximized, setMaximized] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const days = useMemo(monthDays, []);
  const openJob = openJobId ? getJob(openJobId) : undefined;

  const isDone = useCallback(
    (p: Proposal) => (p.jobId ? executions.some((e) => e.jobId === p.jobId) : novaDone.includes(p.id)),
    [executions, novaDone],
  );
  const dayOf = useCallback((p: Proposal) => moved[p.id] ?? p.day, [moved]);
  const hrefOf = useCallback(
    (p: Proposal) => {
      const ex = p.jobId ? executions.find((e) => e.jobId === p.jobId) : undefined;
      return ex ? `/safety-execution/work-orders/${ex.id}` : undefined;
    },
    [executions],
  );

  const approve = useCallback(
    (id: string) => {
      const p = PROPOSALS.find((x) => x.id === id);
      if (!p) return;
      if (p.jobId) {
        if (!executions.some((e) => e.jobId === p.jobId)) {
          createExecution(p.jobId);
          linkDocs(getJob(p.jobId)?.basedOn ?? []);
        }
      } else {
        markNovaDone([id]);
      }
    },
    [executions, createExecution, linkDocs, markNovaDone],
  );

  const onList = useCallback((ids: string[]) => setListed((l) => Array.from(new Set([...l, ...ids]))), []);
  const onMove = useCallback(
    (from: string, to: string) =>
      setMoved((m) => {
        const next = { ...m };
        PROPOSALS.filter((p) => listed.includes(p.id) && p.kind === "wo" && (m[p.id] ?? p.day) === from).forEach((p) => (next[p.id] = to));
        return next;
      }),
    [listed],
  );

  const entriesFor = (iso: string): Entry[] => [
    ...TASKS.filter((t) => t.day === iso).map((t) => ({ key: `t-${t.title}-${iso}`, kind: "task" as const, title: t.title, done: t.done })),
    ...PROPOSALS.filter((p) => listed.includes(p.id) && (dayOf(p) === iso || p.repeats?.includes(iso))).map((p) => ({
      key: `${p.id}-${iso}`,
      kind: "nova" as const,
      p,
      repeat: dayOf(p) !== iso,
    })),
  ];

  const clickProposal = (p: Proposal) => {
    setExpandedDay(null);
    if (p.jobId) {
      setOpenJobId(p.jobId);
      return;
    }
    setNovaOpen(true);
    setFocusId(p.id);
  };


  return (
    <PageShell
      title="Compliance"
      mainClassName="flex flex-col gap-6 overflow-hidden p-8"
      onAskSafety={() => setNovaOpen(true)}
      prototypeBar={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <OptionSwitcher caseLabel="Use case 2" options={CASE_B_OPTIONS} />
          <TapCompare today="build each task by hand" todayDetail="then a WO in the CMMS for each" here="ask Nova, approve" />
        </div>
      }
      aside={
        novaOpen ? (
          <NovaPanel
            userName="Kaue"
            listed={listed}
            isDone={isDone}
            dayOf={dayOf}
            hrefOf={hrefOf}
            focusId={focusId}
            maximized={maximized}
            onApprove={approve}
            onList={onList}
            onMove={onMove}
            onOpenPlan={setOpenJobId}
            onClose={() => setNovaOpen(false)}
            onToggleMax={() => setMaximized((m) => !m)}
            className={maximized ? "w-[600px]" : "w-[400px]"}
          />
        ) : null
      }
    >
      {/* The calendar is the last tab of Compliance, so it carries the same title and tabs. */}
      <ComplianceTabBar active="calendar" />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3">
        {/* Calendar, same structure as the Compliance Calendar in production */}
        <div className="flex min-h-0 flex-col rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-border p-1.5 text-muted-foreground" aria-label="Previous month">
                <ChevronLeft className="size-4" />
              </button>
              <p className="min-w-32 text-center text-lg font-semibold text-foreground">October 2026</p>
              <button className="rounded-md border border-border p-1.5 text-muted-foreground" aria-label="Next month">
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-border p-0.5 text-xs">
                {["Month", "Week", "List"].map((v) => (
                  <span key={v} className={cn("rounded px-2.5 py-1", v === "Month" ? "bg-foreground text-white" : "text-muted-foreground")}>
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

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-5 rounded border border-dashed border-primary/40 bg-badge-accent" /> Proposed by Nova
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-5 rounded bg-primary" /> Approved
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-5 rounded bg-muted" /> Your tasks
            </span>
            <span className="h-3 w-px bg-gray-200" />
            {(["wo", "pm", "doc", "training", "event", "assign"] as const).map((k) => {
              const Icon = KIND_ICON[k];
              return (
                <span key={k} className="inline-flex items-center gap-1">
                  <Icon className="size-3" /> {k === "event" ? "Close out" : KIND_META[k].label}
                </span>
              );
            })}
          </div>

          <div className="grid grid-cols-7 border-b border-border text-xs font-semibold uppercase tracking-wide text-text-placeholder">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-1.5">
                {d}
              </div>
            ))}
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-5">
            {days.map((d, i) => {
              const entries = entriesFor(d.iso);
              const isToday = d.iso === TODAY;
              const expanded = expandedDay === d.iso;
              // Up to 3 chips fit; past that, 2 chips and a "+N more" line.
              const fit = entries.length > MAX_CHIPS ? MAX_CHIPS - 1 : MAX_CHIPS;
              const shown = expanded ? entries : entries.slice(0, fit);
              const more = entries.length - fit;
              return (
                <div
                  key={d.iso}
                  className={cn(
                    "relative min-w-0 border-b border-r border-border p-1",
                    !expanded && "overflow-hidden",
                    i % 7 === 6 && "border-r-0",
                    i >= 28 && "border-b-0",
                    !d.inMonth && "bg-gray-50/70 text-text-placeholder",
                    isToday && "bg-indigo-50/40",
                  )}
                >
                  <div className={cn(expanded && "absolute inset-x-0 top-0 z-20 min-h-full rounded-md border border-border bg-card p-1 shadow-lg")}>
                    <div className="mb-1 flex items-center justify-between">
                      {isToday ? (
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">{d.day}</span>
                      ) : (
                        <span className="inline-block size-6 text-sm font-medium">{d.day}</span>
                      )}
                      {expanded ? (
                        <button onClick={() => setExpandedDay(null)} className="rounded p-0.5 text-text-placeholder hover:bg-muted" aria-label="Close day">
                          <X className="size-3.5" />
                        </button>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      {shown.map((e) =>
                        e.kind === "task" ? (
                          <div
                            key={e.key}
                            className={cn("truncate rounded px-1.5 py-0.5 text-xs", e.done ? "bg-muted text-text-placeholder line-through" : "bg-muted text-foreground")}
                          >
                            {e.title}
                          </div>
                        ) : (
                          <NovaChip key={e.key} p={e.p} done={isDone(e.p)} repeat={e.repeat} focused={focusId === e.p.id} onClick={() => clickProposal(e.p)} />
                        ),
                      )}
                      {!expanded && more > 0 ? (
                        <button onClick={() => setExpandedDay(d.iso)} className="w-full rounded px-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted">
                          +{more} more
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {openJob ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={() => setOpenJobId(null)}>
          <div className="flex h-full w-[620px] max-w-full flex-col gap-2 bg-surface-subtle p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{getAsset(openJob.assetId)?.name}</span>
              <button onClick={() => setOpenJobId(null)} className="rounded p-1 text-muted-foreground hover:bg-gray-200" aria-label="Close">
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

function NovaChip({ p, done, repeat, focused, onClick }: { p: Proposal; done: boolean; repeat: boolean; focused: boolean; onClick: () => void }) {
  const tone = KIND_META[p.kind].tone;
  const Icon = done ? Check : KIND_ICON[p.kind];
  return (
    <button
      onClick={onClick}
      title={`${KIND_META[p.kind].label}: ${p.title}\n${p.why}`}
      className={cn(
        "flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-xs font-medium",
        done ? SOLID[tone] : cn("border border-dashed", DASHED[tone]),
        repeat && "opacity-70",
        focused && "ring-2 ring-indigo-400 ring-offset-1",
      )}
    >
      <Icon className="size-3 shrink-0" />
      <span className="truncate">{p.title}</span>
    </button>
  );
}
