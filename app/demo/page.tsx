"use client";

import { CASE_B_OPTIONS, CASE_C_OPTIONS } from "@/components/three-cases/option-switcher";
import { PageShell } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { resetRealStore } from "@/lib/three-cases/real-jobs";
import { ArrowRight, Check, Megaphone, PlayCircle, RotateCcw, Workflow } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TRY: Record<string, string> = {
  "/safety-execution/command-bar": "Type “fl” and pick Forklift 3, then Clean. Enter creates the permit and the work order.",
  "/safety-execution/task-first": "Pick Inspect, type “FL-” to tick every forklift, approve. Or add your own job type.",
  "/safety-execution/v1": "Open Clean, tick Haas VF3 and Kaeser dryer. Create the draft documents, or a PM, or a work order with the documents attached.",
  "/safety-execution/new-work-order": "Pick Hydraulic Press 4 as the asset: the documents for the job show up under it.",
  "/safety-execution": "Type “Every last Friday of the month, clean Hydraulic Press 7”, or pick Forklift 3 and choose Clean.",
  "/compliance-calendar": "Approve Nova's 3 proposals, then ask “What else this week?”.",
  "/safety-execution/readiness": "Review the 5 AI matches first, then select Press 7 and Stretch wrapper 2 and draft what is missing.",
  "/safety-execution/mobile": "Scan, run the pre-use inspection, or tap Something else to ask Nova.",
  "/inbox": "Run the flow on the Press 4 injury, then open the back strain event to follow CAPA-0033. Open Nova for the usual flows.",
  "/events/ev-2041": "Same flow, on the event page. Use the arrows to move between events.",
  "/events/board": "Drag a card from Open to In review, or switch to On the card and decide there.",
};

export default function DemoPage() {
  const { reset } = useThreeCases();
  const [didReset, setDidReset] = useState(false);

  return (
    <PageShell title="Demo: 3 use cases" mainClassName="p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Safety: 3 use cases</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              Prototypes inside today&apos;s Safety layout. The AI is scripted, the plant and people are fictitious, and nothing is saved outside your browser.
            </p>
          </div>
          <button
            onClick={() => {
              reset();
              resetRealStore();
              setDidReset(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            {didReset ? <Check className="size-4 text-emerald-600" /> : <RotateCcw className="size-4" />} {didReset ? "Demo data reset" : "Reset demo data"}
          </button>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">1 · Effortless reporting</h2>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Already works</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            The no-login QR with voice or text and AI already carries most of the reporting volume. No new prototype. Later: photo creates the report, more
            languages, video, recording the 15-minute toolbox talk.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <PlayCircle className="size-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">2 · Guided work from the asset</h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{CASE_B_OPTIONS.filter((o) => !o.tested).length} options</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Today Safety is organized by document. This starts from the asset: see its JHA, SOP, LOTO, permit, inspections and SDS, pick what to do, and the AI
            creates the permit with its approvers and the work order with every document attached.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {CASE_B_OPTIONS.filter((o) => !o.tested).map((o) => (
              <OptionCard key={o.href} href={o.href} label={o.label} hint={o.hint} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="font-medium text-gray-600">Other options:</span>
            {CASE_B_OPTIONS.filter((o) => o.tested).map((o) => (
              <Link key={o.href} href={o.href} title={o.hint} className="hover:text-indigo-700 hover:underline">
                {o.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Workflow className="size-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">3 · Closing the loop on an event</h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">3 options</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Events get created and closed, but few become a CAPA or a work order. The AI shows the steps each event needs and suggests the actions. One click creates the
            CAPA, the work orders and the OSHA entry. Event, CAPA and each work order then keep their own status: the CAPA owner hears about every work order change,
            gets the CAPA back when all are done, and the event can close while the CAPA stays open.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {CASE_C_OPTIONS.map((o) => (
              <OptionCard key={o.href} href={o.href} label={o.label} hint={o.hint} />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function OptionCard({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <Link href={href} className="group flex flex-col gap-1 rounded-xl border border-gray-200 p-4 transition hover:border-indigo-300 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        <ArrowRight className="size-4 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
      </div>
      <span className="text-xs text-gray-600">{hint}</span>
      {TRY[href] ? <span className="mt-1 text-[11px] text-indigo-700">Try: {TRY[href]}</span> : null}
    </Link>
  );
}
