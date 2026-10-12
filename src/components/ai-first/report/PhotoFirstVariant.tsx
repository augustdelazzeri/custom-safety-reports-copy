"use client";

// P1 · A · Photo first: capture → AI works → up to 3 questions → review with pins → submit.

import React, { useState } from "react";
import { Building2, Camera, ChevronRight, Sun, ZoomIn } from "lucide-react";
import { usePhotoReport } from "./usePhotoReport";
import { AccessPointHeader, AnonymousToggle, PhotoPicker, ReportDone, SeveritySuggestion, VoiceNoteButton } from "./ReportParts";
import { AiBadge, AiDisclaimer, AiField, AiWorking, PhotoWithPins, PinLegend, useStagedProgress } from "../AiPrimitives";
import { QUICK_QUESTIONS, SPILL_PINS } from "@/lib/ai-first/sample-data";
import type { QuickAnswers } from "@/lib/ai-first/types";
import { cn } from "@/lib/utils";

type Step = "capture" | "analyzing" | "questions" | "review" | "done";

const ANALYZE_STEPS = ["Reading the photo", "Matching to Aisle 4 and nearby assets", "Checking hazards against OSHA 1910", "Drafting your report"];

export function PhotoFirstVariant() {
  const s = usePhotoReport("photo");
  const [step, setStep] = useState<Step>("capture");
  const [qIndex, setQIndex] = useState(0);
  const [activePin, setActivePin] = useState<number | null>(null);
  const progress = useStagedProgress(ANALYZE_STEPS, 650, step === "analyzing", () => {
    s.draft();
    setStep("questions");
  });

  const answer = (key: keyof QuickAnswers, a: "yes" | "no" | "unsure") => {
    const next = { ...s.answers, [key]: a };
    s.setAnswers(next);
    const list = QUICK_QUESTIONS.filter((q) => !(q.onlyIf === "injury_yes" && next.injury !== "yes"));
    const nextIdx = list.findIndex((q) => next[q.key] === undefined);
    if (nextIdx === -1) setStep("review");
    else setQIndex(nextIdx);
  };

  if (step === "done" && s.submitted) return <ReportDone report={s.submitted} />;

  return (
    <div className="min-h-full bg-gray-50">
      <AccessPointHeader />

      {step === "capture" && (
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">What did you see?</h2>
            <p className="text-sm text-gray-500">A photo is enough. The AI fills in the rest and you check it.</p>
          </div>
          {!s.photo ? (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  [Building2, "Wide shot first"],
                  [Sun, "Light behind you"],
                  [ZoomIn, "Then a close-up"],
                ].map(([Icon, text]) => {
                  const I = Icon as React.ElementType;
                  return (
                    <div key={text as string} className="rounded-lg bg-white border border-gray-100 p-2">
                      <I className="w-4 h-4 mx-auto text-blue-600" />
                      <p className="mt-1 text-[11px] text-gray-600">{text as string}</p>
                    </div>
                  );
                })}
              </div>
              <PhotoPicker onPick={s.setPhoto} />
            </>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.photo} alt="Your photo" className="w-full rounded-xl" />
              <button onClick={() => s.setPhoto(null)} className="text-xs text-gray-500 underline">
                Retake
              </button>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">Anything to add? (optional)</p>
                <VoiceNoteButton state={s} />
              </div>
              <button
                onClick={() => setStep("analyzing")}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white hover:bg-blue-700"
              >
                Continue
              </button>
            </>
          )}
        </div>
      )}

      {step === "analyzing" && (
        <div className="p-4 space-y-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {s.photo && <img src={s.photo} alt="" className="w-full rounded-xl opacity-80" />}
          <AiWorking steps={ANALYZE_STEPS} index={progress.index} />
        </div>
      )}

      {step === "questions" && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <AiBadge>Quick check</AiBadge>
            <span className="text-xs text-gray-500">
              {Math.min(qIndex + 1, s.questions.length)} of {s.questions.length}
            </span>
          </div>
          {(() => {
            const q = s.questions[qIndex];
            if (!q) return null;
            return (
              <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-4">
                <p className="text-lg font-semibold text-gray-900">{s.voice && q.key === "injury" ? q.textAfterVoice : q.text}</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["yes", "no", "unsure"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => answer(q.key, a)}
                      className={cn(
                        "rounded-xl border py-3 text-sm font-semibold",
                        a === "yes" ? "border-rose-200 text-rose-700 hover:bg-rose-50" : a === "no" ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {a === "yes" ? "Yes" : a === "no" ? "No" : "Not sure"}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500">Why we ask: {q.why}</p>
              </div>
            );
          })()}
          <button onClick={() => setStep("review")} className="w-full text-center text-sm text-gray-500 underline">
            Skip questions
          </button>
        </div>
      )}

      {step === "review" && (
        <div className="p-4 space-y-4 pb-28">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Check the report</h2>
            <AiBadge />
          </div>
          <PhotoWithPins src={s.photo ?? ""} pins={SPILL_PINS} activePin={activePin} onPinClick={(id) => setActivePin(id === activePin ? null : id)} />
          <PinLegend />
          {activePin && (
            <p className="rounded-lg bg-white border border-gray-200 p-2.5 text-sm text-gray-800">
              <span className="font-semibold">{activePin}.</span> {SPILL_PINS.find((p) => p.id === activePin)?.label}
            </p>
          )}
          <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm">
            <span className="text-gray-500">Analyzing as</span>
            <span className="font-medium text-gray-900">Warehouse · general industry</span>
            <button className="ml-auto text-xs font-medium text-blue-600">Change</button>
          </div>

          {s.fields.map((f) => (
            <React.Fragment key={f.key}>
              <AiField field={f} onChange={s.updateField} dense />
              {f.key === "asset" && !s.closeUpAdded && !f.cleared && (
                <button
                  onClick={s.addCloseUp}
                  className="flex w-full items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-left"
                >
                  <Camera className="w-5 h-5 text-amber-700 shrink-0" />
                  <span className="text-sm text-amber-900">
                    <span className="font-semibold">Add a close-up of the forklift?</span> It helps confirm which truck is leaking.
                  </span>
                  <ChevronRight className="w-4 h-4 text-amber-700 ml-auto" />
                </button>
              )}
            </React.Fragment>
          ))}

          <SeveritySuggestion oshaPossible={s.oshaPossible} />
          <AnonymousToggle state={s} />
          <AiDisclaimer />

          <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent px-4 pt-6 pb-4">
            <button
              onClick={() => {
                s.submit();
                setStep("done");
              }}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white hover:bg-blue-700"
            >
              Send report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
