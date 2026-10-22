"use client";

import { MvpBench } from "@/components/three-cases/exec/mvp-bench";
import { VariantPage } from "@/components/three-cases/exec/variant-page";

/** F2 · MVP: the screen of F1 without what is not in the first deliverable. It is to check that no use case we need was left out. */
export default function F2Page() {
  return (
    <VariantPage title="Safety Work Orders" note="F2 · MVP. The screen of F1 without what is out of the first deliverable (several assets at once, PM, document drafts, SDS, category, time, signature, files, AI checklist). Hover a row for New work order: two clicks with everything filled in.">
      <MvpBench />
    </VariantPage>
  );
}
