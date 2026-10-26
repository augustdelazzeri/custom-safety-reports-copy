"use client";

import { RdAsk, RdTable, RdToolbar, type RdColumn } from "@/components/redesign/table";
import { Muted, RdEmptyState, RdPage, TitleCell } from "@/components/redesign/ui";
import { ActionStatusBadge, DueText, OriginBadge, PriorityBadge } from "@/components/screens/actions/parts";
import { useActions } from "@/components/screens/actions/use-actions";
import { DataModeSwitch } from "@/components/three-cases/data-mode-switch";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { PRIORITY_RANK, STATUS_LABEL, actionHref, dueIn, isOverdue, ownerName, placeName, type ActionRecord, type ActionStatus } from "@/lib/screens/actions";
import { ListChecks, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Words the ask field reads as filters, as the redesign's flags do; the rest of the question matches the rows' words. */
const FLAGS: { words: string[]; test: (a: ActionRecord) => boolean }[] = [
  { words: ["overdue", "late"], test: isOverdue },
  { words: ["no owner", "unassigned", "nobody owns"], test: (a) => !a.ownerId },
  { words: ["from an event", "from event"], test: (a) => Boolean(a.event) },
];

const SORTS = [
  { value: "due", label: "Due date, soonest first" },
  { value: "priority", label: "Priority, highest first" },
  { value: "newest", label: "Newest first" },
];

/** Open before closed, then the date that comes first. */
const byDue = (a: ActionRecord, b: ActionRecord) => Number(a.status === "closed") - Number(b.status === "closed") || (dueIn(a) ?? 9999) - (dueIn(b) ?? 9999);

/** Corrective actions, as in the redesign (lab-actions): the ask field and the toolbar, then the table. */
export default function ActionsPage() {
  const router = useRouter();
  const { all, mode } = useActions();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState("due");
  const actions = mode === "new" ? [] : all;
  // A link can ask the question for you (?q=overdue, from the dashboard).
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the address once after mount
    if (asked) setQ(asked);
  }, []);

  let words = q.trim().toLowerCase();
  const flags = FLAGS.filter((f) => f.words.some((w) => words.includes(w)));
  flags.forEach((f) => f.words.forEach((w) => (words = words.replace(w, " "))));
  const terms = words.split(/\s+/).filter(Boolean);

  const rows = actions
    .filter((a) => !picked.length || picked.includes(a.status))
    .filter((a) => flags.every((f) => f.test(a)))
    .filter((a) => {
      const text = `${a.ref} ${a.title} ${a.type} ${ownerName(a) ?? ""} ${placeName(a)} ${a.event?.ref ?? ""}`.toLowerCase();
      return terms.every((t) => text.includes(t));
    })
    .sort((a, b) => (sort === "priority" ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || byDue(a, b) : sort === "newest" ? b.ref.localeCompare(a.ref) : byDue(a, b)));

  const count = (s: ActionStatus) => actions.filter((a) => a.status === s).length;

  const columns: RdColumn<ActionRecord>[] = [
    { key: "title", header: "Action", render: (a) => <TitleCell title={a.title} reference={a.ref} /> },
    { key: "type", header: "Type", width: "16%", render: (a) => <OriginBadge action={a} /> },
    { key: "status", header: "Status", width: "13%", render: (a) => <ActionStatusBadge status={a.status} /> },
    { key: "priority", header: "Priority", width: "12%", render: (a) => <PriorityBadge priority={a.priority} /> },
    {
      key: "owner",
      header: "Owner",
      width: "16%",
      render: (a) => {
        const name = ownerName(a);
        return name ? <span className="block truncate">{name}</span> : <Muted>No owner</Muted>;
      },
    },
    { key: "due", header: "Due", width: "15%", render: (a) => <DueText action={a} className="block truncate" /> },
  ];

  return (
    <PageShell
      title="Corrective actions"
      mainClassName="p-0"
      prototypeBar={
        <div className="flex flex-wrap items-center gap-2">
          <DataModeSwitch />
          <p className="px-1 text-xs text-muted-foreground">Thiago&apos;s Corrective actions list. CAPA-0033 and every CAPA made by running an event&apos;s flow come from use case 3; the others are sample records.</p>
        </div>
      }
    >
      <RdPage
        title="Corrective actions"
        subtitle="What has to change so it does not happen again, and who owns it."
        actions={
          <Button className="gap-2" title="Opens the new action form (not part of this prototype)">
            <Plus className="size-4" /> Create an action
          </Button>
        }
      >
        {actions.length ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start gap-2">
              <RdAsk value={q} onChange={setQ} />
              <RdToolbar
                filters={(Object.keys(STATUS_LABEL) as ActionStatus[]).filter((s) => count(s) > 0).map((s) => ({ value: s, label: STATUS_LABEL[s], count: count(s) }))}
                selected={picked}
                onToggle={(v) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
                sorts={SORTS}
                sort={sort}
                onSort={setSort}
              />
            </div>
            {rows.length ? (
              <RdTable rows={rows} columns={columns} rowKey={(a) => a.id} onRow={(a) => router.push(actionHref(a))} />
            ) : (
              <RdEmptyState title="Nothing matches" body="Try other words, or clear the filters." />
            )}
            <p className="text-xs text-text-subtle">
              Showing {rows.length} of {actions.length}
            </p>
          </div>
        ) : (
          <RdEmptyState icon={ListChecks} title="No actions open" body="Corrective actions appear here once an event turns into work." />
        )}
      </RdPage>
    </PageShell>
  );
}
