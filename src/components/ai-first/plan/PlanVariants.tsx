"use client";

// P3 · Event → action plan. Three ways to review the same AI-proposed plan.

import React, { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { usePlan } from "./usePlan";
import { CapaPlanCard, CreateBar, EventSummary, RootCauseCard, TaskRow } from "./PlanParts";
import { PlanResult } from "./PlanResult";
import { AiDisclaimer, AiWorking, PhotoWithPins, useStagedProgress } from "../AiPrimitives";
import { labelForType } from "@/contexts/AiFirstContext";
import { cn } from "@/lib/utils";

const THINKING = ["Reading the event, photo and answers", "Looking up FL-07 work order history", "Checking the pre-shift SOP", "Drafting actions by hierarchy of controls"];

function useThinking() {
  const [start] = useState(true);
  return useStagedProgress(THINKING, 550, start);
}

// A · Everything on one screen, like a plan you approve once.
export function OneScreenVariant({ reportId }: { reportId: string | null }) {
  const s = usePlan(reportId);
  const thinking = useThinking();

  if (s.created) return <PlanResult capaIds={s.created.map((c) => c.id)} reportId={s.report.id} />;

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
        <EventSummary report={s.report} />
        {!thinking.done ? (
          <div className="rounded-xl border border-violet-200 bg-white p-5">
            <AiWorking steps={THINKING} index={thinking.index} />
          </div>
        ) : (
          <>
            <RootCauseCard state={s} />
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Proposed actions</h3>
              <span className="text-xs text-gray-500">Uncheck anything you don't want. Owners and dates are editable.</span>
            </div>
            {s.plan.map((c) => (
              <CapaPlanCard key={c.id} capa={c} state={s} />
            ))}
            <AiDisclaimer>Drafted by AI from the event, the work order history and the SOP. Nothing is created until you press Create plan.</AiDisclaimer>
          </>
        )}
      </div>
      {thinking.done && <CreateBar state={s} onCreate={s.create} />}
    </div>
  );
}

// B · The event page stays in front; the plan opens as a side panel.
export function SidePanelVariant({ reportId }: { reportId: string | null }) {
  const s = usePlan(reportId);
  const [open, setOpen] = useState(true);
  const thinking = useThinking();

  if (s.created) return <PlanResult capaIds={s.created.map((c) => c.id)} reportId={s.report.id} />;

  return (
    <div className="relative min-h-full">
      <div className={cn("mx-auto max-w-5xl space-y-4 p-4 md:p-6 transition-all", open && "lg:mr-[460px] lg:max-w-none")}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-700">{s.report.id}</span>
          <h2 className="text-xl font-semibold text-gray-900">{s.report.title}</h2>
          {!open && (
            <button onClick={() => setOpen(true)} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white">
              <Sparkles className="w-4 h-4" /> AI action plan
            </button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 text-sm">
            {[
              ["Type", labelForType(s.report.type)],
              ["Severity", s.report.severity],
              ["Location", s.report.location],
              ["Asset", s.report.asset ?? "—"],
              ["Reported by", s.report.reporter],
              ["Hazards", s.report.hazards.join(", ")],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
                <span className="text-gray-500">{k}</span>
                <span className="text-gray-900">{v}</span>
              </div>
            ))}
            <p className="border-t border-gray-100 pt-3 text-gray-700">{s.report.description}</p>
          </div>
          <PhotoWithPins src={s.report.photo} pins={s.report.pins} />
        </div>
      </div>

      {open && (
        <aside className="fixed bottom-0 right-0 top-[148px] z-20 flex w-full flex-col border-l border-gray-200 bg-gray-50 shadow-xl lg:w-[460px]">
          <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <p className="font-semibold text-gray-900">AI action plan</p>
            <button onClick={() => setOpen(false)} className="ml-auto rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Close panel">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!thinking.done ? (
              <AiWorking steps={THINKING} index={thinking.index} />
            ) : (
              <>
                <RootCauseCard state={s} />
                {s.plan.map((c) => (
                  <CapaPlanCard key={c.id} capa={c} state={s} compact />
                ))}
              </>
            )}
          </div>
          {thinking.done && <CreateBar state={s} onCreate={s.create} />}
        </aside>
      )}
    </div>
  );
}

// C · Step by step: root cause → actions → owners and dates → review.
const STEPS = ["Root cause", "Actions", "Owners and dates", "Review"];

export function WizardVariant({ reportId }: { reportId: string | null }) {
  const s = usePlan(reportId);
  const [step, setStep] = useState(0);

  if (s.created) return <PlanResult capaIds={s.created.map((c) => c.id)} reportId={s.report.id} />;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-6">
      <EventSummary report={s.report} compact />
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", i < step ? "bg-violet-600 text-white" : i === step ? "border-2 border-violet-600 text-violet-700" : "border border-gray-300 text-gray-400")}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </span>
            <span className={cn("hidden text-xs sm:block", i === step ? "font-semibold text-gray-900" : "text-gray-500")}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-gray-200" />}
          </li>
        ))}
      </ol>

      {step === 0 && <RootCauseCard state={s} />}
      {step === 1 && (
        <div className="space-y-3">
          {s.plan.map((c) => (
            <CapaPlanCard key={c.id} capa={c} state={s} compact />
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2">
          {s.plan
            .filter((c) => c.selected)
            .flatMap((c) => c.tasks.filter((t) => t.selected).map((t) => ({ c, t })))
            .map(({ c, t }) => (
              <TaskRow key={t.id} task={t} onChange={(p) => s.updateTask(c.id, t.id, p)} />
            ))}
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-700">
            You are about to create <b>{s.counts.capas} CAPAs</b> with <b>{s.counts.tasks} tasks</b>, including <b>{s.counts.workOrders} work orders</b> in the CMMS.
          </p>
          {s.plan
            .filter((c) => c.selected)
            .map((c) => (
              <div key={c.id}>
                <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                <ul className="ml-4 list-disc text-sm text-gray-600">
                  {c.tasks
                    .filter((t) => t.selected)
                    .map((t) => (
                      <li key={t.id}>
                        {t.title} · {t.owner.split(" (")[0]} · {t.due}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          {s.onlyWeakControls && <p className="text-xs text-amber-700">This plan has only training and paperwork. Fixing the source works better.</p>}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button disabled={step === 0} onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={s.create} disabled={s.counts.tasks === 0} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
            Create plan ({s.counts.tasks} items)
          </button>
        )}
      </div>
    </div>
  );
}
