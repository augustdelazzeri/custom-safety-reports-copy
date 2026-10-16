"use client";

import { EventFlowPanel, SEVERITY_BAR } from "@/components/three-cases/event-flow";
import { InboxNova, usualReady } from "@/components/three-cases/inbox-nova";
import { NovaBall } from "@/components/three-cases/nova-panel";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell, TapCompare } from "@/components/three-cases/shell";
import { useThreeCases, type EventFlowState } from "@/contexts/ThreeCasesContext";
import { EVENTS } from "@/lib/three-cases/data";
import { cn } from "@/lib/utils";
import { Bell, CalendarClock, Check, CheckCircle2, ClipboardCheck, Clock, FileCheck, Inbox as InboxIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Tab = "open" | "waiting" | "done";

type Task = {
  key: string;
  eventId?: string;
  title: string;
  sub: string;
  badge: string;
  tone: "decide" | "review" | "close" | "wait" | "late" | "done" | "plain";
  bar?: string;
};

// Items that already exist in the production Inbox (approvals, CAPAs, compliance tasks).
const EXISTING: Task[] = [
  { key: "x-loto", title: "LOTO-0030 Dock leveler 2 isolation, version 2.0", sub: "Documentation approval", badge: "Approve", tone: "plain" },
  { key: "x-capa", title: "CAPA-0039 Guard missing on band saw", sub: "CAPA · overdue", badge: "Review", tone: "plain" },
  { key: "x-eye", title: "Eyewash weekly test", sub: "Compliance task", badge: "Complete", tone: "plain" },
];
const EXISTING_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "x-loto": FileCheck,
  "x-capa": ClipboardCheck,
  "x-eye": CalendarClock,
};

function tasksFor(flows: Record<string, EventFlowState>) {
  const open: Task[] = [];
  const waiting: Task[] = [];
  const done: Task[] = [];

  EVENTS.forEach((e) => {
    const f = flows[e.id];
    if (!f) return;
    if (!f.decided && f.status !== "closed") {
      open.push({ key: `d-${e.id}`, eventId: e.id, title: e.title, sub: `${e.severity} · ${e.type} · ${e.reportedAt}`, badge: "Decide", tone: "decide", bar: SEVERITY_BAR[e.severity] });
    }
    if (f.capaStatus === "in_review") {
      open.push({ key: `r-${e.id}`, eventId: e.id, title: `Review ${f.capaRef}`, sub: `${e.ref} · all ${f.wos.length} work orders done`, badge: "Review", tone: "review" });
    }
    if (f.decided && f.status === "in_review") {
      open.push({ key: `c-${e.id}`, eventId: e.id, title: `Close ${e.ref}`, sub: `${e.title} · record complete${f.capaStatus && f.capaStatus !== "closed" ? `, ${f.capaRef} stays open` : ""}`, badge: "Close", tone: "close" });
    }
    if (f.capaStatus === "open") {
      const n = f.wos.filter((w) => w.status === "complete").length;
      const last = f.updates[f.updates.length - 1];
      waiting.push({
        key: `w-${e.id}`,
        eventId: e.id,
        title: `${f.capaRef} · ${e.title}`,
        sub: last ? `${last.text} · ${last.at}` : "",
        badge: `${n}/${f.wos.length} WOs`,
        tone: last?.tone === "late" ? "late" : "wait",
      });
    }
    if (f.decided) {
      done.push({
        key: `dd-${e.id}`,
        eventId: e.id,
        title: `Decided ${e.ref}`,
        sub: f.capaRef ? `Ran the flow · ${[f.capaRef, ...f.wos.map((w) => w.ref)].join(", ")}` : f.closedNote ?? "Closed",
        badge: f.decidedAt ?? "Today",
        tone: "done",
      });
    }
    if (f.capaStatus === "closed") done.push({ key: `cc-${e.id}`, eventId: e.id, title: `Closed ${f.capaRef}`, sub: e.title, badge: "Today", tone: "done" });
    if (f.status === "closed" && f.capaRef) done.push({ key: `ce-${e.id}`, eventId: e.id, title: `Closed ${e.ref}`, sub: f.closedNote ?? e.title, badge: "Today", tone: "done" });
  });
  return { open: [...open, ...EXISTING], waiting, done: done.reverse() };
}

const BADGE: Record<Task["tone"], string> = {
  decide: "bg-gray-900 text-white",
  review: "bg-indigo-600 text-white",
  close: "bg-white text-gray-800 ring-1 ring-gray-300",
  wait: "bg-amber-50 text-amber-800",
  late: "bg-rose-50 text-rose-700",
  done: "text-gray-400",
  plain: "bg-gray-100 text-gray-700",
};

export default function InboxPage() {
  const { flows, hydrated } = useThreeCases();
  const { open, waiting, done } = useMemo(() => tasksFor(flows), [flows]);
  const [tab, setTab] = useState<Tab>("open");
  const [selectedKey, setSelectedKey] = useState<string>(`d-${EVENTS[0].id}`);
  const [eventId, setEventId] = useState<string | null>(EVENTS[0].id);
  const [novaOpen, setNovaOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const lists = { open, waiting, done };

  // When an item leaves Open (decided or closed), say where it went.
  const decidedBefore = useRef<Record<string, boolean>>({});
  useEffect(() => {
    if (!hydrated) return;
    const moved = EVENTS.filter((e) => {
      const nowDone = Boolean(flows[e.id]?.decided) || flows[e.id]?.status === "closed";
      const was = decidedBefore.current[e.id];
      decidedBefore.current[e.id] = nowDone;
      return was === false && nowDone;
    });
    if (moved.length) {
      setToast(`${moved.map((e) => e.ref).join(", ")} moved to Done`);
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [flows, hydrated]);

  const pick = (t: Task) => {
    setSelectedKey(t.key);
    setEventId(t.eventId ?? null);
  };

  return (
    <PageShell
      title="Inbox"
      mainClassName="flex flex-col gap-3 overflow-hidden p-4"
      aside={novaOpen ? <InboxNova onClose={() => setNovaOpen(false)} className="w-[400px]" /> : null}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />
        <TapCompare today="~20 clicks, 4 screens" todayDetail="event, new CAPA form, CAPA, work order modal, OSHA form" here="2 clicks" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3">
        <div className="flex min-h-0 flex-col">
          <div className="flex items-end justify-between gap-2 border-b border-gray-200">
            <div className="flex gap-4">
              {(
                [
                  ["open", "Open", open.length],
                  ["waiting", "Waiting", waiting.length],
                  ["done", "Done", done.length],
                ] as const
              ).map(([id, label, n]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-1 pb-2 text-sm font-medium",
                    tab === id ? "border-indigo-600 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800",
                  )}
                >
                  {label}
                  <span className={cn("rounded-full px-1.5 text-[11px] font-semibold", tab === id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600")}>{n}</span>
                </button>
              ))}
            </div>
            {!novaOpen ? (
              <button
                onClick={() => setNovaOpen(true)}
                className="mb-1.5 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-sm hover:bg-gray-50"
              >
                <NovaBall /> Nova did 3 things{usualReady(flows) ? ` · ${usualReady(flows)} flow${usualReady(flows) > 1 ? "s" : ""} ready` : ""}
              </button>
            ) : null}
          </div>

          {toast ? (
            <button
              onClick={() => setTab("done")}
              className="mt-2 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-left text-xs text-emerald-800"
            >
              <Check className="size-3.5" /> {toast} · <span className="font-medium underline">View</span>
            </button>
          ) : null}

          <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
            {tab === "waiting" ? (
              <p className="px-1 pb-1 text-xs text-gray-500">CAPAs waiting on work orders. You get each update here; the CAPA comes back to Open when all are done.</p>
            ) : null}
            {lists[tab].length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white py-10 text-sm text-gray-500">
                <InboxIcon className="size-6 text-gray-300" /> Nothing here
              </div>
            ) : null}
            {lists[tab].map((t) => {
              const Icon = EXISTING_ICON[t.key];
              return (
                <button
                  key={t.key}
                  onClick={() => pick(t)}
                  className={cn(
                    "relative flex w-full items-center gap-3 overflow-hidden rounded-lg border px-3.5 py-2.5 text-left transition-colors",
                    selectedKey === t.key ? "border-indigo-300 bg-indigo-50/50" : "border-gray-200 bg-white hover:bg-gray-50",
                  )}
                >
                  {t.bar ? <span className={cn("absolute inset-y-0 left-0 w-1", t.bar)} /> : null}
                  {Icon ? (
                    <Icon className="size-4 shrink-0 text-gray-400" />
                  ) : t.tone === "review" ? (
                    <Bell className="size-4 shrink-0 text-indigo-600" />
                  ) : t.tone === "wait" || t.tone === "late" ? (
                    <Clock className={cn("size-4 shrink-0", t.tone === "late" ? "text-rose-500" : "text-amber-500")} />
                  ) : t.tone === "done" ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  ) : t.tone === "close" ? (
                    <Check className="size-4 shrink-0 text-gray-400" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{t.title}</p>
                    <p className="truncate text-xs text-gray-500">{t.sub}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", BADGE[t.tone])}>{t.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-5">
          {eventId ? (
            <EventFlowPanel eventId={eventId} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-sm text-gray-500">
              <InboxIcon className="size-6 text-gray-300" />
              Already in the Inbox today. Opens the same screen it opens in production.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
