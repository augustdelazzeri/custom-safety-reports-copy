"use client";

import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { DOC_COLUMNS, isLinked } from "@/lib/three-cases/data";
import type { Asset, DocType } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { Check, Clipboard, ClipboardList, FileCheck, FlaskConical, HardHat, Link2, Lock, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import type { CreatedDoc } from "./asset-records";
import { WorkOrderColumn } from "./asset-records";

export const DOC_ICON: Record<DocType, React.ComponentType<{ className?: string }>> = {
  jha: HardHat,
  sop: ClipboardList,
  loto: Lock,
  ptw: FileCheck,
  audit: Clipboard,
  sds: FlaskConical,
};

/**
 * Fixed grid of the asset's documents, always in the sidebar order.
 * Empty cells stay visible so the gap is obvious. Documents the AI found by title but nobody
 * linked yet show dashed, with the reason and a one-click link.
 *
 * `variant="refs"` keeps the same columns but shows one line per document, for when a plan is
 * open below and the grid only needs to say what exists and what the plan uses.
 * `workOrders` adds the asset's work orders as the last column.
 */
export function DocGrid({
  asset,
  highlight = [],
  compact = false,
  created = [],
  variant = "full",
  workOrders = false,
}: {
  asset: Asset;
  highlight?: string[];
  compact?: boolean;
  /** Documents a plan approved on this page just created: shown on top of their column. */
  created?: CreatedDoc[];
  variant?: "full" | "refs";
  workOrders?: boolean;
}) {
  const { linkedDocIds, linkDocs } = useThreeCases();
  const refs = variant === "refs";

  return (
    <div
      className={cn(
        "grid gap-2",
        workOrders ? "grid-cols-[repeat(6,minmax(0,1fr))_minmax(0,1.35fr)]" : "grid-cols-6",
      )}
    >
      {DOC_COLUMNS.map((col) => {
        const docs = asset.docs.filter((d) => d.type === col.type);
        const fresh = created.filter((c) => c.type === col.type);
        const count = docs.length + fresh.length;
        const Icon = DOC_ICON[col.type];
        const executable = col.role === "executed" || col.role === "authorizes";
        return (
          <div
            key={col.type}
            className={cn(
              "flex min-w-0 flex-col rounded-lg border bg-white",
              count === 0 ? "border-dashed border-gray-300 bg-gray-50/60" : "border-gray-200",
            )}
          >
            <div
              className="flex min-w-0 items-center gap-1.5 border-b border-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800"
              title={`${col.label} · ${col.roleLabel}`}
            >
              <Icon className={cn("size-3.5 shrink-0", executable ? "text-emerald-600" : "text-gray-400")} />
              <span className="truncate">{col.short}</span>
              {count > 0 ? <span className="ml-auto text-[10px] font-medium text-gray-400">{count}</span> : null}
            </div>
            <div className={cn("flex flex-1 flex-col p-1.5", refs ? "gap-1" : "min-h-[72px] gap-1.5", compact && !refs && "min-h-[56px]")}>
              {fresh.map((c) =>
                refs ? (
                  <Link
                    key={c.ref}
                    href={c.href}
                    className="flex items-center justify-between gap-1 rounded border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 hover:border-emerald-400"
                    title={`New · ${c.ref} · ${c.title} · ${c.status}`}
                  >
                    <span className="truncate font-mono text-[11px] text-emerald-900">{c.ref}</span>
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-600" />
                  </Link>
                ) : (
                  <Link
                    key={c.ref}
                    href={c.href}
                    className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1.5 transition-colors hover:border-emerald-400"
                    title={`${c.ref} · ${c.title}\nCreated from this page. Open the work order to see it.`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] text-gray-500">{c.ref}</span>
                      <span className="rounded bg-emerald-600 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-white">New</span>
                    </div>
                    <div className="line-clamp-2 text-[11px] leading-snug text-gray-800">{c.title}</div>
                    <div className={cn("mt-0.5 text-[10px] font-medium", c.status === "Approved" ? "text-emerald-700" : "text-amber-700")}>
                      {c.status}
                    </div>
                  </Link>
                ),
              )}
              {count === 0 ? (
                <span className={cn("flex items-center gap-1 text-[11px] text-gray-400", refs ? "px-1.5 py-0.5" : "m-auto")}>
                  <Plus className="size-3" /> None
                </span>
              ) : (
                docs.map((d) => {
                  const linked = isLinked(d, linkedDocIds);
                  const justLinked = Boolean(d.match) && linked;
                  const used = highlight.includes(d.id);
                  const tip = [
                    `${d.ref} · ${d.title}`,
                    d.covers ? `Covers ${d.covers} assets` : "",
                    d.match ? `Found by AI: ${d.match.reason}` : "",
                  ]
                    .filter(Boolean)
                    .join("\n");
                  if (refs) {
                    return (
                      <div
                        key={d.id}
                        title={tip}
                        className={cn(
                          "flex items-center justify-between gap-0.5 rounded border px-1 py-0.5",
                          !linked
                            ? "border-dashed border-sky-400 bg-sky-50/60"
                            : used
                              ? "border-indigo-300 bg-indigo-50"
                              : "border-transparent bg-gray-50",
                        )}
                      >
                        <span className={cn("truncate font-mono text-[11px]", used ? "text-indigo-900" : "text-gray-600")}>
                          {d.ref}
                        </span>
                        {!linked ? (
                          <button
                            onClick={() => linkDocs([d.id])}
                            className="shrink-0 rounded bg-sky-600 p-0.5 text-white hover:bg-sky-700"
                            aria-label={`Link ${d.ref}`}
                          >
                            <Link2 className="size-2.5" />
                          </button>
                        ) : null}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={d.id}
                      className={cn(
                        "rounded-md border px-2 py-1.5 transition-colors",
                        !linked ? "border-dashed border-sky-400 bg-sky-50/50" : used ? "border-indigo-300 bg-indigo-50" : "border-gray-100 bg-gray-50",
                      )}
                      title={tip}
                    >
                      <div className="font-mono text-[10px] text-gray-500">{d.ref}</div>
                      <div className="line-clamp-2 text-[11px] leading-snug text-gray-800">{d.title}</div>
                      {d.status !== "approved" ? <div className="mt-0.5 text-[10px] font-medium text-amber-700">In review</div> : null}
                      {!linked ? (
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-1">
                          <span className="flex items-center gap-0.5 whitespace-nowrap text-[10px] font-medium text-sky-700">
                            <Sparkles className="size-2.5" /> AI found
                          </span>
                          <button
                            onClick={() => linkDocs([d.id])}
                            className="inline-flex items-center gap-0.5 rounded bg-sky-600 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-sky-700"
                          >
                            <Link2 className="size-2.5" /> Link
                          </button>
                        </div>
                      ) : null}
                      {justLinked ? (
                        <div className="mt-0.5 flex items-center gap-0.5 text-[10px] font-medium text-emerald-700">
                          <Check className="size-2.5" /> Linked
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
      {workOrders ? <WorkOrderColumn asset={asset} refs={refs} /> : null}
    </div>
  );
}

/** One line above the grid when the AI found documents for this asset that nobody linked. */
export function UnlinkedBanner({ asset }: { asset: Asset }) {
  const { linkedDocIds, linkDocs } = useThreeCases();
  const pending = asset.docs.filter((d) => !isLinked(d, linkedDocIds));
  if (pending.length === 0) return null;
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs text-sky-900">
      <Sparkles className="size-3.5 text-sky-600" />
      <span>
        {pending.length === 1 ? "1 document names" : `${pending.length} documents name`} {asset.name} but {pending.length === 1 ? "isn't" : "aren't"} linked to
        it: {pending.map((d) => d.ref).join(", ")}
      </span>
      <button
        onClick={() => linkDocs(pending.map((d) => d.id))}
        className="ml-auto inline-flex items-center gap-1 rounded-md bg-sky-600 px-2 py-1 font-semibold text-white hover:bg-sky-700"
      >
        <Link2 className="size-3" /> Link {pending.length === 1 ? "it" : "all"}
      </button>
    </div>
  );
}

/** Inline version of the banner for the asset's header line: same action, no extra row. */
export function UnlinkedPill({ asset }: { asset: Asset }) {
  const { linkedDocIds, linkDocs } = useThreeCases();
  const pending = asset.docs.filter((d) => !isLinked(d, linkedDocIds));
  if (pending.length === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 py-0.5 pl-2 pr-0.5 text-[11px] text-sky-900"
      title={pending.map((d) => `${d.ref}: ${d.match?.reason ?? ""}`).join("\n")}
    >
      <Sparkles className="size-3 text-sky-600" />
      AI found {pending.map((d) => d.ref).join(", ")} by title, not linked
      <button
        onClick={() => linkDocs(pending.map((d) => d.id))}
        className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-2 py-0.5 font-semibold text-white hover:bg-sky-700"
      >
        <Link2 className="size-3" /> Link
      </button>
    </span>
  );
}
