"use client";

import { DOC_COLUMNS } from "@/lib/three-cases/data";
import type { Asset, DocType } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { Clipboard, ClipboardList, FileCheck, FlaskConical, HardHat, Lock, Plus } from "lucide-react";

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
 * Empty cells stay visible so the gap is obvious.
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
                docs.map((d) => (
                  <div
                    key={d.id}
                    className={cn(
                      "rounded-md border px-2 py-1.5 transition-colors",
                      highlight.includes(d.id) ? "border-indigo-300 bg-indigo-50" : "border-gray-100 bg-gray-50",
                    )}
                    title={`${d.ref} · ${d.title}`}
                  >
                    <div className="font-mono text-[10px] text-gray-500">{d.ref}</div>
                    <div className="line-clamp-2 text-[11px] leading-snug text-gray-800">{d.title}</div>
                    {d.status !== "approved" ? (
                      <div className="mt-0.5 text-[10px] font-medium text-amber-700">In review</div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
