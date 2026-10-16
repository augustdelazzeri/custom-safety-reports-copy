"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

/** Same frame as the Safety pages: fixed sidebar, header, scrollable main. */
export function PageShell({
  title,
  children,
  mainClassName,
}: {
  title?: string;
  children: ReactNode;
  mainClassName?: string;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="ml-64 flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className={cn("flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-6", mainClassName)}>{children}</main>
      </div>
    </div>
  );
}

export function AiTag({ label = "AI", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700",
        className,
      )}
    >
      <Sparkles className="size-3" />
      {label}
    </span>
  );
}

/** "Today vs here" click estimate, so the reader sees the step-change in effort. */
export function TapCompare({ today, here, todayDetail }: { today: string; here: string; todayDetail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-xs text-gray-600">
      <span>
        <span className="font-semibold text-gray-900">Today:</span> {today}
        <span className="text-gray-400"> ({todayDetail})</span>
      </span>
      <span className="h-4 w-px bg-gray-200" />
      <span>
        <span className="font-semibold text-indigo-700">Here:</span> {here}
      </span>
    </div>
  );
}

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-700 ring-1 ring-gray-200",
        className,
      )}
    >
      {initials}
    </span>
  );
}
