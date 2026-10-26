"use client";

/**
 * The redesign's own components (upkeepapp/safety-redesign, branch design-review-2026-10-05,
 * src/lab/ui), rebuilt on this prototype's copies of Safety's primitives. Same classes, same
 * tokens: only the routing (Next instead of wouter) and the i18n (plain English) differ.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";

// ───────────────────────────── badges (lab-badge.tsx, lib/badge-tones.ts)

const BADGE_TONES = {
  neutral: "bg-badge-neutral text-badge-neutral-foreground",
  accent: "bg-badge-accent text-badge-accent-foreground",
  warning: "bg-badge-warning text-badge-warning-foreground",
  error: "bg-badge-error text-badge-error-foreground",
  success: "bg-badge-success text-badge-success-foreground",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

/** Safety's soft badge: a 20px pill, tinted fill, same-hue text, no outline. */
export const softBadgeClass = (tone: BadgeTone, className?: string) => cn("rounded-full border-0", BADGE_TONES[tone], className);

export function RdBadge({ children, tone = "neutral", className, title }: { children: ReactNode; tone?: BadgeTone; className?: string; title?: string }) {
  return (
    <Badge title={title} className={softBadgeClass(tone, className)}>
      {children}
    </Badge>
  );
}

// ───────────────────────────── tooltip (lab-tooltip.tsx)

/** Safety's tooltip, drawn dark: a tooltip names a control, it is not an action. */
export function RdTooltip({ label, side, children }: { label: string; side?: "top" | "right" | "bottom" | "left"; children: ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={4} className="bg-foreground text-background [&_svg]:bg-foreground [&_svg]:fill-foreground">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ───────────────────────────── card (lab-card.tsx)

/** 12px radius, no shadow, a tinted header band with a 16px/600 title. */
export function RdCard({
  title,
  icon,
  action,
  padded = false,
  plain = false,
  className,
  children,
}: {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
  plain?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[var(--lab-radius)] border border-border bg-card text-card-foreground", className)}>
      {title ? (
        <div className={cn("flex items-center gap-2", plain ? "px-4 pt-4" : "border-b border-border bg-surface-subtle p-4")}>
          {icon ? <span className="text-muted-foreground [&_svg]:size-4">{icon}</span> : null}
          <h3 className="text-base leading-6 font-semibold text-foreground">{title}</h3>
          {action ? <div className="ml-auto">{action}</div> : null}
        </div>
      ) : null}
      <div className={padded ? "p-4" : ""}>{children}</div>
    </div>
  );
}

// ───────────────────────────── empty state (lab-empty-state.tsx)

/** The one empty state: a quiet card illustration whose badge names what is missing, a title, one line, and the way forward. */
export function RdEmptyState({ title, body, action, icon: Icon, children }: { title: string; body?: string; action?: ReactNode; icon?: LucideIcon; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
      <div className="relative h-31.25 w-48.5 shrink-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- a 64px decorative svg */}
        <img src="/redesign/halo.svg" alt="" className="absolute top-15.5 left-31.75 size-16" />
        <div className="absolute top-2 left-2.25 flex w-40 flex-col gap-2.75 overflow-hidden rounded-[var(--lab-radius)] border border-border bg-background p-4">
          <span className="h-2 w-32 rounded-full bg-surface-subtle" />
          <span className="h-2 w-26 rounded-full bg-muted" />
          <span className="h-2 w-19.5 rounded-full bg-muted" />
          <span className="h-2 w-23 rounded-full bg-muted" />
        </div>
        <span className="absolute top-15.25 left-32.5 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {/* eslint-disable-next-line @next/next/no-img-element -- a 24px decorative svg */}
          {Icon ? <Icon className="size-6" strokeWidth={1.75} /> : <img src="/redesign/check.svg" alt="" className="size-6" />}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <p className="pb-1 text-base font-medium text-muted-foreground">{title}</p>
        {body ? <p className="max-w-xl text-sm text-text-placeholder">{body}</p> : null}
      </div>
      {action}
      {children}
    </div>
  );
}

// ───────────────────────────── notices and fields

/**
 * A quiet notice on the page (Today's "only part of the queue loaded"): the palest grey, the
 * card radius, a line of text and the way forward. Never a coloured box.
 */
export function RdNotice({ icon: Icon, title, children, action, className }: { icon?: LucideIcon; title?: string; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div role="status" className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--lab-radius)] border border-border bg-surface-subtle p-4", className)}>
      {Icon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
        {children ? <div className="text-sm text-muted-foreground">{children}</div> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Safety's input look, for native selects and date fields; `data-slot` lets the friendly look round them too. */
export const fieldClass =
  "flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-white px-3 py-1 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

/** A labelled field: Safety's 14px/500 label, 8px, the control, and a 14px hint or error under it. */
export function RdField({ label, required, hint, className, children }: { label: string; required?: boolean; hint?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm leading-none font-medium text-foreground">
        {label}
        {required ? (
          <span className="ml-0.5 text-muted-foreground" title="Required">
            *
          </span>
        ) : null}
      </span>
      {children}
      {hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

// ───────────────────────────── page header (lab-page.tsx)

/**
 * The page inside the panel: the 32px gutter, the title row (24px bold on lists, 20px on a
 * record) with the page's one primary action on the right, and one quiet line under it.
 * `fill` makes the page take the panel's height, for screens that scroll inside a list.
 */
export function RdPage({
  eyebrow,
  title,
  subtitle,
  actions,
  record = false,
  fill = false,
  onBack,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  record?: boolean;
  fill?: boolean;
  /** A record or a form: the way back sits above it, an outline Back button (Figma 394:223247). */
  onBack?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-6 p-[var(--lab-gutter)]", fill && "h-full min-h-0", className)}>
      <header className="flex shrink-0 flex-col">
        {onBack ? (
          <Button type="button" variant="outline" size="sm" onClick={onBack} className="mb-6 w-fit gap-2 rounded-lg px-3 text-sm text-foreground hover:bg-muted">
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
        ) : null}
        {eyebrow ? <p className="mb-2 text-xs font-medium tracking-[0.02em] text-text-subtle tabular-nums">{eyebrow}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className={cn("font-bold text-foreground", record ? "text-xl leading-6" : "text-2xl leading-8")}>{title}</h1>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
        {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      </header>
      {children}
    </div>
  );
}

// ───────────────────────────── list cells (lab-format.tsx)

export function Muted({ children }: { children?: ReactNode }) {
  return <span className="text-muted-foreground">{children ?? "—"}</span>;
}

/** Title plus its reference id, the pairing every list in the product shows. */
export function TitleCell({ title, reference }: { title: string; reference?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-foreground" title={title}>
        {title}
      </p>
      {reference ? <p className="truncate text-xs font-medium tracking-[0.02em] text-text-subtle">{reference}</p> : null}
    </div>
  );
}

// ───────────────────────────── menus (lab-menu.ts)

export const menuTitle = "px-2 pt-1 pb-2 text-sm leading-5 font-semibold text-foreground";
export const menuList = "flex flex-col gap-2";
export const menuItem =
  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm leading-5 font-medium text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:cursor-default has-disabled:opacity-50";
export const menuItemHint = "text-xs leading-4 font-normal text-muted-foreground";
export const menuNote = "px-2 pt-1 pb-1 text-xs leading-4 text-muted-foreground";
export const menuCaption = "px-2 text-xs leading-4 font-medium text-muted-foreground";

/** The Figma buttons of the redesign: 32px tall, 12px sides, 14px label. */
export const figmaButton = "gap-2 rounded-lg px-3 text-sm [&_svg:not([class*='size-'])]:size-4";

// ───────────────────────────── tabs (lab-tabs.tsx, lab-segmented.tsx)

export interface RdTab {
  key: string;
  label: string;
  count?: number;
  render: () => ReactNode;
}

/** The open tab lives in the address (`?tab=`), so a link or a reload lands on it. */
export function useTabParam(keys: string[], param = "tab", fallback?: string) {
  const first = fallback && keys.includes(fallback) ? fallback : keys[0];
  const [active, setActive] = useState(first);
  useEffect(() => {
    // Read the address once after mount.
    const fromUrl = new URLSearchParams(window.location.search).get(param);
    if (fromUrl && keys.includes(fromUrl)) setActive(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, []);
  const choose = (key: string) => {
    setActive(key);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set(param, key);
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      // The tab still changes; only the address does not follow.
    }
  };
  return [keys.includes(active) ? active : first, choose] as const;
}

/** Safety's underline tabs, the active label and its 2px underline in the accent colour, counts as small soft badges. */
export function RdTabs({ tabs, param = "tab", fallback, onChange, className }: { tabs: RdTab[]; param?: string; fallback?: string; onChange?: (key: string) => void; className?: string }) {
  const [active, choose] = useTabParam(
    tabs.map((t) => t.key),
    param,
    fallback,
  );
  return (
    <Tabs
      value={active}
      onValueChange={(key) => {
        choose(key);
        onChange?.(key);
      }}
      className={cn("gap-6", className)}
    >
      <TabsList className="h-auto w-full items-stretch justify-start gap-2 overflow-x-auto overflow-y-hidden rounded-none border-b border-sidebar-border bg-transparent p-0 pt-4">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className="group h-7 flex-none gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 font-normal text-muted-foreground shadow-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-badge-accent-foreground data-[state=active]:shadow-none"
          >
            {tab.label}
            {tab.count !== undefined ? (
              <Badge className="h-5 rounded-full bg-badge-neutral px-2 py-0 text-xs font-medium text-badge-neutral-foreground tabular-nums group-data-[state=active]:bg-badge-accent group-data-[state=active]:text-badge-accent-foreground">
                {tab.count}
              </Badge>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.key} value={tab.key}>
          {tab.render()}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/** The parts of one section, as Safety's segmented control: a grey track, the open part raised in white. */
export function RdSegmented<T extends string>({ value, options, onChange, className, size = "md" }: { value: T; options: { value: T; label: ReactNode; count?: number }[]; onChange: (v: T) => void; className?: string; size?: "sm" | "md" }) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)} className={className}>
      <TabsList data-lab="segmented" className={cn("max-w-full justify-start overflow-x-auto p-1", size === "sm" ? "h-8" : "h-10")}>
        {options.map((o) => (
          <TabsTrigger key={o.value} value={o.value} className={cn("group flex-none gap-1.5", size === "sm" ? "px-2.5 text-xs" : "px-4")}>
            {o.label}
            {o.count !== undefined ? <span className="text-xs text-muted-foreground tabular-nums group-data-[state=active]:text-foreground">{o.count}</span> : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
