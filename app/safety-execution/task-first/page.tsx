"use client";

import { useMeter } from "@/components/three-cases/exec/meter";
import { Dot, Legend, NeedChips, useReadiness } from "@/components/three-cases/exec/status";
import { VariantPage } from "@/components/three-cases/exec/variant-page";
import { Button } from "@/components/ui/button";
import { useThreeCases, type Execution } from "@/contexts/ThreeCasesContext";
import { ASSETS, asset as getAsset, locationName, person } from "@/lib/three-cases/data";
import {
  JOB_FAMILIES,
  TASK_TYPES,
  assetMatches,
  assetsForJob,
  classifyJob,
  customTask,
  taskStatus,
  type CustomJob,
  type TaskStatus,
  type TaskType,
} from "@/lib/three-cases/tasks";
import { cn } from "@/lib/utils";
import { Check, Loader2, Plus, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const CUSTOM_KEY = "ehs-exec-custom-jobs";

/** Job types the viewer added, kept in their browser (a convenience: the prototype works without it). */
function useCustomJobs() {
  const [jobs, setJobs] = useState<CustomJob[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once after mount, like ThreeCasesContext
      if (raw) setJobs(JSON.parse(raw));
    } catch {}
  }, []);
  const save = (next: CustomJob[]) => {
    setJobs(next);
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    } catch {}
  };
  return [jobs, save] as const;
}

interface Row {
  task: TaskStatus;
  assetId: string;
}

/**
 * F · Task first. The other way round: pick the kind of job, then one or more assets. Useful when
 * the same job runs on many machines (inspections, cleaning). One approval creates them all.
 * Anyone can add a job type: the AI reads which documents it needs from its name.
 */
export default function TaskFirstPage() {
  const s = useReadiness();
  const { createExecution, linkDocs } = useThreeCases();
  const meter = useMeter();
  const [custom, saveCustom] = useCustomJobs();
  const [fam, setFam] = useState(JOB_FAMILIES[0].id);
  const [picked, setPicked] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [phase, setPhase] = useState<"review" | "running" | "done">("review");
  const [made, setMade] = useState<{ assetId: string; woRef: string; exId?: string; assigneeId: string }[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const builtIn = JOB_FAMILIES.find((f) => f.id === fam);
  const def = custom.find((c) => c.id === fam);

  // Built-in families list the assets that have that job; a typed job can run on any asset.
  const rows: Row[] = useMemo(() => {
    if (builtIn) return builtIn.jobs.map((id) => taskStatus(id, s)).flatMap((t) => (t ? [{ task: t, assetId: t.job.assetId }] : []));
    if (def) return ASSETS.map((a) => customTask(def, a.id, s)).flatMap((t) => (t ? [{ task: t, assetId: t.job.assetId }] : []));
    return [];
  }, [builtIn, def, s]);
  const shown = rows.filter((r) => {
    const a = getAsset(r.assetId);
    return a ? assetMatches(a, filter) : false;
  });
  const chosen = rows.filter((r) => picked.includes(r.task.job.id));
  const drafts = chosen.flatMap((r) => r.task.needs.filter((n) => n.state === "missing"));
  const permits = chosen.filter((r) => r.task.runs.some((x) => x.kind === "ptw")).length;

  const switchFamily = (id: string, preselect: string[] = []) => {
    setFam(id);
    setPicked(preselect);
    setFilter("");
    setPhase("review");
    setMade([]);
  };

  const addJob = () => {
    const label = draft.trim();
    if (!label) return;
    const id = `c${Date.now()}`;
    const next: CustomJob = { id, label: label.charAt(0).toUpperCase() + label.slice(1), ...classifyJob(label) };
    saveCustom([...custom, next]);
    setDraft("");
    setAdding(false);
    switchFamily(
      id,
      assetsForJob(label).map((a) => `custom-${id}-${a}`),
    );
  };

  const setType = (type: TaskType) => {
    if (!def) return;
    saveCustom(custom.map((c) => (c.id === def.id ? { ...c, type, why: `Set by you: ${TASK_TYPES[type].label.toLowerCase()}` } : c)));
  };

  const removeJob = (id: string) => {
    saveCustom(custom.filter((c) => c.id !== id));
    if (fam === id) switchFamily(JOB_FAMILIES[0].id);
  };

  const create = () => {
    setPhase("running");
    setTimeout(() => {
      // Typed job types are not in the prototype data, so they get a work order number but no page.
      let n = 1100;
      const out = chosen.map((r) => {
        if (def) return { assetId: r.assetId, woRef: `WO-${++n}`, assigneeId: r.task.job.assigneeId };
        linkDocs(r.task.job.basedOn);
        const ex: Execution = createExecution(r.task.job.id);
        return { assetId: r.assetId, woRef: ex.woRef, exId: ex.id, assigneeId: ex.assigneeId };
      });
      setMade(out);
      setPhase("done");
      meter?.finish();
    }, 900);
  };

  const summary = [
    `${chosen.length} work order${chosen.length === 1 ? "" : "s"}`,
    permits ? `${permits} permit${permits === 1 ? "" : "s"}` : "",
    drafts.length ? `${drafts.length} draft${drafts.length === 1 ? "" : "s"} (${Array.from(new Set(drafts.map((d) => d.label))).join(", ")})` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const label = builtIn?.label ?? def?.label ?? "";
  const allShownPicked = shown.length > 0 && shown.every((r) => picked.includes(r.task.job.id));

  return (
    // NOTE: option F is frozen on purpose. It is exactly what was presented on Oct 20; do not change its flow.
    // Edge-case work (document-to-work-order link, unapproved documents, document statuses) happens in new
    // versions next to it, starting with V1 (app/safety-execution/v1). To redesign the UI, branch from here.
    <VariantPage note="F · Task first. Pick the job, tick the assets, one approval. Add your own job type: the AI reads which documents it needs.">
      <div className="grid h-full min-h-0 grid-cols-[230px_minmax(0,1fr)] gap-3">
        <nav className="flex min-h-0 flex-col gap-0.5 overflow-y-auto rounded-xl border border-border bg-card p-2">
          <div className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-text-placeholder">Jobs</div>
          {JOB_FAMILIES.map((f) => {
            const ts = f.jobs.map((id) => taskStatus(id, s)).filter((t): t is TaskStatus => Boolean(t));
            return (
              <button
                key={f.id}
                onClick={() => switchFamily(f.id)}
                className={cn("flex items-start justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left", f.id === fam ? "bg-badge-accent" : "hover:bg-surface-subtle")}
              >
                <span className="min-w-0">
                  <span className={cn("block text-sm", f.id === fam ? "font-medium text-badge-accent-foreground" : "text-foreground")}>{f.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{f.hint}</span>
                </span>
                <span className="mt-1.5 flex shrink-0 gap-0.5">
                  {ts.map((t) => (
                    <Dot key={t.job.id} level={t.level} className="size-1.5" />
                  ))}
                </span>
              </button>
            );
          })}

          {custom.length ? <div className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-text-placeholder">Added by you</div> : null}
          {custom.map((c) => (
            <div key={c.id} className={cn("group flex items-start justify-between gap-1 rounded-lg px-2.5 py-1.5", c.id === fam ? "bg-badge-accent" : "hover:bg-surface-subtle")}>
              <button onClick={() => switchFamily(c.id)} className="min-w-0 flex-1 text-left">
                <span className={cn("block truncate text-sm", c.id === fam ? "font-medium text-badge-accent-foreground" : "text-foreground")}>{c.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{TASK_TYPES[c.type].label}</span>
              </button>
              <button onClick={() => removeJob(c.id)} aria-label={`Remove ${c.label}`} className="mt-0.5 text-text-placeholder opacity-0 hover:text-muted-foreground group-hover:opacity-100">
                <X className="size-3.5" />
              </button>
            </div>
          ))}

          <div className="mt-2 px-1">
            {adding ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addJob();
                }}
                className="space-y-1.5 rounded-lg border border-primary/40 bg-badge-accent p-2"
              >
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
                  placeholder="Weld a forklift guard"
                  className="w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm outline-none focus:border-primary/40"
                />
                <p className="text-xs text-muted-foreground">Name the job. The AI reads which documents it needs and on which assets.</p>
                <div className="flex justify-end gap-1">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={!draft.trim()}>
                    Add
                  </Button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-2 text-sm text-muted-foreground hover:border-primary/40 hover:text-badge-accent-foreground"
              >
                <Plus className="size-4" /> New job type
              </button>
            )}
          </div>
        </nav>

        <div className="flex min-h-0 flex-col rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">{label}: on which assets?</h2>
            <Legend />
          </div>

          {def ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-badge-accent px-4 py-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-badge-accent-foreground" />
              <span>{def.why}.</span>
              {def.permit ? <span className="text-badge-accent-foreground">Each job also gets a permit: {def.permit}.</span> : null}
              <span className="ml-auto flex items-center gap-1">
                <span className="text-muted-foreground">Not right?</span>
                {(Object.keys(TASK_TYPES) as TaskType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    title={TASK_TYPES[t].hint}
                    className={cn("rounded-full border px-2 py-0.5", def.type === t ? "border-primary/40 bg-card font-medium text-badge-accent-foreground" : "border-transparent text-muted-foreground hover:bg-card")}
                  >
                    {TASK_TYPES[t].label}
                  </button>
                ))}
              </span>
            </div>
          ) : null}

          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <Search className="size-4 text-text-placeholder" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by name, code or location: FL-, Press, Warehouse"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-placeholder"
            />
            {phase === "review" && shown.length > 1 ? (
              <button
                onClick={() =>
                  setPicked((p) => (allShownPicked ? p.filter((id) => !shown.some((r) => r.task.job.id === id)) : Array.from(new Set([...p, ...shown.map((r) => r.task.job.id)]))))
                }
                className="text-xs font-medium text-badge-accent-foreground hover:underline"
              >
                {allShownPicked ? "Untick all" : `Tick all ${shown.length}`}
              </button>
            ) : null}
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {shown.map(({ task: t, assetId }) => {
              const a = getAsset(assetId);
              const on = picked.includes(t.job.id);
              const m = made.find((x) => x.assetId === assetId);
              return (
                <li key={t.job.id} className={cn("border-b border-border", on && "bg-badge-accent")}>
                  <label className="grid cursor-pointer grid-cols-[20px_12px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={phase !== "review"}
                      onChange={() => setPicked((p) => (on ? p.filter((x) => x !== t.job.id) : [...p, t.job.id]))}
                      className="size-4 accent-indigo-600"
                    />
                    <Dot level={t.level} />
                    <span className="min-w-0">
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xs text-text-placeholder">{a?.code}</span>
                        <span className="truncate text-sm font-medium text-foreground">{a?.name}</span>
                        <span className="truncate text-xs text-muted-foreground">· {a ? locationName(a.locationId) : ""}</span>
                      </span>
                      {builtIn ? <span className="block truncate text-xs text-muted-foreground">{t.job.title}</span> : null}
                      <span className="block text-xs text-muted-foreground">{t.headline}</span>
                    </span>
                    {m ? (
                      m.exId ? (
                        <Link href={`/safety-execution/work-orders/${m.exId}`} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline">
                          <Check className="size-3.5" /> {m.woRef}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <Check className="size-3.5" /> {m.woRef}
                        </span>
                      )
                    ) : (
                      <NeedChips task={t} />
                    )}
                  </label>
                </li>
              );
            })}
            {shown.length === 0 ? <li className="px-4 py-6 text-center text-sm text-muted-foreground">No asset matches “{filter}”</li> : null}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            {phase === "done" ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <Check className="size-4" /> Created {made.map((m) => m.woRef).join(", ")} for{" "}
                {Array.from(new Set(made.map((m) => person(m.assigneeId).name.split(" ")[0]))).join(" and ")}
                <span className="font-normal text-muted-foreground">· each one waits for its permit and drafts, if any</span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">{chosen.length ? `Creates ${summary}` : "Tick one or more assets"}</span>
            )}
            {phase === "done" ? (
              <Button size="sm" variant="outline" onClick={() => switchFamily(fam)}>
                Another job
              </Button>
            ) : (
              <Button size="sm" disabled={!chosen.length || phase === "running"} onClick={create}>
                {phase === "running" ? (
                  <>
                    <Loader2 className="mr-1.5 size-4 animate-spin" /> Creating
                  </>
                ) : (
                  `Approve ${chosen.length || ""} ${chosen.length === 1 ? "job" : "jobs"}`.replace("  ", " ")
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </VariantPage>
  );
}
