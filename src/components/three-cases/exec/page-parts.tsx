"use client";

/** The parts F1 and F2 share, drawn in the Safety redesign's language. */

import { RdEmptyState, RdNotice } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Boxes, Check, FileText, FileUp, Plus, X } from "lucide-react";
import type { ReactNode } from "react";

export const PAGE_TITLE = "Safety work orders";

/** A job row in the list on the left: 32px, quiet grey until hovered or current, like the sidebar. */
export const jobRow = (on: boolean) => cn("group flex min-h-8 items-center gap-1 rounded-lg px-3 py-1 transition-colors", on ? "bg-muted" : "hover:bg-muted");
export const jobLabel = (on: boolean) => cn("min-w-0 flex-1 truncate text-left text-sm outline-none", on ? "font-semibold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground");
/** Group labels at the sidebar's 12px, kept clear of the friendly look's larger small text. */
export const groupLabel = "px-3 pb-1 text-[0.75rem] leading-4 font-medium tracking-wide text-muted-foreground uppercase";

/** The account has assets but no Safety documents: say so once, above the list, with the way forward. */
export function NoDocsNotice({ ai = false }: { ai?: boolean }) {
  return (
    <RdNotice
      icon={FileText}
      title="No safety documents yet"
      action={
        <Button size="sm" variant="outline" className="gap-2" title="Opens the upload in Safety (not part of this prototype)">
          <FileUp className="size-4" /> Upload documents
        </Button>
      }
    >
      {ai
        ? "Work orders still go out, without them. Tick the assets and let the AI draft what each job needs, or upload the JHAs, SOPs and LOTOs you use as PDFs."
        : "Work orders still go out, without them. Upload the JHAs, SOPs and LOTOs you use as PDFs: Safety turns each one into a draft and links it to its asset."}
    </RdNotice>
  );
}

/** No assets and no documents: nothing to pick yet, so the page says where to start. */
export function NewAccount() {
  const steps = [
    { title: "Add your assets", body: "They come from Maintenance: add them there or import a spreadsheet." },
    { title: "Upload your documents", body: "JHA, SOP, LOTO, permits and audits as PDFs. Safety turns each one into a draft and links it to its asset." },
    { title: "Pick a job, then the asset", body: "The work order comes with the documents the OSHA asks for that job." },
  ];
  return (
    <div className="flex flex-1 flex-col items-center">
      <RdEmptyState
        icon={Boxes}
        title="No assets yet"
        body="Safety work orders start from an asset. Once your assets are in, every job shows the documents the OSHA asks for on each one."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button title="Opens Maintenance (not part of this prototype)">
              <Plus className="size-4" /> Add assets
            </Button>
            <Button variant="outline" title="Opens the upload in Safety (not part of this prototype)">
              <FileUp className="size-4" /> Upload documents
            </Button>
          </div>
        }
      />
      <ol className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3 rounded-[var(--lab-radius)] border border-border p-4">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-accent text-xs font-semibold text-badge-accent-foreground">{i + 1}</span>
            <span>
              <span className="block text-sm font-medium text-foreground">{s.title}</span>
              <span className="block text-sm text-muted-foreground">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
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
