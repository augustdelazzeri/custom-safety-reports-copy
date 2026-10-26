"use client";

import { RdAsk, RdTable, RdToolbar, type RdColumn } from "@/components/redesign/table";
import { RdBadge, RdEmptyState, RdPage, RdTabs, TitleCell, type BadgeTone } from "@/components/redesign/ui";
import { EventFlowPanel, StepTrack, nextStepLabel } from "@/components/three-cases/event-flow";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { EVENTS, locationName } from "@/lib/three-cases/data";
import type { SafetyEventDemo } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Safety's events mapping: open is accent, in review is warning, closed is neutral; severity runs grey, grey, amber, red. */
const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  open: { label: "Open", tone: "accent" },
  in_review: { label: "In review", tone: "warning" },
  closed: { label: "Closed", tone: "neutral" },
};
const SEVERITY: Record<string, BadgeTone> = { Low: "neutral", Medium: "neutral", High: "warning", Critical: "error" };
const NEXT: Record<string, BadgeTone> = { todo: "accent", ai: "accent", wait: "warning", done: "success" };

/** The events list, as in the redesign: the ask field and toolbar, then the table; Needs action shows the AI's next step on the side. */
export default function EventsPage() {
  const { flows } = useThreeCases();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState("reported");
  const [selected, setSelected] = useState(EVENTS[0].id);
  const needsAction = EVENTS.filter((e) => !flows[e.id]?.decided && flows[e.id]?.status !== "closed");

  const words = q.trim().toLowerCase();
  const rows = EVENTS.filter((e) => !picked.length || picked.includes(flows[e.id]?.status ?? "open"))
    .filter((e) => !words || `${e.ref} ${e.title} ${e.type} ${locationName(e.locationId)}`.toLowerCase().includes(words))
    .sort((a, b) => (sort === "severity" ? ["Critical", "High", "Medium", "Low"].indexOf(a.severity) - ["Critical", "High", "Medium", "Low"].indexOf(b.severity) : 0));

  const columns: RdColumn<SafetyEventDemo>[] = [
    { key: "title", header: "Event", render: (e) => <TitleCell title={e.title} reference={e.ref} /> },
    { key: "type", header: "Type", width: "11%", render: (e) => <span className="truncate">{e.type}</span> },
    {
      key: "status",
      header: "Status",
      width: "11%",
      render: (e) => {
        const s = STATUS[flows[e.id]?.status ?? "open"];
        return <RdBadge tone={s.tone}>{s.label}</RdBadge>;
      },
    },
    { key: "severity", header: "Severity", width: "10%", render: (e) => <RdBadge tone={SEVERITY[e.severity]}>{e.severity}</RdBadge> },
    { key: "location", header: "Location", width: "13%", render: (e) => <span className="block truncate">{locationName(e.locationId)}</span> },
    { key: "reported", header: "Reported", width: "13%", render: (e) => <span className="block truncate text-muted-foreground">{e.reportedAt}</span> },
    {
      key: "next",
      header: "Next step",
      width: "19%",
      render: (e) => {
        const next = nextStepLabel(e, flows[e.id]);
        return (
          <RdBadge tone={NEXT[next.tone]} className="max-w-full">
            <span className="truncate">{next.label}</span>
          </RdBadge>
        );
      },
    },
  ];

  const counts = (s: string) => EVENTS.filter((e) => (flows[e.id]?.status ?? "open") === s).length;

  return (
    <PageShell title="Events" mainClassName="p-0" prototypeBar={<OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />}>
      <RdPage
        title="Events"
        subtitle="Everything reported: incidents, near misses and observations."
        actions={
          <Button className="gap-2" title="Opens the report form (not part of this prototype)">
            <Plus className="size-4" /> Report an event
          </Button>
        }
      >
        <RdTabs
          tabs={[
            {
              key: "all",
              label: "All events",
              count: EVENTS.length,
              render: () => (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-start gap-2">
                    <RdAsk value={q} onChange={setQ} />
                    <RdToolbar
                      filters={Object.entries(STATUS)
                        .filter(([k]) => counts(k) > 0)
                        .map(([k, s]) => ({ value: k, label: s.label, count: counts(k) }))}
                      selected={picked}
                      onToggle={(v) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                      sorts={[
                        { value: "reported", label: "Reported, newest first" },
                        { value: "severity", label: "Severity, highest first" },
                      ]}
                      sort={sort}
                      onSort={setSort}
                    />
                  </div>
                  {rows.length ? <RdTable rows={rows} columns={columns} rowKey={(e) => e.id} onRow={(e) => router.push(`/events/${e.id}`)} /> : <RdEmptyState title="Nothing matches" body="Try other words, or clear the filters." />}
                  <p className="text-xs text-text-subtle">
                    Showing {rows.length} of {EVENTS.length}
                  </p>
                </div>
              ),
            },
            {
              key: "action",
              label: "Needs action",
              count: needsAction.length,
              render: () =>
                needsAction.length ? (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <ul className="self-start overflow-hidden rounded-[var(--lab-radius)] border border-border">
                      {needsAction.map((e) => (
                        <li key={e.id} className="border-b border-border last:border-b-0">
                          <button onClick={() => setSelected(e.id)} className={cn("flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors", selected === e.id ? "bg-muted" : "hover:bg-muted/50")}>
                            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                              <RdBadge tone={SEVERITY[e.severity]}>{e.severity}</RdBadge>
                              {e.type} · {e.reportedAt}
                            </span>
                            <span className="text-sm font-medium text-foreground">{e.title}</span>
                            <StepTrack ev={e} flow={flows[e.id]} size="sm" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="rounded-[var(--lab-radius)] border border-border p-6">
                      <EventFlowPanel eventId={selected} />
                    </div>
                  </div>
                ) : (
                  <RdEmptyState icon={Sparkles} title="Nothing left to decide" body="Every event has its CAPA, its work orders or a reason to close." />
                ),
            },
          ]}
        />
      </RdPage>
    </PageShell>
  );
}
