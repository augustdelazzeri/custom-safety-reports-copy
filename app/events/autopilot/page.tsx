"use client";

import { SEVERITY_STYLE } from "@/components/three-cases/event-flow";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { AiTag, PageShell, TapCompare } from "@/components/three-cases/shell";
import { event as getEvent, person } from "@/lib/three-cases/data";
import { cn } from "@/lib/utils";
import {
  Bot,
  Camera,
  Check,
  ClipboardCheck,
  FileBarChart,
  Loader2,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Undo2,
  UserCheck,
  Wrench,
} from "lucide-react";
import { useState } from "react";

type FeedItem = {
  id: string;
  at: string;
  eventId?: string;
  title: string;
  did: { icon: React.ComponentType<{ className?: string }>; text: string }[];
  why: string;
  kind: "acted" | "closed" | "verified" | "chased";
};

const FEED: FeedItem[] = [
  {
    id: "f1",
    at: "07:49",
    eventId: "ev-2040",
    title: "Emergency stop button broken on Conveyor 12",
    kind: "acted",
    did: [
      { icon: Wrench, text: "WO-1062 apply LOTO-0022 now · Tom Becker, texted" },
      { icon: Wrench, text: "WO-1063 replace the e-stop · part reserved from the storeroom" },
      { icon: ClipboardCheck, text: "CAPA-0044 with both actions · owner Dan Brooks · due Oct 23" },
    ],
    why: "High severity with no injury: policy says act, then tell you",
  },
  {
    id: "f2",
    at: "Yesterday 16:31",
    eventId: "ev-2039",
    title: "Forklift nearly hit a pedestrian at Dock door 2",
    kind: "acted",
    did: [
      { icon: ClipboardCheck, text: "CAPA-0045 preventive · owner Jo Park · due Oct 30" },
      { icon: Wrench, text: "WO-1064 paint walkway and add mirror at Dock door 2 · Carlos Rivera" },
      { icon: MessageSquare, text: "Toolbox talk added to tomorrow's shift start" },
    ],
    why: "Third near miss at the docks in 60 days, so the AI went for an engineering control",
  },
  {
    id: "f3",
    at: "Yesterday 11:06",
    eventId: "ev-2038",
    title: "Oil leak under Hydraulic Press 7",
    kind: "acted",
    did: [{ icon: Wrench, text: "WO-1065 replace the return hose and clean the spill · Carlos Rivera · today" }],
    why: "Repeat failure on the same hose. No CAPA: below the policy threshold, the hose is added to the Press 7 PM",
  },
  {
    id: "f4",
    at: "Yesterday 08:21",
    eventId: "ev-2037",
    title: "Light out in aisle 7",
    kind: "closed",
    did: [{ icon: Check, text: "Closed with no action · routine work order sent to replace the fixture" }],
    why: "Observation with no one at risk",
  },
  {
    id: "f5",
    at: "Yesterday 15:10",
    title: "Missing guard on band saw · CAPA-0040",
    kind: "verified",
    did: [{ icon: Camera, text: "WO-1058 completion photo shows the guard in place. CAPA-0040 and EVT-2031 closed" }],
    why: "Policy: close when the work order photo passes",
  },
  {
    id: "f6",
    at: "Yesterday 09:00",
    title: "CAPA-0039 is 2 days late",
    kind: "chased",
    did: [{ icon: MessageSquare, text: "Texted Dan Brooks: “Guard on band saw is 2 days late. Reply DONE with a photo or a new date.”" }],
    why: "Policy: chase the owner 2 days after the due date",
  },
];

const POLICY = [
  { label: "Injury or OSHA recordable", rule: "Ask me", strict: true },
  { label: "High severity, no injury", rule: "Act, then tell me", strict: false },
  { label: "Medium and low", rule: "Act on my behalf", strict: false },
  { label: "Observation with no risk", rule: "Close it", strict: false },
  { label: "CAPA 2 days late", rule: "Text the owner", strict: false },
  { label: "Work order photo passes", rule: "Close CAPA and event", strict: false },
];

const KIND_STYLE: Record<FeedItem["kind"], { label: string; cls: string }> = {
  acted: { label: "Acted", cls: "bg-indigo-50 text-indigo-700" },
  closed: { label: "Closed", cls: "bg-gray-100 text-gray-700" },
  verified: { label: "Verified", cls: "bg-emerald-50 text-emerald-700" },
  chased: { label: "Followed up", cls: "bg-amber-50 text-amber-800" },
};

export default function AutopilotPage() {
  const [undone, setUndone] = useState<string[]>([]);
  const [approved, setApproved] = useState<"no" | "running" | "yes">("no");
  const injury = getEvent("ev-2041")!;
  const handled = FEED.filter((f) => !undone.includes(f.id)).length;

  return (
    <PageShell title="Safety Autopilot" mainClassName="flex flex-col gap-3 overflow-hidden p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />
        <TapCompare today="every event by hand" todayDetail="one admin closes almost everything" here="1 click a day" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_300px] gap-3">
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
          {/* Today in one line */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-4 text-white">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15">
              <Bot className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold">Autopilot handled {handled} things since yesterday</div>
              <div className="text-sm text-indigo-100">
                {approved === "yes" ? "Nothing is waiting on you." : "1 needs you: an injury always goes to a person."}
              </div>
            </div>
            <div className="flex gap-4 text-center">
              {[
                { n: 3, l: "CAPAs" },
                { n: 5, l: "Work orders" },
                { n: 1, l: "Closed by photo" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-xl font-semibold">{s.n}</div>
                  <div className="text-[11px] text-indigo-100">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* The one thing that needs a person */}
          <section className={cn("rounded-2xl border-2 bg-white p-4", approved === "yes" ? "border-emerald-200" : "border-rose-200")}>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white">Needs you</span>
              <span className="text-xs text-gray-500">Injury and OSHA recordable: policy asks a person</span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-gray-500">{injury.ref}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", SEVERITY_STYLE[injury.severity])}>{injury.severity}</span>
                </div>
                <h2 className="text-base font-semibold text-gray-900">{injury.title}</h2>
                <p className="mt-1 text-xs text-gray-600">{injury.aiSummary}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
              <PlanTile icon={ClipboardCheck} title="CAPA, 3 actions" detail="Replace light curtain · daily light curtain test · retrain operators. Owner Dan Brooks, due Oct 23" />
              <PlanTile icon={Wrench} title="Work order" detail="Replace light curtain on Press 4 · Dan Brooks · in 2 days. Press 4 locked out until then" />
              <PlanTile icon={FileBarChart} title="OSHA 300 entry" detail="Case 2026-014 · Other recordable · laceration, left hand · 0 days away" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {approved === "yes" ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                  <Check className="size-4" /> Approved. CAPA-0046, WO-1066 and OSHA case 2026-014 created. Dan was texted.
                </span>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setApproved("running");
                      setTimeout(() => setApproved("yes"), 1200);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {approved === "running" ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />} Approve the plan
                  </button>
                  <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">Change actions</button>
                </>
              )}
            </div>
          </section>

          {/* What the AI did */}
          <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <AiTag label="Done by AI" />
                <span className="text-sm font-semibold text-gray-900">Every action is logged and can be undone</span>
              </div>
            </div>
            <ol className="divide-y divide-gray-100">
              {FEED.map((f) => {
                const isUndone = undone.includes(f.id);
                const ev = f.eventId ? getEvent(f.eventId) : undefined;
                return (
                  <li key={f.id} className={cn("flex gap-3 px-4 py-3", isUndone && "bg-gray-50")}>
                    <div className="w-24 shrink-0 pt-0.5 text-[11px] text-gray-400">{f.at}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", KIND_STYLE[f.kind].cls)}>{KIND_STYLE[f.kind].label}</span>
                        {ev ? <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_STYLE[ev.severity])}>{ev.severity}</span> : null}
                        <span className={cn("text-sm font-medium text-gray-900", isUndone && "text-gray-400 line-through")}>{f.title}</span>
                      </div>
                      {isUndone ? (
                        <p className="mt-1 text-xs text-gray-500">Undone. The records were removed and the item went back to the Inbox.</p>
                      ) : (
                        <>
                          <ul className="mt-1 space-y-0.5">
                            {f.did.map((d) => (
                              <li key={d.text} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <d.icon className="mt-0.5 size-3.5 shrink-0 text-gray-400" /> {d.text}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-1 text-[11px] italic text-indigo-700">Why: {f.why}</p>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setUndone((u) => (u.includes(f.id) ? u.filter((x) => x !== f.id) : [...u, f.id]))}
                      className="h-fit shrink-0 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                    >
                      {isUndone ? (
                        <span className="inline-flex items-center gap-1">
                          <RotateCcw className="size-3" /> Redo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Undo2 className="size-3" /> Undo
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* Policy */}
        <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="size-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-gray-900">Your policy</h2>
            </div>
            <p className="mb-3 text-xs text-gray-500">Written by Maria Lopez. The AI never goes past it.</p>
            <ul className="space-y-2">
              {POLICY.map((p) => (
                <li key={p.label} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-2.5 py-2">
                  <span className="text-xs text-gray-700">{p.label}</span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", p.strict ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-700")}>{p.rule}</span>
                </li>
              ))}
            </ul>
            <button className="mt-3 w-full rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-700">Edit policy</button>
          </section>
          <section className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-600">
            <div className="mb-1 text-sm font-semibold text-gray-900">Who got a message</div>
            <ul className="space-y-1.5">
              {["tom", "carlos", "dan", "jo"].map((pid) => (
                <li key={pid} className="flex items-center justify-between">
                  <span>{person(pid).name}</span>
                  <span className="text-gray-400">{pid === "dan" ? "2 texts" : "1 text"}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}

function PlanTile({ icon: Icon, title, detail }: { icon: React.ComponentType<{ className?: string }>; title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        <Icon className="size-4 text-gray-500" /> {title}
      </div>
      <p className="mt-1 text-xs text-gray-600">{detail}</p>
    </div>
  );
}
