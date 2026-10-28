"use client";

/**
 * The left side of A1 and A2, the pattern of Events > Corrective actions: a list of records with the
 * selected one on the right. Rows are two lines: title and badges, then reference, kind, place and
 * how far the work orders are. The timeline lives on the right, so it is not repeated here.
 */

import { RdAsk } from "@/components/redesign/table";
import { RdBadge, RdEmptyState } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { person } from "@/lib/three-cases/data";
import { KIND_PLURAL, STATUS_LABEL, STATUS_TONE, isOverdue, type ArtKind, type Artifact, type Filters } from "@/lib/screens/inbox";
import { cn } from "@/lib/utils";
import { Clock, FileText, ListChecks, TriangleAlert, X, type LucideIcon } from "lucide-react";

const KIND_ICON: Record<ArtKind, LucideIcon> = { event: TriangleAlert, capa: ListChecks, doc: FileText };

function Row({ a, selected, onSelect }: { a: Artifact; selected: boolean; onSelect: () => void }) {
  const done = a.wos.filter((w) => w.status === "complete").length;
  const late = isOverdue(a);
  const Icon = KIND_ICON[a.kind];
  return (
    <li className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
          selected ? "bg-muted" : "hover:bg-muted/50",
          a.status === "done" && "opacity-70",
        )}
      >
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm leading-5 font-medium text-foreground">{a.title}</span>
            {a.severity ? (
              <RdBadge tone={a.severity.tone} className="shrink-0">
                {a.severity.label}
              </RdBadge>
            ) : null}
            <RdBadge tone={STATUS_TONE[a.status]} className="shrink-0">
              {STATUS_LABEL[a.status]}
            </RdBadge>
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 overflow-hidden text-sm whitespace-nowrap text-muted-foreground">
            <span className="shrink-0 font-medium tracking-[0.02em] text-text-subtle tabular-nums">{a.ref}</span>
            <span aria-hidden>·</span>
            <span className="shrink-0">{a.typeLabel}</span>
            <span aria-hidden>·</span>
            <span className="min-w-0 truncate">{a.locationName}</span>
            <span className="ml-auto flex shrink-0 items-center gap-1.5">
              {late ? (
                <span className="inline-flex items-center gap-1 font-medium text-badge-error-foreground">
                  <Clock className="size-3.5" aria-hidden /> Late
                </span>
              ) : null}
              <span className="tabular-nums">{a.wos.length ? `${done}/${a.wos.length} WO` : "No WO"}</span>
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}

function Pick<T extends string>({ label, value, onChange, options, className }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger size="sm" aria-label={label} className={cn("h-8 gap-1.5 rounded-lg px-2 text-sm", className)}>
        <span className="text-muted-foreground">{label}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ArtifactFilters({ filters, onChange, all, shown, defaults }: { filters: Filters; onChange: (f: Filters) => void; all: Artifact[]; shown: number; defaults: Filters }) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...filters, [k]: v });
  const places = [...new Set(all.map((a) => a.locationName))].sort();
  const people = [...new Set(all.flatMap((a) => a.assigneeIds))].sort((a, b) => person(a).name.localeCompare(person(b).name));
  const dirty = JSON.stringify({ ...filters, q: "" }) !== JSON.stringify({ ...defaults, q: "" }) || filters.q !== "";
  return (
    <div className="flex flex-col gap-2">
      <RdAsk value={filters.q} onChange={(q) => set("q", q)} placeholder="Search by ID, title or work order" />
      <div className="flex flex-wrap items-center gap-1.5">
        <Pick<Filters["kind"]> label="Kind" value={filters.kind} onChange={(v) => set("kind", v)} options={[{ value: "all", label: "All" }, ...(Object.keys(KIND_PLURAL) as ArtKind[]).map((k) => ({ value: k, label: KIND_PLURAL[k] }))]} />
        <Pick<Filters["status"]> label="Status" value={filters.status} onChange={(v) => set("status", v)} options={[{ value: "active", label: "Open" }, { value: "done", label: "Done" }, { value: "all", label: "All" }]} />
        <Pick label="Location" value={filters.location} onChange={(v) => set("location", v)} options={[{ value: "all", label: "All" }, ...places.map((p) => ({ value: p, label: p }))]} />
        <Pick label="Assignee" value={filters.assignee} onChange={(v) => set("assignee", v)} options={[{ value: "all", label: "Anyone" }, ...people.map((p) => ({ value: p, label: person(p).name }))]} />
        <Pick<Filters["wos"]> label="WOs" value={filters.wos} onChange={(v) => set("wos", v)} options={[{ value: "with", label: "With" }, { value: "without", label: "None yet" }, { value: "all", label: "All" }]} />
        <Button type="button" variant={filters.overdue ? "secondary" : "outline"} size="sm" aria-pressed={filters.overdue} onClick={() => set("overdue", !filters.overdue)} className="h-8 gap-1.5 rounded-lg px-2.5 text-sm">
          <Clock aria-hidden /> Overdue
        </Button>
        {dirty ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(defaults)} className="h-8 gap-1 rounded-lg px-2 text-sm text-muted-foreground">
            <X aria-hidden /> Reset
          </Button>
        ) : null}
        <span className="ml-auto text-sm text-muted-foreground tabular-nums">{shown} shown</span>
      </div>
    </div>
  );
}

export function ArtifactList({ items, selectedId, onSelect, onReset }: { items: Artifact[]; selectedId?: string; onSelect: (a: Artifact) => void; onReset: () => void }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded-[var(--lab-radius)] border border-border">
      {items.length ? (
        <ul>
          {items.map((a) => (
            <Row key={a.id} a={a} selected={a.id === selectedId} onSelect={() => onSelect(a)} />
          ))}
        </ul>
      ) : (
        <RdEmptyState title="Nothing matches" body="Nothing here fits these filters." action={<Button variant="outline" size="sm" onClick={onReset}>Reset filters</Button>} />
      )}
    </div>
  );
}
