"use client";

// F2 · MVP of GUARD-1845: the screen of F1 (the long-term vision) without what is not in the MVP. Out:
// selecting several assets, the count per job, PM (create and column), document drafts, SDS, category,
// estimated time, signature, files and photos, and the AI checklist. In: the jobs, the assets with the
// documents the OSHA asks for each job, swapping a document, moving a type between Required and
// Optional, the last and next work order, and a work order made in two clicks. Scope: MVP-scope.md in
// the EHS worktree.
//
// Drawn in the Safety redesign's language (safety-redesign, design-review-2026-10-05): the page header,
// Safety's soft badges, the list table with its tinted header, cards with a tinted band, and the empty
// state. `mode` shows the sample plant or an empty account (no documents, or nothing at all).

import { RdCard, RdEmptyState, RdField, RdPage, RdSegmented, fieldClass, menuCaption, menuItem, menuItemHint, menuNote } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DataMode } from "@/lib/three-cases/demo-data";
import {
  CLASS_LABEL,
  GROUPS,
  MVP_LABEL,
  MVP_SHORT,
  WO_ASSIGNEES,
  checklistsFor,
  docByRef,
  docPool,
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
import { Check, ChevronDown, FilePlus, FileUp, Loader2, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CHIP, STATUS_HINT, STATUS_KEY, STATUS_WORD, StatusDot, statusUi, type StatusKey } from "./bench-parts";
import { useMeterFinish } from "./meter";
import { BenchDnd, DragChip, DropCell } from "./dnd";
import { CreatedToast, HiddenJobs, HideJobButton, ListHeading, NoAssets, PAGE_TITLE, RowAction, groupLabel, jobLabel, jobRow, type Created } from "./page-parts";

/** Everything of the MVP is on: the AI class, swapping a document, Required/Optional and the work orders column. */
const PHASE = 3 as const;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const shortJob = (j: MvpJob) => j.label.split(" / ")[0];
const stateKey = (s: DocState): StatusKey => STATUS_KEY[s];
const MISSING_CHIP = "border-dashed border-text-placeholder bg-transparent text-muted-foreground";

type Toast = Created;
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
    <span title={chipTitle(slot)} className={cn(CHIP, "max-w-full pr-1", ui.chip, slot.ask && "border-dashed")}>
      <Icon />
      {doc ? (
        <a href="#" draggable={false} onClick={(e) => e.preventDefault()} title={`Opens ${doc.ref} inside Safety, to view or edit (not part of this prototype)`} className="truncate underline-offset-2 hover:underline">
          {doc.ref}
        </a>
      ) : (
        <span className="truncate">{MVP_SHORT[slot.type]}</span>
      )}
      {slot.suggested ? <Sparkles aria-label="Suggested" className="size-2.5! shrink-0 opacity-60" /> : null}
      {slot.ask ? <span className="font-semibold">?</span> : null}
      {slot.state === "choose" ? <span className="font-normal">Choose</span> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button aria-label={`Change the ${MVP_LABEL[slot.type]} for ${row.asset.code}`} className="rounded-full p-0.5 opacity-70 hover:bg-foreground/10 hover:opacity-100">
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
  const others = docPool(st.empty)
    .filter((x) => x.type === slot.type && !x.assetIds.includes(row.asset.id) && `${x.ref} ${x.title}`.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 4);
  const choose = (ref: string) => {
    st.setPick(row.asset.id, job.id, slot.type, ref);
    close();
  };
  const item = (ref: string, title: string, state: DocState) => {
    const on = slot.doc?.ref === ref;
    return (
      <button key={ref} onClick={() => choose(ref)} className={cn(menuItem, "py-1.5", on && "bg-accent")}>
        <StatusDot k={stateKey(state)} />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{ref}</span>
          <span className={cn(menuItemHint, "block truncate")}>{title}</span>
        </span>
        {on ? <Check className="size-4 text-primary" /> : null}
      </button>
    );
  };
  const other: Level = slot.level === "required" ? "optional" : "required";
  const nothing = st.empty && !slot.candidates.length;
  return (
    <div>
      <div className="border-b border-border p-3">
        <p className="text-sm font-semibold text-foreground">
          {MVP_LABEL[slot.type]} · {shortJob(job)} · {row.asset.code}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{slot.why}</p>
        {slot.ask ? <p className="mt-2 rounded-md bg-muted px-2 py-1 text-xs text-foreground">? {slot.ask}</p> : null}
      </div>
      {nothing ? (
        <div className="flex flex-col gap-2 p-3">
          <p className="text-sm text-muted-foreground">There is no {MVP_SHORT[slot.type]} in Safety yet. Upload the one you use: Safety turns the PDF into a draft and links it here.</p>
          <Button size="sm" variant="outline" className="w-fit gap-2" title="Opens the upload in Safety (not part of this prototype)">
            <FileUp className="size-4" /> Upload a {MVP_SHORT[slot.type]}
          </Button>
        </div>
      ) : (
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto p-2">
          <p className={cn(menuCaption, "pt-1")}>This asset</p>
          {slot.candidates.length ? slot.candidates.map((x) => item(x.ref, x.title, x.state)) : <p className={menuNote}>No {MVP_SHORT[slot.type]} is linked to this asset.</p>}
          <p className={cn(menuCaption, "pt-2")}>Other documents</p>
          <div className="px-2 pb-1">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by number or name" className="h-8" />
          </div>
          {others.length ? others.map((x) => item(x.ref, x.title, x.state)) : <p className={menuNote}>No other {MVP_SHORT[slot.type]} found.</p>}
          <p className={menuNote}>Your choice counts for this job on this asset only. The document does not change.</p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-3 py-2 text-sm">
        {other === "required" || slot.doc ? (
          <button
            onClick={() => {
              st.setLevel(row.asset.id, job.id, slot.type, other === slot.suggestedLevel ? undefined : other);
              close();
            }}
            className="font-medium text-badge-accent-foreground hover:underline"
          >
            Mark as {other}
          </button>
        ) : null}
        {slot.picked || slot.moved ? (
          <button
            onClick={() => {
              if (slot.picked) st.setPick(row.asset.id, job.id, slot.type, undefined);
              if (slot.moved) st.setLevel(row.asset.id, job.id, slot.type, undefined);
              close();
            }}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            Use the suggestion
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ───────────────────────────── jobs on the left

function Nav({ job, jobs, st, onPick }: { job: MvpJob; jobs: MvpJob[]; st: MvpStoreApi; onPick: (id: string) => void }) {
  const hiddenJobs = jobs.filter((j) => st.hidden.includes(j.id));
  jobs = jobs.filter((j) => !st.hidden.includes(j.id));
  const [adding, setAdding] = useState(false);
  const item = (j: MvpJob) => {
    const on = j.id === job.id;
    return (
      <div key={j.id} className={jobRow(on)}>
        <button title={j.hint} onClick={() => onPick(j.id)} aria-current={on ? "true" : undefined} className={jobLabel(on)}>
          {j.label}
        </button>
        <HideJobButton
          label={j.label}
          onClick={() => {
            st.hideJob(j.id);
            if (on) onPick(jobs.find((x) => x.id !== j.id)?.id ?? j.id);
          }}
        />
        {j.custom ? (
          <button
            aria-label={`Delete ${j.label}`}
            title="Delete this job. The work orders already made stay."
            onClick={() => {
              st.removeJob(j.id);
              if (on) onPick("inspect");
            }}
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
        {GROUPS.filter((g) => jobs.some((j) => j.group === g.id && !j.custom)).map((g) => (
          <div key={g.id} className="flex flex-col gap-0.5">
            <span className={groupLabel}>{g.label}</span>
            {jobs.filter((j) => j.group === g.id && !j.custom).map(item)}
          </div>
        ))}
        {jobs.some((j) => j.custom) ? (
          <div className="flex flex-col gap-0.5">
            <span className={groupLabel}>Added by you</span>
            {jobs.filter((j) => j.custom).map(item)}
          </div>
        ) : null}
        <HiddenJobs jobs={hiddenJobs} onShow={st.showJob} />
      </div>
      <Button variant="outline" size="sm" onClick={() => setAdding(true)} className="w-full shrink-0 gap-2">
        <Plus className="size-4" /> New job
      </Button>
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
      <DialogContent className="gap-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New job</DialogTitle>
          <DialogDescription>Name the job. The documents it needs come from each asset: the ones the asset already has, and the OSHA question for LOTO.</DialogDescription>
        </DialogHeader>
        <RdField label="Name" hint={touched && error ? error : undefined}>
          <Input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setTouched(true);
            }}
            placeholder="Calibrate the scale"
          />
        </RdField>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
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

const COLS = "grid-cols-[minmax(150px,1.2fr)_144px_minmax(0,1fr)_minmax(0,1.1fr)_188px]";

function ColumnHeads() {
  return (
    <div className={cn("sticky top-0 z-10 grid h-11 items-center gap-4 border-b border-border bg-surface-subtle px-4 text-xs font-medium text-muted-foreground", COLS)}>
      <span>Asset</span>
      <span>Status</span>
      <span>Required</span>
      <span>Optional</span>
      <span>Work orders</span>
    </div>
  );
}

function ReadyTag({ r }: { r: Row }) {
  return r.ready ? (
    <span className={cn(CHIP, "border-transparent bg-badge-success text-badge-success-foreground")}>
      <Check /> Ready
    </span>
  ) : (
    <span className={cn(CHIP, "border-transparent bg-badge-neutral text-badge-neutral-foreground")}>
      <FilePlus /> Needs action{r.action.length > 1 ? ` · ${r.action.length}` : ""}
    </span>
  );
}

/** The last work order done and the next one open for this job on this asset. Only the ones made here are known. */
function WoCell({ r }: { r: Row }) {
  const link = (ref: string) => (
    <a href="#" onClick={(e) => e.preventDefault()} title={`Opens ${ref} inside Safety, to view or edit (not part of this prototype)`} className="font-medium text-foreground underline-offset-2 hover:underline">
      {ref}
    </a>
  );
  if (!r.last && !r.next) {
    return (
      <span title="No work order made from this screen for this job on this asset" className="text-sm text-text-placeholder">
        None yet
      </span>
    );
  }
  return (
    <span className="flex flex-col gap-0.5 text-xs leading-4 text-muted-foreground">
      {r.last ? (
        <span className="whitespace-nowrap">
          Last {link(r.last.ref)} · {fmtDate(r.last.on)}
        </span>
      ) : null}
      {r.next ? (
        <span className="whitespace-nowrap">
          Next {link(r.next.ref)} · {fmtDate(r.next.on)}
        </span>
      ) : null}
    </span>
  );
}

function AssetRow({ r, job, st, onCreate }: { r: Row; job: MvpJob; st: MvpStoreApi; onCreate: () => void }) {
  const required = r.slots.filter((s) => s.level === "required");
  const optional = r.slots.filter((s) => s.level === "optional" && isShown(s, false));
  const chip = (s: Slot) => (
    <DragChip key={s.type} assetId={r.asset.id} type={s.type} label={s.doc?.ref ?? MVP_SHORT[s.type]} disabled={!s.doc && s.candidates.length === 0}>
      <Chip row={r} slot={s} job={job} st={st} />
    </DragChip>
  );

  return (
    <li className="group border-b border-border transition-colors last:border-b-0 hover:bg-muted/50">
      <div className={cn("grid items-start gap-4 px-4 py-3", COLS)}>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground" title={r.asset.name}>
            {r.asset.name}
          </p>
          <p className="mt-0.5 truncate text-xs font-medium tracking-[0.02em] text-text-subtle">
            {r.asset.code} · {r.asset.location} ·{" "}
            <span title={r.info.why ?? `Class from the name: ${CLASS_LABEL[r.info.cls]}`} className={cn(r.info.by === "unknown" && "italic text-text-placeholder")}>
              {r.info.by === "ai" ? <Sparkles className="mr-0.5 inline size-2.5" /> : null}
              {r.info.label}
            </span>
          </p>
        </div>
        <div>
          <ReadyTag r={r} />
        </div>
        <DropCell assetId={r.asset.id} level="required">
          {required.map(chip)}
        </DropCell>
        <DropCell assetId={r.asset.id} level="optional">
          {optional.map(chip)}
        </DropCell>
        <div className="flex items-start justify-between gap-2">
          <WoCell r={r} />
          {/* Its own cell: it fades in on hover, but it always takes its place, so it never covers the list. */}
          <RowAction label="New work order" onClick={onCreate}>
            <Plus />
          </RowAction>
        </div>
      </div>
    </li>
  );
}

/** One line that says what each color and mark means. Sits under the list. */
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
      {(Object.keys(STATUS_WORD) as StatusKey[]).map((k) => (
        <span key={k} title={STATUS_HINT[k]} className="inline-flex items-center gap-1.5">
          <StatusDot k={k} />
          {STATUS_WORD[k]}
        </span>
      ))}
      <span className="inline-flex items-center gap-1" title="Matched because the document title has the job in it">
        <Sparkles className="size-3 opacity-60" /> Suggested
      </span>
      <span className="inline-flex items-center gap-1" title="Depends on the work: open the chip for the question">
        <span className="font-semibold">?</span> Ask
      </span>
      <span className="text-text-placeholder">Drag a document from Optional to Required to make it required for this routine on this asset</span>
    </div>
  );
}

// ───────────────────────────── the work order form

/** Everything comes filled in from the job and the asset, so one click on Create is enough. */
function FormStep({ job, asset, st, onBack, onCreated }: { job: MvpJob; asset: MvpAsset; st: MvpStoreApi; onBack: () => void; onCreated: (t: Toast) => void }) {
  const finish = useMeterFinish();
  const row = useMemo(() => resolveRow(st, job, asset, { phase: PHASE, all: false, empty: st.empty }), [st, job, asset]);
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
      const docs = attached
        .map((ref) => docByRef(ref))
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
        .map((x) => ({ ref: x.ref, type: x.type, title: x.title, state: x.state }));
      const wo = st.createWo({ title: title.trim(), assetId: asset.id, jobId: job.id, assigneeId: assignee, priority, due, description: description.trim(), docs, missing: missing.map((s) => s.type), checklist: picked?.name });
      onCreated({ title: "Work order created", line: `${wo.title} · due ${fmtDate(wo.due)}`, ref: wo.ref });
      finish?.();
    }, 350);
  };

  return (
    <RdPage onBack={onBack} record eyebrow={`${job.label} · ${asset.code}`} title="New work order" subtitle="Filled in from the job and the asset. Fields with * are required." className="pb-10">
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-6">
          <RdCard title="Details" padded>
            <div className="flex flex-col gap-4">
              <RdField label="Title" required>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-medium" />
              </RdField>
              <RdField label="Description">
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
              </RdField>
              <div className="grid grid-cols-2 gap-4">
                <RdField label="Assigned to">
                  <select data-slot="select-trigger" value={assignee} onChange={(e) => setAssignee(e.target.value)} className={fieldClass}>
                    {WO_ASSIGNEES.map((p) => (
                      <option key={p} value={p}>
                        {personName(p)}
                      </option>
                    ))}
                  </select>
                </RdField>
                <div className="flex flex-col gap-2">
                  <span className="text-sm leading-none font-medium text-foreground">
                    Priority<span className="ml-0.5 text-muted-foreground">*</span>
                  </span>
                  <RdSegmented<Priority> size="sm" value={priority} onChange={setPriority} options={(["low", "medium", "high"] as Priority[]).map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))} />
                </div>
              </div>
            </div>
          </RdCard>

          <RdCard title="Documents" action={<span className="text-sm text-muted-foreground">{`${shortJob(job)} · ${asset.code}`}</span>} padded>
            <ul className="flex flex-col gap-2">
              {row.slots
                .filter((s) => s.doc || s.level === "required")
                .map((s) => {
                  const doc = s.doc;
                  if (!doc) {
                    return (
                      <li key={s.type} className="flex items-center gap-2 rounded-lg border border-dashed border-text-placeholder px-3 py-2 text-sm text-muted-foreground">
                        <FilePlus className="size-4 shrink-0" />
                        <span className="font-medium text-foreground">{MVP_LABEL[s.type]}</span>
                        <span>{s.state === "choose" ? "none chosen" : "missing"}: the work order goes out without it</span>
                      </li>
                    );
                  }
                  const on = attached.includes(doc.ref);
                  return (
                    <li key={s.type}>
                      <label className={cn("flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors", on ? "border-primary/40 bg-badge-accent/50" : "border-border hover:bg-muted/50")}>
                        <input type="checkbox" checked={on} onChange={() => setAttached(on ? attached.filter((x) => x !== doc.ref) : [...attached, doc.ref])} className="size-4 accent-[var(--indigo-9)]" />
                        <StatusDot k={stateKey(doc.state)} />
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-medium text-foreground">{doc.ref}</span> <span className="text-muted-foreground">{doc.title}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{STATUS_WORD[stateKey(doc.state)]}</span>
                      </label>
                    </li>
                  );
                })}
              {!row.slots.some((s) => s.doc || s.level === "required") ? <li className="text-sm text-muted-foreground">No documents found for this job on this asset.</li> : null}
            </ul>
            {unapproved.length ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {plural(unapproved.length, "document")} not approved yet ({unapproved.map((s) => s.doc!.ref).join(", ")}): linked anyway and shown with its status.
              </p>
            ) : null}
          </RdCard>
        </div>

        <div className="flex flex-col gap-6">
          <RdCard title="Due date" padded>
            <RdField label="Due" required hint={past ? "The due date cannot be in the past." : undefined} className="max-w-[220px]">
              <input data-slot="input" type="date" value={due} min={dateIn(0)} onChange={(e) => setDue(e.target.value)} className={fieldClass} />
            </RdField>
          </RdCard>
          <RdCard title="Checklist" action={<span className="text-sm text-muted-foreground">The steps the technician ticks off</span>} padded>
            <div className="flex flex-col gap-3">
              <select data-slot="select-trigger" aria-label="Checklist" value={checklist} onChange={(e) => setChecklist(e.target.value)} className={fieldClass}>
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
            </div>
          </RdCard>
        </div>

        <RdCard title="This creates" padded>
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-muted px-3 py-2">
              <p className="text-sm font-medium text-foreground">{asset.name}</p>
              <p className="text-xs font-medium tracking-[0.02em] text-text-subtle">
                {asset.code} · {asset.location}
              </p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Due</dt>
              <dd className="text-foreground">{due ? fmtDate(due) : "—"}</dd>
              <dt className="text-muted-foreground">Assigned to</dt>
              <dd className="text-foreground">{personName(assignee)}</dd>
              <dt className="text-muted-foreground">Documents</dt>
              <dd className="text-foreground">
                {attached.length} linked{missing.length ? `, ${missing.length} missing` : ""}
              </dd>
            </dl>
            <p className="text-sm text-muted-foreground">One work order for this asset.</p>
            <Button disabled={running || invalid} onClick={create} className="w-full">
              {running ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Creating
                </>
              ) : (
                "Create work order"
              )}
            </Button>
          </div>
        </RdCard>
      </div>
    </RdPage>
  );
}

// ───────────────────────────── the page

const TITLE = PAGE_TITLE;
const SUBTITLE = "Pick the job, then the asset. The work order comes with the documents the OSHA asks for that job on that asset.";

export function MvpBench({ mode = "sample" }: { mode?: DataMode }) {
  const empty = mode !== "sample";
  const st = useMvpStore(empty);
  const [jobId, setJobId] = useState("inspect");
  const [filter, setFilter] = useState("");
  const [step, setStep] = useState<Step>({ name: "pick" });
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = st.jobs.filter((j) => !st.hidden.includes(j.id));
  const job = visible.find((j) => j.id === jobId) ?? visible[0] ?? st.jobs[0];
  const base = useMemo(() => rowsFor(st, job, { phase: PHASE, all: false, empty }), [st, job, empty]);
  const q = filter.trim().toLowerCase();
  const shown = base.filter((r) => !q || `${r.asset.code} ${r.asset.name} ${r.asset.location}`.toLowerCase().includes(q));
  const ready = base.filter((r) => r.ready).length;

  const pick = (id: string) => {
    setJobId(id);
    setFilter("");
    setStep({ name: "pick" });
  };

  // Dropping a document on Required or Optional saves it for this routine on this asset.
  const move = (assetId: string, type: string, level: Level) => {
    const slot = base.find((r) => r.asset.id === assetId)?.slots.find((x) => x.type === type);
    if (!slot || slot.level === level) return;
    st.setLevel(assetId, job.id, slot.type, level === slot.suggestedLevel ? undefined : level);
  };

  if (mode === "new") {
    return (
      <div className="h-full overflow-y-auto">
        <RdPage title={TITLE} subtitle={SUBTITLE}>
          <NoAssets />
        </RdPage>
      </div>
    );
  }

  if (step.name === "form") {
    const asset = getMvpAsset(step.assetId);
    if (asset) {
      return (
        <div className="h-full overflow-y-auto">
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
        </div>
      );
    }
  }

  return (
    <RdPage fill title={TITLE} subtitle={SUBTITLE}>
      <div className="grid min-h-0 flex-1 grid-cols-[176px_minmax(0,1fr)] gap-6 xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-8">
        <Nav job={job} jobs={st.jobs} st={st} onPick={pick} />
        <section className="flex min-h-0 flex-col gap-4">
          <ListHeading
            title={`${job.label}: on which asset?`}
            line={
              base.length - ready === 0
                ? `All ${base.length} assets have the documents the OSHA asks for this job.`
                : `${ready} of ${base.length} assets have the documents the OSHA asks for this job. Nothing blocks the work order.`
            }
          >
            <div className="relative w-full sm:w-[280px]">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Asset name or code: FL-, Haas, crane" aria-label="Filter the assets" className="h-8 pr-3 pl-8" />
            </div>
          </ListHeading>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border">
            <ColumnHeads />
            {shown.length ? (
              <BenchDnd onMove={move}>
                <ul>
                  {shown.map((r) => (
                    <AssetRow key={r.asset.id} r={r} job={job} st={st} onCreate={() => setStep({ name: "form", assetId: r.asset.id })} />
                  ))}
                </ul>
              </BenchDnd>
            ) : (
              <RdEmptyState icon={Search} title={`No asset matches “${filter}”`} body="Try part of the name, the code or the location." />
            )}
          </div>
          <Legend />
        </section>
      </div>
      <CreatedToast t={toast} close={() => setToast(null)} />
    </RdPage>
  );
}
