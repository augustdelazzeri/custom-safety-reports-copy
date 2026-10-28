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
import { OWNERS, SDS_ROWS, seed, type SdsRow, type SdsStatus } from "@/lib/screens/docs";
import { person } from "@/lib/three-cases/data";
import { useDataMode } from "@/lib/three-cases/demo-data";
import { DOCS, getMvpAsset, type MvpDoc, type MvpKind } from "@/lib/three-cases/mvp-rules";
import { dateIn, fmtDate } from "@/lib/three-cases/real-jobs";
import { cn } from "@/lib/utils";
import { ChevronDown, FileText, FileUp, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

/** The six documentation rows of today's sidebar, in its order, as tabs, with the redesign's short labels. The SDS library was "Library" in the redesign's sidebar. */
type TabKey = MvpKind | "sds";
const TABS: { key: TabKey; label: string; one: string }[] = [
  { key: "jha", label: "Job hazard analyses", one: "job hazard analysis" },
  { key: "sop", label: "Procedures", one: "procedure" },
  { key: "loto", label: "Lockout/tagout", one: "lockout/tagout" },
  { key: "ptw", label: "Permits", one: "permit" },
  { key: "audit", label: "Audits", one: "audit" },
  { key: "sds", label: "SDS library", one: "safety data sheet" },
];

/** Where a row opens, and where "New" goes (the SDS library has no new form: it is an upload). */
const ROUTE: Record<TabKey, string> = { jha: "/jhas", sop: "/sops", loto: "/lotos", ptw: "/ptws", audit: "/audits", sds: "/sds" };
const NEW_ROUTE: Partial<Record<TabKey, string>> = { jha: "/jhas/new", sop: "/sops/new", loto: "/lotos/new", ptw: "/ptws/new", audit: "/audits/new" };

// ───────────────────────────── SDS library

const SDS_STATUS: Record<SdsStatus, { label: string; tone: BadgeTone }> = {
  current: { label: "Current", tone: "success" },
  due: { label: "Review due", tone: "warning" },
  overdue: { label: "Review overdue", tone: "error" },
};
// Sheets revised before this year show the year, so "Dec 1" is not read as five weeks from now.
const fmtRevised = (iso: string) =>
  iso.slice(0, 4) === dateIn(0).slice(0, 4) ? fmtDate(iso) : new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function SdsList({ empty }: { empty: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState("revision");
  if (empty) {
    return (
      <RdEmptyState
        icon={FileText}
        title="No safety data sheets yet"
        body="Upload the SDS PDFs from your suppliers: Safety reads the product, the maker and the hazards, and files each one where the chemical is used."
        action={
          <Button variant="outline" className="gap-2" title="Opens the upload (not part of this prototype)">
            <FileUp className="size-4" /> Upload SDS
          </Button>
        }
      />
    );
  }
  const words = q.trim().toLowerCase();
  const rows = SDS_ROWS.filter((r) => !picked.length || picked.includes(r.status))
    .filter((r) => !words || `${r.ref} ${r.product} ${r.maker} ${r.where} ${r.hazards.join(" ")}`.toLowerCase().includes(words))
    .sort((a, b) => (sort === "product" ? a.product.localeCompare(b.product) : b.revisedDaysAgo - a.revisedDaysAgo));
  const counts = (s: SdsStatus) => SDS_ROWS.filter((r) => r.status === s).length;
  const columns: RdColumn<SdsRow>[] = [
    { key: "product", header: "Product", render: (r) => <TitleCell title={r.product} reference={r.ref} /> },
    { key: "maker", header: "Manufacturer", width: "15%", render: (r) => <span className="block truncate">{r.maker}</span> },
    {
      key: "hazards",
      header: "Hazards",
      width: "20%",
      render: (r) => (
        <span className="flex flex-wrap gap-1">
          {r.hazards.map((h) => (
            <RdBadge key={h} tone={h === "Flammable" || h === "Corrosive" || h === "Toxic" ? "warning" : "neutral"}>
              {h}
            </RdBadge>
          ))}
        </span>
      ),
    },
    { key: "where", header: "Location", width: "16%", render: (r) => <span className="block truncate">{r.where}</span> },
    { key: "revised", header: "Revised", width: "11%", render: (r) => <span className="whitespace-nowrap text-muted-foreground">{fmtRevised(dateIn(-r.revisedDaysAgo))}</span> },
    { key: "status", header: "Status", width: "13%", render: (r) => <RdBadge tone={SDS_STATUS[r.status].tone}>{SDS_STATUS[r.status].label}</RdBadge> },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-2">
        <RdAsk value={q} onChange={setQ} />
        <RdToolbar
          filters={(Object.keys(SDS_STATUS) as SdsStatus[]).map((s) => ({ value: s, label: SDS_STATUS[s].label, count: counts(s) }))}
          selected={picked}
          onToggle={(v) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
          sorts={[
            { value: "revision", label: "Oldest revision first" },
            { value: "product", label: "Product, A to Z" },
          ]}
          sort={sort}
          onSort={setSort}
        />
      </div>
      {rows.length ? <RdTable rows={rows} columns={columns} rowKey={(r) => r.ref} onRow={(r) => router.push(`${ROUTE.sds}/${r.ref}`)} /> : <RdEmptyState title="Nothing matches" body="Try other words, or clear the filters." />}
      <p className="text-xs text-text-subtle">
        Showing {rows.length} of {SDS_ROWS.length}
      </p>
    </div>
  );
}

type Status = "approved" | "approval" | "draft" | "due" | "overdue";
const STATUS: Record<Status, { label: string; tone: BadgeTone }> = {
  approved: { label: "Approved", tone: "success" },
  approval: { label: "In approval", tone: "accent" },
  draft: { label: "Draft", tone: "neutral" },
  due: { label: "Review due", tone: "warning" },
  overdue: { label: "Review overdue", tone: "error" },
};

interface DocRow {
  doc: MvpDoc;
  status: Status;
  review?: string;
  owner: string;
  where: string;
  assets: string;
}


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
  const router = useRouter();
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
            <Button className="gap-2" onClick={() => router.push(NEW_ROUTE[kind.key] ?? ROUTE[kind.key])}>
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
          <RdTable rows={shown} columns={columns} rowKey={(r) => r.doc.ref} onRow={(r) => router.push(`${ROUTE[kind.key]}/${r.doc.ref}`)} />
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
  const router = useRouter();
  const [mode] = useDataMode();
  const empty = mode !== "sample";
  const [active, setActive] = useState<TabKey>("jha");
  const rows = useMemo(() => DOCS.map(toRow), []);

  return (
    <PageShell
      title="Documentation"
      mainClassName="p-0"
      prototypeBar={
        <div className="flex flex-wrap items-center gap-2">
          <DataModeSwitch />
          <p className="px-1 text-xs text-muted-foreground">Thiago&apos;s Documentation page: the six documentation rows of today&apos;s sidebar, SDS library included, are tabs of one page. The rows are the documents use case 2 reads.</p>
        </div>
      }
    >
      <RdPage
        title="Documentation"
        subtitle="The written safety standards and the safety data sheets. Six kinds, one place."
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
                <button key={t.key} type="button" className={cn(menuItem, "justify-between")} onClick={() => router.push(NEW_ROUTE[t.key] ?? ROUTE[t.key])}>
                  {t.label}
                  {t.key === active ? <span className={menuItemHint}>This tab</span> : null}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        }
      >
        <RdTabs
          onChange={(k) => setActive(k as TabKey)}
          tabs={TABS.map((t) => {
            if (t.key === "sds") return { key: t.key, label: t.label, count: empty ? 0 : SDS_ROWS.length, render: () => <SdsList empty={empty} /> };
            const list = rows.filter((r) => r.doc.type === t.key);
            return { key: t.key, label: t.label, count: empty ? 0 : list.length, render: () => <DocList kind={t} rows={list} empty={empty} /> };
          })}
        />
      </RdPage>
    </PageShell>
  );
}
