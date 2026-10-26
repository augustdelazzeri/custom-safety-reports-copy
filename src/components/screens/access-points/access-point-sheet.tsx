"use client";

/**
 * One access point, on the right: the code itself, ready to print, instead of a modal on top of
 * the list (safety-redesign lab-access-points.tsx, side card). Under it, the link the code
 * encodes, what it files reports against, and the last reports that came in through it.
 */

import { RdBadge, RdCard, RdNotice, RdTooltip, figmaButton } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { asset, event, locationName, person } from "@/lib/three-cases/data";
import { formatDay, formatWhen, publicLink, type AccessPoint } from "@/lib/screens/access-points";
import { Check, Copy, ExternalLink, Pause, Play, Printer, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { QrPlaceholder, qrSeed } from "./qr-code";

/** Printing prints the QR card alone, not the page around it (the redesign's `.lab-print-area`). */
const PRINT_CSS = `@media print {
  body:has(.ap-print-area) * { visibility: hidden; }
  .ap-print-area, .ap-print-area * { visibility: visible; }
  .ap-print-area { position: absolute; top: 0; left: 0; width: 100%; }
}`;

export const STATUS_LABEL = { active: "Active", paused: "Paused" } as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-foreground">{children}</span>
    </div>
  );
}

export function AccessPointSheet({ point, open, onClose, onToggleStatus }: { point?: AccessPoint; open: boolean; onClose: () => void; onToggleStatus: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const companyWide = point?.locationId === "plant";
  const machine = point?.assetId ? asset(point.assetId) : undefined;
  const reports = (point?.eventIds ?? []).map((id) => event(id)).filter((e) => e !== undefined);
  const link = point ? publicLink(point.id) : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked: the link stays selectable on screen.
    }
  };

  return (
    <Sheet open={open && point !== undefined} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" onOpenAutoFocus={(e) => e.preventDefault()} className="w-full gap-0 p-0 sm:max-w-110 [&>button:last-child]:hidden">
        {point ? (
          <>
            <style>{PRINT_CSS}</style>
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div className="min-w-0">
                <SheetTitle className="text-xl leading-6 font-bold">{point.name}</SheetTitle>
                <SheetDescription className="mt-1">
                  {companyWide ? "Company-wide" : locationName(point.locationId)}
                  {machine ? ` · ${machine.name}` : ""}
                </SheetDescription>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <RdBadge tone={point.status === "active" ? "accent" : "neutral"}>{STATUS_LABEL[point.status]}</RdBadge>
                <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
                  <X aria-hidden />
                </Button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 [&>*]:shrink-0">
              <div className="ap-print-area">
                <RdCard>
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <QrPlaceholder seed={qrSeed(point.id)} />
                    <p className="text-base font-semibold text-foreground">{point.name}</p>
                    <p className="text-sm text-muted-foreground">Scan to report a hazard, a near miss or an injury. No login needed.</p>
                  </div>
                </RdCard>
              </div>

              <div className="flex flex-col gap-2">
                <Button type="button" className={figmaButton} onClick={() => window.print()}>
                  <Printer aria-hidden />
                  Print
                </Button>
                <RdTooltip label="The public report form is not part of this prototype">
                  <span tabIndex={0} className="flex rounded-lg">
                    <Button type="button" variant="outline" className={`${figmaButton} pointer-events-none w-full`} disabled>
                      <ExternalLink aria-hidden />
                      Open the form
                    </Button>
                  </span>
                </RdTooltip>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm leading-none font-medium text-foreground">Link</p>
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate rounded-md border border-border bg-surface-subtle px-3 py-2 text-sm text-muted-foreground select-all" title={link}>
                    {link}
                  </p>
                  <RdTooltip label={copied ? "Copied" : "Copy the link"}>
                    <Button type="button" variant="outline" size="icon" onClick={copy} aria-label="Copy the link">
                      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                    </Button>
                  </RdTooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  {companyWide ? "Company-wide: whoever scans it is asked where they are." : "Reports from this code are filed at this location" + (machine ? ", on this asset." : ".")}
                </p>
              </div>

              {point.status === "paused" ? (
                <RdNotice icon={Pause} title="This code is paused">
                  {point.note ?? "Whoever scans it is told the code is not in use."}
                </RdNotice>
              ) : null}

              <RdCard title="Details">
                <div className="divide-y divide-border">
                  <Row label="Opens">Report an event</Row>
                  <Row label="Location">{companyWide ? "Company-wide" : locationName(point.locationId)}</Row>
                  <Row label="Asset">{machine ? `${machine.name} (${machine.code})` : <span className="text-muted-foreground">None</span>}</Row>
                  <Row label="Reports (30 days)">
                    <span className="tabular-nums">{point.reports30d}</span>
                  </Row>
                  <Row label="Last used">{point.lastReportAt ? formatWhen(point.lastReportAt) : <span className="text-muted-foreground">Never used</span>}</Row>
                  <Row label="Created">
                    {formatDay(point.createdAt)} by {person(point.createdBy).name}
                  </Row>
                </div>
              </RdCard>

              {reports.length ? (
                <RdCard title="Reported from this code">
                  <ul className="divide-y divide-border">
                    {reports.map((e) => (
                      <li key={e.id}>
                        <Link href={`/events/${e.id}`} className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted/50">
                          <span className="truncate text-sm font-medium text-foreground">{e.title}</span>
                          <span className="text-xs font-medium tracking-[0.02em] text-text-subtle">
                            {e.ref} · {e.reportedAt} · {e.reportedBy.replace(/ \(QR code.*\)$/, "") || "Anonymous"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </RdCard>
              ) : null}
            </div>

            <div className="flex shrink-0 justify-end border-t border-border px-6 py-4">
              <Button type="button" variant="outline" className={figmaButton} onClick={() => onToggleStatus(point.id)}>
                {point.status === "active" ? <Pause aria-hidden /> : <Play aria-hidden />}
                {point.status === "active" ? "Pause this code" : "Resume this code"}
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
