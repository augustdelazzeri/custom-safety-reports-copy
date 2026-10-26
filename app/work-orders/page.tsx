"use client";

import { AssetCell, AssigneeCell, DueCell, PriorityBadge, SourceBadge, StatusBadge } from "@/components/screens/work-orders/cells";
import { WorkOrderSheet } from "@/components/screens/work-orders/work-order-sheet";
import { RdAsk, RdTable, RdToolbar, type RdColumn } from "@/components/redesign/table";
import { RdEmptyState, RdPage, RdTabs, TitleCell } from "@/components/redesign/ui";
import { DataModeSwitch } from "@/components/three-cases/data-mode-switch";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { useDataMode } from "@/lib/three-cases/demo-data";
import { useMvpStore } from "@/lib/three-cases/mvp-rules";
import { WO_PRIORITY_LABEL, WO_STATUS_LABEL, assigneeName, buildWorkOrders, isOpen, isOverdue, type SafetyWoRow, type WoStatus } from "@/lib/screens/work-orders";
import { Clipboard, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/** The job-first flow of use case 2 (F2): where a new Safety work order starts. */
const NEW_WO_HREF = "/safety-execution/f2";

const PRIORITY_RANK = { high: 0, medium: 1, low: 2, none: 3 } as const;
const SORTS = [
  { value: "due", label: "Due date, soonest first" },
  { value: "priority", label: "Priority, highest first" },
  { value: "newest", label: "Newest first" },
];

const columns: RdColumn<SafetyWoRow>[] = [
  { key: "title", header: "Work order", render: (r) => <TitleCell title={r.title} reference={r.ref} /> },
  { key: "asset", header: "Asset", width: "15%", render: (r) => <AssetCell row={r} /> },
  { key: "status", header: "Status", width: "11%", render: (r) => <StatusBadge status={r.status} /> },
  { key: "priority", header: "Priority", width: "9%", render: (r) => <PriorityBadge priority={r.priority} /> },
  { key: "assignee", header: "Assigned to", width: "14%", render: (r) => <AssigneeCell row={r} /> },
  { key: "due", header: "Due", width: "10%", render: (r) => <DueCell row={r} /> },
  { key: "source", header: "Came from", width: "14%", render: (r) => <SourceBadge row={r} /> },
];

/** The ask field reads a few words as filters (as the redesign's does), the rest as text. */
function matches(row: SafetyWoRow, q: string) {
  let words = q.trim().toLowerCase();
  if (!words) return true;
  const flags: [RegExp, (r: SafetyWoRow) => boolean][] = [
    [/\boverdue\b|\blate\b/, isOverdue],
    [/\bunassigned\b|\bnobody( assigned)?\b|\bno assignee\b/, (r) => !r.assigneeId],
  ];
  for (const [re, test] of flags) {
    if (re.test(words)) {
      if (!test(row)) return false;
      words = words.replace(re, " ").trim();
    }
  }
  if (!words) return true;
  const hay = [row.ref, row.title, row.asset?.name, row.asset?.code, row.location, assigneeName(row), row.source.ref, row.source.title, row.source.via, WO_STATUS_LABEL[row.status], WO_PRIORITY_LABEL[row.priority]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return words.split(/\s+/).every((w) => hay.includes(w));
}

function WorkOrderList({ rows, statuses, onOpen, emptyTitle, emptyBody }: { rows: SafetyWoRow[]; statuses: WoStatus[]; onOpen: (row: SafetyWoRow) => void; emptyTitle: string; emptyBody: string }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<WoStatus[]>([]);
  const [sort, setSort] = useState("due");

  if (!rows.length) return <RdEmptyState icon={Clipboard} title={emptyTitle} body={emptyBody} />;

  const shown = rows
    .filter((r) => !picked.length || picked.includes(r.status))
    .filter((r) => matches(r, q))
    .sort((a, b) => {
      if (sort === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (sort === "newest") return b.ref.localeCompare(a.ref);
      return 0;
    });
  const count = (s: WoStatus) => rows.filter((r) => r.status === s).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-2">
        <RdAsk value={q} onChange={setQ} />
        <RdToolbar
          filters={statuses.filter((s) => count(s) > 0).map((s) => ({ value: s, label: WO_STATUS_LABEL[s], count: count(s) }))}
          selected={picked}
          onToggle={(v) => setPicked((p) => (p.includes(v as WoStatus) ? p.filter((x) => x !== v) : [...p, v as WoStatus]))}
          sorts={SORTS}
          sort={sort}
          onSort={setSort}
        />
      </div>
      {shown.length ? <RdTable rows={shown} columns={columns} rowKey={(r) => r.id} onRow={onOpen} /> : <RdEmptyState title="Nothing matches" body="Try other words, or clear the filters." />}
      <p className="text-xs text-text-subtle">
        Showing {shown.length} of {rows.length}
      </p>
    </div>
  );
}

/**
 * Safety work orders, the plain list (safety-redesign lab-work-orders.tsx): the work Safety sent to the
 * CMMS, from an event, a corrective action, a document or a job, and whether anyone has it. New work
 * order opens the job-first flow of use case 2 (F2).
 */
export default function WorkOrdersPage() {
  const [mode] = useDataMode();
  return <WorkOrdersScreen key={mode} mode={mode} />;
}

function WorkOrdersScreen({ mode }: { mode: "sample" | "no-docs" | "new" }) {
  const { flows, executions } = useThreeCases();
  // F2 keeps the empty accounts' work orders apart from the sample plant's, so this list does too.
  const mvp = useMvpStore(mode !== "sample");
  const [openId, setOpenId] = useState<string>();
  // A link from A1 or a CAPA lands on its work order open (?wo=WO-1042).
  const [openRef, setOpenRef] = useState<string>();
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("wo");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the address once after mount
    if (ref) setOpenRef(ref);
  }, []);

  const rows = useMemo(
    () => buildWorkOrders({ flows, made: mvp.wos, jobs: mvp.jobs, executions, plant: mode !== "new", withDocs: mode === "sample" }),
    [flows, mvp.wos, mvp.jobs, executions, mode],
  );
  const open = rows.filter(isOpen);
  const selected = rows.find((r) => r.id === openId) ?? (openRef ? rows.find((r) => r.ref === openRef) : undefined);

  const newButton = (
    <Button asChild className="gap-2">
      <Link href={NEW_WO_HREF}>
        <Plus className="size-4" /> New work order
      </Link>
    </Button>
  );

  return (
    <PageShell
      title="Safety work orders"
      mainClassName="p-0"
      prototypeBar={
        <div className="flex flex-wrap items-center gap-2">
          <DataModeSwitch />
          <p className="px-1 text-xs text-muted-foreground">
            Thiago&apos;s Safety work orders list. New work order opens the job-first flow of use case 2 (F2). The rows are the work orders of the event flows, the ones made in F2 and option F, and the rest of the sample plant.
          </p>
        </div>
      }
    >
      <RdPage title="Safety work orders" subtitle="Work dispatched from an event, a document or a corrective action — and whether anyone has it." actions={newButton}>
        {rows.length ? (
          <RdTabs
            tabs={[
              {
                key: "open",
                label: "Open",
                count: open.length,
                render: () => <WorkOrderList rows={open} statuses={["open", "in_progress", "on_hold"]} onOpen={(r) => setOpenId(r.id)} emptyTitle="Nothing open" emptyBody="Every Safety work order is complete." />,
              },
              {
                key: "all",
                label: "All work orders",
                count: rows.length,
                render: () => <WorkOrderList rows={rows} statuses={["open", "in_progress", "on_hold", "complete"]} onOpen={(r) => setOpenId(r.id)} emptyTitle="No work orders yet" emptyBody="These appear once an event, a document or an action is dispatched." />,
              },
            ]}
          />
        ) : (
          <RdEmptyState
            icon={Clipboard}
            title="No work orders yet"
            body="These appear once an event, a document or an action is dispatched."
            action={
              /* The title row keeps the one primary action. */
              <Button asChild variant="outline" className="gap-2">
                <Link href={NEW_WO_HREF}>
                  <Plus className="size-4" /> New work order
                </Link>
              </Button>
            }
          />
        )}
      </RdPage>
      <WorkOrderSheet
        row={selected}
        onClose={() => {
          setOpenId(undefined);
          setOpenRef(undefined);
        }}
      />
    </PageShell>
  );
}
