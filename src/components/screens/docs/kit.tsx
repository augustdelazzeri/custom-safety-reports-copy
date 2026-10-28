"use client";

/**
 * Shared frame and pieces for the documentation records (SOP, JHA, LOTO, permit, SDS): the
 * redesign's page, list, record and form, so the five kinds read as one family and match the
 * Documentation page that links to them.
 */

import { RdAsk, RdTable, RdToolbar, type RdColumn } from "@/components/redesign/table";
import { RdBadge, RdCard, RdEmptyState, RdField, RdPage, fieldClass, type BadgeTone } from "@/components/redesign/ui";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertCircle, FileText, Loader2, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

// ───────────────────────────── frame

export function DocPage({
  breadcrumb,
  title,
  subtitle,
  eyebrow,
  actions,
  record,
  back,
  children,
}: {
  breadcrumb: string;
  title: string;
  subtitle?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  record?: boolean;
  /** Route the Back button goes to; omit to hide it. */
  back?: string | "history";
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <PageShell title={breadcrumb} mainClassName="p-0">
      <RdPage
        title={title}
        subtitle={subtitle}
        eyebrow={eyebrow}
        actions={actions}
        record={record}
        onBack={back ? () => (back === "history" ? router.back() : router.push(back)) : undefined}
      >
        {children}
      </RdPage>
    </PageShell>
  );
}

/** Loading and error of a record, inside the frame and never a red box. */
export function DocState({ breadcrumb, kind, what, back }: { breadcrumb: string; kind: "loading" | "error"; what: string; back: string }) {
  return (
    <DocPage breadcrumb={breadcrumb} title={kind === "loading" ? "Loading" : "Something went wrong"} back={back} record>
      {kind === "loading" ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Loading {what}…
        </div>
      ) : (
        <RdEmptyState icon={AlertCircle} title={`We could not load ${what}`} body="Try again in a moment." action={<Button variant="outline" onClick={() => window.location.reload()}>Reload</Button>} />
      )}
    </DocPage>
  );
}

// ───────────────────────────── status

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  COMPLETED: { label: "Approved", tone: "success" },
  IN_PROGRESS: { label: "In approval", tone: "accent" },
  DRAFT: { label: "Draft", tone: "neutral" },
  active: { label: "Current", tone: "success" },
  approved: { label: "Approved", tone: "success" },
  approval: { label: "In approval", tone: "accent" },
  draft: { label: "Draft", tone: "neutral" },
  due: { label: "Review due", tone: "warning" },
  overdue: { label: "Review overdue", tone: "error" },
  current: { label: "Current", tone: "success" },
};
export const docStatus = (s: string) => STATUS[s] ?? { label: s, tone: "neutral" as BadgeTone };
export function StatusBadge({ status }: { status: string }) {
  const s = docStatus(status);
  return <RdBadge tone={s.tone}>{s.label}</RdBadge>;
}

/** Risk from a 1-16 score: grey, grey, amber, red, as the redesign's severity. */
export function RiskBadge({ score, withScore }: { score: number; withScore?: boolean }) {
  const [label, tone]: [string, BadgeTone] = score <= 4 ? ["Low", "neutral"] : score <= 9 ? ["Medium", "warning"] : ["High", "error"];
  return <RdBadge tone={tone}>{withScore ? `${label} (${score})` : label}</RdBadge>;
}

// ───────────────────────────── list

export function DocList<T extends { id: string }>({
  rows,
  loading,
  error,
  columns,
  basePath,
  words,
  noun,
  statusOf,
}: {
  rows: T[];
  loading: boolean;
  error: unknown;
  columns: RdColumn<T>[];
  basePath: string;
  /** The text of a row the search looks in. */
  words: (r: T) => string;
  noun: string;
  statusOf?: (r: T) => string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState("recent");
  if (error) return <RdEmptyState icon={AlertCircle} title={`We could not load the ${noun}`} body="Try again in a moment." />;
  if (loading) return <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" aria-hidden /> Loading…</div>;
  if (!rows.length) return <RdEmptyState icon={FileText} title={`No ${noun} yet`} body="Create the first one, or upload the PDFs you already use." />;
  const statuses = statusOf ? Array.from(new Set(rows.map(statusOf))) : [];
  const shown = rows
    .filter((r) => !picked.length || (statusOf && picked.includes(statusOf(r))))
    .filter((r) => !q.trim() || words(r).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (sort === "title" ? words(a).localeCompare(words(b)) : 0));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-2">
        <RdAsk value={q} onChange={setQ} />
        <RdToolbar
          filters={statuses.map((s) => ({ value: s, label: docStatus(s).label, count: rows.filter((r) => statusOf?.(r) === s).length }))}
          selected={picked}
          onToggle={(v) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
          sorts={[
            { value: "recent", label: "Most recent" },
            { value: "title", label: "Title, A to Z" },
          ]}
          sort={sort}
          onSort={setSort}
        />
      </div>
      {shown.length ? (
        <>
          <RdTable rows={shown} columns={columns} rowKey={(r) => r.id} onRow={(r) => router.push(`${basePath}/${r.id}`)} />
          <p className="text-xs text-text-subtle">
            Showing {shown.length} of {rows.length}
          </p>
        </>
      ) : (
        <RdEmptyState title="Nothing matches" body="Try other words, or clear the filters." />
      )}
    </div>
  );
}

// ───────────────────────────── record

export const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-text-subtle">{label}</dt>
      <dd className="text-sm text-foreground">{children || "—"}</dd>
    </div>
  );
}

export function Initials({ name }: { name?: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {(name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
    </span>
  );
}

export function PersonRow({ name, role }: { name?: string; role?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Initials name={name} />
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{name ?? "—"}</p>
        {role ? <p className="truncate text-xs text-text-subtle">{role}</p> : null}
      </div>
    </div>
  );
}

/** A card of the record: tinted title band, body padded. */
export function Block({ title, icon, children, className }: { title: string; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <RdCard title={title} icon={icon} className={className}>
      <div className="flex flex-col gap-4 p-4">{children}</div>
    </RdCard>
  );
}

/** A numbered or bulleted line inside a block: quiet grey row. */
export function Line({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warning" | "error" }) {
  return (
    <p className={cn("rounded-lg border border-border px-3 py-2 text-sm text-foreground", tone === "neutral" && "bg-surface-subtle", tone === "warning" && "bg-badge-warning", tone === "error" && "bg-badge-error")}>{children}</p>
  );
}

export function SubHead({ children }: { children: ReactNode }) {
  return <h4 className="text-sm font-semibold text-foreground">{children}</h4>;
}

/** Two columns on large screens: the record on the left, who and where on the right. */
export function RecordGrid({ main, aside }: { main: ReactNode; aside: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">{main}</div>
      <div className="flex flex-col gap-6">{aside}</div>
    </div>
  );
}

/** Owner, approvers, location and dates, the same right-hand card on every kind. */
export function PeopleAside({
  owner,
  issuer,
  approvers,
  location,
  assets,
  created,
  updated,
}: {
  owner?: { fullName?: string };
  issuer?: { fullName?: string };
  approvers?: { approverName?: string; role?: string; approvedAt?: string }[];
  location?: { name?: string };
  assets?: { name?: string }[];
  created?: string;
  updated?: string;
}) {
  return (
    <RdCard title="People and place">
      <div className="flex flex-col gap-5 p-4">
        <Fact label="Owner">
          <PersonRow name={owner?.fullName} />
        </Fact>
        {issuer ? (
          <Fact label="Issuer">
            <PersonRow name={issuer.fullName} />
          </Fact>
        ) : null}
        <Fact label="Approvers">
          {approvers?.length ? (
            <div className="flex flex-col gap-3">
              {approvers.map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <PersonRow name={a.approverName} role={a.role} />
                  {a.approvedAt ? <RdBadge tone="success">Approved</RdBadge> : <RdBadge tone="neutral">Pending</RdBadge>}
                </div>
              ))}
            </div>
          ) : null}
        </Fact>
        <Fact label="Location">{location?.name}</Fact>
        {assets?.length ? <Fact label="Assets">{assets.map((a) => a.name).join(", ")}</Fact> : null}
        <Fact label="Created">{fmt(created)}</Fact>
        <Fact label="Last updated">{fmt(updated)}</Fact>
      </div>
    </RdCard>
  );
}

/** Approve, reject and edit of a record: edit is the one primary action. */
export function RecordActions({ editPath }: { editPath: string }) {
  const router = useRouter();
  return (
    <>
      <Button variant="outline">Reject</Button>
      <Button variant="outline">Approve</Button>
      <Button onClick={() => router.push(editPath)}>Edit</Button>
    </>
  );
}

/** Slug, status and version as the line over a record. */
export function RecordMeta({ status, version, items }: { status?: string; version?: string; items: [string, string][] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
      {status ? <StatusBadge status={status} /> : null}
      {version ? <span>Version {version}</span> : null}
      {items.map(([k, v]) => (
        <span key={k}>
          {k}: <span className="text-foreground">{v}</span>
        </span>
      ))}
    </span>
  );
}

// ───────────────────────────── form

export function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <RdCard title={title}>
      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">{children}</div>
    </RdCard>
  );
}

export const TextField = ({ label, required, hint, className, ...props }: { label: string; required?: boolean; hint?: ReactNode; className?: string } & React.ComponentProps<"input">) => (
  <RdField label={label} required={required} hint={hint} className={className}>
    <Input {...props} />
  </RdField>
);

export const AreaField = ({ label, className, ...props }: { label: string; className?: string } & React.ComponentProps<"textarea">) => (
  <RdField label={label} className={className}>
    <Textarea className="min-h-24" {...props} />
  </RdField>
);

export const DateField = ({ label, ...props }: { label: string } & React.ComponentProps<"input">) => (
  <RdField label={label}>
    <input type="date" className={fieldClass} {...props} />
  </RdField>
);

/** The repeating part of a form (steps, sections), a dashed add row inside a card. */
export function AddRow({ title, add }: { title: string; add: string }) {
  return (
    <RdCard title={title}>
      <div className="p-4">
        <Button type="button" variant="outline" className="w-full border-dashed">
          + {add}
        </Button>
      </div>
    </RdCard>
  );
}

/** Approval flow and approvers, placeholder people from the plant. */
export function ApprovalCard({ description }: { description: string }) {
  return (
    <RdCard title="Approval">
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
          <PersonRow name="Maria Lopez" role="You" />
          <RdBadge tone="neutral">Owner</RdBadge>
        </div>
        <Button type="button" variant="outline" size="sm" className="w-fit">
          + Add approver
        </Button>
      </div>
    </RdCard>
  );
}

export function FormFooter({ draft, submit, onCancel }: { draft: string; submit: string; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-border pt-6">
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="button" variant="outline">
        {draft}
      </Button>
      <Button type="button">{submit}</Button>
    </div>
  );
}

export type { LucideIcon };
