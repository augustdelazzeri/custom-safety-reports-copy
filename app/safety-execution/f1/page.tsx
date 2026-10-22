"use client";

import { Bench } from "@/components/three-cases/exec/workbench";
import { VariantPage } from "@/components/three-cases/exec/variant-page";

/** F1 · The long-term vision (it was V4). Not complete: it draws where the feature goes, with PM, drafts and checklists. */
export default function F1Page() {
  return (
    <VariantPage title="Safety Work Orders" note="F1 · Long-term vision. Not complete: this is where we want the feature to go (PM, document drafts, checklists, selecting several assets). The first deliverable is F2 · MVP. Hover a row for New work order / New PM.">
      <Bench links calm status hue="green" />
    </VariantPage>
  );
}
