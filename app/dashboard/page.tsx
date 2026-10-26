"use client";

/**
 * Dashboard, as in Thiago's redesign (safety-redesign src/lab/pages/lab-dashboard.tsx): three tabs.
 * Overview reads the numbers first ("What the numbers say"), then five "right now" tiles, then one
 * period of charts. Incident costs is staged, as in the redesign. Documents counts the library by
 * kind and status.
 *
 * The numbers are the demo's records (EVENTS with their flows, A1's CAPAs and work orders, the
 * documents of use case 2) inside a scaled-up history of the plant (src/lib/screens/dashboard.ts),
 * so running a flow or closing an event moves them.
 */

import { RdBadge, RdCard, RdEmptyState, RdPage, RdTabs, useTabParam } from "@/components/redesign/ui";
import { DashBrief, type BriefLine } from "@/components/screens/dashboard/brief";
import { DashBars, DashTrend, valueText, type BarDatum, type Tone } from "@/components/screens/dashboard/charts";
import { DataModeSwitch } from "@/components/three-cases/data-mode-switch";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import {
  COSTS,
  PERIODS,
  allEvents,
  capaStats,
  daysSinceLastEvent,
  docStats,
  eventStats,
  eventTrend,
  isThisYear,
  periodInfo,
  periodRange,
  woStats,
  type Period,
  type Slice,
} from "@/lib/screens/dashboard";
import { EVENTS } from "@/lib/three-cases/data";
import { useDataMode } from "@/lib/three-cases/demo-data";
import { DOCS, useMvpStore } from "@/lib/three-cases/mvp-rules";
import { buildSources } from "@/lib/three-cases/sources";
import { cn } from "@/lib/utils";
import { ChartNoAxesColumn, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

/** Each number opens the list it counts. */
const HREF = {
  events: "/events",
  overdueActions: "/actions?q=overdue",
  workOrders: "/work-orders",
  approvals: "/documentation",
  oshaLog: "/compliance?tab=osha",
};

const SEVERITY_TONE: Record<string, Tone> = { Low: "neutral", Medium: "warning", High: "serious", Critical: "critical" };
const bars = (slices: Slice[], tone?: (s: Slice) => Tone | undefined): BarDatum[] => slices.map((s) => ({ key: s.key, label: s.label, value: s.value, tone: tone?.(s) }));
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
const WORDS = ["no", "one", "two", "three", "four", "five"];

function KpiTile({ label, value, href, danger }: { label: string; value: number | string; href: string; danger?: boolean }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-[var(--lab-radius)] border border-border bg-card p-4 transition-colors outline-none hover:bg-surface-subtle focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-2xl leading-none font-semibold tabular-nums", danger && Number(value) > 0 ? "text-badge-error-foreground" : "text-foreground")}>{value}</span>
      <span className="text-xs text-muted-foreground">Right now</span>
    </Link>
  );
}

// ───────────────────────────── Overview

function Overview({ noDocs }: { noDocs: boolean }) {
  const { flows } = useThreeCases();
  const mvp = useMvpStore(noDocs);
  const [periodKey, setPeriod] = useTabParam(
    PERIODS.map((p) => p.value),
    "period",
    "quarter",
  );
  const period = periodKey as Period;
  const info = periodInfo(period);

  const events = useMemo(() => allEvents(flows), [flows]);
  const sources = useMemo(() => buildSources(flows, mvp.wos), [flows, mvp.wos]);
  const docs = noDocs ? [] : DOCS;

  const range = periodRange(period);
  const stats = eventStats(events, range);
  const before = eventStats(events, range.previous).total;
  const sameStretch = range.to.getTime() !== range.full.to.getTime();
  const previousName = sameStretch ? `the same days ${info.previous}` : info.previous;
  const trend = eventTrend(events, period);

  const capas = capaStats(sources.capa, (item) => EVENTS.find((e) => e.id === item.eventId)?.capaDefaults?.priority);
  const wos = woStats(sources.wo);

  const openEvents = events.filter((e) => e.status === "open").length;
  const overdue = capas.overdue.length;
  const late = wos.late.length;
  const recordable = events.filter((e) => e.recordable && isThisYear(e.date)).length;
  const pending = docs.filter((d) => d.state === "awaiting").length;
  const daysSince = daysSinceLastEvent(events);

  // ── the reading, from the same numbers the tiles and charts draw
  const topType = stats.byType[0];
  const topLocation = stats.byLocation[0];
  const movement = before === 0 ? null : Math.round(((stats.total - before) / before) * 100);
  const lines: BriefLine[] = [];
  if (overdue > 0) lines.push({ key: "overdue", tone: "danger", href: HREF.overdueActions, text: `${overdue} corrective ${plural(overdue, "action is", "actions are")} past ${plural(overdue, "its", "their")} due date (${capas.overdue.map((c) => c.ref).join(", ")})` });
  if (late > 0) lines.push({ key: "late", tone: "danger", href: HREF.workOrders, text: `${late} safety work ${plural(late, "order is", "orders are")} late (${wos.late.map((w) => w.ref).join(", ")})` });
  if (pending > 0) lines.push({ key: "pending", tone: "danger", href: HREF.approvals, text: `${pending} ${plural(pending, "document is", "documents are")} waiting on an approval that has not happened` });
  if (recordable > 0) lines.push({ key: "osha", href: HREF.oshaLog, text: `${recordable} recordable ${plural(recordable, "case", "cases")} on this year's OSHA log` });
  if (movement !== null && Math.abs(movement) >= 10) lines.push({ key: "trend", href: HREF.events, text: `Reporting is ${movement > 0 ? "up" : "down"} ${Math.abs(movement)}% on ${previousName}` });
  if (topType && stats.total > 0) lines.push({ key: "type", href: HREF.events, text: `The most reported type is ${topType.label.toLowerCase()}: ${topType.value} of ${stats.total}` });
  if (topLocation) lines.push({ key: "location", href: HREF.events, text: `${topLocation.label} accounts for the most events (${topLocation.value})` });

  const slipping = lines.filter((l) => l.tone === "danger").length;
  const headline =
    slipping > 0
      ? `${openEvents} open ${plural(openEvents, "event", "events")}, and ${WORDS[slipping] ?? slipping} ${plural(slipping, "thing is", "things are")} slipping.`
      : openEvents > 0
        ? `${openEvents} open ${plural(openEvents, "event", "events")}, and nothing is overdue.`
        : "Nothing is overdue and nothing is waiting on you.";
  const recommendation =
    overdue > 0
      ? { text: `clear the ${overdue} overdue ${plural(overdue, "action", "actions")}: ${plural(overdue, "it is the only commitment", "they are the only commitments")} with a date already behind ${plural(overdue, "it", "them")}.`, href: HREF.overdueActions, cta: "Open actions" }
      : late > 0
        ? { text: `chase the ${late} late work ${plural(late, "order", "orders")}: the corrective action behind ${plural(late, "it", "them")} cannot close until ${plural(late, "it is", "they are")} done.`, href: HREF.workOrders, cta: "Open work orders" }
        : pending > 0
          ? { text: `work the ${pending} approvals; nothing downstream can start until they are made.`, href: HREF.approvals, cta: "Open documents" }
          : topLocation
            ? { text: `look at ${topLocation.label}: the concentration there is the pattern worth a visit.`, href: HREF.events, cta: "Open events" }
            : undefined;

  const diff = stats.total - before;
  const summary = `${stats.total} ${plural(stats.total, "event", "events")} reported ${info.label.toLowerCase()}: ${
    before === 0 ? `no events in ${previousName} to compare with.` : diff === 0 ? `the same as ${previousName}.` : `${Math.abs(diff)} ${diff > 0 ? "more" : "fewer"} than ${previousName}.`
  }`;

  return (
    <div className="flex flex-col gap-6">
      <DashBrief headline={headline} lines={lines} recommendation={recommendation} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiTile label="Open events" value={openEvents} href={HREF.events} />
        <KpiTile label="Overdue actions" value={overdue} href={HREF.overdueActions} danger />
        <KpiTile label="OSHA recordable" value={recordable} href={HREF.oshaLog} />
        <KpiTile label="Waiting on approval" value={pending} href={HREF.approvals} />
        {/* The one tile that is a reassurance rather than a task. */}
        <KpiTile label="Days since last event" value={daysSince ?? "—"} href={HREF.events} />
      </div>

      {/* Everything below reads one period; the tiles above are right now. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Period</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger size="sm" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </div>

      <RdCard plain title={`Events over time · ${info.label}, by ${info.grain}`}>
        <DashTrend points={trend} />
      </RdCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <RdCard plain title="Events by type">
          <DashBars data={bars(stats.byType)} />
        </RdCard>
        <RdCard plain title="Events by severity">
          <DashBars data={bars(stats.bySeverity, (s) => SEVERITY_TONE[s.key])} />
        </RdCard>
        <RdCard plain title="Event status">
          <DashBars data={bars(stats.byStatus)} />
        </RdCard>
        <RdCard plain title="Action status · This year">
          <DashBars data={bars(capas.byStatus)} unit="actions" />
        </RdCard>
        <RdCard plain title="Actions by priority · This year">
          <DashBars data={bars(capas.byPriority)} unit="actions" />
        </RdCard>
        <RdCard plain title="Safety work orders · This year">
          <DashBars data={bars(wos.byStatus)} unit="work orders" />
        </RdCard>
        <RdCard plain title="Events by location" className="lg:col-span-2">
          {stats.byLocation.length > 0 ? (
            <DashBars data={bars(stats.byLocation)} />
          ) : (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">{stats.total > 0 ? "None of this period’s events has a location set." : "—"}</p>
          )}
          {stats.byLocation.length > 0 && stats.unlocated > 0 ? (
            <p className="px-4 pb-4 text-sm text-muted-foreground">
              {stats.unlocated} {plural(stats.unlocated, "event in this period has", "events in this period have")} no location.
            </p>
          ) : null}
        </RdCard>
      </div>
    </div>
  );
}

// ───────────────────────────── Incident costs (staged)

function Stat({ label, value, note, large = true }: { label: string; value: string; note: string; large?: boolean }) {
  return (
    <div className="rounded-[var(--lab-radius)] border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-semibold text-foreground", large ? "text-2xl leading-none tabular-nums" : "text-xl leading-tight")}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function Costs() {
  const costliest = COSTS.byLocation[0];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 rounded-[var(--lab-radius)] border border-dashed border-border p-4">
        <RdBadge>Example</RdBadge>
        <p className="text-sm text-muted-foreground">
          The cost figures below are staged. The aggregation endpoints are not built, and inventing silent numbers on a money screen would be the one genuinely misleading thing to do.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total incident cost" value={valueText(COSTS.total, "currency")} note={`▲ ${COSTS.vsQuarterPct}% vs. last quarter`} />
        <Stat label="Average cost per incident" value={valueText(Math.round(COSTS.total / COSTS.reports / 100) * 100, "currency")} note={`across ${COSTS.reports} reports`} />
        <Stat label="Costliest location" value={costliest.label} note={valueText(costliest.value, "currency")} large={false} />
      </div>

      <RdCard plain title="Total incident cost over time">
        <DashTrend points={COSTS.months} unit="currency" />
      </RdCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <RdCard plain title="Cost by event type">
          <DashBars data={COSTS.byType} unit="currency" />
        </RdCard>
        <RdCard plain title="Cost by location">
          <DashBars data={COSTS.byLocation} unit="currency" />
        </RdCard>
      </div>

      <p className="text-sm text-muted-foreground">Cost is visible to Safety Managers and Admins only, and the Total Cost column stays hidden on the events list until it is switched on.</p>
    </div>
  );
}

// ───────────────────────────── Documents

function Documents({ noDocs }: { noDocs: boolean }) {
  const router = useRouter();
  if (noDocs) {
    return (
      <RdEmptyState
        icon={FileText}
        title="No documents yet"
        body="Job hazard analyses, procedures, lockout/tagout, permits and audits are counted here by status once they are written or uploaded."
        action={
          <Button asChild variant="outline">
            <Link href="/documentation">Open documentation</Link>
          </Button>
        }
      />
    );
  }
  const rows = docStats(DOCS);
  const open = (key: string) => router.push(`/documentation?tab=${key}`);
  const head = "h-11 border-b border-border px-4 align-middle text-xs font-medium text-muted-foreground";
  const cell = "h-13 border-b border-border px-4 align-middle tabular-nums group-last:border-b-0";
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="bg-surface-subtle">
            <th scope="col" className={cn(head, "text-left")}>
              Document type
            </th>
            {["Draft", "In review", "Approved", "Total"].map((h) => (
              <th key={h} scope="col" className={cn(head, "w-[14%] text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              tabIndex={0}
              onClick={() => open(row.key)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  open(row.key);
                }
              }}
              className="group cursor-pointer transition-colors outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <td className={cn(cell, "font-medium text-foreground")}>{row.label}</td>
              <td className={cn(cell, "text-right text-foreground")}>{row.draft}</td>
              {/* Documents sitting in review are the queue's raw material: the thing that stalls while nobody sees it. */}
              <td className={cn(cell, "text-right", row.review > 0 ? "font-medium text-badge-warning-foreground" : "text-foreground")}>{row.review}</td>
              <td className={cn(cell, "text-right text-foreground")}>{row.approved}</td>
              <td className={cn(cell, "text-right font-medium text-foreground")}>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ───────────────────────────── page

export default function DashboardPage() {
  const [mode] = useDataMode();
  const brandNew = mode === "new";
  const noDocs = mode !== "sample";

  return (
    <PageShell
      title="Dashboard"
      mainClassName="p-0"
      prototypeBar={
        <div className="flex flex-wrap items-center gap-2">
          <DataModeSwitch />
          <p className="px-1 text-xs text-muted-foreground">
            Thiago&apos;s Dashboard. The demo&apos;s events, CAPAs, work orders and documents sit inside a scaled-up history of the plant, so running a flow moves these numbers. Today is Oct 16, as in use case 3.
          </p>
        </div>
      }
    >
      <RdPage title="Dashboard" subtitle="The numbers behind the queue. Every one of them opens the list it counts.">
        <RdTabs
          key={mode}
          tabs={[
            {
              key: "overview",
              label: "Overview",
              render: () =>
                brandNew ? (
                  <RdEmptyState
                    icon={ChartNoAxesColumn}
                    title="Nothing counted yet"
                    body="The dashboard fills in as events are reported, corrective actions raised and documents approved. Every number will open the list it counts."
                    action={
                      <Button asChild variant="outline">
                        <Link href="/events">Open events</Link>
                      </Button>
                    }
                  />
                ) : (
                  <Overview noDocs={noDocs} />
                ),
            },
            { key: "costs", label: "Incident costs", render: () => <Costs /> },
            { key: "documents", label: "Documents", render: () => <Documents noDocs={noDocs} /> },
          ]}
        />
      </RdPage>
    </PageShell>
  );
}
