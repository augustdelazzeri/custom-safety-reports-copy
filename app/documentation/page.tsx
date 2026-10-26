"use client";

/**
 * Documentation: the five sidebar rows (JHA, SOP, LOTO, permits, audits) become five tabs of one
 * page, as in Thiago's redesign (safety-redesign src/lab/pages/lab-documentation.tsx). They are
 * the same shape of thing (a versioned document with an owner, a status and a review date), so
 * they get one list. The rows are the documents use case 2 reads; with the empty account each tab
 * shows the empty state.
 */

import { RdAsk, RdTable, RdToolbar, type RdColumn } from "@/components/redesign/table";
import { RdBadge, RdEmptyState, RdPage, RdTabs, TitleCell, Muted, menuItem, menuItemHint, menuTitle, type BadgeTone } from "@/components/redesign/ui";
import { DataModeSwitch } from "@/components/three-cases/data-mode-switch";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { person } from "@/lib/three-cases/data";
import { useDataMode } from "@/lib/three-cases/demo-data";
import { DOCS, getMvpAsset, type MvpDoc, type MvpKind } from "@/lib/three-cases/mvp-rules";
import { dateIn, fmtDate } from "@/lib/three-cases/real-jobs";
import { cn } from "@/lib/utils";
import { ChevronDown, FileText, FileUp, Plus } from "lucide-react";
import { useMemo, useState } from "react";

const TABS: { key: MvpKind; label: string; one: string }[] = [
  { key: "jha", label: "Job hazard analyses", one: "job hazard analysis" },
  { key: "sop", label: "Procedures", one: "procedure" },
  { key: "loto", label: "Lockout/tagout", one: "lockout/tagout" },
  { key: "ptw", label: "Permits", one: "permit" },
  { key: "audit", label: "Audits", one: "audit" },
];

type Status = "approved" | "approval" | "draft" | "due" | "overdue";
const STATUS: Record<Status, { label: string; tone: BadgeTone }> = {
  approved: { label: "Approved", tone: "success" },
  approval: { label: "In approval", tone: "accent" },
  draft: { label: "Draft", tone: "neutral" },
  due: { label: "Review due", tone: "warning" },
  overdue: { label: "Review overdue", tone: "error" },
};
const OWNERS = ["dan", "maria", "aisha", "dan", "carlos"];

interface DocRow {
  doc: MvpDoc;
  status: Status;
  review?: string;
  owner: string;
  where: string;
  assets: string;
}

/** A number from the reference, so each document keeps the same owner and review date on every visit. */
const seed = (ref: string) => ref.split("").reduce((n, c) => n + c.charCodeAt(0), 0);

function toRow(doc: MvpDoc): DocRow {
  const n = seed(doc.ref);
  const status: Status = doc.state === "valid" ? "approved" : doc.state === "awaiting" ? "approval" : doc.state === "draft" ? "draft" : doc.state === "expired" ? "overdue" : "due";
  const review = doc.state === "expired" ? dateIn(-(doc.days ?? 10)) : doc.state === "expiring" ? dateIn(doc.days ?? 7) : doc.state === "valid" ? dateIn(40 + (n % 280)) : undefined;
  const assets = doc.assetIds.map((id) => getMvpAsset(id)).filter((a): a is NonNullable<typeof a> => Boolean(a));
  return {
    doc,
    status,
    review,
    owner: person(OWNERS[n % OWNERS.length]).name,
    where: assets[0]?.location ?? "All locations",
    assets: assets.length ? `${assets[0].name}${assets.length > 1 ? ` +${assets.length - 1}` : ""}` : "Company program",
  };
}

function DocList({ kind, rows, empty }: { kind: (typeof TABS)[number]; rows: DocRow[]; empty: boolean }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState("review");

  if (empty) {
    return (
      <RdEmptyState
        icon={FileText}
        title={`No ${kind.label.toLowerCase()} yet`}
        body={`Upload the ones you use as PDFs: Safety reads each one, turns it into a draft ${kind.one} and links it to its assets. Or start one from scratch.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" className="gap-2" title="Opens the upload (not part of this prototype)">
              <FileUp className="size-4" /> Upload PDFs
            </Button>
            <Button className="gap-2" title="Opens the new document (not part of this prototype)">
              <Plus className="size-4" /> New {kind.one}
            </Button>
          </div>
        }
      />
    );
  }

  const words = q.trim().toLowerCase();
  const shown = rows
    .filter((r) => !picked.length || picked.includes(r.status))
    .filter((r) => !words || `${r.doc.ref} ${r.doc.title} ${r.assets} ${r.where} ${r.owner}`.toLowerCase().includes(words))
    .sort((a, b) => (sort === "title" ? a.doc.title.localeCompare(b.doc.title) : (a.review ?? "9999").localeCompare(b.review ?? "9999")));

  const columns: RdColumn<DocRow>[] = [
    { key: "title", header: "Title", render: (r) => <TitleCell title={r.doc.title} reference={r.doc.ref} /> },
    { key: "status", header: "Status", width: "15%", render: (r) => <RdBadge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</RdBadge> },
    { key: "assets", header: "Assets", width: "18%", render: (r) => <span className="block truncate">{r.assets}</span> },
    { key: "owner", header: "Owner", width: "14%", render: (r) => <span className="block truncate">{r.owner}</span> },
    { key: "location", header: "Location", width: "14%", render: (r) => <span className="block truncate">{r.where}</span> },
    {
      key: "review",
      header: "Next review",
      width: "14%",
      render: (r) => (r.review ? <span className={cn(r.status === "overdue" && "font-medium text-badge-error-foreground")}>{fmtDate(r.review)}</span> : <Muted>No review date</Muted>),
    },
  ];

  const counts = (s: Status) => rows.filter((r) => r.status === s).length;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-2">
        <RdAsk value={q} onChange={setQ} />
        <RdToolbar
          filters={(Object.keys(STATUS) as Status[]).filter((s) => counts(s) > 0).map((s) => ({ value: s, label: STATUS[s].label, count: counts(s) }))}
          selected={picked}
          onToggle={(v) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
          sorts={[
            { value: "review", label: "Next review, soonest first" },
            { value: "title", label: "Title, A to Z" },
          ]}
          sort={sort}
          onSort={setSort}
        />
      </div>
      {shown.length ? (
        <>
          <RdTable rows={shown} columns={columns} rowKey={(r) => r.doc.ref} onRow={() => undefined} />
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

export default function DocumentationPage() {
  const [mode] = useDataMode();
  const empty = mode !== "sample";
  const [active, setActive] = useState<MvpKind>("jha");
  const rows = useMemo(() => DOCS.map(toRow), []);

  return (
    <PageShell
      title="Documentation"
      mainClassName="p-0"
      prototypeBar={
        <div className="flex flex-wrap items-center gap-2">
          <DataModeSwitch />
          <p className="px-1 text-xs text-muted-foreground">Thiago&apos;s Documentation page: the five document types are tabs of one page. The rows are the documents use case 2 reads.</p>
        </div>
      }
    >
      <RdPage
        title="Documentation"
        subtitle="The written safety standards. Five kinds, one place."
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" className="gap-2">
                <Plus className="size-4" /> New document <ChevronDown className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[260px] p-2">
              <p className={cn(menuTitle, "pb-2")}>Which kind?</p>
              {[TABS.find((t) => t.key === active)!, ...TABS.filter((t) => t.key !== active)].map((t) => (
                <button key={t.key} type="button" className={cn(menuItem, "justify-between")} title="Opens the new document (not part of this prototype)">
                  {t.label}
                  {t.key === active ? <span className={menuItemHint}>This tab</span> : null}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        }
      >
        <RdTabs
          onChange={(k) => setActive(k as MvpKind)}
          tabs={TABS.map((t) => {
            const list = rows.filter((r) => r.doc.type === t.key);
            return { key: t.key, label: t.label, count: empty ? 0 : list.length, render: () => <DocList kind={t} rows={list} empty={empty} /> };
          })}
        />
      </RdPage>
    </PageShell>
  );
}
