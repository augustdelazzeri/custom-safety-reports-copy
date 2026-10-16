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

const TITLE_PREFIX = /^(Permit to Work|Permit template|New SOP|New LOTO):\s*/;

/** Everything the plans approved on this page created for the asset, newest first. */
export function useCreatedRecords(assetId: string | undefined) {
  const { executions } = useThreeCases();
  const mine = executions.filter((e) => getJob(e.jobId)?.assetId === assetId);

  const docs: CreatedDoc[] = mine.flatMap((e) => {
    const j = getJob(e.jobId);
    return (j?.plan ?? [])
      .filter((p) => p.ref && (p.kind === "ptw" || p.kind === "sop" || p.kind === "loto"))
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
 * The asset's work orders: the ones the AI just created on top, then the CMMS history.
 * Last 30 days by default so the list stays short; older ones are one click away.
 */
export function AssetWorkOrders({ asset, compact = false }: { asset: Asset; compact?: boolean }) {
  const { executions } = useCreatedRecords(asset.id);
  const [range, setRange] = useState<Range>(30);
  const [openRef, setOpenRef] = useState<string | null>(null);

  const history = asset.lastWorkOrders.filter((wo) => range === 0 || daysAgo(wo.date) <= range);
  const hidden = asset.lastWorkOrders.length - history.length;
  const total = executions.length + history.length;

  return (
    <div className="mt-2 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
          <Wrench className="size-3.5 text-gray-500" /> Work orders
          <span className="font-medium text-gray-400">{total}</span>
        </span>
        <div className="flex items-center gap-0.5 rounded-md bg-gray-100 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] font-medium",
                range === r.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("overflow-y-auto", compact ? "max-h-[92px]" : "max-h-[150px]")}>
        {executions.map((e) => {
          const j = getJob(e.jobId);
          const waiting = e.permitStatus === "pending";
          return (
            <Link
              key={e.id}
              href={`/safety-execution/work-orders/${e.id}`}
              className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50/60 px-2.5 py-1.5 text-xs hover:bg-emerald-50"
            >
              <span className="rounded bg-emerald-600 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-white">New</span>
              <span className="w-[58px] shrink-0 font-mono text-[11px] text-gray-500">{e.woRef}</span>
              <span className="min-w-0 flex-1 truncate font-medium text-gray-900">{j?.title}</span>
              {e.recurring ? (
                <span className="flex shrink-0 items-center gap-1 text-[11px] text-amber-800">
                  <Repeat className="size-3" /> {j?.when}
                </span>
              ) : (
                <span className={cn("shrink-0 text-[11px] font-medium", waiting ? "text-amber-700" : "text-emerald-700")}>
                  {waiting ? "Waiting for permit" : "Scheduled"} · {j?.when}
                </span>
              )}
              <Avatar initials={person(e.assigneeId).initials} className="size-5 text-[9px]" />
            </Link>
          );
        })}

        {history.map((wo) => {
          const open = openRef === wo.ref;
          const who = person(wo.assigneeId ?? asset.ownerId);
          return (
            <div key={wo.ref} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => setOpenRef(open ? null : wo.ref)}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-gray-50"
              >
                <span className="w-[58px] shrink-0 font-mono text-[11px] text-gray-500">{wo.ref}</span>
                <span className="min-w-0 flex-1 truncate text-gray-800">{wo.title}</span>
                <span className="shrink-0 text-[11px] text-gray-500">Done · {wo.date}</span>
                <Avatar initials={who.initials} className="size-5 text-[9px]" />
                <ChevronDown className={cn("size-3 shrink-0 text-gray-400 transition", open && "rotate-180")} />
              </button>
              {open ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-gray-50 px-2.5 py-1.5 pl-[76px] text-[11px] text-gray-600">
                  <span>Completed {wo.date} by {who.name}</span>
                  <span>{asset.code} · {asset.name}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-indigo-700">
                    Open in UpKeep CMMS <ExternalLink className="size-3" />
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}

        {total === 0 ? <div className="px-2.5 py-2 text-[11px] text-gray-400">No work orders in this period.</div> : null}
      </div>

      {hidden > 0 ? (
        <button
          onClick={() => setRange(0)}
          className="w-full border-t border-gray-100 px-2.5 py-1 text-left text-[11px] text-gray-500 hover:text-gray-800"
        >
          {hidden} older work order{hidden === 1 ? "" : "s"} hidden · Show all
        </button>
      ) : null}
    </div>
  );
}
