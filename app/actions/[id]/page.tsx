"use client";

import { Muted, RdBadge, RdCard, RdEmptyState, RdNotice, RdPage, fieldClass } from "@/components/redesign/ui";
import { ActionStatusBadge, DueText, NextStep, PriorityBadge } from "@/components/screens/actions/parts";
import { useActions } from "@/components/screens/actions/use-actions";
import { PageShell } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { PEOPLE, person } from "@/lib/three-cases/data";
import { daysFromDemoToday } from "@/lib/three-cases/sources";
import { WO_STATUS_LABEL, WO_STATUS_TONE, assetName, ownerName, placeName, type ActionRecord } from "@/lib/screens/actions";
import { cn } from "@/lib/utils";
import { ArrowRight, Link2, ListChecks, Pencil, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState, type ReactNode } from "react";

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="mt-0.5 text-sm font-medium text-foreground">{children}</div>
  </div>
);

const Text = ({ children, empty }: { children?: ReactNode; empty: string }) => <p className="text-sm leading-relaxed text-foreground">{children || <span className="text-muted-foreground">{empty}</span>}</p>;

/** The next step of an action, or that nothing waits on it (the redesign's CAPA record). */
function nextStep(a: ActionRecord) {
  if (a.status === "closed") return <NextStep message="This action is complete. Nothing is waiting on it." />;
  if (!a.ownerId) return <NextStep tone="warning" message="This action has no owner, so nobody will pick it up. Name one in the details." />;
  const open = a.workOrders.filter((w) => w.status !== "complete");
  const first = open.find((w) => w.status === "in_progress") ?? open[0];
  if (first) {
    const late = -(daysFromDemoToday(first.due) ?? 0);
    return (
      <NextStep
        tone={late > 0 ? "warning" : "done"}
        message={`Work order ${first.ref} is with ${person(first.assigneeId).name}${late > 0 ? `, ${late} day${late === 1 ? "" : "s"} late` : ""}.${open.length > 1 ? ` ${open.length - 1} more still open.` : ""}`}
      />
    );
  }
  if (a.workOrders.length) {
    const only = a.workOrders.length === 1;
    return <NextStep message={only ? `Work order ${a.workOrders[0].ref} is complete — this action can be closed.` : `All ${a.workOrders.length} work orders are complete — this action can be closed.`} />;
  }
  return (
    <NextStep
      message={a.plan.length ? `No work orders. ${ownerName(a)} closes it when the actions are done.` : "Dispatch a work order so somebody owns this."}
      action={
        <Button type="button" variant="outline" size="sm" title="Dispatch a work order so somebody owns this (not part of this prototype)">
          Create a work order
        </Button>
      }
    />
  );
}

/** A corrective action, as in the redesign (lab-capa-detail): status and origin, the next step, the details, then the plan and its work. */
export default function ActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { all, hydrated, close, reopen, setOwner } = useActions();
  const [confirmClose, setConfirmClose] = useState(false);
  const [editingOwner, setEditingOwner] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState("");
  const back = () => router.push("/actions");
  const a = all.find((x) => x.id === id.toLowerCase());

  if (!a) {
    return (
      <PageShell title="Corrective actions" mainClassName="p-0">
        <RdPage record title="" onBack={back}>
          {hydrated ? <RdEmptyState icon={ListChecks} title="This action does not exist" body="The link may be wrong, or it was made in another browser." /> : null}
        </RdPage>
      </PageShell>
    );
  }

  const openWos = a.workOrders.filter((w) => w.status !== "complete");
  const closed = a.status === "closed";
  const owner = ownerName(a);
  const where = assetName(a);

  return (
    <PageShell title={a.title} mainClassName="p-0">
      <RdPage
        record
        eyebrow={a.ref}
        title={a.title}
        onBack={back}
        actions={
          closed ? (
            a.fromFlow ? null : (
              <Button type="button" variant="outline" onClick={() => reopen(a)}>
                Reopen
              </Button>
            )
          ) : (
            <Button type="button" variant="outline" onClick={() => (openWos.length ? setConfirmClose(true) : close(a))}>
              Mark complete
            </Button>
          )
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <ActionStatusBadge status={a.status} />
          <PriorityBadge priority={a.priority} />
          <RdBadge>{a.type}</RdBadge>
          {a.event ? (
            a.event.id ? (
              <Link href={`/events/${a.event.id}`} className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <RdBadge tone="accent">
                  <Link2 aria-hidden />
                  Came from an event · {a.event.ref}
                </RdBadge>
              </Link>
            ) : (
              <RdBadge tone="accent">
                <Link2 aria-hidden />
                Came from an event · {a.event.ref}
              </RdBadge>
            )
          ) : null}
        </div>

        {confirmClose && !closed ? (
          /* Closing while work orders are open is allowed (the fix may have happened outside the software), never silently. */
          <RdNotice
            icon={TriangleAlert}
            title={`${openWos.length} work order${openWos.length > 1 ? "s are" : " is"} still open.`}
            action={
              <>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    close(a);
                    setConfirmClose(false);
                  }}
                >
                  Close it and its work orders
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setConfirmClose(false)}>
                  Cancel
                </Button>
              </>
            }
          >
            Close the corrective action anyway? The work order{openWos.length > 1 ? "s" : ""} will be closed too.
          </RdNotice>
        ) : (
          nextStep(a)
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-6">
            <RdCard title="Root cause" padded>
              <Text empty="Not written yet.">{a.rootCause}</Text>
            </RdCard>

            <RdCard title="What is being done" padded={!a.plan.length}>
              {a.plan.length ? (
                <ol className="flex flex-col">
                  {a.plan.map((step, i) => (
                    <li key={step} className="flex gap-3 border-b border-border px-4 py-3 text-sm text-foreground last:border-b-0">
                      <span className="w-4 shrink-0 text-muted-foreground tabular-nums">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <Text empty="Nothing written yet." />
              )}
            </RdCard>

            <RdCard title="Work orders" action={a.workOrders.length ? <span className="text-sm text-muted-foreground tabular-nums">{a.workOrders.length - openWos.length} of {a.workOrders.length} complete</span> : undefined} padded={!a.workOrders.length}>
              {a.workOrders.length ? (
                <ul className="flex flex-col">
                  {a.workOrders.map((w) => {
                    const late = w.status !== "complete" && (daysFromDemoToday(w.due) ?? 0) < 0;
                    return (
                      <li key={w.ref} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-3 text-sm last:border-b-0">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground" title={w.title}>
                            {w.title}
                          </p>
                          <p className="text-xs font-medium tracking-[0.02em] text-text-subtle">{w.ref}</p>
                        </div>
                        <span className="text-muted-foreground">{person(w.assigneeId).name}</span>
                        <span className={cn("w-28 text-right", late ? "font-medium text-badge-error-foreground" : "text-muted-foreground")}>{w.status === "complete" ? `Done ${w.doneAt ?? ""}` : `Due ${w.due}`}</span>
                        <RdBadge tone={WO_STATUS_TONE[w.status]} className="w-24 justify-center">
                          {WO_STATUS_LABEL[w.status]}
                        </RdBadge>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Text empty="No work orders yet." />
              )}
            </RdCard>

            <RdCard title="History">
              {a.history.length ? (
                <ol className="flex flex-col">
                  {a.history.map((h, i) => (
                    <li key={`${h.at}-${i}`} className="flex gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0">
                      <span className="w-14 shrink-0 text-muted-foreground tabular-nums">{h.at}</span>
                      <span className={cn("min-w-0", h.tone === "late" ? "text-badge-error-foreground" : "text-foreground")}>{h.text}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">Nothing has changed here yet.</p>
              )}
            </RdCard>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <RdCard title="Details" padded>
              <div className="flex flex-col gap-4">
                <Fact label="Owner">
                  {editingOwner ? (
                    <div className="mt-1 flex flex-col gap-2">
                      <select value={ownerDraft} onChange={(e) => setOwnerDraft(e.target.value)} className={fieldClass} aria-label="Owner">
                        <option value="">No owner</option>
                        {PEOPLE.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {p.role}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="xs"
                          onClick={() => {
                            if ((ownerDraft || undefined) !== a.ownerId) setOwner(a, ownerDraft || null);
                            setEditingOwner(false);
                          }}
                        >
                          Save
                        </Button>
                        <Button type="button" variant="outline" size="xs" onClick={() => setEditingOwner(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setOwnerDraft(a.ownerId ?? "");
                        setEditingOwner(true);
                      }}
                      className="group inline-flex items-center gap-2 rounded-sm text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {owner ? <span>{owner}</span> : <span className="text-badge-warning-foreground">No owner — add one</span>}
                      <Pencil className="size-3.5 text-muted-foreground opacity-60 group-hover:opacity-100" aria-label="Edit" />
                    </button>
                  )}
                </Fact>
                <Fact label="Due">
                  <DueText action={a} />
                </Fact>
                <Fact label="Priority">{a.priority}</Fact>
                <Fact label="Location">
                  {placeName(a)}
                  {where ? <span className="block font-normal text-muted-foreground">{where}</span> : null}
                </Fact>
                <Fact label="Created">{a.createdAt}</Fact>
                {a.closedAt ? <Fact label="Closed">{a.closedAt}</Fact> : null}
              </div>
            </RdCard>

            <RdCard title={a.event ? "Linked event" : "Where it came from"} padded>
              {a.event ? (
                <div className="flex flex-col gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.event.title}</p>
                    <p className="text-xs font-medium tracking-[0.02em] text-text-subtle">{a.event.ref}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.event.type} · reported {a.event.reportedAt} by {a.event.reportedBy}
                  </p>
                  {a.event.id ? (
                    <Link href={`/events/${a.event.id}`} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-badge-accent-foreground hover:underline">
                      Open the event <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  ) : (
                    <Muted>The event page is not part of this prototype.</Muted>
                  )}
                </div>
              ) : (
                <Text empty="Created on its own, not from an event.">{a.source}</Text>
              )}
            </RdCard>

            <RdCard title="How it will be verified" padded>
              <Text empty="Not written yet.">{a.verification}</Text>
            </RdCard>
          </div>
        </div>
      </RdPage>
    </PageShell>
  );
}
