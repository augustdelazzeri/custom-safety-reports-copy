"use client";

import { RdAsk, RdTable, RdToolbar, type RdColumn } from "@/components/redesign/table";
import { Muted, RdBadge, RdEmptyState, TitleCell, figmaButton } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { AGENCY_REPORTS, useOshaLog, type AgencyReport } from "@/lib/screens/compliance";
import { Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES: AgencyReport["status"][] = ["Not due yet", "Submitted", "Closed by OSHA"];

/**
 * Agency reports, end state: what was sent to a regulator and when, and what is coming due. On
 * top, the 24-hour check for the newest case, so nobody has to wonder whether the Press 4
 * laceration needed a call to OSHA.
 */
export function AgencyReports({ onOpenSummary }: { onOpenSummary: (year: "2026" | "2025") => void }) {
  const router = useRouter();
  const { empty } = useOshaLog();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState("due");

  if (empty) {
    return <RdEmptyState icon={Send} title="No agency reports filed" body="Reports sent to a regulator are listed here with what was sent and when." />;
  }

  const words = q.trim().toLowerCase();
  const rows = AGENCY_REPORTS.filter((r) => !picked.length || picked.includes(r.status)).filter((r) => !words || `${r.id} ${r.title} ${r.type} ${r.agency} ${r.status}`.toLowerCase().includes(words));
  const ordered = sort === "submitted" ? [...rows].sort((a, b) => (a.submitted ? 0 : 1) - (b.submitted ? 0 : 1)) : rows;
  const count = (s: string) => AGENCY_REPORTS.filter((r) => r.status === s).length;

  const columns: RdColumn<AgencyReport>[] = [
    { key: "title", header: "Report", render: (r) => <TitleCell title={r.title} reference={r.caseId ? `${r.id} · Case ${r.caseId}` : r.id} /> },
    {
      key: "type",
      header: "Type",
      width: "15%",
      render: (r) => (
        <span className="block max-w-full truncate">
          <RdBadge>{r.type}</RdBadge>
        </span>
      ),
    },
    { key: "agency", header: "Agency", width: "15%", render: (r) => <span className="block truncate" title={r.agencyFull}>{r.agency}</span> },
    {
      key: "due",
      header: "Due",
      width: "15%",
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate">{r.due}</p>
          <p className="truncate text-sm text-muted-foreground">{r.dueRule}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", width: "13%", render: (r) => <RdBadge>{r.status}</RdBadge> },
    {
      key: "submitted",
      header: "Submitted",
      width: "14%",
      render: (r) =>
        r.submitted ? (
          <div className="min-w-0">
            <p className="truncate">{r.submitted}</p>
            <p className="truncate text-sm text-muted-foreground">{r.by}</p>
          </div>
        ) : (
          <Muted />
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* The 24-hour check (29 CFR 1904.39) for the newest case, said with its reason. */}
      <div role="status" className="flex flex-wrap items-start gap-x-4 gap-y-3 rounded-[var(--lab-radius)] border border-border bg-surface-subtle p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-badge-accent text-badge-accent-foreground">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Severe injury check · EVT-2041</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">No report to OSHA needed for the Press 4 laceration.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            4 stitches at the clinic, treated and released: no in-patient hospitalization, amputation or loss of an eye, so the 24-hour report does not apply. Rule: <span className="font-medium">29 CFR 1904.39(a)(2)</span>. It still goes on the 300 log as case 2026-014.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/events/ev-2041" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Open the event
          </Link>
          <Button type="button" variant="outline" size="sm" className={figmaButton} onClick={() => router.push("/compliance/osha/2026-014")}>
            Open the case
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-2">
        <RdAsk value={q} onChange={setQ} />
        <RdToolbar
          filters={STATUSES.filter((s) => count(s) > 0).map((s) => ({ value: s, label: s, count: count(s) }))}
          selected={picked}
          onToggle={(v) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
          sorts={[
            { value: "due", label: "Due date, latest first" },
            { value: "submitted", label: "Submitted first" },
          ]}
          sort={sort}
          onSort={setSort}
        />
      </div>
      {ordered.length ? <RdTable rows={ordered} columns={columns} rowKey={(r) => r.id} onRow={(r) => (r.caseId ? router.push(`/compliance/osha/${r.caseId}`) : onOpenSummary(r.id === "AR-0001" ? "2025" : "2026"))} /> : <RdEmptyState title="Nothing matches" body="Try other words, or clear the filters." />}
      <p className="text-xs text-text-subtle">
        Showing {ordered.length} of {AGENCY_REPORTS.length} · Severe injuries are reported within 24 hours (8 for a death); the yearly forms by March 2.
      </p>
    </div>
  );
}
