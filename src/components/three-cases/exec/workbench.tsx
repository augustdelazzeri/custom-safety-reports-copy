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
  PRIORITY_LABEL,
  allFamilies,
  dateIn,
  defaultCategory,
  docOf,
  everyText,
  fmtDate,
  getAsset,
  rowsFor,
  tasksFor,
  woTitleFor,
  useRealStore,
  type Doc,
  type Every,
  type Family,
  type Kind,
  type Level,
  type Priority,
  type Rec,
  type RowStatus,
  type Unit,
} from "@/lib/three-cases/real-jobs";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, FilePen, ImagePlus, Loader2, Paperclip, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CountBar, DocPill, PermitPill, PmCell, ReadyTag, plural } from "./bench-parts";
import { useMeterFinish } from "./meter";

type Phase = "pick" | "form" | "running";
interface Toast {
  title: string;
  line: string;
  ref: string;
  kind: Rec["kind"];
}

const COLS = "grid-cols-[20px_minmax(150px,0.9fr)_minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,1.1fr)]";

function useBench() {
  const store = useRealStore();
  const finish = useMeterFinish();
  const [famId, setFamId] = useState("inspect");
  const [picked, setPicked] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [phase, setPhase] = useState<Phase>("pick");
  const [kind, setKind] = useState<Rec["kind"]>("pm");
  const [drafts, setDrafts] = useState<{ assetId: string; doc: Doc }[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);

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
    setDrafts([]);
    setPhase("pick");
  };
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleAll = () => {
    const all = shown.map((r) => r.asset.id);
    setPicked((p) => (all.every((i) => p.includes(i)) ? p.filter((i) => !all.includes(i)) : Array.from(new Set([...p, ...all]))));
  };

  /** Starts one draft per missing document, named after the asset. The person finishes them on the document page. */
  const createDrafts = () => setDrafts(store.createDrafts(toDraft));

  /** Opens the form with what a PM or work order for these assets would most likely need, so one click is enough. */
  const openForm = (k: Rec["kind"]) => {
    const one = chosen.length === 1 ? woTitleFor(fam, chosen[0].asset) : `${fam.label.split(" / ")[0]} · ${plural(chosen.length, "asset")}`;
    // The documents of the job that these assets have, in any state: they attach now or when approved.
    const have = KINDS.filter((t) => chosen.some((r) => r.needs.some((n) => n.type === t && n.state !== "missing")));
    // Almost every safety work order carries a checklist, so it is on whenever an asset has one.
    const inPackage = have.filter((t) => t === "checklist" || chosen.some((r) => r.needs.some((n) => n.type === t)));
    setKind(k);
    setTitle(one);
    setEvery(fam.every);
    setCategory(defaultCategory(fam.id));
    setHours(fam.id === "inspect" ? 1 : 2);
    setSignature(false);
    // Documents still in approval need time: a PM starts two weeks out when something is not valid yet.
    setDate(dateIn(k === "pm" && chosen.some((r) => !r.ready) ? 14 : 1));
    setAttach(inPackage);
    setDrafts([]);
    setPhase("form");
  };

  const create = () => {
    setPhase("running");
    setTimeout(() => {
      const made = store.createRecs({ kind, title, assetIds: chosen.map((r) => r.asset.id), famId: fam.id, assigneeId: assignee, priority, category, hours, signature, date, every: kind === "pm" ? every : undefined, attach });
      const first = made[0];
      setToast({
        kind,
        ref: made.length > 1 ? `${made[0].ref} to ${made[made.length - 1].ref}` : first.ref,
        title: made.length > 1 ? `${made.length} work orders created` : kind === "pm" ? "PM created" : "Work order created",
        line: kind === "pm" ? `${first.title} · ${everyText(every).toLowerCase()} from ${fmtDate(date)}` : `${first.title} · due ${fmtDate(date)}`,
      });
      setTimeout(() => setToast(null), 9000);
      setPicked([]);
      setPhase("pick");
      finish?.();
    }, 400);
  };

  return { store, fam, fams, famId, switchFam, picked, toggle, toggleAll, filter, setFilter, base, shown, chosen, toDraft, drafts, createDrafts, phase, setPhase, kind, openForm, title, setTitle, assignee, setAssignee, priority, setPriority, category, setCategory, hours, setHours, signature, setSignature, date, setDate, every, setEvery, attach, setAttach, create, toast, setToast };
}
type B = ReturnType<typeof useBench>;

// ───────────────────────────── jobs on the left (no scroll)

function Nav({ b }: { b: B }) {
  const { store, fam, fams } = b;
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
      <div className="flex items-center gap-3 px-2.5 pt-1 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-emerald-500" /> documents ready
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-amber-400" /> need action
        </span>
      </div>
      <button onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-sm text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-700">
        <Plus className="size-4" /> New job
      </button>
      <NewJobDialog b={b} open={adding} onOpenChange={setAdding} />
    </nav>
  );
}

const KIND_HINT: Record<Kind, string> = {
  checklist: "The tasks the technician checks off",
  jha: "Job hazard analysis",
  sop: "Standard operating procedure",
  loto: "Lockout/tagout for the equipment",
  sds: "Safety data sheet for chemicals",
};

/** A job is a name and the documents it requires. Everything else stays optional. */
function NewJobDialog({ b, open, onOpenChange }: { b: B; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const [required, setRequired] = useState<Kind[]>([]);
  const close = () => {
    setName("");
    setRequired([]);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New job</DialogTitle>
          <DialogDescription>Name the job and choose which documents it requires. Every other document stays optional.</DialogDescription>
        </DialogHeader>
        <label className="block text-xs font-medium text-gray-600">
          Name
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Calibrate the scale" className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm font-normal outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
        </label>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-gray-600">
            Documents <span className="font-normal text-gray-400">Required</span>
          </div>
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {KINDS.map((t) => (
              <li key={t} className="flex items-center justify-between gap-3 px-3 py-2">
                <span>
                  <span className="block text-sm font-medium text-gray-900">{KIND_LABEL[t]}</span>
                  <span className="block text-xs text-gray-500">{KIND_HINT[t]}</span>
                </span>
                <Switch aria-label={`${KIND_LABEL[t]} is required`} checked={required.includes(t)} onCheckedChange={(on) => setRequired((r) => (on ? [...r, t] : r.filter((x) => x !== t)))} />
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              const id = b.store.addFamily(name.trim(), KINDS.map((type) => ({ type, level: (required.includes(type) ? "required" : "recommended") as Level })));
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
    <li className={cn("border-b border-gray-100", on && "bg-indigo-50/40")}>
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
          {required.length ? required.map((n) => <DocPill key={n.type} n={n} />) : <span className="text-xs text-gray-400">None required</span>}
          {r.permits.map((p) => (
            <PermitPill key={p} type={p} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {optional.length ? optional.map((n) => <DocPill key={n.type} n={n} />) : <span className="text-xs text-gray-300">None</span>}
        </div>
        <PmCell r={r} />
      </div>
    </li>
  );
}

/** What the AI started: drafts named after the asset, to be finished on the document page. */
function DraftsStrip({ b }: { b: B }) {
  if (!b.drafts.length) return null;
  return (
    <div className="flex items-start gap-2 border-b border-indigo-100 bg-indigo-50/60 px-4 py-2 text-xs text-indigo-950">
      <FilePen className="mt-0.5 size-4 shrink-0 text-indigo-600" />
      <div className="min-w-0 flex-1">
        <span className="font-medium">{plural(b.drafts.length, "draft")} created.</span> Finish each one on its document page: edit it, choose the approvers and send it for approval.
        <div className="mt-1 flex flex-wrap gap-1">
          {b.drafts.map((d) => (
            <span key={`${d.assetId}${d.doc.type}`} title="Opens the document page (not part of this prototype)" className="rounded border border-indigo-200 bg-white px-1.5 py-px font-mono text-[11px] text-indigo-800">
              {d.doc.ref} · {getAsset(d.assetId)?.code}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── PM / work order form

const UNITS: Unit[] = ["day", "week", "month"];
const inputCls = "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block text-xs font-medium text-gray-600", className)}>
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function FormStep({ b }: { b: B }) {
  const { store, chosen, kind, phase } = b;
  const running = phase === "running";
  const isPm = kind === "pm";
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<string[]>(() => tasksFor(b.fam.id));
  const [files, setFiles] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Every type of document the chosen assets have, the job's own first.
  const inJob = (t: Kind) => chosen.some((r) => r.needs.some((n) => n.type === t));
  const types = KINDS.filter((t) => chosen.some((r) => docOf(store, r.asset.id, t) !== undefined)).sort((x, y) => Number(inJob(y)) - Number(inJob(x)));
  const waiting = chosen.flatMap((r) => r.needs.filter((n) => b.attach.includes(n.type) && n.state !== "valid" && n.state !== "missing"));
  const without = chosen.filter((r) => r.action.some((n) => n.state === "missing"));

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center gap-2">
        <button onClick={() => b.setPhase("pick")} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50" aria-label="Back to the assets">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{isPm ? "New preventive maintenance" : "New work order"}</h2>
          <p className="text-xs text-gray-500">{b.fam.label}: filled in from the job and the assets. Change what you need, then create.</p>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-3">
        <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
          <Card title="Details">
            <div className="space-y-3">
              <Field label="Title">
                <input value={b.title} onChange={(e) => b.setTitle(e.target.value)} className={cn(inputCls, "h-10 text-base font-medium")} />
              </Field>
              <Field label="Description">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional" className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              </Field>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
                <Field label="Estimated time">
                  <span className="relative block">
                    <input type="number" min={0} step={0.5} value={b.hours} onChange={(e) => b.setHours(Math.max(0, Number(e.target.value) || 0))} className={cn(inputCls, "pr-9")} />
                    <span className="pointer-events-none absolute right-3 top-2 text-sm text-gray-400">h</span>
                  </span>
                </Field>
                <Field label="Priority">
                  <span className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                    {(["low", "medium", "high"] as Priority[]).map((p) => (
                      <button key={p} onClick={() => b.setPriority(p)} className={cn("flex-1 rounded-md px-1 py-1.5 text-xs", b.priority === p ? "bg-white font-medium text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900")}>
                        {PRIORITY_LABEL[p]}
                      </button>
                    ))}
                  </span>
                </Field>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span>
                  <span className="block text-sm font-medium text-gray-900">Requires signature</span>
                  <span className="block text-xs text-gray-500">The technician signs when completing the work order</span>
                </span>
                <Switch aria-label="Requires signature" checked={b.signature} onCheckedChange={b.setSignature} />
              </div>
            </div>
          </Card>

          <Card title={isPm ? "Schedule" : "Due date"}>
            {isPm ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="First work order">
                  <input type="date" value={b.date} onChange={(e) => b.setDate(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Repeats every">
                  <span className="flex gap-2">
                    <input type="number" min={1} value={b.every.n} onChange={(e) => b.setEvery({ ...b.every, n: Math.max(1, Number(e.target.value) || 1) })} className={cn(inputCls, "w-20")} />
                    <select value={b.every.unit} onChange={(e) => b.setEvery({ ...b.every, unit: e.target.value as Unit })} className={inputCls}>
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}s
                        </option>
                      ))}
                    </select>
                  </span>
                </Field>
                {chosen.some((r) => !r.ready) ? <p className="col-span-2 text-xs text-amber-900">Starts two weeks out so the documents in approval or draft can be ready. Change it if you prefer.</p> : null}
              </div>
            ) : (
              <div className="max-w-xs">
                <Field label="Due">
                  <input type="date" value={b.date} onChange={(e) => b.setDate(e.target.value)} className={inputCls} />
                </Field>
              </div>
            )}
          </Card>

          <Card title="Tasks and checklist" hint={chosen.length === 1 && docOf(store, chosen[0].asset.id, "checklist") ? `From ${docOf(store, chosen[0].asset.id, "checklist")?.ref}` : "Standard tasks for this job"}>
            <ul className="space-y-1.5">
              {tasks.map((tk, i) => (
                <li key={i} className="group flex items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded border border-gray-300 text-[10px] text-gray-400">{i + 1}</span>
                  <input value={tk} onChange={(e) => setTasks((l) => l.map((x, j) => (j === i ? e.target.value : x)))} className="h-8 min-w-0 flex-1 rounded-md border border-transparent bg-gray-50 px-2 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
                  <button onClick={() => setTasks((l) => l.filter((_, j) => j !== i))} aria-label="Remove task" className="text-gray-300 opacity-0 hover:text-gray-600 group-hover:opacity-100">
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => setTasks((l) => [...l, ""])} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline">
              <Plus className="size-3.5" /> Add a task
            </button>
          </Card>

          <Card title="Documents, files and photos">
            <div className="flex flex-wrap gap-1.5">
              {types.map((t) => {
                const have = chosen.filter((r) => docOf(store, r.asset.id, t));
                const on = b.attach.includes(t);
                return (
                  <label key={t} className={cn("inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition", on ? "border-indigo-300 bg-indigo-50 text-indigo-900" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>
                    <input type="checkbox" checked={on} onChange={() => b.setAttach(on ? b.attach.filter((x) => x !== t) : [...b.attach, t])} className="size-3.5 accent-indigo-600" />
                    <span className="font-medium">{KIND_LABEL[t]}</span>
                    <span className="text-gray-500">{chosen.length === 1 ? docOf(store, chosen[0].asset.id, t)?.ref : `${have.length} of ${chosen.length}`}</span>
                  </label>
                );
              })}
            </div>
            {waiting.length ? <p className="mt-2 text-xs text-amber-900">{plural(waiting.length, "document")} still in approval or draft: attached automatically when approved.</p> : null}
            {without.length ? <p className="mt-1 text-xs text-amber-900">Missing for {without.map((r) => r.asset.code).join(", ")}: it goes out without. Create the draft documents from the list.</p> : null}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
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

        <aside className="flex min-h-0 flex-col gap-3 self-start rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900">{isPm ? "This PM covers" : "This creates"}</h3>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {chosen.map((r) => {
              const mine = r.needs.filter((n) => b.attach.includes(n.type) && n.state !== "missing").length;
              return (
                <li key={r.asset.id} className="rounded-lg bg-gray-50 px-3 py-2">
                  <div className="text-sm font-medium text-gray-900">{r.asset.name}</div>
                  <div className="text-xs text-gray-500">
                    <span className="font-mono text-[11px]">{r.asset.code}</span> · {r.asset.location}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-600">{plural(mine, "document")} attached</div>
                </li>
              );
            })}
          </ul>
          <div className="space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-600">
            {isPm ? (
              <>
                <div>
                  <span className="text-gray-500">Repeats</span> {everyText(b.every).toLowerCase()}
                </div>
                <div>
                  <span className="text-gray-500">First work order</span> {fmtDate(b.date)}
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
          <Button disabled={running || !b.title.trim()} onClick={b.create} className="w-full">
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
          <button title={`Opens the ${t.kind === "pm" ? "PM" : "work order"} (not part of this prototype)`} className="mt-1.5 text-xs font-medium text-indigo-700 hover:underline">
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

export function Bench() {
  const b = useBench();
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
        <DraftsStrip b={b} />
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-1.5">
          <Search className="size-4 text-gray-400" />
          <input value={b.filter} onChange={(e) => b.setFilter(e.target.value)} placeholder="Asset name, code or location: FL-, Haas, Utility" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
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
          <span className="text-xs text-gray-500">
            {n ? `${plural(n, "asset")} selected${toDraft.length ? ` · ${plural(toDraft.length, "document")} missing or expired` : ""}` : "Tick one or more assets"}
          </span>
          <span className="flex items-center gap-2">
            {toDraft.length ? (
              <Button size="sm" variant="outline" title="Starts the documents from the asset's name and what the AI knows. You finish them on the document page." onClick={b.createDrafts}>
                <FilePen className="mr-1 size-4" /> Create {plural(toDraft.length, "draft document")}
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
