"use client";

import { EventFlowPanel, SEVERITY_STYLE, StepTrack, nextStepLabel } from "@/components/three-cases/event-flow";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { EVENTS, locationName } from "@/lib/three-cases/data";
import { cn } from "@/lib/utils";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventsPage() {
  const { flows } = useThreeCases();
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "action">("all");
  const [selected, setSelected] = useState(EVENTS[0].id);
  const needsAction = EVENTS.filter((e) => flows[e.id]?.status === "open");

  return (
    <PageShell title="Events" mainClassName="flex flex-col gap-3 overflow-hidden p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />
        <Link href="/events/board" className="text-xs font-medium text-indigo-700 hover:underline">
          See every event by stage
        </Link>
      </div>

      <div className="flex items-end justify-between gap-3 border-b border-gray-200">
        <div className="flex gap-4">
          <button onClick={() => setTab("all")} className={cn("border-b-2 px-1 pb-2 text-sm font-medium", tab === "all" ? "border-indigo-600 text-gray-900" : "border-transparent text-gray-500")}>
            All events
          </button>
          <button onClick={() => setTab("action")} className={cn("flex items-center gap-1.5 border-b-2 px-1 pb-2 text-sm font-medium", tab === "action" ? "border-indigo-600 text-gray-900" : "border-transparent text-gray-500")}>
            <Sparkles className="size-3.5 text-indigo-600" /> Needs action
            <span className="rounded-full bg-indigo-600 px-1.5 text-[10px] font-semibold text-white">{needsAction.length}</span>
          </button>
        </div>
        <div className="relative mb-2 w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-gray-400" />
          <input id="events-search" placeholder="Search events" className="w-full rounded-md border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm outline-none" />
        </div>
      </div>

      {tab === "all" ? (
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-left text-xs font-medium text-gray-500">
              <tr>
                <th className="px-4 py-2.5">Event</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Severity</th>
                <th className="px-3 py-2.5">Location</th>
                <th className="px-3 py-2.5">Reported</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1 text-indigo-700">
                    <Sparkles className="size-3" /> Next step
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {EVENTS.map((e) => {
                const flow = flows[e.id];
                const next = nextStepLabel(e, flow);
                const status = flow?.status === "open" ? "Open" : flow?.status === "in_progress" ? "In review" : "Closed";
                return (
                  <tr key={e.id} onClick={() => router.push(`/events/${e.id}`)} className="cursor-pointer hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px] text-gray-400">{e.ref}</div>
                      <div className="font-medium text-gray-900">{e.title}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{e.type}</td>
                    <td className="px-3 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", SEVERITY_STYLE[e.severity])}>{e.severity}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{locationName(e.locationId)}</td>
                    <td className="px-3 py-3 text-gray-500">{e.reportedAt}</td>
                    <td className="px-3 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", status === "Open" ? "bg-sky-50 text-sky-700" : status === "In review" ? "bg-amber-50 text-amber-800" : "bg-gray-100 text-gray-600")}>{status}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
                          next.tone === "todo" && "bg-gray-900 text-white",
                          next.tone === "ai" && "bg-indigo-50 text-indigo-700",
                          next.tone === "wait" && "bg-amber-50 text-amber-800",
                          next.tone === "done" && "bg-emerald-50 text-emerald-700",
                        )}
                      >
                        {next.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3">
          <div className="min-h-0 space-y-2 overflow-y-auto">
            {needsAction.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">Nothing left to decide.</div>
            ) : null}
            {needsAction.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e.id)}
                className={cn("w-full space-y-2 rounded-xl border bg-white p-3 text-left", selected === e.id ? "border-indigo-300 ring-2 ring-indigo-100" : "border-gray-200 hover:border-gray-300")}
              >
                <div className="flex items-center gap-1.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", SEVERITY_STYLE[e.severity])}>{e.severity}</span>
                  <span className="text-[11px] text-gray-500">
                    {e.type} · {e.reportedAt}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900">{e.title}</div>
                <StepTrack ev={e} flow={flows[e.id]} size="sm" />
              </button>
            ))}
          </div>
          <div className="min-h-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
            {needsAction.some((e) => e.id === selected) || flows[selected]?.status !== "open" ? <EventFlowPanel eventId={selected} /> : null}
          </div>
        </div>
      )}
    </PageShell>
  );
}
