"use client";

import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { daysAgo, job as getJob, person } from "@/lib/three-cases/data";
import type { Asset, DocType } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ExternalLink, Repeat, Wrench } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "./shell";

/** A document an approved plan created for the asset: shown in its grid column right away. */
export interface CreatedDoc {
  type: DocType;
  ref: string;
  title: string;
  status: string;
  href: string;
}

const TITLE_PREFIX = /^(Permit to Work|Permit template|New SOP|New LOTO|New JHA|New inspection):\s*/;
const CREATES_DOC = new Set(["ptw", "sop", "loto", "jha", "audit"]);

/** Everything the plans approved on this page created for the asset, newest first. */
export function useCreatedRecords(assetId: string | undefined) {
  const { executions } = useThreeCases();
  const mine = executions.filter((e) => getJob(e.jobId)?.assetId === assetId);

  const docs: CreatedDoc[] = mine.flatMap((e) => {
    const j = getJob(e.jobId);
    return (j?.plan ?? [])
      .filter((p) => p.ref && CREATES_DOC.has(p.kind))
      .map((p) => ({
        type: p.kind as DocType,
        ref: p.ref as string,
        title: p.title.replace(TITLE_PREFIX, ""),
        status:
          p.kind !== "ptw" || j?.recurring
            ? "Draft, in review"
            : e.permitStatus === "approved"
              ? "Approved"
              : "Waiting for 2 approvals",
        href: `/safety-execution/work-orders/${e.id}`,
      }));
  });

  return { executions: mine, docs };
}

type Range = 30 | 90 | 0;
const RANGES: { value: Range; label: string }[] = [
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 0, label: "All" },
];

/**
 * The asset's work orders as the last column of the document grid: the ones a plan just created
 * on top, then the CMMS history. Last 30 days by default so the column stays short.
 * `refs` shows one line per work order, for when a plan is open below.
 */
export function WorkOrderColumn({ asset, refs = false }: { asset: Asset; refs?: boolean }) {
  const { executions } = useCreatedRecords(asset.id);
  const [range, setRange] = useState<Range>(30);
  const [menu, setMenu] = useState(false);
  const [openRef, setOpenRef] = useState<string | null>(null);

  const history = asset.lastWorkOrders.filter((wo) => range === 0 || daysAgo(wo.date) <= range);
  const hidden = asset.lastWorkOrders.length - history.length;
  const total = executions.length + history.length;

  return (
    <div className="flex min-w-0 flex-col rounded-lg border border-border bg-card">
      <div className="flex min-w-0 items-center gap-1.5 border-b border-border px-2 py-1.5 text-xs font-semibold text-foreground">
        <Wrench className="size-3.5 shrink-0 text-text-placeholder" />
        <span className="truncate">Work orders</span>
        <span className="ml-auto text-xs font-medium text-text-placeholder">{total}</span>
      </div>

      <div className={cn("flex flex-1 flex-col p-1.5", refs ? "gap-1" : "min-h-[72px] gap-1.5")}>
        {executions.map((e) => {
          const j = getJob(e.jobId);
          const waiting = e.permitStatus === "pending";
          const status = e.recurring ? `Repeats · ${j?.when}` : `${waiting ? "Waiting for permit" : "Scheduled"} · ${j?.when}`;
          return refs ? (
            <Link
              key={e.id}
              href={`/safety-execution/work-orders/${e.id}`}
              className="flex items-center justify-between gap-1 rounded border border-emerald-300 bg-badge-success px-1.5 py-0.5 hover:border-emerald-400"
              title={`${e.woRef} · ${j?.title} · ${status}`}
            >
              <span className="truncate font-mono text-xs text-emerald-900">{e.woRef}</span>
              <span className="rounded bg-emerald-600 px-1 text-[9px] font-bold uppercase text-white">New</span>
            </Link>
          ) : (
            <Link
              key={e.id}
              href={`/safety-execution/work-orders/${e.id}`}
              className="rounded-md border border-emerald-300 bg-badge-success px-2 py-1.5 hover:border-emerald-400"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs text-muted-foreground">{e.woRef}</span>
                <span className="rounded bg-emerald-600 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-white">New</span>
              </div>
              <div className="line-clamp-1 text-xs leading-snug text-foreground">{j?.title}</div>
              <div className={cn("mt-0.5 flex items-center gap-1 text-xs font-medium", waiting ? "text-amber-700" : "text-badge-success-foreground")}>
                {e.recurring ? <Repeat className="size-2.5" /> : null}
                <span className="truncate">{status}</span>
              </div>
            </Link>
          );
        })}

        {history.map((wo) => {
          const who = person(wo.assigneeId ?? asset.ownerId);
          const open = openRef === wo.ref;
          return (
            <div key={wo.ref} className="relative">
              <button
                onClick={() => setOpenRef(open ? null : wo.ref)}
                title={`${wo.ref} · ${wo.title}`}
                className={cn(
                  "w-full rounded-md border text-left hover:border-border",
                  open ? "border-primary/40 bg-badge-accent" : "border-border bg-surface-subtle",
                  refs ? "flex items-center justify-between gap-1 px-1.5 py-0.5" : "px-2 py-1.5",
                )}
              >
                {refs ? (
                  <>
                    <span className="truncate font-mono text-xs text-muted-foreground">{wo.ref}</span>
                    <span className="shrink-0 text-xs text-text-placeholder">{wo.date}</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs text-muted-foreground">{wo.ref}</span>
                      <span className="text-xs text-text-placeholder">{wo.date}</span>
                    </div>
                    <div className="line-clamp-2 text-xs leading-snug text-foreground">{wo.title}</div>
                  </>
                )}
              </button>
              {open ? (
                <>
                  <button className="fixed inset-0 z-20 cursor-default" aria-label="Close" onClick={() => setOpenRef(null)} />
                  <div className="absolute right-0 top-full z-30 mt-1 w-64 rounded-lg border border-border bg-card p-3 text-xs shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">{wo.ref}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">Complete</span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">{wo.title}</div>
                    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                      <Avatar initials={who.initials} className="size-5 text-[9px]" />
                      Completed {wo.date} by {who.name}
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      {asset.code} · {asset.name}
                    </div>
                    <span className="mt-2 inline-flex items-center gap-1 font-medium text-badge-accent-foreground">
                      Open in UpKeep CMMS <ExternalLink className="size-3" />
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          );
        })}

        {total === 0 ? <span className="m-auto text-xs text-text-placeholder">None in this period</span> : null}
        <div className="relative mt-auto flex items-center justify-between gap-1 whitespace-nowrap px-0.5 text-xs text-muted-foreground">
          <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-0.5 rounded hover:text-foreground" aria-label="Period">
            {range === 0 ? "All time" : `${range} days`}
            <ChevronDown className="size-3" />
          </button>
          {hidden > 0 ? (
            <button onClick={() => setRange(0)} className="hover:text-foreground">
              +{hidden} older
            </button>
          ) : null}
          {menu ? (
            <>
              <button className="fixed inset-0 z-20 cursor-default" aria-label="Close" onClick={() => setMenu(false)} />
              <div className="absolute bottom-full left-0 z-30 mb-1 w-28 rounded-md border border-border bg-card py-1 text-xs shadow-lg">
                {RANGES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => {
                      setRange(r.value);
                      setMenu(false);
                    }}
                    className={cn("block w-full px-2.5 py-1 text-left hover:bg-surface-subtle", r.value === range && "font-semibold text-badge-accent-foreground")}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
