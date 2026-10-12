"use client";

// P1 · Photo report with up to 3 questions (REL-1, REL-2, TR-2).

import { Camera, ClipboardList, MessagesSquare } from "lucide-react";
import { FlowShell } from "@/components/ai-first/FlowShell";
import { useFlowVariant, type FlowVariantOption } from "@/components/ai-first/FlowVariantPicker";
import { PhotoFirstVariant } from "@/components/ai-first/report/PhotoFirstVariant";
import { FormFillVariant } from "@/components/ai-first/report/FormFillVariant";
import { ChatReport } from "@/components/ai-first/chat/ChatReport";

type Variant = "photo-first" | "conversation" | "form-fill";

const OPTIONS: FlowVariantOption<Variant>[] = [
  { id: "photo-first", name: "Photo first", description: "Photo → AI draft with pins → up to 3 questions → check and send", icon: Camera },
  { id: "conversation", name: "Conversation", description: "The assistant asks, you answer with photo, voice or taps", icon: MessagesSquare },
  { id: "form-fill", name: "Today's form + fill from photo", description: "Incremental baseline: same form, pre-filled by the AI", icon: ClipboardList },
];

export default function PhotoReportPage() {
  const { variant, setVariant } = useFlowVariant<Variant>("report", OPTIONS);

  return (
    <FlowShell
      flowId="report"
      code="P1"
      title="Photo report"
      subtitle="Access Point QR · a photo becomes a report draft, the AI asks only what changes the routing"
      device="mobile"
      options={OPTIONS}
      variant={variant}
      onVariantChange={setVariant}
    >
      {variant === "photo-first" && <PhotoFirstVariant />}
      {variant === "conversation" && <ChatReport theme="assistant" />}
      {variant === "form-fill" && <FormFillVariant />}
    </FlowShell>
  );
}
