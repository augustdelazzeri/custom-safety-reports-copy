"use client";

import { DataModeSwitch } from "@/components/three-cases/data-mode-switch";
import { MvpBench } from "@/components/three-cases/exec/mvp-bench";
import { VariantPage } from "@/components/three-cases/exec/variant-page";
import { useDataMode } from "@/lib/three-cases/demo-data";

/** F2 · MVP: the screen of F1 without what is not in the first deliverable. It is to check that no use case we need was left out. */
export default function F2Page() {
  const [mode] = useDataMode();
  return (
    <VariantPage
      bare
      title="Safety work orders"
      barExtra={<DataModeSwitch />}
      note="F2 · MVP. F1 without what is outside the first deliverable (several assets at once, PM, document drafts, SDS, category, time, signature, files, AI checklist). Hover a row for New work order: two clicks with everything filled in. Data switches to an empty account."
    >
      {/* A new store for each plant: the empty account keeps its own work orders. */}
      <MvpBench key={mode} mode={mode} />
    </VariantPage>
  );
}
