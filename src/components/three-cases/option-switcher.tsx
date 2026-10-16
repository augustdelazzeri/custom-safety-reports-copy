"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface OptionLink {
  href: string;
  label: string;
  hint: string;
}

export const CASE_B_OPTIONS: OptionLink[] = [
  { href: "/safety-execution", label: "A · Ask or pick", hint: "Chat, location and asset, document grid" },
  { href: "/compliance-calendar", label: "B · Agenda", hint: "The calendar prepares the work by itself" },
  { href: "/safety-execution/readiness", label: "C · Readiness board", hint: "Every asset of a location at a glance" },
  { href: "/safety-execution/mobile", label: "D · At the asset", hint: "Scan the QR, pick the job, do it" },
];

export const CASE_C_OPTIONS: OptionLink[] = [
  { href: "/inbox", label: "A · Inbox", hint: "Decide from the queue" },
  { href: "/events/ev-2041", label: "B · Inside the event", hint: "The next steps live on the event" },
  { href: "/events/board", label: "C · Board", hint: "Every event by stage" },
  { href: "/events/autopilot", label: "D · Autopilot", hint: "AI runs the flow, you handle exceptions" },
];

/** Small switcher so the reviewer can compare the prototype options of one use case. */
export function OptionSwitcher({ caseLabel, options }: { caseLabel: string; options: OptionLink[] }) {
  const pathname = usePathname();
  const isEventDetail = /^\/events\/ev-/.test(pathname);
  const active = isEventDetail
    ? options.find((o) => o.href.startsWith("/events/ev-"))
    : [...options].sort((a, b) => b.href.length - a.href.length).find((o) => pathname === o.href || pathname.startsWith(`${o.href}/`));
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5">
      <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{caseLabel}</span>
      {options.map((o) => (
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
    </div>
  );
}
