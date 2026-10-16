"use client";

import { DOC_ICON, DocGrid } from "@/components/three-cases/doc-grid";
import { ExecutionPlan } from "@/components/three-cases/execution-plan";
import { CASE_B_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { AiTag, PageShell, TapCompare } from "@/components/three-cases/shell";
import { ASSETS, DOC_COLUMNS, LOCATIONS, job as getJob, jobsForAsset, locationName } from "@/lib/three-cases/data";
import type { Asset, DocType } from "@/lib/three-cases/types";
import { cn } from "@/lib/utils";
import { CalendarClock, Check, Loader2, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

/** What a safety program usually expects on file for each kind of asset. */
function expectedDocs(a: Asset): DocType[] {
  const c = a.category.toLowerCase();
  if (c.includes("compressor")) return ["jha", "loto", "audit", "sds"];
  if (c.includes("hydraulic press")) return ["jha", "sop", "loto", "ptw", "audit", "sds"];
  if (c.includes("conveyor") || c.includes("packaging")) return ["jha", "sop", "loto", "audit"];
  if (c.includes("truck")) return ["jha", "sop", "audit", "sds"];
  if (c.includes("compressor")) return ["jha", "loto", "audit", "sds"];
  if (c.includes("saw")) return ["jha", "sop", "loto"];
  if (c.includes("leveler")) return ["jha", "loto", "audit"];
  return ["audit"];
}

const NEXT: Record<string, { label: string; tone: "due" | "ok" | "none" }> = {
  fl03: { label: "Pre-use inspection · due today", tone: "due" },
  fl04: { label: "Pre-use inspection · daily", tone: "ok" },
  rka: { label: "Rack inspection · Nov 2", tone: "ok" },
  hp04: { label: "Daily guard check · today", tone: "ok" },
  hp07: { label: "Nothing scheduled", tone: "none" },
  cv12: { label: "Guarding inspection · Oct 28", tone: "ok" },
  wr2: { label: "Nothing scheduled", tone: "none" },
  ac2: { label: "Pressure vessel inspection · in 5 days", tone: "due" },
  bs1: { label: "Nothing scheduled", tone: "none" },
  dl2: { label: "Quarterly inspection · Dec 1", tone: "ok" },
};

const AI_NOTE: Record<string, string> = {
  hp07: "Draft SOP, LOTO and permit, then a monthly cleaning PM",
  wr2: "Draft SOP and LOTO from the manufacturer manual",
  bs1: "Approve the blade change SOP and draft a LOTO",
  cv12: "Add an e-stop test to the guarding inspection (open incident)",
  ac2: "Draft a JHA for filter and oil changes",
  fl03: "Run today's inspection, cleaning is due Friday",
  hp04: "Draft an SDS link for the die lubricant",
};

export default function ReadinessPage() {
  const [loc, setLoc] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [openJob, setOpenJob] = useState<string | null>(null);
  const [drafted, setDrafted] = useState<Record<string, DocType[]>>({});
  const [scheduled, setScheduled] = useState<string[]>([]);
  const [busy, setBusy] = useState<null | "docs" | "schedule">(null);
  const [banner, setBanner] = useState<string | null>(null);

  const assets = ASSETS.filter((a) => loc === "all" || a.locationId === loc);
  const missingFor = (a: Asset) =>
    expectedDocs(a).filter((t) => !a.docs.some((d) => d.type === t) && !(drafted[a.id] ?? []).includes(t));

  const stats = useMemo(() => {
    const expected = assets.reduce((n, a) => n + expectedDocs(a).length, 0);
    const missing = assets.reduce((n, a) => n + missingFor(a).length, 0);
    const unscheduled = assets.filter((a) => NEXT[a.id]?.tone === "none" && !scheduled.includes(a.id)).length;
    return { expected, have: expected - missing, missing, unscheduled };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, drafted, scheduled]);

  const pct = stats.expected ? Math.round((stats.have / stats.expected) * 100) : 0;
  const selectedMissing = selected.reduce((n, id) => n + missingFor(ASSETS.find((a) => a.id === id)!).length, 0);
  const openAsset = open ? ASSETS.find((a) => a.id === open) : undefined;

  const runBulk = (kind: "docs" | "schedule") => {
    setBusy(kind);
    setTimeout(() => {
      if (kind === "docs") {
        const next = { ...drafted };
        let n = 0;
        selected.forEach((id) => {
          const a = ASSETS.find((x) => x.id === id)!;
          const m = missingFor(a);
          n += m.length;
          next[id] = [...(next[id] ?? []), ...m];
        });
        setDrafted(next);
        setBanner(`Drafted ${n} documents from the JHAs and asset manuals. Sent to Maria Lopez for approval.`);
      } else {
        setScheduled((s) => Array.from(new Set([...s, ...selected])));
        setBanner(`Created ${selected.length} recurring PMs in the CMMS. Each work order carries its SOP, LOTO and permit.`);
      }
      setBusy(null);
      setSelected([]);
    }, 1300);
  };

  return (
    <PageShell title="Safety Execution" mainClassName="relative flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OptionSwitcher caseLabel="Use case 2" options={CASE_B_OPTIONS} />
        <TapCompare today="open 6 document lists" todayDetail="and cross-check by asset by hand" here="one board" />
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <div className="relative size-14 shrink-0">
          <svg viewBox="0 0 36 36" className="size-14 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#eef0f3" strokeWidth="4" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#4f46e5" strokeWidth="4" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-900">{pct}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-gray-900">{loc === "all" ? "Springfield Plant" : locationName(loc)} is {pct}% ready</div>
          <div className="text-xs text-gray-500">
            {stats.have} of {stats.expected} expected documents on file · {stats.missing} missing · {stats.unscheduled} assets with nothing scheduled
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[{ id: "all", name: "All" }, ...LOCATIONS.filter((l) => l.parentId)].map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setLoc(l.id);
                setSelected([]);
              }}
              className={cn("rounded-full border px-3 py-1 text-xs font-medium", loc === l.id ? "border-indigo-300 bg-indigo-50 text-indigo-800" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {banner ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <Check className="size-4" /> {banner}
          <button className="ml-auto text-emerald-700" onClick={() => setBanner(null)} aria-label="Dismiss">
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 pb-20 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((a) => {
          const exp = expectedDocs(a);
          const missing = missingFor(a);
          const ready = exp.length - missing.length;
          const isSel = selected.includes(a.id);
          const next = scheduled.includes(a.id) ? { label: "Monthly PM · created now", tone: "ok" as const } : NEXT[a.id];
          return (
            <div
              key={a.id}
              className={cn(
                "group relative flex flex-col gap-3 rounded-xl border bg-white p-4 transition",
                isSel ? "border-indigo-400 ring-2 ring-indigo-100" : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
              )}
            >
              <div className="flex items-start gap-3">
                <input
                  id={`sel-${a.id}`}
                  type="checkbox"
                  checked={isSel}
                  onChange={() => setSelected((s) => (s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id]))}
                  className="mt-1 size-4 accent-indigo-600"
                  aria-label={`Select ${a.name}`}
                />
                <button className="min-w-0 flex-1 text-left" onClick={() => { setOpen(a.id); setOpenJob(null); }}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-gray-400">{a.code}</span>
                    <span className="truncate text-sm font-semibold text-gray-900">{a.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">{locationName(a.locationId)} · {a.category}</div>
                </button>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", missing.length === 0 ? "bg-emerald-50 text-emerald-700" : missing.length > 2 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800")}>
                  {ready}/{exp.length}
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1.5">
                {DOC_COLUMNS.map((col) => {
                  const Icon = DOC_ICON[col.type];
                  const has = a.docs.filter((d) => d.type === col.type);
                  const isDraft = (drafted[a.id] ?? []).includes(col.type);
                  const expected = exp.includes(col.type);
                  const inReview = has.some((d) => d.status !== "approved");
                  return (
                    <div
                      key={col.type}
                      title={`${col.label}: ${has.length ? has.map((d) => d.title).join(", ") : isDraft ? "AI draft, waiting for approval" : expected ? "missing" : "not needed"}`}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium",
                        has.length && !inReview && "bg-indigo-50 text-indigo-700",
                        inReview && "bg-amber-50 text-amber-700",
                        isDraft && "border border-dashed border-indigo-300 bg-white text-indigo-600",
                        !has.length && !isDraft && expected && "border border-dashed border-rose-300 text-rose-500",
                        !has.length && !isDraft && !expected && "text-gray-300",
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{has.length > 1 ? `${col.short} ${has.length}` : col.short}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <CalendarClock className={cn("size-3.5", next?.tone === "due" ? "text-amber-600" : next?.tone === "none" ? "text-gray-300" : "text-gray-400")} />
                <span className={cn(next?.tone === "due" ? "font-medium text-amber-700" : next?.tone === "none" ? "text-gray-400" : "text-gray-600")}>{next?.label}</span>
              </div>
              {AI_NOTE[a.id] ? (
                <div className="flex items-start gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 text-xs text-gray-700">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-indigo-600" /> {AI_NOTE[a.id]}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1"><span className="size-3 rounded bg-indigo-100" /> On file</span>
        <span className="flex items-center gap-1"><span className="size-3 rounded border border-dashed border-rose-300" /> Missing</span>
        <span className="flex items-center gap-1"><span className="size-3 rounded border border-dashed border-indigo-300" /> AI draft</span>
        <span className="flex items-center gap-1"><span className="size-3 rounded bg-amber-100" /> In review</span>
      </div>

      {selected.length > 0 ? (
        <div className="fixed bottom-6 left-1/2 z-40 ml-32 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xl">
          <span className="text-sm font-medium text-gray-900">{selected.length} selected</span>
          <span className="text-xs text-gray-500">{selectedMissing} missing documents</span>
          <button
            disabled={busy !== null || selectedMissing === 0}
            onClick={() => runBulk("docs")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {busy === "docs" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Draft missing documents
          </button>
          <button
            disabled={busy !== null}
            onClick={() => runBulk("schedule")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-800 disabled:opacity-40"
          >
            {busy === "schedule" ? <Loader2 className="size-4 animate-spin" /> : <CalendarClock className="size-4" />} Schedule recurring work
          </button>
          <button onClick={() => setSelected([])} className="text-gray-400 hover:text-gray-700" aria-label="Clear selection">
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {openAsset ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={() => setOpen(null)}>
          <div className="flex h-full w-[760px] max-w-full flex-col gap-3 overflow-y-auto bg-gray-50 p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-xs text-gray-500">{openAsset.code}</div>
                <h2 className="text-lg font-semibold text-gray-900">{openAsset.name}</h2>
                <p className="text-xs text-gray-500">{locationName(openAsset.locationId)} · {openAsset.category}</p>
              </div>
              <button onClick={() => setOpen(null)} className="rounded p-1 text-gray-500 hover:bg-gray-200" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <DocGrid asset={openAsset} compact />
            </div>
            {openJob && getJob(openJob) ? (
              <div className="h-[520px]">
                <ExecutionPlan job={getJob(openJob)!} onBack={() => setOpenJob(null)} />
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-2">
                  <AiTag label="Suggested" />
                  <span className="text-sm font-medium text-gray-800">What to do on {openAsset.name}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {jobsForAsset(openAsset.id).map((j) => (
                    <button key={j.id} onClick={() => setOpenJob(j.id)} className="rounded-lg border border-gray-200 p-3 text-left hover:border-indigo-300">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">{j.verb}</div>
                      <div className="text-sm font-semibold text-gray-900">{j.title}</div>
                      <div className="text-xs text-gray-500">{j.reason}</div>
                    </button>
                  ))}
                  {openAsset.id === "hp07" ? (
                    <button onClick={() => setOpenJob("hp07-monthly")} className="rounded-lg border border-rose-200 bg-rose-50/40 p-3 text-left">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">Missing documents</div>
                      <div className="text-sm font-semibold text-gray-900">Draft what is missing and plan the monthly cleaning</div>
                    </button>
                  ) : null}
                  {jobsForAsset(openAsset.id).length === 0 && openAsset.id !== "hp07" ? (
                    <p className="text-xs text-gray-500">No executable document yet. Select the card and use &quot;Draft missing documents&quot;.</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
