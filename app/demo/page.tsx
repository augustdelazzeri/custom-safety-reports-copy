"use client";

import { CASE_B_OPTIONS, CASE_C_OPTIONS } from "@/components/three-cases/option-switcher";
import { PageShell } from "@/components/three-cases/shell";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { ArrowRight, Check, Megaphone, PlayCircle, RotateCcw, Workflow } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TRY: Record<string, string> = {
  "/safety-execution": "Type “Every last Friday of the month, clean Hydraulic Press 7”, or pick Forklift 3 and choose Clean.",
  "/compliance-calendar": "Open a dashed AI chip, then approve the week.",
  "/safety-execution/readiness": "Select Press 7 and Stretch wrapper 2, then draft the missing documents.",
  "/safety-execution/mobile": "Run the pre-use inspection and fail one item.",
  "/inbox": "Pick two actions on the Press 4 injury and run the flow.",
  "/events/ev-2041": "Same flow, on the event page. Use the arrows to move between events.",
  "/events/board": "Every event by stage. Open a card in Decide.",
  "/events/autopilot": "The AI already ran the flow inside the policy. Approve the one injury, undo anything.",
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
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">4 options</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Today Safety is organized by document. This starts from the asset: see its JHA, SOP, LOTO, permit, inspections and SDS, pick what to do, and the AI
            creates the permit with its approvers and the work order with every document attached.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {CASE_B_OPTIONS.map((o) => (
              <OptionCard key={o.href} href={o.href} label={o.label} hint={o.hint} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Workflow className="size-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">3 · Closing the loop on an event</h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">4 options</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Events get created and closed, but few become a CAPA or a work order. The AI shows the steps each event needs and suggests the actions. One click creates the
            CAPA, the work orders and the OSHA entry, then the AI checks the completion photo and closes it.
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
      <span className="mt-1 text-[11px] text-indigo-700">Try: {TRY[href]}</span>
    </Link>
  );
}
