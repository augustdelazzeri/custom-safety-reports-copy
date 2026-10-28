"use client";

// The workbench of V1 to V3 and F1 (the long-term vision): pick the job, tick one or more assets, start the
// missing documents as drafts, then create a PM or a work order with the documents attached. Drawn in the
// Safety redesign's language (safety-redesign, design-review-2026-10-05); `mode` shows the sample plant or
// an empty account.

import { RdCard, RdField, RdPage, RdSegmented, fieldClass, RdEmptyState } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { person } from "@/lib/three-cases/data";
import type { DataMode } from "@/lib/three-cases/demo-data";
import {
  ASSIGNEES,
  CATEGORIES,
  GROUPS,
  KINDS,
  KIND_LABEL,
  KIND_SHORT,
  PRIORITY_LABEL,
  allFamilies,
  dateIn,
  defaultCategory,
  docOf,
  everyText,
  fmtDate,
  rowsFor,
  checklistOptions,
  tasksFor,
  libraryChecklists,
  DEFAULT_SCHEDULE,
  MONTHS,
  WEEKDAYS,
  fmtMonthDay,
  woTitleFor,
  useRealStore,
  type Basis,
  type ChecklistOpt,
  type Every,
  type Family,
  type Kind,
  type NeedState,
  type Priority,
  type Rec,
  type RowStatus,
  type Schedule,
  type Unit,
} from "@/lib/three-cases/real-jobs";
import { cn } from "@/lib/utils";
import { CalendarClock, FilePen, ImagePlus, Loader2, Paperclip, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CountBar, DocPill, LookContext, PmCell, ReadyTag, StatusLegend, okDot, plural, useLook, warnText } from "./bench-parts";
import { useMeterFinish } from "./meter";
import { BenchDnd, DragChip, DropCell } from "./dnd";
import { CreatedToast, HiddenJobs, HideJobButton, ListHeading, NoAssets, PAGE_TITLE, RowAction, groupLabel, jobLabel, jobRow, type Created } from "./page-parts";

type Phase = "pick" | "form" | "running";
type Toast = Created;

const COLS = "grid-cols-[16px_minmax(140px,1fr)_144px_minmax(0,1.1fr)_minmax(124px,0.9fr)_minmax(200px,1.2fr)]";
const SUBTITLE = "Pick the job, tick the assets. Start what is missing as drafts, then create a PM or the work orders, with the documents attached.";

function useBench(empty: boolean) {
  const store = useRealStore(empty);
  const finish = useMeterFinish();
  const [famId, setFamId] = useState("inspect");
  const [picked, setPicked] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [phase, setPhase] = useState<Phase>("pick");
  const [kind, setKind] = useState<Rec["kind"]>("pm");
  /** Drafts being created right now: "assetId|type". The list shows them loading in the documents column. */
  const [creating, setCreating] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (t: Toast) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(t);
    toastTimer.current = setTimeout(() => setToast(null), 9000);
  };

  // The form of a PM or a work order.
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("carlos");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("Safety");
  const [hours, setHours] = useState(1);
  const [signature, setSignature] = useState(false);
  const [date, setDate] = useState(dateIn(1));
  const [every, setEvery] = useState<Every>({ n: 1, unit: "week" });
  const [attach, setAttach] = useState<Kind[]>([]);
  const [sched, setSched] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [checklist, setChecklist] = useState("none");
  const [generated, setGenerated] = useState<ChecklistOpt[]>([]);

  const allFams = allFamilies(store);
  const fams = allFams.filter((f) => !store.hidden.includes(f.id));
  const fam = fams.find((f) => f.id === famId) ?? fams[0] ?? allFams[0];
  const base = useMemo(() => rowsFor(store, fam), [store, fam]);
  const q = filter.trim().toLowerCase();
  const shown = base.filter((r) => !q || `${r.asset.code} ${r.asset.name} ${r.asset.location}`.toLowerCase().includes(q));
  const chosen = base.filter((r) => picked.includes(r.asset.id));
  const toDraft = chosen.flatMap((r) => r.draftable.map((n) => ({ assetId: r.asset.id, type: n.type })));

  const switchFam = (id: string) => {
    setFamId(id);
    setPicked([]);
    setFilter("");
    setPhase("pick");
  };
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleAll = () => {
    const all = shown.map((r) => r.asset.id);
    setPicked((p) => (all.every((i) => p.includes(i)) ? p.filter((i) => !all.includes(i)) : Array.from(new Set([...p, ...all]))));
  };

  /** Starts one draft per missing document, named after the asset. The documents column shows each one loading, then a toast says they exist. */
  const createDrafts = () => {
    if (creating.length) return;
    const items = toDraft;
    setCreating(items.map((i) => `${i.assetId}|${i.type}`));
    setTimeout(() => {
      const made = store.createDrafts(items);
      setCreating([]);
      if (!made.length) return;
      const refs = made.map((m) => m.doc.ref);
      showToast({
        what: "document",
        ref: refs[0],
        title: made.length === 1 ? "Draft document created" : `${made.length} draft documents created`,
        line: `${refs.slice(0, 3).join(", ")}${refs.length > 3 ? ` and ${refs.length - 3} more` : ""} · finish them in the document pages`,
      });
    }, 1600);
  };

  /** Opens the form with what a PM or work order for these assets would most likely need, so one click is enough. */
  const openForm = (k: Rec["kind"], ids?: string[]) => {
    // From a row, the form opens for that asset alone: tick, then create, in two clicks.
    const rows = ids ? base.filter((r) => ids.includes(r.asset.id)) : chosen;
    if (ids) setPicked(ids);
    const one = rows.length === 1 ? woTitleFor(fam, rows[0].asset) : `${fam.label.split(" / ")[0]} · ${plural(rows.length, "asset")}`;
    // The documents of the job that these assets have, in any state: they attach now or when approved.
    const have = KINDS.filter((t) => rows.some((r) => r.needs.some((n) => n.type === t && n.state !== "missing")));
    // Almost every safety work order carries an audit or inspection checklist, so it is on whenever an asset has one.
    const inPackage = have.filter((t) => t === "audit" || rows.some((r) => r.needs.some((n) => n.type === t)));
    setKind(k);
    setTitle(one);
    setEvery(fam.every);
    setCategory(defaultCategory(fam.id));
    setHours(fam.id === "inspect" ? 1 : 2);
    setSignature(false);
    // Documents still in approval need time: a PM starts two weeks out when something is not valid yet.
    setDate(dateIn(k === "pm" && rows.some((r) => !r.ready) ? 14 : 1));
    setAttach(inPackage);
    setSched(DEFAULT_SCHEDULE);
    setGenerated([]);
    // A single asset brings its own checklist through its audit, SOP or LOTO; for several assets the job's usual template is the start.
    const docs = rows.flatMap((r) => KINDS.map((t) => docOf(store, r.asset.id, t)).filter((d): d is NonNullable<typeof d> => Boolean(d)));
    const own = rows.length === 1 ? checklistOptions(docs, fam.id)[0] : undefined;
    const libOf: Record<string, string> = { inspect: "lib-walk", lube: "lib-lube", clean: "lib-clean" };
    setChecklist(own?.id ?? libOf[fam.id] ?? "none");
    setPhase("form");
  };

  const create = () => {
    setPhase("running");
    setTimeout(() => {
      const made = store.createRecs({ kind, title, assetIds: chosen.map((r) => r.asset.id), famId: fam.id, assigneeId: assignee, priority, category, hours, signature, date, every: kind === "pm" ? every : undefined, attach, schedule: kind === "pm" ? sched : undefined, checklist });
      const first = made[0];
      showToast({
        what: kind === "pm" ? "PM" : "work order",
        ref: made.length > 1 ? `${made[0].ref} to ${made[made.length - 1].ref}` : first.ref,
        title: made.length > 1 ? `${made.length} work orders created` : kind === "pm" ? "PM created" : "Work order created",
        line: kind === "pm" ? `${first.title} · ${everyText(every).toLowerCase()} from ${fmtDate(date)}` : `${first.title} · due ${fmtDate(date)}`,
      });
      setPicked([]);
      setPhase("pick");
      finish?.();
    }, 400);
  };

  return { store, fam, fams, allFams, famId, switchFam, picked, toggle, toggleAll, filter, setFilter, base, shown, chosen, toDraft, creating, createDrafts, phase, setPhase, kind, openForm, title, setTitle, assignee, setAssignee, priority, setPriority, category, setCategory, hours, setHours, signature, setSignature, date, setDate, every, setEvery, attach, setAttach, sched, setSched, checklist, setChecklist, generated, setGenerated, create, toast, setToast };
}
type B = ReturnType<typeof useBench>;

// ───────────────────────────── jobs on the left

function Nav({ b }: { b: B }) {
  const { store, fam, fams } = b;
  const hiddenFams = b.allFams.filter((f) => store.hidden.includes(f.id));
  const { calm, hue } = useLook();
  const [adding, setAdding] = useState(false);

  const item = (f: Family) => {
    const on = f.id === fam.id;
    return (
      <div key={f.id} className={cn(jobRow(on), "py-1.5")}>
        <button title={`${f.hint} · ${f.rhythm}`} onClick={() => b.switchFam(f.id)} aria-current={on ? "true" : undefined} className="flex min-w-0 flex-1 flex-wrap items-center text-left outline-none">
          <span className={jobLabel(on)}>{f.label}</span>
          <CountBar rows={rowsFor(store, f)} />
        </button>
        <HideJobButton
          label={f.label}
          onClick={() => {
            store.hideFamily(f.id);
            if (on) b.switchFam(fams.find((x) => x.id !== f.id)?.id ?? f.id);
          }}
        />
        {f.custom ? (
          <button
            onClick={() => {
              store.removeFamily(f.id);
              if (on) b.switchFam("inspect");
            }}
            aria-label={`Delete ${f.label}`}
            title="Delete this job"
            className="shrink-0 text-text-placeholder opacity-0 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <nav aria-label="Jobs" className="flex min-h-0 flex-col gap-4">
      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
        {GROUPS.filter((g) => fams.some((f) => f.group === g.id && !f.custom)).map((g) => (
          <div key={g.id} className="flex flex-col gap-0.5">
            <span className={groupLabel}>{g.label}</span>
            {fams.filter((f) => f.group === g.id && !f.custom).map(item)}
          </div>
        ))}
        {fams.some((f) => f.custom) ? (
          <div className="flex flex-col gap-0.5">
            <span className={groupLabel}>Added by you</span>
            {fams.filter((f) => f.custom).map(item)}
          </div>
        ) : null}
        <HiddenJobs jobs={hiddenFams} onShow={store.showFamily} />
      </div>
      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex items-center gap-3 px-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", okDot(hue))} /> ready
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", calm ? "bg-text-placeholder" : "bg-[var(--amber-9)]")} /> need action
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setAdding(true)} className="w-full gap-2">
          <Plus className="size-4" /> New job
        </Button>
      </div>
      <NewJobDialog b={b} open={adding} onOpenChange={setAdding} />
    </nav>
  );
}

/** A job is only a name: which documents it needs is decided by each asset, so there is nothing else to pick. */
function NewJobDialog({ b, open, onOpenChange }: { b: B; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const close = () => {
    setName("");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="gap-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New job</DialogTitle>
          <DialogDescription>Name the job. The documents it needs come from each asset: the ones the asset already has.</DialogDescription>
        </DialogHeader>
        <RdField label="Name">
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Calibrate the scale" />
        </RdField>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              const id = b.store.addFamily(name.trim());
              b.switchFam(id);
              close();
            }}
          >
            Create job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────────────── the assets of a job

function ColumnHeads({ b }: { b: B }) {
  const all = b.shown.length > 0 && b.shown.every((r) => b.picked.includes(r.asset.id));
  return (
    <div className={cn("sticky top-0 z-10 grid h-11 items-center gap-4 border-b border-border bg-surface-subtle px-4 text-xs font-medium text-muted-foreground", COLS)}>
      <input type="checkbox" aria-label={all ? "Untick all" : "Tick all"} checked={all} onChange={b.toggleAll} disabled={!b.shown.length} className="size-4 accent-[var(--indigo-9)]" />
      <span>Asset</span>
      <span>Status</span>
      <span>Required</span>
      <span>Optional</span>
      <span>PM and work orders</span>
    </div>
  );
}

function Row({ b, r }: { b: B; r: RowStatus }) {
  const a = r.asset;
  const on = b.picked.includes(a.id);
  const id = `cb-${b.fam.id}-${a.id}`;
  const required = r.needs.filter((n) => n.level === "required");
  // Optional shows only documents the asset has that are not required for this job.
  const optional = r.needs.filter((n) => n.level === "recommended" && n.state !== "missing");
  const pill = (n: NeedState) => (
    <DragChip key={n.type} assetId={a.id} type={n.type} label={n.doc?.ref ?? KIND_SHORT[n.type]} disabled={n.state === "missing"}>
      <DocPill n={n} creating={b.creating.includes(`${a.id}|${n.type}`)} />
    </DragChip>
  );
  return (
    <li className={cn("group border-b border-border transition-colors last:border-b-0", on ? "bg-badge-accent/40" : "hover:bg-muted/50")}>
      <div className={cn("grid items-start gap-4 px-4 py-3", COLS)}>
        <input id={id} type="checkbox" checked={on} onChange={() => b.toggle(a.id)} className="mt-0.5 size-4 accent-[var(--indigo-9)]" />
        <div className="min-w-0">
          <label htmlFor={id} className="block cursor-pointer truncate text-sm font-medium text-foreground" title={a.name}>
            {a.name}
          </label>
          <p className="mt-0.5 truncate text-xs font-medium tracking-[0.02em] text-text-subtle">
            {a.code} · {a.location}
          </p>
        </div>
        <div>
          <ReadyTag r={r} />
        </div>
        <DropCell assetId={a.id} level="required">
          {required.map(pill)}
        </DropCell>
        <DropCell assetId={a.id} level="optional">
          {optional.map(pill)}
        </DropCell>
        <div className="flex items-start justify-between gap-2">
          <PmCell r={r} />
          {/* Own cell: the buttons fade in on hover but always keep their place, so they never cover the list. */}
          <span className="flex shrink-0 gap-1">
            <RowAction label="New work order" onClick={() => b.openForm("wo", [a.id])}>
              <Plus />
            </RowAction>
            <RowAction label="New PM" onClick={() => b.openForm("pm", [a.id])}>
              <CalendarClock />
            </RowAction>
          </span>
        </div>
      </div>
    </li>
  );
}

// ───────────────────────────── PM / work order form

const UNITS: Unit[] = ["day", "week", "month", "year"];
const CREATE_UNITS = ["hours", "days", "weeks"] as const;
const TIMES = ["06:00", "07:00", "08:00", "09:00", "12:00", "17:00"];
const select = (extra?: string) => cn(fieldClass, extra);

/** A label over a row of several controls (a div, so the buttons do not take the label as their name). */
function GroupField({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm leading-none font-medium text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-muted-foreground">*</span> : null}
      </span>
      {children}
    </div>
  );
}

/** What the CMMS lets a calendar PM do: fixed schedule or after completion, how often, at what time, when the work order is created, and the periods it pauses. */
function ScheduleCard({ b }: { b: B }) {
  const { sched, setSched } = b;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ fm: 6, fd: 1, tm: 8, td: 31 });
  const set = (p: Partial<Schedule>) => setSched({ ...sched, ...p });
  const dayInput = (v: number, on: (n: number) => void, label: string) => (
    <input data-slot="input" aria-label={label} type="number" min={1} max={31} value={v} onChange={(e) => on(Math.min(31, Math.max(1, Number(e.target.value) || 1)))} className={select("w-16")} />
  );
  const monthSelect = (v: number, on: (n: number) => void, label: string) => (
    <select data-slot="select-trigger" aria-label={label} value={v} onChange={(e) => on(Number(e.target.value))} className={select("w-20")}>
      {MONTHS.map((m, i) => (
        <option key={m} value={i + 1}>
          {m}
        </option>
      ))}
    </select>
  );
  return (
    <RdCard title="Schedule" padded>
      <div className="flex flex-col gap-4">
        <GroupField label="Repeats" required>
          <RdSegmented<Basis>
            size="sm"
            value={sched.basis}
            onChange={(v) => set({ basis: v })}
            options={[
              { value: "fixed", label: "Fixed schedule" },
              { value: "completion", label: "After completion" },
            ]}
          />
          <span className="text-sm text-muted-foreground">{sched.basis === "fixed" ? "Due on the same dates, even if the last one was late." : "The next one is due after the last one is completed."}</span>
        </GroupField>
        <div className="grid grid-cols-2 gap-4">
          <GroupField label="Every" required>
            <span className="flex gap-2">
              <input data-slot="input" type="number" min={1} value={b.every.n} onChange={(e) => b.setEvery({ ...b.every, n: Math.max(1, Number(e.target.value) || 1) })} className={select("w-16")} aria-label="Every" />
              <select data-slot="select-trigger" value={b.every.unit} onChange={(e) => b.setEvery({ ...b.every, unit: e.target.value as Unit })} className={select()} aria-label="Unit">
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}s
                  </option>
                ))}
              </select>
            </span>
          </GroupField>
          <RdField label="Due time">
            <select data-slot="select-trigger" value={sched.time} onChange={(e) => set({ time: e.target.value })} className={select()}>
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </RdField>
          <RdField label="First work order due" required className="col-span-2 max-w-[220px]">
            <input data-slot="input" type="date" value={b.date} onChange={(e) => b.setDate(e.target.value)} className={fieldClass} />
          </RdField>
        </div>
        <GroupField label="Create the work order">
          <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <select data-slot="select-trigger" aria-label="When to create it" value={sched.create.mode} onChange={(e) => set({ create: e.target.value === "before" ? { mode: "before", n: 1, unit: "days" } : { mode: "weekday", day: "Wednesday", time: "08:00" } })} className={select("w-auto")}>
              <option value="before">Before due</option>
              <option value="weekday">On a weekday</option>
            </select>
            {sched.create.mode === "before" ? (
              <>
                <input data-slot="input" aria-label="Amount before due" type="number" min={0} value={sched.create.n} onChange={(e) => set({ create: { ...sched.create, mode: "before", n: Math.max(0, Number(e.target.value) || 0), unit: sched.create.mode === "before" ? sched.create.unit : "days" } })} className={select("w-16")} />
                <select data-slot="select-trigger" aria-label="Unit before due" value={sched.create.unit} onChange={(e) => set({ create: { mode: "before", n: sched.create.mode === "before" ? sched.create.n : 1, unit: e.target.value as "hours" | "days" | "weeks" } })} className={select("w-auto")}>
                  {CREATE_UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <select data-slot="select-trigger" aria-label="Weekday" value={sched.create.day} onChange={(e) => set({ create: { mode: "weekday", day: e.target.value, time: sched.create.mode === "weekday" ? sched.create.time : "08:00" } })} className={select("w-auto")}>
                  {WEEKDAYS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                at
                <select data-slot="select-trigger" aria-label="Time" value={sched.create.time} onChange={(e) => set({ create: { mode: "weekday", day: sched.create.mode === "weekday" ? sched.create.day : "Wednesday", time: e.target.value } })} className={select("w-auto")}>
                  {TIMES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </>
            )}
          </span>
        </GroupField>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span title="Months and days of the year when no work order is created" className="text-sm leading-none font-medium text-foreground">
              Inactive periods
            </span>
            {!adding ? (
              <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1 text-sm font-medium text-badge-accent-foreground hover:underline">
                <Plus className="size-4" /> Add period
              </button>
            ) : null}
          </div>
          {sched.inactive.length ? (
            <div className="flex flex-wrap gap-1.5">
              {sched.inactive.map((p, i) => (
                <span key={i} className="inline-flex h-6 items-center gap-1 rounded-full bg-badge-neutral px-2.5 text-xs font-medium text-badge-neutral-foreground">
                  {fmtMonthDay(p.from)} to {fmtMonthDay(p.to)}
                  <button type="button" aria-label="Remove period" onClick={() => set({ inactive: sched.inactive.filter((_, j) => j !== i) })} className="hover:text-foreground">
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          {adding ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {monthSelect(draft.fm, (n) => setDraft({ ...draft, fm: n }), "From month")}
              {dayInput(draft.fd, (n) => setDraft({ ...draft, fd: n }), "From day")}
              to
              {monthSelect(draft.tm, (n) => setDraft({ ...draft, tm: n }), "To month")}
              {dayInput(draft.td, (n) => setDraft({ ...draft, td: n }), "To day")}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  set({ inactive: [...sched.inactive, { from: { m: draft.fm, d: draft.fd }, to: { m: draft.tm, d: draft.td } }] });
                  setAdding(false);
                }}
              >
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </RdCard>
  );
}

/** The checklist is the list of steps the technician ticks off on the work order. In the CMMS it is a reusable template; a work order takes one. */
function ChecklistCard({ b }: { b: B }) {
  const { store, chosen, fam } = b;
  const [making, setMaking] = useState(false);
  const docs = chosen.flatMap((r) => KINDS.map((t) => docOf(store, r.asset.id, t)).filter((d): d is NonNullable<typeof d> => Boolean(d)));
  const own = chosen.length === 1 ? checklistOptions(docs, fam.id) : [];
  const library = libraryChecklists();
  const all: ChecklistOpt[] = [...own, ...b.generated, ...library];
  const picked = all.find((o) => o.id === b.checklist);

  const generate = () => {
    setMaking(true);
    setTimeout(() => {
      const o: ChecklistOpt = { id: `gen-${Date.now()}`, name: `${fam.label.split(" / ")[0]} ${chosen.length === 1 ? chosen[0].asset.name : plural(chosen.length, "asset")}`, items: tasksFor(fam.id) };
      b.setGenerated([...b.generated, o]);
      b.setChecklist(o.id);
      setMaking(false);
    }, 1200);
  };

  return (
    <RdCard title="Checklist" action={<span className="text-sm text-muted-foreground">The steps the technician ticks off</span>} padded>
      <div className="flex flex-col gap-3">
        <select data-slot="select-trigger" aria-label="Checklist" value={b.checklist} onChange={(e) => b.setChecklist(e.target.value)} className={fieldClass}>
          {own.length ? (
            <optgroup label="Linked to this asset's documents">
              {own.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} · {o.from} · {o.items.length} items
                </option>
              ))}
            </optgroup>
          ) : null}
          {b.generated.length ? (
            <optgroup label="Just created">
              {b.generated.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} · {o.items.length} items
                </option>
              ))}
            </optgroup>
          ) : null}
          <optgroup label="Your company's checklists">
            {library.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} · {o.items.length} items
              </option>
            ))}
          </optgroup>
          <option value="none">No checklist</option>
        </select>
        {picked ? (
          <ol className="flex flex-col gap-1 text-sm text-foreground">
            {picked.items.slice(0, 4).map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-4 shrink-0 text-right text-muted-foreground tabular-nums">{i + 1}.</span>
                <span className="truncate">{it}</span>
              </li>
            ))}
            {picked.items.length > 4 ? <li className="pl-6 text-muted-foreground">and {picked.items.length - 4} more</li> : null}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">The work order goes out without steps to tick.</p>
        )}
        <Button size="sm" variant="outline" disabled={making} onClick={generate} title="Builds a new checklist from the asset and its documents" className="w-fit gap-2">
          {making ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Create a new one with AI
        </Button>
      </div>
    </RdCard>
  );
}

function FormStep({ b }: { b: B }) {
  const { store, chosen, kind, phase } = b;
  const { calm } = useLook();
  const warn = warnText(calm);
  const running = phase === "running";
  const isPm = kind === "pm";
  const [description, setDescription] = useState(() => `${b.fam.hint}.`);
  const [files, setFiles] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Always the six types, in the order of the EHS sidebar. A type no chosen asset has stays visible but cannot be attached.
  const have = (t: Kind) => chosen.filter((r) => docOf(store, r.asset.id, t));
  const notApproved = chosen.flatMap((r) =>
    KINDS.filter((t) => b.attach.includes(t))
      .map((t) => ({ r, t, d: docOf(store, r.asset.id, t) }))
      .filter((x) => x.d && x.d.state !== "valid"),
  );
  const without = chosen.filter((r) => r.action.some((n) => n.state === "missing"));
  const missingRequired = !b.title.trim() || (isPm && !description.trim());

  return (
    <RdPage
      onBack={() => b.setPhase("pick")}
      record
      eyebrow={b.fam.label}
      title={isPm ? "New preventive maintenance" : "New work order"}
      subtitle="Filled in from the job and the assets. Fields with * are required."
      className="pb-10"
    >
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-6">
          <RdCard title="Details" padded>
            <div className="flex flex-col gap-4">
              <RdField label="Title" required>
                <Input value={b.title} onChange={(e) => b.setTitle(e.target.value)} className="font-medium" />
              </RdField>
              <RdField label="Description" required={isPm}>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={isPm ? "" : "Optional"} />
              </RdField>
              <div className="grid grid-cols-2 gap-4">
                <RdField label="Category">
                  <select data-slot="select-trigger" value={b.category} onChange={(e) => b.setCategory(e.target.value)} className={fieldClass}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </RdField>
                <RdField label="Assigned to">
                  <select data-slot="select-trigger" value={b.assignee} onChange={(e) => b.setAssignee(e.target.value)} className={fieldClass}>
                    {ASSIGNEES.map((p) => (
                      <option key={p} value={p}>
                        {person(p).name}
                      </option>
                    ))}
                  </select>
                </RdField>
                <GroupField label="Priority" required={!isPm}>
                  <RdSegmented<Priority> size="sm" value={b.priority} onChange={b.setPriority} options={(["low", "medium", "high"] as Priority[]).map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))} />
                </GroupField>
                <RdField label="Estimated time">
                  <span className="relative block">
                    <Input type="number" min={0} step={0.5} value={b.hours} onChange={(e) => b.setHours(Math.max(0, Number(e.target.value) || 0))} className="pr-8" />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">h</span>
                  </span>
                </RdField>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-muted px-3 py-2">
                <span>
                  <span className="block text-sm font-medium text-foreground">Requires signature</span>
                  <span className="block text-sm text-muted-foreground">The technician signs when completing it</span>
                </span>
                <Switch aria-label="Requires signature" checked={b.signature} onCheckedChange={b.setSignature} />
              </div>
            </div>
          </RdCard>

          <RdCard title="Documents, files and photos" padded>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((t) => {
                const list = have(t);
                const on = b.attach.includes(t);
                const none = list.length === 0;
                const unsure = list.some((r) => docOf(store, r.asset.id, t)?.state !== "valid");
                return (
                  <label
                    key={t}
                    title={none ? `No ${KIND_LABEL[t]} for ${chosen.length === 1 ? "this asset" : "these assets"} yet` : KIND_LABEL[t]}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors",
                      none ? "cursor-not-allowed border-dashed border-border text-text-placeholder" : on ? "cursor-pointer border-primary/40 bg-badge-accent/50 text-foreground" : "cursor-pointer border-border text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    <input type="checkbox" disabled={none} checked={on && !none} onChange={() => b.setAttach(on ? b.attach.filter((x) => x !== t) : [...b.attach, t])} className="size-4 accent-[var(--indigo-9)]" />
                    <span className="font-medium">{KIND_SHORT[t]}</span>
                    <span className={none ? "text-text-placeholder" : "text-muted-foreground"}>{none ? "none" : chosen.length === 1 ? docOf(store, chosen[0].asset.id, t)?.ref : `${list.length} of ${chosen.length}`}</span>
                    {unsure && !none ? <span className={cn("size-1.5 rounded-full", calm ? "bg-text-placeholder" : "bg-[var(--amber-9)]")} title="Not approved yet" /> : null}
                  </label>
                );
              })}
            </div>
            {notApproved.length ? (
              <p className={cn("mt-3 text-sm", warn)}>
                {plural(notApproved.length, "document")} not approved yet ({notApproved.slice(0, 2).map((x) => x.d?.ref).join(", ")}
                {notApproved.length > 2 ? "…" : ""}): linked anyway and shown with its status until approved.
              </p>
            ) : null}
            {without.length ? <p className={cn("mt-2 text-sm", warn)}>Missing for {without.map((r) => r.asset.code).join(", ")}: it goes out without. Create the drafts from the list.</p> : null}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <input ref={fileRef} type="file" multiple hidden onChange={(e) => setFiles((f) => [...f, ...Array.from(e.target.files ?? []).map((x) => x.name)])} />
              <input ref={photoRef} type="file" accept="image/*" multiple hidden onChange={(e) => setPhotos((f) => [...f, ...Array.from(e.target.files ?? []).map((x) => x.name)])} />
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
                <Paperclip className="size-4" /> Add file
              </Button>
              <Button size="sm" variant="outline" onClick={() => photoRef.current?.click()} className="gap-2">
                <ImagePlus className="size-4" /> Add photo
              </Button>
              {[...files, ...photos].map((f, i) => (
                <span key={i} className="inline-flex h-6 items-center rounded-full bg-badge-neutral px-2.5 text-xs font-medium text-badge-neutral-foreground">
                  {f}
                </span>
              ))}
            </div>
          </RdCard>
        </div>

        <div className="flex flex-col gap-6">
          {isPm ? (
            <ScheduleCard b={b} />
          ) : (
            <RdCard title="Due date" padded>
              <RdField label="Due" required className="max-w-[220px]">
                <input data-slot="input" type="date" value={b.date} onChange={(e) => b.setDate(e.target.value)} className={fieldClass} />
              </RdField>
            </RdCard>
          )}
          {isPm && chosen.some((r) => !r.ready) ? <p className={cn("-mt-2 px-1 text-sm", warn)}>The first work order starts two weeks out so the documents in approval or draft can be ready.</p> : null}
          <ChecklistCard b={b} />
        </div>

        <RdCard title={isPm ? "This PM covers" : "This creates"} padded>
          <div className="flex flex-col gap-4">
            <ul className="flex max-h-[260px] min-h-0 flex-col gap-2 overflow-y-auto">
              {chosen.map((r) => {
                const mine = KINDS.filter((t) => b.attach.includes(t) && docOf(store, r.asset.id, t)).length;
                return (
                  <li key={r.asset.id} className="rounded-lg bg-muted px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{r.asset.name}</p>
                    <p className="text-xs font-medium tracking-[0.02em] text-text-subtle">
                      {r.asset.code} · {r.asset.location} · {plural(mine, "document")}
                    </p>
                  </li>
                );
              })}
            </ul>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              {isPm ? (
                <>
                  <dt className="text-muted-foreground">Repeats</dt>
                  <dd className="text-foreground">
                    {everyText(b.every).toLowerCase()}, {b.sched.basis === "fixed" ? "fixed" : "after completion"}
                  </dd>
                  <dt className="text-muted-foreground">First</dt>
                  <dd className="text-foreground">
                    {fmtDate(b.date)}, {b.sched.time}
                  </dd>
                </>
              ) : (
                <>
                  <dt className="text-muted-foreground">Due</dt>
                  <dd className="text-foreground">{fmtDate(b.date)}</dd>
                </>
              )}
              <dt className="text-muted-foreground">Assigned to</dt>
              <dd className="text-foreground">{person(b.assignee).name}</dd>
            </dl>
            <p className="text-sm text-muted-foreground">{isPm ? `One PM for ${plural(chosen.length, "asset")}.` : `${plural(chosen.length, "work order")}, one per asset.`}</p>
            <Button disabled={running || missingRequired} onClick={b.create} className="w-full">
              {running ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Creating
                </>
              ) : isPm ? (
                "Create PM"
              ) : (
                `Create ${plural(chosen.length, "work order")}`
              )}
            </Button>
          </div>
        </RdCard>
      </div>
    </RdPage>
  );
}

// ───────────────────────────── the page

function BenchView({ mode }: { mode: DataMode }) {
  const b = useBench(mode !== "sample");
  const { status } = useLook();
  const { fam, base, shown, chosen, toDraft } = b;
  const ready = base.filter((r) => r.ready).length;
  const withPm = base.filter((r) => r.pm).length;
  const n = chosen.length;

  if (mode === "new") {
    return (
      <div className="h-full overflow-y-auto">
        <RdPage title={PAGE_TITLE} subtitle={SUBTITLE}>
          <NoAssets />
        </RdPage>
      </div>
    );
  }

  if (b.phase === "form" || b.phase === "running") {
    return (
      <div className="h-full overflow-y-auto">
        <FormStep b={b} />
      </div>
    );
  }

  return (
    <RdPage fill title={PAGE_TITLE} subtitle={SUBTITLE}>
      <div className="grid min-h-0 flex-1 grid-cols-[192px_minmax(0,1fr)] gap-6 xl:grid-cols-[216px_minmax(0,1fr)] xl:gap-8">
        <Nav b={b} />
        <section className="flex min-h-0 flex-col gap-4">
          <ListHeading title={`${fam.label}: on which assets?`} line={`${ready} of ${base.length} assets have the documents for this job · ${withPm} have a PM`}>
            <div className="relative w-full sm:w-[280px]">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input type="search" value={b.filter} onChange={(e) => b.setFilter(e.target.value)} placeholder="Asset name, code or location" aria-label="Filter the assets" className="h-8 pr-3 pl-8" />
            </div>
          </ListHeading>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border">
            <ColumnHeads b={b} />
            {shown.length ? (
              <BenchDnd onMove={(assetId, type, level) => b.store.setLevel(fam.id, assetId, type as Kind, level === "required" ? "required" : "recommended")}>
                <ul>
                  {shown.map((r) => (
                    <Row key={r.asset.id} b={b} r={r} />
                  ))}
                </ul>
              </BenchDnd>
            ) : (
              <RdEmptyState icon={Search} title={`No asset matches “${b.filter}”`} body="Try part of the name, the code or the location." />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {status ? (
              <StatusLegend />
            ) : (
              <span className="text-sm text-muted-foreground">
                {n ? `${plural(n, "asset")} selected${toDraft.length ? ` · ${plural(toDraft.length, "document")} missing or expired` : ""}` : "Tick one or more assets"}
              </span>
            )}
            <span className="flex flex-wrap items-center gap-2">
              {status && n ? <span className="text-sm text-muted-foreground">{plural(n, "asset")} selected</span> : null}
              {toDraft.length ? (
                <Button variant="outline" disabled={b.creating.length > 0} title="Starts the documents from the asset's name and what the AI knows. You finish them on the document page." onClick={b.createDrafts} className="gap-2">
                  {b.creating.length ? <Loader2 className="size-4 animate-spin" /> : <FilePen className="size-4" />} Create {plural(toDraft.length, "draft document")}
                </Button>
              ) : null}
              <Button variant="outline" disabled={!n} onClick={() => b.openForm("pm")}>
                Create PM
              </Button>
              <Button disabled={!n} onClick={() => b.openForm("wo")}>
                Create work order
              </Button>
            </span>
          </div>
        </section>
      </div>
      <CreatedToast t={b.toast} close={() => b.setToast(null)} />
    </RdPage>
  );
}

/** The list and the form. `links` shows each document's ID as a link; `calm` uses gray instead of yellow for what needs action; `status` colors each document by its status (no words, with a legend) and `hue` picks green or blue for approved. */
export function Bench({ links = false, calm = false, status = false, hue = "green", mode = "sample" }: { links?: boolean; calm?: boolean; status?: boolean; hue?: "green" | "blue"; mode?: DataMode }) {
  return (
    <LookContext.Provider value={{ links, calm, status, hue }}>
      {/* A new store for each plant: the empty account keeps its own drafts and work orders. */}
      <BenchView key={mode} mode={mode} />
    </LookContext.Provider>
  );
}
