"use client";

import { DataModeSwitch } from "@/components/three-cases/data-mode-switch";
import { Bench } from "@/components/three-cases/exec/workbench";
import { VariantPage } from "@/components/three-cases/exec/variant-page";
import { useDataMode } from "@/lib/three-cases/demo-data";

/** F1 · The long-term vision (it was V4). Not complete: it draws where the feature goes, with PM, drafts and checklists. */
export default function F1Page() {
  const [mode] = useDataMode();
  return (
    <VariantPage
      bare
      title="Safety work orders"
      barExtra={<DataModeSwitch />}
      note="F1 · Long-term vision. Not complete: where the feature should go. The first deliverable is F2."
    >
      <Bench links calm status hue="green" mode={mode} />
    </VariantPage>
  );
}
