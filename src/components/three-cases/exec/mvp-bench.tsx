"use client";

// F2 · MVP of GUARD-1845: the screen of F1 (the long-term vision) without what is not in the MVP. Out:
// selecting several assets, the count per job, PM (create and column), document drafts, SDS, category,
// estimated time, signature, files and photos, and the AI checklist. In: the jobs, the assets with the
// documents the OSHA asks for each job, swapping a document, moving a type between Required and
// Optional, the last and next work order, and a work order made in two clicks. Scope: MVP-scope.md in
// the EHS worktree.

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CLASS_LABEL,
  DOCS,
  GROUPS,
  MVP_KINDS,
  MVP_LABEL,
  MVP_SHORT,
  WO_ASSIGNEES,
  checklistsFor,
  docByRef,
  getMvpAsset,
  isShown,
  jobNameError,
  libraryChecklists,
  personName,
  resolveRow,
  rowsFor,
  useMvpStore,
  type Level,
  type MvpAsset,
  type MvpJob,
  type MvpStoreApi,
  type Row,
  type Slot,
} from "@/lib/three-cases/mvp-rules";
import { dateIn, fmtDate, PRIORITY_LABEL, type DocState, type Priority } from "@/lib/three-cases/real-jobs";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, ChevronDown, ClipboardList, FilePlus, Loader2, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { STATUS_HINT, STATUS_KEY, STATUS_WORD, statusUi, type StatusKey } from "./bench-parts";
import { useMeterFinish } from "./meter";

/** Everything of the MVP is on: the AI class, swapping a document, Required/Optional and the work orders column. */
const SETTINGS = { phase: 3 as const, all: false };
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const shortJob = (j: MvpJob) => j.label.split(" / ")[0];
const stateKey = (s: DocState): StatusKey => STATUS_KEY[s];
const MISSING_CHIP = "border-dashed border-gray-400 bg-white text-gray-600";

interface Toast {
  title: string;
  line: string;
  ref: string;
}
type Step = { name: "pick" } | { name: "form"; assetId: string };

// ───────────────────────────── chips

function chipTitle(slot: Slot) {
  return [
    `${MVP_LABEL[slot.type]} · ${slot.level}${slot.recommended ? " (recommended)" : ""}`,
    slot.doc
      ? `${slot.doc.ref} · ${slot.doc.title} · ${STATUS_WORD[stateKey(slot.doc.state)]}${slot.suggested ? " · Suggested: the title has the job in it" : slot.picked ? " · Chosen by you" : ""}`
      : slot.state === "choose"
        ? "No document of this type has the job in its title: choose one"
        : "No document of this type on this asset",
    slot.ask ? `? ${slot.ask}` : "",
    slot.why,
  ]
    .filter(Boolean)
    .join("\n");
}

function Chip({ row, slot, job, st }: { row: Row; slot: Slot; job: MvpJob; st: MvpStoreApi }) {
  const [open, setOpen] = useState(false);
  const doc = slot.doc;
  const ui = doc ? statusUi(stateKey(doc.state), "green") : { Icon: FilePlus, chip: MISSING_CHIP };
  const Icon = ui.Icon;
  return (
    <span
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", `${row.asset.id}|${slot.type}`)}
      title={chipTitle(slot)}
      className={cn("inline-flex max-w-full cursor-grab items-center gap-1 rounded-full border px-1.5 py-px text-[11px] font-medium active:cursor-grabbing", ui.chip, slot.ask && "border-dashed")}
    >
      <Icon className="size-3 shrink-0" />
      {doc ? (
        <a href="#" draggable={false} onClick={(e) => e.preventDefault()} title={`Opens ${doc.ref} inside Safety, to view or edit (not part of this prototype)`} className="truncate underline-offset-2 hover:underline">
          {doc.ref}
        </a>
      ) : (
        <span className="truncate">{MVP_SHORT[slot.type]}</span>
      )}
      {slot.suggested ? <Sparkles aria-label="Suggested" className="size-2.5 shrink-0 opacity-60" /> : null}
      {slot.ask ? <span className="font-semibold">?</span> : null}
      {slot.state === "choose" ? <span className="font-normal">Choose</span> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button aria-label={`Change the ${MVP_LABEL[slot.type]} for ${row.asset.code}`} className="-mr-0.5 rounded-full p-px opacity-70 hover:bg-black/5 hover:opacity-100">
            <ChevronDown className="size-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-0">
          <ChipMenu row={row} slot={slot} job={job} st={st} close={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </span>
  );
}

/** Pick another document, or say the type is required or optional for this asset. Both stay in Safety: the document itself does not change. */
function ChipMenu({ row, slot, job, st, close }: { row: Row; slot: Slot; job: MvpJob; st: MvpStoreApi; close: () => void }) {
  const [q, setQ] = useState("");
  const others = DOCS.filter((x) => x.type === slot.type && !x.assetIds.includes(row.asset.id) && `${x.ref} ${x.title}`.toLowerCase().includes(q.toLowerCase())).slice(0, 4);
  const choose = (ref: string) => {
    st.setPick(row.asset.id, job.id, slot.type, ref);
    close();
  };
  const item = (ref: string, title: string, state: DocState) => {
    const ui = statusUi(stateKey(state), "green");
    const Icon = ui.Icon;
    const on = slot.doc?.ref === ref;
    return (
      <button key={ref} onClick={() => choose(ref)} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-gray-50", on && "bg-indigo-50")}>
        <span className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded-full border", ui.chip)}>
          <Icon className="size-2.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-gray-900">{ref}</span>
          <span className="block truncate text-[11px] text-gray-500">{title}</span>
        </span>
        {on ? <Check className="size-3.5 text-indigo-700" /> : null}
      </button>
    );
  };
  const other: Level = slot.level === "required" ? "optional" : "required";
  return (
    <div className="text-xs">
      <div className="border-b border-gray-100 px-3 py-2">
        <div className="font-semibold text-gray-900">
          {MVP_LABEL[slot.type]} · {shortJob(job)} · {row.asset.code}
        </div>
        <p className="mt-0.5 text-[11px] text-gray-500">{slot.why}</p>
        {slot.ask ? <p className="mt-1 rounded bg-gray-50 px-2 py-1 text-[11px] text-gray-700">? {slot.ask}</p> : null}
      </div>
      <div className="max-h-64 overflow-y-auto p-1.5">
        <div className="px-2 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">This asset</div>
        {slot.candidates.length ? slot.candidates.map((x) => item(x.ref, x.title, x.state)) : <p className="px-2 pb-1 text-[11px] text-gray-400">No {MVP_SHORT[slot.type]} is linked to this asset.</p>}
        <div className="px-2 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Other documents</div>
        <div className="px-2 pb-1">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by number or name" className="h-7 w-full rounded-md border border-gray-200 px-2 text-xs outline-none focus:border-indigo-300" />
        </div>
        {others.length ? others.map((x) => item(x.ref, x.title, x.state)) : <p className="px-2 pb-1 text-[11px] text-gray-400">No other {MVP_SHORT[slot.type]} found.</p>}
        <p className="px-2 pt-1 text-[10px] text-gray-400">Your choice counts for this job on this asset only. The document does not change.</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 px-3 py-2">
        <button
          onClick={() => {
            st.setLevel(row.asset.id, job.id, slot.type, other === slot.suggestedLevel ? undefined : other);
            close();
          }}
          className="font-medium text-indigo-700 hover:underline"
        >
          Mark as {other}
        </button>
        {slot.picked || slot.moved ? (
          <button
            onClick={() => {
              if (slot.picked) st.setPick(row.asset.id, job.id, slot.type, undefined);
              if (slot.moved) st.setLevel(row.asset.id, job.id, slot.type, undefined);
              close();
            }}
            className="text-gray-500 hover:text-gray-800 hover:underline"
          >
            Use the suggestion
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** The "+" that brings a document type the OSHA table did not suggest into Optional. */
function AddType({ row, job, st }: { row: Row; job: MvpJob; st: MvpStoreApi }) {
  const [open, setOpen] = useState(false);
  const hidden = MVP_KINDS.filter((t) => !row.slots.some((s) => s.type === t && isShown(s, false)));
  if (!hidden.length) return null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button aria-label="Add a document type" title="Add a document type the OSHA table did not suggest" className="inline-flex size-5 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-700">
          <Plus className="size-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44 p-1.5">
        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Add to Optional</div>
        {hidden.map((t) => (
          <button
            key={t}
            onClick={() => {
              st.setLevel(row.asset.id, job.id, t, "optional");
              setOpen(false);
            }}
            className="block w-full rounded-md px-2 py-1 text-left text-xs text-gray-800 hover:bg-gray-50"
          >
            {MVP_LABEL[t]}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ───────────────────────────── jobs on the left (no count, no scroll)

function Nav({ job, jobs, st, onPick }: { job: MvpJob; jobs: MvpJob[]; st: MvpStoreApi; onPick: (id: string) => void }) {
  const [adding, setAdding] = useState(false);
  const item = (j: MvpJob) => {
    const on = j.id === job.id;
    return (
      <div key={j.id} className={cn("group flex items-center gap-1 rounded-lg px-2.5 py-1.5", on ? "bg-indigo-50" : "hover:bg-gray-50")}>
        <button title={j.hint} onClick={() => onPick(j.id)} className={cn("min-w-0 flex-1 truncate text-left text-sm leading-5", on ? "font-medium text-indigo-900" : "text-gray-800")}>
          {j.label}
        </button>
        {j.custom ? (
          <button
            aria-label={`Delete ${j.label}`}
            title="Delete this job. The work orders already made stay."
            onClick={() => {
              st.removeJob(j.id);
              if (on) onPick("inspect");
            }}
            className="shrink-0 text-gray-300 opacity-0 hover:text-gray-600 group-hover:opacity-100"
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
            {jobs.filter((j) => j.group === g.id && !j.custom).map(item)}
          </div>
        ))}
        {jobs.some((j) => j.custom) ? (
          <div>
            <div className="px-2.5 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Added by you</div>
            {jobs.filter((j) => j.custom).map(item)}
          </div>
        ) : null}
      </div>
      <button onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-sm text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-700">
        <Plus className="size-4" /> New job
      </button>
      <NewJobDialog st={st} open={adding} onOpenChange={setAdding} onCreated={onPick} />
    </nav>
  );
}

/** A job is only a name, for the whole company. Which documents it needs comes from each asset. */
function NewJobDialog({ st, open, onOpenChange, onCreated }: { st: MvpStoreApi; open: boolean; onOpenChange: (o: boolean) => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const error = jobNameError(name, st);
  const close = () => {
    setName("");
    setTouched(false);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New job</DialogTitle>
          <DialogDescription>Name the job. The documents it needs come from each asset: the ones the asset already has, and the OSHA question for LOTO.</DialogDescription>
        </DialogHeader>
        <label className="block text-xs font-medium text-gray-600">
          Name
          <input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setTouched(true);
            }}
            placeholder="Calibrate the scale"
            className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm font-normal outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
          {touched && error ? <span className="mt-1 block text-xs font-normal text-gray-600">{error}</span> : null}
        </label>
        <DialogFooter>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            disabled={Boolean(error)}
            onClick={() => {
              const id = st.addJob(name);
              close();
              onCreated(id);
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

const COLS = "grid-cols-[minmax(190px,1fr)_minmax(0,1.5fr)_minmax(0,1.1fr)_minmax(160px,0.8fr)_104px]";

function ColumnHeads() {
  return (
    <div className={cn("sticky top-0 z-10 grid items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400", COLS)}>
      <span>Asset</span>
      <span>Required documents</span>
      <span>Optional</span>
      <span>Work orders</span>
      <span />
    </div>
  );
}

function ReadyTag({ r }: { r: Row }) {
  return r.ready ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[11px] font-semibold text-emerald-800">
      <Check className="size-3" /> Ready
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-1.5 py-px text-[11px] font-semibold text-gray-700">
      <FilePlus className="size-3" /> Needs action{r.action.length > 1 ? ` · ${r.action.length}` : ""}
    </span>
  );
}

/** The last work order done and the next one open for this job on this asset, in one badge. Only the ones made here are known. */
function WoCell({ r }: { r: Row }) {
  const link = (ref: string) => (
    <a href="#" onClick={(e) => e.preventDefault()} title={`Opens ${ref} inside Safety, to view or edit (not part of this prototype)`} className="font-medium underline-offset-2 hover:underline">
      {ref}
    </a>
  );
  if (!r.last && !r.next) {
    return (
      <span title="No work order made from this screen for this job on this asset" className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-white px-1.5 py-px text-[11px] text-gray-400">
        <ClipboardList className="size-3" /> None yet
      </span>
    );
  }
  return (
    <span className="flex w-fit items-start gap-1 rounded-lg border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-700">
      <ClipboardList className="mt-px size-3 shrink-0" />
      <span className="leading-4">
        {r.last ? (
          <span className="block whitespace-nowrap">
            <span className="opacity-70">Last</span> {link(r.last.ref)} · {fmtDate(r.last.on)}
          </span>
        ) : null}
        {r.next ? (
          <span className="block whitespace-nowrap">
            <span className="opacity-70">Next</span> {link(r.next.ref)} · {fmtDate(r.next.on)}
          </span>
        ) : null}
      </span>
    </span>
  );
}

function AssetRow({ r, job, st, onCreate }: { r: Row; job: MvpJob; st: MvpStoreApi; onCreate: () => void }) {
  const [over, setOver] = useState<Level | null>(null);
  const required = r.slots.filter((s) => s.level === "required");
  const optional = r.slots.filter((s) => s.level === "optional" && isShown(s, SETTINGS.all));

  const zone = (level: Level) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setOver(level);
    },
    onDragLeave: () => setOver(null),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setOver(null);
      const [aid, type] = e.dataTransfer.getData("text/plain").split("|");
      if (aid !== r.asset.id) return;
      const slot = r.slots.find((s) => s.type === type);
      if (!slot || slot.level === level) return;
      st.setLevel(r.asset.id, job.id, slot.type, level === slot.suggestedLevel ? undefined : level);
    },
  });
  const zoneCls = (level: Level) => cn("flex min-h-7 flex-wrap items-center gap-1 rounded-lg", over === level && "bg-indigo-50 ring-1 ring-indigo-200");

  return (
    <li className="group border-b border-gray-100">
      <div className={cn("grid items-start gap-3 px-4 py-2.5", COLS)}>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-900">{r.asset.name}</div>
          <div className="truncate text-xs text-gray-500">
            <span className="font-mono text-[11px] text-gray-400">{r.asset.code}</span> · {r.asset.location} ·{" "}
            <span title={r.info.why ?? `Class from the name: ${CLASS_LABEL[r.info.cls]}`} className={cn(r.info.by === "unknown" && "italic text-gray-400")}>
              {r.info.by === "ai" ? <Sparkles className="mr-0.5 inline size-2.5" /> : null}
              {r.info.label}
            </span>
          </div>
          <div className="mt-1">
            <ReadyTag r={r} />
          </div>
        </div>
        <div {...zone("required")} className={zoneCls("required")}>
          {required.length ? required.map((s) => <Chip key={s.type} row={r} slot={s} job={job} st={st} />) : <span className="text-xs text-gray-400">None required</span>}
        </div>
        <div {...zone("optional")} className={zoneCls("optional")}>
          {optional.length ? optional.map((s) => <Chip key={s.type} row={r} slot={s} job={job} st={st} />) : <span className="text-xs text-gray-300">None</span>}
          <AddType row={r} job={job} st={st} />
        </div>
        <WoCell r={r} />
        <div className="flex flex-col items-end gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <button onClick={onCreate} className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-700">
            New work order
          </button>
        </div>
      </div>
    </li>
  );
}

/** One line that says what each color and mark means. Sits in the footer of the list. */
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="Legend">
      {(Object.keys(STATUS_WORD) as StatusKey[]).map((k) => {
        const { Icon, chip } = statusUi(k, "green");
        return (
          <span key={k} title={STATUS_HINT[k]} className="inline-flex items-center gap-1 text-[11px] text-gray-600">
            <span className={cn("inline-flex size-4 items-center justify-center rounded-full border", chip)}>
              <Icon className="size-2.5" />
            </span>
            {STATUS_WORD[k]}
          </span>
        );
      })}
      <span className="inline-flex items-center gap-1 text-[11px] text-gray-600" title="Matched because the document title has the job in it">
        <Sparkles className="size-3 opacity-60" /> Suggested
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] text-gray-600" title="Depends on the work: open the chip for the question">
        <span className="font-semibold">?</span> Ask
      </span>
      <span className="text-[11px] text-gray-400">Drag a chip between Required and Optional, or open it with the arrow</span>
    </div>
  );
}

// ───────────────────────────── the work order form

const inputCls = "h-8 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";

/** A labelled field. */
function Field({ label, required, children, className }: { label: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block text-xs font-medium text-gray-600", className)}>
      {label}
      {required ? <span title="Required" className="ml-0.5 text-gray-400">*</span> : null}
      <span className="mt-0.5 block">{children}</span>
    </label>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
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

/** Everything comes filled in from the job and the asset, so one click on Create is enough. */
function FormStep({ job, asset, st, onBack, onCreated }: { job: MvpJob; asset: MvpAsset; st: MvpStoreApi; onBack: () => void; onCreated: (t: Toast) => void }) {
  const finish = useMeterFinish();
  const row = useMemo(() => resolveRow(st, job, asset, SETTINGS), [st, job, asset]);
  const found = row.slots.filter((s) => s.doc);
  const missing = row.slots.filter((s) => s.level === "required" && !s.doc);
  const linkedDocs = found.map((s) => s.doc!);
  const own = checklistsFor(job.id, linkedDocs);
  const libOf: Record<string, string> = { inspect: "lib-walk", lube: "lib-lube", clean: "lib-clean" };

  const [title, setTitle] = useState(`${shortJob(job)} ${asset.name}`);
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("carlos");
  const [priority, setPriority] = useState<Priority>("medium");
  const [due, setDue] = useState(dateIn(1));
  const [attached, setAttached] = useState<string[]>(() => found.map((s) => s.doc!.ref));
  // The checklist of the asset's audit or SOP first; then the company's for the job; a LOTO checklist only when nothing else fits.
  const [checklist, setChecklist] = useState(() => own.find((o) => !o.id.startsWith("doc-LOTO"))?.id ?? libOf[job.id] ?? own[0]?.id ?? "none");
  const options = [...own, ...libraryChecklists()];
  const picked = options.find((o) => o.id === checklist);
  const [running, setRunning] = useState(false);
  const past = due < dateIn(0);
  const invalid = !title.trim() || !due || past;
  const unapproved = found.filter((s) => attached.includes(s.doc!.ref) && s.doc!.state !== "valid");

  const create = () => {
    if (running || invalid) return;
    setRunning(true);
    setTimeout(() => {
      const docs = attached.map((ref) => docByRef(ref)).filter((x): x is NonNullable<typeof x> => Boolean(x)).map((x) => ({ ref: x.ref, type: x.type, title: x.title, state: x.state }));
      const wo = st.createWo({ title: title.trim(), assetId: asset.id, jobId: job.id, assigneeId: assignee, priority, due, description: description.trim(), docs, missing: missing.map((s) => s.type), checklist: picked?.name });
      onCreated({ title: "Work order created", line: `${wo.title} · due ${fmtDate(wo.due)}`, ref: wo.ref });
      finish?.();
    }, 350);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50" aria-label="Back to the assets">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h2 className="text-base font-semibold leading-5 text-gray-900">New work order</h2>
          <p className="text-xs text-gray-500">{job.label}: filled in from the job and the asset. Fields with * are required.</p>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px] content-start gap-3">
        <div className="space-y-3">
          <Card title="Details">
            <div className="space-y-2">
              <Field label="Title" required>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={cn(inputCls, "font-medium")} />
              </Field>
              <Field label="Description">
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Assigned to">
                  <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputCls}>
                    {WO_ASSIGNEES.map((p) => (
                      <option key={p} value={p}>
                        {personName(p)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority" required>
                  <Segmented<Priority> value={priority} onChange={setPriority} options={(["low", "medium", "high"] as Priority[]).map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))} />
                </Field>
              </div>
            </div>
          </Card>

          <Card title="Documents" hint={`${shortJob(job)} · ${asset.code}`}>
            <ul className="space-y-1">
              {row.slots
                .filter((s) => s.doc || s.level === "required")
                .map((s) => {
                  const doc = s.doc;
                  if (!doc) {
                    return (
                      <li key={s.type} className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-600">
                        <FilePlus className="size-3.5 text-gray-400" />
                        <span className="font-medium">{MVP_LABEL[s.type]}</span>
                        <span className="text-gray-500">{s.state === "choose" ? "none chosen" : "missing"}: the work order goes out without it</span>
                      </li>
                    );
                  }
                  const ui = statusUi(stateKey(doc.state), "green");
                  const Icon = ui.Icon;
                  const on = attached.includes(doc.ref);
                  return (
                    <li key={s.type}>
                      <label className={cn("flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1 text-xs", on ? "border-indigo-200 bg-indigo-50/50" : "border-gray-200")}>
                        <input type="checkbox" checked={on} onChange={() => setAttached(on ? attached.filter((x) => x !== doc.ref) : [...attached, doc.ref])} className="size-3.5 accent-indigo-600" />
                        <span className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded-full border", ui.chip)}>
                          <Icon className="size-2.5" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-medium text-gray-900">{doc.ref}</span> <span className="text-gray-500">{doc.title}</span>
                        </span>
                        <span className="shrink-0 text-gray-400">{STATUS_WORD[stateKey(doc.state)]}</span>
                      </label>
                    </li>
                  );
                })}
              {!row.slots.some((s) => s.doc || s.level === "required") ? <li className="text-xs text-gray-500">No documents found for this job on this asset.</li> : null}
            </ul>
            {unapproved.length ? <p className="mt-1.5 text-xs text-gray-600">{plural(unapproved.length, "document")} not approved yet ({unapproved.map((s) => s.doc!.ref).join(", ")}): linked anyway and shown with its status.</p> : null}
          </Card>
        </div>

        <div className="space-y-3">
          <Card title="Due date">
            <div className="max-w-[200px]">
              <Field label="Due" required>
                <input type="date" value={due} min={dateIn(0)} onChange={(e) => setDue(e.target.value)} className={inputCls} />
              </Field>
              {past ? <p className="mt-1 text-xs text-gray-600">The due date cannot be in the past.</p> : null}
            </div>
          </Card>
          <Card title="Checklist" hint="The steps the technician ticks off">
            <div className="space-y-1.5">
              <select aria-label="Checklist" value={checklist} onChange={(e) => setChecklist(e.target.value)} className={inputCls}>
                {own.length ? (
                  <optgroup label="Linked to this asset's documents">
                    {own.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} · {o.from} · {o.items.length} items
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                <optgroup label="Your company's checklists">
                  {libraryChecklists().map((o) => (
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
            </div>
          </Card>
        </div>

        <aside className="flex min-h-0 flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-gray-900">This creates</h3>
          <div className="rounded-lg bg-gray-50 px-3 py-1.5">
            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
            <div className="text-xs text-gray-500">
              <span className="font-mono text-[11px]">{asset.code}</span> · {asset.location}
            </div>
          </div>
          <div className="space-y-0.5 border-t border-gray-100 pt-2 text-xs text-gray-600">
            <div>
              <span className="text-gray-500">Due</span> {due ? fmtDate(due) : "—"}
            </div>
            <div>
              <span className="text-gray-500">Assigned to</span> {personName(assignee)}
            </div>
            <div>
              <span className="text-gray-500">Documents</span> {attached.length} linked{missing.length ? `, ${missing.length} missing` : ""}
            </div>
            <div className="text-gray-500">One work order for this asset.</div>
          </div>
          <Button disabled={running || invalid} onClick={create} className="mt-auto w-full">
            {running ? (
              <>
                <Loader2 className="mr-1.5 size-4 animate-spin" /> Creating
              </>
            ) : (
              "Create work order"
            )}
          </Button>
        </aside>
      </div>
    </div>
  );
}

/** A card that comes up from the corner: what was created, with the link. It does not hide the list. */
function ToastCard({ t, close }: { t: Toast | null; close: () => void }) {
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
          <button title="Opens the work order inside Safety (not part of this prototype)" className="mt-1.5 text-xs font-medium text-indigo-700 hover:underline">
            Open {t.ref}
          </button>
        </div>
        <button onClick={close} aria-label="Close" className="text-gray-400 hover:text-gray-700">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────── the page

export function MvpBench() {
  const st = useMvpStore();
  const [jobId, setJobId] = useState("inspect");
  const [filter, setFilter] = useState("");
  const [step, setStep] = useState<Step>({ name: "pick" });
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const job = st.jobs.find((j) => j.id === jobId) ?? st.jobs[0];
  const base = useMemo(() => rowsFor(st, job, SETTINGS), [st, job]);
  const q = filter.trim().toLowerCase();
  const shown = base.filter((r) => !q || `${r.asset.code} ${r.asset.name} ${r.asset.location}`.toLowerCase().includes(q));
  const ready = base.filter((r) => r.ready).length;

  const pick = (id: string) => {
    setJobId(id);
    setFilter("");
    setStep({ name: "pick" });
  };

  if (step.name === "form") {
    const asset = getMvpAsset(step.assetId);
    if (asset) {
      return (
        <FormStep
          key={`${job.id}|${asset.id}`}
          job={job}
          asset={asset}
          st={st}
          onBack={() => setStep({ name: "pick" })}
          onCreated={(t) => {
            if (timer.current) clearTimeout(timer.current);
            setToast(t);
            timer.current = setTimeout(() => setToast(null), 9000);
            setStep({ name: "pick" });
          }}
        />
      );
    }
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[260px_minmax(0,1fr)] gap-3">
      <Nav job={job} jobs={st.jobs} st={st} onPick={pick} />
      <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-900">{job.label}: on which asset?</h2>
          <p className="text-xs text-gray-500">
            Documents: {ready} ready, {base.length - ready} {base.length - ready === 1 ? "needs" : "need"} action · what the OSHA asks for this job on each asset. Nothing blocks the work order.
          </p>
        </div>
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-1.5">
          <Search className="size-4 text-gray-400" />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Asset name or code: FL-, Haas, crane" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ColumnHeads />
          {shown.length ? (
            <ul>
              {shown.map((r) => (
                <AssetRow key={r.asset.id} r={r} job={job} st={st} onCreate={() => setStep({ name: "form", assetId: r.asset.id })} />
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500">No asset matches “{filter}”</div>
          )}
        </div>
        <div className="border-t border-gray-100 px-4 py-2.5">
          <Legend />
        </div>
      </div>
      <ToastCard t={toast} close={() => setToast(null)} />
    </div>
  );
}
