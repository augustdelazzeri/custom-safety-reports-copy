"use client";

/**
 * The right side of A1 and A2: the work orders of the selected event, CAPA or document, and what it
 * takes to close them. One work order is open at a time (the others are a row above it); it has what
 * the CMMS work order has (tasks, photos and files, time and cost, activity) and a footer whose main
 * button is Complete. When the last one is complete the next step depends on what the work orders
 * belong to: an event or a CAPA asks to move to Done, a document does not (the next cycle makes the
 * next work order).
 */

import { RdBadge, RdCard, RdEmptyState, RdNotice, fieldClass, type BadgeTone } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WO_PRIORITY_LABEL } from "@/lib/screens/work-orders";
import { KIND_LABEL, STATUS_LABEL, STATUS_TONE, dueText, fmtMinutes, labelIn, openWos, statusWord, type Artifact, type InboxStore, type Suggestion, type WoView } from "@/lib/screens/inbox";
import { PEOPLE, person } from "@/lib/three-cases/data";
import { cn } from "@/lib/utils";
import { Camera, Check, CheckCircle2, CirclePause, CirclePlay, Clock, DollarSign, FileText, ListChecks, MessageSquare, Paperclip, Pause, Play, Plus, Sparkles, Timer, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type Variant = "a1" | "a2";

const WO_TONE: Record<WoView["status"], BadgeTone> = { open: "accent", in_progress: "accent", on_hold: "warning", complete: "neutral" };

function WoStatusBadge({ s }: { s: WoView["status"] }) {
  return <RdBadge tone={WO_TONE[s]}>{statusWord(s)}</RdBadge>;
}

// ───────────────────────────── create (A1 links out, A2 does it here)

const DUE_CHOICES = [
  { value: "0", label: "Today" },
  { value: "3", label: "In 3 days" },
  { value: "7", label: "In a week" },
  { value: "14", label: "In 2 weeks" },
];
const ASSIGNEES = PEOPLE.filter((p) => ["carlos", "tom", "dan", "jo", "maria"].includes(p.id));

/** A2: make the work order here. The suggestions (from the AI options, the CAPA plan, the document state) are one click; or write one. */
export function QuickCreate({ artifact, onCreate, compact = false }: { artifact: Artifact; onCreate: (s: { title: string; assigneeId: string; dueIn: number }) => void; compact?: boolean }) {
  const [title, setTitle] = useState("");
  const [who, setWho] = useState(artifact.suggestions[0]?.assigneeId ?? "dan");
  const [due, setDue] = useState("7");
  const used = new Set(artifact.wos.map((w) => w.title));
  const ideas = artifact.suggestions.filter((s) => !used.has(s.title));
  return (
    <RdCard title={compact ? "Add a work order" : "Create a work order"} icon={<Plus />}>
      <div className="flex flex-col gap-4 p-4">
        {ideas.length ? (
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Sparkles className="size-4 text-badge-accent-foreground" aria-hidden /> Suggested
            </p>
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {ideas.map((s: Suggestion) => (
                <li key={s.title} className="flex items-center gap-3 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground" title={s.title}>
                      {s.title}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {person(s.assigneeId).name} · due {labelIn(s.dueIn)}
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={() => onCreate({ title: s.title, assigneeId: s.assigneeId, dueIn: s.dueIn })}>
                    Create
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            onCreate({ title: title.trim(), assigneeId: who, dueIn: Number(due) });
            setTitle("");
          }}
        >
          <p className="text-sm font-medium text-foreground">{ideas.length ? "Or write your own" : "What needs to be done?"}</p>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="For example: Replace the guard on Press 4" aria-label="Work order title" />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={who} onValueChange={setWho}>
              <SelectTrigger size="sm" aria-label="Assigned to" className="h-8 rounded-lg px-2.5 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNEES.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={due} onValueChange={setDue}>
              <SelectTrigger size="sm" aria-label="Due" className="h-8 rounded-lg px-2.5 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DUE_CHOICES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="sm" className="ml-auto" disabled={!title.trim()}>
              Create work order
            </Button>
          </div>
        </form>
      </div>
    </RdCard>
  );
}

// ───────────────────────────── one work order

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [active]);
  return now;
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
};
const stamp = (at: number) => new Date(at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm text-foreground">{children}</dd>
    </div>
  );
}

function WoPanel({ wo, store, onComplete, top }: { wo: WoView; store: InboxStore; onComplete: (wo: WoView) => void; top?: ReactNode }) {
  const o = store.data.wo[wo.key] ?? {};
  const done = o.tasks ?? [];
  const total = wo.checklist.length;
  const photos = o.photos ?? [];
  const files = o.files ?? [];
  const entries = o.time ?? [];
  const costs = o.costs ?? [];
  const now = useNow(Boolean(o.timerSince));
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const photoInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [minutes, setMinutes] = useState("");
  const [cost, setCost] = useState({ label: "", amount: "" });
  const [text, setText] = useState("");
  const [sure, setSure] = useState(false);
  const [tab, setTab] = useState<"tasks" | "evidence" | "time" | "activity">("tasks");
  const isDone = wo.status === "complete";
  const late = !isDone && (wo.dueIn ?? 0) < 0;
  const logged = entries.reduce((n, t) => n + t.minutes, 0) + (o.timerSince ? Math.floor((now - o.timerSince) / 60_000) : 0);
  const spent = costs.reduce((n, c) => n + c.amount, 0);

  useEffect(() => {
    const urls = Object.values(previews);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const pickFiles = (list: FileList | null, kind: "photo" | "file") => {
    Array.from(list ?? []).forEach((f) => {
      if (kind === "photo") {
        store.addPhoto(wo.key, f.name);
        setPreviews((p) => ({ ...p, [f.name]: URL.createObjectURL(f) }));
      } else store.addFile(wo.key, f.name);
    });
  };

  const missing = total - done.length;
  const complete = () => {
    if (missing > 0 && !sure) {
      setSure(true);
      return;
    }
    setSure(false);
    onComplete(wo);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">{top}</div>
      <div className="shrink-0 px-5 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 truncate text-base leading-6 font-semibold text-foreground" title={wo.title}>{wo.title}</h3>
          <WoStatusBadge s={wo.status} />
          {wo.priority === "high" ? <RdBadge tone="warning">High priority</RdBadge> : null}
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {wo.ref} · {wo.assigneeId ? person(wo.assigneeId).name : "Nobody"} · <span className={cn(late && "font-medium text-badge-error-foreground")}>{isDone ? `Completed ${wo.doneAt ?? ""}` : late ? dueText(wo.due, wo.dueIn) : `Due ${wo.due ?? "no date"}`}</span> · {wo.asset ?? "No asset"}
        </p>
        {wo.status === "on_hold" && wo.holdReason ? <p className="mt-1 flex items-center gap-1.5 text-sm text-badge-warning-foreground"><Pause className="size-4" aria-hidden /> On hold: {wo.holdReason}</p> : null}
        <div role="tablist" aria-label="Work order sections" className="mt-3 flex gap-1 border-b border-border">
          {(
            [
              ["tasks", `Tasks ${done.length}/${total}`],
              ["evidence", `Evidence ${photos.length + files.length}`],
              ["time", "Time and cost"],
              ["activity", "Activity"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("-mb-px border-b-2 px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", tab === k ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-3 [&>*]:shrink-0">
        {tab === "tasks" ? <RdCard className="" title="Tasks" icon={<ListChecks />} action={<span className="text-sm text-muted-foreground tabular-nums">{done.length} of {total} done</span>}>
          <ul className="divide-y divide-border">
            {wo.checklist.map((item, i) => (
              <li key={item}>
                <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5 text-sm hover:bg-muted/40">
                  <Checkbox checked={done.includes(i)} disabled={isDone} onCheckedChange={() => store.toggleTask(wo.key, i)} className="mt-0.5" aria-label={item} />
                  <span className={cn("text-foreground", done.includes(i) && "text-muted-foreground line-through")}>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </RdCard> : null}

        {tab === "evidence" ? <RdCard
          className=""
          title="Photos and files"
          icon={<Camera />}
          action={
            !isDone ? (
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => photoInput.current?.click()}>
                  <Camera aria-hidden /> Add photo
                </Button>
                <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => fileInput.current?.click()}>
                  <Paperclip aria-hidden /> Add file
                </Button>
              </div>
            ) : null
          }
        >
          <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e) => (pickFiles(e.target.files, "photo"), (e.target.value = ""))} />
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => (pickFiles(e.target.files, "file"), (e.target.value = ""))} />
          {photos.length || files.length ? (
            <ul className="flex flex-wrap gap-2 p-4">
              {photos.map((p, i) => (
                <li key={`${p}-${i}`} className="flex w-28 flex-col gap-1 text-xs text-muted-foreground">
                  {previews[p] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a local preview of the file the person picked
                    <img src={previews[p]} alt={p} className="h-20 w-28 rounded-lg border border-border object-cover" />
                  ) : (
                    <span className="flex h-20 w-28 items-center justify-center rounded-lg border border-border bg-muted">
                      <Camera className="size-5" aria-hidden />
                    </span>
                  )}
                  <span className="truncate" title={p}>
                    {p}
                  </span>
                </li>
              ))}
              {files.map((f, i) => (
                <li key={`${f}-${i}`} className="flex h-9 items-center gap-2 rounded-lg border border-border bg-muted px-3 text-sm text-foreground">
                  <FileText className="size-4 text-muted-foreground" aria-hidden /> {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No evidence yet. A photo of the finished work is what the owner looks for.</p>
          )}
        </RdCard> : null}

        {tab === "time" ? <RdCard
          className=""
          title="Time and cost"
          icon={<Timer />}
          action={
            !isDone ? (
              o.timerSince ? (
                <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => store.stopTimer(wo.key)}>
                  <Pause aria-hidden /> Stop {clock(now - o.timerSince)}
                </Button>
              ) : (
                <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => store.startTimer(wo.key)}>
                  <Play aria-hidden /> Start timer
                </Button>
              )
            ) : null
          }
        >
          <div className="flex flex-col gap-3 p-4">
            <p className="text-sm text-foreground">
              <span className="font-medium">{logged ? fmtMinutes(logged) : "No time"}</span> logged · <span className="font-medium">${spent.toFixed(2)}</span> in costs
            </p>
            {entries.length || costs.length ? (
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {entries.map((t) => (
                  <li key={t.id}>
                    {fmtMinutes(t.minutes)} · {person(t.by).name}
                    {t.note ? ` · ${t.note}` : ""}
                  </li>
                ))}
                {costs.map((c) => (
                  <li key={c.id}>
                    ${c.amount.toFixed(2)} · {c.label}
                  </li>
                ))}
              </ul>
            ) : null}
            {!isDone ? (
              <div className="flex flex-wrap items-center gap-2">
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const m = Number(minutes);
                    if (m > 0) store.addTime(wo.key, m, "");
                    setMinutes("");
                  }}
                >
                  <Input value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Minutes" aria-label="Minutes worked" className="h-8 w-24" />
                  <Button type="submit" size="sm" variant="outline" className="gap-1.5" disabled={!minutes}>
                    <Clock aria-hidden /> Add time
                  </Button>
                </form>
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const amount = Number(cost.amount);
                    if (cost.label.trim() && amount > 0) store.addCost(wo.key, cost.label.trim(), amount);
                    setCost({ label: "", amount: "" });
                  }}
                >
                  <Input value={cost.label} onChange={(e) => setCost({ ...cost, label: e.target.value })} placeholder="Part or service" aria-label="Cost description" className="h-8 w-36" />
                  <Input value={cost.amount} onChange={(e) => setCost({ ...cost, amount: e.target.value.replace(/[^\d.]/g, "") })} inputMode="decimal" placeholder="$" aria-label="Cost amount" className="h-8 w-20" />
                  <Button type="submit" size="sm" variant="outline" className="gap-1.5" disabled={!cost.label.trim() || !(Number(cost.amount) > 0)}>
                    <DollarSign aria-hidden /> Add cost
                  </Button>
                </form>
              </div>
            ) : null}
          </div>
        </RdCard> : null}

        {tab === "activity" ? <RdCard className="" title="Activity" icon={<MessageSquare />}>
          <div className="flex flex-col gap-3 p-4">
            {(o.activity ?? []).length ? (
              <ul className="flex flex-col gap-2">
                {[...(o.activity ?? [])].reverse().map((a) => (
                  <li key={a.id} className="text-sm">
                    <p className={cn(a.kind === "comment" ? "text-foreground" : "text-muted-foreground")}>
                      {a.kind === "comment" ? <span className="font-medium">{person(a.by).name}: </span> : null}
                      {a.text}
                    </p>
                    <p className="text-xs text-text-subtle">{stamp(a.at)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing yet. Comments and changes show here.</p>
            )}
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (text.trim()) store.comment(wo.key, text.trim());
                setText("");
              }}
            >
              <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment" aria-label="Comment" rows={1} className={cn(fieldClass, "min-h-9 flex-1 resize-none py-1.5")} />
              <Button type="submit" size="sm" variant="outline" disabled={!text.trim()}>
                Comment
              </Button>
            </form>
          </div>
        </RdCard> : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border bg-card px-5 py-3">
        {isDone ? (
          <>
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <CheckCircle2 className="size-4 text-badge-success-foreground" aria-hidden /> Complete
            </span>
            <Button type="button" size="sm" variant="outline" className="ml-auto" onClick={() => store.setStatus(wo.key, "open", "Reopened")} disabled={wo.baseStatus === "complete"} title={wo.baseStatus === "complete" ? "Completed before; reopen it in the CMMS" : undefined}>
              Reopen
            </Button>
          </>
        ) : (
          <>
            {wo.status === "open" ? (
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => (store.setStatus(wo.key, "in_progress", "Started the work"), store.startTimer(wo.key))}>
                <CirclePlay aria-hidden /> Start work
              </Button>
            ) : null}
            {wo.status === "in_progress" ? (
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => store.setStatus(wo.key, "on_hold")}>
                <CirclePause aria-hidden /> Put on hold
              </Button>
            ) : null}
            {wo.status === "on_hold" ? (
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => store.setStatus(wo.key, "in_progress", "Resumed")}>
                <CirclePlay aria-hidden /> Resume
              </Button>
            ) : null}
            {missing > 0 ? (
              <span className={cn("ml-auto text-sm", sure ? "font-medium text-badge-warning-foreground" : "text-muted-foreground")}>
                {sure ? `${missing} task${missing > 1 ? "s" : ""} not done. Complete anyway?` : `${missing} task${missing > 1 ? "s" : ""} left`}
              </span>
            ) : (
              <span className="ml-auto text-sm text-muted-foreground">All tasks done</span>
            )}
            <Button type="button" onClick={complete} className="gap-2">
              <Check aria-hidden /> {sure ? "Complete anyway" : "Complete work order"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────── the artifact

export function ArtifactDetail({
  artifact,
  store,
  variant,
  onComplete,
  onMoveToDone,
}: {
  artifact?: Artifact;
  store: InboxStore;
  variant: Variant;
  onComplete: (wo: WoView, artifact: Artifact) => void;
  onMoveToDone: (artifact: Artifact) => void;
}) {
  if (!artifact) return <RdEmptyState title="Pick something on the left" body="Its work orders show here." />;
  return <Detail key={artifact.id} artifact={artifact} store={store} variant={variant} onComplete={onComplete} onMoveToDone={onMoveToDone} />;
}

function Detail({ artifact, store, variant, onComplete, onMoveToDone }: { artifact: Artifact; store: InboxStore; variant: Variant; onComplete: (wo: WoView, artifact: Artifact) => void; onMoveToDone: (artifact: Artifact) => void }) {
  const [picked, setPicked] = useState<string>();
  const [adding, setAdding] = useState(false);
  const wos = artifact.wos;
  const left = openWos(artifact);
  const active = wos.find((w) => w.key === picked) ?? left[0] ?? wos[0];
  const allDone = wos.length > 0 && left.length === 0;
  const done = wos.length - left.length;

  const complete = (wo: WoView) => {
    // The next open work order opens by itself.
    const next = openWos(artifact).find((w) => w.key !== wo.key);
    onComplete(wo, artifact);
    setPicked(next?.key ?? wo.key);
  };
  const create = (s: { title: string; assigneeId: string; dueIn: number }) => {
    const key = store.createWo(artifact.id, s);
    setPicked(key);
    setAdding(false);
  };

  const head = (
    <div className="border-b border-border px-5 py-3">
      <p className="mb-0.5 text-xs font-medium tracking-[0.02em] text-text-subtle tabular-nums">
        {artifact.ref} · {KIND_LABEL[artifact.kind]}, {artifact.typeLabel}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="min-w-0 truncate text-lg leading-6 font-bold text-foreground">{artifact.title}</h2>
        {artifact.severity ? <RdBadge tone={artifact.severity.tone}>{artifact.severity.label}</RdBadge> : null}
        <RdBadge tone={STATUS_TONE[artifact.status]}>{STATUS_LABEL[artifact.status]}</RdBadge>
      </div>
      <p className="mt-1 truncate text-sm text-muted-foreground">
        {artifact.facts
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${v}`)
          .join("  ·  ")}
      </p>
    </div>
  );

  if (wos.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-y-auto">
        {head}
        <div className="flex flex-col gap-4 p-6">
          {variant === "a1" ? (
            <RdEmptyState
              icon={TriangleAlert}
              title="No work order yet"
              body="Nothing to close here until someone makes one. Create it from Safety work orders and it will come back to this list."
              action={
                <Button asChild>
                  <Link href={`/safety-execution/f2?from=${artifact.ref}`}>Create work order</Link>
                </Button>
              }
            />
          ) : (
            <>
              {artifact.summary && artifact.kind !== "doc" ? <p className="text-sm text-muted-foreground">{artifact.summary}</p> : null}
              <QuickCreate artifact={artifact} onCreate={create} />
            </>
          )}
        </div>
      </div>
    );
  }

  const top = (
    <>
      {head}
      <div className="px-5 pt-3">
        <div className="mb-1.5 flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Work orders</h3>
          <div className="h-1.5 max-w-40 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(done / wos.length) * 100}%` }} />
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {done} of {wos.length} complete
          </span>
          {variant === "a2" && artifact.status !== "done" ? (
            <Button type="button" size="xs" variant="ghost" className="ml-auto gap-1" onClick={() => setAdding((v) => !v)}>
              <Plus aria-hidden /> Add
            </Button>
          ) : null}
        </div>
        <ul className="max-h-[108px] overflow-y-auto rounded-lg border border-border">
          {wos.map((w) => (
            <li key={w.key} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => (setPicked(w.key), setAdding(false))}
                aria-pressed={active?.key === w.key && !adding}
                className={cn("flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors", active?.key === w.key && !adding ? "bg-muted" : "hover:bg-muted/50", w.status === "complete" && "text-muted-foreground")}
              >
                <span className="w-20 shrink-0 text-xs font-medium tracking-[0.02em] whitespace-nowrap text-text-subtle tabular-nums">{w.ref}</span>
                <span className={cn("min-w-0 flex-1 truncate", w.status === "complete" ? "" : "font-medium text-foreground")}>{w.title}</span>
                <span className="hidden shrink-0 text-muted-foreground sm:inline">{w.assigneeId ? person(w.assigneeId).name.split(" ")[0] : "Nobody"}</span>
                <WoStatusBadge s={w.status} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {allDone ? (
        <div className="px-5 pt-3">
          {artifact.status === "done" ? (
            <RdNotice icon={CheckCircle2} title={`${artifact.ref} is done`}>
              Every work order is complete and it was moved to Done.
            </RdNotice>
          ) : artifact.kind === "doc" ? (
            <RdNotice icon={CheckCircle2} title="Every work order is complete">
              Nothing else to do for {artifact.ref}. The next review cycle makes the next work order.
            </RdNotice>
          ) : (
            <RdNotice
              icon={CheckCircle2}
              title={`Move the ${artifact.kind === "event" ? "event" : "CAPA"} to Done?`}
              action={
                <Button type="button" size="sm" onClick={() => onMoveToDone(artifact)}>
                  Move {artifact.ref} to Done
                </Button>
              }
            >
              Every work order of {artifact.ref} is complete. Moving it to Done closes it; leave it open if something is still pending.
            </RdNotice>
          )}
        </div>
      ) : null}
    </>
  );

  if (adding) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0">{top}</div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          <QuickCreate artifact={artifact} onCreate={create} compact />
        </div>
      </div>
    );
  }
  return <WoPanel key={active.key} wo={active} store={store} onComplete={complete} top={top} />;
}
