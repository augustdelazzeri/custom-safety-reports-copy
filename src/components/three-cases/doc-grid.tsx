"use client";

import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { DOC_COLUMNS, isLinked } from "@/lib/three-cases/data";
import type { Asset, DocType } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { Check, Clipboard, ClipboardList, FileCheck, FlaskConical, HardHat, Link2, Lock, Plus, Sparkles } from "lucide-react";

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
 */
export function DocGrid({
  asset,
  highlight = [],
  compact = false,
}: {
  asset: Asset;
  highlight?: string[];
  compact?: boolean;
}) {
  const { linkedDocIds, linkDocs } = useThreeCases();

  return (
    <div className="grid grid-cols-6 gap-2">
      {DOC_COLUMNS.map((col) => {
        const docs = asset.docs.filter((d) => d.type === col.type);
        const Icon = DOC_ICON[col.type];
        return (
          <div
            key={col.type}
            className={cn(
              "flex min-w-0 flex-col rounded-lg border bg-white",
              docs.length === 0 ? "border-dashed border-gray-300 bg-gray-50/60" : "border-gray-200",
            )}
          >
            <div className="border-b border-gray-100 px-2.5 py-1.5">
              <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-gray-800">
                <Icon className="size-3.5 shrink-0 text-gray-500" />
                <span className="truncate">{col.short}</span>
                {docs.length > 0 ? <span className="ml-auto text-[10px] font-medium text-gray-400">{docs.length}</span> : null}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  col.role === "executed" || col.role === "authorizes" ? "text-emerald-700" : "text-gray-400",
                )}
                title={col.role === "executed" || col.role === "authorizes" ? "Can be executed" : "Read or reference"}
              >
                {col.roleLabel}
              </span>
            </div>
            <div className={cn("flex flex-1 flex-col gap-1.5 p-2", compact ? "min-h-[56px]" : "min-h-[84px]")}>
              {docs.length === 0 ? (
                <span className="m-auto flex items-center gap-1 text-[11px] text-gray-400">
                  <Plus className="size-3" /> None
                </span>
              ) : (
                docs.map((d) => {
                  const linked = isLinked(d, linkedDocIds);
                  const justLinked = Boolean(d.match) && linked;
                  return (
                    <div
                      key={d.id}
                      className={cn(
                        "rounded-md border px-2 py-1.5 transition-colors",
                        !linked
                          ? "border-dashed border-sky-400 bg-sky-50/50"
                          : highlight.includes(d.id)
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-gray-100 bg-gray-50",
                      )}
                      title={d.match ? `${d.ref} · ${d.title}\nFound by AI: ${d.match.reason}` : `${d.ref} · ${d.title}`}
                    >
                      <div className="font-mono text-[10px] text-gray-500">{d.ref}</div>
                      <div className="line-clamp-2 text-[11px] leading-snug text-gray-800">{d.title}</div>
                      {d.status !== "approved" ? <div className="mt-0.5 text-[10px] font-medium text-amber-700">In review</div> : null}
                      {d.covers ? <div className="mt-0.5 text-[10px] text-gray-500">Covers {d.covers} assets</div> : null}
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
