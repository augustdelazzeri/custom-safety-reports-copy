"use client";

import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { EVENTS, event as getEvent, person } from "@/lib/three-cases/data";
import type { KV } from "@/lib/three-cases/nova";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Loader2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STATUS_LABEL, recordHref } from "./event-flow";
import { NovaCard, NovaChips, NovaFrame, NovaThumbs, UserBubble } from "./nova-panel";

/** What Nova already did inside the policy since yesterday. Undo is per item. */
const HANDLED = [
  { id: "h1", title: "Closed 3 observations", detail: "SE-2031, SE-2033, SE-2035 · fixed on the spot, photos attached" },
  { id: "h2", title: "Set Dan Brooks as owner of CAPA-0041", detail: "It had no owner for 6 days; Dan owns the Maintenance Shop" },
  { id: "h3", title: "Texted Tom Becker about WO-1042", detail: "Die cart for CAPA-0033 · 2 days late" },
];

/** Events where the usual flow fits the policy: Nova proposes it, a person approves. */
const USUAL: { eventId: string; optionIds: string[]; summary: string }[] = [
  { eventId: "ev-2040", optionIds: ["o1", "o2"], summary: "Lock out now and replace the button · CAPA to Dan Brooks" },
  { eventId: "ev-2038", optionIds: ["o1", "o3"], summary: "Replace the hose, stock a spill kit · CAPA to Dan Brooks" },
];

/** How many of the usual flows are still waiting for approval. */
export const usualReady = (flows: Record<string, { decided: boolean; status: string }>) =>
  USUAL.filter((u) => !flows[u.eventId]?.decided && flows[u.eventId]?.status !== "closed").length;

type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "nova"; text: string; intro?: boolean; cards?: KV[][]; ran?: string[]; followups?: string[] };

const CHIPS = ["What is waiting on others?", "Who is late?", "Close the light out in aisle 7"];

/**
 * Nova in the Inbox: replaces the separate Autopilot screen. It says what it already did inside
 * the policy (undo any of it), proposes the usual flow where it fits and leaves the rest to you.
 */
export function InboxNova({ onClose, className }: { onClose: () => void; className?: string }) {
  const { flows, runEventFlow, closeEvent } = useThreeCases();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m0",
      role: "nova",
      intro: true,
      text: "Since yesterday I handled 3 things inside your policy. Undo anything.",
      followups: CHIPS,
    },
  ]);
  const [thinking, setThinking] = useState(false);

  const say = (m: Omit<Extract<Msg, { role: "nova" }>, "id" | "role">) =>
    setMessages((list) => [...list, { id: `n${list.length}`, role: "nova", ...m }]);

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    setMessages((m) => [...m, { id: `u${m.length}`, role: "user", text }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      const t = text.toLowerCase();
      if (t.includes("waiting") || t.includes("others")) {
        const waiting = EVENTS.filter((e) => flows[e.id]?.capaStatus === "open");
        say({
          text: waiting.length ? `${waiting.length} CAPA${waiting.length > 1 ? "s are" : " is"} waiting on work orders. Each owner gets an update when one changes.` : "Nothing is waiting on others.",
          cards: waiting.map((e) => {
            const f = flows[e.id];
            const done = f.wos.filter((w) => w.status === "complete").length;
            const late = f.updates.some((u) => u.tone === "late");
            return [
              { label: f.capaRef ?? "CAPA", value: `${done} of ${f.wos.length} work orders done` },
              { label: "Owner", value: person(e.capaDefaults?.ownerId ?? "dan").name },
              { label: "Event", value: `${e.ref} · ${STATUS_LABEL[f.status]}` },
              ...(late ? [{ label: "Attention", value: "WO-1042 is 2 days late" }] : []),
            ];
          }),
          followups: ["Who is late?"],
        });
        return;
      }
      if (t.includes("late") || t.includes("overdue")) {
        say({
          text: "WO-1042, the die cart for CAPA-0033, is 2 days late with Tom Becker. I texted him this morning. Carlos has room on Monday.",
          followups: ["Move WO-1042 to Carlos", "What is waiting on others?"],
        });
        return;
      }
      if (t.includes("move") && t.includes("1042")) {
        say({ text: "WO-1042 is now with Carlos Rivera for Monday. Dan Brooks got the update on CAPA-0033." });
        return;
      }
      if (t.includes("aisle") || t.includes("light")) {
        closeEvent("ev-2037", "Closed by Nova: the aisle still meets lighting levels.");
        say({ text: "Closed EVT-2037. The aisle still meets lighting levels with the other fixtures, so no CAPA. It is in Done if you want to reopen it." });
        return;
      }
      say({
        text: "I can run the usual flow on an event, tell you what is waiting on others, chase late work orders, or close what needs nothing.",
        followups: CHIPS,
      });
    }, 900);
  };

  return (
    <NovaFrame
      greeting="Hi Kaue. How can I help?"
      onSend={send}
      thinking={thinking}
      thinkingText="Reading events, CAPAs and work orders…"
      followKey={messages.length}
      onClose={onClose}
      className={className}
    >
      {messages.map((m) =>
        m.role === "user" ? (
          <UserBubble key={m.id}>{m.text}</UserBubble>
        ) : (
          <div key={m.id} className="space-y-3">
            <p className="text-[15px] leading-7 text-foreground">{m.text}</p>
            {m.intro ? (
              <>
                <HandledList />
                <p className="text-[15px] leading-7 text-foreground">
                  Two events fit the usual flow. EVT-2041 is OSHA recordable, so it stays with you.
                </p>
                <UsualFlows
                  onRan={(ids) => {
                    say({ text: "Done. Records created, nothing closed:", ran: ids, followups: ["What is waiting on others?"] });
                  }}
                  run={(eventId, optionIds) => runEventFlow(eventId, optionIds, [])}
                />
              </>
            ) : null}
            {m.cards?.map((c, i) => <NovaCard key={i} rows={c} />)}
            {m.ran ? (
              <ul className="space-y-1.5">
                {m.ran.map((id) => {
                  const ev = getEvent(id);
                  const f = flows[id];
                  if (!ev || !f) return null;
                  return (
                    <li key={id} className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground">
                      <div className="font-medium text-foreground">{ev.ref} · In review</div>
                      <div className="mt-0.5 flex flex-wrap gap-x-2">
                        {f.capaRef ? (
                          <Link href={recordHref(f.capaRef)} className="font-mono text-badge-accent-foreground hover:underline">
                            {f.capaRef}
                          </Link>
                        ) : null}
                        {f.wos.map((w) => (
                          <Link key={w.ref} href={recordHref(w.ref)} className="font-mono text-badge-accent-foreground hover:underline">
                            {w.ref}
                          </Link>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {m.followups?.length ? <NovaChips items={m.followups} onPick={send} /> : null}
            <NovaThumbs />
          </div>
        ),
      )}
    </NovaFrame>
  );
}

function HandledList() {
  const [undone, setUndone] = useState<string[]>([]);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-foreground">Done by Nova</div>
      <ul>
        {HANDLED.map((h) => {
          const off = undone.includes(h.id);
          return (
            <li key={h.id} className="flex items-start gap-2.5 border-b border-border px-3 py-2 last:border-b-0">
              {off ? <Undo2 className="mt-0.5 size-4 shrink-0 text-text-placeholder" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-badge-success-foreground" />}
              <div className="min-w-0 flex-1">
                <div className={cn("text-sm font-medium", off ? "text-text-placeholder line-through" : "text-foreground")}>{h.title}</div>
                <div className="truncate text-xs text-muted-foreground">{off ? "Undone" : h.detail}</div>
              </div>
              <button
                onClick={() => setUndone((u) => (off ? u.filter((x) => x !== h.id) : [...u, h.id]))}
                className="shrink-0 text-xs font-medium text-badge-accent-foreground hover:underline"
              >
                {off ? "Redo" : "Undo"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function UsualFlows({ run, onRan }: { run: (eventId: string, optionIds: string[]) => void; onRan: (ids: string[]) => void }) {
  const { flows } = useThreeCases();
  const [checked, setChecked] = useState<string[]>(USUAL.map((u) => u.eventId));
  const [queue, setQueue] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const open = USUAL.filter((u) => !flows[u.eventId]?.decided && flows[u.eventId]?.status !== "closed");
  const pending = open.filter((u) => checked.includes(u.eventId));
  const running = queue.length > 0;

  useEffect(() => {
    if (!running) return;
    if (step >= queue.length) {
      onRan(queue);
      setQueue([]);
      setStep(0);
      return;
    }
    const t = setTimeout(() => {
      const u = USUAL.find((x) => x.eventId === queue[step]);
      if (u) run(u.eventId, u.optionIds);
      setStep((s) => s + 1);
    }, 500);
    return () => clearTimeout(t);
  }, [running, step, queue, run, onRan]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-foreground">Proposed by Nova</div>
      <ul>
        {USUAL.map((u) => {
          const ev = getEvent(u.eventId)!;
          const f = flows[u.eventId];
          const decided = Boolean(f?.decided) || f?.status === "closed";
          const idx = queue.indexOf(u.eventId);
          return (
            <li key={u.eventId} className="flex items-start gap-2.5 border-b border-border px-3 py-2 last:border-b-0">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                {decided ? (
                  <CheckCircle2 className="size-4 text-badge-success-foreground" />
                ) : running && idx === step ? (
                  <Loader2 className="size-4 animate-spin text-badge-accent-foreground" />
                ) : running && idx > step ? (
                  <Clock className="size-3.5 text-text-placeholder" />
                ) : (
                  <input
                    type="checkbox"
                    checked={checked.includes(u.eventId)}
                    onChange={(e) => setChecked((c) => (e.target.checked ? [...c, u.eventId] : c.filter((x) => x !== u.eventId)))}
                    className="size-4 rounded accent-[#3e63dd]"
                    aria-label={ev.title}
                  />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className={cn("truncate text-sm font-medium", decided ? "text-muted-foreground" : "text-foreground")}>{ev.title}</div>
                <div className="truncate text-xs text-muted-foreground">{decided ? `Decided · ${f?.capaRef ?? "closed"}` : u.summary}</div>
              </div>
            </li>
          );
        })}
      </ul>
      {pending.length > 0 || running ? (
        <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
          <span className="text-xs text-muted-foreground">{running ? `Running ${step} of ${queue.length}` : `${pending.length} selected`}</span>
          <button
            disabled={running}
            onClick={() => {
              setQueue(pending.map((p) => p.eventId));
              setStep(0);
            }}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {running ? "Working…" : "Run checked"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
