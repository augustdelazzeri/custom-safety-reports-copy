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

export const CASE_B_OPTIONS: OptionLink[] = [
  { href: "/safety-execution/command-bar", label: "A · Command bar", hint: "One field: asset, then task, then Enter" },
  { href: "/compliance-calendar", label: "B · Agenda", hint: "The calendar prepares the work by itself" },
  { href: "/safety-execution/mobile", label: "D · At the asset", hint: "Scan the asset's QR, see its documents, do the job" },
  { href: "/safety-execution/new-work-order", label: "E · New work order", hint: "Today's CMMS form: pick the asset, the documents come with it" },
  { href: "/safety-execution/task-first", label: "F · Task first", hint: "Pick the job, then one or more assets" },
  { href: "/safety-execution/readiness", label: "C · Readiness board", hint: "Every asset of a location at a glance", tested: true, group: "Set aside" },
  { href: "/safety-execution", label: "A · Ask or pick", hint: "First version: chat, location and asset, document grid", tested: true, group: "Earlier versions of A" },
  { href: "/safety-execution/a2", label: "A · Sentence", hint: "Fill the blanks of one sentence", tested: true, group: "Earlier versions of A" },
  { href: "/safety-execution/a3", label: "A · Task cards", hint: "Tasks with a readiness dot, receipt on the side", tested: true, group: "Earlier versions of A" },
  { href: "/safety-execution/a4", label: "A · Steps", hint: "Asset, task, review: one thing per screen", tested: true, group: "Earlier versions of A" },
  { href: "/safety-execution/a5", label: "A · One list", hint: "Asset in the header, tasks as rows, create on the row", tested: true, group: "Earlier versions of A" },
  { href: "/safety-execution/a6", label: "A · Chat + receipt", hint: "Talk on the left, see what will exist on the right", tested: true, group: "Earlier versions of A" },
];

export const CASE_C_OPTIONS: OptionLink[] = [
  { href: "/inbox", label: "A · Inbox + Nova", hint: "Events triaged by AI next to what is already in the Inbox; Nova runs the usual flow" },
  { href: "/events/ev-2041", label: "B · Inside the event", hint: "The next steps live on the event" },
  { href: "/events/board", label: "C · Board", hint: "Open, In review, Closed; drag or decide on the card" },
];

/** Small switcher so the reviewer can compare the prototype options of one use case. */
export function OptionSwitcher({ caseLabel, options }: { caseLabel: string; options: OptionLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isEventDetail = /^\/events\/ev-/.test(pathname);
  const active = isEventDetail
    ? options.find((o) => o.href.startsWith("/events/ev-"))
    : [...options].sort((a, b) => b.href.length - a.href.length).find((o) => pathname === o.href || pathname.startsWith(`${o.href}/`));
  const featured = options.filter((o) => !o.tested);
  const tested = options.filter((o) => o.tested);
  const activeTested = active?.tested ? active : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5">
      <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{caseLabel}</span>
      {featured.map((o) => (
        <Link
          key={o.href}
          href={o.href}
          title={o.hint}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            active?.href === o.href ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100",
          )}
        >
          {o.label}
        </Link>
      ))}
      {tested.length ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center gap-1 rounded-md border-l border-gray-200 px-2.5 py-1 text-xs font-medium transition-colors",
                activeTested ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100",
              )}
            >
              {activeTested ? activeTested.label : `Other options tested (${tested.length})`}
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
  );
}
