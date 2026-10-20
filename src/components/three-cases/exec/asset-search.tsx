"use client";

import { asset as getAsset } from "@/lib/three-cases/data";
import { SUGGESTED_ASSETS, assetSummary, searchAssets, type AssetSummary } from "@/lib/three-cases/tasks";
import type { Asset } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { Clock, Search, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dot, useReadiness } from "./status";

const RECENT_KEY = "ehs-exec-recent-assets";

/** Assets picked lately in this browser, newest first. */
export function useRecentAssets() {
  const [ids, setIds] = useState<string[]>(["hp04", "cv12"]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      // Blocked storage: keep the seed.
    }
  }, []);
  const push = useCallback((id: string) => {
    setIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 4);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // Ignore: recents are a convenience.
      }
      return next;
    });
  }, []);
  return { recent: ids.map((id) => getAsset(id)).filter((a): a is Asset => Boolean(a)), push };
}

/** One asset as a search result: readiness dot, code, name, location, and how many tasks are ready. */
export function AssetOption({
  summary,
  active,
  onPick,
  showHint = false,
  className,
}: {
  summary: AssetSummary;
  active?: boolean;
  onPick: (id: string) => void;
  showHint?: boolean;
  className?: string;
}) {
  const a = summary.asset;
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onPick(a.id)}
      className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left", active ? "bg-indigo-50" : "hover:bg-gray-50", className)}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-1.5">
          <span className="font-mono text-[11px] text-gray-400">{a.code}</span>
          <span className="truncate text-sm font-medium text-gray-900">{a.name}</span>
        </span>
        <span className={cn("block truncate text-xs", showHint && a.aiHint ? "text-indigo-700" : "text-gray-500")}>
          {/* Location, not category: most real assets have no category, and the same name repeats across locations. */}
          {showHint && a.aiHint ? a.aiHint : summary.location}
        </span>
      </span>
      <TaskDots summary={summary} />
    </button>
  );
}

/** One dot per suggested task, so a forklift with 3 ready jobs and 1 gap does not look all red. */
export function TaskDots({ summary, className }: { summary: AssetSummary; className?: string }) {
  if (summary.tasks.length === 0) return <span className={cn("shrink-0 text-[11px] text-gray-400", className)}>no suggestions</span>;
  return (
    <span
      className={cn("flex shrink-0 items-center gap-1", className)}
      title={summary.tasks.map((t) => `${t.job.verb}: ${t.headline}`).join("\n")}
    >
      {summary.tasks.map((t) => (
        <Dot key={t.job.id} level={t.level} title={`${t.job.verb}: ${t.headline}`} />
      ))}
      <span className="ml-1 text-[11px] text-gray-400">
        {summary.ready}/{summary.tasks.length} ready
      </span>
    </span>
  );
}

/**
 * Typeahead for assets. Real accounts have 650 to 5,900 assets in shallow location trees (one
 * location can hold 500), so search by name, code or location comes first, with the AI's picks
 * for today and the recent ones before anything is typed.
 */
export function AssetSearch({
  onPick,
  autoFocus,
  placeholder = "Search an asset by name, code or location",
  mode = "dropdown",
  className,
  size = "md",
}: {
  onPick: (id: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  /** dropdown: list under the field while focused; inline: list always visible. */
  mode?: "dropdown" | "inline";
  className?: string;
  size?: "md" | "lg";
}) {
  const s = useReadiness();
  const { recent, push } = useRecentAssets();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(mode === "inline" || Boolean(autoFocus));
  const [active, setActive] = useState(0);

  const groups = useMemo(() => {
    if (query.trim()) return [{ label: "", icon: null, items: searchAssets(query) }];
    const rec = recent.filter((r) => !SUGGESTED_ASSETS.some((x) => x.id === r.id));
    return [
      { label: "Suggested for today", icon: <Sparkles className="size-3" />, items: SUGGESTED_ASSETS },
      ...(rec.length ? [{ label: "Recent", icon: <Clock className="size-3" />, items: rec }] : []),
    ];
  }, [query, recent]);
  const flat = groups.flatMap((g) => g.items);

  const pick = (id: string) => {
    push(id);
    setQuery("");
    if (mode === "dropdown") setOpen(false);
    onPick(id);
  };

  const list = (
    <div role="listbox" className="space-y-0.5">
      {flat.length === 0 ? <div className="px-3 py-3 text-sm text-gray-500">No asset matches &ldquo;{query}&rdquo;</div> : null}
      {groups.map((g) =>
        g.items.length ? (
          <div key={g.label || "results"}>
            {g.label ? (
              <div className={cn("flex items-center gap-1 px-2.5 pb-1 pt-2 text-[11px] font-semibold", g.label === "Recent" ? "text-gray-400" : "text-indigo-700")}>
                {g.icon} {g.label}
              </div>
            ) : null}
            {g.items.map((a) => (
              <AssetOption
                key={a.id}
                summary={assetSummary(a, s)}
                active={flat.indexOf(a) === active}
                onPick={pick}
                showHint={g.label === "Suggested for today"}
              />
            ))}
          </div>
        ) : null,
      )}
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 shadow-sm focus-within:border-indigo-300",
          size === "lg" ? "py-2.5" : "py-1.5",
        )}
      >
        <Search className={cn("shrink-0 text-gray-400", size === "lg" ? "size-5" : "size-4")} />
        <input
          value={query}
          autoFocus={autoFocus}
          onFocus={() => setOpen(true)}
          onBlur={() => mode === "dropdown" && setOpen(false)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, flat.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && flat[active]) {
              e.preventDefault();
              pick(flat[active].id);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          className={cn("min-w-0 flex-1 bg-transparent py-1 outline-none placeholder:text-gray-400", size === "lg" ? "text-base" : "text-sm")}
        />
      </div>
      {open ? (
        mode === "dropdown" ? (
          <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-[420px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">{list}</div>
        ) : (
          <div className="mt-2">{list}</div>
        )
      ) : null}
    </div>
  );
}
