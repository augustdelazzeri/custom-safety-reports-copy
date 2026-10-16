"use client";

import {
  GROUP_ORDER,
  INITIAL_IDS,
  KIND_META,
  NOVA_CHIPS,
  interpretNova,
  proposal as getProposal,
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
import { useEffect, useRef, useState } from "react";

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

type Msg = { id: string; role: "user"; text: string } | { id: string; role: "nova"; reply: NovaReply };

const INTRO: NovaReply = {
  text: "I went through the next two weeks: your SOPs and LOTOs, inspections, open events and CAPAs, work orders and Learn records. This is what I would do. Uncheck anything you don't want.",
  proposals: INITIAL_IDS,
  followups: NOVA_CHIPS,
};

const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

/**
 * Nova as the side panel of the Compliance Calendar, laid out like Nova in the CMMS and in Safety
 * today (header, conversation, suggestion chips, message bar), but able to act: it proposes work
 * of every kind and creates it once approved.
 */
export function NovaPanel({
  userName,
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
}: {
  userName: string;
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
}) {
  const [messages, setMessages] = useState<Msg[]>([{ id: "m0", role: "nova", reply: INTRO }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Follow the conversation, but open on the greeting and the first proposals.
  useEffect(() => {
    if (messages.length === 1 && !thinking) return;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, thinking]);

  useEffect(() => {
    if (!focusId) return;
    document.querySelector(`[data-proposal="${focusId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId]);

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    setMessages((m) => [...m, { id: `u${m.length}`, role: "user", text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = interpretNova(text);
      if (reply.proposals) onList(reply.proposals);
      if (reply.move) onMove(reply.move.from, reply.move.to);
      setMessages((m) => [...m, { id: `n${m.length}`, role: "nova", reply }]);
      setThinking(false);
    }, 1100);
  };

  const summarize = (ids: string[]) => {
    const ps = ids.map((id) => getProposal(id)).filter(Boolean) as Proposal[];
    const count = (kinds: ProposalKind[]) => ps.filter((p) => kinds.includes(p.kind)).length;
    const parts = [
      count(["wo", "pm"]) && `${count(["wo", "pm"])} scheduled`,
      count(["doc", "training"]) && `${count(["doc", "training"])} documents and courses updated`,
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
          text: `Done: ${parts.join(", ")}.${permits ? " The permits went to Maria Lopez and Dan Brooks; nothing reaches a technician before they approve." : ""}`,
          followups: ["What's overdue?", "Who is free next week?"],
        },
      },
    ]);
  };

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-[#fafafa]">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-2">
        <div className="flex items-center gap-1.5">
          <button className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" aria-label="Conversations">
            <Menu className="size-4" />
          </button>
          <NovaBall />
          <span className="text-sm font-semibold text-gray-900">Nova</span>
        </div>
        <div className="flex items-center">
          <button onClick={onToggleMax} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" aria-label={maximized ? "Restore" : "Maximize"}>
            {maximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" aria-label="Close Nova">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <h2 className="text-center text-xl font-semibold text-gray-900">Hi {userName}. How can I help?</h2>
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-3xl bg-[#c6d4fb]/50 px-4 py-2 text-sm text-gray-900 shadow-sm">
              {m.text}
            </div>
          ) : (
            <NovaMessage
              key={m.id}
              reply={m.reply}
              isDone={isDone}
              dayOf={dayOf}
              hrefOf={hrefOf}
              focusId={focusId}
              onApprove={onApprove}
              onApproved={summarize}
              onOpenPlan={onOpenPlan}
              onFollowup={send}
            />
          ),
        )}
        {thinking ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="size-4 animate-spin" /> Reading the calendar, documents and work orders…
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
    </div>
  );
}

function NovaMessage({
  reply,
  isDone,
  dayOf,
  hrefOf,
  focusId,
  onApprove,
  onApproved,
  onOpenPlan,
  onFollowup,
}: {
  reply: NovaReply;
  isDone: (p: Proposal) => boolean;
  dayOf: (p: Proposal) => string;
  hrefOf: (p: Proposal) => string | undefined;
  focusId: string | null;
  onApprove: (id: string) => void;
  onApproved: (ids: string[]) => void;
  onOpenPlan: (jobId: string) => void;
  onFollowup: (text: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[15px] leading-7 text-gray-900">{reply.text}</p>

      {reply.cards?.map((card, i) => (
        <div key={i} className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {card.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{row.label}</span>
              <span className="text-right text-sm text-gray-900">{row.value}</span>
            </div>
          ))}
        </div>
      ))}

      {reply.proposals?.length ? (
        <ProposalBlock
          ids={reply.proposals}
          isDone={isDone}
          dayOf={dayOf}
          hrefOf={hrefOf}
          focusId={focusId}
          onApprove={onApprove}
          onApproved={onApproved}
          onOpenPlan={onOpenPlan}
        />
      ) : null}

      {reply.followups?.length ? (
        <div className="flex flex-wrap gap-2">
          {reply.followups.map((f, i) => (
            <button
              key={f}
              onClick={() => onFollowup(f)}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <CalendarClock className="size-3.5 shrink-0" style={{ color: CHIP_COLORS[i % CHIP_COLORS.length] }} />
              {f}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2 text-gray-500">
        <ThumbsUp className="size-4" />
        <ThumbsDown className="size-4" />
      </div>
    </div>
  );
}

/** "Proposed by Nova": the same checklist-and-approve pattern Nova uses for captures. */
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

  const groups = GROUP_ORDER.map((g) => ({ g, list: items.filter((p) => KIND_META[p.kind].group === g) })).filter((x) => x.list.length);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
        <span className="text-xs font-semibold text-gray-800">
          Proposed by Nova <span className="font-medium text-gray-400">{items.length}</span>
        </span>
        <span className="text-[11px] text-gray-500">{items.filter(isDone).length} done</span>
      </div>
      {groups.map(({ g, list }) => (
        <div key={g}>
          <div className="border-b border-gray-100 px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{g}</div>
          <ul>
            {list.map((p) => {
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
                  className={cn(
                    "flex items-start gap-2.5 border-b border-gray-100 px-3 py-2.5 last:border-b-0",
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
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide", TONE_TEXT[meta.tone])}>
                        <Icon className="size-3" /> {meta.label}
                      </span>
                      <span className="shrink-0 text-[11px] text-gray-500">{fmtDay(dayOf(p))}</span>
                    </div>
                    <div className={cn("text-sm font-medium", done ? "text-gray-500" : "text-gray-900")}>{p.title}</div>
                    {done ? (
                      <div className="text-xs text-emerald-700">
                        {p.result}
                        {href ? (
                          <Link href={href} className="ml-1 font-medium text-indigo-700 hover:underline">
                            Open
                          </Link>
                        ) : null}
                      </div>
                    ) : (
                      <>
                        <div className="text-xs text-gray-600">{p.detail}</div>
                        <div className="mt-0.5 text-[11px] italic text-gray-500">From: {p.why}</div>
                        {p.jobId ? (
                          <button onClick={() => onOpenPlan(p.jobId as string)} className="mt-1 text-[11px] font-medium text-indigo-700 hover:underline">
                            Review the plan{p.needsDocs ? " and the drafts" : ""}
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {pending.length > 0 || running ? (
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-3 py-2.5">
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
