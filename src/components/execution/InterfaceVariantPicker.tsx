"use client";

import React, { useEffect, useState } from "react";
import { LayoutGrid, Columns2, GitCommitHorizontal, PanelTop, Rows3, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type InterfaceVariant = "top-blocks" | "split-screen" | "stepper" | "tabs" | "compact-bar";

export const VARIANT_OPTIONS: { id: InterfaceVariant; name: string; description: string; icon: React.ElementType }[] = [
  { id: "top-blocks", name: "Top Blocks", description: "Two quadrant cards, fixed above the document details", icon: LayoutGrid },
  { id: "split-screen", name: "Split Screen", description: "Checklist on the left, execution status on the right", icon: Columns2 },
  { id: "stepper", name: "Stepper", description: "Horizontal progress: Document → Checklist → Execution", icon: GitCommitHorizontal },
  { id: "tabs", name: "Tabs", description: "Execution and document overview as separate tabs", icon: PanelTop },
  { id: "compact-bar", name: "Compact Bar", description: "Single collapsible status row, minimal footprint", icon: Rows3 },
];

const STORAGE_KEY = "ehs-prototype-interface-variant";
const DEFAULT_VARIANT: InterfaceVariant = "top-blocks";

export function useInterfaceVariant() {
  const [variant, setVariantState] = useState<InterfaceVariant>(DEFAULT_VARIANT);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as InterfaceVariant | null;
      if (saved && VARIANT_OPTIONS.some((v) => v.id === saved)) setVariantState(saved);
    } catch {
      // ignore
    }
  }, []);

  const setVariant = (next: InterfaceVariant) => {
    setVariantState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  return { variant, setVariant };
}

interface PickerProps {
  variant: InterfaceVariant;
  onChange: (variant: InterfaceVariant) => void;
}

export function InterfaceVariantPicker({ variant, onChange }: PickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const current = VARIANT_OPTIONS.find((v) => v.id === variant) ?? VARIANT_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <current.icon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">{current.name}</span>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-20 border border-gray-200 py-1">
            <div className="px-3 py-2 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase">Execution UI — prototype options</p>
            </div>
            {VARIANT_OPTIONS.map((option) => (
              <button
                key={option.id}
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
                  <div className="font-medium">{option.name}</div>
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
