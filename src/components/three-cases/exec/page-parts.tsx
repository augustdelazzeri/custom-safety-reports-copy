"use client";

/** The parts F1 and F2 share, drawn in the Safety redesign's language. */

import { RdEmptyState } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Boxes, Check, ChevronRight, Eye, EyeOff, Plus, X } from "lucide-react";
import { useState, type ReactNode } from "react";

export const PAGE_TITLE = "Safety work orders";

/** A job row in the list on the left: 32px, quiet grey until hovered or current, like the sidebar. */
export const jobRow = (on: boolean) => cn("group flex min-h-8 items-center gap-1 rounded-lg px-3 py-1 transition-colors", on ? "bg-muted" : "hover:bg-muted");
export const jobLabel = (on: boolean) => cn("min-w-0 flex-1 truncate text-left text-sm outline-none", on ? "font-semibold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground");
/** Group labels at the sidebar's 12px, kept clear of the friendly look's larger small text. */
export const groupLabel = "px-3 pb-1 text-[0.75rem] leading-4 font-medium tracking-wide text-muted-foreground uppercase";

/** No assets in the account: say it plainly and link to the Assets screen. Nothing else. */
export function NoAssets() {
  return (
    <div className="flex flex-1 flex-col items-center">
      <RdEmptyState
        icon={Boxes}
        title="You have no assets"
        body="Work orders start from an asset."
        action={
          <Button asChild>
            <a href="#" onClick={(e) => e.preventDefault()} title="Opens Assets in Maintenance (not part of this prototype)">
              <Plus className="size-4" /> Create assets
            </a>
          </Button>
        }
      />
    </div>
  );
}

/** The hide button of a job row (shown on hover) and the "Hidden (n)" list under the jobs, to bring them back. */
export function HideJobButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button aria-label={`Hide ${label}`} title="Hide this routine. You can show it again under Hidden." onClick={onClick} className="shrink-0 text-text-placeholder opacity-0 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100">
      <EyeOff className="size-3.5" />
    </button>
  );
}

export function HiddenJobs({ jobs, onShow }: { jobs: { id: string; label: string }[]; onShow: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  if (!jobs.length) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
        <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
        Hidden ({jobs.length})
      </button>
      {open
        ? jobs.map((j) => (
            <div key={j.id} className="group flex min-h-8 items-center gap-1 rounded-lg px-3 py-1 hover:bg-muted">
              <span className="min-w-0 flex-1 truncate text-sm text-text-placeholder">{j.label}</span>
              <button aria-label={`Show ${j.label}`} title="Show this routine again" onClick={() => onShow(j.id)} className="shrink-0 text-muted-foreground hover:text-foreground">
                <Eye className="size-3.5" />
              </button>
            </div>
          ))
        : null}
    </div>
  );
}

/** The row action: a small icon button that is always in its own cell, so it never covers the list or blocks a click. */
export function RowAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <Button size="icon-xs" variant="outline" aria-label={label} title={label} onClick={onClick} className="bg-card opacity-0 transition focus-visible:opacity-100 group-hover:opacity-100">
      {children}
    </Button>
  );
}

export interface Created {
  title: string;
  line: string;
  ref: string;
  /** What "Open" would open, for its tooltip. */
  what?: string;
}

/** Safety's toast: light, bottom-right, with the link to what was created. It does not hide the list. */
export function CreatedToast({ t, close }: { t: Created | null; close: () => void }) {
  if (!t) return null;
  return (
    <div role="status" className="fixed right-6 bottom-6 z-50 w-80 animate-in rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg duration-300 fade-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-success text-badge-success-foreground">
          <Check className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{t.title}</p>
          <p className="truncate text-sm text-muted-foreground">{t.line}</p>
          <button title={`Opens the ${t.what ?? "work order"} inside Safety (not part of this prototype)`} className="mt-1.5 text-sm font-medium text-badge-accent-foreground hover:underline">
            Open {t.ref}
          </button>
        </div>
        <button onClick={close} aria-label="Close" className="text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** The heading over the list: the job's question and one line about its assets. */
export function ListHeading({ title, line, children }: { title: string; line: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base leading-6 font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{line}</p>
      </div>
      {children}
    </div>
  );
}
