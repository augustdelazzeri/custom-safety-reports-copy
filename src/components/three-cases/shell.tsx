"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { PanelLeft, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const SIDEBAR_KEY = "ehs-prototype-sidebar-hidden";

/**
 * Same frame as the Safety pages: sidebar, header, scrollable main. The sidebar hides with the
 * button before the title, as in the product, and the choice is remembered in this browser.
 */
export function PageShell({
  title,
  children,
  mainClassName,
}: {
  title?: string;
  children: ReactNode;
  mainClassName?: string;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      setHidden(window.localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      // Blocked storage: keep the sidebar open.
    }
  }, []);

  const toggle = () => {
    setHidden((h) => {
      try {
        window.localStorage.setItem(SIDEBAR_KEY, h ? "0" : "1");
      } catch {
        // Ignore: the toggle still works for this visit.
      }
      return !h;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {hidden ? null : <Sidebar />}
      <div className={cn("flex min-w-0 flex-1 flex-col overflow-hidden", hidden ? "ml-0" : "ml-64")}>
        <Header
          title={title}
          leading={
            <button
              onClick={toggle}
              className="flex size-8 items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
              aria-label={hidden ? "Show sidebar" : "Hide sidebar"}
              title={hidden ? "Show sidebar" : "Hide sidebar"}
            >
              <PanelLeft className="size-4" />
            </button>
          }
        />
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

/** "Today vs here" click estimate, so the reader sees the step-change in effort. The detail sits in the tooltip. */
export function TapCompare({ today, here, todayDetail }: { today: string; here: string; todayDetail: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600"
      title={`Today: ${today} (${todayDetail})`}
    >
      <span className="whitespace-nowrap">
        <span className="font-semibold text-gray-900">Today:</span> {today}
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
