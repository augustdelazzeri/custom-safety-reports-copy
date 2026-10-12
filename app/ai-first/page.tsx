"use client";

// Hub for the AI-first prototypes. Each flow has its own variant picker (A, B, C).

import Link from "next/link";
import { ArrowRight, Camera, ClipboardCheck, FileUp, Inbox, MessageCircle, Monitor, RotateCcw, Smartphone, Workflow } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useAiFirst } from "@/contexts/AiFirstContext";

const FLOWS = [
  {
    code: "P1",
    href: "/ai-first/report",
    title: "Photo report",
    funnel: "Reactive",
    device: "mobile",
    icon: Camera,
    what: "A photo (and an optional voice note) from the Access Point QR becomes a report draft. The AI asks at most 3 questions that change the routing.",
    variants: ["Photo first", "Conversation", "Today's form + fill from photo"],
  },
  {
    code: "P10",
    href: "/ai-first/whatsapp",
    title: "Report by message",
    funnel: "Reactive",
    device: "mobile",
    icon: MessageCircle,
    what: "The QR opens a conversation instead of a form. Updates on the case come back in the same chat.",
    variants: ["WhatsApp", "SMS", "Web chat from the QR"],
  },
  {
    code: "P8",
    href: "/ai-first/inbox",
    title: "Supervisor queue",
    funnel: "Reactive",
    device: "desktop",
    icon: Inbox,
    what: "Every item arrives pre-processed. The supervisor sees only what needs a decision, with the reason and the confidence; low-risk items go in a batch.",
    variants: ["Exceptions first", "One at a time", "Today's inbox + AI column"],
  },
  {
    code: "P3",
    href: "/ai-first/action-plan?report=R-1042",
    title: "Event to action plan",
    funnel: "Reactive",
    device: "desktop",
    icon: Workflow,
    what: "CAPAs with work orders, Learn training, SOP changes and calendar tasks created in one step; an agent chases owners and proposes closing.",
    variants: ["Plan on one screen", "Side panel on the event", "Step by step"],
  },
  {
    code: "P7",
    href: "/ai-first/inspection",
    title: "Photo inspection",
    funnel: "Proactive",
    device: "mobile",
    icon: ClipboardCheck,
    what: "The AI pre-answers the checklist from photos or video; the inspector confirms each item; a failure becomes a work order or a CAPA.",
    variants: ["Photos first", "Item by item", "Video walkthrough"],
  },
  {
    code: "P5",
    href: "/ai-first/document-program",
    title: "Document in, program out",
    funnel: "Proactive",
    device: "desktop",
    icon: FileUp,
    what: "One PDF becomes SOP, checklist, cadence, failure rule, CMMS PM and training, plus what the document is missing.",
    variants: ["Plan by section", "Document beside the plan", "Start from the library"],
  },
];

export default function AiFirstHub() {
  const { reset, reports, capas, workOrders } = useAiFirst();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden md:ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Prototype · AI-first Safety</p>
                <h1 className="text-2xl font-bold text-gray-900">AI-first flows</h1>
                <p className="max-w-2xl text-sm text-gray-600">
                  Six flows, three variants each. Switch variants with the picker at the top of every flow. The tap counter compares each run with an estimate of today’s flow. All AI results are simulated with sample data.
                </p>
              </div>
              <button
                onClick={reset}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                title="Clears reports, CAPAs and work orders created while testing"
              >
                <RotateCcw className="w-4 h-4" /> Reset prototype data
              </button>
            </div>

            <div className="rounded-xl border border-violet-200 bg-white p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Suggested demo order</p>
              <p className="mt-1">
                <b>P1</b> report a spill by photo → <b>P8</b> the supervisor sets the severity → <b>P3</b> the action plan and the follow-up agent. Then <b>P10</b> as the no-app channel, and <b>P7</b> and <b>P5</b> for the proactive side.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Shared data right now: {reports.length} reports · {capas.length} CAPAs · {workOrders.length} work orders.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FLOWS.map((f) => (
                <Link key={f.code} href={f.href} className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-xs font-bold text-violet-700">{f.code}</span>
                    <span className="text-xs text-gray-500">{f.funnel}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-gray-500">
                      {f.device === "mobile" ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />} {f.device}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <f.icon className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-900">{f.title}</h2>
                  </div>
                  <p className="mt-1 flex-1 text-sm text-gray-600">{f.what}</p>
                  <ul className="mt-3 space-y-0.5 text-xs text-gray-500">
                    {f.variants.map((v, i) => (
                      <li key={v}>
                        <span className="font-semibold text-gray-400">{String.fromCharCode(65 + i)}.</span> {v}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-700 group-hover:gap-2 transition-all">
                    Open <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>

            <p className="text-xs text-gray-500">
              Rules in every flow: the AI drafts and a person decides severity, recordability, CAPA creation and closing; every AI field shows its confidence and source and can be edited, cleared or reverted; nothing is saved until the person confirms.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
