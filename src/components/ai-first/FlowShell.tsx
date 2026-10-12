"use client";

// Frame for every AI-first flow: back link, title, variant picker, live tap counter,
// restart and reset. Mobile flows render inside a phone frame; desktop flows inside the app shell.

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MousePointerClick, RotateCcw, Sparkles } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { FlowVariantPicker, type FlowVariantOption } from "./FlowVariantPicker";
import { useAiFirst } from "@/contexts/AiFirstContext";
import { BASELINE_TAPS } from "@/lib/ai-first/sample-data";
import { cn } from "@/lib/utils";

interface FlowShellProps<T extends string> {
  flowId: keyof typeof BASELINE_TAPS;
  code: string; // P1, P3…
  title: string;
  subtitle: string;
  device: "mobile" | "desktop";
  options: FlowVariantOption<T>[];
  variant: T;
  onVariantChange: (v: T) => void;
  children: React.ReactNode;
}

const INTERACTIVE = "button, a, input, textarea, select, label, [role=button], [role=checkbox], [role=radio], [role=tab]";

export function FlowShell<T extends string>(props: FlowShellProps<T>) {
  const { flowId, code, title, subtitle, device, options, variant, onVariantChange, children } = props;
  const [taps, setTaps] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const { reset } = useAiFirst();
  const baseline = BASELINE_TAPS[flowId];

  const restart = useCallback(() => {
    setTaps(0);
    setRunKey((k) => k + 1);
  }, []);

  const onClickCapture = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-ai-first-chrome]")) return;
    if (target.closest(INTERACTIVE)) setTaps((t) => t + 1);
  };

  const changeVariant = (v: T) => {
    onVariantChange(v);
    restart();
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3" data-ai-first-chrome>
      <Link
        href="/ai-first"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        data-ai-first-chrome
      >
        <ArrowLeft className="w-4 h-4" /> AI-first prototypes
      </Link>
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded px-1.5 py-0.5">{code}</span>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div
        className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm"
        title={baseline.note}
      >
        <MousePointerClick className="w-4 h-4 text-violet-600" />
        <span className="font-semibold tabular-nums text-gray-900">{taps}</span>
        <span className="text-gray-500">taps</span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">today ~{baseline.taps}</span>
      </div>
      <FlowVariantPicker label={title} options={options} variant={variant} onChange={changeVariant} />
      <button
        onClick={restart}
        data-ai-first-chrome
        className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <RotateCcw className="w-4 h-4" /> Restart
      </button>
      <button
        onClick={() => {
          reset();
          restart();
        }}
        data-ai-first-chrome
        className="text-xs text-gray-500 underline hover:text-gray-800"
        title="Clears reports, CAPAs and work orders created in the prototypes"
      >
        Reset data
      </button>
    </div>
  );

  if (device === "mobile") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur px-4 py-3">{toolbar}</div>
        <div className="flex justify-center px-0 py-0 md:px-4 md:py-8">
          <div
            onClickCapture={onClickCapture}
            className={cn(
              "relative w-full bg-white overflow-hidden",
              "md:w-[390px] md:h-[800px] md:rounded-[44px] md:border-[10px] md:border-gray-900 md:shadow-2xl"
            )}
          >
            <div className="hidden md:flex absolute top-0 inset-x-0 h-7 items-center justify-center z-20 pointer-events-none">
              <div className="w-28 h-5 bg-gray-900 rounded-b-2xl" />
            </div>
            <div key={runKey} className="h-[calc(100vh-72px)] md:h-full overflow-y-auto md:pt-6">
              {children}
            </div>
          </div>
        </div>
        <p className="hidden md:flex items-center justify-center gap-1 pb-6 text-xs text-gray-500">
          <Sparkles className="w-3 h-3" /> AI results are simulated with sample data. Nothing is sent anywhere.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <div className="border-b border-gray-200 bg-white px-4 md:px-6 py-3">{toolbar}</div>
        <main className="flex-1 overflow-y-auto bg-gray-50" onClickCapture={onClickCapture}>
          <div key={runKey}>{children}</div>
        </main>
      </div>
    </div>
  );
}
