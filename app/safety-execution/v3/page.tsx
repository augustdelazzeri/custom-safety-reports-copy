"use client";

import { Bench } from "@/components/three-cases/exec/workbench";
import { VariantPage } from "@/components/three-cases/exec/variant-page";

/** V3 · V2 with gray instead of yellow for what is missing or needs action, so it does not shout. */
export default function V3Page() {
  return (
    <VariantPage bare title="Safety work orders" note="V3 · V2 with gray instead of yellow for what needs action.">
      <Bench links calm />
    </VariantPage>
  );
}
