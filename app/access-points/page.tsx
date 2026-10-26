"use client";

/**
 * Access points, as in the redesign (safety-redesign src/lab/pages/lab-access-points.tsx): every
 * QR code on the wall is one, and each opens the no-login report form. The list answers where
 * each code is, what it files against and whether people use it; a row opens the code itself on
 * the right, ready to print. Codes created or paused here live in this page only.
 */

import { AccessPointSheet, STATUS_LABEL } from "@/components/screens/access-points/access-point-sheet";
import { NewAccessPointDialog, type NewAccessPoint } from "@/components/screens/access-points/new-access-point-dialog";
import { RdAsk, RdTable, RdToolbar, type RdColumn } from "@/components/redesign/table";
import { Muted, RdBadge, RdEmptyState, RdPage, figmaButton } from "@/components/redesign/ui";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { ACCESS_POINTS, formatWhen, newAccessPointId, todayIso, type AccessPoint, type AccessPointStatus } from "@/lib/screens/access-points";
import { asset, locationName } from "@/lib/three-cases/data";
import { useDataMode } from "@/lib/three-cases/demo-data";
import { Plus, QrCode } from "lucide-react";
import { useState } from "react";

const where = (p: AccessPoint) => (p.locationId === "plant" ? "Company-wide" : locationName(p.locationId));

const SORTS = [
  { value: "last", label: "Last used, newest first" },
  { value: "reports", label: "Reports, most first" },
  { value: "name", label: "Name, A to Z" },
];

export default function AccessPointsPage() {
  const [mode] = useDataMode();
  const [created, setCreated] = useState<AccessPoint[]>([]);
  const [statusOf, setStatusOf] = useState<Record<string, AccessPointStatus>>({});
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState("last");
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [sheetOpen, setSheetOpen] = useState(false);

  // A brand-new account has no codes on its walls yet.
  const all = [...created, ...(mode === "new" ? [] : ACCESS_POINTS)].map((p) => ({ ...p, status: statusOf[p.id] ?? p.status }));
  const words = q.trim().toLowerCase();
  const rows = all
    .filter((p) => !picked.length || picked.includes(p.status))
    .filter((p) => !words || `${p.name} ${where(p)} ${p.assetId ? (asset(p.assetId)?.name ?? "") : ""} ${STATUS_LABEL[p.status]}`.toLowerCase().includes(words))
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "reports") return b.reports30d - a.reports30d;
      // A code never scanned counts from the end of the day it was made, so a new one lands on top.
      const last = (p: AccessPoint) => p.lastReportAt ?? `${p.createdAt}T24:00`;
      return last(b).localeCompare(last(a));
    });
  const selected = all.find((p) => p.id === selectedId);

  const open = (id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  };

  const create = (input: NewAccessPoint) => {
    const id = newAccessPointId(
      input.name,
      all.map((p) => p.id),
    );
    setCreated((list) => [{ id, ...input, status: "active", reports30d: 0, eventIds: [], createdAt: todayIso(), createdBy: "maria" }, ...list]);
    open(id);
  };

  const columns: RdColumn<AccessPoint>[] = [
    {
      key: "name",
      header: "Access point",
      render: (p) => (
        <span className="block truncate font-medium text-foreground" title={p.name}>
          {p.name}
        </span>
      ),
    },
    { key: "location", header: "Location", width: "17%", render: (p) => (p.locationId === "plant" ? <Muted>Company-wide</Muted> : <span className="block truncate">{where(p)}</span>) },
    {
      key: "asset",
      header: "Asset",
      width: "17%",
      render: (p) => {
        const a = p.assetId ? asset(p.assetId) : undefined;
        return a ? <span className="block truncate">{a.name}</span> : <Muted />;
      },
    },
    { key: "reports", header: "Reports (30 days)", width: "14%", render: (p) => <span className={p.reports30d ? "tabular-nums" : "text-muted-foreground tabular-nums"}>{p.reports30d}</span> },
    { key: "last", header: "Last used", width: "15%", render: (p) => (p.lastReportAt ? <span className="block truncate text-muted-foreground">{formatWhen(p.lastReportAt)}</span> : <Muted>Never used</Muted>) },
    { key: "status", header: "Status", width: "11%", render: (p) => <RdBadge tone={p.status === "active" ? "accent" : "neutral"}>{STATUS_LABEL[p.status]}</RdBadge> },
  ];

  const count = (s: AccessPointStatus) => all.filter((p) => p.status === s).length;

  return (
    <PageShell title="Access points" mainClassName="p-0">
      <RdPage
        title="Access points"
        subtitle="The QR codes on the wall. Anyone can report from one, with no login."
        actions={
          <Button type="button" className={figmaButton} onClick={() => setCreating(true)}>
            <Plus aria-hidden />
            New access point
          </Button>
        }
      >
        {all.length ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start gap-2">
              <RdAsk value={q} onChange={setQ} />
              <RdToolbar
                filters={(["active", "paused"] as const).map((s) => ({ value: s, label: STATUS_LABEL[s], count: count(s) }))}
                selected={picked}
                onToggle={(v) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                sorts={SORTS}
                sort={sort}
                onSort={setSort}
              />
            </div>
            {rows.length ? <RdTable rows={rows} columns={columns} rowKey={(p) => p.id} onRow={(p) => open(p.id)} /> : <RdEmptyState title="Nothing matches" body="Try other words, or clear the filters." />}
            <p className="text-xs text-text-subtle">
              Showing {rows.length} of {all.length}
            </p>
          </div>
        ) : (
          <RdEmptyState
            icon={QrCode}
            title="No access points yet"
            body="An access point is a QR code you print and stick where the work happens."
            action={
              <Button type="button" className={figmaButton} onClick={() => setCreating(true)}>
                <Plus aria-hidden />
                New access point
              </Button>
            }
          />
        )}
      </RdPage>

      <NewAccessPointDialog open={creating} onOpenChange={setCreating} takenNames={all.map((p) => p.name)} onCreate={create} />
      <AccessPointSheet
        point={selected}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onToggleStatus={(id) => {
          const current = all.find((p) => p.id === id)?.status;
          setStatusOf((s) => ({ ...s, [id]: current === "active" ? "paused" : "active" }));
        }}
      />
    </PageShell>
  );
}
