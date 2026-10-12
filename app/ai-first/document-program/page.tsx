"use client";

// P5 · Document in, program out (DOC-1, DOC-3).

import { Columns2, Library, ListChecks } from "lucide-react";
import { FlowShell } from "@/components/ai-first/FlowShell";
import { useFlowVariant, type FlowVariantOption } from "@/components/ai-first/FlowVariantPicker";
import { LibraryVariant, SectionsVariant, SplitVariant } from "@/components/ai-first/program/ProgramVariants";

type Variant = "sections" | "split" | "library";

const OPTIONS: FlowVariantOption<Variant>[] = [
  { id: "sections", name: "Plan by section", description: "Upload, then approve each part of the program on its own", icon: ListChecks },
  { id: "split", name: "Document beside the plan", description: "The PDF on the left; hovering a section highlights its source", icon: Columns2 },
  { id: "library", name: "Start from the library", description: "Pick a template by industry and regulation; the AI fits it to your sites", icon: Library },
];

export default function DocumentProgramPage() {
  const { variant, setVariant } = useFlowVariant<Variant>("document-program", OPTIONS);
  return (
    <FlowShell
      flowId="document-program"
      code="P5"
      title="Document in, program out"
      subtitle="One upload becomes SOP, checklist, cadence, failure rule, CMMS PM and training, plus what the document is missing"
      device="desktop"
      options={OPTIONS}
      variant={variant}
      onVariantChange={setVariant}
    >
      {variant === "sections" && <SectionsVariant />}
      {variant === "split" && <SplitVariant />}
      {variant === "library" && <LibraryVariant />}
    </FlowShell>
  );
}
