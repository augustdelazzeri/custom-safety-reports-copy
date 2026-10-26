"use client";

import { DATA_MODES, useDataMode } from "@/lib/three-cases/demo-data";
import { cn } from "@/lib/utils";

/** Prototype control: which plant the screen shows, the sample one or an empty account. */
export function DataModeSwitch() {
  const [mode, setMode] = useDataMode();
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-sidebar-border bg-card p-1">
      <span className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Data</span>
      {DATA_MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          title={m.hint}
          onClick={() => setMode(m.value)}
          aria-pressed={mode === m.value}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            mode === m.value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
