"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { person } from "@/lib/three-cases/data";
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
  type Priority,
  type Rec,
  type RowStatus,
  type Schedule,
  type Unit,
} from "@/lib/three-cases/real-jobs";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, FilePen, ImagePlus, Loader2, Paperclip, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CountBar, DocPill, LookContext, PmCell, ReadyTag, StatusLegend, okDot, plural, useLook, warnText } from "./bench-parts";
import { useMeterFinish } from "./meter";

type Phase = "pick" | "form" | "running";
interface Toast {
  title: string;
  line: string;
  ref: string;
  kind: Rec["kind"] | "draft";
}

const COLS = "grid-cols-[20px_minmax(150px,0.9fr)_minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_104px]";

function useBench() {
  const store = useRealStore();
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

  const fams = allFamilies(store);
  const fam = fams.find((f) => f.id === famId) ?? fams[0];
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
        kind: "draft",
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
        kind,
        ref: made.length > 1 ? `${made[0].ref} to ${made[made.length - 1].ref}` : first.ref,
        title: made.length > 1 ? `${made.length} work orders created` : kind === "pm" ? "PM created" : "Work order created",
        line: kind === "pm" ? `${first.title} · ${everyText(every).toLowerCase()} from ${fmtDate(date)}` : `${first.title} · due ${fmtDate(date)}`,
      });
      setPicked([]);
      setPhase("pick");
      finish?.();
    }, 400);
  };

  return { store, fam, fams, famId, switchFam, picked, toggle, toggleAll, filter, setFilter, base, shown, chosen, toDraft, creating, createDrafts, phase, setPhase, kind, openForm, title, setTitle, assignee, setAssignee, priority, setPriority, category, setCategory, hours, setHours, signature, setSignature, date, setDate, every, setEvery, attach, setAttach, sched, setSched, checklist, setChecklist, generated, setGenerated, create, toast, setToast };
}
type B = ReturnType<typeof useBench>;

// ───────────────────────────── jobs on the left (no scroll)

function Nav({ b }: { b: B }) {
  const { store, fam, fams } = b;
  const { calm, hue } = useLook();
  const [adding, setAdding] = useState(false);

  const item = (f: Family) => {
    const on = f.id === fam.id;
    return (
      <div key={f.id} className={cn("group flex items-center gap-1 rounded-lg px-2.5 py-1.5", on ? "bg-indigo-50" : "hover:bg-gray-50")}>
        <button title={`${f.hint} · ${f.rhythm}`} onClick={() => b.switchFam(f.id)} className="flex min-w-0 flex-1 flex-wrap items-center text-left">
          <span className={cn("truncate text-sm leading-5", on ? "font-medium text-indigo-900" : "text-gray-800")}>{f.label}</span>
          <CountBar rows={rowsFor(store, f)} />
        </button>
        {f.custom ? (
          <button
            onClick={() => {
              store.removeFamily(f.id);
              if (on) b.switchFam("inspect");
            }}
            aria-label={`Delete ${f.label}`}
            title="Delete this job"
            className="mt-0.5 shrink-0 text-gray-300 opacity-0 hover:text-gray-600 group-hover:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <nav className="flex min-h-0 flex-col justify-between gap-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2">
      <div>
        {GROUPS.map((g) => (
          <div key={g.id}>
            <div className="px-2.5 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{g.label}</div>
            {fams.filter((f) => f.group === g.id && !f.custom).map(item)}
          </div>
        ))}
        {fams.some((f) => f.custom) ? (
          <div>
            <div className="px-2.5 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Added by you</div>
            {fams.filter((f) => f.custom).map(item)}
          </div>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 px-2.5 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className={cn("size-1.5 rounded-full", okDot(hue))} /> documents ready
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={cn("size-1.5 rounded-full", calm ? "bg-gray-400" : "bg-amber-400")} /> need action
          </span>
        </div>
        <button onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-sm text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-700">
          <Plus className="size-4" /> New job
        </button>
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
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New job</DialogTitle>
          <DialogDescription>Name the job. The documents it needs come from each asset: the ones the asset already has.</DialogDescription>
        </DialogHeader>
        <label className="block text-xs font-medium text-gray-600">
          Name
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Calibrate the scale" className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm font-normal outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
        </label>
        <DialogFooter>
          <Button variant="ghost" onClick={close}>
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

function ColumnHeads() {
  return (
    <div className={cn("sticky top-0 z-10 grid items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400", COLS)}>
      <span />
      <span>Asset</span>
      <span>Required documents</span>
      <span>Optional</span>
      <span>PM and work orders</span>
      <span />
    </div>
  );
}

function Row({ b, r }: { b: B; r: RowStatus }) {
  const a = r.asset;
  const on = b.picked.includes(a.id);
  const id = `cb-${b.fam.id}-${a.id}`;
  const required = r.needs.filter((n) => n.level === "required");
  // Optional documents only show when the asset has them: there is nothing to act on for the others.
  const optional = r.needs.filter((n) => n.level === "recommended" && n.state !== "missing");
  return (
    <li className={cn("group border-b border-gray-100", on && "bg-indigo-50/40")}>
      <div className={cn("grid items-start gap-3 px-4 py-2.5", COLS)}>
        <input id={id} type="checkbox" checked={on} onChange={() => b.toggle(a.id)} className="mt-0.5 size-4 accent-indigo-600" />
        <div className="min-w-0">
          <label htmlFor={id} className="block cursor-pointer truncate text-sm font-medium text-gray-900">
            {a.name}
          </label>
          <div className="truncate text-xs text-gray-500">
            <span className="font-mono text-[11px] text-gray-400">{a.code}</span> · {a.location}
          </div>
          <div className="mt-1">
            <ReadyTag r={r} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {required.length ? required.map((n) => <DocPill key={n.type} n={n} creating={b.creating.includes(`${a.id}|${n.type}`)} />) : <span className="text-xs text-gray-400">None required</span>}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {optional.length ? optional.map((n) => <DocPill key={n.type} n={n} creating={b.creating.includes(`${a.id}|${n.type}`)} />) : <span className="text-xs text-gray-300">None</span>}
        </div>
        <PmCell r={r} />
        <div className="flex flex-col items-end gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <button onClick={() => b.openForm("wo", [a.id])} className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-700">
            New work order
          </button>
          <button onClick={() => b.openForm("pm", [a.id])} className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-700">
            New PM
          </button>
        </div>
      </div>
    </li>
  );
}

// ───────────────────────────── PM / work order form

const UNITS: Unit[] = ["day", "week", "month", "year"];
const inputCls = "h-8 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";

/** A labelled field. `group` uses a plain wrapper for rows of several controls, so buttons do not take the whole label as their name. */
function Field({ label, required, children, className, group }: { label: string; required?: boolean; children: React.ReactNode; className?: string; group?: boolean }) {
  const Tag = group ? "div" : "label";
  return (
    <Tag className={cn("block text-xs font-medium text-gray-600", className)}>
      {label}
      {required ? <span title="Required" className="ml-0.5 text-gray-400">*</span> : null}
      <span className="mt-0.5 block">{children}</span>
    </Tag>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {hint ? <span className="truncate text-xs text-gray-500">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

const CREATE_UNITS = ["hours", "days", "weeks"] as const;
const TIMES = ["06:00", "07:00", "08:00", "09:00", "12:00", "17:00"];

/** The segmented choice used for fixed schedule vs after completion. */
function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <span className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className={cn("flex-1 rounded-md px-2 py-1 text-xs", value === o.value ? "bg-white font-medium text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900")}>
          {o.label}
        </button>
      ))}
    </span>
  );
}

/** What the CMMS lets a calendar PM do: fixed schedule or after completion, how often, at what time, when the work order is created, and the periods it pauses. */
function ScheduleCard({ b }: { b: B }) {
  const { sched, setSched } = b;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ fm: 6, fd: 1, tm: 8, td: 31 });
  const set = (p: Partial<Schedule>) => setSched({ ...sched, ...p });
  const dayInput = (v: number, on: (n: number) => void, label: string) => <input aria-label={label} type="number" min={1} max={31} value={v} onChange={(e) => on(Math.min(31, Math.max(1, Number(e.target.value) || 1)))} className={cn(inputCls, "w-14 px-2")} />;
  const monthSelect = (v: number, on: (n: number) => void, label: string) => (
    <select aria-label={label} value={v} onChange={(e) => on(Number(e.target.value))} className={cn(inputCls, "w-[72px] px-2")}>
      {MONTHS.map((m, i) => (
        <option key={m} value={i + 1}>
          {m}
        </option>
      ))}
    </select>
  );
  return (
    <Card title="Schedule">
      <div className="space-y-2">
        <Field label="Repeats" required group>
          <Segmented<Basis>
            value={sched.basis}
            onChange={(v) => set({ basis: v })}
            options={[
              { value: "fixed", label: "Fixed schedule" },
              { value: "completion", label: "After completion" },
            ]}
          />
        </Field>
        <p className="-mt-1 text-[11px] text-gray-500">{sched.basis === "fixed" ? "Due on the same dates, even if the last one was late." : "The next one is due after the last one is completed."}</p>
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <Field label="Every" required group>
            <span className="flex gap-2">
              <input type="number" min={1} value={b.every.n} onChange={(e) => b.setEvery({ ...b.every, n: Math.max(1, Number(e.target.value) || 1) })} className={cn(inputCls, "w-14")} />
              <select value={b.every.unit} onChange={(e) => b.setEvery({ ...b.every, unit: e.target.value as Unit })} className={inputCls}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}s
                  </option>
                ))}
              </select>
            </span>
          </Field>
          <Field label="Due time">
            <select value={sched.time} onChange={(e) => set({ time: e.target.value })} className={inputCls}>
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="First work order due" required className="col-span-2">
            <input type="date" value={b.date} onChange={(e) => b.setDate(e.target.value)} className={cn(inputCls, "max-w-[180px]")} />
          </Field>
        </div>
        <Field label="Create the work order" group>
          <span className="flex flex-wrap items-center gap-2 text-xs font-normal text-gray-600">
            <select value={sched.create.mode} onChange={(e) => set({ create: e.target.value === "before" ? { mode: "before", n: 1, unit: "days" } : { mode: "weekday", day: "Wednesday", time: "08:00" } })} className={cn(inputCls, "w-auto")}>
              <option value="before">Before due</option>
              <option value="weekday">On a weekday</option>
            </select>
            {sched.create.mode === "before" ? (
              <>
                <input aria-label="Amount before due" type="number" min={0} value={sched.create.n} onChange={(e) => set({ create: { ...sched.create, mode: "before", n: Math.max(0, Number(e.target.value) || 0), unit: sched.create.mode === "before" ? sched.create.unit : "days" } })} className={cn(inputCls, "w-14")} />
                <select aria-label="Unit before due" value={sched.create.unit} onChange={(e) => set({ create: { mode: "before", n: sched.create.mode === "before" ? sched.create.n : 1, unit: e.target.value as "hours" | "days" | "weeks" } })} className={cn(inputCls, "w-auto")}>
                  {CREATE_UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <select aria-label="Weekday" value={sched.create.day} onChange={(e) => set({ create: { mode: "weekday", day: e.target.value, time: sched.create.mode === "weekday" ? sched.create.time : "08:00" } })} className={cn(inputCls, "w-auto")}>
                  {WEEKDAYS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                at
                <select aria-label="Time" value={sched.create.time} onChange={(e) => set({ create: { mode: "weekday", day: sched.create.mode === "weekday" ? sched.create.day : "Wednesday", time: e.target.value } })} className={cn(inputCls, "w-auto")}>
                  {TIMES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </>
            )}
          </span>
        </Field>
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-gray-600">
            <span title="Months and days of the year when no work order is created" className="">Inactive periods</span>
            {!adding ? (
              <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline">
                <Plus className="size-3.5" /> Add period
              </button>
            ) : null}
          </div>
          {sched.inactive.length ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {sched.inactive.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  {fmtMonthDay(p.from)} to {fmtMonthDay(p.to)}
                  <button type="button" aria-label="Remove period" onClick={() => set({ inactive: sched.inactive.filter((_, j) => j !== i) })} className="text-gray-400 hover:text-gray-700">
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          {adding ? (
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
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
              <button type="button" onClick={() => setAdding(false)} className="text-gray-500 hover:text-gray-800">
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
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
    <Card title="Checklist" hint="The steps the technician ticks off">
      <div className="space-y-1.5">
        <select aria-label="Checklist" value={b.checklist} onChange={(e) => b.setChecklist(e.target.value)} className={inputCls}>
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
          <ol className="space-y-0.5 pl-1 text-xs text-gray-600">
            {picked.items.slice(0, 4).map((it, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-gray-400">{i + 1}.</span>
                <span className="truncate">{it}</span>
              </li>
            ))}
            {picked.items.length > 4 ? <li className="pl-4 text-gray-400">and {picked.items.length - 4} more</li> : null}
          </ol>
        ) : (
          <p className="px-1 text-xs text-gray-500">The work order goes out without steps to tick.</p>
        )}
        <Button size="sm" variant="outline" disabled={making} onClick={generate} title="Builds a new checklist from the asset and its documents">
          {making ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Sparkles className="mr-1 size-4" />} Create a new one with AI
        </Button>
      </div>
    </Card>
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
  const notApproved = chosen.flatMap((r) => KINDS.filter((t) => b.attach.includes(t)).map((t) => ({ r, t, d: docOf(store, r.asset.id, t) })).filter((x) => x.d && x.d.state !== "valid"));
  const without = chosen.filter((r) => r.action.some((n) => n.state === "missing"));
  const missingRequired = !b.title.trim() || (isPm && !description.trim());

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <button onClick={() => b.setPhase("pick")} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50" aria-label="Back to the assets">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h2 className="text-base font-semibold leading-5 text-gray-900">{isPm ? "New preventive maintenance" : "New work order"}</h2>
          <p className="text-xs text-gray-500">{b.fam.label}: filled in from the job and the assets. Fields with * are required.</p>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px] content-start gap-3">
        <div className="space-y-3">
          <Card title="Details">
            <div className="space-y-2">
              <Field label="Title" required>
                <input value={b.title} onChange={(e) => b.setTitle(e.target.value)} className={cn(inputCls, "font-medium")} />
              </Field>
              <Field label="Description" required={isPm}>
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={isPm ? "" : "Optional"} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Category">
                  <select value={b.category} onChange={(e) => b.setCategory(e.target.value)} className={inputCls}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Assigned to">
                  <select value={b.assignee} onChange={(e) => b.setAssignee(e.target.value)} className={inputCls}>
                    {ASSIGNEES.map((p) => (
                      <option key={p} value={p}>
                        {person(p).name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority" required={!isPm} group>
                  <Segmented<Priority>
                    value={b.priority}
                    onChange={b.setPriority}
                    options={(["low", "medium", "high"] as Priority[]).map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
                  />
                </Field>
                <Field label="Estimated time">
                  <span className="relative block">
                    <input type="number" min={0} step={0.5} value={b.hours} onChange={(e) => b.setHours(Math.max(0, Number(e.target.value) || 0))} className={cn(inputCls, "pr-8")} />
                    <span className="pointer-events-none absolute right-3 top-1.5 text-sm text-gray-400">h</span>
                  </span>
                </Field>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5">
                <span>
                  <span className="block text-sm font-medium text-gray-900">Requires signature</span>
                  <span className="block text-xs text-gray-500">The technician signs when completing it</span>
                </span>
                <Switch aria-label="Requires signature" checked={b.signature} onCheckedChange={b.setSignature} />
              </div>
            </div>
          </Card>

          <Card title="Documents, files and photos">
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((t) => {
                const list = have(t);
                const on = b.attach.includes(t);
                const none = list.length === 0;
                const unsure = list.some((r) => docOf(store, r.asset.id, t)?.state !== "valid");
                return (
                  <label key={t} title={none ? `No ${KIND_LABEL[t]} for ${chosen.length === 1 ? "this asset" : "these assets"} yet` : KIND_LABEL[t]} className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition", none ? "cursor-not-allowed border-dashed border-gray-200 text-gray-300" : on ? "cursor-pointer border-indigo-300 bg-indigo-50 text-indigo-900" : "cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50")}>
                    <input type="checkbox" disabled={none} checked={on && !none} onChange={() => b.setAttach(on ? b.attach.filter((x) => x !== t) : [...b.attach, t])} className="size-3.5 accent-indigo-600" />
                    <span className="font-medium">{KIND_SHORT[t]}</span>
                    <span className={cn(none ? "text-gray-300" : "text-gray-500")}>{none ? "none" : chosen.length === 1 ? docOf(store, chosen[0].asset.id, t)?.ref : `${list.length} of ${chosen.length}`}</span>
                    {unsure && !none ? <span className={cn("size-1.5 rounded-full", calm ? "bg-gray-400" : "bg-amber-400")} title="Not approved yet" /> : null}
                  </label>
                );
              })}
            </div>
            {notApproved.length ? <p className={cn("mt-1.5 text-xs", warn)}>{plural(notApproved.length, "document")} not approved yet ({notApproved.slice(0, 2).map((x) => x.d?.ref).join(", ")}{notApproved.length > 2 ? "…" : ""}): linked anyway and shown with its status until approved.</p> : null}
            {without.length ? <p className={cn("mt-1 text-xs", warn)}>Missing for {without.map((r) => r.asset.code).join(", ")}: it goes out without. Create the drafts from the list.</p> : null}
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2">
              <input ref={fileRef} type="file" multiple hidden onChange={(e) => setFiles((f) => [...f, ...Array.from(e.target.files ?? []).map((x) => x.name)])} />
              <input ref={photoRef} type="file" accept="image/*" multiple hidden onChange={(e) => setPhotos((f) => [...f, ...Array.from(e.target.files ?? []).map((x) => x.name)])} />
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                <Paperclip className="mr-1 size-4" /> Add file
              </Button>
              <Button size="sm" variant="outline" onClick={() => photoRef.current?.click()}>
                <ImagePlus className="mr-1 size-4" /> Add photo
              </Button>
              {[...files, ...photos].map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  {f}
                </span>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {isPm ? (
            <ScheduleCard b={b} />
          ) : (
            <Card title="Due date">
              <div className="max-w-[200px]">
                <Field label="Due" required>
                  <input type="date" value={b.date} onChange={(e) => b.setDate(e.target.value)} className={inputCls} />
                </Field>
              </div>
            </Card>
          )}
          {isPm && chosen.some((r) => !r.ready) ? <p className={cn("-mt-1 px-1 text-xs", warn)}>The first work order starts two weeks out so the documents in approval or draft can be ready.</p> : null}
          <ChecklistCard b={b} />
        </div>

        <aside className="flex min-h-0 flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-gray-900">{isPm ? "This PM covers" : "This creates"}</h3>
          <ul className="max-h-[260px] min-h-0 space-y-1.5 overflow-y-auto">
            {chosen.map((r) => {
              const mine = KINDS.filter((t) => b.attach.includes(t) && docOf(store, r.asset.id, t)).length;
              return (
                <li key={r.asset.id} className="rounded-lg bg-gray-50 px-3 py-1.5">
                  <div className="text-sm font-medium text-gray-900">{r.asset.name}</div>
                  <div className="text-xs text-gray-500">
                    <span className="font-mono text-[11px]">{r.asset.code}</span> · {r.asset.location} · {plural(mine, "document")}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="space-y-0.5 border-t border-gray-100 pt-2 text-xs text-gray-600">
            {isPm ? (
              <>
                <div>
                  <span className="text-gray-500">Repeats</span> {everyText(b.every).toLowerCase()}, {b.sched.basis === "fixed" ? "fixed" : "after completion"}
                </div>
                <div>
                  <span className="text-gray-500">First work order</span> {fmtDate(b.date)}, {b.sched.time}
                </div>
                <div className="text-gray-500">One PM for {plural(chosen.length, "asset")}.</div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-gray-500">Due</span> {fmtDate(b.date)}
                </div>
                <div className="text-gray-500">{plural(chosen.length, "work order")}, one per asset.</div>
              </>
            )}
            <div>
              <span className="text-gray-500">Assigned to</span> {person(b.assignee).name}
            </div>
          </div>
          <Button disabled={running || missingRequired} onClick={b.create} className="mt-auto w-full">
            {running ? (
              <>
                <Loader2 className="mr-1.5 size-4 animate-spin" /> Creating
              </>
            ) : isPm ? (
              "Create PM"
            ) : (
              `Create ${plural(chosen.length, "work order")}`
            )}
          </Button>
        </aside>
      </div>
    </div>
  );
}

/** A card that comes up from the corner: what was created, with the link. It does not hide the list. */
function ToastCard({ b }: { b: B }) {
  const t = b.toast;
  if (!t) return null;
  return (
    <div role="status" className="fixed bottom-6 right-6 z-50 w-80 animate-in slide-in-from-bottom-4 fade-in rounded-xl border border-gray-200 bg-white p-4 shadow-xl duration-300">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900">{t.title}</div>
          <div className="truncate text-xs text-gray-500">{t.line}</div>
          <button title={`Opens the ${t.kind === "pm" ? "PM" : t.kind === "wo" ? "work order" : "document"} inside Safety (not part of this prototype)`} className="mt-1.5 text-xs font-medium text-indigo-700 hover:underline">
            Open {t.ref}
          </button>
        </div>
        <button onClick={() => b.setToast(null)} aria-label="Close" className="text-gray-400 hover:text-gray-700">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────── the page

function BenchView() {
  const b = useBench();
  const { status } = useLook();
  const { fam, base, shown, chosen, toDraft } = b;
  const ready = base.filter((r) => r.ready).length;
  const withPm = base.filter((r) => r.pm).length;
  const n = chosen.length;

  if (b.phase === "form" || b.phase === "running") return <FormStep b={b} />;

  return (
    <div className="grid h-full min-h-0 grid-cols-[260px_minmax(0,1fr)] gap-3">
      <Nav b={b} />
      <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-900">{fam.label}: on which assets?</h2>
          <p className="text-xs text-gray-500">
            Documents: {ready} ready, {base.length - ready} {base.length - ready === 1 ? "needs" : "need"} action · {withPm} of {base.length} have a PM
          </p>
        </div>
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-1.5">
          <Search className="size-4 text-gray-400" />
          <input value={b.filter} onChange={(e) => b.setFilter(e.target.value)} placeholder="Asset name, code or location: FL-, Haas, Utility" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
          {status && n ? <span className="text-xs text-gray-500">{n} selected</span> : null}
          {shown.length > 1 ? (
            <button onClick={b.toggleAll} className="text-xs font-medium text-indigo-700 hover:underline">
              {shown.every((r) => b.picked.includes(r.asset.id)) ? "Untick all" : `Tick all ${shown.length}`}
            </button>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ColumnHeads />
          {shown.length ? (
            <ul>
              {shown.map((r) => (
                <Row key={r.asset.id} b={b} r={r} />
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500">No asset matches “{b.filter}”</div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-4 py-2.5">
          {status ? (
            <StatusLegend />
          ) : (
            <span className="text-xs text-gray-500">
              {n ? `${plural(n, "asset")} selected${toDraft.length ? ` · ${plural(toDraft.length, "document")} missing or expired` : ""}` : "Tick one or more assets"}
            </span>
          )}
          <span className="flex items-center gap-2">
            {toDraft.length ? (
              <Button size="sm" variant="outline" disabled={b.creating.length > 0} title="Starts the documents from the asset's name and what the AI knows. You finish them on the document page." onClick={b.createDrafts}>
                {b.creating.length ? <Loader2 className="mr-1 size-4 animate-spin" /> : <FilePen className="mr-1 size-4" />} Create {plural(toDraft.length, "draft document")}
              </Button>
            ) : null}
            <Button size="sm" variant="outline" disabled={!n} onClick={() => b.openForm("pm")}>
              Create PM
            </Button>
            <Button size="sm" disabled={!n} onClick={() => b.openForm("wo")}>
              Create work order
            </Button>
          </span>
        </div>
      </div>
      <ToastCard b={b} />
    </div>
  );
}

/** The list and the form. `links` shows each document's ID as a link; `calm` uses gray instead of yellow for what needs action; `status` colors each document by its status (no words, with a legend) and `hue` picks green or blue for approved. */
export function Bench({ links = false, calm = false, status = false, hue = "green" }: { links?: boolean; calm?: boolean; status?: boolean; hue?: "green" | "blue" }) {
  return (
    <LookContext.Provider value={{ links, calm, status, hue }}>
      <BenchView />
    </LookContext.Provider>
  );
}
