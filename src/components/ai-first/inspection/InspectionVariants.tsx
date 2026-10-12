"use client";

// P7 · Photo inspection variants.

import React, { useEffect, useState } from "react";
import { Camera, Circle, Video } from "lucide-react";
import { useInspection } from "./useInspection";
import { CaptureTips, ExtraFindings, FailSheet, InspectionHeader, InspectionSummary, ItemCard, SubmitBar } from "./InspectionParts";
import { AiDisclaimer, AiWorking, PhotoWithPins, PinLegend, useStagedProgress } from "../AiPrimitives";
import { BAY_PINS, INSPECTION_ITEMS, SCENES } from "@/lib/ai-first/sample-data";
import { cn } from "@/lib/utils";

const PHOTO_STEPS = ["Reading 3 photos", "Matching items to the checklist", "Checking OSHA 1910.157, .178 and .28", "Separating what I couldn't see"];
const VIDEO_STEPS = ["Extracting a frame every 4 s (8 frames)", "Transcribing your narration", "Matching frames to checklist items", "Separating what I couldn't see"];

// A · Photos first, then a pre-answered checklist to confirm.
export function PhotosFirstVariant() {
  const s = useInspection(true);
  const [phase, setPhase] = useState<"capture" | "analyzing" | "review">("capture");
  const progress = useStagedProgress(PHOTO_STEPS, 600, phase === "analyzing", () => setPhase("review"));
  const [activePin, setActivePin] = useState<number | null>(null);

  if (s.submitted) return <InspectionSummary state={s} />;

  return (
    <div className="relative min-h-full bg-gray-50">
      <InspectionHeader />
      {phase === "capture" && (
        <div className="space-y-4 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Walk the bay and take photos</h2>
          <CaptureTips />
          <button onClick={() => setPhase("analyzing")} className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/60 py-8 text-blue-700">
            <Camera className="w-8 h-8" />
            <span className="font-semibold">Take photos</span>
            <span className="text-xs text-blue-600/80">Uses the sample photos of the forklift bay</span>
          </button>
          <button onClick={() => { s.revealEverything(); setPhase("review"); }} className="w-full text-center text-sm text-gray-500 underline">
            Skip photos and fill the checklist by hand
          </button>
        </div>
      )}
      {phase === "analyzing" && (
        <div className="space-y-4 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SCENES.forkliftBay.src} alt="" className="w-full rounded-xl opacity-80" />
          <AiWorking steps={PHOTO_STEPS} index={progress.index} />
        </div>
      )}
      {phase === "review" && (
        <div className="space-y-3 p-4">
          <PhotoWithPins src={SCENES.forkliftBay.src} pins={BAY_PINS} activePin={activePin} onPinClick={(id) => setActivePin(activePin === id ? null : id)} />
          <PinLegend />
          {activePin && <p className="rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-800"><b>{activePin}.</b> {BAY_PINS.find((p) => p.id === activePin)?.label}</p>}
          <p className="text-xs text-gray-600">The AI pre-answered what it could see. Confirm or change each item; the suggested answer has a purple ring.</p>
          {s.items.map((it) => (
            <ItemCard key={it.item.id} s={it} state={s} />
          ))}
          <ExtraFindings />
          <AiDisclaimer>Pre-answered by AI from your photos. You confirm every item: the inspection is signed by you, not by the AI.</AiDisclaimer>
          <SubmitBar state={s} />
        </div>
      )}
      <FailSheet state={s} />
    </div>
  );
}

// B · Item by item: the camera lives on each item and the AI answers only that item.
export function ItemByItemVariant() {
  const s = useInspection(false);
  const [loading, setLoading] = useState<string | null>(null);

  if (s.submitted) return <InspectionSummary state={s} />;

  const shoot = (id: string) => {
    setLoading(id);
    window.setTimeout(() => {
      s.reveal(id);
      setLoading(null);
    }, 900);
  };

  return (
    <div className="relative min-h-full bg-gray-50">
      <InspectionHeader />
      <div className="space-y-3 p-4">
        <p className="text-xs text-gray-600">Tap the camera on an item. The AI answers that item from the photo, and you confirm.</p>
        {s.items.map((it) => (
          <div key={it.item.id} className="space-y-1.5">
            <ItemCard s={it} state={s} />
            {!it.revealed && it.item.ai !== "unseen" && (
              <button onClick={() => shoot(it.item.id)} disabled={loading === it.item.id} className="ml-1 inline-flex items-center gap-1.5 text-xs font-medium text-blue-700">
                <Camera className="w-3.5 h-3.5" /> {loading === it.item.id ? "Reading the photo…" : "Photo for this item"}
              </button>
            )}
          </div>
        ))}
        <SubmitBar state={s} />
      </div>
      <FailSheet state={s} />
    </div>
  );
}

// C · Video walkthrough: frames every 4 s, each item linked to the frame where it was seen.
const FRAMES = ["0:00", "0:04", "0:08", "0:12", "0:16", "0:20", "0:24", "0:28"];
const FRAME_POS = ["0% 40%", "5% 45%", "40% 30%", "50% 90%", "60% 70%", "70% 40%", "85% 15%", "100% 45%"];

export function VideoVariant() {
  const s = useInspection(true);
  const [phase, setPhase] = useState<"record" | "recording" | "analyzing" | "review">("record");
  const [frame, setFrame] = useState<string | null>(null);
  const progress = useStagedProgress(VIDEO_STEPS, 650, phase === "analyzing", () => setPhase("review"));

  useEffect(() => {
    if (phase !== "recording") return;
    const t = window.setTimeout(() => setPhase("analyzing"), 1800);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (s.submitted) return <InspectionSummary state={s} />;

  const itemsAt = (f: string) => INSPECTION_ITEMS.filter((i) => i.frame === f).map((i) => i.id);

  return (
    <div className="relative min-h-full bg-gray-50">
      <InspectionHeader />
      {(phase === "record" || phase === "recording") && (
        <div className="space-y-4 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Record a walkthrough</h2>
          <CaptureTips video />
          <div className="relative overflow-hidden rounded-2xl bg-gray-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SCENES.forkliftBay.src} alt="" className={cn("w-full opacity-70", phase === "recording" && "scale-110 transition-transform duration-[1800ms]")} />
            {phase === "recording" && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">
                <Circle className="w-2.5 h-2.5 fill-white" /> REC 0:31
              </span>
            )}
          </div>
          <button onClick={() => setPhase("recording")} disabled={phase === "recording"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 font-semibold text-white disabled:opacity-60">
            <Video className="w-5 h-5" /> {phase === "recording" ? "Recording…" : "Start walkthrough (sample)"}
          </button>
        </div>
      )}
      {phase === "analyzing" && (
        <div className="space-y-4 p-4">
          <AiWorking steps={VIDEO_STEPS} index={progress.index} />
        </div>
      )}
      {phase === "review" && (
        <div className="space-y-3 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Frames (tap to filter)</p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {FRAMES.map((f, i) => (
              <button
                key={f}
                onClick={() => setFrame(frame === f ? null : f)}
                className={cn("relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2", frame === f ? "border-violet-600" : "border-transparent")}
                style={{ backgroundImage: `url(${SCENES.forkliftBay.src})`, backgroundSize: "300%", backgroundPosition: FRAME_POS[i] }}
                aria-label={`Frame at ${f}`}
              >
                <span className="absolute bottom-0.5 left-1 rounded bg-black/60 px-1 text-[10px] text-white">{f}</span>
                {itemsAt(f).length > 0 && <span className="absolute right-1 top-1 rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">{itemsAt(f).length}</span>}
              </button>
            ))}
          </div>
          <p className="rounded-lg border border-gray-200 bg-white p-2.5 text-xs italic text-gray-600">
            Narration at 0:05: “Extinguisher’s blocked again by those pallets.”
          </p>
          {s.items
            .filter((it) => !frame || it.item.frame === frame)
            .map((it) => (
              <ItemCard key={it.item.id} s={it} state={s} showFrame />
            ))}
          {!frame && <ExtraFindings />}
          <SubmitBar state={s} />
        </div>
      )}
      <FailSheet state={s} />
    </div>
  );
}
