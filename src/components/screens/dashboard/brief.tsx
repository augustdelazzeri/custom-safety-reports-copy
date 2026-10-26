"use client";

/**
 * "What the numbers say": the reading of the dashboard, above the dashboard (the redesign's
 * lab-brief.tsx). Every sentence is written from a figure on the page and opens the list it counts;
 * one recommendation, chosen by what costs most if left alone.
 */

import { RdCard } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export interface BriefLine {
  key: string;
  text: string;
  href?: string;
  /** The sentence describes something going wrong. */
  tone?: "danger";
}

export function DashBrief({ headline, lines, recommendation }: { headline: string; lines: BriefLine[]; recommendation?: { text: string; href: string; cta: string } }) {
  if (lines.length === 0) return null;
  return (
    <RdCard>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-badge-accent text-badge-accent-foreground">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">What the numbers say</p>
            <p className="mt-0.5 text-base font-medium text-foreground">{headline}</p>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {lines.map((line) => (
            <li key={line.key} className="flex items-start gap-2 text-sm">
              <span className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", line.tone === "danger" ? "bg-destructive" : "bg-muted-foreground")} aria-hidden />
              {line.href ? (
                <Link href={line.href} className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary">
                  {line.text}
                </Link>
              ) : (
                <span className="text-foreground">{line.text}</span>
              )}
            </li>
          ))}
        </ul>

        {recommendation ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted p-4">
            <p className="text-sm text-foreground">
              <span className="font-medium">Do first:</span> {recommendation.text}
            </p>
            <Button asChild size="sm" className="shrink-0">
              <Link href={recommendation.href}>
                {recommendation.cta}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground">Written from the figures on this page. Every line opens the list it counts.</p>
      </div>
    </RdCard>
  );
}
