"use client";

import { Bench } from "@/components/three-cases/exec/workbench";
import { VariantPage } from "@/components/three-cases/exec/variant-page";

/** V4 · V3 where the color of each document is its status (no words), with a legend; approved in green. */
export default function V4Page() {
  return (
    <VariantPage title="Safety Work Orders" note="V4 · The color of each document is its status. Hover a row for New work order / New PM: two clicks with everything filled in.">
      <Bench links calm status hue="green" />
    </VariantPage>
  );
}
