"use client";

import { RdBadge, RdPage, type BadgeTone } from "@/components/redesign/ui";
import { EventFlowPanel, nextStepLabel } from "@/components/three-cases/event-flow";
import { InboxNova, usualReady } from "@/components/three-cases/inbox-nova";
import { NovaBall } from "@/components/three-cases/nova-panel";
import { CASE_C_OPTIONS, OptionSwitcher } from "@/components/three-cases/option-switcher";
import { PageShell, TapCompare } from "@/components/three-cases/shell";
import { Button } from "@/components/ui/button";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { EVENTS } from "@/lib/three-cases/data";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bell, CalendarClock, Check, ClipboardCheck, Clock, FileCheck, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

// Items that already exist in the production Inbox (approvals, CAPAs, compliance tasks).
const EXISTING = [
  { id: "a1", icon: FileCheck, title: "LOTO-0030 Dock leveler 2 isolation, version 2.0", source: "Documentation approval", action: "Approve", overdue: false },
  { id: "c1", icon: ClipboardCheck, title: "CAPA-0039 Guard missing on band saw", source: "CAPA", action: "Review", overdue: true },
  { id: "t1", icon: CalendarClock, title: "Eyewash weekly test", source: "Compliance task", action: "Complete", overdue: false },
];

const NEXT_TONE: Record<string, BadgeTone> = { todo: "accent", ai: "accent", wait: "warning", done: "success" };
const SEVERITY_TONE: Record<string, BadgeTone> = { Critical: "error", High: "warning", Medium: "neutral", Low: "neutral" };

/** A group of the queue, as on Today: a 16px heading with its count, then the rows in one card. */
function Group({ title, count, icon, children }: { title: string; count: number; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <h2 className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-foreground">
          {icon}
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      <ul className="overflow-hidden rounded-[var(--lab-radius)] border border-border">{children}</ul>
    </section>
  );
}

export default function InboxPage() {
  const { flows } = useThreeCases();
  const [selected, setSelected] = useState<string>(EVENTS[0].id);
  const [novaOpen, setNovaOpen] = useState(false);
  // Waiting on work orders or closed: shown faded, nothing to do here yet.
  const rows = EVENTS.map((e) => ({ e, next: nextStepLabel(e, flows[e.id]) }));
  const toDo = rows.filter((r) => r.next.tone === "todo" || r.next.tone === "ai").length;
  const count = toDo + EXISTING.length;
  const ready = usualReady(flows);

  return (
    <PageShell
      title="Today"
      mainClassName="p-0 overflow-hidden"
      aside={novaOpen ? <InboxNova onClose={() => setNovaOpen(false)} className="w-[400px]" /> : null}
      prototypeBar={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <OptionSwitcher caseLabel="Use case 3" options={CASE_C_OPTIONS} />
          <TapCompare today="28 clicks" todayDetail="measured on staging: event 6, CAPA 7, work order 4, OSHA form 11" here="2 clicks" />
        </div>
      }
    >
      <RdPage
        fill
        title={`Today · ${count}`}
        subtitle="Everything currently waiting on you across Safety."
        actions={
          !novaOpen ? (
            <Button variant="outline" onClick={() => setNovaOpen(true)} className="gap-2">
              <NovaBall /> Nova did 3 things{ready ? ` · ${ready} flow${ready > 1 ? "s" : ""} ready` : ""}
            </Button>
          ) : null
        }
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="flex min-h-0 flex-col gap-6 overflow-y-auto">
            <Group
              title="New events, triaged by AI"
              icon={<Sparkles className="size-4 text-badge-accent-foreground" />}
              count={rows.filter((r) => !flows[r.e.id]?.decided && flows[r.e.id]?.status !== "closed").length}
            >
              {rows.map(({ e, next }) => {
                const flow = flows[e.id];
                const decided = Boolean(flow?.decided) || flow?.status === "closed";
                const faded = next.tone === "wait" || next.tone === "done";
                const Icon = !decided ? AlertTriangle : next.tone === "wait" ? Clock : next.tone === "done" ? Check : Bell;
                return (
                  <li key={e.id} className="border-b border-border last:border-b-0">
                    <button
                      onClick={() => setSelected(e.id)}
                      aria-pressed={selected === e.id}
                      className={cn("flex w-full items-center gap-4 px-4 py-3 text-left transition-colors", selected === e.id ? "bg-muted" : "hover:bg-muted/50", faded && selected !== e.id && "opacity-60")}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-sm leading-5 font-medium text-foreground">{e.title}</span>
                        <span className="mt-1 flex items-center gap-2 overflow-hidden text-sm whitespace-nowrap text-muted-foreground">
                          <RdBadge tone={SEVERITY_TONE[e.severity]}>{e.severity}</RdBadge>
                          <span className="truncate">
                            {e.type} · {e.reportedAt}
                          </span>
                        </span>
                      </span>
                      <RdBadge tone={decided ? NEXT_TONE[next.tone] : "accent"} className="shrink-0">
                        {decided ? next.label : "Decide"}
                      </RdBadge>
                    </button>
                  </li>
                );
              })}
            </Group>

            <Group title="Already in the Inbox today" count={EXISTING.length}>
              {EXISTING.map((item) => (
                <li key={item.id} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <item.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm leading-5 font-medium text-foreground">{item.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{item.source}</span>
                  </span>
                  {item.overdue ? <RdBadge tone="error">Overdue</RdBadge> : null}
                  <RdBadge>{item.action}</RdBadge>
                </li>
              ))}
            </Group>
          </div>

          <div className="min-h-0 overflow-y-auto rounded-[var(--lab-radius)] border border-border p-6">
            <EventFlowPanel eventId={selected} />
          </div>
        </div>
      </RdPage>
    </PageShell>
  );
}
