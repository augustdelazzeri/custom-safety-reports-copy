"use client";

// Same picker pattern as the Audit execution layouts (components/execution/InterfaceVariantPicker),
// generalized so every AI-first flow can offer its own set of variants.

import React, { useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlowVariantOption<T extends string> {
  id: T;
  name: string;
  description: string;
  icon: React.ElementType;
}

const keyFor = (flowId: string) => `ehs-prototype-ai-first-variant:${flowId}`;

export function useFlowVariant<T extends string>(flowId: string, options: FlowVariantOption<T>[]) {
  const [variant, setVariantState] = useState<T>(options[0].id);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(keyFor(flowId)) as T | null;
      if (saved && options.some((o) => o.id === saved)) setVariantState(saved);
    } catch {
      // ignore
    }
    // options are static per flow
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowId]);

  const setVariant = (next: T) => {
    setVariantState(next);
    try {
      window.localStorage.setItem(keyFor(flowId), next);
    } catch {
      // ignore
    }
  };

  return { variant, setVariant };
}

interface PickerProps<T extends string> {
  label: string;
  options: FlowVariantOption<T>[];
  variant: T;
  onChange: (variant: T) => void;
}

export function FlowVariantPicker<T extends string>({ label, options, variant, onChange }: PickerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const current = options.find((v) => v.id === variant) ?? options[0];
  const index = options.findIndex((v) => v.id === current.id);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-ai-first-chrome
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <current.icon className="w-4 h-4 text-gray-600" />
        <span className="text-xs font-semibold text-gray-500">{String.fromCharCode(65 + index)}</span>
        <span className="text-sm font-medium text-gray-900">{current.name}</span>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} data-ai-first-chrome />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-40 border border-gray-200 py-1">
            <div className="px-3 py-2 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase">{label}: prototype options</p>
            </div>
            {options.map((option, i) => (
              <button
                key={option.id}
                data-ai-first-chrome
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm flex items-start gap-2 transition-colors",
                  variant === option.id ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <option.icon className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium">
                    <span className="text-gray-400 mr-1">{String.fromCharCode(65 + i)}.</span>
                    {option.name}
                  </div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
                {variant === option.id && <Check className="w-4 h-4 ml-auto shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
