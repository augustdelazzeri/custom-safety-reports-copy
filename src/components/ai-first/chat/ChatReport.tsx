"use client";

// Conversational report used by P1 · B (in-app assistant) and P10 (WhatsApp, SMS, web chat).
// Same script in every channel; only the skin and the confirm step change.

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CheckCheck, FastForward, Globe, Lock, Mic, MoreVertical, Phone, Send, Sparkles, Video } from "lucide-react";
import { usePhotoReport } from "../report/usePhotoReport";
import { AccessPointHeader, SeveritySuggestion } from "../report/ReportParts";
import { AiField, PhotoWithPins } from "../AiPrimitives";
import { ACCESS_POINT, PEOPLE, QUICK_QUESTIONS, SCENES, SPILL_PINS } from "@/lib/ai-first/sample-data";
import type { QuickAnswers } from "@/lib/ai-first/types";
import { cn } from "@/lib/utils";

export type ChatTheme = "assistant" | "whatsapp" | "sms" | "web";

type Msg =
  | { id: number; from: "bot" | "me"; kind: "text"; text: string; sub?: string }
  | { id: number; from: "me"; kind: "photo"; src: string }
  | { id: number; from: "me"; kind: "voice"; transcript: string; translation?: string }
  | { id: number; from: "bot"; kind: "pins" }
  | { id: number; from: "bot"; kind: "summary" };

type NewMsg = Msg extends infer M ? (M extends Msg ? Omit<M, "id"> : never) : never;

type Chips = { options: string[]; onPick: (o: string) => void } | null;

const SKIN: Record<ChatTheme, { bg: string; bot: string; me: string; meText: string; botText: string }> = {
  assistant: { bg: "bg-gray-50", bot: "bg-white border border-gray-200", me: "bg-blue-600", meText: "text-white", botText: "text-gray-900" },
  whatsapp: { bg: "bg-[#ECE5DD]", bot: "bg-white", me: "bg-[#DCF8C6]", meText: "text-gray-900", botText: "text-gray-900" },
  sms: { bg: "bg-white", bot: "bg-[#E9E9EB]", me: "bg-[#0B84FF]", meText: "text-white", botText: "text-gray-900" },
  web: { bg: "bg-slate-50", bot: "bg-white border border-gray-200", me: "bg-slate-800", meText: "text-white", botText: "text-gray-900" },
};

const CHANNEL_FOR: Record<ChatTheme, "photo" | "whatsapp" | "sms" | "web_chat"> = {
  assistant: "photo",
  whatsapp: "whatsapp",
  sms: "sms",
  web: "web_chat",
};

export function ChatReport({ theme }: { theme: ChatTheme }) {
  const s = usePhotoReport(CHANNEL_FOR[theme]);
  // Callbacks below are created in earlier renders (timers, chips); read the latest state through this ref.
  const live = useRef(s);
  live.current = s;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [chips, setChips] = useState<Chips>(null);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"start" | "confirm" | "questions" | "summary" | "sent" | "updates">("start");
  const [updates, setUpdates] = useState(0);
  const idRef = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const answersRef = useRef<QuickAnswers>({});
  const messaging = theme === "whatsapp" || theme === "sms";

  const push = (m: NewMsg) => setMsgs((list) => [...list, { ...m, id: ++idRef.current } as Msg]);
  const botSay = (text: string, delay = 900, after?: () => void, sub?: string) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      push({ from: "bot", kind: "text", text, sub });
      after?.();
    }, delay);
  };

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; // StrictMode runs effects twice in dev
    started.current = true;
    if (messaging) push({ from: "me", kind: "text", text: `Report ${ACCESS_POINT.code}`, sub: "Sent from the QR code" });
    botSay(
      `Hi, this is UpKeep Safety for ${ACCESS_POINT.name}. Send a photo of what you saw. You can add a voice note too.`,
      messaging ? 900 : 400
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, chips]);

  const askNextQuestion = () => {
    const a = answersRef.current;
    const list = QUICK_QUESTIONS.filter((q) => !(q.onlyIf === "injury_yes" && a.injury !== "yes"));
    const q = list.find((x) => a[x.key] === undefined);
    if (!q) {
      live.current.draft();
      setPhase("summary");
      if (messaging) {
        botSay(
          "Here's your report:\n• Near miss: oil spill across the forklift lane, Aisle 4\n• Asset: forklift FL-07 (not sure)\n• No one hurt · area out of use\n\nReply 1 to send, 2 to edit, 3 to cancel.",
          1100,
          () => setChips({ options: ["1", "2", "3"], onPick: confirmMessaging })
        );
      } else {
        botSay("Here's the draft. Check each field, change anything that's wrong, then send.", 900, () => push({ from: "bot", kind: "summary" }));
      }
      return;
    }
    botSay(live.current.voice && q.key === "injury" ? q.textAfterVoice : q.text, 700, () =>
      setChips({
        options: ["Yes", "No", "Not sure"],
        onPick: (o) => {
          const val = o === "Yes" ? "yes" : o === "No" ? "no" : "unsure";
          answersRef.current = { ...answersRef.current, [q.key]: val };
          live.current.setAnswers(answersRef.current);
          push({ from: "me", kind: "text", text: o });
          setChips(null);
          askNextQuestion();
        },
      })
    );
  };

  const confirmMessaging = (o: string) => {
    push({ from: "me", kind: "text", text: o });
    setChips(null);
    if (o === "1") send();
    else if (o === "2") botSay("Opening the full draft so you can edit it.", 600, () => push({ from: "bot", kind: "summary" }));
    else botSay("Cancelled. Nothing was saved.", 600);
  };

  const send = () => {
    const r = live.current.submit({ answers: answersRef.current });
    setPhase("sent");
    botSay(
      `Sent ✅ Case ${r.id} went to ${PEOPLE.supervisor.split(" (")[0]}. ${messaging || theme === "web" ? "I'll message you here when it's fixed." : "You'll get an update when it's fixed."}`,
      800
    );
  };

  const onPhoto = () => {
    if (s.photo) return;
    s.setPhoto(SCENES.spill.src);
    push({ from: "me", kind: "photo", src: SCENES.spill.src });
    setPhase("confirm");
    botSay("I see oil across the forklift lane next to rack 4B, and drips leading to forklift FL-07. Did I get that right?", 1500, () => {
      push({ from: "bot", kind: "pins" });
      setChips({
        options: ["Yes", "Not quite"],
        onPick: (o) => {
          push({ from: "me", kind: "text", text: o });
          setChips(null);
          setPhase("questions");
          if (o === "Yes") askNextQuestion();
          else botSay("No problem. Tell me what I got wrong, then we'll continue.", 600);
        },
      });
    });
  };

  const onVoice = (lang: "en" | "es") => {
    if (s.voice) return;
    s.setVoice(lang);
    const note = lang === "es"
      ? { transcript: "Hay aceite en todo el pasillo cuatro, casi me resbalo al pasar el estante.", translation: "There's oil all over aisle four, I almost slipped when I came around the rack." }
      : { transcript: "Hey, there's oil all over aisle four, I almost slipped when I came around the rack." };
    push({ from: "me", kind: "voice", ...note });
    if (!s.photo) botSay(lang === "es" ? "Entendido. ¿Puedes mandar una foto también? Ayuda mucho." : "Got it. Can you send a photo too? It helps a lot.", 900, undefined, lang === "es" ? "I reply in the language you use." : undefined);
  };

  const onText = () => {
    if (!text.trim()) return;
    push({ from: "me", kind: "text", text });
    setText("");
    if (phase === "questions" && !chips) botSay("Thanks, I updated the draft.", 700, askNextQuestion);
    else if (phase === "start") botSay("Thanks. A photo helps me a lot. Can you send one?", 700);
  };

  const fastForward = () => {
    const next = updates + 1;
    setUpdates(next);
    setPhase("updates");
    if (next === 1) botSay(`Update on your report: a work order was created to replace the hydraulic hoses on FL-07 (WO-5701). Owner: ${PEOPLE.maintenance.split(" (")[0]}.`, 600);
    if (next === 2) botSay("Fixed ✅ The hoses on FL-07 were replaced today and a spill kit is going up in Aisle 4. Thanks for speaking up.", 600);
  };

  const skin = SKIN[theme];

  return (
    <div className={cn("flex h-full min-h-[600px] flex-col", skin.bg)}>
      <ChatHeader theme={theme} />
      <div ref={scroller} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {theme === "whatsapp" && (
          <p className="mx-auto w-fit rounded-md bg-[#FFF5C4] px-3 py-1 text-center text-[11px] text-gray-700">
            <Lock className="inline w-3 h-3 mr-1" />Messages to this business are handled by UpKeep. Your phone number stays private.
          </p>
        )}
        {msgs.map((m) => (
          <Bubble key={m.id} m={m} theme={theme} state={s} onSend={send} sent={phase === "sent" || phase === "updates"} />
        ))}
        {typing && (
          <div className={cn("w-fit rounded-2xl px-3 py-2", skin.bot)}>
            <span className="inline-flex gap-1">
              <i className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
              <i className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
              <i className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
            </span>
          </div>
        )}
        {chips && !typing && (
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            {chips.options.map((o) => (
              <button
                key={o}
                onClick={() => chips.onPick(o)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium",
                  theme === "whatsapp" ? "border-[#25D366] bg-white text-[#075E54]" : theme === "sms" ? "border-[#0B84FF] bg-white text-[#0B84FF]" : "border-blue-300 bg-white text-blue-700"
                )}
              >
                {o}
              </button>
            ))}
          </div>
        )}
        {(phase === "sent" || phase === "updates") && updates < 2 && theme !== "assistant" && (
          <button
            data-ai-first-chrome
            onClick={fastForward}
            className="mx-auto mt-3 flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-medium text-white shadow"
          >
            <FastForward className="w-3.5 h-3.5" /> Prototype: jump to the next update
          </button>
        )}
      </div>
      <Composer theme={theme} text={text} setText={setText} onText={onText} onPhoto={onPhoto} onVoice={onVoice} disabled={phase === "sent" || phase === "updates"} />
    </div>
  );
}

function ChatHeader({ theme }: { theme: ChatTheme }) {
  if (theme === "assistant") return <AccessPointHeader compact />;
  if (theme === "whatsapp")
    return (
      <div className="flex items-center gap-3 bg-[#075E54] px-3 py-2.5 text-white">
        <ArrowLeft className="w-5 h-5" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#075E54] text-xs font-bold">UK</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold flex items-center gap-1">
            UpKeep Safety <CheckCheck className="w-3.5 h-3.5 text-[#25D366]" />
          </p>
          <p className="text-[11px] text-white/80">Business account</p>
        </div>
        <Video className="w-5 h-5" />
        <Phone className="w-4 h-4" />
        <MoreVertical className="w-5 h-5" />
      </div>
    );
  if (theme === "sms")
    return (
      <div className="border-b border-gray-200 bg-gray-50 px-3 pb-2 pt-2 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold text-white">US</div>
        <p className="mt-1 text-xs font-medium text-gray-900">UpKeep Safety</p>
        <p className="text-[10px] text-gray-500">+1 (415) 555-0142 · Text Message</p>
      </div>
    );
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5">
        <Lock className="w-3 h-3 text-gray-500" />
        <span className="text-xs text-gray-600">upkeep.app/r/{ACCESS_POINT.code}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <Globe className="w-4 h-4 text-slate-700" />
        <p className="text-sm font-semibold text-slate-900">Report a safety concern</p>
        <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">No app, no login</span>
      </div>
    </div>
  );
}

function Bubble({ m, theme, state, onSend, sent }: { m: Msg; theme: ChatTheme; state: ReturnType<typeof usePhotoReport>; onSend: () => void; sent: boolean }) {
  const skin = SKIN[theme];
  const mine = m.from === "me";
  const wrap = cn("flex", mine ? "justify-end" : "justify-start");

  if (m.kind === "photo")
    return (
      <div className={wrap}>
        <div className={cn("rounded-2xl p-1 w-[70%]", skin.me)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.src} alt="Sent photo" className="rounded-xl" />
        </div>
      </div>
    );

  if (m.kind === "voice")
    return (
      <div className={wrap}>
        <div className={cn("rounded-2xl px-3 py-2 max-w-[80%]", skin.me, skin.meText)}>
          <p className="flex items-center gap-2 text-xs opacity-80">
            <Mic className="w-3.5 h-3.5" /> Voice note · 0:06
          </p>
          <p className="mt-1 text-sm italic">“{m.transcript}”</p>
          {m.translation && <p className="mt-1 text-[11px] opacity-75">Translated: “{m.translation}”</p>}
        </div>
      </div>
    );

  if (m.kind === "pins")
    return (
      <div className={wrap}>
        <div className={cn("rounded-2xl p-2 w-[88%] space-y-1.5", skin.bot)}>
          <PhotoWithPins src={SCENES.spill.src} pins={SPILL_PINS} />
          <ol className="space-y-0.5 text-[11px] text-gray-700">
            {SPILL_PINS.map((p) => (
              <li key={p.id}>
                <span className="font-semibold">{p.id}.</span> {p.label}
              </li>
            ))}
          </ol>
        </div>
      </div>
    );

  if (m.kind === "summary")
    return (
      <div className={wrap}>
        <div className={cn("w-full rounded-2xl p-3 space-y-2", skin.bot)}>
          <p className="flex items-center gap-1 text-xs font-semibold text-violet-700">
            <Sparkles className="w-3.5 h-3.5" /> Draft report
          </p>
          {state.fields.map((f) => (
            <AiField key={f.key} field={f} onChange={state.updateField} dense />
          ))}
          <SeveritySuggestion oshaPossible={state.oshaPossible} />
          {!sent && (
            <button onClick={onSend} className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white">
              Send report
            </button>
          )}
        </div>
      </div>
    );

  return (
    <div className={wrap}>
      <div className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line", mine ? cn(skin.me, skin.meText) : cn(skin.bot, skin.botText))}>
        {m.text}
        {m.sub && <p className={cn("mt-0.5 text-[10px]", mine ? "opacity-70" : "text-gray-500")}>{m.sub}</p>}
      </div>
    </div>
  );
}

function Composer({
  theme,
  text,
  setText,
  onText,
  onPhoto,
  onVoice,
  disabled,
}: {
  theme: ChatTheme;
  text: string;
  setText: (t: string) => void;
  onText: () => void;
  onPhoto: () => void;
  onVoice: (lang: "en" | "es") => void;
  disabled: boolean;
}) {
  const accent = theme === "whatsapp" ? "bg-[#25D366]" : theme === "sms" ? "bg-[#0B84FF]" : theme === "web" ? "bg-slate-800" : "bg-blue-600";
  return (
    <div className={cn("flex items-center gap-2 border-t border-gray-200 px-2 py-2", theme === "whatsapp" ? "bg-[#F0F0F0]" : "bg-white")}>
      <button onClick={onPhoto} disabled={disabled} className="p-2 text-gray-600 disabled:opacity-40" aria-label="Send the sample photo" title="Sends the sample photo">
        <Camera className="w-5 h-5" />
      </button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onText()}
        disabled={disabled}
        placeholder={theme === "sms" ? "Text Message" : "Message"}
        className="min-w-0 flex-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none"
      />
      {text ? (
        <button onClick={onText} className={cn("rounded-full p-2 text-white", accent)} aria-label="Send">
          <Send className="w-4 h-4" />
        </button>
      ) : (
        <>
          <button onClick={() => onVoice("en")} disabled={disabled} className={cn("rounded-full p-2 text-white disabled:opacity-40", accent)} aria-label="Record a voice note" title="Simulates a voice note in English">
            <Mic className="w-4 h-4" />
          </button>
          <button onClick={() => onVoice("es")} disabled={disabled} className="rounded-full border border-gray-300 px-2 py-1 text-[10px] font-semibold text-gray-600 disabled:opacity-40" title="Simulates a voice note in Spanish">
            ES
          </button>
        </>
      )}
    </div>
  );
}
