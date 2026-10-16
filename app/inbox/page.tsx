"use client";

import { EventFlowPanel, SEVERITY_STYLE, nextStepLabel } from "@/components/three-cases/event-flow";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell, TapCompare } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { EVENTS } from "@/lib/three-cases/data";
import { cn } from "@/lib/utils";
import { AlertTriangle, CalendarClock, Check, ClipboardCheck, FileCheck, Sparkles } from "lucide-react";
import { useState } from "react";

// Items that already exist in the production Inbox (approvals, CAPAs, compliance tasks).
const EXISTING = [
  { id: "a1", icon: FileCheck, title: "LOTO-0030 Dock leveler 2 isolation, version 2.0", source: "Documentation approval", action: "Approve", overdue: false },
  { id: "c1", icon: ClipboardCheck, title: "CAPA-0039 Guard missing on band saw", source: "CAPA", action: "Review", overdue: true },
  { id: "t1", icon: CalendarClock, title: "Eyewash weekly test", source: "Compliance task", action: "Complete", overdue: false },
];

export default function InboxPage() {
  const { flows } = useThreeCases();
  const open = EVENTS.filter((e) => flows[e.id]?.status === "open");
  const [selected, setSelected] = useState<string>(EVENTS[0].id);
  const count = open.length + EXISTING.length;

  return (
    <PageShell title="Inbox" mainClassName="flex flex-col gap-3 overflow-hidden p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />
        <TapCompare today="~20 clicks, 4 screens" todayDetail="event, new CAPA form, CAPA, work order modal, OSHA form" here="2 clicks" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-3">
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">{count}</span>
            </div>
            <p className="text-sm text-gray-500">Everything currently waiting on you across Safety.</p>
          </div>

          <section className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
              <Sparkles className="size-3.5" /> New events, triaged by AI · {open.length}
            </div>
            {EVENTS.map((e) => {
              const flow = flows[e.id];
              const next = nextStepLabel(e, flow);
              const isOpen = flow?.status === "open";
              return (
                <button
                  key={e.id}
                  onClick={() => setSelected(e.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                    selected === e.id ? "border-indigo-300 bg-indigo-50/50" : "border-gray-200 bg-white hover:bg-gray-50",
                    !isOpen && "opacity-60",
                  )}
                >
                  {isOpen ? <AlertTriangle className="size-5 shrink-0 text-gray-400" /> : <Check className="size-5 shrink-0 text-emerald-600" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{e.title}</p>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className={cn("rounded px-1 text-[10px] font-medium", SEVERITY_STYLE[e.severity])}>{e.severity}</span>
                      {e.type} · {e.reportedAt}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      next.tone === "todo" && "bg-gray-900 text-white",
                      next.tone === "ai" && "bg-indigo-50 text-indigo-700",
                      next.tone === "wait" && "bg-amber-50 text-amber-800",
                      next.tone === "done" && "bg-emerald-50 text-emerald-700",
                    )}
                  >
                    {isOpen ? "Decide" : next.label}
                  </span>
                </button>
              );
            })}
          </section>

          <section className="space-y-2">
            <div className="text-xs font-semibold text-gray-500">Already in the Inbox today</div>
            {EXISTING.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3">
                <item.icon className="size-5 shrink-0 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.source}</p>
                </div>
                {item.overdue ? <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">Overdue</span> : null}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">{item.action}</span>
              </div>
            ))}
          </section>
        </div>

        <div className="min-h-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
          <EventFlowPanel eventId={selected} />
        </div>
      </div>
    </PageShell>
  );
}
