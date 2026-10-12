"use client";

// P7 · Photo inspection and failure to work order (EXE-1, EXE-2).

import { Camera, ListChecks, Video } from "lucide-react";
import { FlowShell } from "@/components/ai-first/FlowShell";
import { useFlowVariant, type FlowVariantOption } from "@/components/ai-first/FlowVariantPicker";
import { ItemByItemVariant, PhotosFirstVariant, VideoVariant } from "@/components/ai-first/inspection/InspectionVariants";

type Variant = "photos-first" | "item-by-item" | "video";

const OPTIONS: FlowVariantOption<Variant>[] = [
  { id: "photos-first", name: "Photos first", description: "Walk and shoot, then confirm a checklist the AI pre-answered", icon: Camera },
  { id: "item-by-item", name: "Item by item", description: "Camera on each item; the AI answers only that item", icon: ListChecks },
  { id: "video", name: "Video walkthrough", description: "One narrated video; frames every 4 s linked to each item", icon: Video },
];

export default function PhotoInspectionPage() {
  const { variant, setVariant } = useFlowVariant<Variant>("inspection", OPTIONS);
  return (
    <FlowShell
      flowId="inspection"
      code="P7"
      title="Photo inspection"
      subtitle="The AI pre-answers the checklist from photos or video; you confirm each item; a failure becomes a work order"
      device="mobile"
      options={OPTIONS}
      variant={variant}
      onVariantChange={setVariant}
    >
      {variant === "photos-first" && <PhotosFirstVariant />}
      {variant === "item-by-item" && <ItemByItemVariant />}
      {variant === "video" && <VideoVariant />}
    </FlowShell>
  );
}
