"use client";

// P8 · Supervisor decision queue, exceptions only (TR-1). Evolves today's Inbox (GUARD-1429).

import { LayoutList, Rows3, Table2 } from "lucide-react";
import { FlowShell } from "@/components/ai-first/FlowShell";
import { useFlowVariant, type FlowVariantOption } from "@/components/ai-first/FlowVariantPicker";
import { CardsVariant, ExceptionsVariant, TableVariant } from "@/components/ai-first/inbox/InboxVariants";

type Variant = "exceptions" | "cards" | "table";

const OPTIONS: FlowVariantOption<Variant>[] = [
  { id: "exceptions", name: "Exceptions first", description: "Decisions on the left by risk, detail on the right, low-risk items accepted in a batch", icon: LayoutList },
  { id: "cards", name: "One at a time", description: "Triage deck with progress and keyboard shortcuts", icon: Rows3 },
  { id: "table", name: "Today's inbox + AI column", description: "Incremental: the current table with the AI suggestion and Accept", icon: Table2 },
];

export default function SupervisorQueuePage() {
  const { variant, setVariant } = useFlowVariant<Variant>("inbox", OPTIONS);
  return (
    <FlowShell
      flowId="inbox"
      code="P8"
      title="Supervisor queue"
      subtitle="The AI prepares every item; you only see what needs a decision, with the reason and the confidence"
      device="desktop"
      options={OPTIONS}
      variant={variant}
      onVariantChange={setVariant}
    >
      {variant === "exceptions" && <ExceptionsVariant />}
      {variant === "cards" && <CardsVariant />}
      {variant === "table" && <TableVariant />}
    </FlowShell>
  );
}
