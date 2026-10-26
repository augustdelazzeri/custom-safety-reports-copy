"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { RedesignShell } from "@/components/redesign/shell";
import { cn } from "@/lib/utils";
import { PanelLeft, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const SIDEBAR_KEY = "ehs-prototype-sidebar-hidden";

/**
 * The frame of the Safety redesign (Thiago's safety-redesign, design-review-2026-10-05): global
 * top bar, the nine-row sidebar and the page in one floating panel. `prototypeBar` holds the
 * prototype's own controls, on the ground above the panel.
 */
export function PageShell({
  title,
  children,
  mainClassName,
  aside,
  prototypeBar,
  onAskSafety,
}: {
  title?: string;
  children: ReactNode;
  mainClassName?: string;
  /** Full-height panel on the right of the page (Nova). */
  aside?: ReactNode;
  prototypeBar?: ReactNode;
  /** Opens the page's own Nova from Ask Safety in the top bar. */
  onAskSafety?: () => void;
}) {
  return (
    <RedesignShell title={title} aside={aside} prototypeBar={prototypeBar} onAskSafety={onAskSafety} panelClassName={cn("p-[var(--lab-gutter)]", mainClassName)}>
      {children}
    </RedesignShell>
  );
}

/**
 * The frame as it was on Oct 20, when option F was shown to Ryan: today's Safety sidebar, the
 * header, a scrollable main. Kept for option F only, so it stays exactly as presented.
 */
export function LegacyPageShell({
  title,
  children,
  mainClassName,
  aside,
}: {
  title?: string;
  children: ReactNode;
  mainClassName?: string;
  /** Full-height panel on the right, next to the header and the page (Nova). */
  aside?: ReactNode;
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
      {aside}
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
      className="flex items-center gap-3 rounded-lg border border-dashed border-sidebar-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
      title={`Today: ${today} (${todayDetail})`}
    >
      <span className="whitespace-nowrap">
        <span className="font-semibold text-foreground">Today:</span> {today}
      </span>
      <span className="h-4 w-px bg-border" />
      <span>
        <span className="font-semibold text-badge-accent-foreground">Here:</span> {here}
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
