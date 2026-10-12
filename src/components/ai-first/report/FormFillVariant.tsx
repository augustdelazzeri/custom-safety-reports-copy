"use client";

// P1 · C · Today's form with "Fill from a photo": the incremental baseline.
// Every field stays visible; the AI only pre-fills them. Useful to compare taps against A and B.

import React, { useState } from "react";
import { Camera, Sparkles } from "lucide-react";
import { usePhotoReport } from "./usePhotoReport";
import { AccessPointHeader, AnonymousToggle, ReportDone } from "./ReportParts";
import { AiDisclaimer, AiWorking, ConfidenceBadge, useStagedProgress } from "../AiPrimitives";
import { ACCESS_POINT, SCENES, spillDraftFields } from "@/lib/ai-first/sample-data";
import { cn } from "@/lib/utils";

const STEPS = ["Reading the photo", "Filling the form"];

type FormState = Record<string, string>;

const EMPTY: FormState = {
  type: "",
  title: "",
  date: "Oct 12, 2026 · 08:12",
  location: ACCESS_POINT.location,
  asset: "",
  description: "",
  hazards: "",
  injury: "",
  stopped: "",
};

export function FormFillVariant() {
  const s = usePhotoReport("photo");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [aiKeys, setAiKeys] = useState<Record<string, number>>({});
  const [filling, setFilling] = useState(false);
  const [done, setDone] = useState(false);
  const fillFromDraft = () => {
    setFilling(false);
    const conf: Record<string, number> = {};
    const values: FormState = {};
    spillDraftFields(false).forEach((f) => {
      values[f.key] = f.value;
      conf[f.key] = f.confidence;
    });
    setForm((current) => ({ ...current, ...values }));
    setAiKeys(conf);
  };
  const progress = useStagedProgress(STEPS, 700, filling, fillFromDraft);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setAiKeys((a) => {
      const copy = { ...a };
      delete copy[k];
      return copy;
    });
  };

  if (done && s.submitted) return <ReportDone report={s.submitted} />;

  const label = (k: string, text: string, required?: boolean) => (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm font-medium text-gray-700">
        {text}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      {aiKeys[k] !== undefined && <ConfidenceBadge value={aiKeys[k]} compact />}
    </div>
  );
  const inputCls = (k: string) =>
    cn("w-full rounded-md border px-3 py-2 text-sm", aiKeys[k] !== undefined ? "border-violet-300 bg-violet-50/50" : "border-gray-300");

  return (
    <div className="min-h-full bg-white">
      <AccessPointHeader />
      <div className="p-4 space-y-4">
        {!s.photo ? (
          <button
            onClick={() => {
              s.setPhoto(SCENES.spill.src);
              setFilling(true);
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Camera className="w-5 h-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-violet-900">Fill this form from a photo</span>
              <span className="block text-xs text-violet-700">Uses the sample photo: spill in Aisle 4</span>
            </span>
            <Sparkles className="w-4 h-4 text-violet-600 ml-auto" />
          </button>
        ) : filling ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
            <AiWorking steps={STEPS} index={progress.index} />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.photo} alt="" className="h-14 w-20 rounded-md object-cover" />
            <p className="text-xs text-gray-600">
              Filled {Object.keys(aiKeys).length} fields from your photo. <span className="text-violet-700">Purple fields</span> came from the AI.
            </p>
          </div>
        )}

        <div>
          {label("type", "Type", true)}
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls("type")}>
            <option value="">Select…</option>
            <option>Near miss</option>
            <option>Hazard observation</option>
            <option>Incident</option>
          </select>
        </div>
        <div>
          {label("title", "Title", true)}
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls("title")} />
        </div>
        <div>
          {label("date", "Date and time", true)}
          <input value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls("date")} />
        </div>
        <div>
          {label("location", "Location", true)}
          <input value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls("location")} />
        </div>
        <div>
          {label("asset", "Asset")}
          <input value={form.asset} onChange={(e) => set("asset", e.target.value)} className={inputCls("asset")} />
        </div>
        <div>
          {label("description", "Description", true)}
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={inputCls("description")} />
        </div>
        <div>
          {label("hazards", "Hazards")}
          <input value={form.hazards} onChange={(e) => set("hazards", e.target.value)} className={inputCls("hazards")} />
        </div>
        <div>
          {label("injury", "Was anyone injured?", true)}
          <div className="flex gap-4 text-sm">
            {["Yes", "No"].map((o) => (
              <label key={o} className="flex items-center gap-1.5">
                <input type="radio" name="injury" checked={form.injury === o} onChange={() => set("injury", o)} className="accent-blue-600" /> {o}
              </label>
            ))}
          </div>
        </div>
        <div>
          {label("stopped", "Is the area or equipment out of use?")}
          <div className="flex gap-4 text-sm">
            {["Yes", "No"].map((o) => (
              <label key={o} className="flex items-center gap-1.5">
                <input type="radio" name="stopped" checked={form.stopped === o} onChange={() => set("stopped", o)} className="accent-blue-600" /> {o}
              </label>
            ))}
          </div>
        </div>
        <AnonymousToggle state={s} />
        <AiDisclaimer />
        <button
          onClick={() => {
            s.submit({
              values: form,
              answers: { injury: form.injury === "Yes" ? "yes" : "no", stopped: form.stopped === "Yes" ? "yes" : "no" },
            });
            setDone(true);
          }}
          disabled={!form.title || !form.type || !form.injury}
          className="w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white disabled:opacity-40"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
