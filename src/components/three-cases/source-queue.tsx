"use client";

/**
 * A1 · the lists that feed the work, drawn as short queues (Thiago's Today rows: a 40px grey circle,
 * the title, one grey line with the badges and the date, the status on the right) instead of tables.
 * One list at a time, switched like the parts of a section; open only by default; the one due first
 * on top. The right side shows the event's flow, or the record on its own.
 */

import { EventFlowPanel } from "@/components/three-cases/event-flow";
import { RdBadge, RdEmptyState, RdSegmented } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { person } from "@/lib/three-cases/data";
import { docByRef, getMvpAsset, MVP_LABEL } from "@/lib/three-cases/mvp-rules";
import { fmtDate } from "@/lib/three-cases/real-jobs";
import { dueLabel, type SourceItem, type SourceKind } from "@/lib/three-cases/sources";
import { cn } from "@/lib/utils";
import { Check, Clipboard, Clock, FileCheck2, FileText, ListChecks, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export const SOURCE_TABS: { key: SourceKind; label: string; title: string; icon: LucideIcon; hint: string }[] = [
  { key: "event", label: "Events", title: "Events", icon: TriangleAlert, hint: "Every report, the one to decide first on top." },
  { key: "capa", label: "CAPAs", title: "Corrective actions", icon: ListChecks, hint: "Every corrective action, the one due first on top." },
  { key: "wo", label: "Work orders", title: "Safety work orders", icon: Clipboard, hint: "The safety work orders, from events and from the asset jobs, the one due first on top." },
  { key: "doc", label: "Documents", title: "Documentation", icon: FileText, hint: "JHA, SOP, LOTO, permits and audits that need a review or an approval, the one due first on top." },
];

function SourceRow({ item, icon: Icon, selected, onSelect }: { item: SourceItem; icon: LucideIcon; selected: boolean; onSelect: () => void }) {
  const late = item.open && item.dueIn !== undefined && item.dueIn < 0 && item.dueWord !== "Done";
  return (
    <li className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
          selected ? "bg-muted" : "hover:bg-muted/50",
          !item.open && "opacity-70",
        )}
      >
        {/* Figma 394:78203: a 40px light-grey circle. */}
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-1 text-sm leading-5 font-medium text-foreground">{item.title}</span>
          {/* One grey line, as on Today: the risk, the reference, one fact, then the date the list is sorted by. */}
          <span className="mt-1 flex items-center gap-2 overflow-hidden text-sm whitespace-nowrap text-muted-foreground">
            {item.risk ? <RdBadge tone={item.risk === "Critical" ? "error" : "warning"}>{item.risk}</RdBadge> : null}
            <span className="shrink-0 font-medium tracking-[0.02em] text-text-subtle tabular-nums">{item.ref}</span>
            <span aria-hidden>·</span>
            <span className={cn("shrink-0", late && "font-medium text-badge-error-foreground")}>{dueLabel(item)}</span>
            {item.meta[0] ? (
              <>
                <span aria-hidden>·</span>
                <span className="min-w-0 truncate">{item.meta[0]}</span>
              </>
            ) : null}
          </span>
        </span>
        <RdBadge tone={item.status.tone} className="shrink-0">
          {item.status.label}
        </RdBadge>
      </button>
    </li>
  );
}

export function SourceQueue({
  kind,
  onKind,
  lists,
  openOnly,
  onOpenOnly,
  selectedId,
  onSelect,
}: {
  kind: SourceKind;
  onKind: (k: SourceKind) => void;
  lists: Record<SourceKind, SourceItem[]>;
  openOnly: boolean;
  onOpenOnly: (v: boolean) => void;
  selectedId?: string;
  onSelect: (item: SourceItem) => void;
}) {
  const tab = SOURCE_TABS.find((t) => t.key === kind)!;
  const all = lists[kind];
  const items = openOnly ? all.filter((i) => i.open) : all;
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <RdSegmented<SourceKind>
        value={kind}
        onChange={onKind}
        options={SOURCE_TABS.map((t) => ({ value: t.key, label: t.label, count: (openOnly ? lists[t.key].filter((i) => i.open) : lists[t.key]).length }))}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Switch checked={openOnly} onCheckedChange={onOpenOnly} aria-label="Open only" />
          Open only
        </label>
        <span className="text-sm text-muted-foreground">Due date, soonest first</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-[var(--lab-radius)] border border-border">
        {items.length ? (
          <ul>
            {items.map((item) => (
              <SourceRow key={item.id} item={item} icon={tab.icon} selected={item.id === selectedId} onSelect={() => onSelect(item)} />
            ))}
          </ul>
        ) : (
          <RdEmptyState title={`No open ${tab.label.toLowerCase()}`} body="Everything here is closed or done. Turn off Open only to see them." />
        )}
      </div>
    </div>
  );
}

// ───────────────────────────── the right side

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

/** A record with no event behind it: what it is, why it is here and what it needs, then the actions (Today's decision panel). */
function RecordDetail({ item, overview, needed, facts, actions }: { item: SourceItem; overview: ReactNode; needed: ReactNode; facts: [string, ReactNode][]; actions: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <p className="mb-2 text-xs font-medium tracking-[0.02em] text-text-subtle tabular-nums">{item.ref}</p>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl leading-6 font-bold text-foreground">{item.title}</h2>
          <RdBadge tone={item.status.tone}>{item.status.label}</RdBadge>
        </div>
      </div>
      <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 text-sm">
        {facts.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-4 rounded-lg bg-muted p-4">
        <Section title="Overview">{overview}</Section>
        <Section title="What's needed">{needed}</Section>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">{actions}</div>
      </div>
    </div>
  );
}

const soon = "Not part of this prototype";

export function SourceDetail({ item }: { item?: SourceItem }) {
  if (!item) return <RdEmptyState title="Pick something on the left" body="Its flow or its details show here." />;

  if (item.eventId) {
    return (
      <div className="flex flex-col">
        {item.kind !== "event" ? (
          <p className="border-b border-border bg-surface-subtle px-6 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{item.ref}</span> is part of this event&apos;s flow: the event, its CAPA and its work orders keep their own status.
          </p>
        ) : null}
        <div className="p-6">
          <EventFlowPanel eventId={item.eventId} />
        </div>
      </div>
    );
  }

  if (item.wo) {
    const w = item.wo;
    const asset = getMvpAsset(w.assetId);
    return (
      <RecordDetail
        item={item}
        facts={[
          ["Asset", asset ? `${asset.name} · ${asset.code}` : "—"],
          ["Assigned to", person(w.assigneeId).name],
          ["Due", fmtDate(w.due)],
          ["Documents", w.docs.length ? w.docs.map((d) => d.ref).join(", ") : "None linked"],
        ]}
        overview={`A safety work order made from Safety work orders (F2) for this job on ${asset?.name ?? "the asset"}.`}
        needed={w.status === "open" ? `${person(w.assigneeId).name.split(" ")[0]} does the work and completes it in Maintenance. Nothing waits on you.` : "Nothing. It is complete."}
        actions={
          <Button size="sm" variant="outline" title={soon}>
            Open {w.ref}
          </Button>
        }
      />
    );
  }

  if (item.docRef) {
    const d = docByRef(item.docRef);
    if (!d) return null;
    const asset = d.assetIds.length ? getMvpAsset(d.assetIds[0]) : undefined;
    const state =
      d.state === "awaiting" ? "It is waiting for approval." : d.state === "draft" ? "It is still a draft." : d.state === "expiring" ? "Its review is due soon." : d.state === "expired" ? "Its review is overdue." : "It is approved and in date.";
    const needed =
      d.state === "awaiting"
        ? "Read it and approve it, or send it back with a comment. Work orders that need it go out with it linked as in approval."
        : d.state === "draft"
          ? "Finish the draft and send it for approval."
          : d.state === "valid"
            ? "Nothing until the next review."
            : "Review it: confirm it still matches the work, or update it and send it for approval.";
    return (
      <RecordDetail
        item={item}
        facts={[
          ["Type", MVP_LABEL[d.type]],
          ["Asset", asset ? `${asset.name} · ${asset.code}` : "Company program"],
          ["Status", item.status.label],
          ["Date", dueLabel(item)],
        ]}
        overview={`${d.ref} goes with the safety work orders of ${asset?.name ?? "every asset"}. ${state}`}
        needed={needed}
        actions={
          <>
            {d.state === "awaiting" ? (
              <Button size="sm" className="gap-2" title={soon}>
                <FileCheck2 className="size-4" /> Review and approve
              </Button>
            ) : d.state !== "valid" ? (
              <Button size="sm" className="gap-2" title={soon}>
                <Check className="size-4" /> Start the review
              </Button>
            ) : null}
            <Button size="sm" variant="outline" className="gap-2" title={soon}>
              <Clock className="size-4" /> Not now
            </Button>
          </>
        }
      />
    );
  }

  // A CAPA with no event of use case 3 behind it.
  return (
    <RecordDetail
      item={item}
      facts={[
        ["Owner", item.meta[1] ?? "—"],
        ["Type", item.meta[0] ?? "Corrective"],
        ["Due", dueLabel(item)],
      ]}
      overview="A corrective action from an earlier event. Its work orders are done in Maintenance; the owner hears about each one."
      needed={item.open ? "Check that the action worked, then close it, or keep it open with a follow-up work order." : "Nothing. It is closed."}
      actions={
        item.open ? (
          <>
            <Button size="sm" title={soon}>
              Plan the work
            </Button>
            <Button size="sm" variant="outline" className="gap-2" title={soon}>
              <Clock className="size-4" /> Not now
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" title={soon}>
            Open {item.ref}
          </Button>
        )
      }
    />
  );
}
