"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CASE_B_OPTIONS, OptionSwitcher } from "../option-switcher";
import { LegacyPageShell, PageShell } from "../shell";
import { FlowMeter, MeterBadge } from "./meter";

/** Option F is frozen as it was shown to Ryan on Oct 20, frame included. */
const FROZEN = ["/safety-execution/task-first"];

/**
 * Frame shared by the Safety Execution options: the option switcher and the click meter, then the
 * option. In the redesign frame the switcher, the meter and the note sit on the ground above the
 * panel, so the panel only shows the product. `bare` hands the whole panel to the option (F1, F2
 * draw their own page header); otherwise the option gets the panel with a 24px margin.
 */
export function VariantPage({
  children,
  mainClassName,
  note,
  title = "Safety Execution",
  bare = false,
  barExtra,
}: {
  children: ReactNode;
  mainClassName?: string;
  note?: string;
  title?: string;
  bare?: boolean;
  /** More prototype controls for the bar, such as the sample-data switch. */
  barExtra?: ReactNode;
}) {
  const pathname = usePathname() ?? "";

  if (FROZEN.includes(pathname)) {
    return (
      <LegacyPageShell title={title} mainClassName="flex flex-col overflow-hidden p-0">
        <FlowMeter className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <div data-no-count className="flex flex-wrap items-center justify-between gap-2">
            <OptionSwitcher caseLabel="Use case 2" options={CASE_B_OPTIONS} legacy />
            <MeterBadge legacy />
          </div>
          {note ? (
            <p data-no-count className="-mt-1 text-xs text-gray-500">
              {note}
            </p>
          ) : null}
          <div className={cn("min-h-0 flex-1", mainClassName)}>{children}</div>
        </FlowMeter>
      </LegacyPageShell>
    );
  }

  return (
    // The meter wraps the whole frame so it can sit in the bar; the shell marks its own chrome as not counted.
    <FlowMeter className="contents">
      <PageShell
        title={title}
        mainClassName="flex flex-col overflow-hidden p-0"
        prototypeBar={
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <OptionSwitcher caseLabel="Use case 2" options={CASE_B_OPTIONS} />
              {barExtra}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              {/* One line until hovered, so the panel keeps its height. */}
              {note ? <p className="line-clamp-1 min-w-0 flex-1 basis-96 px-1 text-xs text-muted-foreground hover:line-clamp-none" title={note}>{note}</p> : <span />}
              <MeterBadge />
            </div>
          </div>
        }
      >
        {bare ? children : <div className={cn("flex min-h-0 flex-1 flex-col p-6", mainClassName)}>{children}</div>}
      </PageShell>
    </FlowMeter>
  );
}
