"use client";

import { RdCard, RdEmptyState, RdSegmented, figmaButton } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import {
  CERTIFIED_2025,
  ESTABLISHMENT,
  SUMMARY_2025,
  YEAR_FACTS,
  countCases,
  formatNumber,
  rates,
  useOshaLog,
  type InjuryType,
  type SummaryCounts,
} from "@/lib/screens/compliance";
import { cn } from "@/lib/utils";
import { Building2, CircleCheck, Pencil, Printer, Send, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { CaseFilter } from "./osha-log";

const tileClass = "flex flex-col gap-1 rounded-[var(--lab-radius)] p-4 text-left";

/** One number of the 300A. A count opens its cases in the log; a rate stays flat. */
function Tile({ label, value, hint, onOpen }: { label: string; value: ReactNode; hint?: string; onOpen?: () => void }) {
  const body = (
    <>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-2xl leading-none font-semibold text-foreground tabular-nums">{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </>
  );
  return onOpen ? (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${label}: open the cases in the log`}
      className={cn(tileClass, "border border-border bg-card transition-colors hover:bg-surface-subtle focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none")}
    >
      {body}
    </button>
  ) : (
    <div className={cn(tileClass, "bg-muted")}>{body}</div>
  );
}

function Detail({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Form 300A's column M, as the sheet names them. */
const TYPES: { key: InjuryType; label: string }[] = [
  { key: "injury", label: "Injuries" },
  { key: "skin", label: "Skin disorders" },
  { key: "respiratory", label: "Respiratory conditions" },
  { key: "poisoning", label: "Poisonings" },
  { key: "hearing", label: "Hearing loss" },
  { key: "otherIllness", label: "All other illnesses" },
];

/**
 * Form 300A, end state: the year's totals counted from the log (so the two never disagree and
 * every number opens its cases), the injury and illness types, the establishment, and the
 * certification with posting and the electronic submission. 2026 is still open; 2025 is the
 * closed year, certified, posted and sent.
 */
export function Summary({ year, onYear, onOpenLog }: { year: "2026" | "2025"; onYear: (y: "2026" | "2025") => void; onOpenLog: (f: CaseFilter) => void }) {
  const { cases, empty } = useOshaLog();
  if (empty) {
    return <RdEmptyState icon={Building2} title="No establishment yet" body="Add an OSHA location in Settings to see its Form 300A summary." />;
  }

  const open = year === "2026";
  const counts: SummaryCounts = open ? countCases(cases) : SUMMARY_2025;
  const facts = YEAR_FACTS[Number(year)];
  const r = rates(counts, facts.hoursWorked);
  const link = (f: CaseFilter) => (open ? () => onOpenLog(f) : undefined);
  const ongoing = open ? cases.filter((c) => c.ongoing).length : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <RdSegmented
          value={year}
          onChange={onYear}
          options={[
            { value: "2026", label: "2026 · year to date" },
            { value: "2025", label: "2025" },
          ]}
        />
        <p className="text-sm text-muted-foreground">
          {open ? "Counted from the 2026 log as cases are added." : `Certified on ${CERTIFIED_2025.date} · posted ${CERTIFIED_2025.posted}`}
        </p>
      </div>

      <RdCard title={`Annual summary · ${year}`}>
        <div className="p-4">
          <p className="max-w-[70ch] text-sm text-muted-foreground">
            Form 300A for Springfield Plant: the year&apos;s recordable cases counted by case class, to certify and post from February 1 to April 30.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Tile label="Recordable cases" value={counts.total} onOpen={link("all")} />
            <Tile label="Deaths (G)" value={counts.deaths} onOpen={link("death")} />
            <Tile label="Cases with days away (H)" value={counts.daysAwayCases} onOpen={link("daysAway")} />
            <Tile label="Cases with restriction (I)" value={counts.restrictedCases} onOpen={link("restricted")} />
            <Tile label="Other recordable cases (J)" value={counts.otherCases} onOpen={link("other")} />
            <Tile label="Days away from work (K)" value={counts.daysAway} onOpen={link("withDaysAway")} />
            <Tile label="Days restricted (L)" value={counts.daysRestricted} onOpen={link("withRestricted")} hint={ongoing ? `${ongoing} ${ongoing === 1 ? "case" : "cases"} still counting` : undefined} />
            <Tile label="TRC rate" value={r.trc} hint="Per 200,000 hours" />
            <Tile label="DART rate" value={r.dart} hint="Per 200,000 hours" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {open ? `Counted from ${counts.total} cases on the OSHA 300 log, including cases confirmed in the review. Select a number to see its cases.` : "Counted from the 17 cases on the closed 2025 log."}
          </p>
        </div>
      </RdCard>

      <RdCard title="Injury and illness types (M)">
        <dl className="grid gap-4 p-4 sm:grid-cols-3 xl:grid-cols-6">
          {TYPES.map((t) => (
            <div key={t.key} className="flex flex-col gap-1">
              <dt className="text-sm text-muted-foreground">{t.label}</dt>
              <dd className={cn("text-xl leading-none font-semibold tabular-nums", counts.types[t.key] ? "text-foreground" : "text-text-placeholder")}>{counts.types[t.key]}</dd>
            </div>
          ))}
        </dl>
      </RdCard>

      <RdCard
        title="Establishment"
        action={
          <Button type="button" variant="ghost" size="sm" className={figmaButton} title="Edit the establishment (not part of this prototype)">
            <Pencil aria-hidden /> Edit
          </Button>
        }
      >
        <dl className="grid gap-x-8 gap-y-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Establishment name" value={ESTABLISHMENT.name} />
          <Detail label="Street" value={ESTABLISHMENT.street} />
          <Detail label="Industry" value={ESTABLISHMENT.industry} />
          <Detail label="NAICS code" value={ESTABLISHMENT.naics} />
          <Detail label="EIN" value={ESTABLISHMENT.ein} />
          <Detail label="Annual average employees" value={formatNumber(facts.averageEmployees)} />
          <Detail label="Total hours worked" value={formatNumber(facts.hoursWorked)} hint={facts.hoursNote} />
        </dl>
      </RdCard>

      <RdCard title="Certification">
        {open ? (
          <div className="flex flex-col gap-4 p-4">
            <p className="text-sm text-muted-foreground">A company executive certifies the summary before it is posted (29 CFR 1904.32).</p>
            <div className="flex flex-col gap-2 rounded-lg bg-muted p-4">
              <p className="text-sm font-medium text-foreground">Before you certify</p>
              <ul className="flex flex-col gap-1.5">
                {["Establishment name, NAICS code and EIN", "Annual average employees", "Total hours worked, to date (add the full year in January)", "Every case on the log is complete"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CircleCheck className="size-4 shrink-0 text-badge-success-foreground" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <p className="min-w-0 flex-1 text-sm text-foreground">
                The year is still open. Aisha Khan, Plant Manager, certifies the 2026 summary from January 1, 2027; it is posted from February 1 to April 30 and sent to OSHA by March 2.
              </p>
              <Button type="button" variant="outline" size="sm" className={figmaButton} title="Prints the draft 300A (not part of this prototype)">
                <Printer aria-hidden /> Print a draft
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-4 border-b border-border p-4">
              <CircleCheck className="size-5 shrink-0 text-badge-success-foreground" aria-hidden />
              <p className="min-w-0 flex-1 text-sm text-foreground">
                Certified by {CERTIFIED_2025.name}, {CERTIFIED_2025.title}, on {CERTIFIED_2025.date}.
              </p>
              <Button type="button" variant="outline" size="sm" className={figmaButton} title="Prints the certified 300A (not part of this prototype)">
                <Printer aria-hidden /> Print 300A
              </Button>
            </div>
            <dl className="grid gap-x-8 gap-y-4 p-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <ShieldCheck className="size-4" aria-hidden />
                </span>
                <Detail label="Posted" value={CERTIFIED_2025.posted} hint={CERTIFIED_2025.postedWhere} />
              </div>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Send className="size-4" aria-hidden />
                </span>
                <Detail label="Sent to OSHA" value={`${CERTIFIED_2025.sent}, with Forms 300 and 301`} hint={`Injury Tracking Application · confirmation ${CERTIFIED_2025.confirmation}`} />
              </div>
            </dl>
          </div>
        )}
      </RdCard>
    </div>
  );
}
