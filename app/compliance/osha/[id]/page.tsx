"use client";

import { RdBadge, RdCard, RdEmptyState, RdPage, figmaButton } from "@/components/redesign/ui";
import { ClassBadge } from "@/components/screens/compliance/osha-log";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { AGENCY_REPORTS, CLASS_LABEL, INJURY_LABEL, formatDate, useOshaLog } from "@/lib/screens/compliance";
import { Pencil, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, type ReactNode } from "react";

/** Label/value pairs in a grid (the redesign's MetaGrid), never a run-on line. */
function MetaGrid({ items }: { items: { label: string; value: ReactNode; hint?: string }[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">{item.value}</dd>
          {item.hint ? <p className="text-xs text-muted-foreground">{item.hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}

/**
 * One case of the OSHA 300 log, read as the Form 300 line it becomes (lab-osha-case.tsx): every
 * column the regulator expects, the Form 301 details behind it, and how it got on the log.
 */
export default function OshaCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { cases } = useOshaLog();
  const c = cases.find((x) => x.id === id);
  const back = () => router.push("/compliance?tab=osha");

  if (!c) {
    return (
      <PageShell title="OSHA case" mainClassName="p-0">
        <RdPage title="OSHA case" record onBack={back}>
          <RdEmptyState
            icon={ShieldCheck}
            title="Not on the log"
            body={id === "2026-014" ? "EVT-2041 is still waiting in the recordability review. Confirm it there and it becomes case 2026-014." : "This case is not on the 2026 log."}
            action={
              <Button type="button" variant="outline" size="sm" className={figmaButton} onClick={back}>
                Open the log
              </Button>
            }
          />
        </RdPage>
      </PageShell>
    );
  }

  const reports = AGENCY_REPORTS.filter((r) => r.caseId === c.id);

  return (
    <PageShell title={`OSHA case ${c.id}`} mainClassName="p-0">
      <RdPage
        eyebrow={`Case ${c.id} · ${c.eventRef}`}
        title={c.title}
        record
        onBack={back}
        actions={
          <Button type="button" variant="outline" size="sm" className={figmaButton} title="Edit the Form 300 entry (not part of this prototype)">
            <Pencil aria-hidden /> Edit
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <ClassBadge value={c.caseClass} />
          <RdBadge>Springfield Plant</RdBadge>
          {c.privacy ? <RdBadge>Privacy case</RdBadge> : null}
          {c.ongoing ? <RdBadge tone="warning">Still restricted</RdBadge> : null}
        </div>

        <RdCard title="Form 300 entry">
          <div className="p-4">
            <MetaGrid
              items={[
                { label: "Case number (A)", value: c.id },
                { label: "Employee (B)", value: c.privacy ? "Privacy case" : c.employee, hint: c.privacy ? "The name is kept on a separate, confidential list" : undefined },
                { label: "Job title (C)", value: c.jobTitle },
                { label: "Date of injury (D)", value: formatDate(c.date) },
                { label: "Where it happened (E)", value: c.where },
                { label: "What happened (F)", value: c.title },
                { label: "Classification (G–J)", value: CLASS_LABEL[c.caseClass] },
                { label: "Days away from work (K)", value: c.daysAway },
                { label: "Days restricted or transferred (L)", value: c.daysRestricted, hint: c.ongoing ? "Still counting, up to 180" : undefined },
                { label: "Injury or illness (M)", value: INJURY_LABEL[c.injuryType] },
              ]}
            />
          </div>
        </RdCard>

        <RdCard title="Injury and illness report (Form 301)">
          <div className="p-4">
            <MetaGrid
              items={[
                { label: "Body part", value: c.bodyPart },
                { label: "Object or substance", value: c.object },
                { label: "Treatment", value: c.treatment },
                { label: "Physician or clinic", value: c.clinic },
                { label: "Emergency room", value: c.emergencyRoom ? "Yes" : "No" },
                { label: "Hospitalized overnight", value: c.hospitalized ? "Yes" : "No" },
                { label: "Report to OSHA in 24 hours", value: reports.some((r) => r.type === "Amputation") ? "Sent" : "Not needed", hint: reports.length ? reports.map((r) => r.id).join(", ") : "29 CFR 1904.39" },
              ]}
            />
          </div>
        </RdCard>

        <RdCard title="How it got on the log">
          <div className="flex flex-col gap-2 p-4 text-sm text-foreground">
            <p>{c.how}</p>
            <p className="text-muted-foreground">
              {c.addedBy} · {formatDate(c.addedOn)}
            </p>
            {c.eventId ? (
              <Link href={`/events/${c.eventId}`} className="self-start font-medium text-primary underline-offset-4 hover:underline">
                Open the event
              </Link>
            ) : null}
          </div>
        </RdCard>
      </RdPage>
    </PageShell>
  );
}
