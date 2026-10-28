"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface OptionLink {
  href: string;
  label: string;
  hint: string;
  /** Kept for later: listed under "Other options tested" instead of in the switcher. */
  tested?: boolean;
  /** Heading the tested option sits under in that list. */
  group?: string;
}

const F = "/safety-execution/task-first";

export const CASE_B_OPTIONS: OptionLink[] = [
  { href: F, label: "F · Task first (shown to Ryan)", hint: "Shown to Ryan: pick the job, then the assets" },
  { href: "/safety-execution/f1", label: "F1 · Long-term vision", hint: "Where the feature goes: PM, drafts, many assets" },
  { href: "/safety-execution/f2", label: "F2 · MVP", hint: "First deliverable: OSHA rules per job, work order in 2 clicks" },
  { href: "/safety-execution/v1", label: "V1 · Real data", hint: "Pick job and assets, draft what is missing, create the WO", tested: true, group: "Earlier versions of V" },
  { href: "/safety-execution/v2", label: "V2 · Document links", hint: "V1 with each document ID as a link", tested: true, group: "Earlier versions of V" },
  { href: "/safety-execution/v3", label: "V3 · Gray", hint: "V2 with gray instead of yellow", tested: true, group: "Earlier versions of V" },
  { href: "/safety-execution/command-bar", label: "A · Command bar", hint: "One field: asset, then task, then Enter", tested: true, group: "Other ideas" },
  { href: "/compliance-calendar", label: "B · Agenda", hint: "The calendar prepares the work by itself", tested: true, group: "Other ideas" },
  { href: "/safety-execution/mobile", label: "D · At the asset", hint: "Scan the QR, see its documents, do the job", tested: true, group: "Other ideas" },
  { href: "/safety-execution/new-work-order", label: "E · New work order", hint: "Today's CMMS form; the documents come with the asset", tested: true, group: "Other ideas" },
  { href: "/safety-execution/readiness", label: "C · Readiness board", hint: "Every asset of a location at a glance", tested: true, group: "Set aside" },
  { href: "/safety-execution", label: "A · Ask or pick", hint: "First version: chat, asset and document grid", tested: true, group: "Earlier versions of A" },
  { href: "/safety-execution/a2", label: "A · Sentence", hint: "Fill the blanks of one sentence", tested: true, group: "Earlier versions of A" },
  { href: "/safety-execution/a3", label: "A · Task cards", hint: "Tasks with a readiness dot", tested: true, group: "Earlier versions of A" },
  { href: "/safety-execution/a4", label: "A · Steps", hint: "Asset, task, review: one thing per screen", tested: true, group: "Earlier versions of A" },
  { href: "/safety-execution/a5", label: "A · One list", hint: "Asset in the header, tasks as rows", tested: true, group: "Earlier versions of A" },
  { href: "/safety-execution/a6", label: "A · Chat + receipt", hint: "Chat on the left, receipt on the right", tested: true, group: "Earlier versions of A" },
];

export const CASE_C_OPTIONS: OptionLink[] = [
  { href: "/inbox", label: "A · Inbox + Nova", hint: "Events triaged by AI next to the Inbox" },
  { href: "/inbox/a1", label: "A1 · Close work orders", hint: "List of events, CAPAs and documents; close their work orders on the right" },
  { href: "/inbox/a2", label: "A2 · Close + create", hint: "A1, and create the work order on the spot when there is none" },
  { href: "/events/ev-2041", label: "B · Inside the event", hint: "The next steps live on the event" },
  { href: "/events/board", label: "C · Board", hint: "Open, In review, Closed; drag or decide on the card", tested: true, group: "Set aside (Oct 26)" },
];

/** Small switcher so the reviewer can compare the prototype options of one use case. */
export function OptionSwitcher({ caseLabel, options, legacy = false }: { caseLabel: string; options: OptionLink[]; /** Option F's frame, as shown on Oct 20. */ legacy?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isEventDetail = /^\/events\/ev-/.test(pathname);
  const active = isEventDetail
    ? options.find((o) => o.href.startsWith("/events/ev-"))
    : [...options].sort((a, b) => b.href.length - a.href.length).find((o) => pathname === o.href || pathname.startsWith(`${o.href}/`));
  const featured = options.filter((o) => !o.tested);
  const tested = options.filter((o) => o.tested);
  const activeTested = active?.tested ? active : undefined;
  // Option F keeps the look it had on Oct 20; everywhere else the switcher takes Safety's tokens.
  const on = legacy ? "bg-indigo-600 text-white" : "bg-primary text-primary-foreground";
  const off = legacy ? "text-gray-600 hover:bg-gray-100" : "text-muted-foreground hover:bg-muted hover:text-foreground";
  return (
    <div className={legacy ? "rounded-lg border border-gray-200 bg-white px-2 py-1.5" : "w-fit max-w-full rounded-lg border border-sidebar-border bg-card p-1"}>
    <div className={cn("flex flex-wrap items-center", legacy ? "gap-2" : "gap-1")}>
      <span className={legacy ? "px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400" : "px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"}>{caseLabel}</span>
      {featured.map((o) => (
        <Link
          key={o.href}
          href={o.href}
          title={o.hint}
          className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", active?.href === o.href ? on : off)}
        >
          {o.label}
        </Link>
      ))}
      {tested.length ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                legacy && "border-l border-gray-200",
                activeTested ? on : legacy ? "text-gray-500 hover:bg-gray-100" : off,
              )}
            >
              {activeTested ? activeTested.label : `Other options (${tested.length})`}
              <ChevronDown className="size-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-1.5">
            <p className="px-2 pb-1 pt-1 text-[11px] text-gray-400">Tested and set aside. Still here to compare.</p>
            {tested.map((o, i) => (
              <div key={o.href}>
                {o.group && o.group !== tested[i - 1]?.group ? (
                  <p className="px-2 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{o.group}</p>
                ) : null}
                <Link
                  href={o.href}
                  onClick={() => setOpen(false)}
                  className={cn("flex flex-col rounded-md px-2 py-1.5 hover:bg-gray-50", active?.href === o.href && "bg-indigo-50")}
                >
                  <span className="text-xs font-medium text-gray-900">{o.label}</span>
                  <span className="text-[11px] text-gray-500">{o.hint}</span>
                </Link>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
    </div>
  );
}
