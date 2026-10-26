"use client";

/**
 * One Safety work order, on the right of the list. It answers what the redesign's work order page
 * answers first (lab-work-order-detail.tsx): who has it, when it is due and what it came from; then
 * the documents and the checklist that went with it. Read only: the work is done in the CMMS.
 */

import { RdBadge, RdCard, RdNotice, figmaButton } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { WO_SOURCE_LABEL, assigneeName, isOverdue, type SafetyWoRow } from "@/lib/screens/work-orders";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText, Link2, ListChecks, Pause, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PriorityBadge, StatusBadge } from "./cells";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-foreground">{children}</span>
    </div>
  );
}

export function WorkOrderSheet({ row, onClose }: { row?: SafetyWoRow; onClose: () => void }) {
  const late = row ? isOverdue(row) : false;
  const who = row ? assigneeName(row) : undefined;

  return (
    <Sheet open={row !== undefined} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" onOpenAutoFocus={(e) => e.preventDefault()} className="w-full gap-0 p-0 sm:max-w-120 [&>button:last-child]:hidden">
        {row ? (
          <>
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium tracking-[0.02em] text-text-subtle tabular-nums">{row.ref}</p>
                <SheetTitle className="text-xl leading-6 font-bold">{row.title}</SheetTitle>
                <SheetDescription className="mt-1">{row.asset ? `${row.asset.name} · ${row.location}` : row.location}</SheetDescription>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
                <X aria-hidden />
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 [&>*]:shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={row.status} />
                <PriorityBadge priority={row.priority} />
                {late ? <RdBadge tone="error">Overdue</RdBadge> : null}
              </div>

              {row.status === "on_hold" && row.holdReason ? (
                <RdNotice icon={Pause} title="On hold">
                  {row.holdReason}
                </RdNotice>
              ) : null}
              {!who && row.status !== "complete" ? (
                <RdNotice icon={TriangleAlert} title="Nobody assigned">
                  Until someone is, this work order is work nobody is doing.
                </RdNotice>
              ) : null}

              <RdCard>
                <div className="divide-y divide-border">
                  <Fact label="Asset">
                    {row.asset ? (
                      <>
                        {row.asset.name}
                        {row.asset.code ? <span className="text-muted-foreground"> · {row.asset.code}</span> : null}
                      </>
                    ) : (
                      <span className="text-muted-foreground">No asset</span>
                    )}
                  </Fact>
                  <Fact label="Location">{row.location || "—"}</Fact>
                  <Fact label="Assigned to">{who ?? <span className="font-medium text-badge-warning-foreground">Nobody assigned</span>}</Fact>
                  <Fact label="Due">
                    {row.due ? <span className={cn(late && "font-medium text-badge-error-foreground", row.status === "complete" && "text-muted-foreground")}>{row.due}</span> : <span className="text-muted-foreground">No due date</span>}
                  </Fact>
                  {row.status === "complete" && row.doneAt ? <Fact label="Completed">{row.doneAt}</Fact> : null}
                  <Fact label="Created">{row.created ?? "—"}</Fact>
                </div>
              </RdCard>

              <RdCard title="Came from" icon={<Link2 />}>
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <RdBadge tone="accent">{row.source.ref}</RdBadge>
                    <span className="text-sm text-muted-foreground">
                      {WO_SOURCE_LABEL[row.source.kind]}
                      {row.source.via ? ` · from ${row.source.via}` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{row.source.title}</p>
                  {/* The footer already opens the same page. */}
                  {row.source.href && row.source.href !== row.openHref ? (
                    <Link href={row.source.href} className="w-fit text-sm font-medium text-primary hover:underline">
                      {row.source.kind === "job" ? "Open the job view" : row.source.kind === "document" ? "Open in Documentation" : row.source.kind === "calendar" ? "Open the Compliance calendar" : `Open ${row.source.via ?? row.source.ref}`}
                    </Link>
                  ) : null}
                </div>
              </RdCard>

              <RdCard title="Linked documents" icon={<FileText />}>
                {row.docs.length ? (
                  <ul className="divide-y divide-border">
                    {row.docs.map((d) => (
                      <li key={d.ref} className="flex items-center gap-3 px-4 py-3 text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground" title={d.title}>
                            {d.title}
                          </p>
                          <p className="text-xs font-medium tracking-[0.02em] text-text-subtle">
                            {d.ref} · {d.kind}
                          </p>
                        </div>
                        {d.state ? <RdBadge tone={d.state.tone}>{d.state.label}</RdBadge> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-sm text-muted-foreground">No documents attached.</p>
                )}
              </RdCard>

              <RdCard title="Checklist" icon={<ListChecks />}>
                {row.checklist ? (
                  <div className="flex flex-col gap-3 p-4">
                    <p className="text-sm text-muted-foreground">{row.checklist.name}</p>
                    <ol className="flex flex-col gap-2">
                      {row.checklist.items.map((item, i) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground tabular-nums">{i + 1}</span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <p className="p-4 text-sm text-muted-foreground">No checklist.</p>
                )}
              </RdCard>

              {row.description ? (
                <RdCard title="Description">
                  <p className="p-4 text-sm text-foreground">{row.description}</p>
                </RdCard>
              ) : null}

              <p className="text-sm text-muted-foreground">This is the Safety view of the work order. The work itself is carried out in UpKeep CMMS.</p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border px-6 py-4">
              <Button type="button" variant="outline" size="sm" className={figmaButton} disabled title="Opens the work order in UpKeep CMMS (not part of this prototype)">
                <ExternalLink aria-hidden />
                View in CMMS
              </Button>
              {row.openHref ? (
                <Button asChild size="sm" className={figmaButton}>
                  <Link href={row.openHref}>{row.openLabel ?? "Open"}</Link>
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
