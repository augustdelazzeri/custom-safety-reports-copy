"use client";

import {
  INITIAL_IDS,
  KIND_META,
  NOVA_CHIPS,
  interpretNova,
  proposal as getProposal,
  type KV,
  type NovaReply,
  type Proposal,
  type ProposalKind,
} from "@/lib/three-cases/nova";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  Maximize2,
  Menu,
  Mic,
  Minimize2,
  Plus,
  Repeat,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Nova's mark, as Learn and the Safety redesign draw it: a glowing gradient ball. */
export function NovaBall({ className }: { className?: string }) {
  return (
    <span className={cn("relative block size-4 shrink-0", className)} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/nova/ball-background.png" alt="" className="absolute -top-1.5 left-1/2 size-7 max-w-none -translate-x-1/2" />
      <span className="absolute inset-0 overflow-hidden rounded-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nova/ball-gradient.svg" alt="" className="absolute -left-px top-0 h-4 w-[26px] max-w-none" />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/nova/ball-glare.svg" alt="" className="absolute left-[3px] top-0.5 w-2 max-w-none mix-blend-overlay" />
    </span>
  );
}

export const KIND_ICON: Record<ProposalKind, React.ComponentType<{ className?: string }>> = {
  wo: Wrench,
  pm: Repeat,
  doc: FileText,
  training: GraduationCap,
  event: CheckCheck,
  capa: CheckCheck,
  wo_close: CheckCheck,
  assign: UserPlus,
};

export const TONE_TEXT: Record<string, string> = {
  indigo: "text-indigo-600",
  amber: "text-amber-600",
  sky: "text-sky-600",
  teal: "text-teal-600",
  emerald: "text-emerald-600",
  violet: "text-violet-600",
};

const CHIP_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#14B8A6"];

const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

/**
 * Nova's frame as in the CMMS: a full-height side panel with its header, the conversation and the
 * message bar. Pages put their own messages inside.
 */
export function NovaFrame({
  greeting,
  children,
  onSend,
  thinking,
  thinkingText = "Reading the calendar, documents and work orders…",
  followKey,
  maximized,
  onToggleMax,
  onClose,
  className,
}: {
  greeting: string;
  children: ReactNode;
  onSend: (text: string) => void;
  thinking: boolean;
  thinkingText?: string;
  /** Changes when a message is added, so the conversation follows it. */
  followKey: number;
  maximized?: boolean;
  onToggleMax?: () => void;
  onClose?: () => void;
  className?: string;
}) {
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Follow the conversation, but open on the greeting.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [followKey, thinking]);

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    setInput("");
    onSend(text);
  };

  return (
    <aside className={cn("flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-[#fafafa] shadow-xl", className)}>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3">
        <div className="flex items-center gap-2">
          <button className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" aria-label="Conversations">
            <Menu className="size-4" />
          </button>
          <NovaBall />
          <span className="text-sm font-semibold text-gray-900">Nova</span>
        </div>
        <div className="flex items-center">
          {onToggleMax ? (
            <button onClick={onToggleMax} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" aria-label={maximized ? "Restore" : "Maximize"}>
              {maximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          ) : null}
          {onClose ? (
            <button onClick={onClose} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" aria-label="Close Nova">
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <h2 className="text-center text-xl font-semibold text-gray-900">{greeting}</h2>
        {children}
        {thinking ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="size-4 animate-spin" /> {thinkingText}
          </div>
        ) : null}
      </div>

      <form
        className="shrink-0 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-md">
          <textarea
            id="nova-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask anything"
            className="w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-gray-400"
          />
          <div className="flex items-center justify-between">
            <button type="button" className="flex size-8 items-center justify-center rounded-full border border-gray-200 text-gray-600" aria-label="Attach">
              <Plus className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <button type="button" className="flex size-8 items-center justify-center rounded-full border border-gray-200 text-gray-600" aria-label="Dictate">
                <Mic className="size-4" />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="flex size-8 items-center justify-center rounded-full bg-[#3e63dd] text-white disabled:bg-[#3e63dd]/40"
                aria-label="Send"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </aside>
  );
}

/** The person's message, as Nova draws it. */
export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-3xl bg-[#c6d4fb]/50 px-4 py-2 text-sm text-gray-900 shadow-sm">{children}</div>
  );
}

/** Nova's key-value card (uppercase labels on the left). */
export function NovaCard({ rows }: { rows: KV[] }) {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{row.label}</span>
          <span className="text-right text-sm text-gray-900">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Nova's follow-up chips. */
export function NovaChips({ items, onPick }: { items: string[]; onPick: (text: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((f, i) => (
        <button
          key={f}
          onClick={() => onPick(f)}
          className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <CalendarClock className="size-3.5 shrink-0" style={{ color: CHIP_COLORS[i % CHIP_COLORS.length] }} />
          {f}
        </button>
      ))}
    </div>
  );
}

export function NovaThumbs() {
  return (
    <div className="flex gap-2 text-gray-500">
      <ThumbsUp className="size-4" />
      <ThumbsDown className="size-4" />
    </div>
  );
}

type Msg = { id: string; role: "user"; text: string } | { id: string; role: "nova"; reply: NovaReply };

const INTRO: NovaReply = {
  text: "I went through the next two weeks: documents, inspections, open events and CAPAs, work orders and Learn. Three things to do first.",
  proposals: INITIAL_IDS,
  followups: NOVA_CHIPS.slice(0, 3),
};

/**
 * Nova as the side panel of the Compliance Calendar, laid out like Nova in the CMMS and in Safety
 * today (header, conversation, suggestion chips, message bar), but able to act: it proposes work
 * of every kind, three at a time, and creates it once approved.
 */
export function NovaPanel({
  userName,
  listed,
  isDone,
  dayOf,
  hrefOf,
  focusId,
  maximized,
  onApprove,
  onList,
  onMove,
  onOpenPlan,
  onClose,
  onToggleMax,
  className,
}: {
  userName: string;
  listed: string[];
  isDone: (p: Proposal) => boolean;
  dayOf: (p: Proposal) => string;
  hrefOf: (p: Proposal) => string | undefined;
  focusId: string | null;
  maximized: boolean;
  onApprove: (id: string) => void;
  onList: (ids: string[]) => void;
  onMove: (from: string, to: string) => void;
  onOpenPlan: (jobId: string) => void;
  onClose: () => void;
  onToggleMax: () => void;
  className?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([{ id: "m0", role: "nova", reply: INTRO }]);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (!focusId) return;
    document.querySelector(`[data-proposal="${focusId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId]);

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    setMessages((m) => [...m, { id: `u${m.length}`, role: "user", text }]);
    setThinking(true);
    setTimeout(() => {
      const reply = interpretNova(text, listed);
      if (reply.proposals) onList(reply.proposals);
      if (reply.move) onMove(reply.move.from, reply.move.to);
      setMessages((m) => [...m, { id: `n${m.length}`, role: "nova", reply }]);
      setThinking(false);
    }, 1100);
  };

  const summarize = (ids: string[]) => {
    const ps = ids.map((id) => getProposal(id)).filter(Boolean) as Proposal[];
    const count = (kinds: ProposalKind[]) => ps.filter((p) => kinds.includes(p.kind)).length;
    const docs = count(["doc"]);
    const courses = count(["training"]);
    const parts = [
      count(["wo", "pm"]) && `${count(["wo", "pm"])} scheduled`,
      docs && `${docs} document${docs === 1 ? "" : "s"} updated`,
      courses && `${courses} Learn course${courses === 1 ? "" : "s"} assigned or updated`,
      count(["event", "capa", "wo_close"]) && `${count(["event", "capa", "wo_close"])} closed`,
      count(["assign"]) && `${count(["assign"])} assigned`,
    ].filter(Boolean);
    const permits = ps.some((p) => p.jobId === "fl03-clean" || p.jobId === "hp04-clean");
    setMessages((m) => [
      ...m,
      {
        id: `n${m.length}`,
        role: "nova",
        reply: {
          text: `Done: ${parts.join(", ")}.${permits ? " The permit went to Maria Lopez and Dan Brooks; nothing reaches a technician before they approve." : ""}`,
          followups: ["What else this week?", "What's overdue?"],
        },
      },
    ]);
  };

  return (
    <NovaFrame
      greeting={`Hi ${userName}. How can I help?`}
      onSend={send}
      thinking={thinking}
      followKey={messages.length}
      maximized={maximized}
      onToggleMax={onToggleMax}
      onClose={onClose}
      className={className}
    >
      {messages.map((m) =>
        m.role === "user" ? (
          <UserBubble key={m.id}>{m.text}</UserBubble>
        ) : (
          <div key={m.id} className="space-y-3">
            <p className="text-[15px] leading-7 text-gray-900">{m.reply.text}</p>
            {m.reply.cards?.map((card, i) => <NovaCard key={i} rows={card} />)}
            {m.reply.proposals?.length ? (
              <ProposalBlock
                ids={m.reply.proposals}
                isDone={isDone}
                dayOf={dayOf}
                hrefOf={hrefOf}
                focusId={focusId}
                onApprove={onApprove}
                onApproved={summarize}
                onOpenPlan={onOpenPlan}
              />
            ) : null}
            {m.reply.followups?.length ? <NovaChips items={m.reply.followups} onPick={send} /> : null}
            <NovaThumbs />
          </div>
        ),
      )}
    </NovaFrame>
  );
}

/** "Proposed by Nova": the same checklist-and-approve pattern Nova uses for captures, one short row each. */
function ProposalBlock({
  ids,
  isDone,
  dayOf,
  hrefOf,
  focusId,
  onApprove,
  onApproved,
  onOpenPlan,
}: {
  ids: string[];
  isDone: (p: Proposal) => boolean;
  dayOf: (p: Proposal) => string;
  hrefOf: (p: Proposal) => string | undefined;
  focusId: string | null;
  onApprove: (id: string) => void;
  onApproved: (ids: string[]) => void;
  onOpenPlan: (jobId: string) => void;
}) {
  const items = ids.map((id) => getProposal(id)).filter(Boolean) as Proposal[];
  const [checked, setChecked] = useState<string[]>(ids);
  const [queue, setQueue] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const pending = items.filter((p) => !isDone(p) && checked.includes(p.id));
  const running = queue.length > 0;

  useEffect(() => {
    if (!running) return;
    if (step >= queue.length) {
      onApproved(queue);
      setQueue([]);
      setStep(0);
      return;
    }
    const t = setTimeout(() => {
      onApprove(queue[step]);
      setStep((s) => s + 1);
    }, 320);
    return () => clearTimeout(t);
  }, [running, step, queue, onApprove, onApproved]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5">
        <span className="text-xs font-semibold text-gray-800">Proposed by Nova</span>
        <span className="text-[11px] text-gray-500">
          {items.filter(isDone).length} of {items.length} done
        </span>
      </div>
      <ul>
        {items.map((p) => {
          const done = isDone(p);
          const idx = queue.indexOf(p.id);
          const working = running && idx === step;
          const waiting = running && idx > step;
          const Icon = KIND_ICON[p.kind];
          const meta = KIND_META[p.kind];
          const href = hrefOf(p);
          return (
            <li
              key={p.id}
              data-proposal={p.id}
              title={`${meta.label}: ${p.detail}\nWhy: ${p.why}`}
              className={cn(
                "flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 last:border-b-0",
                focusId === p.id && "bg-indigo-50/70 ring-1 ring-inset ring-indigo-300",
              )}
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                {done ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : working ? (
                  <Loader2 className="size-4 animate-spin text-blue-500" />
                ) : waiting ? (
                  <Clock className="size-3.5 text-gray-400" />
                ) : (
                  <input
                    type="checkbox"
                    checked={checked.includes(p.id)}
                    onChange={(e) => setChecked((c) => (e.target.checked ? [...c, p.id] : c.filter((x) => x !== p.id)))}
                    className="size-4 rounded accent-[#3e63dd]"
                    aria-label={p.title}
                  />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("size-3.5 shrink-0", TONE_TEXT[meta.tone])} />
                  <span className={cn("truncate text-sm font-medium", done ? "text-gray-500" : "text-gray-900")}>{p.title}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-gray-500">{fmtDay(dayOf(p))}</span>
                </div>
                {done ? (
                  <div className="truncate text-xs text-emerald-700">
                    {p.result}
                    {href ? (
                      <Link href={href} className="ml-1 font-medium text-indigo-700 hover:underline">
                        Open
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1.5 text-xs text-gray-500">
                    <span className="truncate">{p.why}</span>
                    {p.jobId ? (
                      <button onClick={() => onOpenPlan(p.jobId as string)} className="shrink-0 font-medium text-indigo-700 hover:underline">
                        Plan
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {pending.length > 0 || running ? (
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-3 py-2">
          <span className="text-xs text-gray-500">{running ? `Creating ${step} of ${queue.length}` : `${pending.length} selected`}</span>
          <button
            disabled={running || pending.length === 0}
            onClick={() => {
              setQueue(pending.map((p) => p.id));
              setStep(0);
            }}
            className="rounded-full bg-[#3e63dd] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#3557c5] disabled:opacity-50"
          >
            {running ? "Working…" : "Approve checked"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
