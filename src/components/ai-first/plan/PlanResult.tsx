"use client";

// What happens after "Create plan": the CAPAs with their children, the work order as maintenance
// sees it (tagged "part of CAPA"), and the agent that chases owners, escalates, checks evidence
// and proposes closing — a person confirms the close.

import React, { useState } from "react";
import Link from "next/link";
import { Bot, CheckCircle2, FastForward, MessageCircle, ShieldCheck, User, Wrench } from "lucide-react";
import { useAiFirst } from "@/contexts/AiFirstContext";
import type { Capa } from "@/lib/ai-first/types";
import { AGENT_SCRIPT } from "@/lib/ai-first/sample-data";
import { ControlChip, TASK_META } from "./PlanParts";
import { cn } from "@/lib/utils";

function whereItWent(created: Capa[]) {
  const kinds = new Set(created.flatMap((c) => c.tasks.map((t) => t.kind)));
  const parts = [
    kinds.has("work_order") && "work orders are in the CMMS",
    kinds.has("training") && "training is assigned in Learn",
    kinds.has("document") && "the SOP change waits for approval",
    kinds.has("calendar") && "the recurring check is on the compliance calendar",
  ].filter(Boolean) as string[];
  const text = parts.join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

export function PlanResult({ capaIds, reportId }: { capaIds: string[]; reportId: string }) {
  const { capas, workOrders, updateCapa } = useAiFirst();
  const created = capaIds.map((id) => capas.find((c) => c.id === id)).filter(Boolean) as Capa[];
  const first = created[0];
  const [step, setStep] = useState(0);
  const firstWo = workOrders.find((w) => w.capaId === first?.id);

  if (!first) return null;

  const nextDay = () => {
    const entry = AGENT_SCRIPT[step];
    if (!entry) return;
    const newLog = [...first.log, { day: entry.day, at: entry.at, actor: entry.actor, text: entry.text, channel: entry.channel }];
    // the script can contain two entries on the same day; play them together
    let i = step + 1;
    while (AGENT_SCRIPT[i] && AGENT_SCRIPT[i].day === entry.day) {
      const e = AGENT_SCRIPT[i];
      newLog.push({ day: e.day, at: e.at, actor: e.actor, text: e.text, channel: e.channel });
      i += 1;
    }
    const proposes = AGENT_SCRIPT.slice(step, i).some((e) => e.effect === "close_proposed");
    updateCapa(first.id, { log: newLog, day: entry.day, status: proposes ? "close_proposed" : first.status });
    setStep(i);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-900">
            Plan created from {reportId}: {created.length} CAPAs, {created.reduce((n, c) => n + c.tasks.length, 0)} tasks
          </p>
          <p className="text-sm text-emerald-800">{whereItWent(created)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          {created.map((c) => (
            <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-violet-100 px-1.5 py-0.5 text-xs font-bold text-violet-800">{c.id}</span>
                <ControlChip level={c.controlLevel} />
                <span className={cn("ml-auto text-xs font-medium", c.status === "closed" ? "text-emerald-700" : c.status === "close_proposed" ? "text-amber-700" : "text-gray-500")}>
                  {c.status === "closed" ? "Closed" : c.status === "close_proposed" ? "Close proposed" : "Open"}
                </span>
              </div>
              <p className="mt-1 font-semibold text-gray-900">{c.title}</p>
              <ul className="mt-2 space-y-1.5">
                {c.tasks.map((t) => {
                  const m = TASK_META[t.kind];
                  return (
                    <li key={t.id} className="flex items-center gap-2 text-sm">
                      <m.icon className="w-4 h-4 shrink-0 text-gray-400" />
                      <span className="text-gray-800">{t.title}</span>
                      <span className="ml-auto shrink-0 text-xs text-gray-500">{t.owner.split(" (")[0]}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {firstWo && (
            <div className="rounded-xl border border-orange-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">What maintenance sees in the CMMS</p>
              <div className="mt-2 rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-semibold text-gray-700">{firstWo.id}</span>
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">Part of {first.id}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-900">{firstWo.title}</p>
                <p className="text-xs text-gray-500">
                  {firstWo.asset} · Priority {firstWo.priority} · LOTO-FL-07 attached
                </p>
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                The technician works the WO as usual. The CAPA only appears as a tag, so a single-WO fix feels like one task, not two.
              </p>
            </div>
          )}
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Reporter updates</p>
            <p className="mt-2 flex items-start gap-2 text-gray-700">
              <MessageCircle className="mt-0.5 w-4 h-4 shrink-0 text-[#25D366]" /> Sent automatically when the plan is created and when the fix is done. Details about injured people are never shared.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
          <Bot className="w-4 h-4 text-violet-600" />
          <p className="font-semibold text-gray-900">Follow-up agent · {first.id}</p>
          <span className="text-xs text-gray-500">Reminds, escalates after 48 h, checks evidence. Every action is logged.</span>
          {step < AGENT_SCRIPT.length && (
            <button data-ai-first-chrome onClick={nextDay} className="ml-auto inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-medium text-white">
              <FastForward className="w-3.5 h-3.5" /> Prototype: simulate next day
            </button>
          )}
        </div>
        <ol className="divide-y divide-gray-100">
          {first.log.map((e, i) => (
            <li key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
              <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", e.actor === "agent" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600")}>
                {e.actor === "agent" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-gray-800">{e.text}</p>
                <p className="text-xs text-gray-400">
                  {e.at}
                  {e.channel ? ` · ${e.channel}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ol>
        {first.status === "close_proposed" && (
          <div className="flex flex-wrap items-center gap-3 border-t border-amber-200 bg-amber-50 px-4 py-3">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <p className="text-sm text-amber-900">The agent proposes closing {first.id}. Closing a CAPA is your call.</p>
            <button onClick={() => updateCapa(first.id, { status: "closed" })} className="ml-auto rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white">
              Close CAPA
            </button>
            <button onClick={() => updateCapa(first.id, { status: "open" })} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800">
              Keep open
            </button>
          </div>
        )}
        {first.status === "closed" && (
          <p className="flex items-center gap-2 border-t border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> Closed by you. Effectiveness check on Nov 17: the agent will look for new leak reports on the FL fleet.
          </p>
        )}
      </div>

      <Link href="/ai-first/inbox" className="inline-block text-sm font-medium text-violet-700 underline">
        Back to the supervisor queue (P8)
      </Link>
    </div>
  );
}
