"use client";

// P3 · From the event to the action plan (CAPA-1, OS-1, CAPA-3, REL-7).
// CAPA stays a separate record that groups work orders, Learn training, document changes and
// calendar tasks, but the AI creates all of it behind one confirmation.

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ListChecks, PanelRight, Rows3 } from "lucide-react";
import { FlowShell } from "@/components/ai-first/FlowShell";
import { useFlowVariant, type FlowVariantOption } from "@/components/ai-first/FlowVariantPicker";
import { OneScreenVariant, SidePanelVariant, WizardVariant } from "@/components/ai-first/plan/PlanVariants";

type Variant = "one-screen" | "side-panel" | "wizard";

const OPTIONS: FlowVariantOption<Variant>[] = [
  { id: "one-screen", name: "Plan on one screen", description: "Root cause, CAPAs and every sub-task on one page, one Create button", icon: Rows3 },
  { id: "side-panel", name: "Side panel on the event", description: "The event stays in front; the AI plan opens beside it", icon: PanelRight },
  { id: "wizard", name: "Step by step", description: "Root cause → actions → owners and dates → review", icon: ListChecks },
];

function ActionPlanFlow() {
  const params = useSearchParams();
  const reportId = params.get("report");
  const { variant, setVariant } = useFlowVariant<Variant>("action-plan", OPTIONS);

  return (
    <FlowShell
      flowId="action-plan"
      code="P3"
      title="Event to action plan"
      subtitle="The AI proposes CAPAs with work orders, Learn training, SOP changes and calendar tasks, then chases them"
      device="desktop"
      options={OPTIONS}
      variant={variant}
      onVariantChange={setVariant}
    >
      {variant === "one-screen" && <OneScreenVariant reportId={reportId} />}
      {variant === "side-panel" && <SidePanelVariant reportId={reportId} />}
      {variant === "wizard" && <WizardVariant reportId={reportId} />}
    </FlowShell>
  );
}

export default function ActionPlanPage() {
  return (
    <Suspense>
      <ActionPlanFlow />
    </Suspense>
  );
}
