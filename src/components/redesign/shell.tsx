"use client";

/**
 * The frame of the Safety redesign (upkeepapp/safety-redesign, branch design-review-2026-10-05,
 * src/lab/shell/lab-shell.tsx), with this prototype's routes:
 *
 *   1. The top bar is global: app switcher, the UpKeep logo with the product pill, the breadcrumb,
 *      then Ask Safety, search, help, notifications and the account, on the #f0f0f3 ground.
 *   2. The sidebar has no header. It starts at the first destination and ends with settings and
 *      the collapse control. The five documentation types are one Documentation page with tabs.
 *   3. The page is one white panel with a shadow, floating on the ground.
 *
 * Prototype controls (the option switcher, the click meter) sit on the ground above the panel,
 * so the panel only shows what the product would.
 */

import { NovaBall } from "@/components/three-cases/nova-panel";
import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useProfile } from "@/contexts/ProfileContext";
import { useThreeCases } from "@/contexts/ThreeCasesContext";
import { setDataMode } from "@/lib/three-cases/demo-data";
import { resetMvpStore } from "@/lib/three-cases/mvp-rules";
import { resetRealStore } from "@/lib/three-cases/real-jobs";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  Bell,
  GraduationCap,
  ChartNoAxesColumn,
  Check,
  CircleHelp,
  Clipboard,
  FileText,
  Inbox,
  LayoutGrid,
  ListChecks,
  Menu,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  User,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { RdTooltip, menuItem, menuItemHint, menuList, menuNote, menuTitle } from "./ui";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Paths that light this row up, when more than its own href. */
  match?: string[];
}
interface NavGroup {
  key: string;
  label: string | null;
  items: NavItem[];
}

/**
 * The redesign's destinations, plus the prototype's demo page at the top. The SDS library is a tab of
 * Documentation, and OSHA (log, 300A, agency reports) and the calendar are tabs of Compliance.
 */
const NAV: NavGroup[] = [
  {
    key: "primary",
    label: null,
    items: [
      { key: "demo", label: "Demo: 3 use cases", href: "/demo", icon: Sparkles },
      { key: "today", label: "Today", href: "/inbox", icon: Inbox },
    ],
  },
  {
    key: "work",
    label: "Work",
    items: [
      { key: "events", label: "Events", href: "/events", icon: TriangleAlert },
      { key: "actions", label: "Corrective actions", href: "/actions", icon: ListChecks },
      { key: "workOrders", label: "Safety work orders", href: "/work-orders", icon: Clipboard, match: ["/work-orders", "/safety-execution"] },
      { key: "documentation", label: "Documentation", href: "/documentation", icon: FileText },
    ],
  },
  {
    key: "oversight",
    label: "Oversight",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: ChartNoAxesColumn },
      { key: "compliance", label: "Compliance", href: "/compliance", icon: ShieldCheck, match: ["/compliance", "/compliance-calendar", "/osha"] },
    ],
  },
  {
    key: "resources",
    label: "Resources",
    items: [{ key: "accessPoints", label: "Access points", href: "/access-points", icon: QrCode }],
  },
];

const isActive = (path: string, item: NavItem) => {
  const roots = item.match ?? [item.href];
  return roots.some((r) => (r === "/" ? path === "/" : path === r || path.startsWith(`${r}/`)));
};

const COLLAPSE_KEY = "ehs-prototype-redesign-sidebar";

/** Safety's sidebar-footer icon button: 32px, 16px muted icon, slate-5 on hover. */
const shellIconClass = "relative text-muted-foreground hover:bg-sidebar-accent hover:text-foreground";
const iconButton = cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), shellIconClass);

let collapsedCache = false;

function SidebarRow({ item, active, collapsed, onNavigate }: { item: NavItem; active: boolean; collapsed: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      data-lab="nav-item"
      // Figma 394:78090: 32px row, 16px icon, quiet grey until hovered or current; the current
      // row is slate-5 with the label in the text colour, semibold.
      className={cn(
        "flex h-8 items-center gap-2 rounded-sm p-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
        collapsed && "size-8 justify-center p-0",
        active && "bg-sidebar-accent font-semibold text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
  return collapsed ? (
    <RdTooltip label={item.label} side="right">
      {link}
    </RdTooltip>
  ) : (
    link
  );
}

function NavGroups({ path, collapsed, onNavigate }: { path: string; collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto px-1" aria-label="Main navigation">
      {NAV.map((group) => (
        <div key={group.key} className="flex flex-col gap-0.5">
          {group.label && !collapsed ? <span className="px-2 pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.label}</span> : null}
          {group.items.map((item) => (
            <SidebarRow key={item.key} item={item} active={isActive(path, item)} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  );
}

// ───────────────────────────── top bar menus (lab-shell-menus.tsx)

/** The UpKeep products, each with its icon in UpKeep's red, as the product's app switcher shows them. */
function AppSwitcher() {
  const apps: { label: string; hint: string; icon: LucideIcon; on?: boolean }[] = [
    { label: "Maintenance", hint: "Work orders, assets, PMs", icon: Wrench },
    { label: "Safety", hint: "Events, CAPAs, documents", icon: ShieldCheck, on: true },
    { label: "Learn", hint: "Training and courses", icon: GraduationCap },
  ];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label="Switch app" className={iconButton}>
          <LayoutGrid className="size-4" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <p className={menuTitle}>UpKeep apps</p>
        <ul className={menuList}>
          {apps.map((a) => (
            <li key={a.label} className={cn(menuItem, a.on && "bg-accent")}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--red-2)] text-[var(--upkeep-brand)]">
                <a.icon className="size-4" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span>{a.label}</span>
                <span className={menuItemHint}>{a.hint}</span>
              </span>
              {a.on ? <Check className="size-4 shrink-0 text-primary" aria-hidden /> : null}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

const TOUR = [
  { label: "The 3 use cases, one page", href: "/demo" },
  { label: "Use case 2 · Safety work orders (F2 · MVP)", href: "/safety-execution/f2" },
  { label: "Use case 3 · Today with Nova (A)", href: "/inbox" },
  { label: "Use case 3 · Source lists (A1)", href: "/inbox/a1" },
  { label: "Documentation, one page with tabs", href: "/documentation" },
];

function Help() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <RdTooltip label="Help">
        <PopoverTrigger asChild>
          <button type="button" aria-label="Help" className={iconButton}>
            <CircleHelp className="size-4" aria-hidden />
          </button>
        </PopoverTrigger>
      </RdTooltip>
      <PopoverContent align="end" className="w-80 p-2">
        <p className={menuTitle}>Where to start</p>
        <ol className={menuList}>
          {TOUR.map((step, i) => (
            <li key={step.href}>
              <Link href={step.href} onClick={() => setOpen(false)} className={cn(menuItem, "items-start")}>
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-badge-accent text-xs font-semibold text-badge-accent-foreground">{i + 1}</span>
                <span>{step.label}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className={cn(menuNote, "mt-1")}>A prototype: the AI is scripted, the plant and people are made up, and nothing leaves this browser.</p>
      </PopoverContent>
    </Popover>
  );
}

const NOTIFICATIONS = [
  { title: "Hydraulic Press 4: hand caught in the platen", hint: "Event · new report", href: "/inbox" },
  { title: "LOTO-0030 Dock leveler 2 isolation, version 2.0", hint: "Document · waiting for your approval", href: "/inbox" },
  { title: "CAPA-0039 Guard missing on band saw", hint: "Corrective action · overdue", href: "/inbox" },
];

function Notifications() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Notifications, ${NOTIFICATIONS.length}`} className={iconButton}>
          <Bell className="size-4" aria-hidden />
          <span className="absolute -top-0.5 left-4.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] leading-3 font-semibold text-destructive-foreground tabular-nums">
            {NOTIFICATIONS.length}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-2">
        <p className={menuTitle}>Notifications</p>
        <ul className={menuList}>
          {NOTIFICATIONS.map((n) => (
            <li key={n.title}>
              <Link href={n.href} onClick={() => setOpen(false)} className={cn(menuItem, "flex-col items-stretch gap-0")}>
                <span className="truncate">{n.title}</span>
                <span className={cn(menuItemHint, "truncate")}>{n.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/inbox" onClick={() => setOpen(false)} className="mt-1 flex h-9 items-center rounded-lg p-2 text-sm leading-5 font-medium text-badge-accent-foreground transition-colors hover:bg-accent">
          Open Today
        </Link>
      </PopoverContent>
    </Popover>
  );
}

function AccountMenu() {
  const { currentProfile, switchProfile } = useProfile();
  const { reset } = useThreeCases();
  const [done, setDone] = useState(false);
  return (
    <Popover onOpenChange={(o) => !o && setDone(false)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Account"
          className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <User className="size-4" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        <div className="px-2 pt-1 pb-2">
          <p className="text-sm font-semibold text-foreground">Maria Lopez</p>
          <p className="text-xs text-muted-foreground">maria.lopez@northwind.example · EHS Manager</p>
        </div>
        <p className={cn(menuNote, "pt-2")}>View as</p>
        <ul className="flex flex-col">
          {(
            [
              ["global_admin", "Global Admin"],
              ["technician", "Technician"],
            ] as const
          ).map(([id, label]) => (
            <li key={id}>
              <button type="button" onClick={() => switchProfile(id)} className={menuItem}>
                <span className="flex-1">{label}</span>
                {currentProfile === id ? <Check className="size-4 text-primary" aria-hidden /> : null}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-1 border-t border-border pt-1">
          <button
            type="button"
            className={menuItem}
            onClick={() => {
              reset();
              resetRealStore();
              resetMvpStore();
              setDataMode("sample");
              setDone(true);
            }}
          >
            <span className="flex-1">Restart the demo</span>
            {done ? <Check className="size-4 text-primary" aria-hidden /> : null}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Ask Safety opens Nova. Not connected in this prototype: the panel it will live in. */
function AskSafety({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()} modal={false}>
      <SheetContent side="right" className="w-full gap-0 border-sidebar-border bg-surface-subtle p-0 sm:max-w-110 [&>button:last-child]:hidden">
        <div className="flex h-15 shrink-0 items-center justify-between border-b border-sidebar-border bg-background pr-3 pl-4">
          <div className="flex items-center gap-2">
            <NovaBall />
            <SheetTitle className="text-base leading-6 font-semibold">Nova</SheetTitle>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close Nova">
            <X aria-hidden />
          </Button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
          <div className="flex items-start gap-2">
            <span className="flex shrink-0 items-center rounded-full bg-muted p-2">
              <NovaBall />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-[var(--lab-radius)] bg-muted p-4">
              <SheetDescription className="text-sm font-medium text-foreground">Ask anything about your Safety records.</SheetDescription>
              <p className="text-sm text-muted-foreground">In this prototype Nova works inside Today (use case 3, option A). Here it only shows where it will live.</p>
            </div>
          </div>
        </div>
        <div className="shrink-0 p-6">
          <div className="flex min-h-19 flex-col gap-2 rounded-2xl border border-sidebar-border bg-background p-4 shadow-md">
            <textarea disabled rows={1} placeholder="Ask Nova" aria-label="Ask Nova" className="w-full resize-none bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-text-placeholder disabled:cursor-not-allowed" />
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="icon-xs" disabled aria-label="Attach">
                <Paperclip aria-hidden />
              </Button>
              <Button type="button" variant="ghost" size="icon-xs" disabled aria-label="Dictate">
                <Mic aria-hidden />
              </Button>
              <Button type="button" size="icon-xs" disabled aria-label="Send" className="rounded-full">
                <ArrowUp aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ───────────────────────────── the shell

export function RedesignShell({
  title,
  prototypeBar,
  aside,
  panelClassName,
  onAskSafety,
  children,
}: {
  /** The page's name, for the breadcrumb when it is deeper than the sidebar row. */
  title?: string;
  /** Prototype controls, on the ground above the panel. */
  prototypeBar?: ReactNode;
  /** A full-height panel on the right of the page (Nova in Today). */
  aside?: ReactNode;
  panelClassName?: string;
  /** A page with its own Nova opens it from Ask Safety, so there is only one Nova on screen. */
  onAskSafety?: () => void;
  children: ReactNode;
}) {
  const path = usePathname() ?? "/";
  // Each option is its own route, so the shell remounts on a switch: start from the last known state, not from "open".
  const [collapsed, setCollapsed] = useState(collapsedCache);
  const [askOpen, setAskOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // The friendly look is on while this frame is up; the legacy pages and option F keep the classic one.
  useLayoutEffect(() => {
    document.documentElement.dataset.look = "friendly";
    return () => {
      delete document.documentElement.dataset.look;
    };
  }, []);

  useLayoutEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSE_KEY) === "1";
      collapsedCache = stored;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once before paint
      setCollapsed(stored);
    } catch {
      // Blocked storage: the sidebar stays open.
    }
  }, []);
  const toggleCollapsed = () =>
    setCollapsed((v) => {
      try {
        window.localStorage.setItem(COLLAPSE_KEY, v ? "0" : "1");
      } catch {
        // A convenience only.
      }
      collapsedCache = !v;
      return !v;
    });

  const section = NAV.flatMap((g) => g.items).find((item) => isActive(path, item));
  const crumb = title && section && title.toLowerCase() !== section.label.toLowerCase() ? title : undefined;

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[var(--lab-ground)] text-foreground">
      {/* Global top bar, on the ground. 12px on the left, so the switcher lines up with the sidebar icons. */}
      <header data-no-count className="flex h-14 shrink-0 items-center gap-2 pr-4 pl-3">
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => setMobileOpen(true)} aria-label="Open the menu" className={cn(shellIconClass, "md:hidden")}>
          <Menu aria-hidden />
        </Button>
        <span className="hidden md:inline-flex">
          <AppSwitcher />
        </span>
        <Link href="/inbox" className="flex shrink-0 items-center rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- the UpKeep logo, as in the redesign */}
            <img src="/redesign/upkeep.svg" alt="UpKeep" className="h-6 w-24" />
            <span className="inline-flex h-6 items-center rounded-full border border-sidebar-border bg-background px-2 text-xs font-medium text-foreground">Safety</span>
          </span>
        </Link>
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
          <span className="text-muted-foreground" aria-hidden>
            /
          </span>
          {crumb && section ? (
            <>
              <Link href={section.href} className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
                {section.label}
              </Link>
              <span className="text-muted-foreground" aria-hidden>
                /
              </span>
              <span className="truncate font-medium text-foreground">{crumb}</span>
            </>
          ) : (
            <span className="truncate font-medium text-foreground">{section?.label ?? title ?? "Today"}</span>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => (onAskSafety ? onAskSafety() : setAskOpen(true))} aria-expanded={askOpen} className="gap-2 rounded-lg border-sidebar-border px-3 text-sm text-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element -- Nova's gradient sparkles */}
            <img src="/redesign/sparkles-soft.svg" alt="" className="size-4" aria-hidden />
            <span className="hidden sm:inline">Ask Safety</span>
          </Button>
          <RdTooltip label="Search">
            <button type="button" aria-label="Search" className={iconButton}>
              <Search className="size-4" aria-hidden />
            </button>
          </RdTooltip>
          <span className="hidden sm:inline-flex">
            <Help />
          </span>
          <Notifications />
          <span className="pl-1">
            <AccountMenu />
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar: no border, no header, on the same ground as the top bar. */}
        <aside data-no-count className={cn("hidden shrink-0 flex-col gap-1 overflow-x-hidden px-3 pb-4 md:flex", collapsed ? "w-14" : "w-[228px]")}>
          <NavGroups path={path} collapsed={collapsed} />
          <div className={cn("flex items-center gap-1 pt-2", collapsed ? "flex-col" : "justify-between")}>
            <RdTooltip label="Settings" side={collapsed ? "right" : "top"}>
              <Link href="/settings" aria-label="Settings" className={cn(iconButton, path.startsWith("/settings") && "text-primary")}>
                <Settings aria-hidden />
              </Link>
            </RdTooltip>
            <RdTooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} side={collapsed ? "right" : "top"}>
              <button type="button" onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={iconButton}>
                {collapsed ? <PanelLeftOpen aria-hidden /> : <PanelLeftClose aria-hidden />}
              </button>
            </RdTooltip>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {prototypeBar ? (
            <div data-no-count className="shrink-0 px-3 pb-3 md:px-4">
              {prototypeBar}
            </div>
          ) : null}
          <div className="flex min-h-0 flex-1 gap-3 px-3 pb-4 md:px-4">
            {/* The working surface: one panel, raised off the ground. */}
            <main
              data-lab-panel
              className={cn("min-h-0 min-w-0 flex-1 overflow-y-auto rounded-[var(--lab-panel-radius)] bg-card shadow-[var(--lab-panel-shadow)]", panelClassName)}
            >
              {children}
            </main>
            {aside ? <div className="flex min-h-0 shrink-0 overflow-hidden rounded-[var(--lab-panel-radius)] shadow-[var(--lab-panel-shadow)]">{aside}</div> : null}
          </div>
        </div>
      </div>

      {/* Below the sidebar breakpoint the navigation is Safety's sheet, on the same ground. */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] gap-4 bg-[var(--lab-ground)] p-4 sm:max-w-[280px] md:hidden">
          <SheetTitle className="sr-only">Main navigation</SheetTitle>
          <NavGroups path={path} collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <AskSafety open={askOpen} onClose={() => setAskOpen(false)} />
    </div>
  );
}
