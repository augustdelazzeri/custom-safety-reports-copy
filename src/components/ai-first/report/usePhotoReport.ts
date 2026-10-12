"use client";

// State shared by the three P1 variants: one photo (+ optional voice note) becomes a report draft.

import { useMemo, useState } from "react";
import type { AiFieldValue, QuickAnswers, Report, ReportType } from "@/lib/ai-first/types";
import { ACCESS_POINT, PEOPLE, QUICK_QUESTIONS, SCENES, SEVERITY_SUGGESTION, SPILL_PINS, spillDraftFields, VOICE_NOTES } from "@/lib/ai-first/sample-data";
import { useAiFirst } from "@/contexts/AiFirstContext";

export type VoiceLang = "en" | "es" | null;

export function usePhotoReport(channel: Report["channel"] = "photo") {
  const { addReport } = useAiFirst();
  const [photo, setPhoto] = useState<string | null>(null);
  const [voice, setVoice] = useState<VoiceLang>(null);
  const [fields, setFields] = useState<AiFieldValue[]>([]);
  const [answers, setAnswersState] = useState<QuickAnswers>({});
  const [closeUpAdded, setCloseUpAdded] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState<Report | null>(null);

  // An answer can change the draft: "someone was hurt" turns the report into an incident.
  const applyAnswers = (fs: AiFieldValue[], a: QuickAnswers) =>
    a.injury !== "yes"
      ? fs
      : fs.map((f) =>
          f.key === "type" && !f.edited && !f.cleared
            ? { ...f, value: "Incident", aiValue: "Incident", confidence: 0.9, source: "Your answer: someone was hurt" }
            : f
        );

  const draft = () => setFields(applyAnswers(spillDraftFields(voice !== null), answers));

  const setAnswers = (next: QuickAnswers) => {
    setAnswersState(next);
    setFields((fs) => applyAnswers(fs, next));
  };

  const updateField = (next: AiFieldValue) => setFields((fs) => fs.map((f) => (f.key === next.key ? next : f)));

  const addCloseUp = () => {
    setCloseUpAdded(true);
    setFields((fs) =>
      fs.map((f) =>
        f.key === "asset" ? { ...f, confidence: 0.93, source: "Close-up photo: data plate reads FL-07" } : f
      )
    );
  };

  // Only ask what the AI could not infer, max 3, and skip follow-ups that do not apply.
  const questions = useMemo(
    () => QUICK_QUESTIONS.filter((q) => !(q.onlyIf === "injury_yes" && answers.injury !== "yes")),
    [answers.injury]
  );

  const oshaPossible = answers.injury === "yes" && answers.treatment === "yes";

  // Overrides let a variant submit its own form values instead of the drafted fields.
  const submit = (overrides?: { values?: Record<string, string>; answers?: QuickAnswers }) => {
    const a = overrides?.answers ?? answers;
    const val = (k: string) => {
      if (overrides?.values && k in overrides.values) return overrides.values[k] || undefined;
      const f = fields.find((x) => x.key === k);
      return f && !f.cleared ? f.value : undefined;
    };
    const typeLabel = val("type") ?? "Hazard observation";
    const type: ReportType = a.injury === "yes" ? "incident" : typeLabel.toLowerCase().includes("near") ? "near_miss" : "hazard";
    const osha = a.injury === "yes" && a.treatment === "yes";
    const report = addReport({
      channel,
      type,
      title: val("title") ?? "Safety report",
      description: val("description") ?? "",
      location: val("location") ?? ACCESS_POINT.location,
      asset: val("asset"),
      severity: osha ? "high" : "medium",
      severityConfidence: osha ? 0.74 : SEVERITY_SUGGESTION.confidence,
      hazards: (val("hazards") ?? "").split(" · ").filter(Boolean),
      answers: a,
      photo: photo ?? SCENES.spill.src,
      pins: SPILL_PINS,
      reporter: anonymous ? "Anonymous" : PEOPLE.reporter,
      language: voice === "es" ? "Spanish → English" : "English",
      status: "new",
      oshaPossible: osha,
      aiTouched: fields.filter((f) => f.edited || f.cleared).map((f) => f.key),
    });
    setSubmitted(report);
    return report;
  };

  const voiceNote = voice ? VOICE_NOTES[voice] : null;

  return {
    photo,
    setPhoto,
    voice,
    setVoice,
    voiceNote,
    fields,
    draft,
    updateField,
    answers,
    setAnswers,
    questions,
    closeUpAdded,
    addCloseUp,
    anonymous,
    setAnonymous,
    oshaPossible,
    submit,
    submitted,
  };
}

export type PhotoReportState = ReturnType<typeof usePhotoReport>;
