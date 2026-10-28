"use client";

import { Bench } from "@/components/three-cases/exec/workbench";
import { VariantPage } from "@/components/three-cases/exec/variant-page";

/** V2 · the same as V1, with each document's ID as a link in the list (drafts too). */
export default function V2Page() {
  return (
    <VariantPage bare title="Safety work orders" note="V2 · V1 with each document ID as a link that opens it.">
      <Bench links />
    </VariantPage>
  );
}
