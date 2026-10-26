"use client";

import { Bench } from "@/components/three-cases/exec/workbench";
import { VariantPage } from "@/components/three-cases/exec/variant-page";

/**
 * V1 · built from the real research. Pick the job, tick the assets, then start the missing documents
 * as drafts, or create a PM or a work order with the checklist and documents already attached.
 */
export default function V1Page() {
  return (
    <VariantPage bare title="Safety work orders" note="V1 · Pick the job and the assets. Missing documents start as drafts; a PM or a work order is created with the checklist and the documents attached.">
      <Bench />
    </VariantPage>
  );
}
