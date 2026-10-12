"use client";

// Pieces reused by the P1 and P10 variants.

import React, { useRef, useState } from "react";
import { Camera, CheckCircle2, ImagePlus, Loader2, Mic, QrCode, ShieldCheck } from "lucide-react";
import { ACCESS_POINT, PEOPLE, SCENES, SEVERITY_SUGGESTION } from "@/lib/ai-first/sample-data";
import type { Report } from "@/lib/ai-first/types";
import type { PhotoReportState, VoiceLang } from "./usePhotoReport";
import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "../AiPrimitives";

export function AccessPointHeader({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 border-b border-gray-100 bg-white px-4", compact ? "py-2" : "py-3")}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
        <QrCode className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">Report a safety concern</p>
        <p className="text-xs text-gray-500 truncate">
          {ACCESS_POINT.name} · {ACCESS_POINT.code}
        </p>
      </div>
    </div>
  );
}

// Picks a photo: the sample, or one from the device (the AI result stays scripted either way).
export function PhotoPicker({ onPick, label = "Take a photo" }: { onPick: (src: string) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <button
        onClick={() => onPick(SCENES.spill.src)}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/60 py-8 text-blue-700 hover:bg-blue-50"
      >
        <Camera className="w-8 h-8" />
        <span className="text-base font-semibold">{label}</span>
        <span className="text-xs text-blue-600/80">Uses the sample photo: spill in Aisle 4</span>
      </button>
      <button
        onClick={() => input.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
      >
        <ImagePlus className="w-4 h-4" /> Upload from gallery
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(URL.createObjectURL(file));
        }}
      />
      <p className="text-[11px] text-gray-400 text-center">Prototype: the AI always returns the sample result.</p>
    </div>
  );
}

export function VoiceNoteButton({ state }: { state: PhotoReportState }) {
  const [recording, setRecording] = useState<VoiceLang>(null);

  const record = (lang: Exclude<VoiceLang, null>) => {
    setRecording(lang);
    window.setTimeout(() => {
      setRecording(null);
      state.setVoice(lang);
    }, 1400);
  };

  if (state.voiceNote) {
    const note = state.voiceNote;
    const translation = "translation" in note ? String(note.translation) : null;
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
          <Mic className="w-3.5 h-3.5 text-violet-600" /> Voice note · {note.language} · 0:06
          <button onClick={() => state.setVoice(null)} className="ml-auto text-gray-400 hover:text-gray-700 font-normal">
            Remove
          </button>
        </div>
        <p className="mt-1.5 text-sm text-gray-800 italic">“{note.transcript}”</p>
        {translation && <p className="mt-1 text-xs text-gray-500">Translated for your supervisor: “{translation}”</p>}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => record("en")}
        disabled={recording !== null}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        {recording === "en" ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Mic className="w-4 h-4" />}
        {recording === "en" ? "Listening…" : "Add voice note"}
      </button>
      <button
        onClick={() => record("es")}
        disabled={recording !== null}
        className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        title="Simulates a voice note in Spanish"
      >
        {recording === "es" ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Mic className="w-4 h-4" />} ES
      </button>
    </div>
  );
}

export function SeveritySuggestion({ oshaPossible }: { oshaPossible: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Severity suggestion</span>
        <ConfidenceBadge value={oshaPossible ? 0.74 : SEVERITY_SUGGESTION.confidence} compact />
      </div>
      <p className="mt-1 text-sm text-gray-900">{oshaPossible ? "High · possibly OSHA recordable" : SEVERITY_SUGGESTION.value}</p>
      <p className="mt-1 text-[11px] text-gray-500">Your supervisor decides the severity. You don’t need to.</p>
    </div>
  );
}

export function AnonymousToggle({ state }: { state: PhotoReportState }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" checked={state.anonymous} onChange={(e) => state.setAnonymous(e.target.checked)} className="h-4 w-4 accent-blue-600" />
      Report anonymously
    </label>
  );
}

export function ReportDone({ report, taps }: { report: Report; taps?: number }) {
  return (
    <div className="px-5 py-8 space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">Thanks, it’s reported</h2>
        <p className="text-sm text-gray-600">
          Case <span className="font-semibold">{report.id}</span> went to {PEOPLE.supervisor.split(" (")[0]}.
        </p>
        {taps !== undefined && <p className="text-xs text-gray-400">{taps} taps</p>}
      </div>
      <div className="rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">What happens next</p>
        {[
          ["Now", "Your supervisor reviews the report and sets the severity."],
          ["Today", "If something needs fixing, the AI drafts the work order and the action plan."],
          ["When it’s fixed", "You get a message saying what was done."],
        ].map(([when, what]) => (
          <div key={when} className="flex gap-3">
            <span className="w-20 shrink-0 text-xs font-semibold text-blue-700">{when}</span>
            <span className="text-sm text-gray-700">{what}</span>
          </div>
        ))}
      </div>
      <p className="flex items-start gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
        Reports are for fixing problems, not for blame. {report.reporter === "Anonymous" ? "Your name was not recorded." : ""}
      </p>
      <a href="/ai-first/inbox" className="block text-center text-sm font-medium text-violet-700 underline">
        See it in the supervisor queue (P8)
      </a>
    </div>
  );
}
