"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { CASE_B_OPTIONS, OptionSwitcher } from "../option-switcher";
import { PageShell } from "../shell";
import { FlowMeter, MeterBadge } from "./meter";

/** Frame shared by the Safety Execution options: option switcher, click meter, then the option. */
export function VariantPage({ children, mainClassName, note, title = "Safety Execution" }: { children: ReactNode; mainClassName?: string; note?: string; title?: string }) {
  return (
    <PageShell title={title} mainClassName="flex flex-col overflow-hidden p-0">
      <FlowMeter className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <div data-no-count className="flex flex-wrap items-center justify-between gap-2">
          <OptionSwitcher caseLabel="Use case 2" options={CASE_B_OPTIONS} />
          <MeterBadge />
        </div>
        {note ? (
          <p data-no-count className="-mt-1 text-xs text-gray-500">
            {note}
          </p>
        ) : null}
        <div className={cn("min-h-0 flex-1", mainClassName)}>{children}</div>
      </FlowMeter>
    </PageShell>
  );
}
