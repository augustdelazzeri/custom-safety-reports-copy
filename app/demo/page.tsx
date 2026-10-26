"use client";

import { RdBadge, RdCard, RdPage } from "@/components/redesign/ui";
import { CASE_B_OPTIONS, CASE_C_OPTIONS } from "@/components/three-cases/option-switcher";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { setDataMode } from "@/lib/three-cases/demo-data";
import { resetMvpStore } from "@/lib/three-cases/mvp-rules";
import { resetRealStore } from "@/lib/three-cases/real-jobs";
import { ArrowRight, Check, FileText, Megaphone, PlayCircle, RotateCcw, Workflow } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TRY: Record<string, string> = {
  "/safety-execution/command-bar": "Type “fl” and pick Forklift 3, then Clean. Enter creates the permit and the work order.",
  "/safety-execution/task-first": "Pick Inspect, type “FL-” to tick every forklift, approve. Or add your own job type. This is the one shown to Ryan, kept in the old frame.",
  "/safety-execution/f1": "Long-term vision, not complete. Look at the colors of the documents. Tick Haas VF3, then Create PM. Switch Data to No documents and let the AI draft what is missing.",
  "/safety-execution/f2": "The MVP. Pick Clean, hover Forklift FL-03 and click New work order, then Create. Switch Data to No documents or New account for the empty states.",
  "/safety-execution/v1": "Open Clean, tick Haas VF3 and Kaeser dryer. Create the draft documents, or a PM, or a work order with the documents attached.",
  "/safety-execution/v2": "Same as V1. Click a document ID in Required documents: it would open the document inside Safety.",
  "/safety-execution/v3": "Same as V2, with gray instead of yellow. Compare how loud the list is.",
  "/safety-execution/new-work-order": "Pick Hydraulic Press 4 as the asset: the documents for the job show up under it.",
  "/safety-execution": "Type “Every last Friday of the month, clean Hydraulic Press 7”, or pick Forklift 3 and choose Clean.",
  "/compliance-calendar": "Approve Nova's 3 proposals, then ask “What else this week?”.",
  "/safety-execution/readiness": "Review the 5 AI matches first, then select Press 7 and Stretch wrapper 2 and draft what is missing.",
  "/safety-execution/mobile": "Scan, run the pre-use inspection, or tap Something else to ask Nova.",
  "/inbox": "Run the flow on the Press 4 injury, then open the back strain event to follow CAPA-0033. Open Nova for the usual flows.",
  "/inbox/a1": "Switch between Events, CAPAs, Work orders and Documents. Turn off Open only. The work orders made in F2 show up here too.",
  "/events/ev-2041": "Same flow, on the event page. Use the arrows to move between events.",
  "/events/board": "Drag a card from Open to In review, or switch to On the card and decide there.",
};

function OptionCard({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <Link href={href} className="group flex flex-col gap-1 rounded-[var(--lab-radius)] border border-border p-4 transition-colors hover:bg-muted/50">
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
      </span>
      <span className="text-sm text-muted-foreground">{hint}</span>
      {TRY[href] ? <span className="mt-1 text-sm text-badge-accent-foreground">Try: {TRY[href]}</span> : null}
    </Link>
  );
}

export default function DemoPage() {
  const { reset } = useThreeCases();
  const [didReset, setDidReset] = useState(false);
  const featuredB = CASE_B_OPTIONS.filter((o) => !o.tested);

  return (
    <PageShell title="Demo: 3 use cases" mainClassName="p-0">
      <RdPage
        title="Safety: 3 use cases"
        subtitle="Prototypes inside the Safety redesign's frame. The AI is scripted, the plant and people are made up, and nothing is saved outside your browser."
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              reset();
              resetRealStore();
              resetMvpStore();
              setDataMode("sample");
              setDidReset(true);
            }}
          >
            {didReset ? <Check className="size-4" /> : <RotateCcw className="size-4" />} {didReset ? "Demo data reset" : "Reset demo data"}
          </Button>
        }
      >
        <div className="flex max-w-5xl flex-col gap-6">
          <RdCard title="1 · Effortless reporting" icon={<Megaphone />} action={<RdBadge tone="success">Already works</RdBadge>} padded>
            <p className="text-sm text-muted-foreground">
              The no-login QR with voice or text and AI already carries most of the reporting volume. No new prototype. Later: photo creates the report, more languages, video, recording the 15-minute toolbox talk.
            </p>
          </RdCard>

          <RdCard title="2 · Guided work from the asset" icon={<PlayCircle />} action={<RdBadge tone="accent">{featuredB.length} options</RdBadge>} padded>
            <p className="text-sm text-muted-foreground">
              Today Safety is organized by document. This starts from the asset: see its JHA, SOP, LOTO, permit, inspections and SDS, pick what to do, and the AI creates the permit with its approvers and the work order with every document attached. F1 and F2 have
              an empty account too (Data: No documents, New account).
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {featuredB.map((o) => (
                <OptionCard key={o.href} href={o.href} label={o.label} hint={o.hint} />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Other options:</span>
              {CASE_B_OPTIONS.filter((o) => o.tested).map((o) => (
                <Link key={o.href} href={o.href} title={o.hint} className="hover:text-foreground hover:underline">
                  {o.label}
                </Link>
              ))}
            </div>
          </RdCard>

          <RdCard title="3 · Closing the loop on an event" icon={<Workflow />} action={<RdBadge tone="accent">{CASE_C_OPTIONS.length} options</RdBadge>} padded>
            <p className="text-sm text-muted-foreground">
              Events get created and closed, but few become a CAPA or a work order. The AI shows the steps each event needs and suggests the actions. One click creates the CAPA, the work orders and the OSHA entry. Event, CAPA and each work order then keep their own
              status: the CAPA owner hears about every work order change, gets the CAPA back when all are done, and the event can close while the CAPA stays open.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {CASE_C_OPTIONS.map((o) => (
                <OptionCard key={o.href} href={o.href} label={o.label} hint={o.hint} />
              ))}
            </div>
          </RdCard>

          <RdCard title="Documentation, one page" icon={<FileText />} action={<RdBadge>From the redesign</RdBadge>} padded>
            <p className="text-sm text-muted-foreground">JHA, SOP, LOTO, permits and audits as five tabs of one page, as in Thiago&apos;s redesign. The rows are the documents use case 2 reads.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <OptionCard href="/documentation" label="Documentation" hint="Five kinds, one place. Switch Data to No documents for the empty tabs." />
            </div>
          </RdCard>
        </div>
      </RdPage>
    </PageShell>
  );
}
