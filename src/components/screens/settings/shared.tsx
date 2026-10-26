"use client";

/**
 * Pieces every Settings tab shares, after the redesign's settings-shared.tsx: the tab heading
 * with its one action, a section heading, a disabled action that says why on hover, the
 * row menu, a dialog for a short form, and the placeholder card for low-relevance tabs.
 */

import { RdBadge, RdCard, RdTooltip, fieldClass, figmaButton, menuItem } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { NOT_IN_PROTOTYPE, type PlaceholderSpec } from "@/lib/screens/settings";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Plus } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

export const settingsButton = figmaButton;

/** A native select in Safety's input look, red once the form says it is wrong. */
export const selectClass = cn(fieldClass, "aria-invalid:border-destructive aria-invalid:ring-destructive/20");

/** One Settings tab: its name and purpose, fixed above whatever part of it is open, with the open part's main action. */
export function SettingsPane({ title, description, action, children }: { title: string; description: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg leading-7 font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
      </header>
      {children}
    </div>
  );
}

/** A section inside a tab: optional 16px title, one grey line, its own actions on the right. */
export function SettingsSection({ title, description, actions, children }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      {title || description || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {title ? <h3 className="text-base leading-6 font-semibold text-foreground">{title}</h3> : null}
            {description ? <p className={cn("text-sm text-muted-foreground", title && "mt-1")}>{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** An action the prototype does not have: drawn so the page reads like the product, disabled, and saying why on hover. */
export function SoonAction({ children }: { children: ReactNode }) {
  return (
    <RdTooltip label={NOT_IN_PROTOTYPE}>
      <span tabIndex={0} className="inline-flex rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        {children}
      </span>
    </RdTooltip>
  );
}

export interface RowMenuItem {
  key: string;
  label: string;
  onSelect?: () => void;
  /** Drawn but not part of the prototype. */
  soon?: boolean;
}

/** The row's "more" menu; clicks inside it never open the row. */
export function RowMenu({ label, items }: { label: string; items: RowMenuItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`More for ${label}`}>
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-52 p-2">
          <div className="flex flex-col">
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                disabled={item.soon}
                title={item.soon ? NOT_IN_PROTOTYPE : undefined}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
                className={cn(menuItem, "disabled:cursor-default disabled:opacity-50")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** A short form in Safety's dialog: title, why, fields, then Cancel and the action. */
export function SettingsFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  onSubmit: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md md:max-w-md">
        <form
          className="flex flex-col gap-6"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <div className="flex flex-col gap-4">{children}</div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" className={settingsButton} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className={settingsButton}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** A labelled field with a hint, or an error once the form was submitted. */
export function SettingsField({ label, htmlFor, hint, error, children }: { label: string; htmlFor?: string; hint?: ReactNode; error?: string | null; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm leading-5 font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** A tab's main action that the prototype does not have yet. */
export function SoonPrimary({ label }: { label: string }) {
  return (
    <SoonAction>
      <Button type="button" size="sm" className={settingsButton} disabled>
        <Plus aria-hidden />
        {label}
      </Button>
    </SoonAction>
  );
}

/** Low-relevance tab or part: one card, one sentence and one disabled control, in the same design system. */
export function PlaceholderCard({ spec }: { spec: PlaceholderSpec }) {
  return (
    <RdCard>
      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base leading-6 font-semibold text-foreground">{spec.card}</p>
            {spec.badge ? <RdBadge tone={spec.badge === "Active" ? "accent" : "neutral"}>{spec.badge}</RdBadge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{spec.body}</p>
        </div>
        <SoonAction>
          {spec.control.kind === "switch" ? (
            <Switch disabled aria-label={spec.control.label} />
          ) : (
            <Button type="button" variant="outline" size="sm" className={settingsButton} disabled>
              {spec.control.label}
            </Button>
          )}
        </SoonAction>
      </div>
    </RdCard>
  );
}
