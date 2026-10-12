"use client";

// The decision card for one inbox item, shared by the three P8 variants.
// Severity, recordability and CAPA decisions always need an explicit choice by a person.

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ClipboardCheck, HardHat, Scale, ThumbsUp, UserRoundCog } from "lucide-react";
import type { InboxItem, Severity } from "@/lib/ai-first/types";
import { useAiFirst } from "@/contexts/AiFirstContext";
import { ConfidenceBadge, PhotoWithPins } from "../AiPrimitives";
import { cn } from "@/lib/utils";

export const KIND_META: Record<InboxItem["kind"], { label: string; icon: React.ElementType; tone: string }> = {
  osha_check: { label: "OSHA check", icon: Scale, tone: "text-rose-700 bg-rose-50 border-rose-200" },
  event_review: { label: "Event review", icon: AlertTriangle, tone: "text-amber-700 bg-amber-50 border-amber-200" },
  inspection_fail: { label: "Inspection", icon: ClipboardCheck, tone: "text-blue-700 bg-blue-50 border-blue-200" },
  capa_overdue: { label: "CAPA overdue", icon: CalendarClock, tone: "text-violet-700 bg-violet-50 border-violet-200" },
  auto_handled: { label: "Handled by AI", icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
};

export const RISK_ORDER = { high: 0, medium: 1, low: 2 } as const;

export function KindChip({ kind }: { kind: InboxItem["kind"] }) {
  const m = KIND_META[kind];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", m.tone)}>
      <m.icon className="w-3 h-3" /> {m.label}
    </span>
  );
}

const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

function actionPlanHref(item: InboxItem) {
  return `/ai-first/action-plan?report=${item.reportId ?? "R-1042"}`;
}

export function InboxDecision({ item, onDone }: { item: InboxItem; onDone?: () => void }) {
  const { reports, updateInboxItem, updateReport } = useAiFirst();
  const report = item.reportId ? reports.find((r) => r.id === item.reportId) : undefined;
  const aiSeverity = (report?.severity ?? "medium") as Severity;
  const [severity, setSeverity] = useState<Severity | null>(null);

  const finish = (done: InboxItem["done"]) => {
    updateInboxItem(item.id, { done });
    onDone?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <KindChip kind={item.kind} />
        <span className="text-xs text-gray-500">
          {item.location} · {item.createdAt}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>

      <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">Why this needs you</p>
        <p className="text-sm text-gray-800">{item.reason}</p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm font-medium text-gray-900">AI suggests: {item.suggestion}</span>
          <ConfidenceBadge value={item.confidence} />
        </div>
      </div>

      {report && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <PhotoWithPins src={report.photo} pins={report.pins} />
          <div className="space-y-1.5 text-sm">
            <p className="text-gray-800">{report.description}</p>
            <p className="text-xs text-gray-500">Asset: {report.asset ?? "not set"}</p>
            <p className="text-xs text-gray-500">Reported by {report.reporter} · {report.language}</p>
            {report.aiTouched.length > 0 && (
              <p className="text-xs text-blue-700">Reporter changed: {report.aiTouched.join(", ")}</p>
            )}
          </div>
        </div>
      )}

      {item.kind === "osha_check" && <OshaReasoning fromReport={report} />}

      {item.done ? (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-4 h-4" /> Done: {item.done}.{" "}
          <button className="underline" onClick={() => updateInboxItem(item.id, { done: undefined })}>
            Undo
          </button>
        </p>
      ) : (
        <DecisionButtons
          item={item}
          aiSeverity={aiSeverity}
          severity={severity}
          setSeverity={setSeverity}
          onFinish={(done, sev) => {
            if (sev && report) updateReport(report.id, { severity: sev, status: "approved" });
            finish(done);
          }}
        />
      )}
    </div>
  );
}

function DecisionButtons({
  item,
  aiSeverity,
  severity,
  setSeverity,
  onFinish,
}: {
  item: InboxItem;
  aiSeverity: Severity;
  severity: Severity | null;
  setSeverity: (s: Severity) => void;
  onFinish: (done: InboxItem["done"], sev?: Severity) => void;
}) {
  const btn = "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium";

  if (item.kind === "event_review" && item.needsPerson) {
    return (
      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-gray-600">Set the severity (you decide)</p>
          <div className="flex flex-wrap gap-2">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={cn(
                  "relative rounded-lg border px-3 py-1.5 text-sm capitalize",
                  severity === s ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                {s}
                {s === aiSeverity && (
                  <span className="absolute -top-2 -right-2 rounded-full bg-violet-600 px-1.5 text-[9px] font-bold text-white">AI</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={actionPlanHref(item)}
            onClick={(e) => {
              if (!severity) {
                e.preventDefault();
                return;
              }
              onFinish("approved", severity);
            }}
            className={cn(btn, "bg-violet-600 text-white", !severity && "opacity-40 cursor-not-allowed")}
          >
            Confirm and plan actions <ArrowRight className="w-4 h-4" />
          </Link>
          <button disabled={!severity} onClick={() => severity && onFinish("approved", severity)} className={cn(btn, "border border-gray-300 bg-white text-gray-800 disabled:opacity-40")}>
            Confirm only
          </button>
          <button onClick={() => onFinish("skipped")} className={cn(btn, "text-gray-500 hover:bg-gray-100")}>
            Later
          </button>
        </div>
      </div>
    );
  }

  if (item.kind === "osha_check") {
    return (
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onFinish("approved")} className={cn(btn, "bg-rose-600 text-white")}>
          <Scale className="w-4 h-4" /> Recordable: add to OSHA 300
        </button>
        <button onClick={() => onFinish("edited")} className={cn(btn, "border border-gray-300 bg-white text-gray-800")}>
          Not recordable
        </button>
        <button onClick={() => onFinish("skipped")} className={cn(btn, "border border-gray-300 bg-white text-gray-800")}>
          Ask the employee about treatment
        </button>
      </div>
    );
  }

  if (item.kind === "inspection_fail") {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href="/ai-first/action-plan?report=R-1042" onClick={() => onFinish("approved")} className={cn(btn, "bg-violet-600 text-white")}>
          <HardHat className="w-4 h-4" /> Create CAPA (recommended)
        </Link>
        <button onClick={() => onFinish("edited")} className={cn(btn, "border border-gray-300 bg-white text-gray-800")}>
          Just another work order
        </button>
      </div>
    );
  }

  if (item.kind === "capa_overdue") {
    return (
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onFinish("approved")} className={cn(btn, "bg-violet-600 text-white")}>
          <UserRoundCog className="w-4 h-4" /> Reassign to Marcus Lee
        </button>
        <button onClick={() => onFinish("edited")} className={cn(btn, "border border-gray-300 bg-white text-gray-800")}>
          Keep owner, extend 3 days
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => onFinish("approved")} className={cn(btn, "bg-emerald-600 text-white")}>
      <ThumbsUp className="w-4 h-4" /> {item.suggestion.split(" and ")[0] || "Acknowledge"}
    </button>
  );
}

// OSHA-1: the recordability reasoning shown step by step, each step citing the rule and the evidence.
export function OshaReasoning({ fromReport }: { fromReport?: { location: string; answers: { treatment?: string } } }) {
  const steps = fromReport
    ? [
        { q: "Work-related?", a: "Yes", why: `Happened at ${fromReport.location} during the shift (29 CFR 1904.5)`, conf: 0.93 },
        { q: "New case?", a: "Likely yes", why: "No earlier case for this person on record (1904.6)", conf: 0.8 },
        { q: "Treatment beyond first aid?", a: "Reported yes", why: "Reporter answered “yes” in the quick check. What treatment is not known yet (1904.7(b)(5))", conf: 0.74 },
        { q: "Days away or restricted work?", a: "Unknown", why: "Not in the report. Ask the employee or the clinic note.", conf: 0 },
      ]
    : [
        { q: "Work-related?", a: "Yes", why: "Happened on Packing line 2 during the shift (29 CFR 1904.5)", conf: 0.95 },
        { q: "New case?", a: "Yes", why: "No previous injury to this hand on record (1904.6)", conf: 0.9 },
        { q: "Treatment beyond first aid?", a: "Likely yes", why: "Voice note: “they gave me stitches at the clinic”. Sutures are medical treatment (1904.7(b)(5)(ii))", conf: 0.77 },
        { q: "Days away or restricted work?", a: "Unknown", why: "Not in the report. Ask the employee or the clinic note.", conf: 0 },
      ];
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <p className="border-b border-gray-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        Recordability reasoning (29 CFR 1904) · suggestion, not a decision
      </p>
      <ol className="divide-y divide-gray-100">
        {steps.map((s, i) => (
          <li key={s.q} className="flex items-start gap-3 px-3 py-2 text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-gray-900">
                {s.q} <span className="font-semibold">{s.a}</span>
              </p>
              <p className="text-xs text-gray-500">{s.why}</p>
            </div>
            {s.conf > 0 ? <ConfidenceBadge value={s.conf} compact /> : <span className="text-[10px] font-semibold text-gray-400">ASK</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
