"use client";

import { RdAsk, RdTable, RdToolbar, type RdColumn } from "@/components/redesign/table";
import { RdBadge, RdCard, RdEmptyState, TitleCell, fieldClass, figmaButton } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { event as getEvent } from "@/lib/three-cases/data";
import { CLASS_LABEL, EVT_2041_EMPLOYEE, REVIEW_2041, formatDate, setReview, useOshaLog, type CaseClass, type OshaCase } from "@/lib/screens/compliance";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ListFilter, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** The 300A tile a log was opened from, so the log shows exactly what the tile counted. */
export type CaseFilter = "all" | CaseClass | "withDaysAway" | "withRestricted";

export const FILTER_LABEL: Record<CaseFilter, string> = {
  all: "Recordable cases",
  death: "Deaths",
  daysAway: "Cases with days away",
  restricted: "Cases with job restriction",
  other: "Other recordable cases",
  withDaysAway: "Days away from work",
  withRestricted: "Days restricted",
};

export const matchesFilter = (c: OshaCase, f: CaseFilter) =>
  f === "all" ? true : f === "withDaysAway" ? c.daysAway > 0 : f === "withRestricted" ? c.daysRestricted > 0 : c.caseClass === f;

/** The case classes as a list can show them; the record spells them out as Form 300 does. */
const CLASS_SHORT: Record<CaseClass, string> = { death: "Death", daysAway: "Days away", restricted: "Job restriction", other: "Other recordable" };

/** A death is the one class that is not just a category: the rest stay grey. */
export function ClassBadge({ value, short = false }: { value: CaseClass; short?: boolean }) {
  return <RdBadge tone={value === "death" ? "error" : "neutral"}>{short ? CLASS_SHORT[value] : CLASS_LABEL[value]}</RdBadge>;
}

/**
 * The redesign's recordability review (lab-recordability.tsx), for the one event still waiting:
 * the call, the paragraph it comes from, the name the log needs, and nothing on the log until
 * someone confirms it.
 */
function RecordabilityReview() {
  const [open, setOpen] = useState(false);
  const [employee, setEmployee] = useState(EVT_2041_EMPLOYEE);
  const [tried, setTried] = useState(false);
  const ev = getEvent("ev-2041");
  if (!ev) return null;
  const needsName = !employee.trim();

  return (
    <RdCard>
      <div className="flex items-start gap-2.5 border-b border-border p-4">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-badge-accent text-badge-accent-foreground">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Recordability review</p>
          <p className="mt-0.5 text-base font-medium text-foreground">1 recent event still needs an OSHA log decision.</p>
          <p className="mt-1 text-sm text-muted-foreground">Each one is checked against OSHA&apos;s recordkeeping rule from what the report says. Nothing goes on the log until you confirm it.</p>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <Link href={`/events/${ev.id}`} className="block truncate text-sm font-medium text-foreground hover:underline">
              {ev.title}
            </Link>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>{ev.ref}</span>
              <RdBadge tone="error">{REVIEW_2041.verdict}</RdBadge>
              <span>{REVIEW_2041.confidence}% confident</span>
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" className={figmaButton} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            Why
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
          </Button>
        </div>
        {open ? (
          <div className="mt-4 flex flex-col gap-4 rounded-lg bg-muted p-4">
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Reasoning</p>
              <p className="text-sm text-foreground">{REVIEW_2041.reason}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Rule: <span className="font-medium">29 CFR {REVIEW_2041.rule}</span>
              </p>
            </div>
            <label className="flex max-w-md flex-col gap-2 text-sm leading-none font-medium text-foreground">
              Employee name for the log
              <Input value={employee} onChange={(e) => setEmployee(e.target.value)} placeholder="The name of the person who was hurt" aria-invalid={(tried && needsName) || undefined} />
              <span className={cn("text-sm font-normal", tried && needsName ? "text-destructive" : "text-muted-foreground")}>
                {tried && needsName ? "The 300 log needs the employee's name." : "Typed, not picked: the injured person often has no account."}
              </span>
            </label>
            <p className="flex items-start gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-badge-warning-foreground" aria-hidden />A case on the OSHA log is a legal record, so it is only added when you confirm it.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                className={figmaButton}
                onClick={() => {
                  setTried(true);
                  if (!needsName) setReview({ verdict: "recordable", employee: employee.trim() });
                }}
              >
                <Check aria-hidden /> Add to the 300 log
              </Button>
              <Button type="button" variant="outline" size="sm" className={figmaButton} onClick={() => setReview({ verdict: "notRecordable" })}>
                No, keep it off the log
              </Button>
              <Link href={`/events/${ev.id}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                Open the event
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </RdCard>
  );
}

/** Nothing waiting: the review says so in one quiet line, so the person knows it was looked at. */
function AllDecided({ keptOff }: { keptOff: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-[var(--lab-radius)] border border-border bg-surface-subtle px-4 py-4">
      <Check className="size-4 shrink-0 text-badge-accent-foreground" aria-hidden />
      <p className="min-w-0 flex-1 text-sm text-foreground">
        {keptOff ? "EVT-2041 was kept off the log. Every recent event has a recordability decision." : "Every recent event has a recordability decision. Nothing is waiting."}
      </p>
      {keptOff ? (
        <Button type="button" variant="link" className="h-auto p-0" onClick={() => setReview(null)}>
          Undo
        </Button>
      ) : null}
    </div>
  );
}

const FILTERS: { value: CaseClass; label: string }[] = [
  { value: "death", label: "Death" },
  { value: "daysAway", label: "Days away from work" },
  { value: "restricted", label: "Job transfer or restriction" },
  { value: "other", label: "Other recordable case" },
];

/** The OSHA 300 log: the Form 300 columns, the review above it, a filter when a 300A tile opened it. */
export function OshaLog({ caseFilter, onClearFilter, onOpenSummary }: { caseFilter: CaseFilter | null; onClearFilter: () => void; onOpenSummary: () => void }) {
  const router = useRouter();
  const { cases, empty, needsReview, keptOff } = useOshaLog();
  const [year, setYear] = useState("2026");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState("date");

  if (empty) {
    return <RdEmptyState icon={ShieldCheck} title="Nothing recorded" body="Recordable cases show up here once an event is confirmed for the OSHA log." />;
  }

  const words = q.trim().toLowerCase();
  const scoped = caseFilter ? cases.filter((c) => matchesFilter(c, caseFilter)) : cases;
  const rows = scoped
    .filter((c) => !picked.length || picked.includes(c.caseClass))
    .filter((c) => !words || `${c.id} ${c.eventRef} ${c.title} ${c.privacy ? "privacy case" : c.employee} ${c.jobTitle} ${c.where} ${CLASS_LABEL[c.caseClass]}`.toLowerCase().includes(words))
    .sort((a, b) => (sort === "days" ? b.daysAway + b.daysRestricted - (a.daysAway + a.daysRestricted) : b.date.localeCompare(a.date)));

  /* The Form 300 columns: case and what happened (A, F), employee and job title (B, C), date (D),
     where (E), classification (G–J) and days (K, L). */
  const columns: RdColumn<OshaCase>[] = [
    {
      key: "case",
      header: "Case",
      render: (c) => (
        <div className="flex min-w-0 items-center gap-2">
          <TitleCell title={c.title} reference={`${c.id} · ${c.eventRef}`} />
          {c.id === "2026-014" ? (
            <span className="shrink-0">
              <RdBadge tone="accent">New</RdBadge>
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "employee",
      header: "Employee",
      width: "17%",
      render: (c) => (
        <div className="min-w-0">
          <p className="truncate">{c.privacy ? "Privacy case" : c.employee}</p>
          <p className="truncate text-sm text-muted-foreground">{c.jobTitle}</p>
        </div>
      ),
    },
    { key: "date", header: "Incident date", width: "11%", render: (c) => <span className="block truncate">{formatDate(c.date)}</span> },
    { key: "where", header: "Where", width: "12%", render: (c) => <span className="block truncate">{c.where}</span> },
    {
      key: "class",
      header: "Case type",
      width: "14%",
      render: (c) => (
        <span className="block max-w-full truncate" title={CLASS_LABEL[c.caseClass]}>
          <ClassBadge value={c.caseClass} short />
        </span>
      ),
    },
    { key: "away", header: "Days away", width: "8%", render: (c) => <span className="tabular-nums">{c.daysAway}</span> },
    {
      key: "restricted",
      header: "Days restricted",
      width: "9%",
      render: (c) =>
        c.ongoing ? (
          <div title="Still on restricted duty: the count runs until the person is back on full duty (capped at 180)">
            <p className="tabular-nums">{c.daysRestricted}</p>
            <p className="truncate text-xs text-muted-foreground">Ongoing</p>
          </div>
        ) : (
          <span className="tabular-nums">{c.daysRestricted}</span>
        ),
    },
  ];

  const count = (v: string) => scoped.filter((c) => c.caseClass === v).length;

  /* The log's own controls sit at the head of the right-hand toolbar, as in the redesign. */
  const pickers = (
    <div className="flex shrink-0 items-center gap-2">
      <select aria-label="Establishment" title="Establishment" className={cn(fieldClass, "h-8 w-40")} defaultValue="plant">
        <option value="plant">Springfield Plant</option>
      </select>
      <select aria-label="Year" title="Year" className={cn(fieldClass, "h-8 w-24")} value={year} onChange={(e) => setYear(e.target.value)}>
        <option value="2026">2026</option>
        <option value="2025">2025</option>
      </select>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {year === "2025" ? (
        <div className="flex justify-end">{pickers}</div>
      ) : null}
      {year === "2025" ? (
        <RdEmptyState
          icon={ShieldCheck}
          title="The 2025 log is closed"
          body="Its 17 cases are counted in the 2025 summary, certified on Jan 29, 2026. Older logs are not part of this prototype."
          action={
            <Button type="button" variant="outline" size="sm" className={figmaButton} onClick={onOpenSummary}>
              Open the 2025 summary
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
            <RdAsk value={q} onChange={setQ} />
            {pickers}
            <RdToolbar
              filterLabel="Case type"
              filters={FILTERS.filter((f) => count(f.value) > 0).map((f) => ({ ...f, count: count(f.value) }))}
              selected={picked}
              onToggle={(v) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
              sorts={[
                { value: "date", label: "Incident date, newest first" },
                { value: "days", label: "Days lost, most first" },
              ]}
              sort={sort}
              onSort={setSort}
            />
          </div>

          {caseFilter ? (
            <div className="flex flex-wrap items-center gap-2.5 rounded-[var(--lab-radius)] border border-border bg-surface-subtle px-4 py-3">
              <ListFilter className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <p className="min-w-0 flex-1 text-sm text-foreground">
                Showing the {scoped.length} {scoped.length === 1 ? "case" : "cases"} counted as &ldquo;{FILTER_LABEL[caseFilter]}&rdquo; on the 2026 Form 300A.
              </p>
              <Button type="button" variant="link" className="h-auto p-0" onClick={onClearFilter}>
                Show the whole log
              </Button>
            </div>
          ) : needsReview ? (
            <RecordabilityReview />
          ) : (
            <AllDecided keptOff={keptOff} />
          )}

          {rows.length ? (
            <RdTable rows={rows} columns={columns} rowKey={(c) => c.id} onRow={(c) => router.push(`/compliance/osha/${c.id}`)} />
          ) : (
            <RdEmptyState title="Nothing matches" body="Try other words, or clear the filters." />
          )}
          <p className="text-xs text-text-subtle">
            Showing {rows.length} of {cases.length} · Springfield Plant · Form 300, 2026
          </p>
        </>
      )}
    </div>
  );
}
